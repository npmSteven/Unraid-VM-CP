# Project Instructions for AI Agents (CLAUDE.md)

This file provides instructions, architecture notes, build commands, and workflow rules for AI coding agents.

---

## Critical Workflow Rules

### 1. Git Branching & Push Safety (DO NOT COMMITT TO MASTER DIRECTLY)
- **NEVER commit plans, major feature work, or architectural refactor changes directly to `master`.**
- **ALWAYS create a dedicated feature branch**:
  ```bash
  git checkout -b feature/<descriptive-name>
  ```
- Push feature branch to remote (`git push -u origin feature/<name>`) and present a Pull Request link or summary to the user.
- `master` is reserved for release merges and PR integrations.

---

## Architecture & Current Flows

- **Core Runtime**: Bun JS runtime across backend & frontend.
- **Backend (`backend/`)**: Elysia web framework server, Drizzle ORM with SQLite database for storing local users, linked Unraid VMs, and granular user permissions. Integrates with Unraid hypervisor via HTTP/GraphQL.
- **Frontend (`frontend/`)**: SolidJS single-page web app built with Vite and standard CSS modules.
- **Monorepo Proposed Architecture**: Monorepo restructuring (`apps/` + `packages/` + `mock-unraid`) is tracked on branch `feature/workspace-restructure-and-mock-unraid`.

---

## Build, Test & Deployment Commands

```bash
# Install workspace dependencies
bun install

# Run backend dev server
bun run dev:backend

# Run frontend dev server
bun run dev:frontend

# Build frontend production bundle
bun run build:frontend

# Run tests
bun test

# Build production Docker image
docker build -t unraid-vm-cp .
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
