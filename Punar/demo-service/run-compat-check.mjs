/**
 * Rollback compatibility check — executed inside Docker on the database_default network.
 *
 * Mirrors the logic in tests/rollback-compatibility.ts but as plain ESM (no tsx needed).
 * DATABASE_URL env var points at the rehearsal DB via internal Docker DNS.
 *
 * Exit 1 = UNSAFE (V1 cannot safely run against the post-V2 database state).
 * Exit 0 = SAFE.
 */

import pg from 'pg';

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const V1_KNOWN_STATUSES = ['PENDING', 'PAID', 'FAILED'];

async function testRollbackOrderCompatibility() {
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

async function testRollbackSchemaCompatibility() {
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

async function runAll() {
  const tests = [testRollbackOrderCompatibility, testRollbackSchemaCompatibility];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nRollback compatibility: ${passed} passed, ${failed} failed`);
  await db.end();

  if (failed > 0) {
    console.log('ROLLBACK COMPATIBILITY: UNSAFE');
    process.exit(1);
  } else {
    console.log('ROLLBACK COMPATIBILITY: SAFE');
    process.exit(0);
  }
}

runAll();
