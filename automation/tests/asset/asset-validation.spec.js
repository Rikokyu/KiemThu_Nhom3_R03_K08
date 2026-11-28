const { expect } = require('@playwright/test');
const { test } = require('../../fixtures/asset.fixture');
const { annotateCase } = require('../../helpers/test-run.helper');
const { assetIdFrom } = require('../../helpers/asset.helper');
const { assetWriter } = require('../../data/permissions');
const { jsonResponse } = require('../../helpers/api.helper');

const invalidPayloads = [
  ['asset_tag 256 characters', (tag) => ({ asset_tag: `${tag}${'X'.repeat(256 - tag.length)}` })],
  ['name 256 characters', (tag) => ({ asset_tag: tag, name: 'N'.repeat(256) })],
  ['warranty_months 241', (tag) => ({ asset_tag: tag, warranty_months: 241 })],
  ['purchase_cost negative', (tag) => ({ asset_tag: tag, purchase_cost: -1 })],
  ['purchase_date invalid', (tag) => ({ asset_tag: tag, purchase_date: 'not-a-date' })],
];

test.describe('ASSET-04 - boundary va format', () => {
  for (const [label, invalidData] of invalidPayloads) {
    test(`ASSET-04 - ${label}`, async ({ testDataManager }, testInfo) => {
      annotateCase(testInfo, 'ASSET-04');
      const writer = await testDataManager.ensureUser('asset_writer', { permissions: assetWriter });
      const api = await testDataManager.getApiContext(writer);
      const fixture = testDataManager.getAssetFixture();
      const generatedTag = testDataManager.assetTag('BOUNDARY');
      const invalid = invalidData(generatedTag);
      const assetTag = invalid.asset_tag;
      testDataManager.recordPending('asset', assetTag);
      const response = await api.post('/api/v1/hardware', {
        data: {
          asset_tag: generatedTag,
          serial: `PW-${testDataManager.runId}-${testInfo.title.replace(/[^A-Z0-9]/gi, '').slice(-12)}`,
          model_id: Number(fixture.model.id),
          status_id: Number(fixture.statusLabel.id),
          ...invalid,
        },
      });
      const body = await jsonResponse(response);
      if (response.ok() && body && body.status === 'success') {
        const id = assetIdFrom(body);
        if (id) testDataManager.registerCreatedAsset(id, assetTag);
      }

      expect([401, 403]).not.toContain(response.status());
      expect(response.status() === 422 || (body && body.status === 'error')).toBeTruthy();
      expect(await testDataManager.findAssetsByTag(assetTag)).toHaveLength(0);
    });
  }
});
