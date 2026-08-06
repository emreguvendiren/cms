# JWT and Spring Security

## Contents

- Spring Security components
- Dependencies
- Filter-chain and session rules
- Signing, claims, and validation

# Spring Security implementation rules

Use Spring Security's standard infrastructure.

Preferred components include:

* `SecurityFilterChain`
* `AuthenticationManager`
* `AuthenticationProvider`
* `PasswordEncoder`
* `JwtEncoder`
* `JwtDecoder`
* `JwtAuthenticationConverter`
* `OAuth2TokenValidator<Jwt>`
* `AuthenticationEntryPoint`
* `AccessDeniedHandler`
* Method security
* Spring Security Test

Configure JWT-protected APIs using OAuth2 Resource Server support.

Preferred direction:

```java
http.oauth2ResourceServer(resourceServer ->
    resourceServer.jwt(jwt -> {
        // Decoder and authentication converter configuration
    })
);
```

Do not create a custom `OncePerRequestFilter` merely to:

* Read the Authorization header
* Parse a JWT
* Validate a JWT
* Populate the SecurityContext

A custom filter requires an explicit security reason and filter-chain review.

Do not manually decode JWT payloads using Base64.

Decoding is not validation.

---

# Dependencies

Prefer official Spring Security dependencies.

Typical dependencies include:

```text
spring-boot-starter-security
spring-boot-starter-oauth2-resource-server
spring-boot-starter-validation
spring-security-test
```

Use Spring Security JOSE support for JWT encoding and decoding.

Do not introduce a second JWT library when Spring Security already satisfies the requirement.

A new JWT library requires:

* Security justification
* Dependency review
* Maintenance review
* Compatibility review
* Explicit approval

---

# Security filter-chain rules

Security configuration must be explicit.

Use:

```text
Public endpoints
→ Explicit permit rules

Protected endpoints
→ Explicit authorization rules

All remaining endpoints
→ Authenticated or denied
```

The final rule must fail closed.

Examples of public endpoints may include:

* Login
* Refresh
* Health readiness endpoint when intentionally public
* Public API documentation only when intentionally exposed
* Password-reset request endpoint
* Password-reset completion endpoint

Do not make actuator, API documentation or administrative endpoints public by accident.

Forbidden patterns include:

```java
.anyRequest().permitAll()
```

```java
.requestMatchers("/api/**").permitAll()
```

```java
.requestMatchers("/**").permitAll()
```

Avoid broad wildcard rules.

Review authorization when a controller path changes.

---

# Session management

For JWT access-token APIs, configure stateless request authentication.

Do not create an HTTP session for bearer-token authentication.

Do not use the servlet session as a hidden second authentication mechanism unless the architecture explicitly requires it.

The refresh-session database records are application security records.

They are not servlet HTTP sessions.

Do not confuse:

* Stateless API request authentication
* Stateful refresh-session revocation

A secure JWT architecture can use stateless access-token validation while retaining server-side refresh-session state.

---

# JWT signing rules

Prefer asymmetric signatures.

Suitable approved algorithms may include:

* RS256
* PS256
* ES256

The selected algorithm must be documented.

The verification algorithm must never be selected dynamically from untrusted token data.

Maintain an explicit algorithm allowlist.

Reject:

* `alg: none`
* Unknown algorithms
* Unexpected algorithms
* Tokens signed using a key type inconsistent with the configured algorithm
* Tokens with unrecognized key identifiers
* Tokens without required headers or claims

Do not use the same key for unrelated cryptographic purposes.

Do not store private signing keys:

* In source code
* In Git
* In frontend code
* In committed configuration
* In Docker images
* In test fixtures reused in production
* In application logs

Production private keys must come from an approved secret-management mechanism.

Support key rotation.

Use a stable and non-sensitive `kid` header when multiple keys are active.

During rotation:

1. Begin signing with the new private key.
2. Continue accepting the previous public key during the planned overlap period.
3. Retire the previous verification key after all tokens signed by it must have expired.
4. Record the rotation event.

---

# Required access-token claims

An access token should contain only the minimum claims required by the API.

Expected claims normally include:

* `iss`: trusted token issuer
* `sub`: stable non-sensitive user identifier
* `aud`: intended API audience
* `iat`: issued-at timestamp
* `exp`: expiration timestamp
* `jti`: unique token identifier
* `typ` or an application token-type claim
* Approved authorities or scopes when appropriate

The subject should normally be an immutable internal user identifier.

Do not use an email address as the permanent security identity when emails can change.

Do not place sensitive information in JWT claims.

JWT payloads are encoded, not confidential.

Do not include:

* Passwords
* Password hashes
* Access tokens
* Refresh tokens
* Secret keys
* Full personal profiles
* Sensitive financial information
* Internal security notes
* Unnecessary personally identifiable information

Avoid placing highly mutable data in access tokens.

A role or permission change does not automatically modify an already-issued JWT.

Mitigate stale claims through:

* Short access-token lifetime
* Refresh-session revocation
* Token security version
* Database authorization for high-risk operations
* Reauthentication for sensitive actions

---

# JWT validation rules

Every access token must pass all applicable checks:

1. Token format is valid.
2. Signature is valid.
3. Algorithm is explicitly allowed.
4. Signing key is trusted.
5. `kid` resolves to an approved key when used.
6. Issuer exactly matches the configured issuer.
7. Audience contains the intended API audience.
8. Expiration is present and valid.
9. Not-before time is valid when present.
10. Issued-at time is reasonable when required.
11. Subject is present and valid.
12. Token type matches an access token.
13. Required claims are present.
14. Token is not being used in a context intended for another token type.
15. Configured clock skew is small and intentional.

Fail closed on validation errors.

Do not continue with partially validated claims.

Do not catch token-validation errors and manually authenticate the request.

Use separate validation rules for:

* Access tokens
* Email-verification tokens
* Password-reset tokens
* Service tokens
* Refresh tokens

A token created for one purpose must not be accepted for another purpose.

Prefer opaque, single-use random tokens rather than JWTs for password reset and email verification.

---
