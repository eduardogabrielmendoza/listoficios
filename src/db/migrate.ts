import { migrate } from "drizzle-orm/postgres-js/migrator";
import { closeDb, getDb } from "./index";

async function main() {
  await migrate(getDb(), { migrationsFolder: "./drizzle" });
  console.info("Migraciones aplicadas correctamente");
  await closeDb();
}

main().catch(async (error) => {
  console.error("No se pudieron aplicar las migraciones", error);
  await closeDb();
  process.exitCode = 1;
});
