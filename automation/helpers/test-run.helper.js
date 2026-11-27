const testCases = require('../data/test-cases');

function annotateCase(testInfo, id, reason) {
  testInfo.annotations.push({ type: 'tc-id', description: id });
  if (reason) testInfo.annotations.push({ type: 'block-reason', description: reason });
}

function findCase(id) {
  return testCases.find((item) => item.id === id);
}

function missingCredentials(username, password, label) {
  if (username && password) return null;
  return `Thiếu credential cấu hình cho ${label}`;
}

module.exports = { annotateCase, findCase, missingCredentials };
