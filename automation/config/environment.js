function readRequired(name) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

function readBoolean(name) {
  const value = readRequired(name);
  if (value === null) return null;
  if (/^(true|1|yes)$/i.test(value)) return true;
  if (/^(false|0|no)$/i.test(value)) return false;
  throw new Error(`${name} must be a boolean value.`);
}

module.exports = {
  baseURL: readRequired('BASE_URL') || 'http://localhost:8000',
  adminUsername: readRequired('ADMIN_USERNAME') || readRequired('TEST_ADMIN_USERNAME'),
  adminPassword: readRequired('ADMIN_PASSWORD') || readRequired('TEST_ADMIN_PASSWORD'),
  expectedCookieSecure: readBoolean('TEST_EXPECT_COOKIE_SECURE'),
  expectedCookieHttpOnly: readBoolean('TEST_EXPECT_COOKIE_HTTP_ONLY'),
  expectedCookieSameSite: readRequired('TEST_EXPECT_COOKIE_SAME_SITE'),
};
