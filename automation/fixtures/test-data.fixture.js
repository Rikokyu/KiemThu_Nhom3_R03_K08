const base = require('@playwright/test');
const environment = require('../config/environment');
const { cleanupRunData, loginAsAdmin } = require('../helpers/cleanup');
const { createAPIContext, jsonResponse } = require('../helpers/api.helper');
const { createManagedUser, loginManagedUser } = require('../helpers/user-provisioner');
const {
  listAllRows,
  requestWithSession,
  unwrapPayload,
} = require('../helpers/snipe-client');
const { TestDataManager } = require('../helpers/test-data-manager');

function testRole(title, role) {
  const titleSlug = String(title || 'test').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const roleSlug = `${titleSlug}_${role}`.replace(/[^a-z0-9_]+/g, '_');
  return roleSlug.slice(0, 100);
}

function apiSucceeded(result, operation) {
  if (!result.ok || !result.body || result.body.status !== 'success') {
    throw new Error(`${operation} failed (HTTP ${result.status}; API status ${result.body && result.body.status || 'unavailable'}).`);
  }
}

class TestDataFixture extends TestDataManager {
  constructor(browser, testInfo) {
    super();
    this.browser = browser;
    this.testInfo = testInfo;
    this.adminContext = null;
    this.adminPage = null;
    this.users = new Map();
    this.userContexts = new Map();
    this.apiContexts = new Map();
    this.tokens = new Map();
  }

  async ensureAdmin() {
    if (this.adminPage) return this.adminPage;
    this.adminContext = await this.browser.newContext();
    this.adminPage = await this.adminContext.newPage();
    await loginAsAdmin(this.adminPage);
    return this.adminPage;
  }

  async createGroup(role, permissions) {
    const adminPage = await this.ensureAdmin();
    const name = this.assetTag(`${testRole(this.testInfo.title, role)}-GROUP`);
    this.recordPending('group', name, { permissions });
    const result = await requestWithSession(adminPage, 'POST', '/api/v1/groups', {
      name,
      permissions,
    });
    apiSucceeded(result, 'Run-owned Group creation');
    const group = unwrapPayload(result.body);
    if (!group || !group.id || group.name !== name) {
      throw new Error('Group API did not return the exact run-owned Group identity and ID.');
    }
    this.registerCreatedGroup(group.id, name, { permissions });

    const read = await requestWithSession(adminPage, 'GET', `/api/v1/groups/${group.id}`);
    const saved = unwrapPayload(read.body);
    if (read.status !== 200 || !saved || saved.name !== name ||
        Object.entries(permissions).some(([permission, value]) =>
          Number(saved.permissions && saved.permissions[permission]) !== Number(value))) {
      throw new Error('Run-owned Group permissions did not persist as configured.');
    }
    return { id: String(group.id), name, permissions: saved.permissions };
  }

  async ensureUser(role, options = {}) {
    const key = `${role}:${JSON.stringify(options.permissions || {})}:${(options.groupIds || []).join(',')}:${options.active !== false}`;
    if (this.users.has(key)) return this.users.get(key);
    const adminPage = await this.ensureAdmin();
    const scopedRole = testRole(this.testInfo.title, role);
    const user = await createManagedUser(adminPage, this, scopedRole, options);
    if (options.login !== false && user.active) {
      const loggedIn = await loginManagedUser(this.browser, environment.baseURL, user);
      user.page = loggedIn.page;
      user.context = loggedIn.context;
      this.userContexts.set(user.username, loggedIn.context);
    }
    this.users.set(key, user);
    return user;
  }

  async createToken(user, tokenLabel = 'API') {
    if (!user || !user.page) throw new Error('An authenticated run-owned user is required to create an API token.');
    if (this.tokens.has(user.username)) return this.tokens.get(user.username);
    const tokenSuffix = String(tokenLabel).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 20).toUpperCase();
    const tokenName = `AUTO-TEST-${this.runId}-${user.username.toUpperCase()}-${tokenSuffix || 'API'}-TOKEN`;
    this.recordPending('token', tokenName, { ownerUsername: user.username, ownerId: user.id });
    const result = await requestWithSession(user.page, 'POST', '/api/v1/account/personal-access-tokens', {
      name: tokenName,
    });
    apiSucceeded(result, 'Run-owned API token creation');
    const tokenData = unwrapPayload(result.body);
    if (!tokenData || !tokenData.id || !tokenData.token) {
      throw new Error('API token creation did not return token metadata and its one-time value.');
    }
    const token = { id: String(tokenData.id), name: tokenName, value: tokenData.token, owner: user };
    this.registerCreatedToken(token.id, token.name, {
      ownerUsername: user.username,
      ownerId: user.id,
    });
    const apiContext = await createAPIContext(environment.baseURL, token.value);
    const identityResponse = await apiContext.get('/api/v1/users/me');
    const identityBody = await jsonResponse(identityResponse);
    const identity = unwrapPayload(identityBody);
    if (!identityResponse.ok() || !identity || identity.username !== user.username) {
      await apiContext.dispose();
      throw new Error('Created API token did not authenticate as its run-owned owner.');
    }
    this.apiContexts.set(user.username, apiContext);
    this.tokens.set(user.username, token);
    return token;
  }

  async getApiContext(user) {
    await this.createToken(user);
    return this.apiContexts.get(user.username);
  }

  getAssetFixture() {
    const fixture = this.runContext.fixture;
    if (!fixture || !fixture.model || !fixture.statusLabel) {
      const error = new Error(this.runContext.fixtureIssue ||
        'Global setup did not identify a live Model and deployable Status Label.');
      error.code = 'FIXTURE_BLOCKED';
      throw error;
    }
    return {
      model: {
        id: fixture.model.id,
        name: fixture.model.name,
        category: { id: fixture.model.categoryId },
      },
      statusLabel: fixture.statusLabel,
    };
  }

  async findAssetsByTag(assetTag) {
    const adminPage = await this.ensureAdmin();
    const rows = await listAllRows(adminPage, '/api/v1/hardware', { search: assetTag });
    return rows.filter((asset) => asset.asset_tag === assetTag);
  }

  async readAsset(user, id) {
    const apiContext = await this.getApiContext(user);
    const response = await apiContext.get(`/api/v1/hardware/${id}`);
    return { response, body: await jsonResponse(response) };
  }

  async createAsset(user, label = 'ASSET') {
    const apiContext = await this.getApiContext(user);
    const fixture = this.getAssetFixture();
    const assetTag = this.assetTag(label);
    const serial = `PW-${this.runId}-${this.assetTag('SERIAL').slice(-8)}`;
    this.recordPending('asset', assetTag, {
      modelId: String(fixture.model.id),
      statusLabelId: String(fixture.statusLabel.id),
    });
    const response = await apiContext.post('/api/v1/hardware', {
      data: {
        asset_tag: assetTag,
        serial,
        model_id: Number(fixture.model.id),
        status_id: Number(fixture.statusLabel.id),
      },
    });
    const body = await jsonResponse(response);
    apiSucceeded({ ok: response.ok(), status: response.status(), body }, 'Run-owned Asset creation');
    const asset = unwrapPayload(body);
    if (!asset || !asset.id) throw new Error('Asset API reported success without an Asset ID.');
    this.registerCreatedAsset(asset.id, assetTag);

    const readResponse = await apiContext.get(`/api/v1/hardware/${asset.id}`);
    const readBody = await jsonResponse(readResponse);
    const saved = unwrapPayload(readBody);
    const savedModelId = saved && (saved.model && saved.model.id || saved.model_id);
    const savedStatusId = saved && (saved.status_label && saved.status_label.id || saved.status_id);
    if (!readResponse.ok() || !saved || saved.asset_tag !== assetTag ||
        String(savedModelId) !== String(fixture.model.id) ||
        String(savedStatusId) !== String(fixture.statusLabel.id)) {
      throw new Error('Created Asset readback did not match its run-owned tag, Model, and Status Label.');
    }
    return {
      id: String(asset.id),
      assetTag,
      serial,
      modelId: String(fixture.model.id),
      statusLabelId: String(fixture.statusLabel.id),
      body,
    };
  }

  async cleanup() {
    const pending = this.manifest.created.some((entry) =>
      entry.runId === this.runId && entry.state !== 'cleaned' && entry.state !== 'no-object'
    );
    if (!pending) return [];
    const adminPage = await this.ensureAdmin();
    const userPages = {};
    for (const [username, context] of this.userContexts) {
      userPages[username] = context.pages()[0];
    }
    const outcomes = await cleanupRunData(adminPage, this, {
      userPages,
      apiTokenContexts: Object.fromEntries(this.apiContexts),
    });
    return outcomes;
  }

  async close() {
    for (const context of this.apiContexts.values()) await context.dispose();
    for (const context of this.userContexts.values()) await context.close();
    if (this.adminContext) await this.adminContext.close();
  }
}

const test = base.test.extend({
  testDataManager: async ({ browser }, use, testInfo) => {
    const managedData = new TestDataFixture(browser, testInfo);
    let cleanupError;
    try {
      await use(managedData);
    } finally {
      try {
        await managedData.cleanup();
      } catch (error) {
        cleanupError = error;
      } finally {
        await managedData.close();
      }
    }
    if (cleanupError) throw cleanupError;
  },
});

module.exports = { TestDataFixture, test };
