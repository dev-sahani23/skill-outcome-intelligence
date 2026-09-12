import test from "node:test";
import assert from "node:assert";
import { hashGovtId, getLastFour, isValid12DigitId } from "./govtIdHash";

test("isValid12DigitId", (t) => {
  assert.strictEqual(isValid12DigitId("123456789012"), true);
  assert.strictEqual(isValid12DigitId("12345678901"), false);
  assert.strictEqual(isValid12DigitId("1234567890123"), false);
  assert.strictEqual(isValid12DigitId("abcdefghijkl"), false);
});

test("getLastFour", (t) => {
  assert.strictEqual(getLastFour("123456789012"), "9012");
  assert.throws(() => getLastFour("invalid"), /Invalid government ID format/);
});

test("hashGovtId - Valid Aadhaar", (t) => {
  process.env.GOVT_ID_HASH_PEPPER = "test_pepper";
  
  const aadhaar = "123456789012";
  const hash1 = hashGovtId(aadhaar);
  const hash2 = hashGovtId(aadhaar);
  
  assert.strictEqual(typeof hash1, "string");
  assert.strictEqual(hash1.length, 64); // SHA-256 hex is 64 chars
  
  // D. Hash consistency
  assert.strictEqual(hash1, hash2);
  
  // F. Different Aadhaar values produce different hashes
  const diffHash = hashGovtId("987654321098");
  assert.notStrictEqual(hash1, diffHash);
});

test("hashGovtId - Invalid Aadhaar", (t) => {
  process.env.GOVT_ID_HASH_PEPPER = "test_pepper";
  
  // B. Invalid Aadhaar - request fails safely
  try {
    hashGovtId("123");
    assert.fail("Should have thrown");
  } catch (err: any) {
    // Aadhaar does not appear in the error response
    assert.ok(!err.message.includes("123"));
    assert.strictEqual(err.message, "Invalid government ID format");
  }
});

test("hashGovtId - Pepper Protection", (t) => {
  // E. Pepper protection
  process.env.GOVT_ID_HASH_PEPPER = "";
  assert.throws(() => hashGovtId("123456789012"), /Server configuration error/);
});
