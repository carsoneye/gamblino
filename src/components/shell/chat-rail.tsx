import { MessagesSquare } from "lucide-react";

export function ChatRail() {
  return (
    <aside
      aria-label="Chat"
      className="row-span-2 hidden w-80 flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-deep)] xl:flex"
    >
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-5">
        <MessagesSquare aria-hidden className="size-4 text-[var(--color-muted)]" />
        <h2 className="font-display text-base font-semibold tracking-[-0.01em]">Chat</h2>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-medium text-[var(--color-text)]">The room is dark.</p>
        <p className="text-xs leading-relaxed text-[var(--color-muted)]">
          Live chat stays off until we bring operators on.
        </p>
      </div>
    </aside>
  );
}
