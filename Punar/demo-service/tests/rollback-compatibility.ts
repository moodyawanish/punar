/**
 * Rollback Compatibility Tests
 *
 * These tests verify whether V1 (v2.3.0) can safely operate
 * against the database state left behind by V2 (v2.4.0).
 *
 * Run by Punar's rehearsal engine after:
 *   1. V2 migrations have been applied to the rehearsal DB
 *   2. V2 has written representative state (REFUNDED_PENDING orders)
 *   3. The app has been switched back to V1
 *
 * A test failure = UNSAFE rollback.
 */

import { Pool } from 'pg';

const db = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://punar:punar@localhost:5432/payment_service_rehearsal',
});

const V1_KNOWN_STATUSES = ['PENDING', 'PAID', 'FAILED'];

async function testRollbackOrderCompatibility(): Promise<void> {
  const result = await db.query('SELECT id, status FROM orders');
  for (const row of result.rows) {
    if (!V1_KNOWN_STATUSES.includes(row.status)) {
      throw new Error(
        `rollback-order-compatibility FAILED: Unknown payment status: ${row.status} (order id=${row.id})`
      );
    }
  }
  console.log('rollback-order-compatibility PASSED');
}

async function testRollbackSchemaCompatibility(): Promise<void> {
  // V1 still references orders.legacy_status — check it exists
  const result = await db.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'legacy_status'
  `);
  if (result.rows.length === 0) {
    throw new Error(
      'rollback-schema-compatibility FAILED: Column orders.legacy_status does not exist (dropped by V2 migration 018)'
    );
  }
  console.log('rollback-schema-compatibility PASSED');
}

async function runAll(): Promise<void> {
  const tests = [testRollbackOrderCompatibility, testRollbackSchemaCompatibility];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (err: any) {
      console.error(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nRollback compatibility: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log('ROLLBACK COMPATIBILITY: UNSAFE');
    process.exit(1);
  } else {
    console.log('ROLLBACK COMPATIBILITY: SAFE');
  }

  await db.end();
}

runAll();
