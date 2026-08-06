\# Project Engineering Instructions



\## Project overview



This repository contains:



\- `cmsFrontend/`: React and TypeScript web application.

\- `cmsBackend/`: Spring Boot REST API.

\- `contracts/`: OpenAPI contracts and generated clients.

\- `docs/`: Architecture decisions and engineering standards.

\- `infra/`: Local and production infrastructure definitions.



The application is designed as a modular monolith.



\## Product definition



The product is owned by **İkiteknik Bilişim** and is named

**İkiteknik Eğitim Operasyon Platformu**.



İkiteknik Bilişim provides adult-focused, practice-oriented technical and

software training, including AutoCAD, SolidWorks, CATIA, CNC, 3ds Max and

related professional education programs.



The platform is the operational system of record for the full education

lifecycle. Its primary responsibilities are:



\- Prospective student and enrolled student registration.

\- Student profile, communication, consent and enrollment history management.

\- Course, cohort, classroom, schedule, instructor and capacity management.

\- Student enrollment into courses and attendance tracking.

\- Payment plan, collection, discount, refund, income and expense management.

\- Financial tables, cash-flow reporting and decision-oriented charts.

\- Dynamic configuration of courses, pricing, operational statuses and

&#x20; institution-specific workflows without hardcoded business data.



The first deployment serves İkiteknik Bilişim's own education center. The

architecture must preserve a realistic path toward commercialization as either

a multi-tenant SaaS product or a directly deployed institutional solution.

Do not introduce tenant isolation prematurely, but do not make decisions that

irreversibly assume a single institution. Institution ownership, data scope,

configuration boundaries and migration strategy must be considered in new

domain and persistence designs.



Primary users include education-center administrators, student registration

staff, accounting staff, instructors and authorized management users. Future

student self-service access may be introduced as a separate authorization

boundary.



Data confidentiality is a critical product requirement. Student personal data,

contact information, financial records, credentials and operational reports

must be protected against unauthorized access and cross-institution leakage.

Apply least privilege, deny by default, auditable sensitive operations,

resource-level authorization, secure exports, data minimization and explicit

retention rules. Never rely only on hidden UI controls for authorization.



When planning features, proactively identify useful adjacent capabilities and

present them as optional product recommendations rather than silently expanding

scope. Relevant future candidates include lead and follow-up management,

attendance and absence alerts, certificate lifecycle, instructor planning,

installment reminders, consent/KVKK records, document management, audit logs,

role and permission administration, notification integrations, branch support,

tenant administration, backups and operational anomaly alerts.



\## Mandatory workflow



Before implementing a feature that affects architecture, API contracts,

database structure, concurrency, caching, authentication, or shared abstractions:



1\. Read the relevant files under `docs/`.

2\. Use `$implementation-strategy`.

3\. Present the implementation boundary before editing.

4\. Implement the smallest complete vertical slice.

5\. Run `$code-change-verification`.

6\. Do not report completion unless the relevant checks pass.



Use `$frontend-quality` for substantial frontend changes.



Use `$backend-quality` for substantial backend changes.



Use `$api-contract-sync` whenever request models, response models,

status codes, API routes, pagination, filtering, or validation rules change.



Use `$database-performance-review` when changing entities, relations,

queries, indexes, pagination, cascade behavior, or transaction boundaries.



\## General engineering rules



\- Prefer simple, explicit and maintainable code over clever code.

\- Do not introduce an abstraction for a single hypothetical use case.

\- Create generic abstractions only when at least two concrete use cases

&#x20; share the same semantics and are expected to evolve together.

\- Prefer composition over inheritance.

\- Do not create generic BaseController, BaseService or BaseRepository

&#x20; hierarchies unless the repository already has an approved use case.

\- Do not create an interface for every class.

\- Use interfaces at architectural boundaries, replaceable integrations,

&#x20; domain ports and test seams.

\- Keep functions and classes focused on one responsibility.

\- Preserve existing public API behavior unless the task explicitly changes it.

\- Never silently add production dependencies.

\- Never expose secrets, credentials, internal exceptions or stack traces.

\- Do not leave TODO comments without explaining the blocker.



\## API rules



\- Treat the OpenAPI contract as the integration boundary between

&#x20; frontend and backend.

\- Do not manually duplicate backend DTO definitions in frontend code

&#x20; when they can be generated from the contract.

\- Use consistent HTTP status codes and error response structures.

\- Validate input at the system boundary.

\- Do not expose persistence entities directly through REST controllers.

\- Pagination must be performed on the server for potentially large datasets.

\- List endpoints must define pagination, filtering and sorting behavior.



\## Database rules



\- Review query count and query shape for every list endpoint.

\- Prevent N+1 query problems.

\- Do not use eager loading as a global fix.

\- Add indexes based on actual query and constraint requirements.

\- Foreign keys used in frequent filtering, joining or cascade operations

&#x20; must be reviewed for indexing.

\- Transactions must be owned by the application/service layer.

\- Do not perform remote network calls inside database transactions.

\- Use optimistic locking when concurrent updates can overwrite each other.



\## Testing rules



\- Add tests for changed behavior, not implementation details.

\- Backend business rules require unit tests.

\- Repository queries require integration tests.

\- Critical API flows require integration tests.

\- Frontend user behavior requires component or integration tests.

\- Bug fixes require a regression test when practical.

\- Tests must cover success, validation failure and relevant boundary cases.



\## Completion requirements



Before declaring a task complete:



\- Build passes.

\- Type checking passes.

\- Lint passes.

\- Relevant tests pass.

\- API contract remains synchronized.

\- No debug code, unused imports or accidental generated files remain.

\- Summarize architectural decisions and remaining risks.

Use $spring-security-jwt before implementing authentication.

Design secure authentication for a React TypeScript SPA and Spring Boot API.

Requirements:
- Spring Security OAuth2 Resource Server for JWT validation.
- Short-lived JWT access tokens.
- Access token kept only in frontend memory.
- Rotating opaque refresh tokens.
- Refresh token stored in an HttpOnly, Secure and intentional SameSite cookie.
- Store only refresh-token hashes in the database.
- Detect refresh-token reuse and revoke the token family.
- Validate signature, algorithm, issuer, audience, expiration and token type.
- Deny access by default.
- Use request-level, method-level and resource-level authorization.
- Configure CORS with exact origins.
- Define an explicit CSRF strategy for cookie-backed endpoints.
- Add negative security tests.
- Do not create a custom JWT filter unless Spring Security cannot satisfy a documented requirement.

Before implementation:
1. Present the authentication flow.
2. Present the refresh-token persistence model.
3. Present the authorization model.
4. Present the CSRF and CORS strategy.
5. List threats and mitigations.

After implementation:
1. Run $code-change-verification.
2. Report all security tests.
3. Report any remaining risks.
