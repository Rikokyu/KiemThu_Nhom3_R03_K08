const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const automationRoot = path.resolve(__dirname, '..');
const packageRoot = path.dirname(require.resolve('@playwright/test'));
const playwrightCli = path.join(packageRoot, 'cli.js');
const generatedFiles = [
  path.join(automationRoot, 'test-results', 'playwright-results.json'),
  path.join(automationRoot, 'reports', 'test-summary.md'),
  path.join(automationRoot, 'reports', 'test-results.csv'),
];

for (const file of generatedFiles) {
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

const testRun = spawnSync(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)], {
  cwd: automationRoot,
  stdio: 'inherit',
});
const reportRun = spawnSync(process.execPath, [path.join(__dirname, 'generate-tc-summary.js')], {
  cwd: automationRoot,
  stdio: 'inherit',
});

if (testRun.error) throw testRun.error;
if (reportRun.error) throw reportRun.error;
const testExitCode = testRun.status === null ? 1 : testRun.status;
const reportExitCode = reportRun.status === null ? 1 : reportRun.status;
process.exitCode = testExitCode || reportExitCode;
