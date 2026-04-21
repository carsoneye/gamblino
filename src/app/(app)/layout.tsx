import { AppShell } from "@/components/shell/app-shell";
import { ensureMagicLinkSignupRecorded } from "@/lib/auth/magic-link-first-load";
import { requireSessionUser } from "@/lib/auth/session";
import { getRequestContext } from "@/lib/http/request-context";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSessionUser();
  const { ip, userAgent } = await getRequestContext();
  await ensureMagicLinkSignupRecorded(user.id, { ip, userAgent });
  return (
    <AppShell user={{ balance: user.balance, email: user.email, name: user.name }}>
      {children}
    </AppShell>
  );
}
