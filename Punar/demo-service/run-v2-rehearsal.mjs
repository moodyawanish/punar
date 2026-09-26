/**
 * V2 rehearsal runner — executed inside Docker on the database_default network.
 *
 * Starts the V2 express service, POSTs to /orders/refund-pending to write a
 * REFUNDED_PENDING order, then exits.  The DATABASE_URL env var points at the
 * rehearsal DB via internal Docker DNS (punar_postgres_rehearsal:5432).
 */

import express from 'express';
import pg from 'pg';
import http from 'http';

const { Pool } = pg;
const PORT = 3011;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(express.json());

app.post('/orders/refund-pending', async (_req, res) => {
  try {
    const result = await db.query(
      `INSERT INTO orders (customer_id, amount, status, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [1, 99.99, 'REFUNDED_PENDING']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = app.listen(PORT, async () => {
  console.log(`V2 running on port ${PORT}`);
  try {
    // POST to self
    const data = await new Promise((resolve, reject) => {
      const req = http.request(
        { hostname: 'localhost', port: PORT, path: '/orders/refund-pending', method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } },
        (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            if (res.statusCode !== 201) reject(new Error(`HTTP ${res.statusCode}: ${body}`));
            else resolve(JSON.parse(body));
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
    console.log(`REFUNDED_PENDING order created: id=${data.id}, status=${data.status}`);
    server.close();
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    server.close();
    await db.end();
    process.exit(1);
  }
});
