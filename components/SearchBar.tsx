"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ q }: { q: string }) {
  const router = useRouter();
  const [value, setValue] = useState(q);

  useEffect(() => setValue(q), [q]);

  // Debounced: updates ?q= and resets to page 1, which re-queries the server.
  useEffect(() => {
    const next = value.trim();
    if (next === q) return;
    const t = setTimeout(() => {
      router.replace(next ? `/?q=${encodeURIComponent(next)}` : "/");
    }, 300);
    return () => clearTimeout(t);
  }, [value, q, router]);

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Filter by project or status"
      aria-label="Filter guides by project or status"
      className="w-full rounded-lg border border-paper-line bg-paper-card px-3.5 py-2.5 text-sm shadow-card placeholder:text-ink-faint sm:max-w-xs"
    />
  );
}
