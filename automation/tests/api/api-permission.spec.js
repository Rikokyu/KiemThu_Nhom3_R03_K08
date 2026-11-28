const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/asset.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const { apiCreateDenied } = require('../../data/permissions');
const { unwrapPayload } = require('../../helpers/snipe-client');
const { jsonResponse } = require('../../helpers/api.helper');

test('API-03 - Tai khoan co token nhung khong co assets.create', async ({ testDataManager }, testInfo) => {
  annotateCase(testInfo, 'API-03');
  const user = await testDataManager.ensureUser('api_create_denied', { permissions: apiCreateDenied });
  const api = await testDataManager.getApiContext(user);
  const identityResponse = await api.get('/api/v1/users/me');
  const identity = unwrapPayload(await jsonResponse(identityResponse));
  expect(identityResponse.status()).toBe(200);
  expect(identity.username).toBe(user.username);

  const fixture = testDataManager.getAssetFixture();
  const assetTag = testDataManager.assetTag('NO-CREATE-PERMISSION');
  testDataManager.recordPending('asset', assetTag);
  const response = await api.post('/api/v1/hardware', {
    data: {
      asset_tag: assetTag,
      serial: `PW-${testDataManager.runId}-NO-CREATE`,
      model_id: Number(fixture.model.id),
      status_id: Number(fixture.statusLabel.id),
    },
  });
  const body = await jsonResponse(response);

  expect(response.status()).toBe(403);
  expect(typeof (body && body.message)).toBe('string');
  expect(body.message).toMatch(/permission|forbidden|unauthorized|not authorized/i);
  expect(await testDataManager.findAssetsByTag(assetTag)).toHaveLength(0);
});
