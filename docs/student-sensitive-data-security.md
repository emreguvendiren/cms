# Student sensitive-data security

## Decision

Student telephone numbers are confidential personal data. They must never be stored as plaintext, returned as ciphertext for browser-side decryption, placed in browser storage, or written to application logs.

The React SPA is not a trusted cryptographic boundary. It never receives encryption or lookup keys. Decryption is performed only by the backend after request-level, method-level and resource-level authorization. Plaintext is returned only by an explicit high-risk reveal operation over HTTPS.

## Data flow

1. The SPA submits a phone number over HTTPS.
2. The backend normalizes it to a canonical Turkish E.164 value.
3. The backend encrypts it using AES-256-GCM with a fresh 96-bit IV.
4. The student identifier and field context are authenticated as AAD.
5. The database stores ciphertext, IV, key version and an HMAC-SHA-256 blind index.
6. Normal list and detail APIs return only a masked value and a presence flag.
7. `POST /api/students/{studentId}/phone/reveal` performs authorization, audit logging and backend decryption, then returns a non-cacheable response.

## Key management

- Encryption and lookup keys are independent 256-bit keys.
- Production keys must come from an external secret-management or KMS/HSM boundary and must never be committed, stored in PostgreSQL or exposed to frontend configuration.
- Production startup fails closed when a key is missing, malformed or weak.
- Local and test keys are explicitly scoped to their environments and must never be accepted by production.
- Every encrypted value carries a key version. The current environment-key adapter intentionally accepts only the active version and fails closed for unknown versions; a production KMS/key-ring adapter must retain approved historical decrypt keys during rotation.
- Key rotation, backup recovery and compromise response must be exercised before production launch.

## API exposure policy

- Student list and ordinary detail responses never contain plaintext phone numbers or cryptographic material.
- Phone reveal uses POST to avoid unsafe-data retrieval through cacheable GET semantics.
- Reveal responses include `Cache-Control: no-store` and `Pragma: no-cache`.
- Reveal requires `student:phone:reveal`; deleting a student requires `student:delete`.
- Frontend permission checks are UX controls only. Backend authorization is mandatory and deny-by-default.
- Revealed phone values remain only in component memory and are cleared when the detail modal closes.

## Search and uniqueness

Randomized AES-GCM ciphertext is intentionally not searchable. Exact phone duplicate detection uses `HMAC-SHA-256(normalizedPhone, lookupKey)` in `phone_lookup_hash` with a unique index. Partial, suffix and contains searches are not supported because they would require weaker or disclosure-prone indexing.

## Logging and auditing

Audit events record actor ID, target student ID, operation and outcome. They never record plaintext phone, ciphertext, IV, HMAC, keys or sensitive request/response bodies. Normal operational reveal relies on the dedicated permission instead of forcing staff to enter repetitive free-text reasons.

Required events include student create/update/delete, phone change, reveal success, reveal denial/failure and key-rotation operations.

## Deletion and retention

The interactive delete operation is a soft delete because education and financial records may require retention. It records deletion time and actor identity and excludes the student from normal queries. Irreversible purge and cryptographic erasure belong to a separately approved retention process.

## Threats and controls

| Threat | Control |
| --- | --- |
| Database or backup exfiltration | AES-256-GCM; keys stored outside the database |
| Ciphertext modification | GCM authentication tag and AAD |
| Duplicate phone registration | Separate keyed HMAC blind index |
| XSS or browser extension theft | No browser decryption key; masked-by-default UI; memory-only reveal |
| Horizontal or vertical privilege escalation | Fine-grained backend authorities and resource lookup |
| Log and telemetry leakage | No sensitive values in logs; structured identifier-only audit events |
| Stale or compromised key | Versioned keys, documented rotation and fail-closed startup |
| Bulk scraping by an authorized account | Separate reveal permission, one-record endpoint, audit trail and future rate/anomaly controls |

## Production prerequisites

- HTTPS and HSTS at the deployment boundary.
- Managed KMS/Vault/HSM integration and workload identity.
- Encrypted backups with separately controlled restore access.
- Central audit-log protection, retention and alerting.
- CSP/XSS hardening and dependency monitoring for the SPA.
- Phone-reveal rate limiting and anomaly alerts before broad user rollout.
- A documented KVKK retention, access-review and incident-response process.

## Normative references

- OWASP Cryptographic Storage Cheat Sheet
- OWASP Key Management Cheat Sheet
- OWASP Logging Cheat Sheet
- NIST SP 800-57 Part 1 Rev. 5
