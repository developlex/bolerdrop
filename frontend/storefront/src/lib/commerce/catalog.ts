import { commerceOperation, type GraphQLOperation } from "@/src/lib/commerce/client";
import { mapCatalogProduct, mapProductDetail } from "@/src/lib/commerce/mappers";
import { GET_PRODUCT_BY_URL_KEY_QUERY, LIST_PRODUCTS_QUERY } from "@/src/lib/commerce/queries";
import type { CatalogPage, CatalogProduct, MagentoProductNode, ProductDetail } from "@/src/lib/commerce/types";

type ListProductsResponse = {
  products: {
    items: MagentoProductNode[];
    total_count?: number | null;
    page_info?: {
      current_page?: number | null;
      total_pages?: number | null;
    } | null;
  };
};

type ProductByUrlKeyResponse = {
  products: {
    items: MagentoProductNode[];
  };
};

type ListProductsVariables = {
  search: string;
  pageSize: number;
  currentPage: number;
};

type ProductByUrlKeyVariables = {
  urlKey: string;
};

const LIST_PRODUCTS_OPERATION: GraphQLOperation<ListProductsResponse, ListProductsVariables> = {
  operationName: "ListProducts",
  query: LIST_PRODUCTS_QUERY
};

const PRODUCT_BY_URL_KEY_OPERATION: GraphQLOperation<ProductByUrlKeyResponse, ProductByUrlKeyVariables> = {
  operationName: "ProductByUrlKey",
  query: GET_PRODUCT_BY_URL_KEY_QUERY
};

function normalizePositiveInt(value: number, fallback: number): number {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export async function getCatalogPage(pageSize = 12, currentPage = 1): Promise<CatalogPage> {
  const safePageSize = normalizePositiveInt(pageSize, 12);
  const safeCurrentPage = normalizePositiveInt(currentPage, 1);

  const data = await commerceOperation(LIST_PRODUCTS_OPERATION, {
    search: "",
    pageSize: safePageSize,
    currentPage: safeCurrentPage
  });

  const products = (data.products.items || [])
    .map(mapCatalogProduct)
    .filter((item) => item.sku && item.urlKey);

  const totalCount = Math.max(0, Number(data.products.total_count ?? products.length));
  const normalizedCurrentPage = normalizePositiveInt(Number(data.products.page_info?.current_page ?? safeCurrentPage), safeCurrentPage);
  const normalizedTotalPages = normalizePositiveInt(Number(data.products.page_info?.total_pages ?? 1), 1);
  const clampedCurrentPage = Math.min(normalizedCurrentPage, normalizedTotalPages);

  return {
    products,
    totalCount,
    currentPage: clampedCurrentPage,
    totalPages: normalizedTotalPages,
    hasPreviousPage: clampedCurrentPage > 1,
    hasNextPage: clampedCurrentPage < normalizedTotalPages
  };
}

export async function getCatalogProducts(pageSize = 12, currentPage = 1): Promise<CatalogProduct[]> {
  const page = await getCatalogPage(pageSize, currentPage);
  return page.products;
}

export async function getProductByUrlKey(urlKey: string): Promise<ProductDetail | null> {
  const data = await commerceOperation(PRODUCT_BY_URL_KEY_OPERATION, { urlKey });
  const product = data.products.items[0];
  return product ? mapProductDetail(product) : null;
}
