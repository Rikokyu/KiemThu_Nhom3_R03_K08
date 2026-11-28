const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/test-data.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const { apiErrorMessage } = require('../../helpers/api.helper');
const { assetWriter, groupViewOverrideDenied } = require('../../data/permissions');

test.describe('AUTHZ - company and override', () => {
  test('AUTHZ-05 - Quyen ca nhan tu choi, group cho phep', async ({ testDataManager }, testInfo) => {
    annotateCase(testInfo, 'AUTHZ-05');
    const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
    const asset = await testDataManager.createAsset(writer, 'AUTHZ05');
    const group = await testDataManager.createGroup('view_allow', { 'assets.view': 1 });
    const overridden = await testDataManager.ensureUser('group_view_denied', {
      permissions: groupViewOverrideDenied,
      groupIds: [group.id],
    });
    const api = await testDataManager.getApiContext(overridden);
    const response = await api.get(`/api/v1/hardware/${asset.id}`);
    const body = await response.json();

    expect(response.status()).toBe(403);
    expect(apiErrorMessage(body)).toMatch(/permission|forbidden|unauthoriz|not authorized/i);
  });

  test('AUTHZ-06 - Truy cap tai san Company khac', async ({}, testInfo) => {
    annotateCase(testInfo, 'AUTHZ-06',
      'BLOCKED: live Snipe-IT configuration reports full_multiple_companies_support=0; company isolation cannot be exercised without changing system settings.');
    test.skip(true,
      'BLOCKED: full_multiple_companies_support is disabled in this instance. Requires an already configured FMCS environment with verified Company A/B fixtures; system configuration was not changed.');
    expect(true).toBeTruthy();
  });
});
