# Unraid-VM-CP: Workspace Restructure + Test Harness + Error Handling

## Goal

Restructure into `apps/` + `packages/` Bun workspace. Build `packages/mock-unraid` — a faithful programmable simulation of the Unraid web UI. Refactor all error handling to neverthrow `Result<T, E>`. Add zod for validation. Achieve 70/20/10 testing split.

---

## Final Architecture

```
unraid-vm-cp/
├── package.json                # workspace: ["apps/*", "packages/*"]
├── apps/
│   ├── backend/                # Elysia server, moved from root
│   └── frontend/               # SolidJS app, moved from root
├── packages/
│   ├── shared-types/           # types + errors + responses + zod schemas
│   ├── shared-utils/           # time helpers, trust-proxy parser
│   ├── unraid-client/          # UnraidClient + GraphQL + HTML parser
│   └── mock-unraid/            # simulated Unraid HTTP server
├── Dockerfile
├── release-please-config.json
└── PLAN.md
```

---

## Package Specifications

### 1. `packages/shared-types` — Zero deps (except zod + neverthrow)

**Exports:**
- `types.ts`: `IVM`, `IVMPermissions`, `IUser`, `ISanitisedUser`, `IResponse<T>`, `IJWTPayload`, `VMState`, `VM_PERMISSION_KEYS[]`, `VMPermissionKey`, `VM_ACTIONS[]`, `VMAction`
- `errors.ts`: `AppError` tagged union, `AppErr.{unauthorized,forbidden,...}` constructors, `appErrorToStatusCode()`, plus backward-compat `BadRequestError/ForbiddenError/NotFoundError/ConflictRequestError/UnauthorizedError` Error subclasses
- `responses.ts`: `respondSuccess()`, `respondErrorMessage()`, `respond()`, `respondAsync()` — bridge `Result<T,E>` to HTTP Response
- `schemas.ts`: `uuidSchema`, `loginBodySchema`, `createUserBodySchema`, `vmPermissionsBodySchema`, `vmUuidParamSchema`, etc.

### 2. `packages/shared-utils` — Zero deps

**Exports:**
- `time.ts`: `getCurrentTimestampInSeconds()`, `hasTimestampExpired()`
- Merges `backend/src/services/time.ts` + frontend copy

### 3. `packages/unraid-client` — Deps: shared-types, cheerio

**Extracted from:** `backend/src/services/UnraidClient.ts`, `unraid-graphql.ts`, `extract-vms.ts`

**Key fix in unraid-graphql.ts:** `GQL_URL` was loaded at import time from global config. Now injected via `initGraphQLClient(getCookie, baseUrl)`. This was the only global-config coupling.

**API:** `UnraidClient` class (login, getVMs, start/stop/pause/resume/reboot/forceStop/hibernate/remove), `extractVMsFromHTML()`, GraphQL mutation functions.

### 4. `packages/mock-unraid` — Deps: shared-types

**Exports:**
```ts
createMockUnraid(config?: MockUnraidConfig): Promise<MockUnraidServer>
```

**MockUnraidServer API:**
```ts
url: string              // "http://127.0.0.1:PORT"
stop(): Promise<void>
getVMs(): IVM[]
setVMState(id, state): void
addVM(vm): void
removeVM(id): void
getActions(): ActionLogEntry[]
clearActions(): void
```

**Endpoints simulated:**
| Endpoint | Method | Behavior |
|---|---|---|
| `/login` | POST | Returns `unraid_<hex>` cookie, 302 redirect |
| `/Dashboard` | GET | Returns HTML with `<input name="csrf_token">` |
| `.../VMMachines.php` | GET | VM list HTML (v6 or v7 format) |
| `/graphql` | POST | VM mutations with state transition validation |
| `.../VMajax.php` | POST | Legacy actions (hibernate, undefine, delete) |

**State machine** (from Unraid API source `vms.service.ts`):
```
shutoff  → running
running  → paused, shutoff
paused   → running, shutoff
pmsuspended → running, shutoff
```
Invalid transitions return GraphQL error `{"errors":[{"message":"Invalid state transition..."}]}`

---

## Testing Strategy (70/20/10)

### Unit Tests (~79 tests, 70%)
| Package | Tests | What |
|---|---|---|
| shared-utils | 3 | time functions |
| mock-unraid state | 12 | all valid/invalid transitions |
| mock-unraid HTML | 6 | v6/v7 format, empty, autostart, states |
| mock-unraid GraphQL | 6 | each mutation + error paths |
| mock-unraid VMajax | 5 | CSRF, unknown action, etc. |
| mock-unraid server | 4 | lifecycle, action log |
| unraid-client | 19 | existing unraid.test.ts + graphql tests, moved |
| backend services | 21 | vm-service + user-service, refactored |
| frontend components | 3 | existing VMStatus test |

### Integration Tests (~25 tests, 22%)
| Suite | Tests | What |
|---|---|---|
| Auth | 4 | login as admin/user, wrong password, missing fields |
| VM listing | 4 | admin list, user list, empty, details |
| VM actions | 9 | each action happy path |
| VM errors | 4 | not found, bad state, unauthorized, permission denied |
| User CRUD | 4 | create, update username, update password, delete |

### E2E Tests (~8 tests, 7%)
| Test | Flow |
|---|---|
| Full flow 1 | admin login → list VMs → start VM → verify mock action log |
| Full flow 2 | admin → create user → link VM → set perms → user login → start VM |
| Permission deny | user without canStart → 403 |
| Hypervisor down | mock broken → 502 |
| CSRF path | hibernate → verify CSRF token used |
| Remove VM | undefine → verify mock |
| Delete user | admin deletes user → VMs/permissions cleaned |
| Autostart | toggle → verify mock state |

---

## Execution Order (11 Phases)

### Phase 1: Workspace Infrastructure
- Create directory structure: `packages/`, `apps/` (empty initially)
- Root `package.json` with `workspaces: ["packages/*"]`
- All package.json files + tsconfig files

### Phase 2: shared-types + shared-utils Packages
- Write `packages/shared-types/src/` (types, errors, responses, schemas)
- Write `packages/shared-utils/src/` (time utilities)
- `bun install` — verify workspace resolution works

### Phase 3: unraid-client Extraction
- Copy `backend/src/services/UnraidClient.ts`, `unraid-graphql.ts`, `extract-vms.ts` into `packages/unraid-client/src/`
- Fix `unraid-graphql.ts`: remove global config dep, inject baseUrl
- Move existing unraid test data into package
- Verify existing tests pass

### Phase 4: mock-unraid Package
- Write full mock-unraid source (~12 files)
- Write complete test suite (~33 unit tests)
- Verify against existing `extractVMsFromHTML` test

### Phase 5: Backend Refactor (neverthrow + zod)
- Update imports to use `@unraid-vm-cp/*` packages
- Delete `ErrorHandler.ts`, `responses.ts`, `time.ts` from backend
- Refactor `services/vm.ts` + `services/user.ts` → `Result<T, AppError>`
- Delete `vmAction()` factory in route handlers
- Replace `t.Object()` with zod schemas from shared-types
- Use `respondAsync()` at HTTP boundary

### Phase 6: Integration Tests
- Write `apps/backend/__tests__/unraid-integration.test.ts`
- Start mock-unraid + real backend on random ports
- Test every API endpoint through real HTTP

### Phase 7: E2E Tests
- Write `apps/backend/__tests__/unraid-e2e.test.ts`
- Multi-step flows spanning auth + CRUD + actions

### Phase 8: Frontend Migration
- Update imports to use `@unraid-vm-cp/shared-types`
- Delete duplicated types (`IPermissions.ts`, `IVMStatus.ts`, `time.ts`)
- Remove `any` types, use typed interfaces from shared-types

### Phase 9: Workspace Move
- `git mv backend/ apps/backend/`
- `git mv frontend/ apps/frontend/`
- Root workspace → `["apps/*", "packages/*"]`
- Update `FRONTEND_DIST_PATH` default in config.ts

### Phase 10: CI/CD Updates
- `Dockerfile`: update COPY paths, workspace install
- `release-please-config.json`: extra-files paths
- `.github/workflows/build.yml`: test commands

### Phase 11: Full Verification
- `bun install` fresh
- `bun test --recursive` — all tests pass
- `docker build -t unraid-vm-cp:test .` — builds successfully

---

## Key Decisions

| Decision | Choice |
|---|---|
| Drizzle schema location | Stays in `apps/backend/src/db/` |
| unraid-client extraction | Copy + fix GQL_URL. Keep throw-based API for now. |
| neverthrow migration | Big bang: services + routes at once. Wraps unraid-client calls with `fromPromise`. |
| Package versions | Single version (current model) |
| mock-unraid port | 0 (random) in tests |
| Error class compat | shared-types exports both AppErr tagged union AND backward-compat Error subclasses |

## File Inventory

**New files:** ~26
**Files deleted:** 9 (3 backend + 3 frontend duplicated + 3 extractable)
**Files modified:** ~22

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| neverthrow breaks existing tests | Existing tests verify behavior, not throw mechanics. Run before/after. |
| GQL_URL fix changes behavior | No behavior change — same URL, same fetch. Just injected instead of imported. |
| Frontend any→typed | Mechanical. Compiler catches mistakes. Types already match. |
| Docker build after restructure | Test locally after workspace move before pushing. |
| mock-unraid HTML doesn't match | Run existing extractVMsFromHTML test against mock output. |
