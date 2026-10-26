"use server";

import { revalidatePath } from "next/cache";
import { getIsOwner } from "@/lib/auth";
import { insertGuide, removeGuide, updateGuide } from "@/lib/db";
import { guideInputSchema, idSchema, type GuideInput } from "@/lib/validation";
import type { ActionResult, Guide } from "@/lib/types";

const UNAUTHORIZED = { ok: false, error: "Not authorized. Sign in as the owner." } as const;
const FAILED = { ok: false, error: "Something went wrong. Please try again." } as const;

export async function createGuide(input: GuideInput): Promise<ActionResult<Guide>> {
  if (!(await getIsOwner())) return UNAUTHORIZED;
  const parsed = guideInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    const guide = await insertGuide(parsed.data);
    revalidatePath("/");
    return { ok: true, data: guide };
  } catch (e) {
    console.error("createGuide", e);
    return FAILED;
  }
}

export async function editGuide(id: string, input: GuideInput): Promise<ActionResult<Guide>> {
  if (!(await getIsOwner())) return UNAUTHORIZED;
  const idCheck = idSchema.safeParse(id);
  if (!idCheck.success) return { ok: false, error: "Invalid guide id." };
  const parsed = guideInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    const guide = await updateGuide(idCheck.data, parsed.data);
    if (!guide) return { ok: false, error: "Guide not found. It may have been deleted." };
    revalidatePath("/");
    return { ok: true, data: guide };
  } catch (e) {
    console.error("editGuide", e);
    return FAILED;
  }
}

export async function deleteGuide(id: string): Promise<ActionResult> {
  if (!(await getIsOwner())) return UNAUTHORIZED;
  const idCheck = idSchema.safeParse(id);
  if (!idCheck.success) return { ok: false, error: "Invalid guide id." };
  try {
    const removed = await removeGuide(idCheck.data);
    if (!removed) return { ok: false, error: "Guide not found. It may have been deleted." };
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (e) {
    console.error("deleteGuide", e);
    return FAILED;
  }
}
