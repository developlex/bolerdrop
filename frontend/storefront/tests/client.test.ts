import test from "node:test";
import assert from "node:assert/strict";
import { CommerceError, commerceGraphQL } from "@/src/lib/commerce/client";

function textResponse(body: string, status: number): Response {
  return new Response(body, { status });
}

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

test("commerceGraphQL throws CommerceError when HTTP status is not ok", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async () => textResponse("upstream error", 502)) as typeof fetch;

  try {
    await assert.rejects(
      () => commerceGraphQL<{ ok: boolean }>("query Test { ping }"),
      (error: unknown) =>
        error instanceof CommerceError &&
        error.message.includes("status 502")
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("commerceGraphQL throws CommerceError when GraphQL response includes errors", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async () => jsonResponse({
    errors: [{ message: "catalog unavailable" }, { message: "bad query" }]
  })) as typeof fetch;

  try {
    await assert.rejects(
      () => commerceGraphQL<{ ok: boolean }>("query Test { ping }"),
      (error: unknown) =>
        error instanceof CommerceError &&
        error.message.includes("catalog unavailable; bad query")
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});

test("commerceGraphQL throws CommerceError when data is missing", async () => {
  const previousFetch = globalThis.fetch;
  const previousGraphqlUrl = process.env.COMMERCE_GRAPHQL_URL;
  process.env.COMMERCE_GRAPHQL_URL = "http://commerce.test/graphql";

  globalThis.fetch = (async () => jsonResponse({})) as typeof fetch;

  try {
    await assert.rejects(
      () => commerceGraphQL<{ ok: boolean }>("query Test { ping }"),
      (error: unknown) =>
        error instanceof CommerceError &&
        error.message.includes("did not contain data")
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGraphqlUrl === undefined) {
      delete process.env.COMMERCE_GRAPHQL_URL;
    } else {
      process.env.COMMERCE_GRAPHQL_URL = previousGraphqlUrl;
    }
  }
});
