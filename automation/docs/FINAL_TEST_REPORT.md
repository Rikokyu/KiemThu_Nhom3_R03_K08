# Final Playwright Test Report

## A. Overview

The 29 agreed case IDs were run twice against the local Snipe-IT instance.
The totals below count each fixed case ID once; ASSET-04 expands into five
Playwright subtests and the run also includes a connection smoke check.

| Latest full run | Count |
|---|---:|
| Total case IDs | 29 |
| PASS | 26 |
| FAIL | 1 |
| BLOCKED | 2 |
| SKIPPED | 0 |
| NOT RUN | 0 |

No test was marked PASS solely because an HTTP request returned 200. Tests
assert response/business semantics and read back mutated records where
applicable.

## B. Results by group

| Group | PASS | FAIL | BLOCKED | SKIPPED | Total |
|---|---:|---:|---:|---:|---:|
| AUTH | 6 | 0 | 0 | 0 | 6 |
| AUTHZ | 5 | 0 | 1 | 0 | 6 |
| ASSET | 6 | 1 | 0 | 0 | 7 |
| API | 6 | 0 | 0 | 0 | 6 |
| COOKIE | 3 | 0 | 1 | 0 | 4 |
| **Total** | **26** | **1** | **2** | **0** | **29** |

## C. Repeatability and cleanup

| Run | RUN_ID | PASS | FAIL | BLOCKED | SKIPPED | NOT RUN |
|---|---|---:|---:|---:|---:|---:|
| Full run 1 | `20261127141228-F92D1A` | 25 | 2 | 2 | 0 | 0 |
| Full run 2 | `20261127141633-ACA2D0` | 26 | 1 | 2 | 0 | 0 |

The first run also exposed API-03 token-name length failure. The generated
token name was shortened; API-03 then passed in both its targeted check and
the second full run. ASSET-04 failed in both full runs for the same live
application behavior.

Both runs completed manifest-driven cleanup and matched the before/after
active-inventory counts and identity fingerprints:

| Data | Active records | Post-cleanup |
|---|---:|---|
| Models | 18 | fingerprint matched |
| Status Labels | 7 | fingerprint matched |
| Categories | 20 | fingerprint matched |
| Companies | 111 | fingerprint matched |
| Locations | 21 | fingerprint matched |
| Users | 2,107 | fingerprint matched |
| Groups | 1 | fingerprint matched |
| Assets | 2,559 | fingerprint matched |

The database contains 2,609 Assets in total; the active API inventory omits
50 Archived Assets. Run-owned users and Assets may remain as soft-deleted
records, and revoked token rows may persist according to Snipe-IT behavior.
No pre-existing active records were changed or removed; cleanup ownership
checks and inventory fingerprints were verified. No seeder, reset, or
destructive migration was run.

## D. Failure and blocked details

### ASSET-04 — FAIL

- **Expected:** reject warranty values above the supported 0–240 range.
- **Actual:** the instance accepts `warranty_months=241`.
- **Evidence:** repeatable boundary assertion failure in both full runs; other
  tested malformed/oversized values were rejected.
- **Cause:** the app's declared `digits_between:0,240` rule checks digit count,
  not a numeric maximum.
- **Action:** fix and validate the Snipe-IT application rule, then rerun the
  unchanged test. No application source changes were made as part of this
  automation work.

### AUTHZ-06 — BLOCKED

- **Reason:** `full_multiple_companies_support` (FMCS) is disabled; company
  scoping cannot be tested truthfully.
- **Unblock:** use an explicitly configured FMCS test environment with
  verified separate Company/user/Asset fixtures. Automation did not change
  system configuration.

### COOKIE-04 — BLOCKED

- **Reason:** target URL is HTTP, so Secure cookie behavior cannot be assessed.
- **Unblock:** supply an HTTPS Snipe-IT test endpoint and approved cookie
  expectations. The observed HTTP cookie had `Secure=false`, `HttpOnly=true`,
  and `SameSite=Lax`; this is not reported as a Secure pass.

No case IDs are unimplemented or skipped. The detailed 29-case mapping and
per-case evidence are in `TEST_CASE_IMPLEMENTATION_REPORT.md`.

## E. Stability and limitations

- Both complete runs finished and returned active inventory to the original
  fingerprint, establishing repeatability for the tested environment.
- Per-test fixtures make cases independently selectable without relying on
  another test's data. The runner uses one worker to reduce rate-limit
  pressure.
- API list reads are paginated and use stable ascending IDs. Mutations check
  JSON business results and verify created/updated/deleted state.
- Cleanup is ownership-checked and resumable from the current run manifest.
  Snipe-IT soft-delete behavior means deleted run-owned rows can persist in
  storage; automation never purges them.
- AUTHZ-06 and COOKIE-04 require environment changes outside this task.
  ASSET-04 is an application defect, not a test-data prerequisite.
- Screenshots and traces are disabled; no credentials, cookies, or token
  values are included in reports.

## F. How to run

1. Start the intended local Snipe-IT instance.
2. From `automation/`, install dependencies if needed:

   ```powershell
   npm install
   ```

3. Copy `.env.example` to `.env` and set `BASE_URL`,
   `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. `.env` is ignored by Git.
4. Run the preflight/test suite:

   ```powershell
   npm run test:list
   npm run test:full
   ```

5. To run a group: `npm run test:auth`, `test:authz`, `test:asset`,
   `test:api`, or `test:cookie`. Run a single ID with
   `npm run test:case -- "AUTH-01"`.
6. To resume verified cleanup for the current manifest, run
   `npm run test:data-cleanup`.
7. View `reports/test-summary.md`, `reports/index.html`, and
   `test-results/playwright-results.json`; do not share `.env` or `.cache`.

Global setup verifies Superuser access before preparing test data and stops
if authentication or authorization verification fails.
