import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings';
    `;
    console.log("Columns in 'bookings' table:");
    columns.forEach(c => console.log(` - ${c.column_name}: ${c.data_type}`));
  } catch (error) {
    console.error("Error inspecting DB:", error);
  } finally {
    await sql.end();
  }
}

main();
