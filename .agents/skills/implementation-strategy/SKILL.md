---

name: implementation-strategy

description: Plan substantial frontend or backend changes before editing code. Trigger for new features, architecture changes, shared abstractions, API changes, database changes, caching, authentication or concurrency.

---



# Implementation Strategy



Before editing code:



1\. Inspect the existing repository structure and relevant documentation.

2\. Identify the affected frontend features, backend modules and API contracts.

3\. Describe the current behavior.

4\. Define the requested behavior.

5\. List architectural boundaries that must remain intact.

6\. Identify database, API, security and performance risks.

7\. Prefer the smallest complete vertical slice.

8\. Reuse existing patterns when they are sound.

9\. Reject premature generic abstractions.

10\. Define the verification plan.



Output:



\- Affected areas

\- Proposed design

\- Data flow

\- API changes

\- Database changes

\- Risks

\- Testing plan

\- Files expected to change

