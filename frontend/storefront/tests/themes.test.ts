import test from "node:test";
import assert from "node:assert/strict";
import { getStorefrontTheme, normalizeStorefrontThemeId } from "@/src/themes/themes";

test("normalizeStorefrontThemeId resolves valid ids case-insensitively", () => {
  assert.equal(normalizeStorefrontThemeId("dropship"), "dropship");
  assert.equal(normalizeStorefrontThemeId("SunSet"), "sunset");
});

test("normalizeStorefrontThemeId returns null for invalid values", () => {
  assert.equal(normalizeStorefrontThemeId(""), null);
  assert.equal(normalizeStorefrontThemeId("unknown"), null);
  assert.equal(normalizeStorefrontThemeId(undefined), null);
});

test("getStorefrontTheme returns stable registry objects", () => {
  const dropship = getStorefrontTheme("dropship");
  assert.equal(dropship.id, "dropship");
  assert.equal(typeof dropship.cssVariables["--color-ember"], "string");
});
