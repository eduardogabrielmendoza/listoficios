import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "@/db/schema";

type Database = ReturnType<typeof createDatabase>;

const globalDatabase = globalThis as typeof globalThis & {
  listoficiosDb?: Database;
  listoficiosSql?: ReturnType<typeof postgres>;
};

function createDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  const client = postgres(url, { max: process.env.NODE_ENV === "production" ? 10 : 3, prepare: false });
  globalDatabase.listoficiosSql = client;
  return drizzle(client, { schema });
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!globalDatabase.listoficiosDb) globalDatabase.listoficiosDb = createDatabase();
  return globalDatabase.listoficiosDb;
}

export async function closeDb() {
  await globalDatabase.listoficiosSql?.end();
  globalDatabase.listoficiosDb = undefined;
  globalDatabase.listoficiosSql = undefined;
}

export type AppDatabase = ReturnType<typeof getDb>;
