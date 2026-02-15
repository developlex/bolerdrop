import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PAGE_SIZE, getCatalogPageHref, parsePageParam, parsePageSizeParam } from "@/src/lib/commerce/pagination";

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

test("parsePageSizeParam allows only configured values", () => {
  assert.equal(parsePageSizeParam(undefined), DEFAULT_PAGE_SIZE);
  assert.equal(parsePageSizeParam("4"), 4);
  assert.equal(parsePageSizeParam(["8"]), 8);
  assert.equal(parsePageSizeParam("12"), 12);
  assert.equal(parsePageSizeParam("16"), 16);
  assert.equal(parsePageSizeParam("5"), DEFAULT_PAGE_SIZE);
  assert.equal(parsePageSizeParam("0"), DEFAULT_PAGE_SIZE);
  assert.equal(parsePageSizeParam("abc"), DEFAULT_PAGE_SIZE);
});
