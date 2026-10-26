import Link from "next/link";

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, totalPages, q }: { page: number; totalPages: number; q: string }) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  const base = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium";
  const idle = "border border-paper-line bg-paper-card text-ink-soft shadow-card hover:text-ink";
  const off = "pointer-events-none border border-paper-line bg-paper text-ink-faint";

  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-ink-soft">
        Page {page} of {totalPages}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          <Link href={href(page - 1)} aria-disabled={page === 1} className={`${base} ${page === 1 ? off : idle}`}>
            Previous
          </Link>
        </li>
        {pageList(page, totalPages).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} className="px-1 text-ink-faint" aria-hidden>…</li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                className={`${base} ${p === page ? "bg-cobalt text-white" : idle}`}
              >
                {p}
              </Link>
            </li>
          )
        )}
        <li>
          <Link href={href(page + 1)} aria-disabled={page === totalPages} className={`${base} ${page === totalPages ? off : idle}`}>
            Next
          </Link>
        </li>
      </ul>
    </nav>
  );
}
