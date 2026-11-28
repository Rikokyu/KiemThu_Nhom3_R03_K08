const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/test-data.fixture');
const environment = require('../../config/environment');
const { annotateCase } = require('../../helpers/test-run.helper');
const { login } = require('../../helpers/auth.helper');

async function submitAsset(page, asset, includeCsrf) {
  const responsePromise = page.waitForResponse((response) =>
    response.request().method() === 'POST' &&
    new URL(response.url()).pathname === '/hardware'
  );
  await page.evaluate(({ data, sendCsrf }) => {
    const headers = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (sendCsrf) {
      headers['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').content;
    }
    return fetch('/hardware', {
      method: 'POST',
      credentials: 'same-origin',
      redirect: 'manual',
      headers,
      body: new URLSearchParams(data),
    });
  }, { data: asset, sendCsrf: includeCsrf });
  const response = await responsePromise;
  const location = response.headers().location;
  return {
    status: response.status(),
    location: location ? new URL(location, environment.baseURL).pathname : null,
  };
}

test.describe('COOKIE - CSRF and flags', () => {
  test('COOKIE-03 - Request thay doi du lieu thieu CSRF', async ({ page, testDataManager }, testInfo) => {
    annotateCase(testInfo, 'COOKIE-03');
    await login(page, environment.baseURL, environment.adminUsername, environment.adminPassword);
    const assetTag = testDataManager.assetTag('COOKIE03-CSRF');
    const fixture = testDataManager.getAssetFixture();
    testDataManager.recordPending('asset', assetTag);
    const missingCsrf = await submitAsset(page, {
      'asset_tags[1]': assetTag,
      'serials[1]': `PW-${testDataManager.runId}-COOKIE03-NO-CSRF`,
      model_id: String(fixture.model.id),
      status_id: String(fixture.statusLabel.id),
    }, false);
    const missingCsrfAssets = await testDataManager.findAssetsByTag(assetTag);
    if (missingCsrfAssets.length === 1) {
      testDataManager.registerCreatedAsset(missingCsrfAssets[0].id, assetTag);
    }

    const controlTag = testDataManager.assetTag('COOKIE03-CSRF-CONTROL');
    testDataManager.recordPending('asset', controlTag);
    const withCsrf = await submitAsset(page, {
      'asset_tags[1]': controlTag,
      'serials[1]': `PW-${testDataManager.runId}-COOKIE03-CONTROL`,
      model_id: String(fixture.model.id),
      status_id: String(fixture.statusLabel.id),
    }, true);
    const controlAssets = await testDataManager.findAssetsByTag(controlTag);
    if (controlAssets.length === 1) {
      testDataManager.registerCreatedAsset(controlAssets[0].id, controlTag);
    }

    testInfo.annotations.push({
      type: 'csrf-observation',
      description: `Without CSRF: HTTP ${missingCsrf.status}${missingCsrf.location ? ` to ${missingCsrf.location}` : ''}, matching Assets ${missingCsrfAssets.length}; with CSRF: HTTP ${withCsrf.status}, matching Assets ${controlAssets.length}.`,
    });
    expect(missingCsrf.status).toBe(302);
    expect(missingCsrf.location).not.toMatch(/\/login(?:\/|$)/i);
    expect(missingCsrfAssets).toHaveLength(0);
    expect([200, 302]).toContain(withCsrf.status);
    expect(controlAssets).toHaveLength(1);
  });

  test('COOKIE-04 - Kiem tra Secure HttpOnly SameSite', async ({ page, context }, testInfo) => {
    annotateCase(testInfo, 'COOKIE-04');
    test.skip(environment.baseURL.startsWith('http://'),
      'BLOCKED: Secure cookie cannot be verified on the configured HTTP instance.');
    await login(page, environment.baseURL, environment.adminUsername, environment.adminPassword);
    const cookie = (await context.cookies()).find((item) =>
      /session/i.test(item.name) || item.name === 'snipeitv6_session'
    );
    expect(cookie).toBeTruthy();
    testInfo.annotations.push({
      type: 'cookie-observation',
      description: JSON.stringify({
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      }),
    });
    test.skip(environment.expectedCookieSecure === null ||
      environment.expectedCookieHttpOnly === null || !environment.expectedCookieSameSite,
    'BLOCKED: expected HTTPS cookie policy has not been declared.');
    expect(cookie.secure).toBe(environment.expectedCookieSecure);
    expect(cookie.httpOnly).toBe(environment.expectedCookieHttpOnly);
    expect(cookie.sameSite.toLowerCase()).toBe(environment.expectedCookieSameSite.toLowerCase());
  });
});
