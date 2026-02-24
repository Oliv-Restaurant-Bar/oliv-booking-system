
import { db } from "./lib/db";
import { adminUser } from "./lib/db/schema";
import * as dotenv from "dotenv";

dotenv.config();

async function checkUsers() {
    const users = await db.select().from(adminUser);
    console.log("Users in database:");
    users.forEach(user => {
        console.log(`- ${user.name} (${user.email}): Role = ${user.role}`);
    });
    process.exit(0);
}

checkUsers().catch(err => {
    console.error(err);
    process.exit(1);
});
