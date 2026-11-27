# Test Data Requirements

## Live instance baseline

The test environment is Snipe-IT `http://localhost:8000`. The latest
pre-run inventory snapshot used for the two complete suite runs reported:

| Record type | Active API records | Notes |
|---|---:|---|
| Models | 18 | Resolve active model dynamically; do not assume an ID. |
| Status Labels | 7 | Resolve a deployable status dynamically. |
| Categories | 20 | Existing asset categories are available. |
| Companies | 111 | FMCS company scoping is disabled. |
| Locations | 21 | Existing locations are available. |
| Users | 2,107 | Active API users; the configured Admin was verified as Superuser. |
| Groups | 1 | Existing group is read-only fixture data. |
| Assets | 2,559 | Active API assets; database total was 2,609, including 50 archived assets. |

These are observed environment counts, not seeded assumptions; counts can
change. The reports record the run IDs and inventory fingerprints for the
validated runs. No catalog, user, group, or asset fixture from this baseline
is modified or deleted. Per-run disposable accounts and assets are
soft-deleted by Snipe-IT during cleanup and are not part of active counts.

The initial investigation found no usable active API token. The test flow
creates short-lived, per-owner tokens through the authenticated personal
token endpoint, verifies their use, and revokes them during cleanup. Never
include token values in this document or logs.

## Prerequisites and how to verify

1. Start the intended local Snipe-IT instance and confirm it is reachable.
2. Create `automation/.env` from `.env.example`, then set:
   - `BASE_URL=http://localhost:8000`
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD` to the authorized test credentials.
3. Run `npm run test:list` from `automation/` to verify test discovery.
4. Run `npm run test:full`. Global setup authenticates first and confirms
   Superuser access before inventory or test data preparation. On failure it
   stops; it does not fall back to a presumed Admin.
5. Review `reports/test-summary.md` and the run manifest for inventory and
   cleanup verification. Do not copy secret-bearing `.env` or cache files
   into reports or Git.

## Asset and user field requirements

- Asset creation requires a valid Model and deployable Status Label resolved
  from the live instance. Test fixtures also select a compatible Category and
  required Company/Location values where the test path demands them.
- Web Asset forms submit `asset_tags[1]` and `serials[1]`; API creation uses
  `asset_tag` and `serial`. The helper chooses unique `AUTO-TEST-<RUN_ID>-...`
  tags and reads the created record back.
- Test Users receive unique `pw_<RUN_ID>_...` usernames and a generated
  password. Required Company and permission/group settings are assigned only
  to run-owned users. The Superuser account is never used as a permission-test
  substitute or eligible for cleanup.
- Token permissions are scoped to the owning test user. Tokens are run-owned,
  read/use-verified, then revoked and confirmed inactive.

## API access and pagination

All inventory reads require a valid Bearer token with read permission for the
resource. Test setup uses the configured Superuser session only after
interactive Superuser verification. Test API cases use individual user tokens
so authorization behavior is tested as that user.

| Data | Read endpoint (GET) | Write endpoint used by test setup | Pagination |
|---|---|---|---|
| Models | `/api/v1/models` | None; baseline catalog is read-only | Yes; follow response pagination and stable `sort=id&order=asc`. |
| Status Labels | `/api/v1/statuslabels` | None; baseline catalog is read-only | Yes; follow pagination. |
| Categories | `/api/v1/categories` | None; baseline catalog is read-only | Yes; follow pagination. |
| Companies | `/api/v1/companies` | None; baseline catalog is read-only | Yes; follow pagination. |
| Locations | `/api/v1/locations` | None; baseline catalog is read-only | Yes; follow pagination. |
| Users | `/api/v1/users` | UI provisioning; cleanup via `/api/v1/users/{id}` | Yes; follow pagination. |
| Groups | `/api/v1/groups` | UI provisioning; cleanup via `/api/v1/groups/{id}` | Yes; follow pagination. |
| Assets | `/api/v1/hardware` | `/api/v1/hardware` POST/PUT/DELETE | Yes; follow pagination. |
| Personal tokens | `/api/v1/account/personal-access-tokens` | Same endpoint POST/DELETE | Endpoint returns the authenticated user's tokens; token values are only available at creation and are never logged. |

Pagination is driven by the response metadata/next-page URL until exhausted;
the inventory client requests ascending IDs to avoid unstable default Asset
ordering. A complete inventory read uses the endpoint's returned records,
not only its first page. API status alone is not treated as success: helpers
validate JSON status/error fields and read back mutations.

## Known environment blockers

- `AUTHZ-06` needs company-scoped access (FMCS); the feature is disabled on
  this instance. Enabling it is an administrator/system configuration action
  and is intentionally not performed by automation.
- `COOKIE-04` requires HTTPS to verify Secure cookie behavior. The configured
  instance uses HTTP; no simulated PASS is reported.
- `ASSET-04` tests the 241 warranty-month boundary. It currently demonstrates
  a live application validation defect: Snipe-IT accepts 241 despite the
  declared `digits_between:0,240` rule. It remains FAIL rather than weakening
  the assertion.
