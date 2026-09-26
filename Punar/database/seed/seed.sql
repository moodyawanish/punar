-- =============================================================================
-- Seed: Representative V1 production-like data
-- Applied after 001_v1_schema.sql to create a realistic starting state.
-- =============================================================================

INSERT INTO users (email, username) VALUES
  ('alice@example.com', 'alice'),
  ('bob@example.com',   'bob'),
  ('carol@example.com', 'carol');

INSERT INTO orders (customer_id, amount, status, legacy_status) VALUES
  (1, 49.99,  'PAID',    'completed'),
  (2, 129.00, 'PENDING', 'awaiting'),
  (1, 19.95,  'FAILED',  'failed'),
  (3, 75.00,  'PAID',    'completed'),
  (2, 250.00, 'PENDING', 'awaiting');
