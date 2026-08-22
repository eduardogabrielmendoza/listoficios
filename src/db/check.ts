import { sql } from "drizzle-orm";
import { closeDb, getDb } from "./index";

async function main() {
  await getDb().execute(sql`select 1 as ok`);
  await getDb().execute(sql`select count(*) as categories from categories`);
  console.info("PostgreSQL y el esquema de Listoficios respondieron correctamente");
  await closeDb();
}

main().catch(async (error) => {
  console.error("PostgreSQL no está disponible", error);
  await closeDb();
  process.exitCode = 1;
});
