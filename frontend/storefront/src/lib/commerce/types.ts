export type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  urlKey: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
};

export type CatalogPage = {
  products: CatalogProduct[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ProductDetail = CatalogProduct & {
  descriptionHtml: string | null;
  shortDescriptionHtml: string | null;
};

export type CartItem = {
  uid: string;
  sku: string;
  name: string;
  quantity: number;
  lineTotal: number | null;
  currency: string | null;
};

export type CartSnapshot = {
  id: string;
  totalQuantity: number;
  grandTotal: number | null;
  currency: string | null;
  items: CartItem[];
};

export type PaymentMethodOption = {
  code: string;
  title: string;
};

export type ShippingMethodOption = {
  carrierCode: string;
  methodCode: string;
  carrierTitle: string | null;
  methodTitle: string | null;
  amount: number | null;
  currency: string | null;
};

export type ShippingAddressInput = {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  postcode: string;
  countryCode: string;
  telephone: string;
  region: string | null;
};

export type ShippingMethodInput = {
  carrierCode: string;
  methodCode: string;
};

export type PlaceGuestOrderInput = {
  email: string;
  paymentMethodCode: string;
  shippingAddress: ShippingAddressInput | null;
  shippingMethod: ShippingMethodInput | null;
};

export type CheckoutReadiness = {
  ready: boolean;
  reasons: string[];
  isVirtual: boolean;
  requiresGuestEmail: boolean;
  selectedShippingMethod: string | null;
  availablePaymentMethods: PaymentMethodOption[];
  availableShippingMethods: ShippingMethodOption[];
};

export type CustomerProfile = {
  email: string;
  firstname: string;
  lastname: string;
};

export type CustomerAddress = {
  id: string;
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  postcode: string;
  countryCode: string;
  telephone: string;
  region: string | null;
  regionCode: string | null;
  defaultShipping: boolean;
  defaultBilling: boolean;
};

export type CustomerOrderSummary = {
  number: string;
  orderDate: string;
  status: string;
  grandTotal: number | null;
  currency: string | null;
};

export type CustomerOrderItem = {
  id: string;
  productName: string;
  productSku: string;
  productUrlKey: string | null;
  quantityOrdered: number;
  status: string | null;
  salePrice: number | null;
  currency: string | null;
};

export type CustomerOrderAddress = {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  region: string | null;
  postcode: string;
  countryCode: string;
  telephone: string;
};

export type CustomerOrderDetail = CustomerOrderSummary & {
  shippingMethod: string | null;
  items: CustomerOrderItem[];
  billingAddress: CustomerOrderAddress | null;
  shippingAddress: CustomerOrderAddress | null;
};

export type CustomerWishlistSummary = {
  id: string;
  itemsCount: number;
  updatedAt: string | null;
};

export type CustomerWishlistItem = {
  id: string;
  quantity: number;
  addedAt: string;
  product: CatalogProduct | null;
};

export type CustomerWishlist = {
  id: string;
  itemsCount: number;
  updatedAt: string | null;
  items: CustomerWishlistItem[];
  currentPage: number;
  totalPages: number;
};

export type DownloadableProduct = {
  orderIncrementId: string;
  date: string;
  status: string;
  remainingDownloads: string | null;
  downloadUrl: string | null;
};

export type CustomerPaymentToken = {
  publicHash: string;
  paymentMethodCode: string;
  type: string;
  details: string | null;
};

export type CustomerProductReview = {
  averageRating: number | null;
  createdAt: string;
  nickname: string | null;
  summary: string | null;
  text: string | null;
  product: CatalogProduct | null;
};

export type CustomerDashboard = {
  profile: CustomerProfile;
  isSubscribed: boolean;
  defaultBillingId: string | null;
  defaultShippingId: string | null;
  addresses: CustomerAddress[];
  totalOrderCount: number;
  orders: CustomerOrderSummary[];
  wishlists: CustomerWishlistSummary[];
};

export type CustomerRegistrationInput = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

export type CustomerProfileUpdateInput = {
  firstname: string;
  lastname: string;
};

export type CustomerAddressInput = {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  postcode: string;
  countryCode: string;
  telephone: string;
  region: string | null;
  defaultShipping: boolean;
  defaultBilling: boolean;
};

export type MoneyNode = {
  value?: number | null;
  currency?: string | null;
} | null | undefined;

export type MagentoProductNode = {
  uid?: string | number | null;
  id?: string | number | null;
  sku?: string | null;
  name?: string | null;
  url_key?: string | null;
  small_image?: { url?: string | null } | null;
  price_range?: {
    minimum_price?: {
      final_price?: MoneyNode;
      regular_price?: MoneyNode;
    } | null;
  } | null;
  description?: { html?: string | null } | null;
  short_description?: { html?: string | null } | null;
};

export type MagentoCartItemNode = {
  uid?: string | number | null;
  quantity?: number | null;
  product?: {
    sku?: string | null;
    name?: string | null;
  } | null;
  prices?: {
    row_total?: MoneyNode;
    row_total_including_tax?: MoneyNode;
  } | null;
};

export type MagentoCartNode = {
  id?: string | number | null;
  total_quantity?: number | null;
  prices?: {
    grand_total?: MoneyNode;
  } | null;
  items?: MagentoCartItemNode[] | null;
  email?: string | null;
  is_virtual?: boolean | null;
  available_payment_methods?: Array<{
    code?: string | null;
    title?: string | null;
  }> | null;
  shipping_addresses?: Array<{
    selected_shipping_method?: {
      carrier_code?: string | null;
      method_code?: string | null;
    } | null;
    available_shipping_methods?: Array<{
      carrier_code?: string | null;
      method_code?: string | null;
      carrier_title?: string | null;
      method_title?: string | null;
      amount?: MoneyNode;
    }> | null;
  }> | null;
};

export type MagentoCustomerNode = {
  email?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  is_subscribed?: boolean | null;
  default_billing?: string | number | null;
  default_shipping?: string | number | null;
  addresses?: Array<{
    id?: string | number | null;
    firstname?: string | null;
    lastname?: string | null;
    street?: Array<string | null> | null;
    city?: string | null;
    postcode?: string | null;
    country_code?: string | null;
    telephone?: string | null;
    default_shipping?: boolean | null;
    default_billing?: boolean | null;
    region?: {
      region?: string | null;
      region_code?: string | null;
    } | null;
  }> | null;
  orders?: {
    total_count?: number | null;
    page_info?: {
      current_page?: number | null;
      total_pages?: number | null;
    } | null;
    items?: Array<{
      number?: string | null;
      order_date?: string | null;
      status?: string | null;
      shipping_method?: string | null;
      total?: {
        grand_total?: MoneyNode;
      } | null;
      items?: Array<{
        id?: string | number | null;
        product_name?: string | null;
        product_sku?: string | null;
        product_url_key?: string | null;
        quantity_ordered?: number | null;
        status?: string | null;
        product_sale_price?: MoneyNode;
      }> | null;
      billing_address?: {
        firstname?: string | null;
        lastname?: string | null;
        street?: Array<string | null> | null;
        city?: string | null;
        region?: string | null;
        postcode?: string | null;
        country_code?: string | null;
        telephone?: string | null;
      } | null;
      shipping_address?: {
        firstname?: string | null;
        lastname?: string | null;
        street?: Array<string | null> | null;
        city?: string | null;
        region?: string | null;
        postcode?: string | null;
        country_code?: string | null;
        telephone?: string | null;
      } | null;
    }> | null;
  } | null;
  wishlists?: Array<{
    id?: string | number | null;
    items_count?: number | null;
    updated_at?: string | null;
    items_v2?: {
      page_info?: {
        current_page?: number | null;
        total_pages?: number | null;
      } | null;
      items?: Array<{
        id?: string | number | null;
        quantity?: number | null;
        added_at?: string | null;
        product?: MagentoProductNode | null;
      }> | null;
    } | null;
  }> | null;
  reviews?: {
    items?: Array<{
      average_rating?: number | null;
      created_at?: string | null;
      nickname?: string | null;
      summary?: string | null;
      text?: string | null;
      product?: MagentoProductNode | null;
    }> | null;
  } | null;
};
