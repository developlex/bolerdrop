import { commerceGraphQL } from "@/src/lib/commerce/client";
import { mapCustomer } from "@/src/lib/commerce/mappers";
import { GENERATE_CUSTOMER_TOKEN_MUTATION, GET_CUSTOMER_QUERY } from "@/src/lib/commerce/queries";
import type { CustomerProfile, MagentoCustomerNode } from "@/src/lib/commerce/types";

type GenerateTokenResponse = {
  generateCustomerToken: {
    token: string;
  };
};

type CustomerResponse = {
  customer: MagentoCustomerNode;
};

export async function generateCustomerToken(email: string, password: string): Promise<string> {
  const data = await commerceGraphQL<GenerateTokenResponse>(GENERATE_CUSTOMER_TOKEN_MUTATION, { email, password });
  return data.generateCustomerToken.token;
}

export async function getCustomerProfile(token: string): Promise<CustomerProfile> {
  const data = await commerceGraphQL<CustomerResponse>(GET_CUSTOMER_QUERY, {}, token);
  return mapCustomer(data.customer);
}
