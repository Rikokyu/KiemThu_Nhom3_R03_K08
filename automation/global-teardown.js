require('dotenv').config();

const fs = require('fs');
const { chromium } = require('@playwright/test');
const environment = require('./config/environment');
const { cleanupRunData, loginAsAdmin } = require('./helpers/cleanup');
const {
  compareInventorySnapshots,
  snapshotInventory,
} = require('./helpers/inventory.helper');
const { loginManagedUser } = require('./helpers/user-provisioner');
const { TestDataManager, runContextPath } = require('./helpers/test-data-manager');

module.exports = async function globalTeardown() {
  const manager = new TestDataManager();
  const runContext = manager.runContext;
  const browser = await chromium.launch({ headless: true });
  let adminContext;
  const ownerContexts = [];
  try {
    adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAsAdmin(adminPage);

    const pendingTokenOwners = [...new Set(manager.manifest.created
      .filter((entry) => entry.type === 'token' && entry.runId === manager.runId &&
        entry.state !== 'cleaned' && entry.state !== 'no-object')
      .map((entry) => entry.metadata && entry.metadata.ownerUsername)
      .filter(Boolean))];
    const secrets = manager.readRunSecrets();
    const userPages = {};
    for (const username of pendingTokenOwners) {
      const password = secrets.users && secrets.users[username] ||
        (secrets.username === username ? secrets.password : null);
      if (!password) {
        throw new Error(`Missing run-scoped credentials required to revoke a managed token for ${username}.`);
      }
      const loggedIn = await loginManagedUser(browser, environment.baseURL, { username, password });
      userPages[username] = loggedIn.page;
      ownerContexts.push(loggedIn.context);
    }

    await cleanupRunData(adminPage, manager, { userPages });
    const after = await snapshotInventory(adminPage);
    if (!runContext.baseline || Object.keys(runContext.baseline).length !== Object.keys(after.snapshot).length) {
      throw new Error('No complete pre-run inventory is available; sample preservation cannot be verified.');
    }
    const changed = compareInventorySnapshots(runContext.baseline, after.snapshot);
    if (changed.length) {
      throw new Error(`Baseline inventory changed after cleanup: ${changed.join(', ')}.`);
    }
    const unresolved = manager.manifest.created.filter((entry) =>
      entry.runId === manager.runId && entry.state !== 'cleaned' && entry.state !== 'no-object'
    );
    if (unresolved.length) {
      throw new Error('Some run-owned objects remain unresolved after global cleanup.');
    }

    runContext.finishedAt = new Date().toISOString();
    runContext.lifecycleStatus = 'CLEANUP-VERIFIED';
    runContext.inventoryAfter = after.snapshot;
    runContext.cleanup = manager.manifest.cleanup.map((entry) => ({
      type: entry.type,
      result: entry.result,
    }));
    manager.removeRunSecrets();
    fs.writeFileSync(runContextPath, JSON.stringify(runContext, null, 2), { mode: 0o600 });
  } finally {
    for (const ownerContext of ownerContexts) {
      if (!ownerContext.isClosed()) await ownerContext.close();
    }
    if (adminContext) await adminContext.close();
    await browser.close();
  }
};
