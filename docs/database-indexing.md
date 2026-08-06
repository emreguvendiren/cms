# Database indexing standard

## Purpose

Relationship indexes are defined explicitly because PostgreSQL does not automatically create indexes for foreign-key columns. Every new relation must be reviewed together with its join, lookup, delete-check and cascade query shapes.

## Rules

- Add an index to a foreign-key column when it is used for joins, relationship loading, parent deletion checks, filtering or cascade operations.
- Match composite index column order to the query prefix. A unique index on `(class_id, student_id)` can support queries beginning with `class_id`, but it cannot replace a `student_id`-leading index.
- Do not add duplicate indexes when an existing primary-key, unique or composite index already supports the same leading-column query shape.
- Add indexes for actual filtering and deterministic sorting patterns; do not index every column speculatively.
- Review index write/storage cost and query plans as data volume grows.
- Keep entity metadata and production database migrations synchronized. Hibernate schema update is not a production migration strategy.

## Current relationship index inventory

| Relation | Index | Reason |
| --- | --- | --- |
| `course_classes.course_id -> courses.id` | `idx_course_classes_course` | Course/class joins and parent-course delete checks |
| `class_enrollments.class_id -> course_classes.id` | `idx_class_enrollments_class` | Class detail, enrollment count and parent-class checks |
| `class_enrollments.student_id -> students.id` | `idx_class_enrollments_student` | Student enrollment history and student-side joins |
| `refresh_sessions.user_id -> users.id` | `idx_refresh_session_user` | User session lookup and revocation operations |
| `user_authorities.user_id -> users.id` | `idx_user_authorities_user` | Authority collection loading and user updates/deletes |
| `students.phone_lookup_hash` | Unique index | Exact normalized-phone duplicate detection without decrypting values |
| `students.status, students.deleted_at, students.full_name, students.id` | Composite list index | Active student filtering with deterministic pagination |

`class_enrollments` also has the unique constraint `uk_class_enrollment_student (class_id, student_id)` to prevent duplicate enrollment. The explicit student-leading index remains necessary for student-side queries.

## Review checklist

For every new or changed relation:

1. Identify the owning transaction and expected row count.
2. List join, filter, sort, deletion and cascade query shapes.
3. Check whether an existing index has the required leading columns.
4. Add only the missing index and give it a stable descriptive name.
5. Verify constraints, generated SQL and representative PostgreSQL query plans before high-volume release.

Sensitive lookup indexes must use a keyed blind index where randomized encryption prevents direct lookup. Never index plaintext phone numbers or ciphertext for search.
