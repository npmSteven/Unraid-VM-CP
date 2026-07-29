# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd prime` for full workflow context.

> **Architecture in one line:** Issues live in a local Dolt database
> (`.beads/dolt/`); cross-machine sync uses `bd dolt push/pull` (a
> git-compatible protocol), stored under `refs/dolt/data` on your git
> remote — separate from `refs/heads/*` where your code lives.
> `.beads/issues.jsonl` is a passive export, not the wire protocol.

## Critical Git & Branching Workflow

**NEVER commit major feature work, plan executions, or architectural refactors directly to `master`.**

1. **Always inspect current branch & flows before starting**: Review `AGENTS.md`, `CLAUDE.md`, existing branches, and open PRs.
2. **Always create a feature branch**:
   ```bash
   git checkout -b feature/<descriptive-name>
   ```
3. **Commit & Push Feature Branch**:
   ```bash
   git add .
   git commit -m "feat: description of work"
   git push -u origin feature/<descriptive-name>
   ```
4. **`master` Protection**: `master` is reserved for stable code and Pull Request merges. Never push directly to `master` for feature plans or multi-file refactors.

---

## Deployment & Repository Overview

- **Backend**: `backend/` — Bun + Elysia server, SQLite database via Drizzle ORM.
- **Frontend**: `frontend/` — SolidJS single-page web application built with Vite.
- **Monorepo Feature Branch**: The monorepo restructuring into `apps/` + `packages/` (with `mock-unraid`, `shared-types`, `shared-utils`, `unraid-client`) lives on branch `feature/workspace-restructure-and-mock-unraid`.
- **Deployment**: Docker build (`Dockerfile`) bundles the frontend build into the Elysia backend container for production deployment. Release tagging is managed via Release Please (`release-please-config.json`).

---

## Non-Interactive Shell Commands

**ALWAYS use non-interactive flags** with file operations to avoid hanging on confirmation prompts.

Use these forms:
```bash
# Force overwrite without prompting
cp -f source dest           # NOT: cp source dest
mv -f source dest           # NOT: mv source dest
rm -f file                  # NOT: rm file

# For recursive operations
rm -rf directory            # NOT: rm -r directory
cp -rf source dest          # NOT: cp -r source dest
```

---

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:7510c1e2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds on your feature branch.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH FEATURE BRANCH TO REMOTE**:
   ```bash
   git pull --rebase origin <feature-branch>
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
