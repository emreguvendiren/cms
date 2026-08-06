# Security operations

## Contents

- Errors
- Logging and auditing
- Secrets and keys
- TLS and headers
- Input and tenant validation
- Package structure
- Forbidden patterns

# Error handling

Return consistent JSON security errors.

Use:

* `401 Unauthorized` when authentication is absent or invalid
* `403 Forbidden` when authentication succeeded but authorization failed

Do not return:

* Stack traces
* Token parser errors
* Database errors
* Internal class names
* Key identifiers that provide unnecessary detail
* Exact reasons useful for account enumeration

Use a centralized:

* `AuthenticationEntryPoint`
* `AccessDeniedHandler`

Example error structure:

```json
{
  "code": "AUTHENTICATION_REQUIRED",
  "message": "Bu işlem için giriş yapmanız gerekiyor.",
  "traceId": "public-correlation-id"
}
```

Do not return HTTP 200 for authentication or authorization failures.

Do not put access tokens or refresh tokens into error payloads.

---

# Security logging and auditing

Record structured security events for:

* Successful login
* Failed login
* Rate-limit activation
* Refresh success
* Refresh failure
* Refresh-token reuse detection
* Logout
* Logout all devices
* Password change
* Password reset
* Role change
* Permission change
* Account disablement
* Access denial
* Invalid token patterns
* Signing-key rotation
* Administrative security actions

Each event should contain only necessary metadata, such as:

* Timestamp
* Event type
* Outcome
* Authenticated user ID when known
* Target resource identifier when appropriate
* Correlation ID
* Sanitized network metadata
* Sanitized client metadata

Never log:

* Raw passwords
* Password hashes
* Access tokens
* Refresh tokens
* Authorization headers
* Cookie values
* Private keys
* Full sensitive request bodies

Sanitize user-controlled values before logging.

Do not let security logging failures expose secrets or crash the authentication flow.

---

# Secret and key management

Use environment-specific secret-management mechanisms.

Do not commit production secrets.

Separate:

* Development keys
* Test keys
* Staging keys
* Production keys

Automated tests must fail if production configuration falls back to development signing keys.

Configuration startup validation must reject:

* Missing issuer
* Missing audience
* Missing signing key
* Weak or malformed key
* Invalid token lifetime
* Wildcard production CORS origin
* Insecure production cookie configuration

Do not silently generate a new production signing key at every application startup.

Doing so invalidates existing tokens unpredictably and hides key-management failures.

---

# TLS and HTTP security headers

Production authentication traffic must use HTTPS.

Do not send credentials or tokens over plaintext HTTP.

Preserve Spring Security's secure default headers unless there is a documented reason to change them.

Review:

* HSTS
* Content-Type options
* Frame options or CSP frame ancestors
* Referrer policy
* Content Security Policy when the backend serves browser content
* Cache-control behavior for authentication responses

Authentication and token responses should not be cached by shared intermediaries.

Do not disable security headers globally to solve an unrelated frontend issue.

---

# DTO and input validation

Authentication endpoints must use dedicated request and response DTOs.

Do not expose persistence entities.

Validate:

* Required fields
* Length limits
* Allowed formats
* Collection sizes
* Request body size
* Unexpected values

Normalize identifiers consistently.

Do not silently truncate security-sensitive inputs.

Apply a reasonable maximum length before expensive password-hash operations.

Do not build database queries by concatenating login input.

---

# Multi-tenant security

When the system is multi-tenant:

* Derive tenant context from trusted membership
* Validate every tenant-bound operation
* Scope repository access by tenant
* Prevent cross-tenant identifiers from bypassing checks
* Include tenant claims only when their semantics are stable
* Revalidate sensitive tenant membership server-side
* Test cross-tenant attacks explicitly

Do not authorize access simply because the JWT contains a tenant ID.

Confirm that:

* The tenant exists
* The user remains a member
* The requested resource belongs to that tenant
* The required tenant permission is active

---

# Security package structure

Use a structure similar to:

```text
cmsBackend/src/main/java/com/example/project/
├─ common/
│  └─ security/
│     ├─ config/
│     │  ├─ SecurityConfiguration.java
│     │  ├─ CorsConfigurationProperties.java
│     │  └─ JwtConfigurationProperties.java
│     │
│     ├─ jwt/
│     │  ├─ JwtEncoderConfiguration.java
│     │  ├─ JwtDecoderConfiguration.java
│     │  ├─ JwtClaimsFactory.java
│     │  ├─ JwtAuthenticationConverter.java
│     │  ├─ AudienceValidator.java
│     │  └─ AuthenticatedPrincipal.java
│     │
│     ├─ authorization/
│     │  ├─ Authorities.java
│     │  ├─ CurrentUser.java
│     │  └─ ResourceAuthorizationService.java
│     │
│     ├─ web/
│     │  ├─ RestAuthenticationEntryPoint.java
│     │  └─ RestAccessDeniedHandler.java
│     │
│     └─ audit/
│        ├─ SecurityAuditEvent.java
│        └─ SecurityAuditService.java
│
├─ auth/
│  ├─ api/
│  │  ├─ AuthController.java
│  │  ├─ LoginRequest.java
│  │  ├─ LoginResponse.java
│  │  └─ AccessTokenResponse.java
│  │
│  ├─ application/
│  │  ├─ LoginService.java
│  │  ├─ TokenRefreshService.java
│  │  ├─ LogoutService.java
│  │  └─ AuthenticationResult.java
│  │
│  ├─ domain/
│  │  ├─ RefreshSession.java
│  │  ├─ RefreshSessionRepository.java
│  │  ├─ RefreshTokenGenerator.java
│  │  └─ RefreshTokenHasher.java
│  │
│  └─ infrastructure/
│     ├─ persistence/
│     │  ├─ RefreshSessionJpaEntity.java
│     │  ├─ SpringDataRefreshSessionRepository.java
│     │  └─ RefreshSessionRepositoryAdapter.java
│     │
│     └─ web/
│        └─ RefreshCookieService.java
```

Do not place all security code into one `JwtUtil` class.

Avoid utility classes that combine:

* Token creation
* Token validation
* Cookie handling
* Authentication
* User loading
* Authorization
* Refresh persistence

Separate responsibilities.

---

# Forbidden implementation patterns

The following are forbidden unless explicitly approved:

* Access token stored in localStorage
* Access token stored in sessionStorage
* Refresh token returned in JSON
* Raw refresh token stored in the database
* Same token used as both access and refresh token
* Long-lived access token used to avoid refresh logic
* Custom JWT parsing with Base64
* Trusting the token's `alg` value without an allowlist
* Accepting `alg: none`
* Hardcoded signing secret
* Signing key committed to Git
* Production key stored in frontend environment variables
* JWT sent in query parameters
* JWT sent in URL path parameters
* JWT printed in logs
* Authorization header printed in logs
* Wildcard credentialed CORS
* Unvalidated reflected Origin
* Global CSRF disablement without credential analysis
* GET endpoints that mutate authentication state
* Broad `permitAll`
* Controller-only authorization
* Frontend-only authorization
* Trusting role or user ID from request payload
* Returning different login errors for unknown and known accounts
* Permanent lockout as the only brute-force control
* Returning stack traces to clients
* Returning 200 for denied requests
* Generic `JwtUtil` god class
* Interface and abstraction layers without a security boundary
* Unit tests that mock away all token validation
* Declaring security complete without negative tests

---
