# Punar Architecture

## Overview

Punar is a **pre-deployment rollback compatibility platform**.

It answers the question:

> If V2 modifies the database or persistent state, can V1 still safely run against the state left behind by V2?

---

## System Components

```
┌─────────────────────────────────────────────────────┐
│                   frontend/                          │
│         React + TypeScript + Vite dashboard         │
│  Dashboard → Change Analysis → Rehearsal → Report   │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP API
┌─────────────────▼───────────────────────────────────┐
│                   backend/                           │
│               Punar API Server                       │
│                                                     │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  analysis/ │  │  rehearsal/  │  │ compatibility│ │
│  │ Migration  │  │  Rehearsal   │  │   Rules +   │ │
│  │  Analyzer  │  │   Engine     │  │ Test Runner │ │
│  └────────────┘  └──────┬───────┘  └──────┬──────┘ │
│                         │                  │        │
│  ┌──────────┐           │           ┌──────▼──────┐ │
│  │   bob/   │◄──────────┘           │  reports/   │ │
│  │ IBM Bob  │                       │   Report    │ │
│  │  Layer   │                       │ Generator   │ │
│  └──────────┘                       └─────────────┘ │
└─────────────────────────────────────────────────────┘
         │                          │
   ┌─────▼──────┐          ┌────────▼───────┐
   │  PostgreSQL │          │ PostgreSQL     │
   │ (prod-like) │          │ (rehearsal DB) │
   │  port 5432  │          │  port 5433     │
   └─────────────┘          └────────────────┘
```

---

## Rollback Rehearsal Flow

```
1. Developer prepares V2
         ↓
2. Punar analyzes repository (V1 vs V2 diff)
         ↓
3. Punar detects migration files
         ↓
4. Punar creates ephemeral rehearsal environment
         ↓
5. Production-like DB is cloned
         ↓
6. V2 migrations applied to rehearsal DB
         ↓
7. V2 started → representative V2 state generated
         ↓
8. V2 stopped → V1 started against post-V2 DB
         ↓
9. Compatibility tests run
         ↓
10. Failures collected
         ↓
11. IBM Bob explains root cause with evidence
         ↓
12. Rollback Readiness Report generated
         ↓
      SAFE / WARNING / UNSAFE
```

---

## Risk Classification

| Status | Trigger |
|---|---|
| **SAFE** | All additive, backward-compatible migrations. All compatibility tests pass. |
| **WARNING** | Potential issues detected but fallback may exist. |
| **UNSAFE** | Destructive migration or persisted incompatible state. V1 will fail. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide |
| Backend | Node.js, TypeScript, Express |
| Database | PostgreSQL 16 |
| Containers | Docker Compose |
| AI Layer | IBM Bob (development intelligence) |
