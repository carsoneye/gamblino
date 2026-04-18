import { MessagesSquare, Send } from "lucide-react";
import { LiveDot } from "@/components/shell/live-dot";
import { FLOOR_HEADCOUNT, seededMessages } from "@/lib/floor-activity";

export function ChatRail() {
  return (
    <aside
      aria-label="Chat"
      className="row-span-2 hidden w-80 flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-deep)]/70 backdrop-blur lg:flex"
    >
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-5">
        <MessagesSquare aria-hidden className="size-4 text-[var(--color-muted)]" />
        <h2 className="font-display text-sm font-semibold tracking-tight">The Lounge</h2>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
          <LiveDot tone="teal" size="xs" />
          <span className="numeric">{FLOOR_HEADCOUNT}</span>
          <span>here</span>
        </span>
      </div>

      <div
        aria-hidden
        className="h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent"
      />

      <ol className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {seededMessages.map((m) => (
          <li key={m.id} className="flex gap-3 text-sm">
            <div className="flex flex-col items-center pt-1">
              <LiveDot tone={m.tint} size="xs" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium text-[var(--color-text)]">{m.handle}</span>
                <span className="numeric shrink-0 text-[10px] text-[var(--color-muted)]">
                  {m.ago}
                </span>
              </div>
              <p className="text-[13px] leading-snug text-[var(--color-muted)]">{m.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="border-t border-[var(--color-border)] px-4 py-3">
        <div
          aria-disabled
          className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 py-2 text-xs text-[var(--color-muted)]"
        >
          <Send aria-hidden className="size-3.5" />
          <span className="flex-1 truncate">The room opens when WS lands.</span>
          <span className="rounded-[var(--radius-chip)] border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em]">
            Soon
          </span>
        </div>
      </div>
    </aside>
  );
}
