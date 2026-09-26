# Rollback Demo Verification Plan

## Goal

Verify the following real sequence end-to-end against the existing demo scaffold:

```
V1 + original database works
  → V2 migration applied to rehearsal DB
    → V2 runs and writes REFUNDED_PENDING
      → V1 run against post-V2 database
        → V1 fails reading REFUNDED_PENDING
          → ROLLBACK RESULT: UNSAFE
```

This is a verification-only plan. The frontend is not touched. The backend is not started.

---

## What Already Exists

### Database — `Punar/database/`

| File | Status | Notes |
|---|---|---|
| `docker-compose.yml` | ✅ Complete | Two PG 16 containers: `punar_postgres` on 5432, `punar_postgres_rehearsal` on 5433 |
| `migrations/001_v1_schema.sql` | ✅ Complete | Creates `payment_status ENUM(PENDING, PAID, FAILED)`, `orders` table with `legacy_status` column, `users` table |
| `migrations/002_v2_migration.sql` | ✅ Complete | Three staged changes: 017 (safe additive), 018 (DROP `legacy_status` — UNSAFE), 019 (ADD `REFUNDED_PENDING` to enum — UNSAFE) |
| `seed/seed.sql` | ✅ Complete | 3 users, 5 orders with V1 statuses and `legacy_status` values |

The production container auto-applies `001_v1_schema.sql` and `seed.sql` on first start via `docker-entrypoint-initdb.d/`. The rehearsal container starts empty — it is cloned during the rehearsal script.

### Demo Service — `Punar/demo-service/`

| File | Status | Notes |
|---|---|---|
| `v1/src/index.ts` | ✅ Complete | Express on port 3010. `GET /orders` maps rows through V1_KNOWN_STATUSES and throws `Unknown payment status: REFUNDED_PENDING` if it encounters it |
| `v1/package.json` | ✅ Complete | express + pg deps, tsx runner |
| `v1/tsconfig.json` | ✅ Complete | NodeNext module target |
| `v2/src/index.ts` | ✅ Complete | Express on port 3011. `POST /orders/refund-pending` inserts `REFUNDED_PENDING` row. `GET /orders` reads all without filtering |
| `v2/package.json` | ✅ Complete | Same shape as v1 |
| `v2/tsconfig.json` | ✅ Complete | Same shape as v1 |
| `tests/rollback-compatibility.ts` | ✅ Complete | Two tests: (1) scans `orders.status` for any non-V1 values, (2) checks `orders.legacy_status` column still exists. Exits with code 1 on any failure and prints `ROLLBACK COMPATIBILITY: UNSAFE` |
| `tests/package.json` | ✅ Complete | Added in previous session |
| `tests/tsconfig.json` | ✅ Complete | Added in previous session |

### Scripts — `Punar/scripts/`

| File | Status | Notes |
|---|---|---|
| `run-demo.ps1` | ✅ Exists | Starts containers + installs deps + starts frontend |
| `reset-demo.ps1` | ✅ Exists | `docker-compose down -v && up -d` — returns to clean V1 state |
| `run-rehearsal.ps1` | ⚠️ Exists with issues | See Problems section below |

### Root config — `Punar/package.json`

npm workspaces include `demo-service/v1` and `demo-service/v2` but NOT `demo-service/tests`. The tests folder has its own `package.json` with `pg` and `tsx` as dependencies.

---

## Problems and Risks

### P1 — `run-rehearsal.ps1` uses wrong tsx invocation

**Line 53:**
```powershell
node --loader tsx rollback-compatibility.ts
```

The `--loader` API was deprecated in Node 18 and removed in Node 22. The correct invocation using the installed `tsx` binary is:
```powershell
node_modules/.bin/tsx rollback-compatibility.ts
```
or simply (since `package.json` has `"test": "tsx rollback-compatibility.ts"`):
```powershell
npm test
```

**Impact:** Step 4 of the rehearsal script will fail with a Node error before any test runs.

---

### P2 — `run-rehearsal.ps1` starts V2 with `Start-Process node` but passes `node_modules/.bin/tsx` as an argument

**Lines 42–43:**
```powershell
$v2proc = Start-Process node -ArgumentList "node_modules/.bin/tsx src/index.ts" `
  -WorkingDirectory "$Root\demo-service\v2" -Environment $v2env -PassThru
```

`Start-Process node` passes the entire string as a single argument to node, which node will reject. The correct form is either:
```powershell
Start-Process "node_modules\.bin\tsx.ps1" -ArgumentList "src/index.ts" ...
```
or using `npx tsx src/index.ts` as the executable.

**Impact:** V2 will not start, `REFUNDED_PENDING` record will not be created, and the test will produce a false SAFE result (no bad rows = no failure).

---

### P3 — `Start-Process` does not support `-Environment` parameter in Windows PowerShell 5.1

The `-Environment` hashtable parameter was added in PowerShell 7. On PowerShell 5.1 (default on Windows 10) this silently fails and the `DATABASE_URL` environment variable will not be set for the spawned process.

**Impact:** V2 will connect to the production DB on 5432 instead of the rehearsal DB on 5433. It will write `REFUNDED_PENDING` to the wrong database.

---

### P4 — `pg_dump | psql` clone (Step 1) requires `pg_dump` and `psql` on the host PATH

These tools are part of the PostgreSQL client package, not Docker. On a machine where only Docker is installed (no local PostgreSQL client), Step 1 will fail immediately with `pg_dump: command not found`.

**Impact:** The entire rehearsal script fails at the first step.

**Safer alternative:** Use `docker exec` to run `pg_dump` and `psql` inside the running container — no host-side PostgreSQL required.

---

### P5 — `002_v2_migration.sql` contains `ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'REFUNDED_PENDING'`

PostgreSQL does not allow `ADD VALUE` inside a transaction block. The `psql` command run in Step 2 of the rehearsal script wraps each SQL file in an implicit transaction by default.

**Impact:** The migration will fail with:
```
ERROR: ALTER TYPE ... ADD VALUE cannot run inside a transaction block
```
The `REFUNDED_PENDING` value will NOT be added to the enum, so `POST /orders/refund-pending` in Step 3 will fail with a PostgreSQL type error, and the test will still produce a false SAFE result.

**Fix:** The migration must be run with `psql --single-transaction=off` or the `ALTER TYPE ADD VALUE` must be committed in its own separate statement outside any transaction. The simplest fix is to pass `-c "ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'REFUNDED_PENDING'"` as a separate `psql` call, or to use `psql --no-psqlrc -v ON_ERROR_STOP=1` without `--single-transaction`.

---

### P6 — Rehearsal DB starts empty; `pg_dump` clone must succeed before migrations run

The rehearsal DB container starts without any schema. If Step 1 (clone) fails (see P4) or only partially succeeds, Step 2 (V2 migration) will fail because the `orders` and `users` tables do not exist.

**Impact:** Cascading failure if P4 is not resolved first.

---

### P7 — `tests/rollback-compatibility.ts` checks for `orders.legacy_status` column

Test 2 (`testRollbackSchemaCompatibility`) expects `orders.legacy_status` to **exist** and fails if it does not. Since migration 018 (`DROP COLUMN legacy_status`) is one of the V2 migrations that will be applied in Step 2, this test is designed to fail after V2 migration — which is correct and intentional.

However, the column check verifies a column named `legacy_status` specifically. This is consistent with `001_v1_schema.sql`. ✅ No problem here — just confirming this is by design.

---

### P8 — `demo-service/tests` is not in the npm workspace

`Punar/package.json` workspaces: `["frontend", "backend", "demo-service/v1", "demo-service/v2"]`

The tests folder is excluded. This means `npm install` from the workspace root will not install test dependencies. `npm test` from `demo-service/tests/` requires a separate `npm install` first.

**Impact:** Not a blocker for manual verification, but must be documented. Can be resolved by adding `"demo-service/tests"` to the workspaces array.

---

## Recommended Verification Steps

These steps can be run manually to prove the end-to-end sequence. Steps assume Docker is running and the user is in the `Punar/` directory.

### Step 1 — Start and verify production DB (V1 state)

```powershell
docker-compose -f database/docker-compose.yml up -d
# Wait for health checks to pass (approx 10s)
docker ps
```

Confirm: both `punar_postgres` (5432) and `punar_postgres_rehearsal` (5433) are running and healthy.

### Step 2 — Verify V1 schema and seed data

```powershell
$env:PGPASSWORD = "punar"
psql -h localhost -p 5432 -U punar payment_service -c "SELECT id, status, legacy_status FROM orders;"
```

Expected: 5 rows with statuses `PAID`, `PENDING`, `FAILED` and populated `legacy_status` column.

### Step 3 — Install V1 and V2 dependencies

```powershell
cd demo-service/v1; npm install; cd ../..
cd demo-service/v2; npm install; cd ../..
cd demo-service/tests; npm install; cd ../..
```

### Step 4 — Verify V1 works against original DB

```powershell
$env:DATABASE_URL = "postgresql://punar:punar@localhost:5432/payment_service"
$env:PORT = "3010"
# Start V1 in a second terminal:
cd demo-service/v1
node_modules\.bin\tsx src/index.ts
# In original terminal:
Invoke-RestMethod http://localhost:3010/health
Invoke-RestMethod http://localhost:3010/orders
```

Expected: `/health` returns `{ version: "2.3.0" }`. `/orders` returns 5 rows with no errors.

### Step 5 — Clone production DB to rehearsal DB

```powershell
$env:PGPASSWORD = "punar"
docker exec -e PGPASSWORD=punar punar_postgres `
  pg_dump -U punar payment_service | `
  docker exec -i -e PGPASSWORD=punar punar_postgres_rehearsal `
  psql -U punar payment_service_rehearsal
```

This avoids requiring host-side `pg_dump`/`psql` (fixes P4).

### Step 6 — Apply V2 migrations to rehearsal DB

Run migration 017 and 018 in a single transaction, then 019 outside a transaction (fixes P5):

```powershell
# 017 + 018 together (safe in a transaction)
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal psql -U punar payment_service_rehearsal -c "
  ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NULL DEFAULT FALSE;
  ALTER TABLE orders DROP COLUMN IF EXISTS legacy_status;
"
# 019 must be outside a transaction block
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal psql -U punar payment_service_rehearsal -c "ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'REFUNDED_PENDING';"
```

Verify:
```powershell
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal psql -U punar payment_service_rehearsal -c "\d orders"
```

Expected: `legacy_status` column is gone. `phone_verified` column present on `users`.

### Step 7 — Start V2 against rehearsal DB, write REFUNDED_PENDING

```powershell
$env:DATABASE_URL = "postgresql://punar:punar@localhost:5433/payment_service_rehearsal"
$env:PORT = "3011"
# Start V2 in a second terminal:
cd demo-service/v2
node_modules\.bin\tsx src/index.ts
# In original terminal:
Invoke-RestMethod -Method POST -Uri "http://localhost:3011/orders/refund-pending"
```

Expected: Response contains `{ status: "REFUNDED_PENDING" }`. Stop V2 after this.

Verify the record exists in the rehearsal DB:
```powershell
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal psql -U punar payment_service_rehearsal -c "SELECT id, status FROM orders WHERE status = 'REFUNDED_PENDING';"
```

Expected: 1 row returned.

### Step 8 — Run rollback compatibility tests (expect UNSAFE)

```powershell
$env:DATABASE_URL = "postgresql://punar:punar@localhost:5433/payment_service_rehearsal"
cd demo-service/tests
node_modules\.bin\tsx rollback-compatibility.ts
```

Expected output:
```
FAILED: rollback-order-compatibility FAILED: Unknown payment status: REFUNDED_PENDING (order id=6)
FAILED: rollback-schema-compatibility FAILED: Column orders.legacy_status does not exist
Rollback compatibility: 0 passed, 2 failed
ROLLBACK COMPATIBILITY: UNSAFE
```

Exit code: 1

### Step 9 — Confirm V1 also fails directly against post-V2 DB

```powershell
$env:DATABASE_URL = "postgresql://punar:punar@localhost:5433/payment_service_rehearsal"
$env:PORT = "3010"
# Start V1 against the post-V2 rehearsal DB:
cd demo-service/v1
node_modules\.bin\tsx src/index.ts
# In original terminal:
Invoke-RestMethod http://localhost:3010/orders
```

Expected: HTTP 500 — `{ error: "Unknown payment status: REFUNDED_PENDING" }`

This is the core demo evidence.

### Step 10 — Reset to clean state

```powershell
cd ..  # back to Punar/
.\scripts\reset-demo.ps1
```

Expected: Containers restarted with clean V1 schema and seed data. Ready to repeat.

---

## Sub-Tasks for Implementation

### Sub-Task 1 — Fix `run-rehearsal.ps1`
**Status:** `[ ] pending`

**Intent:** Fix the three bugs in `run-rehearsal.ps1` (P1, P2, P3) so the script runs end-to-end without manual intervention.

**Changes required:**
- Replace `node --loader tsx` with `node_modules\.bin\tsx` (fixes P1)
- Replace `Start-Process node -ArgumentList "node_modules/.bin/tsx src/index.ts"` with a working invocation that sets env vars correctly for PowerShell 5.1 (fixes P2, P3)
- Replace the `pg_dump | psql` host pipe with `docker exec` equivalents (fixes P4)
- Split the migration application so `ALTER TYPE ADD VALUE` runs outside a transaction block (fixes P5)

**Expected outcome:** Running `.\scripts\run-rehearsal.ps1` from `Punar/` produces:
```
ROLLBACK COMPATIBILITY: UNSAFE
```
with exit code 1.

**Relevant files:**
- `Punar/scripts/run-rehearsal.ps1`

---

### Sub-Task 2 — Add `demo-service/tests` to npm workspaces
**Status:** `[ ] pending`

**Intent:** Make `npm install` from the workspace root install test dependencies automatically.

**Changes required:**
- Add `"demo-service/tests"` to the `workspaces` array in `Punar/package.json`
- Add a `"test:rehearsal"` script entry to the root `package.json` that runs the compatibility tests

**Relevant files:**
- `Punar/package.json`

---

### Sub-Task 3 — Manual end-to-end verification run
**Status:** `[ ] pending`

**Intent:** Execute Steps 1–10 from the Verification Steps section above and confirm all expected outputs are produced. Document the exact terminal output as evidence for the hackathon submission.

**Expected outcome:**
- Step 4: V1 returns orders cleanly
- Step 7: V2 writes `REFUNDED_PENDING` record
- Step 8: Tests produce `ROLLBACK COMPATIBILITY: UNSAFE` with exit code 1
- Step 9: V1 returns HTTP 500 with `Unknown payment status: REFUNDED_PENDING`

---

## Risk Summary

| ID | Severity | Description | Fix |
|---|---|---|---|
| P1 | High | `node --loader tsx` fails on Node 18+ | Use `node_modules\.bin\tsx` |
| P2 | High | `Start-Process node` receives wrong argument format | Use tsx binary directly as the executable |
| P3 | High | `-Environment` on `Start-Process` requires PS7 | Set env vars before spawning, or use `$env:VAR = ...` pattern |
| P4 | High | `pg_dump`/`psql` may not be on host PATH | Use `docker exec` variants |
| P5 | High | `ALTER TYPE ADD VALUE` fails inside transaction | Run as separate `psql -c` call outside transaction |
| P6 | Medium | Rehearsal DB cascading failure if Step 1 fails | Resolved by fixing P4 |
| P7 | None | `legacy_status` check is intentional — by design | No action |
| P8 | Low | `tests/` not in npm workspaces | Add to workspaces array |
