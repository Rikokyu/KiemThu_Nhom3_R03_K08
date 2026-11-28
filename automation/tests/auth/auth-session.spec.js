const { test, expect } = require('@playwright/test');
const environment = require('../../config/environment');
const { annotateCase } = require('../../helpers/test-run.helper');
const { logout } = require('../../helpers/auth.helper');
const { login } = require('../../helpers/auth.helper');

test.describe('AUTH - session', () => {
  test('AUTH-05 - Truy cap trang yeu cau dang nhap', async ({ page }, testInfo) => {
    annotateCase(testInfo, 'AUTH-05');
    await page.context().clearCookies();
    const response = await page.goto(`${environment.baseURL}/hardware`);
    expect(response).not.toBeNull();
    expect([401, 403].includes(response.status()) ||
      /\/login(?:\?|$)/i.test(new URL(page.url()).pathname)).toBeTruthy();
  });

  test('AUTH-06 - Dang xuat va su dung lai session cu', async ({ page, browser, context }, testInfo) => {
    annotateCase(testInfo, 'AUTH-06');
    await login(page, environment.baseURL, environment.adminUsername, environment.adminPassword);
    const oldCookies = await context.cookies();
    expect(oldCookies.some((cookie) => /session/i.test(cookie.name))).toBeTruthy();
    await logout(page);
    const oldSessionContext = await browser.newContext();
    try {
      await oldSessionContext.addCookies(oldCookies);
      const oldSessionPage = await oldSessionContext.newPage();
      const protectedResponse = await oldSessionPage.goto(`${environment.baseURL}/hardware`);
      expect(protectedResponse).not.toBeNull();
      expect([401, 403].includes(protectedResponse.status()) ||
        /\/login(?:\?|$)/i.test(new URL(oldSessionPage.url()).pathname)).toBeTruthy();
    } finally {
      await oldSessionContext.close();
    }
  });
});
