const { test: base } = require('./test-data.fixture');
const { assetWriter } = require('../data/permissions');

exports.test = base.extend({
  apiContext: async ({ testDataManager }, use) => {
    const user = await testDataManager.ensureUser('api_fixture_writer', {
      permissions: assetWriter,
    });
    const context = await testDataManager.getApiContext(user);
    await use(context);
  },
});
