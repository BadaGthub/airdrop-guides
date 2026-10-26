import { redirect } from "next/navigation";
import { getIsOwner } from "@/lib/auth";
import { listGuides } from "@/lib/db";
import Board from "@/components/Board";
import AuthButton from "@/components/AuthButton";

export const dynamic = "force-dynamic";

type Props = { searchParams: { q?: string; page?: string } };

export default async function Home({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim().slice(0, 100);
  const requested = Number.parseInt(searchParams.page ?? "1", 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;

  const [isOwner, data] = await Promise.all([getIsOwner(), listGuides(q, page)]);

  if (page > data.totalPages) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (data.totalPages > 1) params.set("page", String(data.totalPages));
    const qs = params.toString();
    redirect(qs ? `/?${qs}` : "/");
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Airdrop Guides</h1>
          <p className="mt-2 max-w-md text-ink-soft">
            Every guide I post on X, with what it costs and whether it is still live. Newest first.
          </p>
        </div>
        <AuthButton isOwner={isOwner} />
      </header>
      <Board
        guides={data.guides}
        isOwner={isOwner}
        q={q}
        page={page}
        total={data.total}
        totalPages={data.totalPages}
      />
    </main>
  );
}
