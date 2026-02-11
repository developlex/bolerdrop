import { commerceGraphQL } from "@/src/lib/commerce/client";
import { mapCart } from "@/src/lib/commerce/mappers";
import { ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION, CREATE_EMPTY_CART_MUTATION, GET_CART_QUERY } from "@/src/lib/commerce/queries";
import type { CartSnapshot, MagentoCartNode } from "@/src/lib/commerce/types";

type CreateEmptyCartResponse = {
  createEmptyCart: string;
};

type AddSimpleProductsResponse = {
  addSimpleProductsToCart: {
    cart: MagentoCartNode;
  };
};

type GetCartResponse = {
  cart: MagentoCartNode;
};

export async function createEmptyCart(): Promise<string> {
  const data = await commerceGraphQL<CreateEmptyCartResponse>(CREATE_EMPTY_CART_MUTATION);
  return data.createEmptyCart;
}

export async function addSimpleSkuToCart(cartId: string, sku: string, quantity: number): Promise<CartSnapshot> {
  const data = await commerceGraphQL<AddSimpleProductsResponse>(ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION, {
    cartId,
    sku,
    quantity
  });
  return mapCart(data.addSimpleProductsToCart.cart);
}

export async function getCart(cartId: string): Promise<CartSnapshot> {
  const data = await commerceGraphQL<GetCartResponse>(GET_CART_QUERY, { cartId });
  return mapCart(data.cart);
}
