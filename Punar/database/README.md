# database

PostgreSQL setup for the Punar demo.

## Containers

| Container | Port | Purpose |
|---|---|---|
| `punar_postgres` | `5432` | Production-like database (V1 schema + seed data) |
| `punar_postgres_rehearsal` | `5433` | Ephemeral rehearsal database (cloned before each check) |

## Start

```bash
docker-compose up -d
```

## Migrations

| File | Version | Risk |
|---|---|---|
| `001_v1_schema.sql` | V1 (v2.3.0) | — Creates initial schema |
| `002_v2_migration.sql` | V2 (v2.4.0) | ⚠️ Contains 2 UNSAFE migrations |

### The two UNSAFE changes in V2:

**018_drop_legacy_status.sql** — `DROP COLUMN orders.legacy_status`
> V1 still queries this column. After V2 runs this, V1 will fail.

**019_payment_status.sql** — `ALTER TYPE payment_status ADD VALUE 'REFUNDED_PENDING'`
> V1 only knows `PENDING | PAID | FAILED`. If V2 writes records with `REFUNDED_PENDING`, V1 will throw when reading them.

## Connection strings

```
Production:  postgresql://punar:punar@localhost:5432/payment_service
Rehearsal:   postgresql://punar:punar@localhost:5433/payment_service_rehearsal
```
