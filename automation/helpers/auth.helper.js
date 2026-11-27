const { fillSensitiveField } = require('./user-provisioner');

async function login(page, baseURL, username, password) {
  await page.goto(`${baseURL}/login`);
  await page.locator('input[name="username"], input#username').first().fill(username);
  await fillSensitiveField(page.locator('input[name="password"], input#password').first(), password, 'login password');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  if (/\/login(?:\?|$)/i.test(new URL(page.url()).pathname)) {
    throw new Error('Login failed.');
  }
  return page;
}

async function logout(page) {
  const csrfToken = await page.locator('meta[name="csrf-token"]').getAttribute('content');
  if (!csrfToken) {
    throw new Error('Cannot logout safely: CSRF token is unavailable.');
  }
  const result = await page.evaluate(async (token) => {
    const response = await fetch('/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'X-CSRF-TOKEN': token },
    });
    return {
      status: response.status,
      path: new URL(response.url).pathname,
      redirected: response.redirected,
    };
  }, csrfToken);
  if (result.status < 200 || result.status >= 400 ||
      !result.redirected || !/\/login(?:\/|$)/i.test(result.path)) {
    throw new Error(`Logout did not end at the login page (HTTP ${result.status}, ${result.path}).`);
  }
}

module.exports = { login, logout };
