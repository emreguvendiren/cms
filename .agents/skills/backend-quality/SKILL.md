---

name: backend-quality

description: Review or implement substantial Spring Boot changes involving REST APIs, services, domain rules, transactions, persistence, security or external integrations.

---



# Backend Quality Workflow



1\. Identify the use case and transaction boundary.

2\. Keep HTTP concerns in the API layer.

3\. Keep orchestration in the application layer.

4\. Keep infrastructure details outside the domain layer.

5\. Reject unnecessary interfaces and generic base classes.

6\. Review validation and authorization.

7\. Review transaction length and remote calls.

8\. Review query count, generated SQL and N+1 risks.

9\. Review pagination and sorting.

10\. Review indexes when query patterns change.

11\. Add unit and integration tests.

12\. Run the backend verification stack.



Report:



\- Architectural findings

\- API findings

\- Database findings

\- Security findings

\- Tests added

\- Verification results

