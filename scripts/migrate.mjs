import { readFileSync } from "node:fs";
import { sql } from "@vercel/postgres";

const schema = readFileSync(new URL("../sql/schema.sql", import.meta.url), "utf8");

try {
  await sql.query(schema);
  console.log("Migration complete: table `guides` is ready.");
  process.exit(0);
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
}
