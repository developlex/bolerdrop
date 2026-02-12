import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluatePasswordStrength,
  hasMinimumPasswordLength,
  normalizePassword,
  passwordsMatch
} from "@/src/lib/forms/password";

test("normalizePassword trims leading and trailing spaces", () => {
  assert.equal(normalizePassword("  Secret123!  "), "Secret123!");
});

test("hasMinimumPasswordLength ignores leading and trailing spaces", () => {
  assert.equal(hasMinimumPasswordLength("   1234567 "), false);
  assert.equal(hasMinimumPasswordLength("   12345678 "), true);
});

test("passwordsMatch compares normalized values", () => {
  assert.equal(passwordsMatch("  StrongPass1! ", "StrongPass1!"), true);
  assert.equal(passwordsMatch("StrongPass1!", "StrongPass2!"), false);
});

test("evaluatePasswordStrength classifies weak and strong passwords", () => {
  assert.equal(evaluatePasswordStrength("short").label, "Very weak");
  assert.equal(evaluatePasswordStrength("Longerpass1!").label, "Strong");
});
