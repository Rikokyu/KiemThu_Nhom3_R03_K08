const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/asset.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const { assetWriter } = require('../../data/permissions');

test('ASSET-07 - Xoa tai san automation duoc tao trong run nay', async ({ testDataManager }, testInfo) => {
  annotateCase(testInfo, 'ASSET-07');
  const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
  const asset = await testDataManager.createAsset(writer, 'DELETE');
  const api = await testDataManager.getApiContext(writer);
  const response = await api.delete(`/api/v1/hardware/${asset.id}`);
  const body = await response.json();
  expect(response.ok()).toBeTruthy();
  expect(body.status).toBe('success');

  const after = await api.get(`/api/v1/hardware/${asset.id}`);
  if (after.status() === 404) {
    testDataManager.markAssetDeleted(asset.id);
    return;
  }
  const deletedAsset = await after.json();
  const payload = deletedAsset.payload || deletedAsset.data || deletedAsset;
  expect(after.status()).toBe(200);
  expect(payload.asset_tag).toBe(asset.assetTag);
  expect(payload.deleted_at).toBeTruthy();
  testDataManager.markAssetDeleted(asset.id, 'soft-deleted-and-verified');
});
