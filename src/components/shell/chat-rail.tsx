import { MessagesSquare } from "lucide-react";

export function ChatRail() {
  return (
    <aside
      aria-label="Chat"
      className="row-span-2 hidden w-80 flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-deep)]/60 backdrop-blur lg:flex"
    >
      <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-5">
        <MessagesSquare aria-hidden className="size-4 text-[var(--color-muted)]" />
        <h2 className="text-sm font-semibold">Chat</h2>
        <span className="ml-auto rounded-[var(--radius-chip)] border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
          Soon
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div
          aria-hidden
          className="flex size-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <MessagesSquare className="size-5 text-[var(--color-muted)]" />
        </div>
        <p className="text-sm font-medium text-[var(--color-text)]">Live chat lands in Phase 12</p>
        <p className="text-xs text-[var(--color-muted)]">
          A real-time room powered by the Bun WebSocket server. Room topics per game.
        </p>
      </div>
    </aside>
  );
}
