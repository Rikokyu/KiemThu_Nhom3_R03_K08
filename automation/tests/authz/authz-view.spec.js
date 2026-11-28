const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/test-data.fixture');
const environment = require('../../config/environment');
const { annotateCase } = require('../../helpers/test-run.helper');
const { login } = require('../../helpers/auth.helper');
const { apiErrorMessage } = require('../../helpers/api.helper');
const { assetWriter, assetViewDenied } = require('../../data/permissions');

test.describe('AUTHZ - view', () => {
  test('AUTHZ-01 - Admin truy cap quan ly tai san', async ({ page }, testInfo) => {
    annotateCase(testInfo, 'AUTHZ-01');
    await login(page, environment.baseURL, environment.adminUsername, environment.adminPassword);
    const response = await page.goto(`${environment.baseURL}/hardware`);
    expect(response).not.toBeNull();
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toContainText(/assets|hardware/i);
  });

  test('AUTHZ-02 - User khong co quyen xem tai san', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'AUTHZ-02');
    const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
    const asset = await testDataManager.createAsset(writer, 'AUTHZ02');
    const viewer = await testDataManager.ensureUser('view_denied', { permissions: assetViewDenied });
    const api = await testDataManager.getApiContext(viewer);
    const response = await api.get(`/api/v1/hardware/${asset.id}`);
    const body = await response.json();

    expect(response.status()).toBe(403);
    expect(apiErrorMessage(body)).toMatch(/permission|forbidden|unauthoriz|not authorized/i);
  });
});
