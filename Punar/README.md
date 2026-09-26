# Punar

**Pre-deployment rollback compatibility platform.**

> *"Check whether you can safely go back before you move forward."*

---

## What is Punar?

Most deployment pipelines validate whether V2 deploys successfully. Punar validates a different question:

> **After V2 changes the database or persistent state, can V1 still safely run against what V2 leaves behind?**

Punar rehearses the rollback *before* production deployment — finding incompatibilities when they can still be fixed.

---

## Project Structure

```
Punar/
├── frontend/         # React + TypeScript + Vite dashboard
├── backend/          # Punar API + analysis engine (scaffold)
├── demo-service/     # Demo target application (V1 and V2)
│   ├── v1/           # payment-service v2.3.0 (production)
│   ├── v2/           # payment-service v2.4.0 (incoming — breaking)
│   └── tests/        # Rollback compatibility test suite
├── database/         # PostgreSQL schema, migrations, Docker Compose
├── scripts/          # PowerShell automation scripts
└── docs/             # Architecture, demo flow, project context
```

---

## Quick Start

```powershell
# Start everything
.\scripts\run-demo.ps1

# Reset database to clean V1 state
.\scripts\reset-demo.ps1

# Run rollback rehearsal manually
.\scripts\run-rehearsal.ps1
```

---

## The Demo Scenario

```
Project:   payment-service
V1:        v2.3.0  — current production
V2:        v2.4.0  — incoming release

Breaking migrations in V2:
  018_drop_legacy_status.sql  → DROP COLUMN orders.legacy_status  (V1 still queries it)
  019_payment_status.sql      → ADD VALUE 'REFUNDED_PENDING'      (V1 doesn't understand it)

Punar result: UNSAFE
```

---

## Frontend

The dashboard is the current working prototype.

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Docs

- [`docs/architecture.md`](docs/architecture.md) — System design
- [`docs/demo-flow.md`](docs/demo-flow.md) — Step-by-step demo script
- [`docs/Punar_IBM_BOB_2.0_PROJECT_CONTEXT_README.md`](docs/Punar_IBM_BOB_2.0_PROJECT_CONTEXT_README.md) — Full project context

---

## IBM BOB 2.0 Hackathon
