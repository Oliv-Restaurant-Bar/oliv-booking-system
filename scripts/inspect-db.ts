import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    const columns = await sql`
      SELECT table_schema, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      ORDER BY table_schema, column_name;
    `;
    console.log("Columns in 'bookings' table (sorted):");
    columns.forEach(c => console.log(` - ${c.table_schema}.${c.column_name}: ${c.data_type}`));
  } catch (error) {
    console.error("Error inspecting DB:", error);
  } finally {
    await sql.end();
  }
}

main();
