ALTER TYPE "public"."account_event_kind" ADD VALUE 'limit_breach_rejected' BEFORE 'bet_placed';--> statement-breakpoint
ALTER TYPE "public"."wallet_limit_kind" ADD VALUE 'wager';--> statement-breakpoint
CREATE UNIQUE INDEX "account_events_limit_effective_once" ON "account_events" USING btree (("payload"->>'limitId')) WHERE "account_events"."kind" = 'limit_effective';