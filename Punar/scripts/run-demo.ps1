<#
.SYNOPSIS
  run-demo.ps1 — Starts the full Punar demo environment.

.DESCRIPTION
  1. Starts PostgreSQL containers (production + rehearsal)
  2. Installs demo-service V1 and V2 dependencies
  3. Starts the frontend dev server
  4. Prints access URLs

.USAGE
  .\scripts\run-demo.ps1
#>

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "`n=== Punar Demo — Starting ===" -ForegroundColor Cyan

# 1. Start databases
Write-Host "`n[1/3] Starting PostgreSQL containers..." -ForegroundColor Yellow
Push-Location "$Root\database"
docker-compose up -d
Pop-Location

# 2. Install demo-service dependencies if needed
Write-Host "`n[2/3] Installing demo-service dependencies..." -ForegroundColor Yellow
Push-Location "$Root\demo-service\v1"
if (-not (Test-Path "node_modules")) { npm install }
Pop-Location
Push-Location "$Root\demo-service\v2"
if (-not (Test-Path "node_modules")) { npm install }
Pop-Location

# 3. Start frontend
Write-Host "`n[3/3] Starting Punar frontend..." -ForegroundColor Yellow
Push-Location "$Root\frontend"
if (-not (Test-Path "node_modules")) { npm install }
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Pop-Location

Write-Host "`n=== Punar Demo Ready ===" -ForegroundColor Green
Write-Host "  Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "  DB (prod):  postgresql://punar:punar@localhost:5432/payment_service" -ForegroundColor White
Write-Host "  DB (rehrs): postgresql://punar:punar@localhost:5433/payment_service_rehearsal" -ForegroundColor White
