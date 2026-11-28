const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/asset.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const { assetPayload } = require('../../helpers/asset.helper');
const { assetWriter } = require('../../data/permissions');

test.describe('ASSET - create', () => {
  test('ASSET-01 - Tao tai san hop le', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'ASSET-01');
    const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
    const created = await testDataManager.createAsset(writer, 'ASSET01');
    const { response, body } = await testDataManager.readAsset(writer, created.id);

    expect(response.status()).toBe(200);
    expect(body.status).not.toBe('error');
    expect(assetPayload(body).asset_tag).toBe(created.assetTag);
  });

  test('ASSET-02 - Tao tai san thieu truong bat buoc', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'ASSET-02');
    const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
    const api = await testDataManager.getApiContext(writer);
    const assetTag = testDataManager.assetTag('MISSING-REQUIRED');
    testDataManager.recordPending('asset', assetTag);
    const response = await api.post('/api/v1/hardware', {
      data: { asset_tag: assetTag },
    });
    const body = await response.json();

    expect([401, 403]).not.toContain(response.status());
    expect(response.status() === 422 || body.status === 'error').toBeTruthy();
    expect(await testDataManager.findAssetsByTag(assetTag)).toHaveLength(0);
  });

  test('ASSET-03 - Tao tai san trung Asset Tag', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'ASSET-03');
    const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
    const created = await testDataManager.createAsset(writer, 'DUPLICATE');
    const api = await testDataManager.getApiContext(writer);
    const duplicateResponse = await api.post('/api/v1/hardware', {
      data: {
        asset_tag: created.assetTag,
        serial: `PW-${testDataManager.runId}-DUPLICATE`,
        model_id: Number(created.modelId),
        status_id: Number(created.statusLabelId),
      },
    });
    const body = await duplicateResponse.json();

    expect(duplicateResponse.status() === 422 || body.status === 'error').toBeTruthy();
    expect(await testDataManager.findAssetsByTag(created.assetTag)).toHaveLength(1);
  });
});
