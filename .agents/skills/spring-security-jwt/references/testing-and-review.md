# Security testing and review

## Contents

- Authentication and JWT tests
- Authorization and refresh tests
- CSRF, CORS, cookie, and error tests
- Verification
- Escalation
- Completion checklist
- Normative guidance

# Testing strategy

Security tests are mandatory.

Use:

* Spring Security Test
* MockMvc or WebTestClient according to the application type
* Integration tests
* Real JWT decoder tests
* Testcontainers for refresh-token persistence and concurrency when practical

Use Spring Security's `jwt()` request post-processor for authorization-focused tests.

Use real signed tokens and the actual `JwtDecoder` for token-validation integration tests.

Do not rely only on `@WithMockUser`.

## Authentication tests

Test:

* Valid login
* Incorrect password
* Unknown account
* Disabled account
* Suspended account
* Generic failure response
* Rate-limited login
* Password hash verification
* Successful audit event
* No password or token leakage

## JWT validation tests

Test rejection of:

* Missing token
* Malformed token
* Invalid signature
* Expired token
* Not-yet-valid token
* Wrong issuer
* Wrong audience
* Missing subject
* Wrong token type
* Unsupported algorithm
* `alg: none`
* Unknown key ID
* Token signed with retired key after the overlap period

## Authorization tests

Test:

* Anonymous access returns 401
* Authenticated user without permission returns 403
* User with correct permission succeeds
* Role hierarchy does not accidentally overgrant
* Horizontal access to another user's resource is denied
* Cross-tenant access is denied
* Administrative action requires administrative authority
* Method security remains effective when the service is called outside its controller
* Client-supplied user or tenant identifiers cannot bypass authorization

## Refresh-token tests

Test:

* Successful refresh
* Expired refresh token
* Revoked refresh token
* Unknown refresh token
* Rotation creates a replacement
* Old token cannot be reused
* Reuse revokes the full family
* Two concurrent refresh requests cannot both succeed
* Logout revokes the current family
* Logout all revokes all families
* Password change revokes required sessions
* Disabled user cannot refresh
* Raw token is not stored
* Raw token is not logged

## CSRF tests

Test:

* Refresh without a valid CSRF control is rejected when required
* Logout without a valid CSRF control is rejected when required
* Invalid Origin is rejected
* Allowed Origin succeeds
* Safe methods do not mutate state
* Bearer-only endpoints follow the documented CSRF strategy

## CORS tests

Test:

* Allowed production origin
* Disallowed origin
* Development origin absent from production configuration
* Preflight request
* Credentialed request behavior
* Wildcard is not returned with credentials
* Unexpected request headers are rejected when appropriate

## Cookie tests

Test:

* HttpOnly attribute
* Secure attribute in production
* SameSite attribute
* Correct path
* Correct expiration
* Correct deletion attributes
* Refresh token absent from response body

## Error tests

Test:

* 401 and 403 are differentiated
* Internal exception details are hidden
* Validation errors do not reveal security internals
* Authentication failures use consistent structure
* Correlation ID is present when required

---

# Verification commands

Run the project's exact configured commands.

Typical Maven verification:

```bash
./mvnw test
./mvnw verify
```

When formatting, static analysis and dependency scanning are configured, also run:

```bash
./mvnw spotless:check
./mvnw checkstyle:check
./mvnw org.owasp:dependency-check-maven:check
```

Do not introduce commands that are not configured in the project without explaining the required setup.

Review dependency vulnerabilities.

Do not suppress a vulnerability without:

* Documented impact analysis
* Compensating control
* Owner
* Expiration date
* Follow-up issue

---

# Architecture escalation rules

Stop and recommend a dedicated identity provider or authorization server when the project requires several of the following:

* Multiple independent frontend clients
* Mobile applications
* Third-party clients
* External developer access
* Single sign-on
* OpenID Connect
* Social login
* Enterprise federation
* Multiple resource servers
* Client credentials
* Authorization code flow
* Consent management
* Advanced MFA
* Device authorization
* Centralized identity governance
* Complex key distribution
* Organization-wide authentication

Possible solutions may include:

* Spring Authorization Server
* A managed OpenID Connect provider
* An approved enterprise identity provider

Do not casually implement a home-grown OAuth or OpenID Connect server.

---

# Review checklist

Before declaring security work complete, verify:

## Authentication

* Spring Security performs authentication.
* Passwords use an approved PasswordEncoder.
* Login failures are generic.
* Login and refresh are rate-limited.
* Disabled users cannot authenticate or refresh.

## JWT

* Spring Resource Server validates access tokens.
* Algorithm is explicitly allowed.
* Signature is validated.
* Issuer is validated.
* Audience is validated.
* Expiration is validated.
* Token type is validated.
* Claims contain no sensitive data.
* Access token is short-lived.
* Keys come from secure configuration.
* Key rotation is supported or documented.

## Refresh session

* Refresh token is opaque and random.
* Only its hash is stored.
* Cookie is HttpOnly.
* Cookie is Secure in production.
* SameSite is intentional.
* Token rotates after every use.
* Reuse detection revokes the family.
* Concurrent refresh is tested.
* Logout revokes server-side state.

## Authorization

* Default policy denies access.
* Public endpoints are explicit.
* Method security protects sensitive use cases.
* Resource ownership is validated.
* Tenant boundaries are validated.
* Frontend checks are not trusted.
* Client-supplied roles and ownership are ignored.

## Browser security

* Access token is not persisted in browser storage.
* CORS uses explicit origins.
* Credentialed CORS does not use wildcard origins.
* CSRF strategy matches credential transport.
* Cookie-backed endpoints are protected.
* Unsafe operations do not use GET.
* Production uses HTTPS.

## Observability

* Security events are recorded.
* Tokens and passwords are never logged.
* Authentication failures are observable.
* Refresh-token reuse is high priority.
* Audit values are sanitized.

## Testing

* Authentication negative tests pass.
* JWT validation negative tests pass.
* Authorization tests pass.
* Object-level authorization tests pass.
* Refresh rotation tests pass.
* CSRF tests pass.
* CORS tests pass.
* Cookie tests pass.
* Concurrent refresh tests pass.
* Production build and verification pass.

---

# Required completion report

When security work is finished, report:

* Authentication architecture
* Access-token transport
* Refresh-token transport
* JWT algorithm
* Issuer and audience validation
* Token lifetime strategy
* Key-management strategy
* Refresh-token rotation behavior
* Replay-detection behavior
* CSRF strategy
* CORS allowlist strategy
* Request-level authorization
* Method-level authorization
* Resource-level authorization
* Password-storage strategy
* Rate-limit strategy
* Audit events
* Security tests executed
* Verification commands executed
* Failed or skipped checks
* Remaining security risks
* Assumptions requiring production confirmation

Do not claim completion when:

* A token-validation requirement is missing
* Access tokens are persisted in insecure browser storage
* Raw refresh tokens are stored
* Refresh rotation is not atomic
* Authorization exists only in the frontend
* Object ownership is not checked
* CORS uses an unsafe wildcard
* Cookie-backed endpoints have no CSRF strategy
* Secrets are hardcoded
* Security negative tests are missing
* Verification commands fail

---

# Normative guidance

This skill is based on the security principles and implementation guidance from:

* Spring Security Reference
* Spring Security OAuth2 Resource Server documentation
* Spring Security Testing documentation
* OWASP Authentication Cheat Sheet
* OWASP Authorization Cheat Sheet
* OWASP REST Security Cheat Sheet
* OWASP Session Management Cheat Sheet
* OWASP CSRF Prevention Cheat Sheet
* OWASP HTML5 Security Cheat Sheet
* OWASP Password Storage Cheat Sheet
* OWASP Logging Cheat Sheet
* RFC 8725: JSON Web Token Best Current Practices
* RFC 9700: Best Current Practice for OAuth 2.0 Security
