const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/test-data.fixture');
const environment = require('../../config/environment');
const { annotateCase } = require('../../helpers/test-run.helper');
const { assetWriter } = require('../../data/permissions');
const { fillSensitiveField } = require('../../helpers/user-provisioner');

test('AUTH-04 - Throttle khi dang nhap sai nhieu lan', async ({ page, testDataManager }, testInfo) => {
  annotateCase(testInfo, 'AUTH-04');
  const throttleUser = await testDataManager.ensureUser('throttle_probe', {
    permissions: assetWriter,
    login: false,
  });
  let lockedOut = false;
  let attempts = 0;

  for (; attempts < 10 && !lockedOut; attempts += 1) {
    await page.goto(`${environment.baseURL}/login`);
    await page.locator('input[name="username"], input#username').first().fill(throttleUser.username);
    await fillSensitiveField(
      page.locator('input[name="password"], input#password').first(),
      `Invalid-${attempts}-Password!`,
      'throttle probe password'
    );
    const responsePromise = page.waitForResponse((response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/login'
    );
    await page.locator('button[type="submit"]').first().click();
    const response = await responsePromise;
    await page.waitForLoadState('domcontentloaded');
    const alertText = await page.locator('.alert-danger, .alert-warning, [role="alert"]')
      .allTextContents();
    lockedOut = response.status() === 429 ||
      alertText.some((text) => /too many login attempts|throttle|try again in/i.test(text));
  }

  testInfo.annotations.push({
    type: 'throttle-observation',
    description: `Run-owned disposable account was throttled after ${attempts} bounded failed attempts; the account is removed during teardown.`,
  });
  expect(lockedOut, 'Login throttle was not observed within the 10-attempt safety bound.').toBeTruthy();
});
