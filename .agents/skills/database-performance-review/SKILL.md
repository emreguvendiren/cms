---
name: database-performance-review
description: Review or implement database changes involving entities, relationships, repository queries, indexes, pagination, cascades, batching, locking, or transaction boundaries. Use for persistence changes and list endpoints that can affect PostgreSQL correctness, concurrency, or performance.
---

# Database Performance Review

1. Identify the use case, expected data volume, query shape, and transaction owner.
2. Inspect entity mappings, constraints, fetch strategies, cascades, and generated SQL.
3. Count queries for affected reads and prevent N+1 access with query-specific strategies.
4. Review filtering, joining, uniqueness, foreign keys, sorting, and indexes together.
5. Require server-side pagination and deterministic ordering for potentially large results.
6. Prefer projections when full entities are unnecessary.
7. Keep transactions short and exclude remote network calls.
8. Review optimistic locking when concurrent writes can overwrite one another.
9. Add repository integration tests against PostgreSQL-compatible behavior.
10. Verify migrations, constraints, representative query plans, and affected backend checks.

Report query shape and count, index decisions, transaction and locking decisions, tests executed, failures, and remaining scale risks. Do not recommend eager loading globally or add speculative indexes without a query or constraint requirement.
