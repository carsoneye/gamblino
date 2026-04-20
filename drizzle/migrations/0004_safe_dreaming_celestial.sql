CREATE TYPE "public"."account_event_kind" AS ENUM('signup', 'login', 'logout', 'daily_grant_claimed', 'limit_set', 'limit_effective', 'bet_placed', 'bet_settled');--> statement-breakpoint
CREATE TYPE "public"."currency_kind" AS ENUM('credit', 'usd', 'usdt', 'usdc', 'btc', 'eth');--> statement-breakpoint
CREATE TYPE "public"."geo_event_source" AS ENUM('signup_credentials', 'signup_magic_link_first_load', 'login', 'ws_connect');--> statement-breakpoint
CREATE TYPE "public"."wallet_limit_kind" AS ENUM('deposit', 'loss', 'session_length_min');--> statement-breakpoint
ALTER TYPE "public"."tx_reason" ADD VALUE 'daily_grant' BEFORE 'bet_stake';--> statement-breakpoint
CREATE TABLE "account_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "account_event_kind" NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_geo_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ip" text NOT NULL,
	"user_agent" text,
	"country" text,
	"region" text,
	"city" text,
	"asn" integer,
	"asn_org" text,
	"vpn" boolean DEFAULT false NOT NULL,
	"source" "geo_event_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"currency_kind" "currency_kind" NOT NULL,
	"kind" "wallet_limit_kind" NOT NULL,
	"amount" bigint NOT NULL,
	"set_at" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_limits_amount_nonneg" CHECK ("wallet_limits"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"user_id" uuid NOT NULL,
	"currency_kind" "currency_kind" NOT NULL,
	"balance" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_currency_kind_pk" PRIMARY KEY("user_id","currency_kind"),
	CONSTRAINT "wallets_balance_nonneg" CHECK ("wallets"."balance" >= 0)
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "currency_kind" "currency_kind" DEFAULT 'credit' NOT NULL;--> statement-breakpoint
ALTER TABLE "account_events" ADD CONSTRAINT "account_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_geo_events" ADD CONSTRAINT "user_geo_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_limits" ADD CONSTRAINT "wallet_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_events_user_created_idx" ON "account_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "account_events_kind_idx" ON "account_events" USING btree ("kind","created_at");--> statement-breakpoint
CREATE INDEX "user_geo_events_user_created_idx" ON "user_geo_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "wallet_limits_lookup_idx" ON "wallet_limits" USING btree ("user_id","currency_kind","kind","effective_at");--> statement-breakpoint

-- Backfill: seed a credit-currency wallet row per existing user, mirroring users.balance.
-- users.balance stays for now as a denormalized mirror; T4 refactor drops the write path,
-- and a follow-up migration drops the column once no code reads it.
INSERT INTO "wallets" ("user_id", "currency_kind", "balance")
  SELECT "id", 'credit', "balance" FROM "users"
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- Data migration: rewrite historical idempotency keys to the srv_ prefix before CHECK lands.
-- One-shot rewrite keeps the constraint uniform across all rows — no partial/conditional CHECK.
-- The append-only trigger (ADR-0005) normally blocks UPDATE on transactions; we toggle it off
-- for this one migration statement, then restore it. DISABLE/ENABLE TRIGGER requires table-owner
-- role, which the migration runs as — app-role connections never see the trigger disabled.
ALTER TABLE "transactions" DISABLE TRIGGER "transactions_no_update";
--> statement-breakpoint
UPDATE "transactions"
  SET "idempotency_key" = 'srv_' || "idempotency_key"
  WHERE "idempotency_key" LIKE 'signup:%';
--> statement-breakpoint
ALTER TABLE "transactions" ENABLE TRIGGER "transactions_no_update";
--> statement-breakpoint

ALTER TABLE "transactions" ADD CONSTRAINT "tx_idem_prefix" CHECK ("transactions"."idempotency_key" IS NULL OR "transactions"."idempotency_key" ~ '^(srv_|cli_)');
--> statement-breakpoint

-- Append-only enforcement on audit tables (see ADR-0013). Mirrors the transactions
-- trigger pattern from migration 0001: REVOKE is belt, triggers are suspenders.

REVOKE UPDATE, DELETE ON "wallet_limits" FROM PUBLIC;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION prevent_wallet_limits_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'wallet_limits is append-only (see ADR-0013)';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER wallet_limits_no_update
  BEFORE UPDATE ON "wallet_limits"
  FOR EACH ROW EXECUTE FUNCTION prevent_wallet_limits_mutation();
--> statement-breakpoint
CREATE TRIGGER wallet_limits_no_delete
  BEFORE DELETE ON "wallet_limits"
  FOR EACH ROW EXECUTE FUNCTION prevent_wallet_limits_mutation();
--> statement-breakpoint

REVOKE UPDATE, DELETE ON "account_events" FROM PUBLIC;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION prevent_account_events_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'account_events is append-only (see ADR-0013)';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER account_events_no_update
  BEFORE UPDATE ON "account_events"
  FOR EACH ROW EXECUTE FUNCTION prevent_account_events_mutation();
--> statement-breakpoint
CREATE TRIGGER account_events_no_delete
  BEFORE DELETE ON "account_events"
  FOR EACH ROW EXECUTE FUNCTION prevent_account_events_mutation();
--> statement-breakpoint

REVOKE UPDATE, DELETE ON "user_geo_events" FROM PUBLIC;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION prevent_user_geo_events_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'user_geo_events is append-only (see ADR-0014)';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER user_geo_events_no_update
  BEFORE UPDATE ON "user_geo_events"
  FOR EACH ROW EXECUTE FUNCTION prevent_user_geo_events_mutation();
--> statement-breakpoint
CREATE TRIGGER user_geo_events_no_delete
  BEFORE DELETE ON "user_geo_events"
  FOR EACH ROW EXECUTE FUNCTION prevent_user_geo_events_mutation();
