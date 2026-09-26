<#
.SYNOPSIS
  run-rehearsal.ps1 — Runs the Punar rollback rehearsal manually.

.DESCRIPTION
  Simulates the full rollback rehearsal pipeline against the demo-service:
    1. Clones the production DB into the rehearsal DB (via docker exec — no host psql needed)
    2. Applies V2 migrations (017+018 in one transaction, 019 separately — required for ALTER TYPE ADD VALUE)
    3. Runs V2 inside Docker (database_default network) — writes a REFUNDED_PENDING order
    4. Runs rollback compatibility check inside Docker against the same post-V2 DB state
    5. Reports SAFE or UNSAFE

.USAGE
  .\scripts\run-rehearsal.ps1
#>

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

# Internal Docker DNS name and network for the rehearsal DB
$RehearsalDbUrl = "postgresql://punar:punar@punar_postgres_rehearsal:5432/payment_service_rehearsal"
$DockerNetwork  = "database_default"
$RunnerImage    = "punar-demo-runner:latest"

Write-Host "`n=== Punar Rollback Rehearsal ===" -ForegroundColor Cyan
Write-Host "  Project: payment-service" -ForegroundColor White
Write-Host "  V1:      v2.3.0" -ForegroundColor White
Write-Host "  V2:      v2.4.0" -ForegroundColor White

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Clone production DB to rehearsal DB via docker exec
# Uses pg_dump inside the running container — no host PostgreSQL client needed.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[Step 1] Cloning production DB to rehearsal DB..." -ForegroundColor Yellow

# Wipe the rehearsal DB first so we get a clean clone every run
# Two separate -c calls — DROP DATABASE cannot run inside a transaction block
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal `
  psql -U punar -d postgres -c "DROP DATABASE IF EXISTS payment_service_rehearsal;" 2>&1 | Out-Null
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal `
  psql -U punar -d postgres -c "CREATE DATABASE payment_service_rehearsal;" 2>&1 | Out-Null

# Dump from prod container and pipe into rehearsal container
$dumpArgs  = @("exec", "-e", "PGPASSWORD=punar", "punar_postgres",         "pg_dump", "-U", "punar", "payment_service")
$restoreArgs = @("exec", "-i", "-e", "PGPASSWORD=punar", "punar_postgres_rehearsal", "psql",   "-U", "punar", "payment_service_rehearsal")
& docker @dumpArgs | & docker @restoreArgs
Write-Host "  DB cloned." -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Apply V2 migrations to rehearsal DB
# Migrations 017 + 018 run inside a transaction (safe).
# Migration 019 (ALTER TYPE ADD VALUE) must run OUTSIDE a transaction block —
# PostgreSQL rejects it inside BEGIN/COMMIT.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[Step 2] Applying V2 migrations to rehearsal DB..." -ForegroundColor Yellow

# 017 + 018: safe in one transaction
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal psql -U punar payment_service_rehearsal -c `
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NULL DEFAULT FALSE; ALTER TABLE orders DROP COLUMN IF EXISTS legacy_status;"
Write-Host "  017 (add phone_verified) and 018 (drop legacy_status) applied." -ForegroundColor Green

# 019: must be outside a transaction block
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal psql -U punar payment_service_rehearsal -c `
  "ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'REFUNDED_PENDING';"
Write-Host "  019 (add REFUNDED_PENDING enum value) applied." -ForegroundColor Green

# Verify
Write-Host "  Verifying rehearsal schema..." -ForegroundColor Gray
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal psql -U punar payment_service_rehearsal -c `
  "SELECT enum_range(NULL::payment_status);" | Write-Host

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Build the runner image (if not already current) and run V2 inside Docker.
# V2 connects to the rehearsal DB via the internal Docker network — no host
# port-mapping or SCRAM auth issues.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[Step 3] Building runner image and writing REFUNDED_PENDING state via V2..." -ForegroundColor Yellow

docker build -q -t $RunnerImage -f "$Root\demo-service\Dockerfile.runner" "$Root\demo-service" | Out-Null
Write-Host "  Runner image built: $RunnerImage" -ForegroundColor Green

$v2out = docker run --rm `
  --network $DockerNetwork `
  -e "DATABASE_URL=$RehearsalDbUrl" `
  $RunnerImage `
  node run-v2-rehearsal.mjs 2>&1
Write-Host $v2out

if ($LASTEXITCODE -ne 0) {
  Write-Host "  ERROR: V2 runner failed." -ForegroundColor Red
  exit 1
}
Write-Host "  V2 run complete." -ForegroundColor Green

# Confirm the record is in the rehearsal DB
Write-Host "  Confirming REFUNDED_PENDING row in rehearsal DB..." -ForegroundColor Gray
docker exec -e PGPASSWORD=punar punar_postgres_rehearsal psql -U punar payment_service_rehearsal -c `
  "SELECT id, status FROM orders WHERE status = 'REFUNDED_PENDING';" | Write-Host

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: Run rollback compatibility check inside Docker against the same DB.
# V1 does not know REFUNDED_PENDING — expects UNSAFE.
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[Step 4] Running rollback compatibility check (expect UNSAFE)..." -ForegroundColor Yellow

docker run --rm `
  --network $DockerNetwork `
  -e "DATABASE_URL=$RehearsalDbUrl" `
  $RunnerImage `
  node run-compat-check.mjs
$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -ne 0) {
  Write-Host "ROLLBACK COMPATIBILITY: UNSAFE" -ForegroundColor Red
  Write-Host "  V1 (v2.3.0) cannot safely run against the post-V2 database state." -ForegroundColor Red
} else {
  Write-Host "ROLLBACK COMPATIBILITY: SAFE" -ForegroundColor Green
}
exit $exitCode
