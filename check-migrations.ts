import { db } from "./lib/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "crypto";

async function main() {
    try {
        const journalPath = path.join(__dirname, "lib", "db", "migrations", "meta", "_journal.json");
        if (!fs.existsSync(journalPath)) {
            console.log("No journal found");
            return;
        }
        const journalRaw = fs.readFileSync(journalPath, "utf-8");
        const journal = JSON.parse(journalRaw);

        await db.execute(sql`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)`);
        await db.execute(sql`DELETE FROM drizzle.__drizzle_migrations`);

        for (const entry of journal.entries) {
            if (entry.tag === "0009_friendly_phil_sheldon") continue;

            const filePath = path.join(__dirname, "lib", "db", "migrations", `${entry.tag}.sql`);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, "utf-8");
                // Drizzle hash is typically crypto hash of content or snapshot
                // We'll just insert something. Sometimes Drizzle just checks existence of the 'tag' ? No, it checks hashes.
                // Let's use the hash of the migration body or snapshot.
                const hash = crypto.createHash("sha256").update(content).digest("hex");
                await db.execute(sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${hash}, extract(epoch from now()) * 1000)`);
            }
        }
        console.log("Done inserting up to 0008");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

main();
