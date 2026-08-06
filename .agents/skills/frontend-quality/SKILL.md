---

name: frontend-quality

description: Review or implement substantial React TypeScript changes with attention to component boundaries, state ownership, rendering performance, accessibility, API state and strict typing.

---



# Frontend Quality Workflow



1\. Identify state ownership.

2\. Separate server state, client state, form state and URL state.

3\. Check whether derived values are incorrectly stored in state.

4\. Check whether Effects are being used for derivation.

5\. Inspect component boundaries and prop flow.

6\. Detect unstable context values and unnecessary global state.

7\. Detect unstable keys and mutable list problems.

8\. Do not add memoization automatically.

9\. Use memoization only for measured or structurally expensive work.

10\. Verify loading, empty, error and success states.

11\. Verify keyboard and accessible interaction.

12\. Run type checking, linting, tests and production build.



Report:



\- Correctness issues

\- Render risks

\- Type-safety issues

\- Accessibility issues

\- Recommended changes

\- Verification results

