<#
.SYNOPSIS
  run-rehearsal.ps1 — Runs the Punar rollback rehearsal manually.

.DESCRIPTION
  Simulates the full rollback rehearsal pipeline against the demo-service:
    1. Clones the production DB into the rehearsal DB
    2. Applies V2 migrations (017, 018, 019)
    3. Starts V2 and generates representative state (REFUNDED_PENDING orders)
    4. Stops V2, starts V1 against the post-V2 rehearsal DB
    5. Runs rollback compatibility tests
    6. Reports SAFE or UNSAFE

.USAGE
  .\scripts\run-rehearsal.ps1
#>

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "`n=== Punar Rollback Rehearsal ===" -ForegroundColor Cyan
Write-Host "  Project: payment-service" -ForegroundColor White
Write-Host "  V1:      v2.3.0" -ForegroundColor White
Write-Host "  V2:      v2.4.0" -ForegroundColor White

# Step 1: Clone production DB to rehearsal DB
Write-Host "`n[Step 1] Cloning production DB to rehearsal..." -ForegroundColor Yellow
$env:PGPASSWORD = "punar"
pg_dump -h localhost -p 5432 -U punar payment_service | `
  psql  -h localhost -p 5433 -U punar payment_service_rehearsal
Write-Host "  DB cloned." -ForegroundColor Green

# Step 2: Apply V2 migrations to rehearsal DB
Write-Host "`n[Step 2] Applying V2 migrations to rehearsal DB..." -ForegroundColor Yellow
psql -h localhost -p 5433 -U punar payment_service_rehearsal `
     -f "$Root\database\migrations\002_v2_migration.sql"
Write-Host "  Migrations applied." -ForegroundColor Green

# Step 3: Start V2, generate representative state
Write-Host "`n[Step 3] Starting V2 and generating representative state..." -ForegroundColor Yellow
$v2env = @{ DATABASE_URL = "postgresql://punar:punar@localhost:5433/payment_service_rehearsal"; PORT = "3011" }
$v2proc = Start-Process node -ArgumentList "node_modules/.bin/tsx src/index.ts" `
  -WorkingDirectory "$Root\demo-service\v2" -Environment $v2env -PassThru
Start-Sleep -Seconds 2
Invoke-RestMethod -Method POST -Uri "http://localhost:3011/orders/refund-pending" | Out-Null
Write-Host "  V2 state generated (REFUNDED_PENDING order created)." -ForegroundColor Green
Stop-Process -Id $v2proc.Id -Force

# Step 4: Run compatibility tests against V1
Write-Host "`n[Step 4] Running rollback compatibility tests..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://punar:punar@localhost:5433/payment_service_rehearsal"
Push-Location "$Root\demo-service\tests"
node --loader tsx rollback-compatibility.ts
Pop-Location
