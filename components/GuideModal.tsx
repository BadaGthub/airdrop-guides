"use client";

import { useState, useTransition } from "react";
import { createGuide, editGuide } from "@/app/actions";
import { STATUS_OPTIONS } from "@/lib/config";
import { useToast } from "@/components/Toaster";
import type { Guide } from "@/lib/types";

type Props = {
  guide: Guide | null; // null = add mode
  onClose: () => void;
  onSaved: (g: Guide, mode: "add" | "edit") => void;
};

export default function GuideModal({ guide, onClose, onSaved }: Props) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [form, setForm] = useState({
    project: guide?.project ?? "",
    cost: guide?.cost ?? "",
    link: guide?.link ?? "",
    status: guide?.status ?? "Live",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = guide ? await editGuide(guide.id, form) : await createGuide(form);
      if (res.ok) {
        toast.success(guide ? "Guide saved" : "Guide added");
        onSaved(res.data, guide ? "edit" : "add");
      } else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  const field = "mt-1 w-full rounded-lg border border-paper-line bg-white px-3 py-2 text-sm";
  const err = (k: string) => errors[k]?.[0] && <p className="mt-1 text-xs text-red-600">{errors[k]![0]}</p>;
  const statuses = STATUS_OPTIONS.includes(form.status as never) ? STATUS_OPTIONS : [...STATUS_OPTIONS, form.status];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-4 sm:items-center" onMouseDown={onClose}>
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={guide ? "Edit guide" : "Add guide"}
        className="w-full max-w-md space-y-4 rounded-xl bg-paper-card p-5 shadow-xl"
      >
        <h2 className="text-lg font-semibold">{guide ? "Edit guide" : "Add guide"}</h2>
        <label className="block text-sm font-medium">
          Project
          <input autoFocus value={form.project} onChange={set("project")} placeholder="LayerZero" className={field} />
          {err("project")}
        </label>
        <label className="block text-sm font-medium">
          Cost
          <input value={form.cost} onChange={set("cost")} placeholder="Free, ~$5 gas" className={field} />
          {err("cost")}
        </label>
        <label className="block text-sm font-medium">
          Link to X post
          <input value={form.link} onChange={set("link")} placeholder="x.com/you/status/123" className={field} />
          {err("link")}
        </label>
        <label className="block text-sm font-medium">
          Status
          <select value={form.status} onChange={set("status")} className={field}>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {err("status")}
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink">
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-cobalt px-4 py-2 text-sm font-medium text-white hover:bg-cobalt-dark disabled:opacity-60"
          >
            {pending ? "Saving…" : guide ? "Save changes" : "Add guide"}
          </button>
        </div>
      </form>
    </div>
  );
}
