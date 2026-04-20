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

export function ProvablyFairBadge({ serverSeedHash, revealed = null }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">
        <ShieldCheck className="size-3.5 text-[var(--color-accent)]" aria-hidden />
        Provably fair
      </Dialog.Trigger>

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
