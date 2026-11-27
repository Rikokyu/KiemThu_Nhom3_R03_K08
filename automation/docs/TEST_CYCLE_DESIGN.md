# Playwright Test Cycle Design

> **Implementation update (2026-11-27):** Sections 1–2 document the initial
> read-only investigation. The original proposed ordered cycle and “next
> changes” below are retained as design history, not current run instructions.
> Implementation uses isolated per-test fixtures, so the 29 cases do not
> depend on execution order or share a mutable Asset. See
> `TEST_CASE_IMPLEMENTATION_REPORT.md` and `FINAL_TEST_REPORT.md` for the
> verified implementation and two full-run outcomes. The initial API
> investigation preceded token provisioning; authenticated API pagination and
> token lifecycle were subsequently exercised by the suite.

## Scope and evidence

Investigation date: 2026-11-27. The target read from `automation/.env` was
`http://localhost:8000`; the configured administrator logged in successfully
and `/users/1/edit` showed the Superuser permission enabled. The instance is
Snipe-IT `v8.8.0`, running with MariaDB `11.4.7`.

The database inventory below was obtained from the Snipe-IT application
container using a `SET TRANSACTION READ ONLY` transaction and `SELECT`/
metadata queries only. The transaction was rolled back. No seed, migration,
write, delete, token generation, or configuration change was performed.
Passwords, cookies, token values, and user password fields were not read or
recorded.

The prior setup report's all-zero list-page counts are not a database
inventory. The current list pages load their rows asynchronously from
`/api/v1/...`; `global-setup.js` navigates and counts the initial table before
waiting for that response. After the list request completed, the UI displayed
rows. The underlying database and authenticated UI API agree on catalog and
user counts. For assets, the API's default listing omits the 50 assets whose
status label is `Archived`.

## 1. Live database inventory

Counts are direct table counts unless the column says otherwise. “Candidate”
means a verified existing value suitable as a read-only reference, not a
record that automation may update or delete.

| Type / table | Count | Actual IDs and names verified | Relevant fields / fixture conclusion |
|---|---:|---|---|
| Models / `models` | 18 active | See complete list below | Model `id=1`, `Macbook Pro 13"`, `category_id=1`, `fieldset_id=2` is a real candidate. Resolve it by query/API at setup time; do not hard-code `1`. |
| Status Labels / `status_labels` | 7 active | See complete list below | `id=1`, `Ready to Deploy`, is deployable and the default label. Resolve dynamically. |
| Categories / `categories` | 20 active | See complete list below | Category `id=1`, `Laptops`, type `asset`, is associated with model 1. |
| Companies / `companies` | 111 active | Actual examples: `1 Johns, Gerhold and Block`; `2 Pacocha PLC`; `3 Bergstrom-Torp`; `111 Langworth-Borer` | `id`, `name`, `parent_id`; many live companies exist, but no Company A/B fixture should be assumed. |
| Locations / `locations` | 21 active | See complete list below | Actual examples: `1 East Gavin`, `2 Cassinshire`; both currently have no parent/company association. |
| Users / `users` | 2,107 total; 2,107 not deleted and activated | `1 admin` / “Admin User”; `2 snipe` / “Snipe E. Head” | User form marks `first_name` and `username` required. All users are activated; no `pw_*` username exists. Do not alter any of these users. |
| Groups / `permission_groups` | 1 | `1 End User` | Group permissions include `assets.view=-1`, `assets.create=-1`, `assets.edit=-1`, `assets.delete=-1`; it has no users (`users_groups` count 0). Do not modify this existing group. |
| Assets / `assets` | 2,609 total; 0 soft-deleted | Actual examples: `1` / tag `4508574169`; `2` / `9755483190`; `3` / `1649229559` | All 2,609 have `deleted_at=NULL`; status distribution: 2,509 Ready to Deploy (status 1), 50 Pending (2), 50 Archived (3). There are zero `AUTO-TEST-*` tags. Existing assets are sample data and are not test write/delete fixtures. |
| OAuth access tokens / `oauth_access_tokens` | 0 | No token records | No usable API bearer token exists. OAuth client configuration is not an access token. No token was created or read. |

The currently configured system flag `full_multiple_companies_support` is
`0` (FMCS disabled). Company-isolation test AUTHZ-06 cannot be validly run
without changing system configuration, which is out of scope and must not be
done for this cycle.

### Complete catalog names observed

**Models** (ID — name — model number — category ID):

| ID | Name | Model number | Category |
|---:|---|---|---:|
| 1 | Macbook Pro 13" | 4916950313069669 | 1 |
| 2 | Macbook Air | 4916161486829398 | 1 |
| 3 | Surface | 6011339669193464 | 1 |
| 4 | XPS 13 | 6011610073737090 | 1 |
| 5 | Spectre | 4532431448096400 | 1 |
| 6 | ZenBook UX310 | 2327229756707235 | 1 |
| 7 | Yoga 910 | 4556665131231839 | 1 |
| 8 | iMac Pro | 5201364563507264 | 2 |
| 9 | Lenovo Intel Core i5 | 4539838834739976 | 2 |
| 10 | OptiPlex | 5040 (MRR81) | 2 |
| 11 | SoundStation 2 | 5544928329531713 | 6 |
| 12 | Polycom CX3000 IP Conference Phone | 4916851344417192 | 6 |
| 13 | iPad Pro | 4024007175734200 | 3 |
| 14 | Tab3 | 2422580026162468 | 3 |
| 15 | iPhone 11 | 6011998366936192 | 4 |
| 16 | iPhone 12 | 3528681845516750 | 4 |
| 17 | Ultrafine 4k | 4916592674948352 | 5 |
| 18 | Ultrasharp U2415 | 4716358720480192 | 5 |

**Status Labels** (ID — name — deployable / pending / archived):

| ID | Name | Flags |
|---:|---|---|
| 1 | Ready to Deploy | 1 / 0 / 0 |
| 2 | Pending | 0 / 1 / 0 |
| 3 | Archived | 0 / 0 / 1 |
| 4 | Out for Diagnostics | 0 / 0 / 0 |
| 5 | Out for Repair | 0 / 0 / 0 |
| 6 | Broken - Not Fixable | 0 / 0 / 0 |
| 7 | Lost/Stolen | 0 / 0 / 0 |

**Categories** (ID — name — type):

| ID | Name | Type |
|---:|---|---|
| 1 | Laptops | asset |
| 2 | Desktops | asset |
| 3 | Tablets | asset |
| 4 | Mobile Phones | asset |
| 5 | Displays | asset |
| 6 | VOIP Phones | asset |
| 7 | Conference Phones | asset |
| 8 | Keyboards | accessory |
| 9 | Mouse | accessory |
| 10 | Printer Paper | consumable |
| 11 | Printer Ink | consumable |
| 12 | HDD/SSD | component |
| 13 | RAM | component |
| 14 | Graphics Software | license |
| 15 | Office Software | license |
| 16 | Automated 5thgeneration emulation | accessory |
| 17 | Focused methodical utilisation | accessory |
| 18 | Configurable tangible protocol | asset |
| 19 | Streamlined logistical artificialintelligence | asset |
| 20 | Streamlined 24/7 hardware | asset |

**Locations** (ID — name):

| ID | Name |
|---:|---|
| 1 | East Gavin |
| 2 | Cassinshire |
| 3 | Eliseohaven |
| 4 | Millertown |
| 5 | West Elwyn |
| 6 | McDermottberg |
| 7 | West Stewart |
| 8 | McKenzieborough |
| 9 | Schmidtstad |
| 10 | Lake Enid |
| 11 | Blickstad |
| 12 | Lake Bridgettemouth |
| 13 | South Angelitafurt |
| 14 | Evieland |
| 15 | Paucekside |
| 16 | Mariahaven |
| 17 | New Emiliafort |
| 18 | Clarkshire |
| 19 | West Nathen |
| 20 | Addiehaven |
| 21 | New Clotilde |

Companies, users, and assets are high-volume tables (111, 2,107, and 2,609
rows). The report records their exact counts and actual IDs/names for fixture
candidates, rather than copying all user identities and asset tags into a
tracked document. Query the authenticated paginated API or the same read-only
SQL pattern when a complete inventory is needed. No existing user or asset is
recommended for a write test.

### Required creation fields and usable fixtures

- The asset creation form marked `asset_tags[1]`, `model_id`, and `status_id`
  as required. The API payload used by the current suite is `asset_tag`,
  `model_id`, and `status_id`. Model/category/status relations must be
  validated immediately before creation; the real catalog candidates above
  exist, but future code must look them up dynamically.
- The user creation form marked `first_name` and `username` as required.
  Password/activation handling must be confirmed against the form/API behavior
  in the implementation step; do not infer that the HTML `required` attribute
  is the complete server validation contract.
- `id=1 Macbook Pro 13"` plus `id=1 Ready to Deploy` are suitable catalog
  references for creating a *new* run-owned asset after dynamic lookup.
- `id=1 Laptops` is the actual linked asset category. It is not a record to
  mutate.
- `id=1 End User` is not suitable for AUTHZ-05 because its `assets.view`
  permission is deny, not allow. Create a run-owned group for that case.
- Existing user `id=1` is the protected Superuser; never use it for a
  permission-negative test or cleanup.
- Existing assets, companies, locations, models, categories, and statuses are
  read-only fixtures. Test assets/users/groups/tokens must be created with
  current-run identities and deleted/revoked only if their ownership is proven.

## 2. API capability investigation

### Observed access and response

Every `GET` list endpoint below returned HTTP 401 with JSON when called without
an API token. This is an authentication failure, not evidence that the route
is missing or its data is empty: the same routes are registered in the local
Snipe-IT API and the authenticated administrator's UI requests returned HTTP
200 JSON. No valid or invalid bearer token was available to distinguish token
permission denial from token validity.

The authenticated UI API response shape was:
`total`, `rows`, `current_page`, `per_page`, `total_pages`, `prev_page_url`,
`next_page_url`. The local UI default was 20 rows per page. API documentation
uses `limit` and `offset`; iterate offsets until all rows have been collected,
or follow `next_page_url`, and compare collected rows with `total`. For example,
the user list had 2,107 rows over 106 pages; companies had 111 over 6; assets
had 2,559 over 128. A bearer-token pagination request was not tested because
there is no token.

| Data | Read endpoint (method) | Permission required | Returned fields of interest | Pagination / all-data retrieval | Safe for preparation? |
|---|---|---|---|---|---|
| Models | `GET /api/v1/models` | `models.view` | `id`, `name`, `model_number`, category and fieldset relations | `total/rows` and page metadata; use `limit` + `offset` or next URL | Read lookup is suitable; no need to create/change a model. |
| Status Labels | `GET /api/v1/statuslabels` | `statuslabels.view` | `id`, `name`, `deployable`, `pending`, `archived`, `default_label` | Same paginated response; seven rows currently fit one page | Read lookup is suitable; do not modify statuses. |
| Categories | `GET /api/v1/categories` | `categories.view` | `id`, `name`, `category_type` | Same paginated response; twenty rows currently fit one page | Read lookup is suitable; do not create/change categories. |
| Companies | `GET /api/v1/companies` | `companies.view` | `id`, `name`, `parent_id` | 20/page in UI; follow `next_page_url` or use offset until `total` is reached | Read lookup only. Do not assume Company A/B from list order. |
| Locations | `GET /api/v1/locations` | `locations.view` | `id`, `name`, `parent_id`, `company_id` | 20/page in UI; two pages currently | Read lookup only. |
| Users | `GET /api/v1/users` | `users.view` | `id`, `username`, display name, activation state, company/location and groups | 20/page in UI; 106 pages currently. Use exact `username` search to check a candidate before any create. | Read lookup; never write/delete existing users. |
| Groups | `GET /api/v1/groups` | Superuser plus group view authorization in the current controller | `id`, `name`, permissions, user count | Paginated response; one group currently | Read lookup; group create/update/delete is Superuser-only. Never change the existing group. |
| Assets | `GET /api/v1/hardware` | `assets.view` | `id`, `asset_tag`, `name`, model, category, status, company/location, assignee | 20/page in UI; API returns 2,559 non-Archived assets. Use `limit`/`offset` or next URL. | Read lookup; all pre-existing assets remain immutable. |
| Current API identity | `GET /api/v1/users/me` | Valid bearer token | Token owner's user identity | Single record | Required before API-03 write-denial assertion; compare username before sending the write attempt. |

The resource routes also register the following methods. Authorization is
checked by the Snipe-IT policies/controllers; a successful HTTP status alone
is not sufficient. For assets, POST/PATCH/DELETE correspond to
`assets.create` / `assets.edit` / `assets.delete`. User create/update/delete
requires the corresponding `users.create` / `users.edit` / `users.delete`.
Group administration requires Superuser. Model/status/category/company/
location writes similarly require their matching `*.create`, `*.edit`, or
`*.delete` permission and are not needed for this test cycle.

| Operation | Endpoint/method | API result required |
|---|---|---|
| Create asset | `POST /api/v1/hardware` | JSON `status=success` and returned ID; then GET and assert exact run tag and fields. |
| Read asset | `GET /api/v1/hardware/{id}` | JSON record identity and expected fields, not just HTTP 200. |
| Update asset | `PATCH /api/v1/hardware/{id}` (also PUT) | Non-error JSON, then GET and assert the changed value. |
| Delete asset | `DELETE /api/v1/hardware/{id}` | Non-error JSON, then verify the run-owned asset is absent from the active listing. |
| Create user | `POST /api/v1/users` | Requires users.create; confirm returned username and ID. |
| Create group | `POST /api/v1/groups` | Requires Superuser; confirm exact run-specific group and permissions. |
| Create/list/revoke personal token | `POST/GET/DELETE /api/v1/account/personal-access-tokens` | Local controller gates these operations on `self.api`; no token was created in this initial investigation. Store no token value in reports or manifests. |

Official Snipe-IT API references: [hardware listing](https://snipe-it.readme.io/reference/hardware-list), [user listing](https://snipe-it.readme.io/reference/users), and [location listing](https://snipe-it.readme.io/reference/locations). Local source route/controller registration and live response shape were used to validate the current instance. Never copy example authorization headers from documentation into this instance's configuration.

### API verdicts by failure class

- **Endpoint unavailable:** not observed for the listed resources. Local routes
  exist; the administrator UI requests returned 200 JSON.
- **Unauthenticated:** observed for all direct list requests without bearer
  token: HTTP 401 JSON. This is the current blocker for automated API calls.
- **Invalid token:** not separately exercised in this investigation; API-02 is
  the dedicated test for it.
- **Insufficient permission:** not exercised because no test token exists.
  API-03 must verify token owner through `/users/me`, then demonstrate a
  permission-denial JSON response.
- **Empty data:** not the cause. The database and authenticated response
  contain the counts in the inventory above.
- **Pagination:** observed via `total`, `rows`, `per_page`, `total_pages`, and
  next-page links. Complete pagination with bearer credentials remains to be
  verified when a least-privilege token is provisioned.

## 3. Ordered 29-case cycle (original proposal; superseded)

The following ordered shared-data proposal predates the implemented per-test
fixtures. It is retained for traceability only. Do not treat its suggested
case order or its proposed AUTH-04 skip as current behavior; the updated
implementation status is recorded at the end of this document.

Keep the 29 fixed case IDs as the report unit. ASSET-04 currently expands to
five Playwright subtests; they remain one fixed case ID in summary reporting.
The setup and teardown phases are lifecycle operations, not extra cases.

### Cycle stages

1. **Preflight (Superuser):** enforce loopback target; log in; verify username,
   user ID and Superuser permission; inventory via authenticated API/database
   read-only query; snapshot baseline IDs/counts. Stop if preflight fails.
2. **Admin/auth/session cases:** run admin and unauthenticated cases using
   isolated contexts. No fixture data changes.
3. **Provisioning:** create only run-scoped inactive/permission-test users,
   groups, and distinct API identities/tokens. Verify every effective
   permission and token owner before dependent cases.
4. **Create and validate assets:** use dynamically selected existing model and
   status; create uniquely tagged assets owned by this RUN_ID; execute positive,
   negative, duplicate, update, and API cases.
5. **User authorization:** log out the Superuser in the relevant browser
   context, log in the run-scoped account, and test denial against the shared
   run-owned asset. Do this before deleting the asset.
6. **Delete and verify:** run ASSET-07 only after all asset consumers finish.
7. **Cleanup:** global teardown in `finally`/fixture teardown, reverse
   dependency order; write a sanitized cleanup report and compare post-run
   baseline. A standalone cleanup command must also be able to resume from a
   partial manifest after process interruption.

### Case order and dependencies

The proposed order deliberately keeps shared assets alive through every
permission consumer. Independent negative-auth cases can move within their
phase, but must not run concurrently with login throttling.

| Order | Case | Phase / principal | Inputs and produced data | Consumes / dependency | Cleanup point |
|---:|---|---|---|---|---|
| 1 | AUTH-01 | Admin login | Existing `.env` Superuser credentials | Preflight; confirms real login | Never delete/alter admin |
| 2 | AUTH-02 | Anonymous | Unique invalid username/password values | None | No data |
| 3 | AUTH-05 | Anonymous | Protected `/hardware` URL | None | No data |
| 4 | AUTH-06 | Admin session | Fresh session cookie, logout, replay old session | Admin login behavior | Context closed after assertion |
| 5 | AUTHZ-01 | Admin Superuser | `/hardware` and expected page identity | AUTH-01/preflight | No data |
| 6 | COOKIE-01 | Admin session | Runtime session cookie attributes | Successful login | Context closed |
| 7 | COOKIE-02 | Admin session | Cookie/session before and after logout | Successful login; stale session replay | Context closed |
| 8 | COOKIE-03 | No CSRF | Unique run-tagged POST rejected before mutation | Isolated loopback HTTP; verify response is a rejection | Verify no object exists immediately |
| 9 | AUTH-03 | Inactive run user | User created with activated=false and run-scoped name | Provisioning; prove login denied | Delete only after this case and ownership recheck |
| 10 | API-01 | No bearer | `GET /api/v1/hardware`, JSON accept | None | No data |
| 11 | API-02 | Invalid bearer | Clearly invalid synthetic token | None; do not log header | No data |
| 12 | AUTHZ-02 | View-denied user | Run user with effective `assets.view=-1` | Provisioned user; no admin session | Delete after all user cases |
| 13 | AUTHZ-05 | Override user | Run group `assets.view=1`; run user personal `assets.view=-1` | Superuser-created group/user; verify effective precedence | Delete user, then run group |
| 14 | API-03 | API deny identity | Token owner verified via `/users/me`; `assets.create=-1`; valid real model/status | Separate denied API user/token; must not share writer token | Revoke token and remove user after test; if unexpectedly created, register and clean asset |
| 15 | ASSET-02 | API writer | Missing required `asset_tag`/model/status payload | Valid writer token; assert validation rejection, no asset | Verify no record created |
| 16 | ASSET-04 | API writer | Five invalid boundary payloads; unique tags | Dynamic model/status and writer token | Register any unexpected success immediately; cleanup at teardown |
| 17 | ASSET-01 | API writer | Valid payload; unique `AUTO-TEST-<RUN_ID>-...` tag | Dynamic model/status; create shared `asset_main` | Retain until every consumer below completes |
| 18 | ASSET-03 | API writer | Duplicate `asset_main.asset_tag` | ASSET-01 asset | No duplicate should exist; keep original |
| 19 | ASSET-05 | API writer | Change `asset_main.name`, then re-read | ASSET-01 asset | Retain changed asset for authorization tests |
| 20 | AUTHZ-03 | Edit-denied user | Attempt edit of `asset_main`; assert denial and unchanged value | User permission fixture plus ASSET-01 | User after case; asset remains |
| 21 | AUTHZ-04 | Delete-denied user | Attempt delete of `asset_main`; assert denial and asset still exists | User permission fixture plus ASSET-01 | User after case; asset remains |
| 22 | API-04 | API writer | Create separate `api_asset`, re-read exact tag/ID | Writer token, model/status | Retain through API-05; then cleanup |
| 23 | API-05 | API writer | Duplicate `api_asset.asset_tag` | API-04 asset | Keep original until teardown |
| 24 | ASSET-06 | API writer | PATCH verified-nonexistent ID | Dynamic non-existent-ID lookup; never hard-code an ID | No data; re-check no ID was created |
| 25 | API-06 | API writer | PATCH verified-nonexistent ID; assert JSON not-found result | Same helper as ASSET-06 | No data |
| 26 | ASSET-07 | API writer | Delete `asset_main`, verify absent | ASSET-01 and completion of ASSET-03/05, AUTHZ-03/04 | Mark deleted in manifest; do not delete again |
| 27 | AUTHZ-06 | Company-A user | Read an asset owned by Company B | Requires FMCS enabled and distinct real companies/asset | **BLOCKED currently**; no system setting change |
| 28 | AUTH-04 | Isolated rate-limit run | Controlled failed-login burst and verified reset policy | Dedicated isolated instance/rate-limit reset agreement | **SKIPPED currently**; do not affect shared instance |
| 29 | COOKIE-04 | HTTPS | Secure/HttpOnly/SameSite assertions against declared policy | HTTPS endpoint and expected policy | **BLOCKED on current HTTP URL** |

### Shared-data dependency map

| Data ID/role | Creator/precondition | Cases that reuse it |
|---|---|---|
| `admin` | Existing user 1; verified Superuser | Preflight, AUTH-01/06, AUTHZ-01, COOKIE-01/02 |
| `inactive_user` | Run provisioning | AUTH-03 |
| `view_denied_user` | Run provisioning, no asset-view permission | AUTHZ-02 |
| `edit_denied_user` | Run provisioning, asset view allowed but edit denied | AUTHZ-03 |
| `delete_denied_user` | Run provisioning, asset view allowed but delete denied | AUTHZ-04 |
| `override_user` + `override_group` | Run provisioning; group allow plus individual deny | AUTHZ-05 |
| `api_denied_user/token` | Run provisioning; identity confirmed and no assets.create | API-03 only |
| `api_writer_user/token` | Run provisioning; only required asset permissions | ASSET-01/02/03/04/05/06/07 and API-04/05/06 |
| `asset_main` | ASSET-01 | ASSET-03, ASSET-05, AUTHZ-03, AUTHZ-04, ASSET-07 |
| `api_asset` | API-04 | API-05 |
| `model/status` | Existing catalog lookup, no writes | ASSET-01/02/03/04/05/07 and API-03/04/05 |
| `nonexistent_asset_id` | Search/GET until not-found is proven | ASSET-06 and API-06; no fixed ID |
| Company A/B fixtures | Existing real company/user/asset; FMCS must already be on | AUTHZ-06 only |

## 4. Test Data Manager and cleanup design (original proposal; superseded)

The next implementation should be an explicit cycle fixture rather than
independent per-test setup:

- Generate a cryptographically unique `RUN_ID` after Superuser preflight.
- Use `AUTO-TEST-<RUN_ID>-...` for asset tags and names. For usernames,
  normalize the run ID's hyphen to an underscore and use names such as
  `pw_<RUN_ID_NORMALIZED>_view`, `pw_<RUN_ID_NORMALIZED>_inactive`,
  `pw_<RUN_ID_NORMALIZED>_api_deny`, and
  `pw_<RUN_ID_NORMALIZED>_api_writer`; use the unmodified run marker in group
  names. Do not rely on fixed `pw_user` names without checking their actual
  current state.
- Resolve model/status IDs dynamically by active ID/name and required type.
  Record the actual ID/name selected in the run manifest; abort with a precise
  BLOCKED reason if no eligible fixture exists.
- After each successful create, require HTTP success **and** JSON
  `status=success`, a numeric ID, and matching returned identity. Persist
  `{runId,type,id,identity,createdAt,dependencies}` atomically before running
  dependent tests.
- Record assets, users, groups, and token metadata separately. Token metadata
  may contain token ID, owning user ID, and client ID, but never the bearer
  value. Passwords and tokens must not enter Playwright output, annotations,
  reports, screenshots, traces, Git, or the long-lived manifest. If an
  ephemeral credential must cross a process boundary, keep it in a
  permission-restricted ignored runtime file and remove it in teardown.
- API-03 and API write CRUD have mutually exclusive `assets.create`
  requirements. Provision distinct least-privilege users/tokens; one token
  cannot satisfy both cases. Verify each token owner with `/api/v1/users/me`.
- Cleanup in reverse dependency order: revoke run API tokens; delete
  `api_asset` and any other registered assets; delete users after confirming
  exact ID + run-scoped username; delete run groups only after run users have
  left them. Do not delete/revoke anything if ownership cannot be proven.
- Before each destructive action, re-read the target and compare its ID and
  exact run marker with the manifest. Afterward, verify the resource is absent
  or token revoked. A mismatch means retain and report cleanup failure; never
  guess.
- Cleanup must be idempotent. Persist per-object cleanup state after each
  operation so teardown can resume after interruption. Never include a
  password, cookie, OAuth bearer value, or full API request header in errors.
- Keep one worker and explicit case order for shared-data consumers. Use
  `try/finally`/global teardown so setup or assertion failures still trigger
  cleanup. Ensure the final deletion test happens only after all consumers of
  the shared asset.
- Compare pre/post counts and baseline IDs. Run-owned objects must be gone;
  all baseline assets/catalog/users/groups must remain. Authentication audit
  rows and normal session activity are not test fixtures and must not be
  deleted.

## 5. Cases that remain blocked or need redesign (original proposal; superseded)

| Case(s) | Current reason | What is needed |
|---|---|---|
| AUTH-03 | Database has no inactive users; current `.env` has no inactive test credential. | Create one run-owned inactive account, assert denial, and remove only that account after verified ownership. |
| AUTH-04 | Current test intentionally skips to avoid changing rate-limit state. | An isolated Snipe-IT instance and agreed throttle/reset procedure; keep skipped otherwise. |
| AUTHZ-02/03/04/05 | Existing specs explicitly skip; no `pw_*` users exist and the only existing group denies asset access. | Provision role-specific users and a run-owned group; assert permission behavior against expected pages/API results. |
| AUTHZ-06 | `full_multiple_companies_support=0`; company-boundary feature is disabled. | A separate environment already configured for FMCS with verified Company A/B user/asset. Do not toggle this instance. |
| ASSET-01/03/04/05/07; API-03/04/05 | No API bearer token exists; OAuth access token table count is zero. | Two distinct run-scoped API identities/tokens (deny and writer), dynamic existing model/status, and verified `/users/me` ownership. |
| ASSET-02/06; API-06 | Current cases require an API token to assert validation/not-found responses. | Writer/read token and dynamic verified nonexistent ID; assert JSON error semantics, not just HTTP code. |
| COOKIE-04 | Current target is HTTP; observed session cookie is `Secure=false`, `HttpOnly=true`, `SameSite=Lax`. | HTTPS deployment and an explicitly approved expected policy. On HTTP only HttpOnly/SameSite can be assessed; Secure remains blocked. |
| API pagination with bearer token | No token is available; only the administrator UI's authenticated list requests were observed. | Verify pagination using a least-privilege test token in the next implementation run. |

No test should be reported PASS until the business result and resulting
state are verified. HTTP 200 alone, a visible button, or an API request that
did not return a confirmed JSON success/error is insufficient.

## 6. Next implementation changes (original investigation; completed or superseded)

1. Fix `global-setup.js` preflight: resolve the configured admin by exact
   username and derive its ID instead of defaulting to ID 1; verify its
   Superuser permission. Wait for each authenticated list API response and
   record JSON `total`/pagination, or wait for the table to finish loading.
   Include categories and locations. Do not count the initial “No matching
   records” placeholder.
2. Add a cycle-level fixture and explicit sequential dependency order; preserve
   all 29 fixed case IDs in reports while retaining ASSET-04's five subcases.
3. Provision run-scoped users/groups and separate API deny/writer identities;
   never reuse a Superuser token for API-03.
4. Make asset setup use live catalog lookups; route every successful create
   through the manifest before another assertion can fail.
5. Replace the asset-only cleanup with ownership-checked asset/user/group/token
   cleanup and a resumable cleanup command.
6. Remove placeholder skips only after the actual expected behavior is asserted.
   Keep AUTH-04 and AUTHZ-06 blocked unless their external preconditions exist.
7. Separate COOKIE-04's HTTPS-dependent Secure assertion from HTTP-only cookie
   observations, without treating `Secure=false` on HTTP as a secure pass.
8. Run the new complete cycle twice, inspect each baseline/post-run comparison,
   and confirm that the second run reuses no first-run object IDs or names.

This initial investigation phase changed documentation only. The later
implementation phase is documented below.

## 7. Implemented cycle and verified outcomes

- Each test creates its own run-prefixed fixture as needed and tears it down;
  no case relies on an earlier case's created User, Group, Token, or Asset.
- Global setup verifies the configured Admin and Superuser permission before
  snapshotting live inventory. It resolves Model and deployable Status Label
  dynamically and uses complete paginated API snapshots.
- Manifests track all run-owned records; cleanup verifies exact IDs, ownership,
  and identity before deletion/revocation. Global teardown verifies the
  active inventory fingerprints against the pre-run baseline.
- Full run one (`20261127141228-F92D1A`): 25 PASS, 2 FAIL, 2 BLOCKED by
  requested-case ID. API-03 initially failed because the generated token name
  exceeded the database limit; ASSET-04 exposed the warranty validation issue.
- Full run two (`20261127141633-ACA2D0`): 26 PASS, 1 FAIL, 2 BLOCKED by
  requested-case ID. API-03 passed after shortening token names. All 8 active
  inventory counts/fingerprints matched baseline after cleanup.
- Current outcome: AUTHZ-06 remains BLOCKED because FMCS is disabled;
  COOKIE-04 remains BLOCKED because the target uses HTTP; ASSET-04 remains
  FAIL because the app accepts a 241-month warranty value despite its declared
  `digits_between:0,240` validation rule. No Snipe-IT source or system
  configuration was changed to force a pass.
- The test runner is sequential (`workers: 1`) to avoid rate-limit pressure,
  but test cases are fixture-isolated and may be selected individually.
  ASSET-04 expands into five Playwright subtests while retaining one case ID.
