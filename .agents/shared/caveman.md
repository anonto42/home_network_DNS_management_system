# caveman.md — compressed state

> Dense notes. Append at top when state changes. Never delete lines.
> NEW: Reference `.agents/shared/memories/README.md` for project history and research summaries to minimize tokens.
> NEW: Research must follow `docs/research/TEMPLATE.md`.
> RULE: All new documentation MUST follow the structure defined in `docs/README.md`.
> RULE: All memory snapshots MUST be stored and maintained in the directory: `.agents/shared/memories/`.
> RULE: Trigger a new memory snapshot file in `.agents/shared/memories/` every 300 lines of combined history.
> RULE: Memory snapshots MUST contain: Date, Context, Summary, Key Decisions.

---
## 2026-06-08 — Documentation & Memory Framework Implemented (v3)
## 2026-06-08 — Core DNS Migration In Progress

DONE:
- Created `docs/README.md` as the authoritative documentation mapping.
- Centralized `memories/` under `.agents/shared/memories/`.
- Established 300-line snapshot rule for memory management.
- Standardized memory metadata requirements.
- Completed API refactor (named structs/handlers).
- Migrated core DNS handler to `miekg/dns`.

NOT DONE YET (work in this order):
1. Batch log writer in `db/sqlite.go`
2. In-memory blocklist + custom_records maps
3. Single-binary embed (Phase 4)

ACTIVE TASK: Implementing batch log writer in `db/sqlite.go`.

DECISIONS:
- Flattened backend path to reduce friction.
- Using named structs for robust type generation.
- Documentation/Memory framework established for token efficiency.
- Memories centralized in `.agents/shared/memories/` for better context management.
- `docs/README.md` added as the Source of Truth for documentation structure.
- DNS handler migrated to `miekg/dns`.

BLOCKERS: none
