-- Enforce append-only ledger invariant on transactions (see docs/adr/0005-wallet-invariant.md).
-- Triggers block UPDATE/DELETE regardless of role — stronger than REVOKE because owners ignore grants.
-- Paired with REVOKE so any non-superuser app role also loses the privilege statically.

REVOKE UPDATE, DELETE ON "transactions" FROM PUBLIC;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION prevent_transactions_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'transactions is append-only (see ADR-0005)';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

CREATE TRIGGER transactions_no_update
  BEFORE UPDATE ON "transactions"
  FOR EACH ROW EXECUTE FUNCTION prevent_transactions_mutation();
--> statement-breakpoint

CREATE TRIGGER transactions_no_delete
  BEFORE DELETE ON "transactions"
  FOR EACH ROW EXECUTE FUNCTION prevent_transactions_mutation();
