# Refresh sessions and browser protections

## Contents

- Persistence and atomic rotation
- Replay detection
- Cookie security
- CSRF
- CORS

# Refresh-token persistence model

A refresh-session record should contain fields similar to:

```text
id
user_id
family_id
token_hash
created_at
expires_at
consumed_at
revoked_at
replaced_by_id
created_ip_hash_or_metadata
created_user_agent_metadata
last_used_at
revocation_reason
version
```

Do not store the raw refresh token.

Do not expose refresh-session entities through REST APIs.

Index fields used for:

* Token-hash lookup
* User-session lookup
* Family revocation
* Expiration cleanup

Use database constraints where appropriate.

Token rotation must be atomic.

Concurrent refresh requests must not both succeed.

Use one of:

* Optimistic locking
* Pessimistic locking
* Conditional atomic update
* Uniqueness and state-transition constraints

The exact strategy must be integration tested against the real database engine.

---

# Refresh-token rotation and reuse detection

After a refresh token is successfully used:

* Mark it consumed
* Generate a replacement
* Link the replacement to the same family
* Reject further use of the consumed token

When an already-consumed refresh token is presented:

1. Treat the event as possible token theft.
2. Revoke the entire refresh-token family.
3. Reject the request.
4. Record a high-priority security event.
5. Require the legitimate user to authenticate again.

Do not simply return another token after detecting reuse.

Do not allow unlimited parallel refresh operations for the same refresh token.

---

# Cookie security

Refresh-token cookies must normally use:

```text
HttpOnly=true
Secure=true in production
SameSite=Strict or Lax when compatible
Path=/api/auth or a narrower path
```

Use `SameSite=None` only when cross-site behavior is truly required.

When using `SameSite=None`, `Secure` is mandatory.

Prefer host-only cookies.

Do not set the cookie `Domain` attribute unless cross-subdomain access is required and reviewed.

Cookie deletion must use the same:

* Name
* Path
* Domain
* SameSite behavior where applicable

Do not store user roles or trusted authorization state in editable frontend cookies.

---

# CSRF rules

Do not disable CSRF globally without documenting the credential transport model.

Determine whether the browser automatically attaches authentication credentials.

## Bearer-only endpoints

When an endpoint accepts only an access token supplied explicitly in the `Authorization` header and does not accept ambient authentication cookies, CSRF protection may be excluded for that endpoint after review.

## Cookie-backed endpoints

Endpoints using refresh or authentication cookies remain CSRF-relevant.

This commonly includes:

* Refresh
* Logout
* Logout all devices
* Session management
* Cookie-based account actions

Protect cookie-backed unsafe operations using an approved combination of:

* Spring Security CSRF protection
* CSRF token in a custom request header
* Exact Origin validation
* Referer validation as fallback
* SameSite cookies
* Fetch Metadata validation when implemented
* Proper HTTP methods

GET, HEAD and OPTIONS must not mutate application state.

Do not use GET for logout, refresh, password change or destructive actions.

Do not disable CSRF merely because the application uses JWT somewhere.

---

# CORS rules

CORS is a server-side allowlist configuration.

Configure it centrally.

CORS must be processed before authentication rejects preflight requests.

Allowed origins must come from validated configuration.

Use exact origins, for example:

```text
https://app.example.com
```

Do not use:

```text
*
```

when credentials are enabled.

Do not dynamically reflect any incoming `Origin` without validation.

Explicitly configure:

* Allowed origins
* Allowed HTTP methods
* Allowed request headers
* Exposed response headers when required
* Credential behavior
* Preflight cache duration

Do not add uncontrolled controller-level `@CrossOrigin` annotations.

Development origins must not leak into production configuration.

Do not allow arbitrary subdomains using unsafe substring matching.

---
