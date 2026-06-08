# AI Assistant Maintenance Manual

This manual governs how AI assistants (agents) should maintain and update this codebase. **Follow these rules strictly to ensure architectural integrity.**

## 1. Core Principles
- **Verification First:** Never propose code without running `make lint` and `make test`.
- **Sign-off:** All commits MUST be signed off using the current Git user: `Signed-off-by: Md Sohidul Islam Ananto <anontom90@gmail.com>`.
- **Documentation:** Architectural changes require an ADR (`docs/adr/`). New features require an RFC (`docs/rfc/`).

## 2. API & Data Contract
- **Named Structs:** Never use anonymous structs in handlers. Define them in `backend/internal/models/types.go`.
- **API Consistency:** All new endpoints must be registered in `internal/api/router.go` and verified against the Swagger definition.
- **Persistence:** High-frequency writes MUST use the batch-log-writer pattern implemented in `db/sqlite.go`.

## 3. UI/UX Contract (Stitch Design)
- **Design System:** All frontend components MUST strictly adhere to the "Stitch Design" principles.
- **Consistency:** Use the defined color palette, component patterns, and spacing rules from Stitch Design.
- **Styles:** Use TailwindCSS, mapped to Stitch Design utility classes. Avoid custom ad-hoc styling.
- **Data Fetching:** Always use the `usePolling` hook for live data.
- **Resilience:** All API data fetching MUST handle `null`/`undefined` states by defaulting to empty arrays/objects before accessing `.length` or `Object.entries()`.

## 4. Maintenance Workflow
1.  **Read:** Start by reading `.agents/shared/caveman.md` to understand current task status.
2.  **Plan:** If the task is complex, draft a plan in `.agents/shared/plans/`.
3.  **Implement:** Follow the rules above.
4.  **Verify:** Execute `make lint` && `make test`.
5.  **Commit:** Stage, sign off, and commit.
