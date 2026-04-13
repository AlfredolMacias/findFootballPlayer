import * as dotenv from 'dotenv';
import { defineConfig } from "prisma/config";

// Forzamos la carga del archivo .env (útil para local) 
// y verificamos el entorno de Railway
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Este log saldrá en tus Runtime Logs de Railway si falla
  console.error("CRITICAL: DATABASE_URL is missing from process.env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl || "", 
  },
});