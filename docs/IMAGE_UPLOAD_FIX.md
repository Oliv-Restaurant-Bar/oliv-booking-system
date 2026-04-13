# Image Upload Implementation

## Summary

Fixed the image upload issue where menu item and category images were lost after page refresh.

## Problem

Previously, images were handled using `URL.createObjectURL()` which creates temporary blob URLs that:
- Only work during the current browser session
- Expire when the page is refreshed
- Never actually upload files to a server
- Only save the filename to the database, not the actual image data

## Solution

### 1. Created Image Upload API
**File**: `app/api/upload/image/route.ts`

- Accepts image files via POST request
- Validates file type (images only) and size (max 5MB)
- Saves images to `public/uploads/images/`
- Returns permanent URL path: `/uploads/images/{filename}`

### 2. Updated Admin UI
**File**: `components/admin/MenuConfigPageV3Complete.tsx`

**Added Features**:
- `handleImageUpload()` function to upload images to the server
- Loading state (`uploadingImage`) with visual feedback
- Automatic upload when image is selected
- Fallback to `URL.createObjectURL()` if upload fails
- Disabled inputs during upload
- "Uploading..." text indicator

**Changes**:
- Category image upload (both "Add" and "Change" buttons)
- Menu item image upload (both "Add" and "Change" buttons)

### 3. Directory Structure

```
public/
└── uploads/
    └── images/
        ├── .gitkeep
        └── {timestamp}-{random}-{filename}
```

## How It Works Now

1. **Admin selects an image**
   - File input triggers the upload immediately
   - Shows "Uploading..." text during upload
   - Input is disabled during upload

2. **Image is uploaded to server**
   - File is sent to `/api/upload/image`
   - Server validates and saves to `public/uploads/images/`
   - Returns permanent URL path

3. **Database stores the URL**
   - URL path is saved to `menu_categories.image_url` or `menu_items.image_url`
   - URL is persisted in the database

4. **Image displays correctly**
   - Images load from the permanent URL
   - Persist across page refreshes
   - Work for all users

## Testing

1. Go to Admin → Menu Configuration
2. Create or edit a category/item
3. Upload an image
4. Save the category/item
5. Refresh the page - image should still be there!

## Production Considerations

For production deployment, consider:

1. **Cloud Storage**: Replace local file storage with:
   - AWS S3 + CloudFront
   - Azure Blob Storage
   - Cloudinary
   - Vercel Blob Storage

2. **Image Optimization**:
   - Compress images before storing
   - Generate multiple sizes (thumbnail, medium, large)
   - Convert to modern formats (WebP, AVIF)

3. **CDN**: Serve images through a CDN for better performance

4. **Cleanup**: Implement periodic cleanup of unused images

## Files Modified/Created

### Created:
- `app/api/upload/image/route.ts` - Image upload API
- `public/uploads/images/.gitkeep` - Directory placeholder

### Modified:
- `components/admin/MenuConfigPageV3Complete.tsx` - Upload handler and UI updates

## Migration Notes

Existing images in the database that were created before this fix may have:
- Invalid URLs (blob: URLs)
- Missing image files

These will need to be re-uploaded manually by admins.
