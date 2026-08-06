---
name: code-change-verification
description: Run the mandatory frontend and backend verification stack after runtime code, tests, API contracts, database mappings or build configuration change.
---

# Code Change Verification

Determine which areas changed.

For frontend changes, detect the package manager from the lockfile and run the corresponding available scripts:

1. Type checking
2. Linting
3. Tests
4. Production build

Do not invent a command when its script is absent. Report the missing verification command as an unverified area.

For backend changes, use the Maven wrapper for the current operating system and run:

1. `./mvnw compile`
2. `./mvnw test`
3. `./mvnw verify`

For contract changes:

1. Validate the OpenAPI document.
2. Regenerate the TypeScript API client.
3. Confirm generated files are synchronized.
4. Run frontend type checking.
5. Run backend tests.

Do not claim success if any command fails.

Provide:

- Commands executed
- Passed checks
- Failed checks
- Relevant failure output
- Remaining unverified areas
