'use server';

import { db } from "@/lib/db";
import { systemSettings, venues } from "@/lib/db/schema";
import { sql, eq, asc } from "drizzle-orm";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";
import { z } from "zod";

export async function getSystemSettings() {
  try {
    // This is public as it's used in the root layout for SystemSettingsProvider
    // but results are limited to non-sensitive configuration data
    const settings = await db.query.systemSettings.findFirst();

    if (!settings) {
      return {
        id: 'default',
        language: 'English',
        timeZone: 'Europe/Zurich',
        dateFormat: 'DD/MM/YYYY',
        currency: 'CHF',
        showCurrencySymbol: true,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
        ...settings,
        updatedAt: settings.updatedAt?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in getSystemSettings:", error);
    return null;
  }
}

export async function getFullVenuesAction() {
  try {
    // REQUIRE VIEW_SETTINGS permission (as venues management is inside settings)
    await requirePermissionWrapper(Permission.VIEW_SETTINGS);

    const allVenues = await db.query.venues.findMany({
      orderBy: [asc(venues.sortOrder), asc(venues.name)],
    });

    return allVenues.map(v => ({
        ...v,
        createdAt: v.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: v.updatedAt?.toISOString() || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error in getFullVenuesAction:", error);
    return [];
  }
}
