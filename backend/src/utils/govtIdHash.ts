import crypto from "crypto";

/**
 * Validates that the input is exactly 12 digits.
 * @param rawId The raw government ID (e.g. Aadhaar, UAN)
 * @returns boolean
 */
export const isValid12DigitId = (rawId: string): boolean => {
  return /^\d{12}$/.test(rawId);
};

/**
 * Validates Udyam registration number format: UDYAM-<STATE>-<DISTRICT>-<7 digits>
 * State is 2 chars, District is 2 chars. e.g. UDYAM-MH-12-1234567
 */
export const isValidUdyam = (rawId: string): boolean => {
  return /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(rawId);
};

/**
 * Validates NAPS number format. User confirmed it is "12-digits" long.
 */
export const isValidNaps = (rawId: string): boolean => {
  return /^\d{12}$/.test(rawId);
};

/**
 * Generates an HMAC-SHA256 hash for the given ID using the server pepper.
 * NEVER log or persist the raw ID.
 * @param rawId 
 * @returns string (hex hash)
 */
export const hashGovtId = (rawId: string): string => {
  if (!isValid12DigitId(rawId)) {
    throw new Error("Invalid government ID format");
  }

  const pepper = process.env.GOVT_ID_HASH_PEPPER;
  if (!pepper) {
    throw new Error("Server configuration error");
  }

  return crypto
    .createHmac("sha256", pepper)
    .update(rawId)
    .digest("hex");
};

/**
 * Extracts the last four digits of the ID for safe storage and display.
 * @param rawId 
 * @returns string
 */
export const getLastFour = (rawId: string): string => {
  if (!isValid12DigitId(rawId)) {
    throw new Error("Invalid government ID format");
  }
  return rawId.slice(-4);
};
