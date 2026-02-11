import { commerceGraphQL } from "@/src/lib/commerce/client";
import { mapCatalogProduct, mapProductDetail } from "@/src/lib/commerce/mappers";
import { GET_PRODUCT_BY_URL_KEY_QUERY, LIST_PRODUCTS_QUERY } from "@/src/lib/commerce/queries";
import type { CatalogProduct, MagentoProductNode, ProductDetail } from "@/src/lib/commerce/types";

type ListProductsResponse = {
  products: {
    items: MagentoProductNode[];
  };
};

type ProductByUrlKeyResponse = {
  products: {
    items: MagentoProductNode[];
  };
};

export async function getCatalogProducts(pageSize = 12, currentPage = 1): Promise<CatalogProduct[]> {
  const data = await commerceGraphQL<ListProductsResponse>(LIST_PRODUCTS_QUERY, {
    search: "",
    pageSize,
    currentPage,
  });
  return (data.products.items || []).map(mapCatalogProduct).filter((item) => item.sku && item.urlKey);
}

export async function getProductByUrlKey(urlKey: string): Promise<ProductDetail | null> {
  const data = await commerceGraphQL<ProductByUrlKeyResponse>(GET_PRODUCT_BY_URL_KEY_QUERY, { urlKey });
  const product = data.products.items[0];
  return product ? mapProductDetail(product) : null;
}
