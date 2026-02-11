import test from "node:test";
import assert from "node:assert/strict";
import { resolveLoginErrorMessage } from "@/app/login/page";

test("resolveLoginErrorMessage maps known errors", () => {
  assert.equal(
    resolveLoginErrorMessage({ error: "missing-credentials" }),
    "Email and password are required.",
  );
  assert.equal(
    resolveLoginErrorMessage({ error: "invalid-credentials" }),
    "Sign-in failed. Check your credentials and try again.",
  );
  assert.equal(
    resolveLoginErrorMessage({ error: "auth-unavailable" }),
    "Sign-in service is currently unavailable. Try again in a moment.",
  );
});

test("resolveLoginErrorMessage handles arrays and unknown codes", () => {
  assert.equal(
    resolveLoginErrorMessage({ error: ["invalid-credentials", "ignored"] }),
    "Sign-in failed. Check your credentials and try again.",
  );
  assert.equal(
    resolveLoginErrorMessage({ error: "unexpected" }),
    "Sign-in failed. Please try again.",
  );
});

test("resolveLoginErrorMessage returns null when missing", () => {
  assert.equal(resolveLoginErrorMessage({}), null);
  assert.equal(resolveLoginErrorMessage(undefined), null);
});
