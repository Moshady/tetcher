import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  if (typeof window === "undefined") {
    // Server-side
    const dbUrl = process.env.DATABASE_URL;
    const isPostgres = dbUrl?.startsWith("postgres") || dbUrl?.startsWith("postgresql");

    if (isPostgres) {
      const { PrismaPg } = require("@prisma/adapter-pg");
      const { Pool } = require("pg");
      const pool = new Pool({ connectionString: dbUrl });
      const adapter = new PrismaPg(pool);
      prismaInstance = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    } else {
      const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
      const path = require("path");
      const dbPath = path.join(process.cwd(), "prisma/dev.db");
      const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
      prismaInstance = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    }
  } else {
    // Client-side fallback
    prismaInstance = new PrismaClient();
  }
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
