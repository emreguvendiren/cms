# Browser authentication architecture

## Contents

- Access and refresh token transport
- Login, refresh, and logout flows

# Default browser authentication architecture

For a first-party React SPA and Spring Boot API, use the following architecture unless an approved architecture decision states otherwise.

## Access token

Use a signed JWT as the access token.

The access token must be:

* Short-lived
* Returned in the login or refresh response body
* Stored only in frontend runtime memory
* Sent through the `Authorization` header
* Sent using the `Bearer` scheme
* Excluded from URLs
* Excluded from logs
* Excluded from local storage
* Excluded from session storage
* Excluded from IndexedDB
* Excluded from non-HttpOnly cookies

The frontend may obtain a new access token after a page reload by calling the refresh endpoint.

Do not persist the access token merely to simplify frontend state management.

## Refresh token

Use a cryptographically random opaque value as the refresh token.

The refresh token should not be a JWT by default.

The refresh token must be:

* Generated using a cryptographically secure random generator
* At least 32 random bytes before encoding
* Sent only through an HttpOnly cookie
* Marked `Secure` in production
* Assigned an intentional `SameSite` policy
* Limited to the narrowest practical cookie path
* Never exposed to frontend JavaScript
* Stored only as a one-way hash in the database
* Rotated after every successful refresh
* Revocable
* Associated with a token family or session family
* Protected against replay

Use a cookie path such as:

```text
/api/auth
```

Do not use a domain-wide cookie unless the architecture specifically requires it.

Do not set a parent-domain cookie when host-only scope is sufficient.

---

---

# Recommended authentication flow

## Login

1. Receive credentials through a validated request DTO.
2. Apply login rate limits.
3. Authenticate through Spring Security's `AuthenticationManager`.
4. Return the same generic failure response for invalid username, invalid password, disabled account and unknown account.
5. Create a refresh-session family.
6. Generate an opaque refresh token.
7. Store only its hash.
8. Set the refresh token in a secure HttpOnly cookie.
9. Generate a short-lived JWT access token.
10. Return the access token and minimal user-session information.
11. Record a structured authentication audit event.

## API request

1. Frontend sends the access token in the `Authorization` header.
2. Spring Security Resource Server extracts the bearer token.
3. `JwtDecoder` validates the token.
4. `JwtAuthenticationConverter` converts approved claims to authorities.
5. Request-level authorization is evaluated.
6. Method-level and resource-level authorization are evaluated.
7. The application processes the request only after all checks pass.

## Refresh

1. Browser sends the HttpOnly refresh cookie.
2. Validate CSRF and request origin protections.
3. Hash the received token.
4. Locate the refresh-session record by token hash.
5. Reject missing, expired, revoked or consumed tokens.
6. Atomically mark the current token as consumed.
7. Generate a new refresh token.
8. Store the replacement token hash.
9. Preserve the session-family relationship.
10. Issue a new short-lived access token.
11. Set the new refresh-token cookie.
12. Never return the refresh token in the response body.

## Logout

1. Revoke the current refresh-session family.
2. Clear the refresh cookie using matching cookie attributes.
3. Return a successful idempotent response.
4. Do not require the access token to remain valid when a valid refresh session can identify the current session.

## Logout all devices

1. Revoke every active refresh-session family belonging to the user.
2. Increment the user's security version when the architecture uses token-version checks.
3. Clear the current browser's refresh cookie.
4. Record an audit event.

---
