import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

require('dotenv').config({ path: '.env' });
async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
    }
    const client = postgres(process.env.DATABASE_URL);
    const sqlContent = fs.readFileSync(path.join(process.cwd(), 'lib/db/migrations/0019_remarkable_falcon.sql'), 'utf-8');
    const statements = sqlContent.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
        console.log('Executing:', stmt.substring(0, 50));
        try {
            await client.unsafe(stmt);
            console.log('Success');
        } catch (e) {
            console.error('Failed:', e instanceof Error ? e.message : String(e));
        }
    }
    await client.end();
}
main().catch(console.error);
