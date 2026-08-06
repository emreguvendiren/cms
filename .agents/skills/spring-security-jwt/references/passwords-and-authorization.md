# Passwords and authorization

## Contents

- Password storage
- Authentication abuse protection
- Request, method, and resource authorization
- Roles and current-user access
- Account-state changes

# Password-security rules

Use Spring Security's `PasswordEncoder`.

Prefer a supported adaptive one-way password-hashing algorithm.

Suitable choices include:

* Argon2id where operationally supported
* BCrypt
* PBKDF2
* SCrypt

Do not:

* Encrypt passwords reversibly
* Store plaintext passwords
* Hash passwords using plain SHA-256
* Hash passwords using MD5
* Create a custom password-hashing algorithm
* Use a static unsalted digest
* Log passwords
* Return passwords in API responses

Use `DelegatingPasswordEncoder` or an approved versioned encoding strategy so password hashes can be upgraded.

Calibrate the work factor in the deployment environment.

Password verification must be intentionally expensive but operationally acceptable.

Rehash passwords after successful authentication when their stored encoding is outdated.

Do not expose whether a username exists through login errors.

Use a generic response such as:

```text
E-posta adresi veya şifre hatalı.
```

Use approximately consistent authentication processing for existing and non-existing users to reduce enumeration signals.

---

# Login and authentication abuse protection

Apply backend-enforced rate limiting to:

* Login
* Refresh
* Password-reset request
* Password-reset completion
* Email verification resend
* MFA verification when present

Consider a combination of:

* Per-account limit
* Per-IP limit
* Per-device or session-family limit
* Progressive delay
* Temporary challenge
* Security alerting

Do not rely only on permanent account lockout.

An attacker must not be able to easily lock another user's account indefinitely.

Rate-limit decisions must be observable and auditable.

Do not reveal which exact limit was triggered when doing so would aid attackers.

---

# Authorization model

Apply least privilege.

Deny access unless an explicit rule grants it.

Use authorization at multiple levels:

## Request-level authorization

Use `authorizeHttpRequests` for broad endpoint protection.

Examples:

* Public authentication endpoints
* Authenticated API endpoints
* Administrative endpoint boundaries
* Internal operational endpoints

## Method-level authorization

Enable method security.

Use method-level checks at application-service boundaries for sensitive use cases.

Examples:

```java
@PreAuthorize("hasAuthority('customer:read')")
```

```java
@PreAuthorize("hasAuthority('customer:update')")
```

Avoid relying only on controller annotations.

Application services may be called from:

* Controllers
* Scheduled jobs
* Messaging consumers
* Other services
* Tests
* Future entry points

## Resource-level authorization

A role does not automatically grant access to every record of that type.

Verify:

* Resource ownership
* Organization membership
* Tenant membership
* Branch membership
* Portfolio assignment
* Data classification
* Record state
* Operation-specific permission

Prefer repository queries scoped by the authenticated subject.

Better:

```text
Find customer by customer ID and permitted organization ID.
```

Worse:

```text
Find customer by ID, then assume the authenticated user may access it.
```

Never trust a client-supplied:

* User ID
* Role
* Tenant ID
* Organization ID
* Ownership flag
* Permission list

Compare client-supplied context against server-authoritative membership.

Prevent horizontal and vertical privilege escalation.

---

# Role and permission rules

Prefer fine-grained authorities for application actions.

Examples:

```text
customer:read
customer:create
customer:update
customer:delete
report:export
user:invite
user:role:update
```

Roles may group permissions:

```text
ROLE_ADMIN
ROLE_MANAGER
ROLE_ANALYST
```

Do not scatter hardcoded role strings throughout the application.

Centralize authority names.

Use consistent naming.

Avoid embedding complex business policy directly into long SpEL expressions.

For complex rules, use a dedicated authorization service or `AuthorizationManager`.

Keep policy logic testable.

---

# Current-user access

Do not repeatedly read raw token claims throughout business code.

Provide an intentional authenticated-principal abstraction.

It may expose:

```text
userId
authorities
tenantId when trustworthy for the use case
sessionId or token ID when required
```

Do not pass the entire JWT deep into the domain layer.

Do not make business logic depend directly on HTTP request objects.

Use immutable, typed security-principal data.

---

# Account-state changes

When a user is:

* Disabled
* Deleted
* Suspended
* Password-reset
* Password-changed
* Removed from an organization
* Removed from a tenant
* Demoted from a privileged role

Perform the relevant session-security actions.

At minimum:

1. Revoke affected refresh sessions.
2. Prevent new refresh operations.
3. Record an audit event.
4. Decide how already-issued access tokens are handled.

For critical applications, consider:

* Security-version validation
* High-risk endpoint database checks
* Access-token denylist for emergency revocation
* Opaque access tokens
* Token introspection
* Shorter access-token lifetime

Do not claim that a JWT can be instantly revoked without a server-side strategy.

---
