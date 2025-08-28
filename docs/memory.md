# Memory Management Protocol - Version: 1.0.0

## Purpose & Scope

This rule outlines the **critical protocol** for consulting and maintaining persistent knowledge to enhance AI performance, ensure consistency, and prevent the repetition of errors. It governs the interaction with files that store project-specific information, learned corrections, API documentation, database schemas, user coding preferences, and application features. Adherence to this protocol is mandatory for all AI interactions.

## Implementation Guidelines

### Core Operational Mandates:

1. **Initial Memory Scan (MANDATORY FIRST STEP):**
   - **MUST**: At the absolute beginning of every user request processing, read the content of:
     - `rules/project.md` (for project-specific guidelines and overarching project context)
     - `rules/code-preferences.md` (for user-specific, one-line coding preferences)
   - This initial scan is crucial for context awareness and error prevention.

2. **Targeted Memory Consultation (AS NEEDED):**
   - **MUST**: When the user's query or the ongoing task involves database interactions, consult:
     - `docs/database-schema.md` (for database documentation guidelines and structure)
     - `docs/database-schema/` directory (for detailed database components).
   - **MUST**: When the user's query or the ongoing task involves API interactions (either consuming or defining):
     - `docs/apis.md` (for API documentation guidelines, structure, and examples)
     - `docs/apis/` directory (for existing API endpoints, request/response formats, authentication)
   - **MUST**: When creating or modifying tests, or when test-related issues arise, consult:
     - `docs/ttd-flow.md` (for testing standards, patterns, and comprehensive test creation workflow)
   - **MUST**: When working with specific app features, consult relevant files in:
     - `docs/features/` directory (for feature-specific documentation and implementation details)
   - **SHOULD**: When encountering errors or debugging, check for similar issues in:
     - `docs/mistakes/` directory (for previously encountered and resolved errors)

3. **Proactive Update Protocol (MANDATORY FINAL STEP):**
   - **MUST**: At the conclusion of processing every user request, and _before_ sending the final response to the user, explicitly review if any of the following memory locations require updates based on the interaction:
     - `mistakes/[error-category].md`: If any mistake was made and corrected, or a significant error was resolved.
     - `features/[feature-name].md`: If any new feature was implemented, or existing feature behavior was modified.
     - `src/__tests__/[feature-category]/[feature-name].test.ts`: If any new feature was implemented that requires comprehensive test coverage following the `@ttd-flow.md` protocol.
     - `@project.md`: If any new project standard or global context was established or clarified.
     - `@code-preferences.md`: If any user coding preference was added, modified, or clarified.
     - `docs/database-schema.md`: If database documentation guidelines were updated.
     - `docs/database-schema/` directory: If any database schema elements were created, modified, or deleted.
     - `docs/apis/` directory: If any API endpoints were created, modified, or deleted, or if their documented behavior changed.
   - **MUST**: If an update is deemed necessary for any of these files, perform the update using the `edit_file` tool.
   - **Confirmation**: Explicitly state in your thought process or a (silent) note if you checked for updates and whether any were made.

### Specific Memory File Management

- mistakes/[error-category].md — Log each resolved error with problem, wrong approach, correct solution, root cause, prevention, and related files. See docs/memory-entries.md ## mistakes for the template.
- features/[feature-name].md — Document new/changed features with overview, architecture, key components, APIs, DB schema, configuration, common issues, testing strategy, and last updated. See docs/memory-entries.md ## features for the template.
- @project.md — Record new project-wide standards or context not covered elsewhere.
- @code-preferences.md — Add or modify one-line user coding preferences.
- docs/database-schema.md — Update database documentation guidelines and structure.
- docs/database-schema/ — Document DDL changes in appropriate files.
- docs/apis/ — Document created/changed/removed endpoints in individual files (path, method, purpose, request/response, authentication).
- src/**tests**/[feature-category]/[feature-name].test.ts — Create/update tests following docs/ttd-flow.md; include contract validation, success/error cases, business logic, authorization, rate limiting; use TypeScript + Jest + ts-jest; mock external dependencies; define Zod schemas.

### General Memory Hygiene:

    *   **Clarity and Structure:** Keep memory files well-structured with clear headings (e.g., using `###`). Group related information.
    *   **Relevance:** Ensure information saved is generally applicable and reusable, not overly specific to a single, transient request.
    *   **Conciseness:** Be clear but avoid excessive verbosity.
    *   **Up-to-Date:** If a better solution or understanding for a logged item is found, update the existing entry.
    *   **File Organization:** Use descriptive filenames and maintain consistent naming conventions across directories.
    *   **Cross-References:** Link related mistakes, features, and documentation where appropriate.

## Storage Paths

- **Error Documentation:** `mistakes/[error-category].md` (distributed error documentation)
- **Feature Documentation:** `features/[feature-name].md` (feature-specific documentation)
- **Test Coverage:** `src/__tests__/[feature-category]/[feature-name].test.ts` (comprehensive test files)
- **Project Context & Standards:** `rules/project.md`
- **User Coding Preferences:** `rules/code-preferences.md`
- **Database Schema:** `docs/database-schema.md` and `docs/database-schema/` directory
- **API Documentation:** `docs/apis/` directory
- **Testing Standards & Workflow:** `docs/ttd-flow.md`

## Enforcement

- **CRITICAL ERROR:** Failure to perform the **Initial Memory Scan** at the start of a request.
- **CRITICAL ERROR:** Failure to perform the **Proactive Update Protocol** (checking and making necessary updates to memory files) at the end of a request.
- All AI-generated outputs and actions **MUST** be consistent with the information contained within these memory files and directories.
