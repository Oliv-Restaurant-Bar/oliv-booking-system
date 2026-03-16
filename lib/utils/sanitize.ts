/**
 * HTML Sanitization Utility
 *
 * Provides safe HTML sanitization using DOMPurify to prevent XSS attacks
 * when rendering user-provided content in emails or HTML templates.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize text to remove all HTML tags
 * Use this when you want plain text only (no formatting)
 *
 * @param text - User-provided text that may contain HTML
 * @returns Sanitized plain text with all HTML removed
 */
export function sanitizeText(text: string | undefined | null): string {
  if (!text) return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
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

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
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
  return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
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
 *
 * @param specialRequests - User's special requests
 * @param allergyDetails - User's allergy details
 * @returns Object with sanitized values
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
