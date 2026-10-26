export type Guide = {
  id: string;
  project: string;
  cost: string;
  link: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
