"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGuide } from "@/app/actions";
import { PAGE_SIZE } from "@/lib/config";
import { useToast } from "@/components/Toaster";
import GuideModal from "@/components/GuideModal";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import type { Guide } from "@/lib/types";

type Props = { guides: Guide[]; isOwner: boolean; q: string; page: number; total: number; totalPages: number };

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Live" ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : status === "Upcoming" ? "bg-amber-50 text-amber-700 ring-amber-200"
    : status === "Ended" ? "bg-slate-100 text-slate-600 ring-slate-200"
    : "bg-cobalt-tint text-cobalt-dark ring-blue-200";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>{status}</span>;
}

export default function Board({ guides, isOwner, q, page, total, totalPages }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState(guides);
  const [modal, setModal] = useState<{ guide: Guide | null } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, start] = useTransition();

  useEffect(() => setRows(guides), [guides]);

  function onSaved(g: Guide, mode: "add" | "edit") {
    setModal(null);
    if (mode === "add") {
      // Optimistic: show it at the top now, then jump to page 1 with no filter.
      setRows((r) => [g, ...r].slice(0, PAGE_SIZE));
      router.push("/");
      router.refresh();
    } else {
      setRows((r) => r.map((x) => (x.id === g.id ? g : x)));
    }
  }

  function remove(g: Guide) {
    if (!window.confirm(`Delete the guide for "${g.project}"? This cannot be undone.`)) return;
    setBusyId(g.id);
    start(async () => {
      const res = await deleteGuide(g.id);
      setBusyId(null);
      if (res.ok) {
        setRows((r) => r.filter((x) => x.id !== g.id));
        toast.success("Guide deleted");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  const btn = "rounded-md px-2 py-1 text-xs font-medium disabled:opacity-50";
  const openBtn =
    "inline-flex items-center rounded-lg bg-cobalt px-3 py-1.5 text-sm font-medium text-white hover:bg-cobalt-dark";

  const ownerActions = (g: Guide) =>
    isOwner && (
      <div className="flex gap-1">
        <button onClick={() => setModal({ guide: g })} className={`${btn} text-cobalt-dark hover:bg-cobalt-tint`}>Edit</button>
        <button onClick={() => remove(g)} disabled={busyId === g.id} className={`${btn} text-red-600 hover:bg-red-50`}>
          {busyId === g.id ? "Deleting…" : "Delete"}
        </button>
      </div>
    );

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar q={q} />
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-soft">
            {total} {total === 1 ? "guide" : "guides"}
            {q && ` matching “${q}”`}
          </p>
          {isOwner && (
            <button onClick={() => setModal({ guide: null })} className="rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white hover:bg-black">
              Add new guide
            </button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-paper-line bg-paper-card px-6 py-16 text-center">
          <p className="font-medium">{q ? "No guides match that filter" : "No guides yet"}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {q ? "Try a different project name or a status like Live." : isOwner ? "Add your first guide to get the board started." : "Check back soon for new airdrop guides."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-paper-line bg-paper-card shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-paper-line bg-paper/60 text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3 text-right font-medium">Guide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-line">
                {rows.map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-3 font-medium">{g.project}</td>
                    <td className="px-4 py-3 text-ink-soft">{g.cost || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{fmt(g.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {ownerActions(g)}
                        <a href={g.link} target="_blank" rel="noopener noreferrer" className={openBtn}>Open Guide</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {rows.map((g) => (
              <li key={g.id} className="rounded-xl border border-paper-line bg-paper-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{g.project}</p>
                  <StatusBadge status={g.status} />
                </div>
                <p className="mt-1 text-sm text-ink-soft">{g.cost || "No cost listed"} · Added {fmt(g.created_at)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <a href={g.link} target="_blank" rel="noopener noreferrer" className={openBtn}>Open Guide</a>
                  {ownerActions(g)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Pagination page={page} totalPages={totalPages} q={q} />

      {modal && isOwner && <GuideModal guide={modal.guide} onClose={() => setModal(null)} onSaved={onSaved} />}
    </section>
  );
}
