require('dotenv').config();

const { chromium } = require('@playwright/test');
const environment = require('../config/environment');
const { cleanupRunData, loginAsAdmin } = require('../helpers/cleanup');
const {
  TestDataManager,
  isLocalTestTarget,
  runContextPath,
} = require('../helpers/test-data-manager');
const {
  compareInventorySnapshots,
  snapshotInventory,
} = require('../helpers/inventory.helper');
const fs = require('fs');

const inventoryRoutes = {
  models: '/api/v1/models',
  statusLabels: '/api/v1/statuslabels',
  categories: '/api/v1/categories',
  companies: '/api/v1/companies',
  locations: '/api/v1/locations',
  users: '/api/v1/users',
  groups: '/api/v1/groups',
  assets: '/api/v1/hardware',
};

async function loginTestUser(page, username, password) {
  if (!username || !password) {
    throw new Error('Run-scoped user credentials are unavailable for token cleanup.');
  }
  await page.goto(`${environment.baseURL}/login`);
  await page.locator('input[name="username"], input#username').first().fill(username);
  const passwordInput = page.locator('input[name="password"], input#password').first();
  try {
    await passwordInput.click();
    await passwordInput.fill(password);
  } catch (error) {
    throw new Error(`Could not populate the run-scoped user's login field (${error.name}).`);
  }
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  if (/\/login(?:\?|$)/i.test(new URL(page.url()).pathname)) {
    throw new Error('Run-scoped user login failed; cleanup stopped before deleting that account.');
  }
}

async function main() {
  if (!isLocalTestTarget(environment.baseURL)) {
    throw new Error('Managed-data cleanup is restricted to a loopback Snipe-IT URL.');
  }
  const manager = new TestDataManager();
  const secrets = manager.readRunSecrets();
  const pendingTokenOwners = [...new Set(manager.manifest.created
    .filter((entry) => entry.type === 'token' && entry.runId === manager.runId &&
      entry.state !== 'cleaned' && entry.state !== 'no-object')
    .map((entry) => entry.metadata && entry.metadata.ownerUsername)
    .filter(Boolean))];
  const browser = await chromium.launch({ headless: true });
  let adminContext;
  const ownerContexts = [];
  try {
    adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAsAdmin(adminPage);

    const userPages = {};
    for (const username of pendingTokenOwners) {
      const password = secrets.users && secrets.users[username] ||
        (secrets.username === username ? secrets.password : null);
      const ownerContext = await browser.newContext();
      ownerContexts.push(ownerContext);
      const ownerPage = await ownerContext.newPage();
      await loginTestUser(ownerPage, username, password);
      userPages[username] = ownerPage;
    }

    const outcomes = await cleanupRunData(adminPage, manager, { userPages });
    const inventory = await snapshotInventory(adminPage);

    const baseline = manager.runContext.baseline;
    if (!baseline || Object.keys(baseline).length !== Object.keys(inventoryRoutes).length) {
      throw new Error('No complete pre-run inventory is available; sample preservation cannot be verified.');
    }
    const changed = compareInventorySnapshots(baseline, inventory.snapshot);
    if (changed.length) {
      throw new Error(`Baseline inventory changed after cleanup: ${changed.join(', ')}.`);
    }

    manager.removeRunSecrets();
    manager.runContext.finishedAt = new Date().toISOString();
    manager.runContext.lifecycleStatus = 'CLEANUP-VERIFIED';
    manager.runContext.cleanup = outcomes;
    fs.writeFileSync(runContextPath, JSON.stringify(manager.runContext, null, 2), { mode: 0o600 });
    console.log(`Managed-data cleanup verified for RUN_ID ${manager.runId}; ${outcomes.length} owned record(s) were processed.`);
  } finally {
    for (const ownerContext of ownerContexts) await ownerContext.close();
    if (adminContext) await adminContext.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
