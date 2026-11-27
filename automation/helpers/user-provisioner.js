const crypto = require('crypto');
const { listAllRows } = require('./snipe-client');

class FixtureBlockedError extends Error {}

function createPassword() {
  return `Aa1!${crypto.randomBytes(24).toString('hex')}Zz9#`;
}

async function fillSensitiveField(locator, value, label) {
  try {
    await locator.click();
    await locator.fill(value);
  } catch (error) {
    throw new Error(`Could not populate the ${label} field (${error.name}).`);
  }
}

async function createManagedUser(adminPage, manager, role, options = {}) {
  const username = manager.username(role);
  const existing = await listAllRows(adminPage, '/api/v1/users', { username });
  if (existing.some((user) => user.username === username)) {
    throw new Error('Run-scoped username already exists; refusing to reuse or modify an unowned account.');
  }

  const active = options.active !== false;
  const password = createPassword();
  manager.recordPending('user', username, { role, retained: false });
  manager.saveRunSecrets({ username, password });

  const response = await adminPage.goto(`${manager.runContext.baseURL}/users/create`);
  if (!response || response.status() >= 400) {
    throw new Error('User creation form could not be opened.');
  }
  const form = adminPage.locator('form').filter({ has: adminPage.locator('input[name="first_name"]') });
  await form.locator('input[name="first_name"]').fill('PW-AUTO');
  await form.locator('input[name="last_name"]').fill(manager.runId);
  const usernameInput = form.locator('input#username');
  await usernameInput.click();
  await usernameInput.fill(username);

  const activeCheckbox = form.locator('input[name="activated"]');
  if (!(await activeCheckbox.isChecked())) await activeCheckbox.check();
  await fillSensitiveField(form.locator('input[name="password"]'), password, 'new-user password');
  await fillSensitiveField(form.locator('input[name="password_confirmation"]'), password, 'new-user password confirmation');
  await fillSensitiveField(form.locator('input[name="email"]'), `${username}@example.invalid`, 'test-user email');

  if (options.groupIds && options.groupIds.length) {
    const groups = form.locator('select[name="groups[]"]');
    await groups.selectOption(options.groupIds.map((id) => String(id)));
  }

  const permissions = {
    superuser: -1,
    admin: -1,
    ...(options.permissions || {}),
  };
  for (const [permission, value] of Object.entries(permissions)) {
    const control = form.locator(`input[name="permission[${permission}]"][value="${value}"]`);
    if (await control.count() !== 1) {
      throw new FixtureBlockedError(`User form does not expose the expected ${permission} permission control.`);
    }
    const controlId = await control.getAttribute('id');
    const label = form.locator(`label[for="${controlId}"]`);
    if (await label.count() !== 1) {
      throw new FixtureBlockedError(`User form has no control for the ${permission} permission.`);
    }
    await label.evaluate((element) => element.click());
    if (!(await control.isChecked())) {
      throw new Error(`Could not select the configured ${permission} permission.`);
    }
  }

  if (!active && await activeCheckbox.isChecked()) await activeCheckbox.uncheck();
  await form.locator('button[type="submit"]').first().click();
  await adminPage.waitForLoadState('domcontentloaded');
  const createdUsers = await listAllRows(adminPage, '/api/v1/users', { username });
  const matches = createdUsers.filter((user) => user.username === username);
  if (matches.length !== 1) {
    throw new Error('User creation did not produce exactly one matching account.');
  }

  const user = matches[0];
  manager.registerCreatedUser(user.id, username, {
    role,
    retained: false,
    groupIds: (options.groupIds || []).map(String),
  });
  const editResponse = await adminPage.goto(`${manager.runContext.baseURL}/users/${user.id}/edit`);
  const savedUsername = await adminPage.locator('input[name="username"]').last().inputValue().catch(() => '');
  const permissionChecks = await Promise.all(Object.entries(permissions).map(([permission, value]) =>
    adminPage.locator(`input[name="permission[${permission}]"][value="${value}"]`).isChecked()
  ));
  const activated = await adminPage.locator('input[name="activated"]').isChecked().catch(() => false);
  const savedGroupIds = await adminPage.locator('select[name="groups[]"]')
    .evaluate((select) => [...select.selectedOptions].map((option) => option.value))
    .catch(() => []);
  const requestedGroups = (options.groupIds || []).map(String);
  if (!editResponse || editResponse.status() >= 400 || savedUsername !== username ||
      permissionChecks.some((checked) => !checked) || activated !== active ||
      requestedGroups.some((id) => !savedGroupIds.includes(id))) {
    throw new Error('Created account identity, activation, or requested permissions did not persist.');
  }

  return { id: String(user.id), username, password, active };
}

async function loginManagedUser(browser, baseURL, user) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseURL}/login`);
  await page.locator('input[name="username"], input#username').first().fill(user.username);
  await fillSensitiveField(
    page.locator('input[name="password"], input#password').first(),
    user.password,
    'test-user login password'
  );
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  if (/\/login(?:\?|$)/i.test(new URL(page.url()).pathname)) {
    await context.close();
    throw new Error('Run-scoped test account could not log in.');
  }
  return { context, page };
}

module.exports = { FixtureBlockedError, createManagedUser, fillSensitiveField, loginManagedUser };
