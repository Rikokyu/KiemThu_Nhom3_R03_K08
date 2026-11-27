# Test Design

## Sources

The design is based on the provided Snipe-IT source-analysis prompt and runtime observations of `http://localhost:8000`. It does not assume undocumented behavior or read Snipe-IT source code.

## Techniques

- Equivalence partitioning: valid/invalid login, API and asset data.
- Boundary value analysis: throttle, asset tag, name, warranty, cost and invalid API data.
- Decision tables: role/permission, inactive accounts and personal/group permission precedence.
- Negative testing: unauthenticated access, invalid IDs and missing CSRF.
- State transitions: login/logout/session and asset create/update/delete.
- Risk-based testing: cross-company FMCS scope.
- Configuration testing: session/cookie properties.

## Runtime uncertainties

The local URL is HTTP, so Secure cookie and HTTPS behavior cannot be verified. HttpOnly and SameSite are read from the browser cookie runtime and recorded as unverified unless observed. Login redirect status and API status codes are asserted from runtime-safe alternatives instead of assumed exact codes.

## Blocked cases

Cases needing dedicated credentials, API tokens, real test IDs, permission combinations or FMCS company data are blocked unless environment variables provide them. The suite does not create accounts, tokens, permissions or data. Login throttling is skipped by design to avoid changing throttle state.
