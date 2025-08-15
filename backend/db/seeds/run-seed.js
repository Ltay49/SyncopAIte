import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// setup.sql lives one level up from /seeds
const sqlPath = path.resolve(__dirname, "../setup.sql");

async function runSeed() {
  const adminUrl =
    process.env.DATABASE_URL_ADMIN ||
    "postgres://lewistaylor@localhost:5432/postgres";

  const sql = fs.readFileSync(sqlPath, "utf8");

  // Split setup.sql into individual statements and run them one by one
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Use simple query mode so no implicit transaction is created
  const client = new Client({ connectionString: adminUrl, ssl: false, simple_query: true });

  try {
    await client.connect();
    console.log(`🌱 Running ${sqlPath} (statement-by-statement)...`);

    // Make sure no one is connected to the target DBs (or drops will fail)
    const dbs = ["syncopAIte", "syncopAIte_test"];
    for (const db of dbs) {
      await client.query(
        `SELECT pg_terminate_backend(pid)
           FROM pg_stat_activity
          WHERE datname = $1 AND pid <> pg_backend_pid();`,
        [db]
      );
    }

    for (const stmt of statements) {
      console.log("→", stmt);
      await client.query(stmt); // each runs outside a transaction
    }

    console.log("✅ Databases created successfully.");
  } catch (err) {
    console.error("❌ Error running setup.sql:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeed();

