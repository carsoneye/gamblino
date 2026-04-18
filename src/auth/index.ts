import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import { z } from "zod";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { env } from "@/env";
import { grantSignupBonus } from "@/lib/auth/signup-bonus";
import { authConfig } from "./config";

const credentialsSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1).max(128),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  secret: env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const row = await db.query.users.findFirst({
          where: eq(users.email, email),
          columns: { id: true, email: true, name: true, image: true, passwordHash: true },
        });
        if (!row?.passwordHash) return null;
        const ok = await compare(password, row.passwordHash);
        if (!ok) return null;
        return { id: row.id, email: row.email, name: row.name, image: row.image };
      },
    }),
    Nodemailer({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth:
          env.EMAIL_SERVER_USER && env.EMAIL_SERVER_PASSWORD
            ? { user: env.EMAIL_SERVER_USER, pass: env.EMAIL_SERVER_PASSWORD }
            : undefined,
      },
      from: env.EMAIL_FROM,
      normalizeIdentifier(identifier) {
        const [local, domain] = identifier.toLowerCase().trim().split("@");
        if (!domain || domain.includes(",")) throw new Error("invalid email");
        return `${local}@${domain}`;
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (user.id) await grantSignupBonus(user.id);
    },
  },
});
