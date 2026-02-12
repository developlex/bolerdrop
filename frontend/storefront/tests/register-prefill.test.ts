import test from "node:test";
import assert from "node:assert/strict";
import { createRegisterPrefill, parseRegisterPrefill, serializeRegisterPrefill } from "@/src/lib/forms/register";

test("createRegisterPrefill normalizes and trims values", () => {
  const prefill = createRegisterPrefill("  Alex  ", "  Buyer  ", "  ALEX@EXAMPLE.TEST ");
  assert.equal(prefill.firstname, "Alex");
  assert.equal(prefill.lastname, "Buyer");
  assert.equal(prefill.email, "alex@example.test");
});

test("parseRegisterPrefill returns null for invalid payloads", () => {
  assert.equal(parseRegisterPrefill(undefined), null);
  assert.equal(parseRegisterPrefill("not-json"), null);
  assert.equal(parseRegisterPrefill("{\"firstname\":\"A\"}"), null);
});

test("parseRegisterPrefill parses serialized payload", () => {
  const serialized = serializeRegisterPrefill(createRegisterPrefill("Sam", "Store", "sam@store.test"));
  const parsed = parseRegisterPrefill(serialized);
  assert.equal(parsed?.firstname, "Sam");
  assert.equal(parsed?.lastname, "Store");
  assert.equal(parsed?.email, "sam@store.test");
});
