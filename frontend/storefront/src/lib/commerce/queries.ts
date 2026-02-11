export const LIST_PRODUCTS_QUERY = `
query ListProducts($search: String!, $pageSize: Int!, $currentPage: Int!) {
  products(search: $search, pageSize: $pageSize, currentPage: $currentPage) {
    items {
      uid
      sku
      name
      url_key
      small_image { url }
      price_range {
        minimum_price {
          final_price { value currency }
          regular_price { value currency }
        }
      }
    }
    total_count
    page_info { current_page total_pages }
  }
}
`;

export const GET_PRODUCT_BY_URL_KEY_QUERY = `
query ProductByUrlKey($urlKey: String!) {
  products(filter: { url_key: { eq: $urlKey } }) {
    items {
      uid
      sku
      name
      url_key
      description { html }
      short_description { html }
      small_image { url }
      price_range {
        minimum_price {
          final_price { value currency }
          regular_price { value currency }
        }
      }
    }
  }
}
`;

export const CREATE_EMPTY_CART_MUTATION = `
mutation CreateEmptyCart {
  createEmptyCart
}
`;

export const ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION = `
mutation AddSimpleProductsToCart($cartId: String!, $sku: String!, $quantity: Float!) {
  addSimpleProductsToCart(
    input: {
      cart_id: $cartId,
      cart_items: [{ data: { sku: $sku, quantity: $quantity } }]
    }
  ) {
    cart {
      id
      total_quantity
      prices {
        grand_total { value currency }
      }
      items {
        uid
        quantity
        product { sku name }
        prices {
          row_total { value currency }
          row_total_including_tax { value currency }
        }
      }
    }
  }
}
`;

export const GET_CART_QUERY = `
query GetCart($cartId: String!) {
  cart(cart_id: $cartId) {
    id
    total_quantity
    prices {
      grand_total { value currency }
    }
    items {
      uid
      quantity
      product { sku name }
      prices {
        row_total { value currency }
        row_total_including_tax { value currency }
      }
    }
  }
}
`;

export const GET_CART_CHECKOUT_READINESS_QUERY = `
query GetCartCheckoutReadiness($cartId: String!) {
  cart(cart_id: $cartId) {
    id
    email
    is_virtual
    available_payment_methods {
      code
      title
    }
    shipping_addresses {
      selected_shipping_method {
        carrier_code
        method_code
      }
      available_shipping_methods {
        carrier_code
        method_code
        carrier_title
        method_title
        amount {
          value
          currency
        }
      }
    }
  }
}
`;

export const SET_GUEST_EMAIL_ON_CART_MUTATION = `
mutation SetGuestEmailOnCart($cartId: String!, $email: String!) {
  setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
    cart {
      id
      email
    }
  }
}
`;

export const SET_PAYMENT_METHOD_ON_CART_MUTATION = `
mutation SetPaymentMethodOnCart($cartId: String!, $paymentMethodCode: String!) {
  setPaymentMethodOnCart(
    input: {
      cart_id: $cartId,
      payment_method: {
        code: $paymentMethodCode
      }
    }
  ) {
    cart {
      id
    }
  }
}
`;

export const PLACE_ORDER_MUTATION = `
mutation PlaceOrder($cartId: String!) {
  placeOrder(input: { cart_id: $cartId }) {
    orderV2 {
      number
    }
  }
}
`;

export const GENERATE_CUSTOMER_TOKEN_MUTATION = `
mutation GenerateCustomerToken($email: String!, $password: String!) {
  generateCustomerToken(email: $email, password: $password) {
    token
  }
}
`;

export const GET_CUSTOMER_QUERY = `
query GetCustomer {
  customer {
    email
    firstname
    lastname
  }
}
`;
