---
name: spring-security-jwt
description: Design, implement, or review Spring Boot authentication and authorization with Spring Security and JWT access tokens. Use for login, logout, token issuance or validation, refresh sessions, password handling, roles, permissions, protected endpoints, method security, CORS, CSRF, security headers, authentication cookies, account-state changes, and security tests.
---

# Spring Security JWT

Build authentication and authorization that is secure by default, deny-by-default, testable, auditable, and based on Spring Security primitives. Never weaken a security control merely to simplify development.

## Required workflow

1. Read the root and `cmsBackend/AGENTS.md` instructions and inspect relevant architecture documentation.
2. Establish public endpoints, protected operations, permissions, ownership rules, deployment origins, credential transport, account-state behavior, failure responses, signing-key management, and required negative tests.
3. Present the implementation boundary before editing. Do not begin until credential transport and trust boundaries are explicit.
4. Use Spring Security Resource Server, `JwtDecoder`, `JwtEncoder`, method security, and standard handlers. Do not build a generic JWT filter or `JwtUtil`.
5. Keep JWT validation separate from authorization. Revalidate ownership, tenant membership, mutable permissions, account status, and high-risk decisions against server-authoritative state.
6. Implement the smallest complete vertical slice, including negative security tests.
7. Use `$api-contract-sync` for authentication API changes, `$database-performance-review` for refresh-session persistence or concurrency, `$backend-quality` for substantial backend work, and `$code-change-verification` before completion.

## Reference routing

- Read [browser-authentication.md](references/browser-authentication.md) for access-token transport, opaque refresh cookies, and login/refresh/logout flows.
- Read [jwt-and-spring-security.md](references/jwt-and-spring-security.md) for dependencies, filter-chain rules, signing algorithms, claims, key rotation, and validation.
- Read [refresh-cookie-csrf-cors.md](references/refresh-cookie-csrf-cors.md) for persistence, atomic rotation, replay detection, cookies, CSRF, and CORS.
- Read [passwords-and-authorization.md](references/passwords-and-authorization.md) for password hashing, rate limiting, roles, permissions, ownership, tenant checks, and account-state changes.
- Read [security-operations.md](references/security-operations.md) for error handling, audit logging, secrets, headers, validation, package structure, and forbidden patterns.
- Read [testing-and-review.md](references/testing-and-review.md) for test matrices, verification, architecture escalation, the completion checklist, and normative sources.

Read every reference whose topic is affected; do not load unrelated references.

## Non-negotiable defaults

- Fail closed and keep public endpoints explicit.
- Validate signature, allowed algorithm, issuer, audience, expiration, not-before, subject, token type, and required claims.
- Never persist access tokens in browser storage or expose raw refresh tokens to JavaScript or database storage.
- Protect cookie-authenticated unsafe operations against CSRF; JWT usage alone does not make CSRF irrelevant.
- Use exact production CORS origins and never combine credentialed CORS with wildcard origins.
- Keep private keys and production secrets outside source control and frontend configuration.
- Return 401 for failed authentication and 403 for failed authorization without leaking internals.
- Test invalid tokens, denied authorization, cross-resource access, refresh replay, concurrent refresh, CSRF, CORS, and cookie attributes.

## Completion report

Report the authentication architecture, credential transport, signing and validation policy, token lifetimes, key management, refresh rotation and replay behavior, CSRF and CORS strategy, authorization layers, password storage, abuse controls, audit events, tests and commands executed, failed or skipped checks, remaining risks, and production assumptions. Do not claim completion while a required validation, negative test, or verification check is missing or failing.
