---
name: api-contract-sync
description: Synchronize API routes, request and response models, validation, status codes, pagination, filtering, sorting, OpenAPI documents, and generated TypeScript clients. Use whenever a backend or frontend change modifies the HTTP integration boundary.
---

# API Contract Sync

1. Inspect the existing OpenAPI document, backend endpoint, and generated frontend client before editing.
2. Define the requested contract change, compatibility impact, validation rules, status codes, and error responses.
3. Update the OpenAPI contract as the source of truth.
4. Update the backend implementation without exposing persistence entities.
5. Regenerate the frontend client using the repository's generator; do not hand-copy DTOs.
6. Update frontend consumers through the generated public API.
7. Validate the OpenAPI document and check for unintended breaking changes.
8. Run backend tests, frontend type checking, and affected integration tests.

Report changed operations and schemas, compatibility decisions, generated artifacts, commands executed, failures, and remaining risks. Do not claim synchronization while generated output differs from the contract.
