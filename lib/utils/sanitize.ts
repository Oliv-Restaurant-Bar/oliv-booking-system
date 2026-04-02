/**
 * HTML Sanitization Utility (Zero-Dependency)
 *
 * Provides safe HTML sanitization to prevent XSS attacks
 * while resolving module load errors (jsdom/ESM) on Vercel.
 */

/**
 * Sanitize text to remove all HTML tags
 * Use this when you want plain text only (no formatting)
 *
 * @param text - User-provided text that may contain HTML
 * @returns Sanitized plain text with all HTML removed
 */
export function sanitizeText(text: string | undefined | null): string {
  if (!text) return '';
  // Remove all HTML tags and replace with empty string
  // Handles both standard tags and simple encoded tags
  return text.replace(/<[^>]*>?/gm, '').replace(/&lt;[^&gt;]*&gt;/gm, '');
}

/**
 * Sanitize text but allow basic formatting
 * Allows: <p>, <br>, <strong>, <em>, <u>, <a>
 *
 * @param text - User-provided text that may contain HTML
 * @returns Sanitized text with safe HTML tags preserved
 */
export function sanitizeWithFormatting(text: string | undefined | null): string {
  if (!text) return '';
  
  // 1. Remove dangerous blocks: script, style, iframe, object, embed
  let cleaned = text.replace(/<(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi, '');
  
  // 2. Only allow specific tags: p, br, strong, em, u, a
  // Strip all other tags but preserve content between them
  cleaned = cleaned.replace(/<(?!(\/?(p|br|strong|em|u|a))\b)[^>]*>/gi, '');
  
  // 3. Strip ALL attributes except 'href' for <a> tags
  // This prevents XSS via attributes like onmouseover, style, etc.
  cleaned = cleaned.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
    return hrefMatch ? `<a href="${hrefMatch[1]}">` : '<a>';
  });
  
  // 4. Strip attributes from all other allowed tags (p, strong, em, etc.)
  cleaned = cleaned.replace(/<(p|br|strong|em|u)\b[^>]*>/gi, '<$1>');

  return cleaned;
}

/**
 * Sanitize email content
 * Strips all HTML from email template variables to prevent injection
 *
 * @param content - User-provided content for emails
 * @returns Plain text safe for email templates
 */
export function sanitizeEmailContent(content: string | undefined | null): string {
  if (!content) return 'Keine';
  return sanitizeText(content);
}

/**
 * Sanitize array of strings
 *
 * @param items - Array of user-provided strings
 * @returns Array of sanitized strings joined by comma
 */
export function sanitizeArray(items: string[] | undefined | null): string {
  if (!items || !Array.isArray(items)) return 'Keine';
  const sanitized = items.map(item => sanitizeText(item));
  return sanitized.join(', ') || 'Keine';
}

/**
 * Sanitize special requests and allergy details for booking emails
 * These fields commonly contain user input and should always be sanitized
 */
export function sanitizeBookingDetails({
  specialRequests,
  allergyDetails,
}: {
  specialRequests?: string | null;
  allergyDetails?: string[] | string | null;
}): {
  specialRequests: string;
  allergyDetails: string;
} {
  return {
    specialRequests: sanitizeEmailContent(specialRequests),
    allergyDetails: Array.isArray(allergyDetails)
      ? sanitizeArray(allergyDetails)
      : sanitizeEmailContent(allergyDetails),
  };
}
