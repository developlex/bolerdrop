import { getStorefrontConfig } from "@/src/lib/config";

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

export type GraphQLOperation<TData, TVariables extends Record<string, unknown>> = {
  query: string;
  operationName: string;
  defaultVariables?: TVariables;
};

export class CommerceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommerceError";
  }
}

export async function commerceGraphQL<T>(query: string, variables: Record<string, unknown> = {}, customerToken?: string): Promise<T> {
  const { commerceGraphqlUrl } = getStorefrontConfig();

  const response = await fetch(commerceGraphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {})
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new CommerceError(`GraphQL request failed with status ${response.status}`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors && json.errors.length > 0) {
    const message = json.errors.map((error) => error.message || "Unknown error").join("; ");
    throw new CommerceError(message);
  }

  if (!json.data) {
    throw new CommerceError("GraphQL response did not contain data");
  }

  return json.data;
}

export async function commerceOperation<TData, TVariables extends Record<string, unknown>>(
  operation: GraphQLOperation<TData, TVariables>,
  variables: TVariables,
  customerToken?: string,
): Promise<TData> {
  const effectiveVariables = operation.defaultVariables
    ? { ...operation.defaultVariables, ...variables }
    : variables;
  return commerceGraphQL<TData>(operation.query, effectiveVariables, customerToken);
}
