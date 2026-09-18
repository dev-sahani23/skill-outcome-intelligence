/**
 * Normalizes an employer name deterministically for deduplication.
 * - Trims whitespace
 * - Lowercases all characters
 * - Normalizes Unicode (NFC)
 * - Collapses consecutive spaces
 * NOTE: Punctuation is intentionally NOT stripped to prevent falsely merging "A.B. Corp" and "AB Corp".
 */
export const normalizeEmployerName = (name: string): string => {
  if (!name) return name;
  return name
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ');
};
