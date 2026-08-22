process.env.HOSTNAME = "0.0.0.0";
process.env.PORT ||= "3000";

console.log(`[listoficios] Iniciando en http://${process.env.HOSTNAME}:${process.env.PORT}`);

await import("../.next/standalone/server.js");
