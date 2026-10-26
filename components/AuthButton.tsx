"use client";

import { signIn, signOut } from "next-auth/react";

export default function AuthButton({ isOwner }: { isOwner: boolean }) {
  return isOwner ? (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="shrink-0 rounded-lg border border-paper-line bg-paper-card px-3 py-1.5 text-sm font-medium text-ink-soft shadow-card hover:text-ink"
    >
      Log out
    </button>
  ) : (
    <button
      onClick={() => signIn("github", { callbackUrl: "/" })}
      className="shrink-0 rounded-lg border border-paper-line bg-paper-card px-3 py-1.5 text-sm font-medium text-ink-soft shadow-card hover:text-ink"
    >
      Owner login
    </button>
  );
}
