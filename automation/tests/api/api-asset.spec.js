const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/asset.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const {
  assetPayload,
  findNonexistentAssetId,
  isMissingAssetResponse,
} = require('../../helpers/asset.helper');
const { assetWriter } = require('../../data/permissions');

test.describe('API - asset CRUD', () => {
  test('API-04 - API tao asset hop le', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'API-04');
    const writer = await testDataManager.ensureUser('api_writer', { permissions: assetWriter });
    const asset = await testDataManager.createAsset(writer, 'API04');
    const { response, body } = await testDataManager.readAsset(writer, asset.id);

    expect(response.status()).toBe(200);
    expect(body.status).not.toBe('error');
    expect(assetPayload(body).asset_tag).toBe(asset.assetTag);
  });

  test('API-05 - API tao asset khong hop le', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'API-05');
    const writer = await testDataManager.ensureUser('api_writer', { permissions: assetWriter });
    const existing = await testDataManager.createAsset(writer, 'API05-DUPLICATE');
    const api = await testDataManager.getApiContext(writer);
    const duplicateResponse = await api.post('/api/v1/hardware', {
      data: {
        asset_tag: existing.assetTag,
        serial: `PW-${testDataManager.runId}-API05-DUPLICATE`,
        model_id: Number(existing.modelId),
        status_id: Number(existing.statusLabelId),
      },
    });
    const body = await duplicateResponse.json();

    expect(duplicateResponse.status() === 422 || body.status === 'error').toBeTruthy();
    expect(await testDataManager.findAssetsByTag(existing.assetTag)).toHaveLength(1);
  });

  test('API-06 - API cap nhat ID khong ton tai', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'API-06');
    const writer = await testDataManager.ensureUser('api_writer', { permissions: assetWriter });
    const api = await testDataManager.getApiContext(writer);
    const id = await findNonexistentAssetId(api);
    const response = await api.patch(`/api/v1/hardware/${id}`, {
      data: { name: testDataManager.assetTag('API06-NONEXISTENT') },
    });
    const body = await response.json();

    expect(isMissingAssetResponse(response.status(), body)).toBeTruthy();
  });
});
