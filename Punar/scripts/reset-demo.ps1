<#
.SYNOPSIS
  reset-demo.ps1 — Resets the demo database to a clean V1 state.

.DESCRIPTION
  Tears down and recreates the PostgreSQL containers, re-runs 001_v1_schema.sql
  and seed.sql. Leaves V2 migrations unapplied — ready for a fresh rehearsal.

.USAGE
  .\scripts\reset-demo.ps1
#>

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "`n=== Punar Demo — Resetting to V1 state ===" -ForegroundColor Yellow

Push-Location "$Root\database"
docker-compose down -v
docker-compose up -d
Pop-Location

Write-Host "`nDemo database reset to V1 schema." -ForegroundColor Green
Write-Host "  payment_status values: PENDING | PAID | FAILED" -ForegroundColor White
Write-Host "  orders.legacy_status:  present" -ForegroundColor White
Write-Host "  V2 migrations:         NOT applied" -ForegroundColor White
Write-Host "`nRun .\scripts\run-rehearsal.ps1 to start a fresh rollback check." -ForegroundColor Cyan
