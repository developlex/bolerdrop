import test from "node:test";
import assert from "node:assert/strict";
import { absoluteStorefrontUrl, htmlToPlainText, stripSourceTagsFromHtml, toMetaDescription } from "@/src/lib/seo";

test("htmlToPlainText strips tags and compresses whitespace", () => {
  const result = htmlToPlainText("<p>Hello <strong>world</strong>   again</p>");
  assert.equal(result, "Hello world again");
});

test("toMetaDescription returns undefined for empty content", () => {
  assert.equal(toMetaDescription(""), undefined);
  assert.equal(toMetaDescription(null), undefined);
});

test("toMetaDescription truncates long descriptions", () => {
  const longText = "a".repeat(200);
  const description = toMetaDescription(longText);
  assert.ok(description);
  assert.equal(description?.length, 160);
  assert.ok(description?.endsWith("…"));
});

test("stripSourceTagsFromHtml removes source tags paragraph", () => {
  const input = "<p>Visible details</p><p><strong>Source tags:</strong> [\"foo\", \"bar\"]</p>";
  const result = stripSourceTagsFromHtml(input);
  assert.equal(result, "<p>Visible details</p>");
});

test("absoluteStorefrontUrl resolves relative paths against storefront base URL", () => {
  const previousBase = process.env.STOREFRONT_BASE_URL;
  process.env.STOREFRONT_BASE_URL = "https://store.test";

  try {
    assert.equal(absoluteStorefrontUrl("/page/2"), "https://store.test/page/2");
    assert.equal(
      absoluteStorefrontUrl("https://cdn.test/image.jpg"),
      "https://cdn.test/image.jpg"
    );
  } finally {
    if (previousBase === undefined) {
      delete process.env.STOREFRONT_BASE_URL;
    } else {
      process.env.STOREFRONT_BASE_URL = previousBase;
    }
  }
});
