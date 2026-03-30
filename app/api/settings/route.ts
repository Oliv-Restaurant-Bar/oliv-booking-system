import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { systemSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";
import { randomUUID } from 'crypto';

// GET /api/settings - Fetch system settings
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the single settings record (should only be one)
    const settings = await db.query.systemSettings.findFirst();

    // If no settings exist, return default settings
    if (!settings) {
      return NextResponse.json({
        id: 'default',
        language: 'English',
        timeZone: 'Europe/Zurich',
        dateFormat: 'DD/MM/YYYY',
        currency: 'CHF',
        showCurrencySymbol: true,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update system settings
const updateSettingsSchema = z.object({
  language: z.string().optional(),
  timeZone: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
  showCurrencySymbol: z.boolean().optional(),
  updatedBy: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // REQUIRE ADMIN PERMISSION
    await requirePermissionWrapper(Permission.UPDATE_SETTINGS);

    const body = await request.json();
    const updates = updateSettingsSchema.parse(body);

    // Check if settings exist
    const existingSettings = await db.query.systemSettings.findFirst();

    if (existingSettings) {
      // Update existing settings
      const [updated] = await db
        .update(systemSettings)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, existingSettings.id))
        .returning();

      return NextResponse.json(updated);
    } else {
      // Create new settings (first time)
      const [created] = await db
        .insert(systemSettings)
        .values({
          id: randomUUID(),
          language: updates.language || 'English',
          timeZone: updates.timeZone || 'Europe/Zurich',
          dateFormat: updates.dateFormat || 'DD/MM/YYYY',
          currency: updates.currency || 'CHF',
          showCurrencySymbol: updates.showCurrencySymbol ?? true,
          updatedBy: updates.updatedBy || 'system',
        })
        .returning();

      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error('Error updating settings:', error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
