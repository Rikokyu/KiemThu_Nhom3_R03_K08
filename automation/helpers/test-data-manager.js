const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const users = require('../data/users');

const automationRoot = path.resolve(__dirname, '..');
const cacheDirectory = path.join(automationRoot, '.cache');
const runContextPath = path.join(cacheDirectory, 'current-run.json');

function createRunId() {
  return `${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function runUsernamePrefix(runId) {
  return `pw_${runId.replace(/[^a-z0-9]/gi, '_')}_`;
}

function getRunContext() {
  if (!fs.existsSync(runContextPath)) {
    throw new Error('Current run context is missing; start tests through Playwright global setup.');
  }
  return JSON.parse(fs.readFileSync(runContextPath, 'utf8'));
}

function isLocalTestTarget(value) {
  const url = new URL(value);
  return ['localhost', '127.0.0.1', '::1'].includes(url.hostname.toLowerCase());
}

class TestDataManager {
  constructor() {
    this.runContext = getRunContext();
    this.runId = this.runContext.runId;
    this.manifestPath = path.join(cacheDirectory, `managed-data-${this.runId}.json`);
    this.secretsPath = path.join(cacheDirectory, `run-secrets-${this.runId}.json`);
    this.manifest = fs.existsSync(this.manifestPath)
      ? JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'))
      : { runId: this.runId, created: [], cleanup: [] };
    if (!Array.isArray(this.manifest.created)) this.manifest.created = [];
    if (!Array.isArray(this.manifest.cleanup)) this.manifest.cleanup = [];
    if (this.manifest.runId !== this.runId) {
      throw new Error('Managed test data belongs to a different RUN_ID.');
    }
  }

  assetTag(label = 'ASSET') {
    const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `AUTO-TEST-${this.runId}-${label}-${suffix}`;
  }

  username(role) {
    if (!/^[a-z0-9_]+$/i.test(role)) {
      throw new Error('Test-user role must contain only letters, numbers, or underscores.');
    }
    return `${runUsernamePrefix(this.runId)}${role}`;
  }

  reusableUsername(role) {
    const username = users.reusableAccounts[role];
    if (!username) {
      throw new Error(`Unknown reusable test-user role: ${role}`);
    }
    return username;
  }

  recordPending(type, identity, metadata = {}) {
    this.assertOwnedIdentity(type, identity);
    let entry = this.manifest.created.find((item) =>
      item.type === type && item.identity === identity && item.runId === this.runId
    );
    if (!entry) {
      entry = {
        type,
        id: null,
        identity,
        runId: this.runId,
        state: 'pending',
        metadata,
        createdAt: new Date().toISOString(),
      };
      this.manifest.created.push(entry);
      this.save();
    }
    return entry;
  }

  registerCreatedObject(type, id, identity, metadata = {}) {
    const idValue = String(id || '');
    const validId = type === 'token'
      ? idValue.length > 0
      : /^\d+$/.test(idValue);
    if (!validId) {
      throw new Error(`Cannot register created ${type} without a valid ID.`);
    }
    this.assertOwnedIdentity(type, identity);
    let entry = this.manifest.created.find((item) =>
      item.type === type && item.identity === identity && item.runId === this.runId
    );
    if (entry && entry.id && String(entry.id) !== idValue) {
      throw new Error(`Refusing to replace the registered ID for ${type} ${identity}.`);
    }
    if (!entry) {
      entry = { type, id: idValue, identity, runId: this.runId, metadata };
      this.manifest.created.push(entry);
    } else {
      entry.id = idValue;
      entry.metadata = { ...entry.metadata, ...metadata };
      entry.state = 'created';
    }
    this.save();
    return entry;
  }

  registerCreatedAsset(id, assetTag) {
    return this.registerCreatedObject('asset', id, assetTag);
  }

  registerCreatedUser(id, username, metadata = {}) {
    return this.registerCreatedObject('user', id, username, metadata);
  }

  registerCreatedToken(id, tokenName, metadata = {}) {
    return this.registerCreatedObject('token', id, tokenName, metadata);
  }

  registerCreatedGroup(id, name, metadata = {}) {
    return this.registerCreatedObject('group', id, name, metadata);
  }

  registerRetainedUser(id, username) {
    if (typeof username !== 'string' || !/^pw_[a-z0-9_]+$/i.test(username)) {
      throw new Error('Refusing to register a retained user without the required pw_ prefix.');
    }
    return this.registerCreatedUser(id, username, { retained: true });
  }

  markAssetDeleted(id, result = 'deleted-and-verified') {
    this.markCleaned('asset', id, result);
  }

  markCleaned(type, id, result) {
    const entry = this.manifest.created.find((item) =>
      item.type === type && String(item.id) === String(id) && item.runId === this.runId
    );
    if (!entry) {
      throw new Error(`Cannot mark cleaned ${type} ${id}: ownership is not registered for this RUN_ID.`);
    }
    entry.state = 'cleaned';
    entry.cleanupResult = result;
    entry.cleanedAt = new Date().toISOString();
    this.manifest.cleanup.push({ type, id: String(id), result, at: entry.cleanedAt });
    this.save();
  }

  markNoObject(type, identity, result) {
    const entry = this.manifest.created.find((item) =>
      item.type === type && item.identity === identity && item.runId === this.runId && !item.id
    );
    if (!entry) {
      throw new Error(`Cannot resolve pending ${type} ${identity}: no matching run-owned record exists.`);
    }
    entry.state = 'no-object';
    entry.cleanupResult = result;
    entry.cleanedAt = new Date().toISOString();
    this.manifest.cleanup.push({ type, identity, result, at: entry.cleanedAt });
    this.save();
  }

  saveRunSecrets(secrets) {
    fs.mkdirSync(cacheDirectory, { recursive: true });
    const existing = this.readRunSecrets();
    const usersByName = { ...(existing.users || {}), ...(secrets.users || {}) };
    if (secrets.username && secrets.password) usersByName[secrets.username] = secrets.password;
    fs.writeFileSync(this.secretsPath, JSON.stringify({ ...existing, ...secrets, users: usersByName }), { mode: 0o600 });
  }

  readRunSecrets() {
    if (!fs.existsSync(this.secretsPath)) return {};
    return JSON.parse(fs.readFileSync(this.secretsPath, 'utf8'));
  }

  removeRunSecrets() {
    if (fs.existsSync(this.secretsPath)) fs.unlinkSync(this.secretsPath);
  }

  removeRunSecret(username) {
    const secrets = this.readRunSecrets();
    if (secrets.users) delete secrets.users[username];
    if (secrets.username === username) {
      delete secrets.username;
      delete secrets.password;
    }
    if (Object.keys(secrets.users || {}).length || secrets.username) {
      fs.writeFileSync(this.secretsPath, JSON.stringify(secrets), { mode: 0o600 });
    } else {
      this.removeRunSecrets();
    }
  }

  assertOwnedIdentity(type, identity) {
    const prefixes = {
      asset: `AUTO-TEST-${this.runId}-`,
      user: runUsernamePrefix(this.runId),
      group: `AUTO-TEST-${this.runId}-`,
      token: `AUTO-TEST-${this.runId}-`,
    };
    const prefix = prefixes[type];
    if (!prefix || typeof identity !== 'string' || !identity.startsWith(prefix)) {
      throw new Error(`Refusing to manage ${type}: identity does not prove current-run ownership.`);
    }
  }

  save() {
    fs.mkdirSync(cacheDirectory, { recursive: true });
    const temporaryPath = `${this.manifestPath}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(this.manifest, null, 2), { mode: 0o600 });
    fs.renameSync(temporaryPath, this.manifestPath);
  }
}

module.exports = {
  TestDataManager,
  createRunId,
  getRunContext,
  isLocalTestTarget,
  runContextPath,
};
