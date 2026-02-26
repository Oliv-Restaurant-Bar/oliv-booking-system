import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is missing');
    }
    const client = postgres(process.env.DATABASE_URL);

    const sqlContent = fs.readFileSync(
        path.join(process.cwd(), 'lib/db/migrations/0006_pretty_deathstrike.sql'),
        'utf-8'
    );

    const statements = sqlContent.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);

    for (const stmt of statements) {
        console.log(`Executing: ${stmt.substring(0, 50)}...`);
        try {
            await client.unsafe(stmt);
            console.log('Success');
        } catch (e: any) {
            console.error(`Failed: ${e.message}`);
        }
    }

    await client.end();
}

main().catch(console.error);
