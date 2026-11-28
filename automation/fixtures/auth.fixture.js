const base = require('@playwright/test');
const environment = require('../config/environment');

exports.test = base.test.extend({
  authenticatedAdminPage: async ({ page }, use) => {
    if (!environment.adminUsername || !environment.adminPassword) {
      throw new Error('Admin credentials are not configured');
    }
    await page.goto(`${environment.baseURL}/login`);
    await page.locator('input[name="username"], input#username').first().fill(environment.adminUsername);
    await page.locator('input[name="password"], input#password').first().fill(environment.adminPassword);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('domcontentloaded');
    await use(page);
  },
});
