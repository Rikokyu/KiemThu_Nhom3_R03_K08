const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/test-data.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const { apiErrorMessage } = require('../../helpers/api.helper');
const { assetWriter, assetDeleteDenied } = require('../../data/permissions');

test('AUTHZ-04 - User khong co quyen xoa tai san', async ({ testDataManager }, testInfo) => {
  annotateCase(testInfo, 'AUTHZ-04');
  const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
  const asset = await testDataManager.createAsset(writer, 'AUTHZ04');
  const deleter = await testDataManager.ensureUser('delete_denied', { permissions: assetDeleteDenied });
  const api = await testDataManager.getApiContext(deleter);
  const response = await api.delete(`/api/v1/hardware/${asset.id}`);
  const body = await response.json();

  expect(response.status()).toBe(403);
  expect(apiErrorMessage(body)).toMatch(/permission|forbidden|unauthoriz|not authorized/i);
  const after = await api.get(`/api/v1/hardware/${asset.id}`);
  const afterBody = await after.json();
  const unchanged = afterBody.payload || afterBody.data || afterBody;
  expect(after.status()).toBe(200);
  expect(unchanged.asset_tag).toBe(asset.assetTag);
  expect(unchanged.deleted_at).toBeFalsy();
});
