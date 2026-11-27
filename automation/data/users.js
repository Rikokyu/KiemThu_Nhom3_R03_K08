module.exports = {
  admin: {
    usernameEnv: 'ADMIN_USERNAME',
    passwordEnv: 'ADMIN_PASSWORD',
  },
  user: {
    usernameEnv: 'TEST_USER_USERNAME',
    passwordEnv: 'TEST_USER_PASSWORD',
  },
  inactive: {
    usernameEnv: 'TEST_INACTIVE_USERNAME',
    passwordEnv: 'TEST_INACTIVE_PASSWORD',
  },
  reusableAccounts: {
    user: 'pw_user',
    limited: 'pw_limited',
    restricted: 'pw_restricted',
    company_b: 'pw_company_b',
    api: 'pw_api',
  },
};
