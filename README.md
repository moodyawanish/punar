# Punar — IBM BOB 2.0 Hackathon Project Context

> **Working project name:** Punar  
> **Hackathon:** IBM BOB 2.0  
> **Project type:** Developer workflow / release safety / rollback compatibility  
> **Current stage:** Problem and solution finalized, research/audit completed, Figma UI/UX prototype completed, backend integration not started yet  
> **Purpose of this README:** Give IBM Bob enough context to continue implementation without redesigning or misunderstanding the project.

---

## 1. Executive Summary

Punar is a **pre-deployment rollback compatibility and rehearsal platform** for software teams.

Most deployment pipelines focus on one question:

> **Can the new version deploy successfully?**

Punar focuses on a different question:

> **If the new version fails after deployment, can the previous version actually run again against the database and application state that the new version has already changed?**

A deployment can be technically reversible at the application level while still being **operationally unsafe to roll back**.

For example:

- V2 removes or renames a database column that V1 still needs.
- V2 changes an enum or data format that V1 does not understand.
- V2 writes new data that V1 cannot parse.
- V2 performs an irreversible/destructive migration.
- V2 changes dependencies or configuration assumptions.
- Returning only the application code to V1 may therefore fail.
- Restoring the entire old database may also be unsafe because it can destroy legitimate production data created after V2 was deployed.

Punar tries to detect these problems **before production deployment** by rehearsing the rollback in a temporary environment.

---

# 2. The Core Problem

## Simple version

Developers normally test whether **V2 works going forward**.

They do not always test whether **V1 will still work after V2 has changed the database**.

That means a team may believe:

> “If V2 fails, we will just roll back to V1.”

But after V2 runs database migrations or writes new-format data, V1 may no longer be compatible.

So the rollback command may succeed while the application itself fails.

---

## More precise problem statement

Modern CI/CD pipelines validate forward deployment through builds, tests, staging environments, health checks, canary releases, and monitoring.

However, rollback readiness is often assumed rather than verified.

When a new release changes:

- database schemas,
- persisted data,
- APIs,
- dependencies,
- configuration,
- event/message formats,
- or other shared state,

the previous application version may no longer be able to operate correctly against the changed environment.

This creates **rollback compatibility drift**.

A rollback can therefore restore old application code without restoring a truly usable previous system state.

---

# 3. Key Insight

## Backup is not the same as rollback safety

A backup answers:

> “Can we restore an older copy?”

Punar asks:

> “Can the old application still operate safely after the new release has already changed shared state?”

These are different problems.

A full database restore may also cause data loss because production data created after deployment may be overwritten.

Therefore, Punar is **not primarily a backup product**.

---

# 4. Final Solution

Punar performs a **rollback rehearsal before deployment**.

The system creates a temporary production-like environment, applies the incoming release changes, then attempts to return the application to the previous version **without simply restoring the database to its old state**.

The goal is to prove whether rollback is actually compatible.

---

# 5. Final Product Workflow

```text
Connect Project / Repository
        ↓
Identify Current Version (V1)
        ↓
Identify Incoming Version (V2)
        ↓
Analyze Code + Dependencies + Migrations
        ↓
Detect Database / State Changes
        ↓
Create Temporary Rehearsal Environment
        ↓
Clone / Snapshot Production-like Database State
        ↓
Apply V2 Migration
        ↓
Run V2 / Generate Representative V2 State
        ↓
Switch Application Back to V1
        ↓
Run Compatibility Tests
        ↓
Detect Rollback Failures
        ↓
IBM Bob Explains Root Cause
        ↓
Recommend Safer Migration / Fix
        ↓
Generate Rollback Readiness Report
        ↓
SAFE / WARNING / UNSAFE
```

---

# 6. Example Scenario

Assume production currently runs:

```text
Application: V1
Database: Schema V1
```

The developer prepares V2.

V2 introduces a migration:

```text
orders.status
```

V1 understands:

```text
PENDING
PAID
FAILED
```

V2 introduces:

```text
REFUNDED_PENDING
```

During the rehearsal:

1. Punar copies a production-like database.
2. Punar applies the V2 migration.
3. V2 creates records containing `REFUNDED_PENDING`.
4. Punar switches the application back to V1.
5. V1 reads the new records.
6. V1 fails because it does not understand `REFUNDED_PENDING`.

Punar reports:

```text
ROLLBACK STATUS: UNSAFE

Reason:
V2 introduces a persisted database value that V1 cannot interpret.

Affected component:
Order processing

Recommended action:
Use a backward-compatible migration / expand-contract strategy.
```

The failure is discovered **before the real production deployment**.

---

# 7. Other Rollback Risks Punar Should Detect

The MVP does not need to solve every possible deployment problem, but the product concept should support risks such as:

### Schema incompatibility

```text
V2 deletes:
users.username

V1 still reads:
users.username
```

### Column rename

```text
V1:
customer_name

V2:
full_name
```

### Type changes

```text
INT → UUID
VARCHAR → JSON
nullable → non-null
```

### Enum/data-format changes

V2 writes values V1 does not recognize.

### Destructive migrations

Examples:

- DROP COLUMN
- DROP TABLE
- irreversible data transformations

### API / contract compatibility

A service deployed in V2 may produce responses or events V1 cannot consume.

### Dependency/configuration drift

V2 may introduce assumptions that break the restored V1 runtime.

---

# 8. IBM Bob's Role

IBM Bob must be a **meaningful part of the developer workflow**, not a logo added to the architecture.

## Planned responsibilities

IBM Bob should help understand:

- repository structure,
- V1 and V2 code differences,
- database migration files,
- ORM models,
- dependencies,
- configuration changes,
- code locations affected by schema changes,
- rollback-sensitive logic,
- compatibility risks.

Example:

```text
Migration:
DROP COLUMN users.username

Bob finds:
src/auth/user-service.ts
src/profile/profile-service.ts
src/admin/user-export.ts

All still reference users.username in V1.
```

Bob can then explain:

> V2 removes a database field still required by the rollback version.  
> Rolling the application back to V1 after this migration would cause runtime failures.

---

# 9. IBM Bob Output Should Be Evidence-Based

The product should not only display:

```text
AI says rollback is dangerous.
```

It should display evidence.

Example:

```text
Risk: HIGH

Migration:
migrations/018_remove_username.sql

Breaking change:
DROP COLUMN users.username

V1 references:
src/auth/user-service.ts:84
src/profile/profile-service.ts:41
src/admin/user-export.ts:112
```

Then Bob provides the understandable explanation.

This makes Bob part of the engineering analysis rather than a generic chatbot.

---

# 10. Optional watsonx Components

The hackathon guide lists watsonx.ai and watsonx Orchestrate as optional technologies.

They are **not mandatory just because they are IBM products**.

## watsonx.ai

Potential role:

- summarize technical findings,
- classify rollback risk,
- explain failures,
- generate recommended remediation,
- convert low-level test output into a human-readable report.

## watsonx Orchestrate

Potential role:

Coordinate a multi-step workflow such as:

```text
Analyze Repository
      ↓
Detect Migration
      ↓
Create Rehearsal Environment
      ↓
Apply Migration
      ↓
Run Compatibility Tests
      ↓
Collect Failures
      ↓
Generate Report
```

Only add these components if they improve the working prototype.

The project should remain valuable with **IBM Bob as the central development-intelligence layer**.

---

# 11. Recommended Migration Strategy

A major remediation Punar can recommend is an **expand-contract migration**.

Instead of making a destructive schema change immediately:

```text
Old schema → Delete old field → New schema
```

use a staged approach:

```text
Expand
  ↓
Support old + new format
  ↓
Deploy compatible application versions
  ↓
Migrate data safely
  ↓
Verify
  ↓
Contract/remove old format in a later release
```

This preserves backward compatibility long enough for a safe rollback window.

---

# 12. Product Form

Punar should be a **web-based developer platform/dashboard**.

It is not a mobile application.

The website is the control plane.

The important innovation is the backend/rehearsal logic.

---

# 13. Final UX Story

The primary product story should be:

```text
Analyze Change
      ↓
Rehearse Rollback
      ↓
Detect Compatibility Risk
      ↓
Explain Root Cause
      ↓
Recommend Fix
      ↓
Generate Report
      ↓
Deploy With Confidence
```

The product should NOT mainly communicate:

```text
Deploy → Monitor → Failure → Click Rollback
```

That would make Punar look like a generic CI/CD or recovery platform.

---

# 14. Core Screens

The final product should emphasize the following screens.

## 14.1 Project Overview

Show:

- repository/project,
- current production version,
- incoming version,
- database,
- detected migrations,
- latest rollback-readiness status.

Primary CTA:

```text
Run Rollback Check
```

---

## 14.2 Change Analysis

Compare V1 and V2.

Show:

- application changes,
- migration files,
- dependency changes,
- schema changes,
- suspicious/destructive operations.

Example:

```text
+ users.phone_verified
- orders.legacy_status
~ payment_status enum
```

---

## 14.3 Rollback Rehearsal

Visually show the workflow:

```text
✓ Clone environment
✓ Restore production-like state
✓ Apply V2 migration
✓ Run V2 validation
✓ Generate V2 state
→ Start V1 against post-V2 database
→ Run rollback compatibility tests
```

This should be one of the most important screens in the product.

---

## 14.4 Risk Result

Example:

```text
ROLLBACK SAFETY

UNSAFE

3 compatibility issues detected
```

Each issue should show:

- severity,
- exact migration,
- affected code,
- reason,
- likely impact.

---

## 14.5 IBM Bob Explanation

Bob explains:

- what changed,
- why rollback fails,
- affected components,
- production impact,
- confidence/evidence,
- suggested remediation.

---

## 14.6 Recommended Fix

Example:

```text
Recommended strategy:
Expand-contract migration
```

Possible actions:

- preserve old column temporarily,
- dual-write old/new fields,
- make enum handling backward compatible,
- postpone destructive cleanup,
- introduce compatibility layer.

---

## 14.7 Rollback Readiness Report

Example:

```text
Project: payment-service

V1: 1.8.2
V2: 1.9.0

Schema changes:       7
Breaking risks:       2
Compatibility tests:  16 / 18 passed

Rollback status:      UNSAFE
```

The report should be exportable/shareable in the complete version.

---

# 15. Supporting Screens

The existing UI concept also contains/supports areas such as:

- Dashboard
- Projects
- Deployments
- Snapshots
- Monitoring
- Recovery / Rollback history
- Audit
- Settings

These can remain as supporting modules.

However:

> **They must not overshadow the rollback rehearsal and compatibility workflow.**

Too much CPU/RAM/uptime/pod/monitoring information would make the platform look like Datadog, Grafana, Jenkins, or a generic DevOps dashboard.

---

# 16. UI / UX Status

## Completed

The Figma/UI design phase has been completed.

Published prototype:

https://plug-react-13919343.figma.site/

The visual direction is a dark, professional developer-tool dashboard.

The current design already establishes the larger product shell and navigation.

## Important implementation adjustment

Earlier UI iterations leaned more toward:

```text
Deploy → Monitor → Failure → Rollback
```

The final concept is now more precise.

During implementation, the central experience must emphasize:

```text
Analyze V1/V2
      ↓
Detect Migration
      ↓
Rehearse Rollback
      ↓
Find Compatibility Failure
      ↓
Bob Explanation
      ↓
Recommended Fix
      ↓
Safety Report
```

We do **not** need to throw away the entire Figma design.

We mainly need to make the final rollback-readiness workflow the hero journey.

---

# 17. Project Progress

## Research and problem discovery — COMPLETE

We explored multiple developer-workflow problems before choosing the final direction.

Ideas investigated included:

- Serial Access Blockers
- Observability Evidence Gap
- Behavioral Scope Drift
- Flake Attribution Gap
- Resilience Path Rot
- Rollback Compatibility Drift

After a second-pass originality/competitor audit, the strongest remaining candidates were:

- Serial Access Blockers
- Rollback Compatibility Drift

The final selected direction was:

> **Rollback Compatibility Drift**

because it had a clear developer pain point, a strong demo, strong IBM Bob relevance, and was sufficiently different from generic deployment/backup tooling.

---

## Problem statement — COMPLETE

Final direction:

> Teams usually validate whether they can deploy forward, but they often do not verify whether the previous version can actually run after the new version changes shared database/state.

---

## Solution concept — COMPLETE

Final solution:

> Pre-deployment rollback compatibility analysis and rollback rehearsal.

---

## Product workflow — COMPLETE

The primary workflow has been established:

```text
Connect → Analyze → Detect Migration → Rehearse → Find Risk → Explain → Fix → Report
```

---

## IBM technology role — DEFINED

IBM Bob:

- repository/code intelligence,
- migration analysis,
- affected-code discovery,
- compatibility reasoning,
- developer-facing explanations and recommended changes.

watsonx.ai / Orchestrate:

- optional extensions if they materially improve the prototype.

---

## Figma/UI/UX — COMPLETE FOR CURRENT PHASE

The public Figma prototype is available.

No backend has been integrated into the published prototype yet.

The implementation phase must now align the working UI with the final rollback-rehearsal workflow.

---

## Frontend implementation — NOT STARTED / NEXT PHASE

The next major phase is converting the completed design into the working web application.

---

## Rollback analysis engine — NOT IMPLEMENTED YET

Still required:

- version comparison,
- migration discovery,
- migration classification,
- compatibility rules,
- temporary rehearsal environment,
- test execution,
- result collection,
- Bob-powered explanation.

---

## Database rehearsal — NOT IMPLEMENTED YET

Still required:

```text
Copy test DB
→ Apply V2 migration
→ optionally create representative V2 data
→ run V1
→ detect incompatibility
```

---

## Real IBM Bob integration — NOT IMPLEMENTED YET

The intended integration has been designed conceptually but still needs to be connected during implementation.

---

# 18. MVP Scope

For the hackathon, avoid solving every database/framework/deployment combination.

The previously discussed practical MVP scope is:

```text
Application:
Node.js / TypeScript

Database:
PostgreSQL

Migration support:
One migration framework / clearly structured SQL migrations

Versions:
V1 and V2

Environment:
Temporary local/containerized rehearsal environment
```

The MVP only needs to convincingly prove the core idea.

---

# 19. MVP Must Actually Demonstrate

The demo should contain at least one deliberately rollback-incompatible release.

Example:

```text
V1
↓
V2 migration changes DB
↓
V2 works
↓
Punar attempts V1 against post-V2 DB
↓
V1 fails
↓
Punar detects exact reason
↓
IBM Bob explains issue
↓
Punar recommends safer migration
```

A second SAFE example would make the comparison stronger:

```text
Release A → SAFE
Release B → UNSAFE
```

---

# 20. Suggested MVP Architecture

This is the current implementation direction, not a hard requirement.

```text
Frontend Dashboard
        │
        ▼
Backend API
        │
        ├── Repository Analyzer
        │
        ├── Version Comparator
        │
        ├── Migration Analyzer
        │
        ├── Rehearsal Engine
        │
        ├── Test Runner
        │
        ├── Risk Engine
        │
        └── Report Generator
        │
        ▼
IBM Bob / Development Intelligence
        │
        ▼
PostgreSQL Temporary Rehearsal Environment
```

Containerization can be used to create isolated V1/V2/test environments.

---

# 21. Possible Backend Modules

A clean implementation could contain modules similar to:

```text
repository/
versioning/
migration-analysis/
rehearsal/
compatibility/
testing/
bob-analysis/
reports/
audit/
```

Do not treat these names as mandatory.

The architecture should stay simple enough for a hackathon.

---

# 22. Risk Classification

A simple MVP classification is enough:

```text
SAFE
WARNING
UNSAFE
```

Example rules:

### SAFE

Backward-compatible additive migration.

```sql
ALTER TABLE users
ADD COLUMN phone_verified BOOLEAN NULL;
```

### WARNING

Behavior changed but fallback may exist.

### UNSAFE

Destructive/incompatible migration.

```sql
ALTER TABLE users
DROP COLUMN username;
```

when V1 still requires `username`.

---

# 23. What Punar Is NOT

IBM Bob should preserve these boundaries while building the project.

Punar is **not** primarily:

- a backup manager,
- a generic CI/CD platform,
- a deployment button,
- a Kubernetes dashboard,
- a monitoring platform,
- a logging platform,
- an incident-management platform,
- a generic AI coding chatbot,
- an app-store/product-growth system,
- a generic release-readiness checklist.

These may appear as integrations or supporting features, but they are not the project's core innovation.

---

# 24. Main Differentiation

Existing tooling often asks:

```text
Did deployment succeed?
Are health checks green?
Can we redeploy the previous artifact?
Do we have a database backup?
```

Punar asks:

```text
After V2 changes persistent state,
does V1 still function correctly?
```

That is the product's central differentiation.

---

# 25. Judge-Friendly Explanation

## One-line pitch

> **Punar checks whether you can safely go back before you move forward.**

## Slightly longer pitch

> Punar is an AI-assisted rollback rehearsal platform that tests a previous application version against the database and state produced by an incoming release, identifying rollback incompatibilities before production deployment.

## Beginner-friendly version

> Before you update an application, Punar creates a safe practice environment, performs the update, then tries going back to the old version. If going back breaks because the database changed, Punar tells the developer before the real deployment.

---

# 26. Why This Improves Developer Workflow

Without Punar:

```text
Developer creates V2
      ↓
Tests V2
      ↓
Deploys V2
      ↓
Production failure
      ↓
Tries rollback
      ↓
Discovers V1 no longer works
      ↓
Emergency debugging
```

With Punar:

```text
Developer creates V2
      ↓
Punar analyzes change
      ↓
Punar rehearses rollback
      ↓
Compatibility problem found
      ↓
Bob explains exact issue
      ↓
Developer fixes migration
      ↓
Deploy
```

This moves rollback failure discovery from an emergency production situation into the normal development/release workflow.

---

# 27. Current Product Name

**Punar** is the current working name used in the project discussions.

Meaning/intention:

> “Again / return / restore”

The name fits the idea of safely returning to a previous working software state.

Do not rename the project during implementation unless explicitly requested.

---

# 28. Immediate Next Phase

The Figma phase is considered complete for now.

The next work should happen in implementation.

Recommended order:

1. Create the project structure.
2. Implement the Figma-based frontend shell.
3. Build one demo repository containing V1 and V2.
4. Add one PostgreSQL migration that intentionally breaks rollback.
5. Implement migration detection.
6. Implement the temporary rehearsal environment.
7. Run V2 migration.
8. Run V1 against the post-V2 database.
9. Capture the failure.
10. Integrate IBM Bob analysis.
11. Show the result in the Risk screen.
12. Generate a rollback readiness report.
13. Add one safe migration case for comparison.
14. Polish the demo.

---

# 29. Priority Order

If hackathon time becomes limited, prioritize:

```text
1. Working rollback rehearsal
2. Clear unsafe migration demo
3. Exact evidence of why V1 fails
4. IBM Bob analysis/explanation
5. Strong UI presentation
6. Recommended fix
7. Final report
```

Supporting monitoring/settings/audit features are lower priority.

---

# 30. Instructions for IBM Bob While Building

When using this README as context, follow these rules:

1. **Do not redesign the core product idea.**
2. Keep pre-deployment rollback compatibility as the main problem.
3. Do not turn the product into a generic CI/CD dashboard.
4. Do not make backups the primary solution.
5. Preserve the completed Figma visual direction where practical.
6. Make rollback rehearsal the central user journey.
7. Keep the MVP technically achievable for a hackathon.
8. Prefer one strong working scenario over many fake integrations.
9. Every AI-generated risk should be backed by code/migration/test evidence where possible.
10. IBM Bob should have a real developer-intelligence role.
11. Build feature-by-feature rather than generating a huge backend at once.
12. Keep changes understandable and explain what each implementation step adds.
13. Do not replace already-working parts unless necessary.
14. Treat supporting features such as monitoring, recovery history, audit, and settings as secondary.
15. The final demo must clearly answer:

> **“If V2 fails, can V1 actually run against the state V2 leaves behind?”**

---

# 31. Definition of a Successful Hackathon Prototype

The prototype is successful if a judge can watch a short demo and understand:

1. There is a currently stable V1.
2. A developer wants to deploy V2.
3. V2 contains a database/state change.
4. Punar detects the change.
5. Punar rehearses the upgrade and rollback.
6. V1 fails against the post-V2 state.
7. Punar identifies the exact incompatibility.
8. IBM Bob explains the technical reason.
9. Punar recommends a safer change.
10. The developer receives a clear rollback safety result before production deployment.

If the judge understands that story, the core project is working.

---

# 32. Current Status Summary

```text
Problem research                    ✅ Complete
Competitor/originality audit        ✅ Complete
Final problem selection             ✅ Complete
Problem statement                   ✅ Complete
Solution concept                    ✅ Complete
Core workflow                       ✅ Complete
IBM Bob role                        ✅ Defined
Optional watsonx role               ✅ Understood
Product form                        ✅ Web dashboard
Figma/UI/UX                         ✅ Current phase complete
Public UI prototype                 ✅ Available

Frontend implementation             ⏳ Next
Backend API                         ⏳ Not implemented
Migration analysis engine           ⏳ Not implemented
Rollback rehearsal engine           ⏳ Not implemented
Temporary DB environment            ⏳ Not implemented
Automated compatibility tests       ⏳ Not implemented
IBM Bob runtime integration         ⏳ Not implemented
Risk report generation              ⏳ Not implemented
End-to-end hackathon demo           ⏳ Not implemented
```

---

# 33. Final North Star

When uncertain about a feature, design choice, or implementation decision, return to this question:

> **Does this help a developer know—before deployment—whether the previous version will still work after the new version changes persistent state?**

If the answer is no, it is probably secondary to the MVP.

---

**Project:** Punar  
**Hackathon:** IBM BOB 2.0  
**Core theme:** Pre-deployment rollback compatibility and rehearsal  
**Current transition:** Design complete → implementation begins
