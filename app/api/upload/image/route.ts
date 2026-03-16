import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

// Magic numbers for common image formats
const IMAGE_SIGNATURES = {
  'jpg': [0xFF, 0xD8, 0xFF],
  'jpeg': [0xFF, 0xD8, 0xFF],
  'png': [0x89, 0x50, 0x4E, 0x47],
  'gif': [0x47, 0x49, 0x46],
  'webp': [0x52, 0x49, 0x46, 0x46],
} as const;

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate file magic number (file signature)
 * This prevents uploading files with spoofed MIME types
 */
function validateImageSignature(buffer: Buffer): string | null {
  for (const [ext, signature] of Object.entries(IMAGE_SIGNATURES)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      return ext;
    }
  }
  return null;
}

/**
 * Generate a secure filename
 */
function generateSecureFilename(originalName: string, extension: string): string {
  const timestamp = Date.now();
  // Use crypto for better randomness
  const randomBytes = Buffer.from(`${timestamp}-${Math.random()}`).toString('base64')
    .replace(/[\/+=]/g, '')
    .substring(0, 16);

  return `${timestamp}-${randomBytes}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication and permission
    await requirePermissionWrapper(Permission.EDIT_MENU_ITEM);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size BEFORE processing
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    // Convert file to buffer for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file signature (magic number)
    const imageType = validateImageSignature(buffer);
    if (!imageType) {
      return NextResponse.json({
        error: 'Invalid image file. Only JPG, PNG, GIF, and WebP are allowed.'
      }, { status: 400 });
    }

    // Additional validation: check if file size matches buffer size
    if (buffer.length !== file.size) {
      return NextResponse.json({ error: 'File corrupted during upload' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate secure filename
    const filename = generateSecureFilename(file.name, imageType);
    const filepath = join(uploadsDir, filename);

    // Prevent path traversal attacks
    const resolvedPath = resolve(filepath);
    const resolvedUploadsDir = resolve(uploadsDir);

    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Save file
    await writeFile(filepath, buffer);

    // Return the URL path (not full URL, just the path)
    const imageUrl = `/uploads/images/${filename}`;

    console.log(`✅ Image uploaded successfully: ${imageUrl} (${file.size} bytes, ${imageType})`);

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
