require('dotenv').config();

const fs = require('fs');
const path = require('path');
const testCases = require('../data/test-cases');
const { getRunContext } = require('../helpers/test-data-manager');

const reportsDir = path.join(__dirname, '..', 'reports');
const jsonPath = path.join(__dirname, '..', 'test-results', 'playwright-results.json');
if (!fs.existsSync(jsonPath)) {
  throw new Error('Playwright JSON report is missing; refusing to generate a stale or fabricated summary.');
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const testResults = new Map();
const knownIds = new Set(testCases.map((item) => item.id));
const secretValues = [process.env.ADMIN_PASSWORD, process.env.TEST_ADMIN_PASSWORD, process.env.TEST_API_TOKEN]
  .filter((value) => typeof value === 'string' && value.length > 0);

function redact(value) {
  let text = String(value || '');
  for (const secret of secretValues) text = text.split(secret).join('[REDACTED]');
  return text.replace(/(Bearer\s+)[^\s"'<>]+/gi, '$1[REDACTED]')
    .replace(/(password\s*[:=]\s*)[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/(session(?:id)?\s*[:=]\s*)[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/[\r\n]+/g, ' ')
    .slice(0, 700);
}

function getCaseId(title) {
  const match = String(title || '').match(/^(AUTH-\d{2}|AUTHZ-\d{2}|ASSET-\d{2}|API-\d{2}|COOKIE-\d{2})/);
  return match && knownIds.has(match[1]) ? match[1] : null;
}

function collectSuites(suites) {
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const id = getCaseId(spec.title) || getCaseId(test.title);
        if (!id) continue;
        const latest = test.results && test.results.length
          ? test.results[test.results.length - 1]
          : null;
        if (!latest) continue;
        const annotations = [...(test.annotations || []), ...(spec.annotations || [])];
        const current = testResults.get(id) || { statuses: [], duration: 0, actual: [], reasons: [], observations: [] };
        current.statuses.push(latest.status);
        current.duration += latest.duration || 0;
        if (latest.status !== 'skipped' && latest.error && latest.error.message) {
          current.actual.push(redact(latest.error.message));
        }
        if (latest.status === 'passed') current.actual.push('Các assertion của test đã thực thi thành công.');
        for (const annotation of annotations) {
          if (annotation.type === 'skip' && annotation.description) current.reasons.push(redact(annotation.description));
          if (/observation/.test(annotation.type) && annotation.description) {
            current.observations.push(redact(annotation.description));
          }
          if (latest.status === 'skipped' && !current.reasons.length && latest.error && latest.error.message) {
            current.reasons.push(redact(latest.error.message));
          }
        }
        testResults.set(id, current);
      }
    }
    collectSuites(suite.suites);
  }
}

collectSuites(data.suites);

function summarizeStatus(result, id) {
  if (!result || !result.statuses.length) return 'NOT RUN';
  if (result.statuses.some((status) => status === 'failed' || status === 'timedOut' || status === 'interrupted')) return 'FAIL';
  if (result.statuses.some((status) => status === 'skipped')) return id === 'AUTH-04' ? 'SKIPPED' : 'BLOCKED';
  if (result.statuses.every((status) => status === 'passed')) return 'PASS';
  return 'NOT RUN';
}

const rows = testCases.map((item) => {
  const result = testResults.get(item.id);
  const status = summarizeStatus(result, item.id);
  let actual = result && result.actual.length ? result.actual.join(' | ') : '';
  if (status === 'BLOCKED' && result && result.reasons.length) {
    actual = `BLOCKED: ${[...new Set(result.reasons.map((reason) => reason.replace(/^BLOCKED:\s*/i, '')))].join('; ')}`;
  }
  if (status === 'SKIPPED' && result && result.reasons.length) {
    actual = `SKIPPED: ${[...new Set(result.reasons.map((reason) => reason.replace(/^SKIPPED:\s*/i, '')))].join('; ')}`;
  }
  if (result && result.observations.length) actual = [actual, ...result.observations].filter(Boolean).join(' | ');
  if (!actual) actual = status === 'NOT RUN' ? 'Test chưa được chạy trong lần này.' : `Result: ${status}`;
  return {
    id: item.id,
    name: item.name,
    status,
    expected: item.objective,
    actual: redact(actual),
    duration: result ? result.duration : 0,
    evidence: status === 'FAIL' ? 'Playwright HTML report; trace/screenshot tắt để bảo vệ credential.'
      : status === 'PASS' ? 'Playwright assertion; quan sát runtime không chứa secret.'
        : status === 'BLOCKED' ? 'Lý do cấu hình/precondition ở Actual Result; chi tiết trong TEST_DATA_REQUIREMENTS.md.'
          : status === 'SKIPPED' ? 'Chủ động không chạy vì giới hạn an toàn.'
            : 'NOT RUN',
  };
});

const runContext = getRunContext();
const cacheDirectory = path.join(__dirname, '..', '.cache');
const runHistoryPath = path.join(cacheDirectory, 'run-history.json');
fs.mkdirSync(reportsDir, { recursive: true });
const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const csvHeader = 'Test Case ID,Test Case Name,Status,Expected Result,Actual Result,Duration (ms),Evidence';
const csvRows = rows.map((row) =>
  [row.id, row.name, row.status, row.expected, row.actual, row.duration, row.evidence].map(csvEscape).join(',')
);
fs.writeFileSync(path.join(reportsDir, 'test-results.csv'), `${csvHeader}\r\n${csvRows.join('\r\n')}\r\n`);

const counts = rows.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {});
const table = rows.map((row) =>
  `| ${row.id} | ${row.name} | ${row.status} | ${row.expected} | ${row.actual} | ${row.duration} ms | ${row.evidence} |`
).join('\n');
const cleanup = runContext.cleanup || [];
const cleanupSummary = cleanup.length
  ? cleanup.map((entry) => `${entry.type}: ${entry.result}`).join(', ')
  : 'Không có đối tượng do run này tạo để dọn.';
const baselineRows = Object.entries(runContext.baseline || {}).map(([key, result]) =>
  `| ${key} | ${Number.isInteger(result.count) ? result.count : 'unverified'} | ${result.fingerprint ? 'verified' : 'unverified'} |`
);
const history = fs.existsSync(runHistoryPath)
  ? JSON.parse(fs.readFileSync(runHistoryPath, 'utf8'))
  : [];
const runRecord = {
  runId: runContext.runId,
  startedAt: runContext.startedAt,
  finishedAt: runContext.finishedAt || null,
  adminVerified: Boolean(runContext.adminVerified),
  counts,
  cleanup: cleanupSummary,
};
const priorRunIndex = history.findIndex((entry) => entry.runId === runRecord.runId);
if (priorRunIndex >= 0) history[priorRunIndex] = runRecord;
else history.push(runRecord);
fs.mkdirSync(cacheDirectory, { recursive: true });
fs.writeFileSync(runHistoryPath, JSON.stringify(history.slice(-10), null, 2), { mode: 0o600 });
const historyRows = history.slice(-2).map((entry) =>
  `| ${entry.runId} | ${entry.adminVerified ? 'verified' : 'not verified'} | ${entry.counts.PASS || 0} | ${entry.counts.FAIL || 0} | ${entry.counts.BLOCKED || 0} | ${entry.counts.SKIPPED || 0} | ${entry.counts['NOT RUN'] || 0} |`
);
fs.writeFileSync(path.join(reportsDir, 'test-summary.md'), [
  '# Test Summary - latest run',
  '',
  `RUN_ID: ${runContext.runId}`,
  `Run started: ${runContext.startedAt}`,
  `Report generated: ${new Date().toISOString()}`,
  `Admin Superuser verified: ${runContext.adminVerified ? 'yes' : 'no'}`,
  `Cleanup: ${cleanupSummary}`,
  '',
  '| Baseline data | Record count | Fingerprint |',
  '|---|---:|---|',
  ...baselineRows,
  '',
  '| Status | Count |',
  '|---|---:|',
  `| PASS | ${counts.PASS || 0} |`,
  `| FAIL | ${counts.FAIL || 0} |`,
  `| BLOCKED | ${counts.BLOCKED || 0} |`,
  `| SKIPPED | ${counts.SKIPPED || 0} |`,
  `| NOT RUN | ${counts['NOT RUN'] || 0} |`,
  `| Total | ${rows.length} |`,
  '',
  '| Recent run history | Admin preflight | PASS | FAIL | BLOCKED | SKIPPED | NOT RUN |',
  '|---|---|---:|---:|---:|---:|---:|',
  ...historyRows,
  '',
  '| Test Case ID | Test Case Name | Status | Expected Result | Actual Result | Duration | Evidence |',
  '|---|---|---|---|---|---:|---|',
  table,
  '',
].join('\n'));
