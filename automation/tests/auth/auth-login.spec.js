const { expect } = require('@playwright/test');
const environment = require('../../config/environment');
const { test } = require('../../fixtures/test-data.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const { login } = require('../../helpers/auth.helper');
const { fillSensitiveField } = require('../../helpers/user-provisioner');

test.describe('AUTH - login', () => {
  test('AUTH-01 - Dang nhap hop le', async ({ page }, testInfo) => {
    annotateCase(testInfo, 'AUTH-01');
    await login(page, environment.baseURL, environment.adminUsername, environment.adminPassword);
    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.locator('body')).toContainText(/dashboard|assets|hardware/i);
  });

  test('AUTH-02 - Dang nhap sai thong tin', async ({ page }, testInfo) => {
    annotateCase(testInfo, 'AUTH-02');
    await page.goto(`${environment.baseURL}/login`);
    await page.locator('input[name="username"], input#username').first().fill(`pw_invalid_${Date.now()}`);
    await fillSensitiveField(
      page.locator('input[name="password"], input#password').first(),
      `Invalid-${Date.now()}!`,
      'invalid test password'
    );
    await page.locator('button[type="submit"]').first().click();
    await expect(page).toHaveURL(/login/i);
    await expect(page.locator('.alert-danger, .alert-warning, [role="alert"]').first()).toContainText(/tên đăng nhập|mật khẩu|account|password|sign in|invalid/i);
  });

  test('AUTH-03 - Dang nhap tai khoan inactive', async ({ page, testDataManager }, testInfo) => {
    annotateCase(testInfo, 'AUTH-03');
    const inactive = await testDataManager.ensureUser('inactive', { active: false, login: false });
    await page.goto(`${environment.baseURL}/login`);
    await page.locator('input[name="username"], input#username').first().fill(inactive.username);
    await fillSensitiveField(
      page.locator('input[name="password"], input#password').first(),
      inactive.password,
      'inactive-user password'
    );
    await page.locator('button[type="submit"]').first().click();
    await expect(page).toHaveURL(/login/i);
    await expect(page.locator('.alert-danger, .alert-warning, [role="alert"]').first()).toContainText(/tên đăng nhập|mật khẩu|account|password|sign in|invalid/i);
  });
});
