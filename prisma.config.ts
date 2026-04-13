import "dotenv/config";
import { defineConfig } from "prisma/config";

// Añade un log temporal para depurar en Railway (verás esto en los Build Logs)
if (!process.env.DATABASE_URL) {
  console.warn("⚠️ Advertencia: DATABASE_URL no está definida en el entorno.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
   migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "", // Asegura que al menos sea un string vacío y no undefined
  },
});