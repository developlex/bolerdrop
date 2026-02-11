export type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  urlKey: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
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

export type CustomerProfile = {
  email: string;
  firstname: string;
  lastname: string;
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
};

export type MagentoCustomerNode = {
  email?: string | null;
  firstname?: string | null;
  lastname?: string | null;
};
