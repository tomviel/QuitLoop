/**
 * Input sanitization helpers.
 * Strip HTML tags and control characters from user-supplied strings.
 */

/** Remove HTML tags and dangerous characters */
export function sanitizeText(input: string, maxLength = 500): string {
  return input
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/[<>&"'`]/g, '')          // strip remaining dangerous chars
    .replace(/[\x00-\x1F\x7F]/g, '')  // strip control characters
    .trim()
    .slice(0, maxLength);
}

/** Sanitize a phone number to digits, +, spaces, hyphens only */
export function sanitizePhone(input: string): string {
  return input.replace(/[^\d\s\+\-\(\)]/g, '').trim().slice(0, 20);
}

/** Ensure a string is a valid IANA timezone name (basic check) */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Validate an HH:MM time string */
export function isValidTime(t: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}
