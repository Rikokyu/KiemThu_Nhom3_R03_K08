require('dotenv').config();

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.js',
  globalTeardown: './global-teardown.js',

  timeout: 180_000,

  expect: {
    timeout: 5_000,
  },

  fullyParallel: false,

  workers: 1,

  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['html', { outputFolder: 'reports', open: 'never' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8000',

    browserName: 'chromium',

    headless: true,

    screenshot: 'off',
    trace: 'off',
  },
});