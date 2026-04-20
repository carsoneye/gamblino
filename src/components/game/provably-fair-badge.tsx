"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ShieldCheck, X } from "lucide-react";

export type RevealedSeeds = {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
};

type Props = {
  serverSeedHash: string;
  revealed?: RevealedSeeds | null;
};

function truncate(hash: string): string {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

export function ProvablyFairBadge({ serverSeedHash, revealed = null }: Props) {
  const status = revealed ? "Revealed" : "Committed";

  return (
    <Dialog.Root>
      <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.22em] text-[var(--color-muted)] uppercase">
            <ShieldCheck className="size-3.5" aria-hidden />
            Provably fair
          </span>
          <span
            className="text-[10px] font-medium tracking-[0.18em] uppercase"
            style={{
              color: revealed ? "var(--color-live)" : "var(--color-muted)",
            }}
          >
            {status}
          </span>
        </div>
        <div className="numeric truncate text-[11px] text-[var(--color-text)]">
          {truncate(serverSeedHash)}
        </div>
        <Dialog.Trigger className="text-[12px] text-[var(--color-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-accent-hi)]">
          {revealed ? "Verify round →" : "How it works →"}
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-[var(--color-bg-deep)]/85 backdrop-blur-md" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className="font-display text-xl tracking-[-0.02em]">
                Provably fair
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[13px] text-[var(--color-muted)]">
                Every round is derived from three inputs. The server commits to its seed before the
                round opens and reveals it after settlement.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <Row label="Server seed hash" value={serverSeedHash} />
          {revealed ? (
            <>
              <Row label="Server seed" value={revealed.serverSeed} />
              <Row label="Client seed" value={revealed.clientSeed} />
              <Row label="Nonce" value={String(revealed.nonce)} />
            </>
          ) : (
            <p className="text-[12px] text-[var(--color-muted)]">
              Server seed and nonce will appear here once the round settles.
            </p>
          )}

          <p className="pt-2 text-[12px] leading-[1.55] text-[var(--color-muted)]">
            Outcome bytes are derived as{" "}
            <code className="numeric text-[11px] text-[var(--color-text)]">
              HMAC-SHA256(serverSeed, "clientSeed:nonce:cursor")
            </code>
            . Re-hash the revealed server seed with SHA-256 and confirm it matches the committed
            hash above.
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-medium tracking-[0.22em] text-[var(--color-muted)] uppercase">
        {label}
      </div>
      <div className="numeric overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-[12px] text-[var(--color-text)]">
        {value}
      </div>
    </div>
  );
}
