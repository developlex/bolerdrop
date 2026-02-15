const CART_COOKIE_BASE = "cart_id";
const CUSTOMER_TOKEN_COOKIE_BASE = "customer_token";

function normalizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveNamespaceFromStoreId(): string | null {
  const rawStoreId = process.env.STORE_ID;
  if (!rawStoreId) {
    return null;
  }
  const normalized = normalizeSegment(rawStoreId);
  return normalized.length > 0 ? normalized : null;
}

function resolveNamespaceFromStorefrontBaseUrl(): string | null {
  const rawBaseUrl = process.env.STOREFRONT_BASE_URL;
  if (!rawBaseUrl) {
    return null;
  }
  try {
    const parsed = new URL(rawBaseUrl);
    const hostWithPort = parsed.host;
    const normalized = normalizeSegment(hostWithPort);
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

export function getSessionCookieNamespace(): string {
  return resolveNamespaceFromStoreId() ?? resolveNamespaceFromStorefrontBaseUrl() ?? "default-store";
}

export function getScopedCookieName(baseName: string): string {
  return `${baseName}__${getSessionCookieNamespace()}`;
}

type CookieReadable = {
  get(name: string): { value: string } | undefined;
};

type CookieWritable = CookieReadable & {
  set(name: string, value: string, options: {
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
    path?: string;
    maxAge?: number;
    secure?: boolean;
  }): void;
  delete(name: string): void;
};

function readCookieWithFallback(cookieStore: CookieReadable, baseName: string): string | undefined {
  const scopedName = getScopedCookieName(baseName);
  const scopedValue = cookieStore.get(scopedName)?.value;
  if (scopedValue) {
    return scopedValue;
  }
  return cookieStore.get(baseName)?.value;
}

function setScopedCookie(cookieStore: CookieWritable, baseName: string, value: string, options: {
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  maxAge?: number;
  secure?: boolean;
}): void {
  const scopedName = getScopedCookieName(baseName);
  cookieStore.set(scopedName, value, options);
  if (scopedName !== baseName) {
    cookieStore.delete(baseName);
  }
}

function deleteScopedCookie(cookieStore: CookieWritable, baseName: string): void {
  const scopedName = getScopedCookieName(baseName);
  cookieStore.delete(scopedName);
  if (scopedName !== baseName) {
    cookieStore.delete(baseName);
  }
}

export function readCartCookie(cookieStore: CookieReadable): string | undefined {
  return readCookieWithFallback(cookieStore, CART_COOKIE_BASE);
}

export function readCustomerTokenCookie(cookieStore: CookieReadable): string | undefined {
  return readCookieWithFallback(cookieStore, CUSTOMER_TOKEN_COOKIE_BASE);
}

export function setCartCookie(
  cookieStore: CookieWritable,
  cartId: string,
  options: {
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
    path?: string;
    maxAge?: number;
    secure?: boolean;
  },
): void {
  setScopedCookie(cookieStore, CART_COOKIE_BASE, cartId, options);
}

export function setCustomerTokenCookie(
  cookieStore: CookieWritable,
  token: string,
  options: {
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
    path?: string;
    maxAge?: number;
    secure?: boolean;
  },
): void {
  setScopedCookie(cookieStore, CUSTOMER_TOKEN_COOKIE_BASE, token, options);
}

export function deleteCartCookie(cookieStore: CookieWritable): void {
  deleteScopedCookie(cookieStore, CART_COOKIE_BASE);
}

export function deleteCustomerTokenCookie(cookieStore: CookieWritable): void {
  deleteScopedCookie(cookieStore, CUSTOMER_TOKEN_COOKIE_BASE);
}
