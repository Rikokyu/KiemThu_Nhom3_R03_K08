const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/test-data.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const { apiErrorMessage } = require('../../helpers/api.helper');
const { assetWriter, assetEditDenied } = require('../../data/permissions');

test('AUTHZ-03 - User khong co quyen sua tai san', async ({ testDataManager }, testInfo) => {
  annotateCase(testInfo, 'AUTHZ-03');
  const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
  const asset = await testDataManager.createAsset(writer, 'AUTHZ03');
  const editor = await testDataManager.ensureUser('edit_denied', { permissions: assetEditDenied });
  const api = await testDataManager.getApiContext(editor);

  const before = await api.get(`/api/v1/hardware/${asset.id}`);
  const beforeBody = await before.json();
  expect(before.status()).toBe(200);
  const original = beforeBody.payload || beforeBody.data || beforeBody;
  expect(original.asset_tag).toBe(asset.assetTag);

  const response = await api.patch(`/api/v1/hardware/${asset.id}`, {
    data: { name: testDataManager.assetTag('UNAUTHORIZED-EDIT') },
  });
  const body = await response.json();
  expect(response.status()).toBe(403);
  expect(apiErrorMessage(body)).toMatch(/permission|forbidden|unauthoriz|not authorized/i);

  const after = await api.get(`/api/v1/hardware/${asset.id}`);
  const afterBody = await after.json();
  const unchanged = afterBody.payload || afterBody.data || afterBody;
  expect(after.status()).toBe(200);
  expect(unchanged.name).toBe(original.name);
  expect(unchanged.asset_tag).toBe(asset.assetTag);
});
