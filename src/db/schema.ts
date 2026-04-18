import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const gameKind = pgEnum("game_kind", ["crash", "mines", "plinko"]);
export const roundState = pgEnum("round_state", ["open", "settled", "voided"]);
export const betStatus = pgEnum("bet_status", ["open", "won", "lost", "cashed_out", "voided"]);
export const txReason = pgEnum("tx_reason", [
  "signup_bonus",
  "bet_stake",
  "bet_payout",
  "adjustment",
]);

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull(),
    name: text(),
    image: text(),
    emailVerified: timestamp({ withTimezone: true, mode: "date" }),
    passwordHash: text(),
    balance: bigint({ mode: "bigint" }).notNull().default(sql`0`),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_uniq").on(t.email),
    check("users_balance_nonneg", sql`${t.balance} >= 0`),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text().$type<AdapterAccountType>().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: text(),
    scope: text(),
    id_token: text(),
    session_state: text(),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("accounts_user_idx").on(t.userId),
  ],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const seeds = pgTable(
  "seeds",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid().references(() => users.id, { onDelete: "cascade" }),
    serverSeedHash: text().notNull(),
    serverSeed: text(),
    clientSeed: text().notNull(),
    nonce: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    revealedAt: timestamp({ withTimezone: true, mode: "date" }),
  },
  (t) => [index("seeds_user_idx").on(t.userId)],
);

export const rounds = pgTable(
  "rounds",
  {
    id: uuid().primaryKey().defaultRandom(),
    game: gameKind().notNull(),
    seedId: uuid()
      .notNull()
      .references(() => seeds.id, { onDelete: "restrict" }),
    nonce: integer().notNull(),
    state: roundState().notNull().default("open"),
    result: jsonb(),
    openedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    settledAt: timestamp({ withTimezone: true, mode: "date" }),
  },
  (t) => [
    index("rounds_game_state_idx").on(t.game, t.state),
    uniqueIndex("rounds_seed_nonce_uniq").on(t.seedId, t.nonce),
  ],
);

export const bets = pgTable(
  "bets",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    roundId: uuid()
      .notNull()
      .references(() => rounds.id, { onDelete: "restrict" }),
    stake: bigint({ mode: "bigint" }).notNull(),
    payout: bigint({ mode: "bigint" }),
    status: betStatus().notNull().default("open"),
    placedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
    settledAt: timestamp({ withTimezone: true, mode: "date" }),
  },
  (t) => [
    index("bets_user_placed_idx").on(t.userId, t.placedAt),
    index("bets_round_idx").on(t.roundId),
    check("bets_stake_positive", sql`${t.stake} > 0`),
  ],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    delta: bigint({ mode: "bigint" }).notNull(),
    balanceAfter: bigint({ mode: "bigint" }).notNull(),
    reason: txReason().notNull(),
    betId: uuid().references(() => bets.id, { onDelete: "restrict" }),
    idempotencyKey: text(),
    metadata: jsonb(),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("tx_user_created_idx").on(t.userId, t.createdAt),
    uniqueIndex("tx_user_idem_uniq").on(t.userId, t.idempotencyKey),
    check("tx_balance_nonneg", sql`${t.balanceAfter} >= 0`),
  ],
);
