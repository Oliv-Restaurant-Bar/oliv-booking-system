import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'drizzle';
    `;
    console.log("Tables in 'drizzle' schema:");
    tables.forEach(t => console.log(` - ${t.table_name}`));

    if (tables.some(t => t.table_name === '__drizzle_migrations')) {
      const rows = await sql`SELECT * FROM "drizzle"."__drizzle_migrations"`;
      console.log(`Found ${rows.length} rows in __drizzle_migrations`);
      rows.forEach(r => console.log(r));
    }
  } catch (error) {
    console.error("Error inspecting 'drizzle' schema:", error);
  } finally {
    await sql.end();
  }
}

main();
