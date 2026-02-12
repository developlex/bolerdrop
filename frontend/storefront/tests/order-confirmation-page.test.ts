import test from "node:test";
import assert from "node:assert/strict";
import { resolveOrderNumber } from "@/app/order/confirmation/page";

test("resolveOrderNumber returns normalized order number", () => {
  assert.equal(resolveOrderNumber({ order: " 000123 " }), "000123");
});

test("resolveOrderNumber handles arrays and missing values", () => {
  assert.equal(resolveOrderNumber({ order: ["000124", "ignored"] }), "000124");
  assert.equal(resolveOrderNumber({ order: "   " }), null);
  assert.equal(resolveOrderNumber({}), null);
  assert.equal(resolveOrderNumber(undefined), null);
});
