import type {
  CartSnapshot,
  CatalogProduct,
  CustomerAddress,
  CustomerDashboard,
  CustomerOrderAddress,
  CustomerOrderDetail,
  CustomerOrderItem,
  CustomerOrderSummary,
  CustomerPaymentToken,
  CustomerProfile,
  CustomerProductReview,
  CustomerWishlist,
  CustomerWishlistItem,
  CustomerWishlistSummary,
  DownloadableProduct,
  MoneyNode,
  MagentoCartItemNode,
  MagentoCartNode,
  MagentoCustomerNode,
  MagentoProductNode,
  ProductDetail
} from "@/src/lib/commerce/types";

function mapMoney(node: MoneyNode): { value: number | null; currency: string | null } {
  if (!node || typeof node.value !== "number") {
    return { value: null, currency: null };
  }
  return {
    value: node.value,
    currency: typeof node.currency === "string" ? node.currency : null
  };
}

export function mapCatalogProduct(raw: MagentoProductNode): CatalogProduct {
  const money = mapMoney(raw?.price_range?.minimum_price?.final_price ?? raw?.price_range?.minimum_price?.regular_price);
  return {
    id: String(raw?.uid ?? raw?.id ?? raw?.sku ?? ""),
    sku: String(raw?.sku ?? ""),
    name: String(raw?.name ?? ""),
    urlKey: String(raw?.url_key ?? ""),
    imageUrl: raw?.small_image?.url ?? null,
    price: money.value,
    currency: money.currency
  };
}

export function mapProductDetail(raw: MagentoProductNode): ProductDetail {
  const base = mapCatalogProduct(raw);
  return {
    ...base,
    descriptionHtml: typeof raw?.description?.html === "string" ? raw.description.html : null,
    shortDescriptionHtml: typeof raw?.short_description?.html === "string" ? raw.short_description.html : null
  };
}

function mapCartItem(item: MagentoCartItemNode) {
  const rowTotal = mapMoney(item?.prices?.row_total_including_tax ?? item?.prices?.row_total);
  return {
    uid: String(item?.uid ?? ""),
    sku: String(item?.product?.sku ?? ""),
    name: String(item?.product?.name ?? ""),
    imageUrl: typeof item?.product?.small_image?.url === "string" ? item.product.small_image.url : null,
    urlKey: typeof item?.product?.url_key === "string" && item.product.url_key.trim().length > 0
      ? item.product.url_key
      : null,
    quantity: Number(item?.quantity ?? 0),
    lineTotal: rowTotal.value,
    currency: rowTotal.currency
  };
}

export function mapCart(raw: MagentoCartNode): CartSnapshot {
  const totals = mapMoney(raw?.prices?.grand_total);
  const items = Array.isArray(raw?.items)
    ? raw.items.map(mapCartItem)
    : [];

  return {
    id: String(raw?.id ?? ""),
    totalQuantity: Number(raw?.total_quantity ?? 0),
    grandTotal: totals.value,
    currency: totals.currency,
    items
  };
}

export function mapCustomer(raw: MagentoCustomerNode): CustomerProfile {
  return {
    email: String(raw?.email ?? ""),
    firstname: String(raw?.firstname ?? ""),
    lastname: String(raw?.lastname ?? "")
  };
}

function mapCustomerAddress(raw: NonNullable<MagentoCustomerNode["addresses"]>[number]): CustomerAddress {
  const street = mapStreetLines(raw?.street);
  return {
    id: String(raw?.id ?? ""),
    firstname: String(raw?.firstname ?? ""),
    lastname: String(raw?.lastname ?? ""),
    street,
    city: String(raw?.city ?? ""),
    postcode: String(raw?.postcode ?? ""),
    countryCode: String(raw?.country_code ?? ""),
    telephone: String(raw?.telephone ?? ""),
    region: typeof raw?.region?.region === "string" ? raw.region.region : null,
    regionCode: typeof raw?.region?.region_code === "string" ? raw.region.region_code : null,
    defaultShipping: Boolean(raw?.default_shipping),
    defaultBilling: Boolean(raw?.default_billing)
  };
}

function mapCustomerOrder(raw: NonNullable<NonNullable<MagentoCustomerNode["orders"]>["items"]>[number]): CustomerOrderSummary {
  const grandTotal = mapMoney(raw?.total?.grand_total);
  return {
    number: String(raw?.number ?? ""),
    orderDate: String(raw?.order_date ?? ""),
    status: String(raw?.status ?? ""),
    grandTotal: grandTotal.value,
    currency: grandTotal.currency
  };
}

function mapCustomerWishlistSummary(raw: NonNullable<MagentoCustomerNode["wishlists"]>[number]): CustomerWishlistSummary {
  return {
    id: String(raw?.id ?? ""),
    itemsCount: Number(raw?.items_count ?? 0),
    updatedAt: typeof raw?.updated_at === "string" ? raw.updated_at : null
  };
}

export function mapCustomerDashboard(raw: MagentoCustomerNode): CustomerDashboard {
  const addresses = Array.isArray(raw?.addresses) ? raw.addresses.map(mapCustomerAddress) : [];
  const orders = Array.isArray(raw?.orders?.items)
    ? raw.orders.items.map(mapCustomerOrder).filter((order) => order.number.length > 0)
    : [];
  const wishlists = Array.isArray(raw?.wishlists) ? raw.wishlists.map(mapCustomerWishlistSummary) : [];

  return {
    profile: mapCustomer(raw),
    isSubscribed: Boolean(raw?.is_subscribed),
    defaultBillingId: raw?.default_billing == null ? null : String(raw.default_billing),
    defaultShippingId: raw?.default_shipping == null ? null : String(raw.default_shipping),
    addresses,
    totalOrderCount: Number(raw?.orders?.total_count ?? 0),
    orders,
    wishlists
  };
}

function mapStreetLines(street: Array<string | null> | null | undefined): string[] {
  return Array.isArray(street)
    ? street.filter((line): line is string => typeof line === "string" && line.trim().length > 0)
    : [];
}

function mapCustomerOrderItem(raw: NonNullable<NonNullable<NonNullable<MagentoCustomerNode["orders"]>["items"]>[number]["items"]>[number]): CustomerOrderItem {
  const price = mapMoney(raw?.product_sale_price);
  return {
    id: String(raw?.id ?? ""),
    productName: String(raw?.product_name ?? ""),
    productSku: String(raw?.product_sku ?? ""),
    productUrlKey: typeof raw?.product_url_key === "string" ? raw.product_url_key : null,
    quantityOrdered: Number(raw?.quantity_ordered ?? 0),
    status: typeof raw?.status === "string" ? raw.status : null,
    salePrice: price.value,
    currency: price.currency
  };
}

function mapCustomerOrderAddress(raw: NonNullable<NonNullable<MagentoCustomerNode["orders"]>["items"]>[number]["billing_address"]): CustomerOrderAddress {
  return {
    firstname: String(raw?.firstname ?? ""),
    lastname: String(raw?.lastname ?? ""),
    street: mapStreetLines(raw?.street),
    city: String(raw?.city ?? ""),
    region: typeof raw?.region === "string" ? raw.region : null,
    postcode: String(raw?.postcode ?? ""),
    countryCode: String(raw?.country_code ?? ""),
    telephone: String(raw?.telephone ?? "")
  };
}

export function mapCustomerOrderDetail(raw: NonNullable<NonNullable<MagentoCustomerNode["orders"]>["items"]>[number]): CustomerOrderDetail {
  const summary = mapCustomerOrder(raw);
  const items = Array.isArray(raw?.items)
    ? raw.items.map(mapCustomerOrderItem).filter((item) => item.id.length > 0)
    : [];

  return {
    ...summary,
    shippingMethod: typeof raw?.shipping_method === "string" ? raw.shipping_method : null,
    items,
    billingAddress: raw?.billing_address ? mapCustomerOrderAddress(raw.billing_address) : null,
    shippingAddress: raw?.shipping_address ? mapCustomerOrderAddress(raw.shipping_address) : null
  };
}

export function mapCustomerWishlist(raw: NonNullable<MagentoCustomerNode["wishlists"]>[number]): CustomerWishlist {
  const items = Array.isArray(raw?.items_v2?.items)
    ? raw.items_v2.items.map((item): CustomerWishlistItem => ({
      id: String(item?.id ?? ""),
      quantity: Number(item?.quantity ?? 0),
      addedAt: String(item?.added_at ?? ""),
      product: item?.product ? mapCatalogProduct(item.product) : null
    })).filter((item) => item.id.length > 0)
    : [];
  return {
    id: String(raw?.id ?? ""),
    itemsCount: Number(raw?.items_count ?? 0),
    updatedAt: typeof raw?.updated_at === "string" ? raw.updated_at : null,
    items,
    currentPage: Number(raw?.items_v2?.page_info?.current_page ?? 1),
    totalPages: Number(raw?.items_v2?.page_info?.total_pages ?? 1)
  };
}

export function mapDownloadableProduct(raw: {
  date?: string | null;
  download_url?: string | null;
  order_increment_id?: string | null;
  remaining_downloads?: string | null;
  status?: string | null;
}): DownloadableProduct {
  return {
    orderIncrementId: String(raw?.order_increment_id ?? ""),
    date: String(raw?.date ?? ""),
    status: String(raw?.status ?? ""),
    remainingDownloads: typeof raw?.remaining_downloads === "string" ? raw.remaining_downloads : null,
    downloadUrl: typeof raw?.download_url === "string" ? raw.download_url : null
  };
}

export function mapCustomerPaymentToken(raw: {
  details?: string | null;
  payment_method_code?: string | null;
  public_hash?: string | null;
  type?: string | null;
}): CustomerPaymentToken {
  return {
    details: typeof raw?.details === "string" ? raw.details : null,
    paymentMethodCode: String(raw?.payment_method_code ?? ""),
    publicHash: String(raw?.public_hash ?? ""),
    type: String(raw?.type ?? "")
  };
}

export function mapCustomerProductReview(raw: {
  average_rating?: number | null;
  created_at?: string | null;
  nickname?: string | null;
  summary?: string | null;
  text?: string | null;
  product?: MagentoProductNode | null;
}): CustomerProductReview {
  return {
    averageRating: typeof raw?.average_rating === "number" ? raw.average_rating : null,
    createdAt: String(raw?.created_at ?? ""),
    nickname: typeof raw?.nickname === "string" ? raw.nickname : null,
    summary: typeof raw?.summary === "string" ? raw.summary : null,
    text: typeof raw?.text === "string" ? raw.text : null,
    product: raw?.product ? mapCatalogProduct(raw.product) : null
  };
}
