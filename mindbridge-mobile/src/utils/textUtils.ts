/**
 * textUtils.ts
 * Utility functions for formatting database slugs, enum keys, and snake_case strings
 * into clean, user-friendly human readable text across the application.
 */

/**
 * Converts a snake_case, kebab-case, or enum string into clean Title Case words.
 * Examples:
 *   "PEER_SUPPORT"      => "Peer Support"
 *   "peer_support"      => "Peer Support"
 *   "academic_pressure" => "Academic Pressure"
 *   "stress"            => "Stress"
 *   "COPING_STRATEGY"   => "Coping Strategy"
 */
export const formatText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .replace(/[_-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Converts a snake_case, kebab-case, or enum string into clean uppercase words separated by spaces.
 * Examples:
 *   "PEER_SUPPORT"      => "PEER SUPPORT"
 *   "peer_support"      => "PEER SUPPORT"
 *   "academic_pressure" => "ACADEMIC PRESSURE"
 */
export const formatUpperText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .replace(/[_-]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
};
