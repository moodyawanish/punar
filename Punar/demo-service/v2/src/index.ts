/**
 * payment-service v2 (v2.4.0) — Main entry
 *
 * Introduces REFUNDED_PENDING as a new payment status.
 * Runs migrations 017, 018, 019 before starting.
 *
 * After V2 runs and creates orders with REFUNDED_PENDING,
 * Punar switches back to V1 — which will fail reading those records.
 */

import express from 'express';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT ?? 3011;

const db = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://punar:punar@localhost:5432/payment_service',
});

// V2 knows all statuses including the new one
const KNOWN_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED_PENDING'] as const;
type PaymentStatus = typeof KNOWN_STATUSES[number];

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.4.0' });
});

app.get('/orders', async (_req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// V2 endpoint: create a refund-pending order (generates representative V2 state)
app.post('/orders/refund-pending', async (_req, res) => {
  try {
    const result = await db.query(
      `INSERT INTO orders (customer_id, amount, status, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [1, 99.99, 'REFUNDED_PENDING']
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`payment-service v2 (v2.4.0) running on http://localhost:${PORT}`);
});
