require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { chromium, request } = require('@playwright/test');
const environment = require('../config/environment');
const { cleanupRunData, loginAsAdmin } = require('../helpers/cleanup');
const {
  compareInventorySnapshots,
  snapshotInventory,
} = require('../helpers/inventory.helper');
const {
  TestDataManager,
  createRunId,
  isLocalTestTarget,
  runContextPath,
} = require('../helpers/test-data-manager');
const {
  listAllRows,
  requestWithSession,
  selectAssetFixture,
  unwrapPayload,
} = require('../helpers/snipe-client');

class FixtureBlockedError extends Error {}

function extractId(body) {
  const payload = unwrapPayload(body);
  return payload && (payload.id || (payload.user && payload.user.id) ||
    (payload.asset && payload.asset.id) || (payload.token && payload.token.id));
}

function extractToken(body) {
  const payload = unwrapPayload(body);
  if (!payload) return null;
  if (typeof payload.token === 'string') return payload.token;
  if (typeof payload.plain_text_token === 'string') return payload.plain_text_token;
  if (typeof payload.access_token === 'string') return payload.access_token;
  if (payload.token && typeof payload.token.token === 'string') return payload.token.token;
  return null;
}

function createPassword() {
  return `Aa1!${crypto.randomBytes(24).toString('hex')}Zz9#`;
}

async function fillSensitiveField(locator, value, label) {
  try {
    await locator.click();
    await locator.fill(value);
  } catch (error) {
    throw new Error(`Could not populate the ${label} field (${error.name}).`);
  }
}

function assertApiSuccess(result, operation) {
  if (!result.ok || !result.body || result.body.status === 'error') {
    throw new Error(`${operation} failed (HTTP ${result.status}; API status ${result.body && result.body.status || 'unavailable'}).`);
  }
}

async function verifyAdmin(page) {
  const loginResponse = await page.goto(`${environment.baseURL}/login`);
  if (!loginResponse || loginResponse.status() >= 400) {
    throw new Error('Snipe-IT login page could not be reached.');
  }
  await page.locator('input[name="username"], input#username').first().fill(environment.adminUsername);
  await page.locator('input[name="password"], input#password').first().fill(environment.adminPassword);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  if (/\/login(?:\?|$)/i.test(new URL(page.url()).pathname)) {
    throw new Error('Admin login failed; test data preparation stopped.');
  }

  const matchingUsers = await listAllRows(page, '/api/v1/users', { username: environment.adminUsername });
  const admin = matchingUsers.find((user) => user.username === environment.adminUsername);
  if (!admin || matchingUsers.filter((user) => user.username === environment.adminUsername).length !== 1) {
    throw new Error('Configured admin identity could not be resolved uniquely through the authenticated API.');
  }

  const response = await page.goto(`${environment.baseURL}/users/${admin.id}/edit`);
  const username = await page.locator('input[name="username"]').last().inputValue().catch(() => '');
  const superuser = await page.locator('input[name="permission[superuser]"][value="1"]').isChecked().catch(() => false);
  if (!response || response.status() >= 400 || username !== environment.adminUsername || !superuser) {
    throw new Error('Configured admin account did not pass the live Superuser permission check.');
  }
  return { id: String(admin.id), username: admin.username };
}

async function createRunUser(page, manager, username, password) {
  const collisions = await listAllRows(page, '/api/v1/users', { username });
  if (collisions.some((user) => user.username === username)) {
    throw new Error('Run-scoped username already exists; refusing to reuse or modify an unowned account.');
  }

  manager.recordPending('user', username, { role: 'stage1_api' });
  manager.saveRunSecrets({ username, password });

  const response = await page.goto(`${environment.baseURL}/users/create`);
  if (!response || response.status() >= 400) {
    throw new Error('User creation form could not be opened.');
  }
  const form = page.locator('form').filter({ has: page.locator('input[name="first_name"]') });
  await form.locator('input[name="first_name"]').fill('PW-AUTO');
  await form.locator('input[name="last_name"]').fill(manager.runId);
  const usernameInput = form.locator('input#username');
  await usernameInput.click();
  await usernameInput.fill(username);
  const activeCheckbox = form.locator('input[name="activated"]');
  if (!(await activeCheckbox.isChecked())) await activeCheckbox.check();
  await fillSensitiveField(form.locator('input[name="password"]'), password, 'new-user password');
  await fillSensitiveField(form.locator('input[name="password_confirmation"]'), password, 'new-user password confirmation');
  await fillSensitiveField(form.locator('input[name="email"]'), `${username}@example.invalid`, 'test-user email');

  for (const [permission, value] of [
    ['superuser', '-1'],
    ['admin', '-1'],
    ['assets.view', '1'],
    ['assets.create', '1'],
    ['assets.edit', '1'],
    ['assets.delete', '1'],
    ['self.api', '1'],
  ]) {
    const control = form.locator(`input[name="permission[${permission}]"][value="${value}"]`);
    if (await control.count() !== 1) {
      throw new FixtureBlockedError(`User form does not expose the expected ${permission} permission control.`);
    }
    const controlId = await control.getAttribute('id');
    const label = form.locator(`label[for="${controlId}"]`);
    if (await label.count() !== 1) {
      throw new FixtureBlockedError(`User form has no visible control for the ${permission} permission.`);
    }
    await label.evaluate((element) => element.click());
    if (!(await control.isChecked())) {
      throw new Error(`Could not select the configured ${permission} permission.`);
    }
  }

  await form.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  const createdUsers = await listAllRows(page, '/api/v1/users', { username });
  const createdMatches = createdUsers.filter((user) => user.username === username);
  if (createdMatches.length !== 1) {
    throw new Error('User creation did not produce exactly one matching account.');
  }
  const user = createdMatches[0];
  manager.registerCreatedUser(user.id, username, { role: 'stage1_api' });

  const editResponse = await page.goto(`${environment.baseURL}/users/${user.id}/edit`);
  const savedUsername = await page.locator('input[name="username"]').last().inputValue().catch(() => '');
  const permissionChecks = await Promise.all([
    page.locator('input[name="permission[superuser]"][value="-1"]').isChecked(),
    page.locator('input[name="permission[assets.view]"][value="1"]').isChecked(),
    page.locator('input[name="permission[assets.create]"][value="1"]').isChecked(),
    page.locator('input[name="permission[self.api]"][value="1"]').isChecked(),
  ]);
  if (!editResponse || editResponse.status() >= 400 || savedUsername !== username ||
      permissionChecks.some((checked) => !checked)) {
    throw new Error('Created account identity or required individual permissions did not persist.');
  }
  return { id: String(user.id), username, password };
}

async function loginTestUser(browser, user) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${environment.baseURL}/login`);
  await page.locator('input[name="username"], input#username').first().fill(user.username);
  await fillSensitiveField(page.locator('input[name="password"], input#password').first(), user.password, 'test-user login password');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  if (/\/login(?:\?|$)/i.test(new URL(page.url()).pathname)) {
    await context.close();
    throw new Error('Newly created test account could not log in.');
  }
  return { context, page };
}

async function createPersonalToken(userPage, manager) {
  const tokenName = `AUTO-TEST-${manager.runId}-STAGE1-TOKEN`;
  manager.recordPending('token', tokenName, { ownerUsername: manager.username('stage1_api') });
  const result = await requestWithSession(userPage, 'POST', '/api/v1/account/personal-access-tokens', {
    name: tokenName,
  });
  assertApiSuccess(result, 'Personal API token creation');
  const tokenId = extractId(result.body);
  const tokenValue = extractToken(result.body);
  if (!tokenId || !tokenValue) {
    throw new Error('Token API did not return both a token ID and one-time token value.');
  }
  manager.registerCreatedToken(tokenId, tokenName, {
    ownerUsername: manager.username('stage1_api'),
    ownerId: manager.manifest.created.find((entry) => entry.type === 'user')?.id,
  });
  return { id: String(tokenId), name: tokenName, value: tokenValue };
}

async function createAndVerifyAsset(apiRequest, manager, fixture, apiToken) {
  const assetTag = manager.assetTag('STAGE1');
  manager.recordPending('asset', assetTag, {
    modelId: String(fixture.model.id),
    statusLabelId: String(fixture.statusLabel.id),
  });
  const headers = { Authorization: `Bearer ${apiToken}`, Accept: 'application/json' };
  const response = await apiRequest.post(`${environment.baseURL}/api/v1/hardware`, {
    headers,
    data: {
      asset_tag: assetTag,
      serial: `PW-${manager.runId}-STAGE1`,
      model_id: Number(fixture.model.id),
      status_id: Number(fixture.statusLabel.id),
    },
  });
  let body = null;
  try { body = await response.json(); } catch { body = null; }
  if (!response.ok() || !body || body.status !== 'success') {
    throw new Error(`Test Asset creation failed (HTTP ${response.status()}; API status ${body && body.status || 'unavailable'}).`);
  }
  const id = extractId(body);
  if (!id) throw new Error('Asset API reported success without returning its ID.');
  manager.registerCreatedAsset(id, assetTag);

  const readResponse = await apiRequest.get(`${environment.baseURL}/api/v1/hardware/${id}`, { headers });
  let readBody = null;
  try { readBody = await readResponse.json(); } catch { readBody = null; }
  const asset = unwrapPayload(readBody);
  if (!readResponse.ok() || !asset || asset.asset_tag !== assetTag ||
      String(asset.model && asset.model.id || asset.model_id) !== String(fixture.model.id) ||
      String(asset.status_label && asset.status_label.id || asset.status_id) !== String(fixture.statusLabel.id)) {
    throw new Error('Created Asset readback did not match its tag, Model, and Status Label.');
  }
  return { id: String(id), assetTag };
}

function writeImplementationReport(report) {
  const reportPath = path.resolve(__dirname, '..', 'docs', 'TEST_DATA_IMPLEMENTATION_REPORT.md');
  const lines = [
    '# Test Data Manager Implementation Report',
    '',
    `- Run ID: \`${report.runId || 'not created'}\``,
    `- Overall status: **${report.status}**`,
    `- Snipe-IT URL: \`${environment.baseURL}\``,
    `- Report timestamp: ${new Date().toISOString()}`,
    '',
    '## Phase 1 lifecycle evidence',
    '',
    '| Check | Result | Evidence |',
    '|---|---|---|',
    ...report.checks.map((check) =>
      `| ${check.name} | ${check.status} | ${check.evidence.replace(/\|/g, '\\|')} |`
    ),
    '',
    '## Live baseline inventory',
    '',
    '| Type | Initial records | After cleanup |',
    '|---|---:|---:|',
    ...Object.entries(report.baseline || {}).map(([type, value]) =>
      `| ${type} | ${value.count} | ${report.afterCleanup && report.afterCleanup[type] ? report.afterCleanup[type].count : 'NOT VERIFIED'} |`
    ),
    '',
    '## Outcomes and limitations',
    '',
    ...(report.notes.length ? report.notes.map((note) => `- ${note}`) : ['- No unresolved Phase 1 limitations were recorded.']),
    '',
    'No password, session cookie, CSRF token, or API token value is included in this report.',
    '',
  ];
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
}

async function main() {
  if (!isLocalTestTarget(environment.baseURL)) {
    throw new Error('Test-data lifecycle verification is restricted to a loopback Snipe-IT URL.');
  }
  if (!environment.adminUsername || !environment.adminPassword) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required; lifecycle verification stopped.');
  }

  const runId = createRunId();
  fs.mkdirSync(path.dirname(runContextPath), { recursive: true });
  fs.writeFileSync(runContextPath, JSON.stringify({
    runId,
    baseURL: environment.baseURL,
    startedAt: new Date().toISOString(),
    adminVerified: false,
    baseline: {},
  }, null, 2), { mode: 0o600 });

  const manager = new TestDataManager();
  const report = { runId, status: 'FAIL', checks: [], baseline: {}, afterCleanup: null, notes: [] };
  let browser;
  let adminContext;
  let adminPage;
  let userContext;
  let userPage;
  let apiRequest;
  let fixture;
  let user;
  let token;
  let apiTokenContext;
  let failure;

  try {
    browser = await chromium.launch({ headless: true });
    adminContext = await browser.newContext();
    adminPage = await adminContext.newPage();
    const admin = await verifyAdmin(adminPage);
    manager.runContext.adminVerified = true;
    manager.runContext.adminUserId = admin.id;
    fs.writeFileSync(runContextPath, JSON.stringify(manager.runContext, null, 2), { mode: 0o600 });
    report.checks.push({ name: 'Superuser login and verification', status: 'PASS', evidence: `Verified configured account ID ${admin.id} and Superuser permission.` });

    const before = await snapshotInventory(adminPage);
    report.baseline = before.snapshot;
    fixture = selectAssetFixture(
      before.rowsByType.models,
      before.rowsByType.statusLabels,
      before.rowsByType.categories
    );
    const runContext = manager.runContext;
    runContext.baseline = before.snapshot;
    runContext.fixture = {
      model: { id: String(fixture.model.id), name: fixture.model.name, categoryId: String(fixture.model.category.id) },
      statusLabel: { id: String(fixture.statusLabel.id), name: fixture.statusLabel.name },
    };
    fs.writeFileSync(runContextPath, JSON.stringify(runContext, null, 2), { mode: 0o600 });
    report.checks.push({
      name: 'Live inventory and fixture discovery',
      status: 'PASS',
      evidence: `Paginated Models, Status Labels, Categories, Companies, Locations, Users, Groups, and Assets. Selected existing Model "${fixture.model.name}" (ID ${fixture.model.id}) and Status Label "${fixture.statusLabel.name}" (ID ${fixture.statusLabel.id}) dynamically.`,
    });

    const password = createPassword();
    user = await createRunUser(adminPage, manager, manager.username('stage1_api'), password);
    report.checks.push({ name: 'Run-scoped user creation and permissions', status: 'PASS', evidence: `Created user ID ${user.id}; verified activation, non-Superuser state, assets.view/create, and self.api permissions.` });

    const loggedIn = await loginTestUser(browser, user);
    userContext = loggedIn.context;
    userPage = loggedIn.page;
    report.checks.push({ name: 'Created-user authentication', status: 'PASS', evidence: `Run-scoped account ID ${user.id} logged in successfully.` });

    token = await createPersonalToken(userPage, manager);
    apiRequest = await request.newContext();
    apiTokenContext = await request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' },
    });
    const identityResponse = await apiTokenContext.get(`${environment.baseURL}/api/v1/users/me`);
    let identityBody = null;
    try { identityBody = await identityResponse.json(); } catch { identityBody = null; }
    const identity = unwrapPayload(identityBody);
    if (!identityResponse.ok() || !identity || identity.username !== user.username) {
      throw new Error('Created API token did not authenticate as its run-scoped owner.');
    }
    report.checks.push({ name: 'API token creation and owner verification', status: 'PASS', evidence: `The token authenticated as run-owned user ID ${user.id}; token identifiers and values were not recorded in the report.` });

    const asset = await createAndVerifyAsset(apiRequest, manager, fixture, token.value);
    report.checks.push({ name: 'Asset creation and readback', status: 'PASS', evidence: `Created run-owned Asset ID ${asset.id}; API readback matched the generated tag and dynamically selected Model/Status IDs.` });

    report.status = 'PASS';
  } catch (error) {
    failure = error;
    report.status = error instanceof FixtureBlockedError || error.code === 'FIXTURE_BLOCKED' ? 'BLOCKED' : 'FAIL';
    report.notes.push(error.message);
  } finally {
    if (adminPage && manager.runContext.adminVerified) {
      try {
        await loginAsAdmin(adminPage);
        const cleanupOutcomes = await cleanupRunData(adminPage, manager, {
          userPage,
          apiRequest,
          apiTokenContext,
          tokenValue: token && token.value,
        });
        report.checks.push(...cleanupOutcomes.map((outcome) => ({
          name: `${outcome.type} cleanup`,
          status: outcome.status === 'deleted-and-verified' || outcome.status === 'revoked-and-verified' ? 'PASS' : 'BLOCKED',
          evidence: outcome.evidence,
        })));
        const after = await snapshotInventory(adminPage);
        report.afterCleanup = after.snapshot;
        const changed = compareInventorySnapshots(report.baseline, after.snapshot);
        if (changed.length) {
          throw new Error(`Baseline inventory did not return to its initial state for: ${changed.join(', ')}.`);
        }
        report.checks.push({ name: 'Baseline inventory preservation', status: 'PASS', evidence: 'All initial paginated inventory counts and ID/identity fingerprints match after cleanup.' });
        manager.removeRunSecrets();
      } catch (error) {
        report.status = 'FAIL';
        report.notes.push(`Cleanup or baseline verification failed: ${error.message}`);
      }
    } else if (manager.readRunSecrets().username) {
      manager.removeRunSecrets();
    }

    if (apiTokenContext) await apiTokenContext.dispose();
    if (apiRequest) await apiRequest.dispose();
    if (userContext) await userContext.close();
    if (adminContext) await adminContext.close();
    if (browser) await browser.close();
    writeImplementationReport(report);
    manager.runContext.finishedAt = new Date().toISOString();
    manager.runContext.lifecycleStatus = report.status;
    fs.writeFileSync(runContextPath, JSON.stringify(manager.runContext, null, 2), { mode: 0o600 });
  }

  if (failure) {
    throw new Error(`Phase 1 lifecycle verification ${report.status}: ${failure.message}`);
  }
  if (report.status !== 'PASS') {
    throw new Error(`Phase 1 lifecycle verification completed with ${report.status}.`);
  }
  console.log(`Phase 1 lifecycle verification: ${report.status}. See docs/TEST_DATA_IMPLEMENTATION_REPORT.md.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
