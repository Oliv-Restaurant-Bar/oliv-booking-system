import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function run() {
    try {
        console.log("Adding is_combo column...");
        await db.execute(sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_combo BOOLEAN NOT NULL DEFAULT FALSE`);
        console.log("Column added successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error adding column:", error);
        process.exit(1);
    }
}

run();
