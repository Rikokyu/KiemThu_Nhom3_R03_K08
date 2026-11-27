# Test Case Implementation Report

## Summary

- Fixed test-case IDs: **29**.
- Latest complete run (`20261127141633-ACA2D0`): **26 PASS, 1 FAIL,
  2 BLOCKED, 0 SKIPPED, 0 NOT RUN**.
- All cases have an implementation and an explicit second-run outcome.
- The runner uses one worker to limit load, but each case provisions its own
  run-scoped data and is selectable independently; there are no cross-case
  data dependencies.
- ASSET-04 is represented by five Playwright subtests. The generated run also
  includes one connection smoke check, so the Playwright execution count is
  larger than the fixed 29 case IDs.

## Case register

| ID | Status | Test file | Account/data and verified result |
|---|---|---|---|
| AUTH-01 | PASS | `tests/auth/auth-login.spec.js` | Configured Superuser; valid login and authenticated page. |
| AUTH-02 | PASS | `tests/auth/auth-login.spec.js` | Invalid credentials; login rejected. |
| AUTH-03 | PASS | `tests/auth/auth-login.spec.js` | Run-owned inactive user; authentication rejected. |
| AUTH-04 | PASS | `tests/auth/auth-throttle.spec.js` | Disposable run-owned user; bounded failed-login attempts trigger throttle. |
| AUTH-05 | PASS | `tests/auth/auth-session.spec.js` | Anonymous context; protected hardware page requires authentication. |
| AUTH-06 | PASS | `tests/auth/auth-session.spec.js` | Fresh login/logout; replayed old session no longer accesses protected page. |
| AUTHZ-01 | PASS | `tests/authz/authz-view.spec.js` | Verified Superuser can access asset administration. |
| AUTHZ-02 | PASS | `tests/authz/authz-view.spec.js` | Run-owned user without `assets.view`; access denied. |
| AUTHZ-03 | PASS | `tests/authz/authz-edit.spec.js` | Run-owned edit-denied user; update denied and asset unchanged. |
| AUTHZ-04 | PASS | `tests/authz/authz-delete.spec.js` | Run-owned delete-denied user; delete denied and asset remains. |
| AUTHZ-05 | PASS | `tests/authz/authz-company.spec.js` | Run-owned Group allows and user's personal permission denies; effective access denied. |
| AUTHZ-06 | BLOCKED | `tests/authz/authz-company.spec.js` | Needs FMCS and verified distinct Company fixtures; FMCS is disabled. No system setting changed. |
| ASSET-01 | PASS | `tests/asset/asset-create.spec.js` | Dynamic Model/Status; unique run-owned Asset created and read back. |
| ASSET-02 | PASS | `tests/asset/asset-create.spec.js` | Missing required fields rejected; no matching Asset created. |
| ASSET-03 | PASS | `tests/asset/asset-create.spec.js` | Duplicate run tag rejected; original Asset remains. |
| ASSET-04 | FAIL | `tests/asset/asset-validation.spec.js` | Five boundary/format subtests; 241 warranty months were accepted, violating the declared 0–240 constraint. Other tested invalid inputs were rejected. |
| ASSET-05 | PASS | `tests/asset/asset-update.spec.js` | Run-owned Asset update read back with expected value. |
| ASSET-06 | PASS | `tests/asset/asset-update.spec.js` | Invalid/nonexistent Asset update returns a business error; no unintended record change. |
| ASSET-07 | PASS | `tests/asset/asset-delete.spec.js` | Run-owned Asset soft-deleted; active listing confirms it is absent. |
| API-01 | PASS | `tests/api/api-auth.spec.js` | Missing Bearer credential rejected with unauthorized JSON. |
| API-02 | PASS | `tests/api/api-auth.spec.js` | Invalid Bearer credential rejected with unauthorized JSON. |
| API-03 | PASS | `tests/api/api-permission.spec.js` | Run-owned token owner verified; missing `assets.create` permission rejected by business response. |
| API-04 | PASS | `tests/api/api-asset.spec.js` | Run-owned token creates Asset; JSON success and readback identity verified. |
| API-05 | PASS | `tests/api/api-asset.spec.js` | Invalid/duplicate creation rejected by API business result; no extra Asset. |
| API-06 | PASS | `tests/api/api-asset.spec.js` | Update to verified nonexistent ID returns JSON business error. |
| COOKIE-01 | PASS | `tests/cookie/cookie-session.spec.js` | Actual session cookie checked: HttpOnly true, SameSite Lax, Secure false on HTTP. |
| COOKIE-02 | PASS | `tests/cookie/cookie-session.spec.js` | Session changes after login and is unusable after logout. |
| COOKIE-03 | PASS | `tests/cookie/cookie-csrf.spec.js` | Missing-CSRF web POST creates no Asset; valid-CSRF control creates one, then cleanup verifies removal. |
| COOKIE-04 | BLOCKED | `tests/cookie/cookie-csrf.spec.js` | Secure-cookie assertion requires HTTPS; configured target is HTTP. No simulated PASS. |

## Dependency and cleanup model

The original design considered a shared Asset and a fixed ordered cycle. The
implemented design avoids those cross-case dependencies:

- Every test that mutates data asks the Test Data Manager for a fresh
  run-prefixed fixture; its own assertions and teardown own the complete
  lifecycle.
- Permission cases create distinct run-owned users/groups/tokens with the
  relevant individual and group permissions. The Superuser is never used as
  an ordinary-user substitute.
- API tokens are created for their owning test user, checked without exposing
  their value, and revoked during teardown.
- Asset tests use dynamically selected catalog records and unique tags. Tests
  that need a duplicate create that duplicate only against their own asset.
- Cleanup is performed in fixture teardown and retried from the run manifest
  by global teardown. Exact run ownership and identity are revalidated before
  each destructive operation. Existing data and catalog records are never
  eligible for cleanup.
- All eight active inventory fingerprints matched their pre-run values in
  both complete runs.

## Runs and evidence

| Full run | RUN_ID | PASS | FAIL | BLOCKED | SKIPPED | NOT RUN | Finding |
|---|---|---:|---:|---:|---:|---:|---|
| 1 | `20261127141228-F92D1A` | 25 | 2 | 2 | 0 | 0 | API-03 token name exceeded the database limit; ASSET-04 warranty validation accepted 241. |
| 2 | `20261127141633-ACA2D0` | 26 | 1 | 2 | 0 | 0 | API-03 passed after token-name shortening; ASSET-04 issue reproduced. |

The result summaries and run manifests contain no credentials, session
cookies, CSRF values, or bearer-token values. The detailed second-run summary
is `../reports/test-summary.md`; lifecycle evidence is in
`TEST_DATA_IMPLEMENTATION_REPORT.md`.

## Failures, blocks, and next actions

- **ASSET-04 — FAIL:** the live application accepted warranty value 241 even
  though the relevant validation rule declares `digits_between:0,240`. Fix
  belongs in the Snipe-IT application; changing that application is outside
  this automation task. Keep the assertion failing until the application
  enforces the intended numeric bound.
- **AUTHZ-06 — BLOCKED:** enable/configure FMCS only in an explicitly prepared
  test environment and provide verified separate company-scoped fixtures.
- **COOKIE-04 — BLOCKED:** provide an HTTPS test endpoint and approved cookie
  policy; do not infer Secure behavior from HTTP.
- **Not automated:** none of the 29 IDs is unimplemented or skipped. The
  above two are implemented precondition checks and currently BLOCKED, not
  missing test code.
