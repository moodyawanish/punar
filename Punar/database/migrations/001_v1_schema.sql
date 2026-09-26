-- =============================================================================
-- Migration 001: V1 Schema (payment-service v2.3.0)
-- This is the starting state — the schema that V1 runs against in production.
-- =============================================================================

-- Payment status type — V1 only knows these three values
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED');

-- Orders table (V1 schema)
CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  amount      NUMERIC(10, 2) NOT NULL,
  status      payment_status NOT NULL DEFAULT 'PENDING',
  -- legacy_status is a VARCHAR column still actively used by V1
  legacy_status VARCHAR(50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table (V1 schema — no phone_verified yet)
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  username   VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_status     ON orders (status);
CREATE INDEX idx_orders_customer   ON orders (customer_id);
