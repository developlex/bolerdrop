import { commerceGraphQL } from "@/src/lib/commerce/client";
import { getCountryRegions } from "@/src/lib/commerce/directory";
import {
  mapCustomer,
  mapCustomerDashboard,
  mapCustomerOrderDetail,
  mapCustomerPaymentToken,
  mapCustomerProductReview,
  mapCustomerWishlist,
  mapDownloadableProduct
} from "@/src/lib/commerce/mappers";
import {
  ADD_PRODUCTS_TO_WISHLIST_MUTATION,
  CHANGE_CUSTOMER_PASSWORD_MUTATION,
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  CREATE_CUSTOMER_MUTATION,
  DELETE_CUSTOMER_ADDRESS_MUTATION,
  GENERATE_CUSTOMER_TOKEN_MUTATION,
  GET_CUSTOMER_DASHBOARD_QUERY,
  GET_CUSTOMER_DOWNLOADABLE_PRODUCTS_QUERY,
  GET_CUSTOMER_ORDER_BY_NUMBER_QUERY,
  GET_CUSTOMER_ORDERS_QUERY,
  GET_CUSTOMER_PAYMENT_TOKENS_QUERY,
  GET_CUSTOMER_QUERY,
  GET_CUSTOMER_REVIEWS_QUERY,
  GET_CUSTOMER_WISHLIST_QUERY,
  REMOVE_PRODUCTS_FROM_WISHLIST_MUTATION,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_EMAIL_MUTATION,
  UPDATE_CUSTOMER_MUTATION,
  UPDATE_CUSTOMER_NEWSLETTER_MUTATION,
  UPDATE_PRODUCTS_IN_WISHLIST_MUTATION
} from "@/src/lib/commerce/queries";
import type {
  CustomerAddress,
  CustomerAddressInput,
  CustomerDashboard,
  CustomerOrderDetail,
  CustomerOrderSummary,
  CustomerPaymentToken,
  CustomerProductReview,
  CustomerProfile,
  CustomerProfileUpdateInput,
  CustomerRegistrationInput,
  CustomerWishlist,
  DownloadableProduct,
  MagentoCustomerNode
} from "@/src/lib/commerce/types";

type GenerateTokenResponse = {
  generateCustomerToken: {
    token: string;
  };
};

type CustomerResponse = {
  customer: MagentoCustomerNode;
};

type CreateCustomerResponse = {
  createCustomer: {
    customer: MagentoCustomerNode;
  };
};

type CustomerOutputResponse = {
  updateCustomer?: {
    customer: MagentoCustomerNode;
  };
  updateCustomerEmail?: {
    customer: MagentoCustomerNode;
  };
};

type CustomerChangePasswordResponse = {
  changeCustomerPassword: MagentoCustomerNode;
};

type CustomerAddressRegionInput = {
  region: string;
  region_id?: number;
  region_code?: string;
};

type CustomerAddressMutationInput = {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  postcode: string;
  country_code: string;
  telephone: string;
  default_shipping: boolean;
  default_billing: boolean;
  region?: CustomerAddressRegionInput;
};

type CreateCustomerAddressResponse = {
  createCustomerAddress: {
    id?: string | number | null;
  };
};

type UpdateCustomerAddressResponse = {
  updateCustomerAddress: {
    id?: string | number | null;
  };
};

type DeleteCustomerAddressResponse = {
  deleteCustomerAddress: boolean;
};

type RemoveWishlistItemsResponse = {
  removeProductsFromWishlist: {
    user_errors?: Array<{
      message?: string | null;
    }> | null;
  };
};

type UpdateWishlistItemsResponse = {
  updateProductsInWishlist: {
    user_errors?: Array<{
      message?: string | null;
    }> | null;
  };
};

type AddWishlistItemsResponse = {
  addProductsToWishlist: {
    user_errors?: Array<{
      message?: string | null;
    }> | null;
  };
};

type CustomerDownloadableProductsResponse = {
  customerDownloadableProducts: {
    items?: Array<{
      date?: string | null;
      download_url?: string | null;
      order_increment_id?: string | null;
      remaining_downloads?: string | null;
      status?: string | null;
    }> | null;
  };
};

type CustomerPaymentTokensResponse = {
  customerPaymentTokens: {
    items?: Array<{
      details?: string | null;
      payment_method_code?: string | null;
      public_hash?: string | null;
      type?: string | null;
    }> | null;
  };
};

export async function generateCustomerToken(email: string, password: string): Promise<string> {
  const data = await commerceGraphQL<GenerateTokenResponse>(GENERATE_CUSTOMER_TOKEN_MUTATION, { email, password });
  return data.generateCustomerToken.token;
}

export async function createCustomerAccount(input: CustomerRegistrationInput): Promise<CustomerProfile> {
  const data = await commerceGraphQL<CreateCustomerResponse>(CREATE_CUSTOMER_MUTATION, {
    firstname: input.firstname,
    lastname: input.lastname,
    email: input.email,
    password: input.password
  });
  return mapCustomer(data.createCustomer.customer);
}

export async function getCustomerProfile(token: string): Promise<CustomerProfile> {
  const data = await commerceGraphQL<CustomerResponse>(GET_CUSTOMER_QUERY, {}, token);
  return mapCustomer(data.customer);
}

export async function getCustomerDashboard(token: string): Promise<CustomerDashboard> {
  const data = await commerceGraphQL<CustomerResponse>(GET_CUSTOMER_DASHBOARD_QUERY, {}, token);
  return mapCustomerDashboard(data.customer);
}

export async function updateCustomerProfile(token: string, input: CustomerProfileUpdateInput): Promise<CustomerProfile> {
  const data = await commerceGraphQL<CustomerOutputResponse>(
    UPDATE_CUSTOMER_MUTATION,
    {
      firstname: input.firstname,
      lastname: input.lastname
    },
    token
  );
  return mapCustomer(data.updateCustomer?.customer ?? {});
}

export async function updateCustomerEmail(token: string, email: string, password: string): Promise<CustomerProfile> {
  const data = await commerceGraphQL<CustomerOutputResponse>(
    UPDATE_CUSTOMER_EMAIL_MUTATION,
    { email, password },
    token
  );
  return mapCustomer(data.updateCustomerEmail?.customer ?? {});
}

export async function updateNewsletterSubscription(token: string, subscribed: boolean): Promise<boolean> {
  const data = await commerceGraphQL<CustomerOutputResponse>(
    UPDATE_CUSTOMER_NEWSLETTER_MUTATION,
    { isSubscribed: subscribed },
    token
  );
  return Boolean(data.updateCustomer?.customer?.is_subscribed);
}

export async function changeCustomerPassword(token: string, currentPassword: string, newPassword: string): Promise<CustomerProfile> {
  const data = await commerceGraphQL<CustomerChangePasswordResponse>(
    CHANGE_CUSTOMER_PASSWORD_MUTATION,
    { currentPassword, newPassword },
    token
  );
  return mapCustomer(data.changeCustomerPassword);
}

function normalizeLookupValue(value: string): string {
  return value.trim().toLowerCase();
}

async function resolveAddressRegionInput(countryCode: string, rawRegion: string | null): Promise<CustomerAddressRegionInput | undefined> {
  const region = rawRegion?.trim();
  if (!region) {
    return undefined;
  }

  const regionInput: CustomerAddressRegionInput = { region };
  const normalizedCountryCode = countryCode.trim().toUpperCase();
  if (!normalizedCountryCode) {
    return regionInput;
  }

  try {
    const regions = await getCountryRegions(normalizedCountryCode);
    if (regions.length === 0) {
      return regionInput;
    }

    const normalizedRegion = normalizeLookupValue(region);
    const matchedRegion = regions.find((candidate) => {
      const code = normalizeLookupValue(candidate.code);
      const name = normalizeLookupValue(candidate.name);
      const id = normalizeLookupValue(String(candidate.id ?? ""));
      return code === normalizedRegion || name === normalizedRegion || id === normalizedRegion;
    });

    if (!matchedRegion) {
      return regionInput;
    }

    if (matchedRegion.id && Number.isInteger(matchedRegion.id) && matchedRegion.id > 0) {
      regionInput.region_id = matchedRegion.id;
    }
    const regionCode = matchedRegion.code.trim();
    if (regionCode) {
      regionInput.region_code = regionCode;
    }
    const regionName = matchedRegion.name.trim();
    if (regionName) {
      regionInput.region = regionName;
    }

    return regionInput;
  } catch {
    return regionInput;
  }
}

async function toCustomerAddressMutationInput(input: CustomerAddressInput): Promise<CustomerAddressMutationInput> {
  const region = await resolveAddressRegionInput(input.countryCode, input.region);
  return {
    firstname: input.firstname,
    lastname: input.lastname,
    street: input.street,
    city: input.city,
    postcode: input.postcode,
    country_code: input.countryCode,
    telephone: input.telephone,
    default_shipping: input.defaultShipping,
    default_billing: input.defaultBilling,
    ...(region ? { region } : {})
  };
}

export async function createCustomerAddress(token: string, input: CustomerAddressInput): Promise<string> {
  const mutationInput = await toCustomerAddressMutationInput(input);
  const data = await commerceGraphQL<CreateCustomerAddressResponse>(
    CREATE_CUSTOMER_ADDRESS_MUTATION,
    {
      input: mutationInput
    },
    token
  );
  return String(data.createCustomerAddress?.id ?? "");
}

export async function updateCustomerAddress(token: string, addressId: number, input: CustomerAddressInput): Promise<string> {
  const mutationInput = await toCustomerAddressMutationInput(input);
  const data = await commerceGraphQL<UpdateCustomerAddressResponse>(
    UPDATE_CUSTOMER_ADDRESS_MUTATION,
    {
      addressId,
      input: mutationInput
    },
    token
  );
  return String(data.updateCustomerAddress?.id ?? "");
}

export async function deleteCustomerAddress(token: string, addressId: number): Promise<boolean> {
  const data = await commerceGraphQL<DeleteCustomerAddressResponse>(
    DELETE_CUSTOMER_ADDRESS_MUTATION,
    { addressId },
    token
  );
  return Boolean(data.deleteCustomerAddress);
}

export async function getCustomerOrders(token: string, pageSize = 20, currentPage = 1): Promise<CustomerOrderSummary[]> {
  const data = await commerceGraphQL<CustomerResponse>(
    GET_CUSTOMER_ORDERS_QUERY,
    { pageSize, currentPage },
    token
  );
  const items = data.customer?.orders?.items;
  return Array.isArray(items)
    ? items.map((item) => mapCustomerOrderDetail(item)).map((order) => ({
      number: order.number,
      orderDate: order.orderDate,
      status: order.status,
      grandTotal: order.grandTotal,
      currency: order.currency
    }))
    : [];
}

export async function getCustomerOrderByNumber(token: string, orderNumber: string): Promise<CustomerOrderDetail | null> {
  const data = await commerceGraphQL<CustomerResponse>(
    GET_CUSTOMER_ORDER_BY_NUMBER_QUERY,
    { orderNumber },
    token
  );
  const first = data.customer?.orders?.items?.[0];
  if (!first) {
    return null;
  }
  return mapCustomerOrderDetail(first);
}

export async function getCustomerAddresses(token: string): Promise<CustomerAddress[]> {
  const dashboard = await getCustomerDashboard(token);
  return dashboard.addresses;
}

export async function getCustomerWishlist(token: string, pageSize = 50, currentPage = 1): Promise<CustomerWishlist | null> {
  const data = await commerceGraphQL<CustomerResponse>(
    GET_CUSTOMER_WISHLIST_QUERY,
    { pageSize, currentPage },
    token
  );
  const firstWishlist = data.customer?.wishlists?.[0];
  if (!firstWishlist) {
    return null;
  }
  return mapCustomerWishlist(firstWishlist);
}

function collectUserErrors(errors: Array<{ message?: string | null }> | null | undefined): string[] {
  return Array.isArray(errors)
    ? errors
      .map((error) => (typeof error?.message === "string" ? error.message.trim() : ""))
      .filter((message) => message.length > 0)
    : [];
}

export async function removeWishlistItem(token: string, wishlistId: string, itemId: string): Promise<string[]> {
  const data = await commerceGraphQL<RemoveWishlistItemsResponse>(
    REMOVE_PRODUCTS_FROM_WISHLIST_MUTATION,
    { wishlistId, wishlistItemsIds: [itemId] },
    token
  );
  return collectUserErrors(data.removeProductsFromWishlist?.user_errors);
}

export async function updateWishlistItemQuantity(token: string, wishlistId: string, itemId: string, quantity: number): Promise<string[]> {
  const data = await commerceGraphQL<UpdateWishlistItemsResponse>(
    UPDATE_PRODUCTS_IN_WISHLIST_MUTATION,
    {
      wishlistId,
      wishlistItems: [{
        wishlist_item_id: itemId,
        quantity
      }]
    },
    token
  );
  return collectUserErrors(data.updateProductsInWishlist?.user_errors);
}

export async function addProductToWishlist(token: string, sku: string, quantity: number): Promise<string[]> {
  const dashboard = await getCustomerDashboard(token);
  const wishlistId = dashboard.wishlists[0]?.id;
  if (!wishlistId) {
    return ["Wishlist unavailable."];
  }

  const data = await commerceGraphQL<AddWishlistItemsResponse>(
    ADD_PRODUCTS_TO_WISHLIST_MUTATION,
    {
      wishlistId,
      wishlistItems: [
        {
          sku,
          quantity
        }
      ]
    },
    token
  );
  return collectUserErrors(data.addProductsToWishlist?.user_errors);
}

export async function getCustomerDownloadableProducts(token: string): Promise<DownloadableProduct[]> {
  const data = await commerceGraphQL<CustomerDownloadableProductsResponse>(
    GET_CUSTOMER_DOWNLOADABLE_PRODUCTS_QUERY,
    {},
    token
  );
  const items = data.customerDownloadableProducts?.items;
  return Array.isArray(items) ? items.map((item) => mapDownloadableProduct(item)) : [];
}

export async function getCustomerPaymentTokens(token: string): Promise<CustomerPaymentToken[]> {
  const data = await commerceGraphQL<CustomerPaymentTokensResponse>(
    GET_CUSTOMER_PAYMENT_TOKENS_QUERY,
    {},
    token
  );
  const items = data.customerPaymentTokens?.items;
  return Array.isArray(items)
    ? items.map((item) => mapCustomerPaymentToken(item)).filter((item) => item.publicHash.length > 0)
    : [];
}

export async function getCustomerProductReviews(token: string): Promise<CustomerProductReview[]> {
  const data = await commerceGraphQL<CustomerResponse>(
    GET_CUSTOMER_REVIEWS_QUERY,
    {},
    token
  );
  const reviews = data.customer?.reviews?.items;
  return Array.isArray(reviews)
    ? reviews.map((review) => mapCustomerProductReview(review))
    : [];
}
