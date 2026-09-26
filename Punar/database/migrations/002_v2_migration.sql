-- =============================================================================
-- Migration 002: V2 Changes (payment-service v2.4.0)
-- These are the three migrations that V2 applies.
-- They collectively make rollback to V1 UNSAFE.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 017_add_phone_verified.sql
-- SAFE: additive, nullable column — V1 will simply ignore this column.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NULL DEFAULT FALSE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 018_drop_legacy_status.sql
-- UNSAFE: V1 still queries orders.legacy_status directly.
-- After this runs, any V1 query referencing this column will fail.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE orders
DROP COLUMN IF EXISTS legacy_status;


-- ─────────────────────────────────────────────────────────────────────────────
-- 019_payment_status.sql
-- UNSAFE: V1 does not recognize REFUNDED_PENDING.
-- After V2 writes records with this status, V1 will throw on read.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'REFUNDED_PENDING';
