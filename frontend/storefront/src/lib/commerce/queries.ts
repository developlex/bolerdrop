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

export const SET_SHIPPING_ADDRESSES_ON_CART_MUTATION = `
mutation SetShippingAddressesOnCart(
  $cartId: String!,
  $firstname: String!,
  $lastname: String!,
  $street: [String!]!,
  $city: String!,
  $postcode: String!,
  $countryCode: String!,
  $telephone: String!,
  $region: String
) {
  setShippingAddressesOnCart(
    input: {
      cart_id: $cartId,
      shipping_addresses: [{
        address: {
          firstname: $firstname,
          lastname: $lastname,
          street: $street,
          city: $city,
          postcode: $postcode,
          country_code: $countryCode,
          telephone: $telephone,
          region: $region
        }
      }]
    }
  ) {
    cart {
      id
      shipping_addresses {
        available_shipping_methods {
          carrier_code
          method_code
        }
      }
    }
  }
}
`;

export const SET_SHIPPING_METHODS_ON_CART_MUTATION = `
mutation SetShippingMethodsOnCart($cartId: String!, $carrierCode: String!, $methodCode: String!) {
  setShippingMethodsOnCart(
    input: {
      cart_id: $cartId,
      shipping_methods: [{
        carrier_code: $carrierCode,
        method_code: $methodCode
      }]
    }
  ) {
    cart {
      id
      shipping_addresses {
        selected_shipping_method {
          carrier_code
          method_code
        }
      }
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

export const CREATE_CUSTOMER_MUTATION = `
mutation CreateCustomer(
  $firstname: String!,
  $lastname: String!,
  $email: String!,
  $password: String!
) {
  createCustomer(
    input: {
      firstname: $firstname,
      lastname: $lastname,
      email: $email,
      password: $password
    }
  ) {
    customer {
      email
      firstname
      lastname
    }
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

export const GET_COUNTRIES_QUERY = `
query GetCountries {
  countries {
    id
    two_letter_abbreviation
    available_regions {
      id
      code
      name
    }
  }
}
`;

export const GET_CUSTOMER_DASHBOARD_QUERY = `
query GetCustomerDashboard {
  customer {
    email
    firstname
    lastname
    is_subscribed
    default_billing
    default_shipping
    addresses {
      id
      firstname
      lastname
      street
      city
      postcode
      country_code
      telephone
      default_shipping
      default_billing
      region {
        region
        region_code
      }
    }
    orders(pageSize: 5, currentPage: 1) {
      total_count
      items {
        number
        order_date
        status
        total {
          grand_total {
            value
            currency
          }
        }
      }
    }
    wishlists {
      id
      items_count
      updated_at
    }
  }
}
`;

export const GET_CUSTOMER_ORDERS_QUERY = `
query GetCustomerOrders($pageSize: Int!, $currentPage: Int!) {
  customer {
    orders(pageSize: $pageSize, currentPage: $currentPage) {
      total_count
      items {
        number
        order_date
        status
        total {
          grand_total {
            value
            currency
          }
        }
      }
    }
  }
}
`;

export const GET_CUSTOMER_ORDER_BY_NUMBER_QUERY = `
query GetCustomerOrderByNumber($orderNumber: String!) {
  customer {
    orders(
      pageSize: 1,
      currentPage: 1,
      filter: { number: { eq: $orderNumber } }
    ) {
      total_count
      items {
        number
        order_date
        status
        shipping_method
        total {
          grand_total {
            value
            currency
          }
        }
        items {
          id
          product_name
          product_sku
          product_url_key
          quantity_ordered
          status
          product_sale_price {
            value
            currency
          }
        }
        billing_address {
          firstname
          lastname
          street
          city
          region
          postcode
          country_code
          telephone
        }
        shipping_address {
          firstname
          lastname
          street
          city
          region
          postcode
          country_code
          telephone
        }
      }
    }
  }
}
`;

export const GET_CUSTOMER_WISHLIST_QUERY = `
query GetCustomerWishlist($pageSize: Int!, $currentPage: Int!) {
  customer {
    wishlists {
      id
      items_count
      updated_at
      items_v2(pageSize: $pageSize, currentPage: $currentPage) {
        page_info {
          current_page
          total_pages
        }
        items {
          id
          quantity
          added_at
          product {
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
        }
      }
    }
  }
}
`;

export const UPDATE_CUSTOMER_MUTATION = `
mutation UpdateCustomer($firstname: String!, $lastname: String!) {
  updateCustomer(
    input: {
      firstname: $firstname
      lastname: $lastname
    }
  ) {
    customer {
      email
      firstname
      lastname
      is_subscribed
    }
  }
}
`;

export const UPDATE_CUSTOMER_NEWSLETTER_MUTATION = `
mutation UpdateCustomerNewsletter($isSubscribed: Boolean!) {
  updateCustomer(
    input: {
      is_subscribed: $isSubscribed
    }
  ) {
    customer {
      email
      firstname
      lastname
      is_subscribed
    }
  }
}
`;

export const UPDATE_CUSTOMER_EMAIL_MUTATION = `
mutation UpdateCustomerEmail($email: String!, $password: String!) {
  updateCustomerEmail(email: $email, password: $password) {
    customer {
      email
      firstname
      lastname
      is_subscribed
    }
  }
}
`;

export const CHANGE_CUSTOMER_PASSWORD_MUTATION = `
mutation ChangeCustomerPassword($currentPassword: String!, $newPassword: String!) {
  changeCustomerPassword(
    currentPassword: $currentPassword
    newPassword: $newPassword
  ) {
    email
    firstname
    lastname
  }
}
`;

export const CREATE_CUSTOMER_ADDRESS_MUTATION = `
mutation CreateCustomerAddress($input: CustomerAddressInput!) {
  createCustomerAddress(input: $input) {
    id
  }
}
`;

export const UPDATE_CUSTOMER_ADDRESS_MUTATION = `
mutation UpdateCustomerAddress($addressId: Int!, $input: CustomerAddressInput!) {
  updateCustomerAddress(
    id: $addressId
    input: $input
  ) {
    id
  }
}
`;

export const DELETE_CUSTOMER_ADDRESS_MUTATION = `
mutation DeleteCustomerAddress($addressId: Int!) {
  deleteCustomerAddress(id: $addressId)
}
`;

export const REMOVE_PRODUCTS_FROM_WISHLIST_MUTATION = `
mutation RemoveProductsFromWishlist($wishlistId: ID!, $wishlistItemsIds: [ID!]!) {
  removeProductsFromWishlist(
    wishlistId: $wishlistId
    wishlistItemsIds: $wishlistItemsIds
  ) {
    user_errors {
      code
      message
    }
  }
}
`;

export const UPDATE_PRODUCTS_IN_WISHLIST_MUTATION = `
mutation UpdateProductsInWishlist($wishlistId: ID!, $wishlistItems: [WishlistItemUpdateInput!]!) {
  updateProductsInWishlist(
    wishlistId: $wishlistId
    wishlistItems: $wishlistItems
  ) {
    user_errors {
      code
      message
    }
  }
}
`;

export const ADD_PRODUCTS_TO_WISHLIST_MUTATION = `
mutation AddProductsToWishlist($wishlistId: ID!, $wishlistItems: [WishlistItemInput!]!) {
  addProductsToWishlist(
    wishlistId: $wishlistId
    wishlistItems: $wishlistItems
  ) {
    user_errors {
      code
      message
    }
  }
}
`;

export const GET_CUSTOMER_DOWNLOADABLE_PRODUCTS_QUERY = `
query GetCustomerDownloadableProducts {
  customerDownloadableProducts {
    items {
      date
      download_url
      order_increment_id
      remaining_downloads
      status
    }
  }
}
`;

export const GET_CUSTOMER_PAYMENT_TOKENS_QUERY = `
query GetCustomerPaymentTokens {
  customerPaymentTokens {
    items {
      details
      payment_method_code
      public_hash
      type
    }
  }
}
`;

export const GET_CUSTOMER_REVIEWS_QUERY = `
query GetCustomerReviews {
  customer {
    reviews {
      items {
        average_rating
        created_at
        nickname
        summary
        text
        product {
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
      }
    }
  }
}
`;
