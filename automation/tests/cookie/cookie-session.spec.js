const { test, expect } = require('@playwright/test');
const environment = require('../../config/environment');
const { findSessionCookie } = require('../../helpers/cookie.helper');
const { annotateCase } = require('../../helpers/test-run.helper');
const { logout, login } = require('../../helpers/auth.helper');

test.describe('COOKIE - session', () => {
  test('COOKIE-01 - Kiem tra thuoc tinh session cookie', async ({ page, context }, testInfo) => {
    annotateCase(testInfo, 'COOKIE-01');
    await login(page, environment.baseURL, environment.adminUsername, environment.adminPassword);
    const cookie = findSessionCookie(await context.cookies());
    expect(cookie).toBeTruthy();
    expect(cookie.path).toBe('/');
    testInfo.annotations.push({
      type: 'cookie-observation',
      description: JSON.stringify({
        name: cookie.name,
        path: cookie.path,
        domain: cookie.domain,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      }),
    });
  });

  test('COOKIE-02 - Session thay doi va ket thuc sau logout', async ({ page, context, browser }, testInfo) => {
    annotateCase(testInfo, 'COOKIE-02');
    await login(page, environment.baseURL, environment.adminUsername, environment.adminPassword);
    const oldCookies = await context.cookies();
    const after = findSessionCookie(oldCookies);
    expect(after).toBeTruthy();
    testInfo.annotations.push({
      type: 'session-observation',
      description: JSON.stringify({ cookieName: after.name, path: after.path, secure: after.secure, httpOnly: after.httpOnly, sameSite: after.sameSite }),
    });
    await logout(page);
    const oldSessionContext = await browser.newContext();
    try {
      await oldSessionContext.addCookies(oldCookies);
      const oldSessionPage = await oldSessionContext.newPage();
      const response = await oldSessionPage.goto(`${environment.baseURL}/hardware`);
      expect(response).not.toBeNull();
      const path = new URL(oldSessionPage.url()).pathname;
      expect([401, 403].includes(response.status()) ||
        /\/login(?:\?|$)/i.test(path),
      `The saved pre-logout session remained authorized (HTTP ${response.status()}, ${path}).`).toBeTruthy();
    } finally {
      await oldSessionContext.close();
    }
  });
});
