import test from "node:test";
import assert from "node:assert/strict";
import { getCatalogPageHref, parsePageParam } from "@/src/lib/commerce/pagination";

test("parsePageParam parses positive integers and rejects invalid values", () => {
  assert.equal(parsePageParam("2"), 2);
  assert.equal(parsePageParam(["3"]), 3);
  assert.equal(parsePageParam("1"), 1);
  assert.equal(parsePageParam(undefined), null);
  assert.equal(parsePageParam("0"), null);
  assert.equal(parsePageParam("-3"), null);
  assert.equal(parsePageParam("abc"), null);
  assert.equal(parsePageParam([""]), null);
});

test("getCatalogPageHref returns canonical catalog URLs", () => {
  assert.equal(getCatalogPageHref(1), "/");
  assert.equal(getCatalogPageHref(0), "/");
  assert.equal(getCatalogPageHref(2), "/page/2");
  assert.equal(getCatalogPageHref(10), "/page/10");
});
