import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { getServerSession } from "next-auth";

/** True only for the single owner account configured in OWNER_EMAIL. */
export function isOwnerEmail(email?: string | null): boolean {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return Boolean(owner && email && email.trim().toLowerCase() === owner);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // Anyone other than the owner is rejected at sign-in.
    async signIn({ user }) {
      return isOwnerEmail(user.email);
    },
  },
};

/** Server-side check used by pages and every mutation. */
export async function getIsOwner(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return isOwnerEmail(session?.user?.email);
}
