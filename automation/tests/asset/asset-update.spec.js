const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/asset.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const {
  assetPayload,
  findNonexistentAssetId,
  isMissingAssetResponse,
} = require('../../helpers/asset.helper');
const { assetWriter } = require('../../data/permissions');

test.describe('ASSET - update', () => {
  test('ASSET-05 - Cap nhat tai san hop le', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'ASSET-05');
    const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
    const asset = await testDataManager.createAsset(writer, 'UPDATE');
    const api = await testDataManager.getApiContext(writer);
    const name = testDataManager.assetTag('UPDATED');
    const response = await api.patch(`/api/v1/hardware/${asset.id}`, { data: { name } });
    const body = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(body.status).not.toBe('error');
    const reread = await testDataManager.readAsset(writer, asset.id);
    expect(reread.response.status()).toBe(200);
    expect(assetPayload(reread.body).name).toBe(name);
  });

  test('ASSET-06 - Cap nhat ID khong ton tai', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'ASSET-06');
    const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
    const api = await testDataManager.getApiContext(writer);
    const id = await findNonexistentAssetId(api);
    const response = await api.patch(`/api/v1/hardware/${id}`, {
      data: { name: testDataManager.assetTag('NONEXISTENT-UPDATE') },
    });
    const body = await response.json();

    expect(isMissingAssetResponse(response.status(), body)).toBeTruthy();
  });
});
