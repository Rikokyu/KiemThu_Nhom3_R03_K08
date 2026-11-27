# Test Data Management

## Run identity and manifest

`global-setup.js` creates a unique `RUN_ID` only after a successful Admin login
and live Superuser verification. It records the baseline inventory and dynamic
Asset catalog fixture in `automation/.cache/current-run.json`. Every created
object is registered in `automation/.cache/managed-data-<RUN_ID>.json` with its
type, exact identity, ID, ownership metadata, state, and cleanup result.

Run-owned Usernames start with `pw_<RUN_ID>_`; Asset Tags and Group/token names
start with `AUTO-TEST-<RUN_ID>-`. API tokens are named uniquely per owner. The
manifest contains no password, session cookie, CSRF value, or token value.
Generated account passwords are held only in an ignored, permission-restricted
temporary run-secrets file and removed after cleanup.

## Fixture lifecycle

1. Authenticate with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`.
2. Verify the configured account and Superuser permission using the live UI.
3. Inventory Models, Status Labels, Categories, Companies, Locations, Users,
   Groups, and active Assets through stable, paginated API reads.
4. Resolve existing active Asset-category Model and deployable Status Label;
   never assume a fixed database ID.
5. Create per-test run-owned users/groups/tokens/assets only where needed.
6. Assert the API's JSON business result and read back created/updated data.
7. Clean in dependency order: Assets, owner tokens, Users, then Groups.
8. Re-read the active inventory and compare counts and identity fingerprints
   with the pre-run baseline.

Catalog records and all pre-existing accounts, groups, and Assets are
read-only fixtures. Test accounts are not the Superuser. Cases needing two
users receive separate run-owned users with verified individual/group
permissions.

## Cleanup safeguards and recovery

Cleanup requires all of the following before deleting/revoking an object:

- The manifest entry belongs to the active `RUN_ID`.
- Its identity has the expected run prefix.
- The recorded ID resolves to the same exact Asset Tag, Username, Group name,
  or token name/owner.
- For a pending entry without an ID, an exact identity lookup must return at
  most one object; ambiguity stops cleanup.
- The delete/revoke response is checked and the result is verified afterward.

No Admin/Superuser or pre-existing data is eligible for cleanup. Snipe-IT
soft-deletes Users and Assets; these run-owned rows may remain in the database
but are absent from active inventory. OAuth tokens are revoked and verified.
Cleanup never attempts to purge soft-deleted records or alter system settings.

Playwright fixture teardown runs even when a test fails. Global teardown
resumes any remaining manifest work and verifies the baseline. If the process
is interrupted, run:

```powershell
npm run test:data-cleanup
```

The command operates only on the current run manifest, then verifies baseline
fingerprints. If ownership, credentials, or identity cannot be verified, it
stops and reports the unresolved entry instead of deleting it.

## Repeatability and observed baseline

The validated active API baseline is 18 Models, 7 Status Labels, 20 Categories,
111 Companies, 21 Locations, 2,107 Users, 1 Group, and 2,559 Assets. The direct
database contains 2,609 Assets total; the API listing excludes the 50 assets
whose Status Label is Archived. Both full test runs returned to identical
active-inventory counts and fingerprints. See
`TEST_DATA_IMPLEMENTATION_REPORT.md` and `FINAL_TEST_REPORT.md`.

Snipe-IT's API throttle is 120 requests per minute per authenticated user.
Paginated session requests honor `Retry-After` with bounded retries; catalog
records are reused from the verified run baseline to avoid redundant reads.

## Secret handling

`.env`, `.cache/`, Playwright results, and generated reports must not contain
credentials or token values. `.env.example` contains placeholders only.
Screenshots and traces are disabled. The report generator redacts bearer and
password-shaped values; never paste credentials or session material into a
test annotation or assertion message.
