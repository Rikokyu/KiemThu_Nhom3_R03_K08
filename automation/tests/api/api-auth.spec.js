const { test, expect } = require('@playwright/test');
const crypto = require('crypto');
const environment = require('../../config/environment');
const { annotateCase } = require('../../helpers/test-run.helper');
const { jsonResponse } = require('../../helpers/api.helper');

test.describe('API - authentication', () => {
  test('API-01 - Goi API khong co Bearer token', async ({ request }, testInfo) => {
    annotateCase(testInfo, 'API-01');
    const response = await request.get(`${environment.baseURL}/api/v1/hardware`, {
      headers: { Accept: 'application/json' },
    });
    const body = await jsonResponse(response);
    testInfo.annotations.push({ type: 'api-observation', description: `HTTP ${response.status()} without bearer token` });
    expect([401, 403]).toContain(response.status());
    expect(typeof (body && body.error)).toBe('string');
    expect(body.error).toMatch(/unauthenticated|unauthorized|authentication/i);
  });

  test('API-02 - Goi API bang token sai', async ({ request }, testInfo) => {
    annotateCase(testInfo, 'API-02');
    const invalidToken = crypto.randomBytes(32).toString('hex');
    const response = await request.get(`${environment.baseURL}/api/v1/hardware`, {
      headers: { Authorization: `Bearer ${invalidToken}`, Accept: 'application/json' },
    });
    const body = await jsonResponse(response);
    testInfo.annotations.push({ type: 'api-observation', description: `HTTP ${response.status()} with invalid bearer token` });
    expect([401, 403]).toContain(response.status());
    expect(typeof (body && body.error)).toBe('string');
    expect(body.error).toMatch(/unauthenticated|unauthorized|authentication/i);
  });
});
