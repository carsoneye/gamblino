import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { walletLimits } from "@/db/schema";
import { requireSessionUser } from "@/lib/auth/session";
import { formatAmount } from "@/lib/wallet/currencies";
import { getActiveLimit, type LimitKind } from "@/lib/wallet/limits";
import { LimitForm } from "./limit-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Limits · gamblino" };

type KindMeta = {
  key: LimitKind;
  label: string;
  sub: string;
  unit: "credit" | "minutes";
  enforced: boolean;
  stub?: string;
};

const KINDS: KindMeta[] = [
  {
    key: "wager",
    label: "Max wager per bet",
    sub: "Rejects any single stake above this amount.",
    unit: "credit",
    enforced: true,
  },
  {
    key: "deposit",
    label: "Max per inflow",
    sub: "Today: caps daily grant claim size. Real deposits ship post-license.",
    unit: "credit",
    enforced: true,
  },
  {
    key: "loss",
    label: "Loss limit (rolling window)",
    sub: "Caps net losses over a trailing period.",
    unit: "credit",
    enforced: false,
    stub: "Row persists and audit event fires. Rolling-window enforcement ships with T5.5.",
  },
  {
    key: "session_length_min",
    label: "Session length (minutes)",
    sub: "Auto-disconnects a session that exceeds this.",
    unit: "minutes",
    enforced: false,
    stub: "Row persists and audit event fires. Session enforcement ships with T9.",
  },
];

async function readActiveAndPending(userId: string, kind: LimitKind) {
  const active = await getActiveLimit(userId, "credit", kind);
  const [pending] = await db
    .select()
    .from(walletLimits)
    .where(
      and(
        eq(walletLimits.userId, userId),
        eq(walletLimits.currencyKind, "credit"),
        eq(walletLimits.kind, kind),
        gt(walletLimits.effectiveAt, new Date()),
      ),
    )
    .orderBy(desc(walletLimits.effectiveAt))
    .limit(1);

  return { active, pending: pending ?? null };
}

function formatForKind(amount: bigint, unit: "credit" | "minutes") {
  return unit === "credit"
    ? `${formatAmount(amount, "credit")} credits`
    : `${amount.toString()} min`;
}

export default async function LimitsPage() {
  const user = await requireSessionUser();

  const rows = await Promise.all(
    KINDS.map(async (k) => ({ meta: k, ...(await readActiveAndPending(user.id, k.key)) })),
  );

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 pt-8 pb-16 lg:px-10 lg:pt-10">
      <header className="flex flex-col gap-2">
        <h1
          className="font-display font-semibold leading-[0.95] tracking-[-0.03em] text-[var(--color-text)]"
          style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
        >
          Limits.
        </h1>
        <p className="max-w-xl text-[14px] leading-relaxed text-[var(--color-muted)]">
          Raising takes effect immediately. Lowering takes effect after a 24-hour cool-off — you
          can't impulsively lock yourself down.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {rows.map(({ meta, active, pending }) => (
          <article
            key={meta.key}
            className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)]/60 bg-[var(--color-bg-deep)]/70 p-5"
          >
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-lg font-medium text-[var(--color-text)]">
                {meta.label}
              </h2>
              <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">{meta.sub}</p>
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
              <dt className="text-[var(--color-muted)]">Active</dt>
              <dd className="numeric text-[var(--color-text)]">
                {active ? formatForKind(active.amount, meta.unit) : "None set"}
              </dd>
              {pending ? (
                <>
                  <dt className="text-[var(--color-muted)]">Pending</dt>
                  <dd className="numeric text-[var(--color-text)]">
                    {formatForKind(pending.amount, meta.unit)} at{" "}
                    <time dateTime={pending.effectiveAt.toISOString()}>
                      {pending.effectiveAt.toLocaleString()}
                    </time>
                  </dd>
                </>
              ) : null}
            </dl>

            {meta.stub ? (
              <p className="rounded-[var(--radius-sm)] border border-[var(--color-border)]/40 bg-[var(--color-bg)]/40 px-3 py-2 text-[12px] leading-relaxed text-[var(--color-muted)]">
                {meta.stub}
              </p>
            ) : null}

            <LimitForm kind={meta.key} unit={meta.unit} />
          </article>
        ))}
      </div>
    </section>
  );
}
