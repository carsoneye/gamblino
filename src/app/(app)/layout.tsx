import { AppShell } from "@/components/shell/app-shell";
import { requireSessionUser } from "@/lib/auth/session";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSessionUser();
  return (
    <AppShell user={{ balance: user.balance, email: user.email, name: user.name }}>
      {children}
    </AppShell>
  );
}
