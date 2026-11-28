const environment = require('../config/environment');
const { TestDataManager, isLocalTestTarget } = require('./test-data-manager');
const { fillSensitiveField } = require('./user-provisioner');
const { listAllRows, requestWithSession, unwrapPayload } = require('./snipe-client');

async function loginAsAdmin(page) {
  if (!isLocalTestTarget(environment.baseURL)) {
    throw new Error('Cleanup is restricted to a loopback Snipe-IT URL.');
  }
  const manager = new TestDataManager();
  const adminId = manager.runContext.adminUserId;
  if (!adminId || !environment.adminUsername || !environment.adminPassword) {
    throw new Error('Cleanup requires a verified admin identity and credentials.');
  }

  const verifyCurrentSession = async () => {
    const response = await page.goto(`${environment.baseURL}/users/${adminId}/edit`);
    const username = await page.locator('input[name="username"]').last().inputValue().catch(() => '');
    const isSuperuser = await page.locator('input[name="permission[superuser]"][value="1"]').isChecked().catch(() => false);
    return Boolean(response && response.status() < 400 &&
      username === environment.adminUsername && isSuperuser);
  };

  if (page.url() !== 'about:blank' && await verifyCurrentSession()) return;

  const loginResponse = await page.goto(`${environment.baseURL}/login`);
  if (!loginResponse || loginResponse.status() >= 400) {
    throw new Error('Cleanup login page could not be reached; no managed data was deleted.');
  }
  await page.locator('input[name="username"], input#username').first().fill(environment.adminUsername);
  await fillSensitiveField(
    page.locator('input[name="password"], input#password').first(),
    environment.adminPassword,
    'admin password'
  );
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  if (/\/login(?:\?|$)/i.test(new URL(page.url()).pathname) || !(await verifyCurrentSession())) {
    throw new Error('Cleanup admin login or Superuser verification failed; no data was deleted.');
  }
}

function assertApiSuccess(result, operation) {
  if (!result.ok || (result.body && result.body.status === 'error')) {
    throw new Error(`${operation} failed (HTTP ${result.status}; API status ${result.body && result.body.status || 'unavailable'}).`);
  }
}

function bodyRows(body) {
  if (!body) return [];
  if (Array.isArray(body.rows)) return body.rows;
  const payload = unwrapPayload(body);
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.rows)) return payload.rows;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

async function findOwnedRow(page, route, query, identityField, identity) {
  const rows = await listAllRows(page, route, query);
  return rows.filter((row) => String(row[identityField]) === identity);
}

async function cleanupAsset(page, manager, entry) {
  manager.assertOwnedIdentity('asset', entry.identity);
  let id = entry.id;
  if (!id) {
    const matches = await findOwnedRow(page, '/api/v1/hardware', { search: entry.identity }, 'asset_tag', entry.identity);
    if (matches.length > 1) throw new Error(`Multiple Assets match pending run-owned tag ${entry.identity}.`);
    if (!matches.length) {
      manager.markNoObject('asset', entry.identity, 'no matching Asset exists');
      return { type: 'asset', status: 'deleted-and-verified', evidence: `No Asset was created for pending tag ${entry.identity}.` };
    }
    id = String(matches[0].id);
    manager.registerCreatedAsset(id, entry.identity);
  }

  const read = await requestWithSession(page, 'GET', `/api/v1/hardware/${id}`);
  const asset = unwrapPayload(read.body);
  if (read.status !== 200 || !asset || asset.asset_tag !== entry.identity) {
    throw new Error(`Refusing Asset cleanup: ID ${id} does not match the run-owned Asset Tag.`);
  }
  if (asset.deleted_at) {
    manager.markCleaned('asset', id, 'soft-deleted-and-verified');
    return { type: 'asset', status: 'deleted-and-verified', evidence: `Owned Asset ID ${id} was already soft-deleted.` };
  }
  const removed = await requestWithSession(page, 'DELETE', `/api/v1/hardware/${id}`);
  assertApiSuccess(removed, `Asset cleanup for ID ${id}`);

  const verified = await requestWithSession(page, 'GET', `/api/v1/hardware/${id}`);
  const remaining = unwrapPayload(verified.body);
  const notFound = verified.status === 404 ||
    (verified.body && verified.body.status === 'error' && /not found|does not exist/i.test(JSON.stringify(verified.body)));
  const softDeleted = verified.status === 200 && remaining &&
    remaining.asset_tag === entry.identity && Boolean(remaining.deleted_at);
  if (!notFound && !softDeleted) {
    throw new Error(`Asset cleanup could not verify deletion for owned ID ${id}.`);
  }
  const result = softDeleted ? 'soft-deleted-and-verified' : 'deleted-and-verified';
  manager.markCleaned('asset', id, result);
  return { type: 'asset', status: 'deleted-and-verified', evidence: `Owned Asset ID ${id} ${result}.` };
}

async function findTokenByName(userPage, tokenName) {
  const result = await requestWithSession(userPage, 'GET', '/api/v1/account/personal-access-tokens');
  if (result.status !== 200 || !result.body || result.body.status === 'error') {
    throw new Error(`Could not list the test user's tokens (HTTP ${result.status}).`);
  }
  return bodyRows(result.body).filter((token) => token.name === tokenName);
}

async function cleanupToken(userPage, apiTokenContext, manager, entry) {
  manager.assertOwnedIdentity('token', entry.identity);
  let id = entry.id;
  if (!id) {
    const matches = await findTokenByName(userPage, entry.identity);
    if (matches.length > 1) throw new Error(`Multiple API tokens match pending run-owned name ${entry.identity}.`);
    if (!matches.length) {
      manager.markNoObject('token', entry.identity, 'no matching API token exists');
      return { type: 'token', status: 'revoked-and-verified', evidence: `No API token was created for pending name ${entry.identity}.` };
    }
    id = String(matches[0].id);
    manager.registerCreatedToken(id, entry.identity, entry.metadata || {});
  }

  const matches = await findTokenByName(userPage, entry.identity);
  const owned = matches.find((token) => String(token.id) === String(id));
  if (!owned || owned.name !== entry.identity) {
    const me = await requestWithSession(userPage, 'GET', '/api/v1/users/me');
    const user = unwrapPayload(me.body);
    if (me.status === 200 && user && user.username === entry.metadata.ownerUsername) {
      manager.markCleaned('token', id, 'revoked-and-verified');
      return { type: 'token', status: 'revoked-and-verified', evidence: `Owned API token ID ${id} is no longer listed for its owner.` };
    }
    throw new Error(`Refusing token cleanup: token ownership could not be verified for ID ${id}.`);
  }

  const deleted = await requestWithSession(userPage, 'DELETE', `/api/v1/account/personal-access-tokens/${id}`);
  assertApiSuccess(deleted, `Token cleanup for ID ${id}`);
  const stillListed = await findTokenByName(userPage, entry.identity);
  if (stillListed.some((token) => String(token.id) === String(id))) {
    throw new Error(`API token ID ${id} remains active after revocation.`);
  }
  if (apiTokenContext) {
    const staleTokenResponse = await apiTokenContext.get(`${environment.baseURL}/api/v1/users/me`);
    if (staleTokenResponse.status() !== 401 && staleTokenResponse.status() !== 403) {
      throw new Error(`Revoked API token ID ${id} was not rejected by the identity endpoint.`);
    }
  }
  manager.markCleaned('token', id, 'revoked-and-verified');
  return { type: 'token', status: 'revoked-and-verified', evidence: 'The run-owned API token was revoked, disappeared from the owner list, and no longer authenticates.' };
}

async function cleanupUser(page, manager, entry) {
  manager.assertOwnedIdentity('user', entry.identity);
  let id = entry.id;
  if (!id) {
    const matches = await findOwnedRow(page, '/api/v1/users', { username: entry.identity }, 'username', entry.identity);
    if (matches.length > 1) throw new Error(`Multiple Users match pending run-owned username ${entry.identity}.`);
    if (!matches.length) {
      manager.markNoObject('user', entry.identity, 'no matching User exists');
      manager.removeRunSecret(entry.identity);
      return { type: 'user', status: 'deleted-and-verified', evidence: `No User was created for pending username ${entry.identity}.` };
    }
    id = String(matches[0].id);
    manager.registerCreatedUser(id, entry.identity, entry.metadata || {});
  }

  const read = await requestWithSession(page, 'GET', `/api/v1/users/${id}`);
  const user = unwrapPayload(read.body);
  if (read.status !== 200 || !user || user.username !== entry.identity) {
    throw new Error(`Refusing User cleanup: ID ${id} does not match the run-owned username.`);
  }
  const deleted = await requestWithSession(page, 'DELETE', `/api/v1/users/${id}`);
  assertApiSuccess(deleted, `User cleanup for ID ${id}`);
  const remaining = await findOwnedRow(page, '/api/v1/users', { username: entry.identity }, 'username', entry.identity);
  if (remaining.length) throw new Error(`Run-owned User ${entry.identity} remains active after cleanup.`);
  manager.markCleaned('user', id, 'deleted-and-verified');
  manager.removeRunSecret(entry.identity);
  return { type: 'user', status: 'deleted-and-verified', evidence: `Run-owned User ID ${id} is no longer returned by the active-user API.` };
}

async function cleanupGroup(page, manager, entry) {
  manager.assertOwnedIdentity('group', entry.identity);
  let id = entry.id;
  if (!id) {
    const matches = await listAllRows(page, '/api/v1/groups', { search: entry.identity });
    const owned = matches.filter((group) => group.name === entry.identity);
    if (owned.length > 1) throw new Error(`Multiple Groups match pending run-owned name ${entry.identity}.`);
    if (!owned.length) {
      manager.markNoObject('group', entry.identity, 'no matching Group exists');
      return { type: 'group', status: 'deleted-and-verified', evidence: `No Group was created for pending name ${entry.identity}.` };
    }
    id = String(owned[0].id);
    manager.registerCreatedGroup(id, entry.identity, entry.metadata || {});
  }

  const read = await requestWithSession(page, 'GET', `/api/v1/groups/${id}`);
  const group = unwrapPayload(read.body);
  if (read.status !== 200 || !group || group.name !== entry.identity) {
    throw new Error(`Refusing Group cleanup: ID ${id} does not match the run-owned name.`);
  }
  if (Number(group.users_count || 0) > 0) {
    throw new Error(`Refusing Group cleanup for ID ${id}: it still has associated users.`);
  }
  const deleted = await requestWithSession(page, 'DELETE', `/api/v1/groups/${id}`);
  assertApiSuccess(deleted, `Group cleanup for ID ${id}`);
  const verified = await requestWithSession(page, 'GET', `/api/v1/groups/${id}`);
  if (verified.status !== 404 &&
      !(verified.body && verified.body.status === 'error' && /not found|does not exist/i.test(JSON.stringify(verified.body)))) {
    throw new Error(`Group cleanup could not verify deletion for owned ID ${id}.`);
  }
  manager.markCleaned('group', id, 'deleted-and-verified');
  return { type: 'group', status: 'deleted-and-verified', evidence: `Run-owned Group ID ${id} was deleted and verified absent.` };
}

async function cleanupRunData(page, manager = new TestDataManager(), options = {}) {
  if (!isLocalTestTarget(environment.baseURL)) {
    throw new Error('Cleanup is restricted to a loopback Snipe-IT URL.');
  }
  await loginAsAdmin(page);

  const outcomes = [];
  const errors = [];
  const assets = manager.manifest.created.filter((entry) =>
    entry.type === 'asset' && entry.runId === manager.runId && entry.state !== 'cleaned' && entry.state !== 'no-object'
  );
  const tokens = manager.manifest.created.filter((entry) =>
    entry.type === 'token' && entry.runId === manager.runId && entry.state !== 'cleaned' && entry.state !== 'no-object'
  );
  const users = manager.manifest.created.filter((entry) =>
    entry.type === 'user' && entry.runId === manager.runId && !entry.metadata?.retained &&
    entry.state !== 'cleaned' && entry.state !== 'no-object'
  );
  const groups = manager.manifest.created.filter((entry) =>
    entry.type === 'group' && entry.runId === manager.runId && entry.state !== 'cleaned' && entry.state !== 'no-object'
  );

  for (const asset of assets) {
    try { outcomes.push(await cleanupAsset(page, manager, asset)); }
    catch (error) { errors.push(error.message); }
  }

  let tokenCleanupSucceeded = true;
  for (const token of tokens) {
    const ownerPage = options.userPages && options.userPages[token.metadata && token.metadata.ownerUsername]
      ? options.userPages[token.metadata.ownerUsername]
      : options.userPage;
    const apiTokenContext = options.apiTokenContexts && options.apiTokenContexts[token.metadata && token.metadata.ownerUsername]
      ? options.apiTokenContexts[token.metadata.ownerUsername]
      : options.apiTokenContext;
    if (!ownerPage) {
      tokenCleanupSucceeded = false;
      errors.push(`Cannot clean API token ${token.identity}: authenticated owner session is unavailable.`);
      continue;
    }
    try {
      outcomes.push(await cleanupToken(ownerPage, apiTokenContext, manager, token));
    } catch (error) {
      tokenCleanupSucceeded = false;
      errors.push(error.message);
    }
  }

  for (const user of users) {
    if (tokens.length && !tokenCleanupSucceeded) {
      errors.push(`Retained run-owned User ${user.identity} because its API token revocation was not verified.`);
      continue;
    }
    try { outcomes.push(await cleanupUser(page, manager, user)); }
    catch (error) { errors.push(error.message); }
  }

  for (const group of groups) {
    try { outcomes.push(await cleanupGroup(page, manager, group)); }
    catch (error) { errors.push(error.message); }
  }

  if (errors.length) {
    throw new Error(`Safe cleanup incomplete: ${errors.join(' ')}`);
  }
  return outcomes;
}

async function cleanupRunAssets(page) {
  return cleanupRunData(page);
}

module.exports = { cleanupRunAssets, cleanupRunData, loginAsAdmin };
