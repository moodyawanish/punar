# Demo Flow

## The Scenario

```
Project:    payment-service
V1:         v2.3.0  (current production)
V2:         v2.4.0  (incoming release)
Database:   PostgreSQL
```

---

## Step-by-step Demo Script

### 1. Open Dashboard

Shows rollback check metrics, recent activity, and an UNSAFE alert for payment-service.

**CTA:** Run Rollback Check → navigates to Change Analysis.

---

### 2. Change Analysis

Shows the V1 vs V2 diff:

```
Database changes
  +  users.phone_verified          BOOLEAN NULL    ← SAFE (additive)
  -  orders.legacy_status          VARCHAR(50)     ← UNSAFE (V1 queries this)
  ~  payment_status (enum)         + REFUNDED_PENDING ← UNSAFE (V1 doesn't know this)

Migrations detected
  SAFE    017_add_phone_verified.sql
  UNSAFE  018_drop_legacy_status.sql
  UNSAFE  019_payment_status.sql
```

**CTA:** Start Rollback Rehearsal → navigates to Configuration.

---

### 3. Rollback Check Configuration

Shows the rehearsal plan — DB snapshot, V2 migration, V2 state generation, V1 rollback test.

**CTA:** Start Rollback Rehearsal → navigates to Rehearsal Progress.

---

### 4. Rollback Rehearsal Progress (animated)

Timeline advances step by step:
```
✓ Repository Analyzed
✓ Rehearsal Environment Created
✓ Database Snapshot Created
✓ V2 Migration Applied
✓ V2 Started
✓ Representative V2 State Generated
→ Switching Back to V1
→ Running Compatibility Tests
  ✗ ERROR: Unknown payment status: REFUNDED_PENDING
```

Terminal output shows the failure in real time.

**CTA:** View Analysis → navigates to Compatibility Analysis.

---

### 5. Rollback Compatibility Analysis

Shows:
- **ROLLBACK STATUS: UNSAFE**
- 2 critical issues with migration, component, affected file, failed test
- IBM Bob Analysis with evidence
- Recommended fix: expand-contract migration strategy

**CTA:** View Full Report → navigates to Rollback Readiness Report.

---

### 6. Rollback Readiness Report

Full summary:
```
Project:              payment-service
V1:                   v2.3.0
V2:                   v2.4.0
Schema Changes:       7
Breaking Changes:     2
Compatibility Tests:  16 / 18 passed
Rollback Status:      UNSAFE
```

Includes: release details, failed checks with evidence, IBM Bob explanation, recommended fix.

---

## The Key Message for Judges

> Punar discovered **before production deployment** that rolling back to V1 after V2 would fail.
>
> The developer can now fix the migration strategy before deploying — avoiding a production incident.
