import { z } from "zod";

const linkSchema = z
  .string({ required_error: "Link is required" })
  .trim()
  .min(1, "Link is required")
  .max(2048, "Link is too long")
  .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
  .refine((v) => {
    try {
      const u = new URL(v);
      return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
    } catch {
      return false;
    }
  }, "Enter a valid http(s) URL");

export const guideInputSchema = z.object({
  project: z.string({ required_error: "Project is required" }).trim().min(1, "Project is required").max(120, "Max 120 characters"),
  cost: z.string().trim().max(60, "Max 60 characters").default(""),
  link: linkSchema,
  status: z
    .string()
    .trim()
    .max(30, "Max 30 characters")
    .transform((v) => (v === "" ? "Live" : v))
    .default("Live"),
});

export const idSchema = z.string().uuid("Invalid id");

export type GuideInput = z.input<typeof guideInputSchema>;
