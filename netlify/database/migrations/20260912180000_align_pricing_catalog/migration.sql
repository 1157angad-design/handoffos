INSERT INTO "plans" ("id", "name", "monthly_price_cents", "annual_price_cents", "handoff_limit", "project_limit", "seat_limit", "features", "active") VALUES
('free-trial', 'Free Trial', 0, 0, 150, 1, 2, '["Bidirectional handoffs","Context preservation","SDK and API access"]'::jsonb, true),
('standard', 'Standard', 199900, 2398800, 2500, 5, 5, '["Bidirectional handoffs","Context preservation","SDK and API access"]'::jsonb, true),
('pro', 'Pro', 699900, 8398800, 8000, 15, 15, '["Bidirectional handoffs","Analytics","Priority support"]'::jsonb, true),
('advanced', 'Advanced', 999900, 11998800, 12000, 30, 30, '["Bidirectional handoffs","Analytics","Audit logs"]'::jsonb, true),
('business', 'Business', 2799900, 33598800, 30000, 75, 75, '["Bidirectional handoffs","Analytics","Audit logs"]'::jsonb, true),
('enterprise', 'Enterprise', 6999900, 83998800, 2147483647, 1000, 1000, '["Unlimited handoffs","Customisation","Dedicated architecture"]'::jsonb, true)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "monthly_price_cents" = EXCLUDED."monthly_price_cents", "annual_price_cents" = EXCLUDED."annual_price_cents", "handoff_limit" = EXCLUDED."handoff_limit", "project_limit" = EXCLUDED."project_limit", "seat_limit" = EXCLUDED."seat_limit", "features" = EXCLUDED."features", "active" = true;

UPDATE "subscriptions" SET "plan_id" = 'standard' WHERE "plan_id" IN ('starter', 'professional');
UPDATE "plans" SET "active" = false WHERE "id" IN ('starter', 'professional');
