# Snipe-IT Playwright Automation

## Setup

```powershell
cd automation
npm install
Copy-Item .env.example .env
```

Set `BASE_URL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` in the ignored `.env`.
The runner authenticates the configured account and verifies Superuser access
before test execution. It rejects non-loopback targets and does not print or
report credentials, cookies, or API token values.

## Commands

```powershell
npm run test:list
npm run test:auth
npm run test:authz
npm run test:asset
npm run test:api
npm run test:cookie
npm run test:full
npm run test:report
```

Run one case with, for example:

```powershell
npm run test:case -- "AUTH-01"
```

## Data lifecycle

Global setup takes a paginated inventory baseline and resolves the live Model
and deployable Status Label dynamically. Each test receives a unique `RUN_ID`;
its fixture creates only the required run-prefixed users, groups, tokens, and
Assets. A manifest records object identities and IDs. Fixture teardown and
global teardown verify ownership before cleanup, then compare the active
inventory with the baseline. Cleanup is repeatable and resumable with
`npm run test:data-cleanup`.

Run-owned users are soft-deleted by Snipe-IT and API tokens are
revoked; run-owned Assets may be soft-deleted. They are excluded from active
inventory, while all pre-existing sample records remain untouched. No seeder
or database reset is used.

## Reports and known environment blocks

- HTML: `automation/reports/index.html`
- JSON: `automation/test-results/playwright-results.json`
- Markdown/CSV summary: `automation/reports/test-summary.md` and `test-results.csv`
- Required implementation reports: `automation/docs/TEST_CASE_IMPLEMENTATION_REPORT.md`
  and `automation/docs/FINAL_TEST_REPORT.md`

`AUTHZ-06` requires FMCS to already be enabled and is BLOCKED on the current
instance. `COOKIE-04` requires HTTPS and is BLOCKED on the configured HTTP
instance. `TEST_DATA_REQUIREMENTS.md` and `TEST_DATA_MANAGEMENT.md` document
live prerequisites and cleanup safeguards.
