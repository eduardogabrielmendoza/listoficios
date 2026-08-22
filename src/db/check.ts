import { sql } from "drizzle-orm";
import { closeDb, getDb } from "./index";

async function main() {
  await getDb().execute(sql`select 1 as ok`);
  console.info("PostgreSQL respondió correctamente");
  await closeDb();
}

main().catch(async (error) => {
  console.error("PostgreSQL no está disponible", error);
  await closeDb();
  process.exitCode = 1;
});
