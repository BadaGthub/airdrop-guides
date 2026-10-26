import { sql } from "@vercel/postgres";
import { PAGE_SIZE } from "@/lib/config";
import type { Guide } from "@/lib/types";

type Row = Omit<Guide, "created_at" | "updated_at"> & { created_at: Date | string; updated_at: Date | string };

const toGuide = (r: Row): Guide => ({
  ...r,
  created_at: new Date(r.created_at).toISOString(),
  updated_at: new Date(r.updated_at).toISOString(),
});

/** Escape LIKE wildcards so user input is matched literally. */
const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, "\\$&")}%`;

export async function listGuides(q: string, page: number) {
  const pattern = likePattern(q);
  const offset = (page - 1) * PAGE_SIZE;

  const [countRes, rowsRes] = await Promise.all([
    sql<{ n: number }>`
      SELECT COUNT(*)::int AS n FROM guides
      WHERE project ILIKE ${pattern} OR status ILIKE ${pattern}`,
    sql<Row>`
      SELECT id, project, cost, link, status, created_at, updated_at FROM guides
      WHERE project ILIKE ${pattern} OR status ILIKE ${pattern}
      ORDER BY created_at DESC, id DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
  ]);

  const total = countRes.rows[0]?.n ?? 0;
  return {
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    guides: rowsRes.rows.map(toGuide),
  };
}

export async function insertGuide(g: { project: string; cost: string; link: string; status: string }) {
  const { rows } = await sql<Row>`
    INSERT INTO guides (project, cost, link, status)
    VALUES (${g.project}, ${g.cost}, ${g.link}, ${g.status})
    RETURNING id, project, cost, link, status, created_at, updated_at`;
  return toGuide(rows[0]);
}

export async function updateGuide(id: string, g: { project: string; cost: string; link: string; status: string }) {
  const { rows } = await sql<Row>`
    UPDATE guides SET project = ${g.project}, cost = ${g.cost}, link = ${g.link}, status = ${g.status}
    WHERE id = ${id}
    RETURNING id, project, cost, link, status, created_at, updated_at`;
  return rows[0] ? toGuide(rows[0]) : null;
}

export async function removeGuide(id: string) {
  const { rowCount } = await sql`DELETE FROM guides WHERE id = ${id}`;
  return (rowCount ?? 0) > 0;
}
