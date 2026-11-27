require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const environment = require('./config/environment');
const { fillSensitiveField } = require('./helpers/user-provisioner');
const { snapshotInventory } = require('./helpers/inventory.helper');
const {
  createRunId,
  isLocalTestTarget,
  runContextPath,
} = require('./helpers/test-data-manager');
const { listAllRows, selectAssetFixture } = require('./helpers/snipe-client');

module.exports = async function globalSetup() {
  if (!isLocalTestTarget(environment.baseURL)) {
    throw new Error('Tests are restricted to a loopback Snipe-IT URL; no remote target was accessed.');
  }
  if (!environment.adminUsername || !environment.adminPassword) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required; test run stopped before setup.');
  }

  const browser = await chromium.launch({ headless: true });
  let context;
  try {
    context = await browser.newContext();
    const page = await context.newPage();
    const loginResponse = await page.goto(`${environment.baseURL}/login`);
    if (!loginResponse || loginResponse.status() >= 400) {
      throw new Error('Snipe-IT login page could not be reached.');
    }
    await page.locator('input[name="username"], input#username').first().fill(environment.adminUsername);
    await fillSensitiveField(
      page.locator('input[name="password"], input#password').first(),
      environment.adminPassword,
      'admin password'
    );
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('domcontentloaded');
    if (/\/login(?:\?|$)/i.test(new URL(page.url()).pathname)) {
      throw new Error('Admin login failed; test data preparation stopped.');
    }

    const matches = await listAllRows(page, '/api/v1/users', { username: environment.adminUsername });
    const admins = matches.filter((user) => user.username === environment.adminUsername);
    if (admins.length !== 1) {
      throw new Error('Configured admin identity could not be resolved uniquely through the authenticated API.');
    }
    const admin = admins[0];
    const verifyResponse = await page.goto(`${environment.baseURL}/users/${admin.id}/edit`);
    const usernameField = page.locator('input[name="username"]').last();
    const shownUsername = await usernameField.inputValue().catch(() => '');
    const superuserAllow = await page.locator('input[name="permission[superuser]"][value="1"]').isChecked().catch(() => false);
    if (!verifyResponse || verifyResponse.status() >= 400 ||
        shownUsername !== environment.adminUsername || !superuserAllow) {
      throw new Error('Admin account identity or Superuser permission could not be verified; test run stopped.');
    }

    const inventory = await snapshotInventory(page);
    let fixture = null;
    let fixtureIssue = null;
    try {
      fixture = selectAssetFixture(
        inventory.rowsByType.models,
        inventory.rowsByType.statusLabels,
        inventory.rowsByType.categories
      );
    } catch (error) {
      if (error.code !== 'FIXTURE_BLOCKED') throw error;
      fixtureIssue = error.message;
    }

    const runContext = {
      runId: createRunId(),
      baseURL: environment.baseURL,
      startedAt: new Date().toISOString(),
      adminVerified: true,
      adminUserId: String(admin.id),
      baseline: inventory.snapshot,
      fixture: fixture ? {
        model: {
          id: String(fixture.model.id),
          name: fixture.model.name,
          categoryId: String(fixture.model.category.id),
        },
        statusLabel: {
          id: String(fixture.statusLabel.id),
          name: fixture.statusLabel.name,
        },
      } : null,
      fixtureIssue,
    };
    fs.mkdirSync(path.dirname(runContextPath), { recursive: true });
    fs.writeFileSync(runContextPath, JSON.stringify(runContext, null, 2), { mode: 0o600 });
  } finally {
    if (context) await context.close();
    await browser.close();
  }
};
