# demo-service

A deliberately simple Node.js + PostgreSQL service used as the **demo target** for Punar's rollback rehearsal.

## Scenario

```
V1: v2.3.0  — stable production version
V2: v2.4.0  — incoming release with a breaking migration
```

## The breaking change

V2 introduces migration `019_payment_status.sql` which adds the enum value `REFUNDED_PENDING` to `payment_status`.

V1 only understands `PENDING | PAID | FAILED`.

When Punar runs the rehearsal:
1. V2 migrates the DB and writes orders with `REFUNDED_PENDING`
2. V1 is started against the post-V2 DB
3. V1 crashes reading those orders — **Punar detects this as UNSAFE**

## Structure

```
v1/   — Current production version (v2.3.0)
v2/   — Incoming release (v2.4.0) with the breaking migration
tests/ — Rollback compatibility test suite
```

## Running locally

```bash
# Start PostgreSQL (see ../database/)
docker-compose -f ../database/docker-compose.yml up -d

# Install V1
cd v1 && npm install

# Install V2
cd ../v2 && npm install

# Run rollback compatibility tests directly
npm test --prefix tests
```
