/**
 * payment-service v1 (v2.3.0) — Main entry
 *
 * Knows payment_status values: PENDING | PAID | FAILED
 * Does NOT understand REFUNDED_PENDING (introduced by V2).
 *
 * This is the rollback target. Punar tests whether this version
 * can safely run against the database state left behind by V2.
 */

import express from 'express';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT ?? 3010;

const db = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://punar:punar@localhost:5432/payment_service',
});

// V1 only knows these statuses
const KNOWN_STATUSES = ['PENDING', 'PAID', 'FAILED'] as const;
type PaymentStatus = typeof KNOWN_STATUSES[number];

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.3.0' });
});

app.get('/orders', async (_req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
    const orders = result.rows.map((row) => {
      // V1 will throw here if row.status is REFUNDED_PENDING
      if (!KNOWN_STATUSES.includes(row.status)) {
        throw new Error(`Unknown payment status: ${row.status}`);
      }
      return row;
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`payment-service v1 (v2.3.0) running on http://localhost:${PORT}`);
});
