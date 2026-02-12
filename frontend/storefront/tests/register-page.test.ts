import test from "node:test";
import assert from "node:assert/strict";
import { resolveRegistrationErrorMessage } from "@/app/register/page";
import { PASSWORD_MIN_LENGTH_MESSAGE } from "@/src/lib/forms/password";

test("resolveRegistrationErrorMessage maps known errors", () => {
  assert.equal(
    resolveRegistrationErrorMessage({ error: "missing-fields" }),
    "All fields are required.",
  );
  assert.equal(
    resolveRegistrationErrorMessage({ error: "email-exists" }),
    "An account with this email already exists.",
  );
  assert.equal(
    resolveRegistrationErrorMessage({ error: "weak-password" }),
    PASSWORD_MIN_LENGTH_MESSAGE,
  );
});

test("resolveRegistrationErrorMessage handles arrays and unknown values", () => {
  assert.equal(
    resolveRegistrationErrorMessage({ error: ["register-failed", "ignored"] }),
    "Account creation failed. Please review your input and try again.",
  );
  assert.equal(
    resolveRegistrationErrorMessage({ error: "something-else" }),
    "Account creation failed. Please try again.",
  );
});

test("resolveRegistrationErrorMessage returns null when missing", () => {
  assert.equal(resolveRegistrationErrorMessage({}), null);
  assert.equal(resolveRegistrationErrorMessage(undefined), null);
});
