import { ChatRail } from "@/components/shell/chat-rail";
import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/top-bar";

export function AppShell({
  balance,
  email,
  name,
  children,
}: {
  balance: bigint;
  email: string;
  name: string | null;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid min-h-dvh w-full"
      style={{ gridTemplateColumns: "auto 1fr auto", gridTemplateRows: "auto 1fr" }}
    >
      <Sidebar />
      <TopBar balance={balance} email={email} name={name} />
      <ChatRail />
      <main
        id="main"
        className="col-start-2 row-start-2 flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        {children}
      </main>
    </div>
  );
}
