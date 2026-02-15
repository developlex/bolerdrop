import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart";
import { addToWishlistAction } from "@/app/actions/wishlist";
import { WishlistFlashCleaner } from "@/src/components/wishlist-flash-cleaner";
import { getProductByUrlKey } from "@/src/lib/commerce/catalog";
import { getCustomerWishlist } from "@/src/lib/commerce/customer";
import { readCustomerTokenCookie } from "@/src/lib/session-cookies";
import { absoluteStorefrontUrl, stripSourceTagsFromHtml, toMetaDescription } from "@/src/lib/seo";
import { ui } from "@/src/ui/styles";

type SearchParams = {
  wishlist?: string | string[];
  error?: string | string[];
};

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

function resolveWishlistMessage(searchParams?: SearchParams): { type: "success" | "error"; text: string } | null {
  const wishlistState = firstValue(searchParams?.wishlist);
  if (wishlistState === "added") {
    return { type: "success", text: "Product added to wish list." };
  }
  if (wishlistState === "already") {
    return { type: "success", text: "Product is already in your wish list." };
  }
  const errorCode = firstValue(searchParams?.error);
  if (!errorCode) {
    return null;
  }
  const byCode: Record<string, string> = {
    "wishlist-auth": "Sign in to manage your wish list.",
    "wishlist-invalid-sku": "Wishlist request is missing product SKU.",
    "wishlist-add-failed": "Unable to add product to wish list.",
    "wishlist-service-unavailable": "Wishlist service is temporarily unavailable."
  };
  return {
    type: "error",
    text: byCode[errorCode] ?? "Unable to update wish list."
  };
}

type ProductPageParams = {
  urlKey: string;
};

export async function generateMetadata({
  params
}: {
  params: Promise<ProductPageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductByUrlKey(resolvedParams.urlKey);
  if (!product) {
    return {
      title: "Product not found",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const canonicalPath = `/product/${encodeURIComponent(product.urlKey)}`;
  const sanitizedShortDescriptionHtml = stripSourceTagsFromHtml(product.shortDescriptionHtml);
  const sanitizedDescriptionHtml = stripSourceTagsFromHtml(product.descriptionHtml);
  const description = toMetaDescription(sanitizedShortDescriptionHtml) ?? toMetaDescription(sanitizedDescriptionHtml);

  return {
    title: `${product.name} | BoilerDrop Storefront`,
    description,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title: product.name,
      description,
      url: canonicalPath,
      images: product.imageUrl
        ? [{ url: absoluteStorefrontUrl(product.imageUrl) }]
        : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.imageUrl ? [absoluteStorefrontUrl(product.imageUrl)] : undefined
    }
  };
}

export default async function ProductPage({
  params,
  searchParams
}: {
  params: Promise<ProductPageParams>;
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedParams = await params;
  const product = await getProductByUrlKey(resolvedParams.urlKey);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const wishlistMessage = resolveWishlistMessage(resolvedSearchParams);

  if (!product) {
    notFound();
  }

  const cookieStore = await cookies();
  const customerToken = readCustomerTokenCookie(cookieStore);
  let isInWishlist = false;
  if (customerToken) {
    try {
      const wishlist = await getCustomerWishlist(customerToken, 100, 1);
      const normalizedSku = product.sku.trim().toLowerCase();
      isInWishlist = Boolean(
        wishlist?.items.some((item) => (item.product?.sku ?? "").trim().toLowerCase() === normalizedSku)
      );
    } catch {
      isInWishlist = false;
    }
  }

  const sanitizedDescriptionHtml = stripSourceTagsFromHtml(product.descriptionHtml);
  const productCanonicalPath = `/product/${encodeURIComponent(product.urlKey)}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    url: absoluteStorefrontUrl(productCanonicalPath),
    image: product.imageUrl ? [absoluteStorefrontUrl(product.imageUrl)] : undefined,
    description: toMetaDescription(sanitizedDescriptionHtml) ?? undefined,
    offers: product.price !== null && product.currency
      ? {
          "@type": "Offer",
          priceCurrency: product.currency,
          price: product.price.toFixed(2),
          availability: "https://schema.org/InStock",
          url: absoluteStorefrontUrl(productCanonicalPath)
        }
      : undefined
  };

  return (
    <article className="space-y-6">
      <WishlistFlashCleaner />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <nav aria-label="Breadcrumb" className={ui.text.subtitle}>
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className={ui.text.link}>Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/" className={ui.text.link}>Products</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">{product.name}</li>
        </ol>
      </nav>

      <section className={ui.surface.panelLg}>
        <div className={ui.grid.product + " items-stretch"}>
          <div className="aspect-square max-h-[42rem] overflow-hidden rounded-2xl bg-white p-3">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className={ui.surface.mediaPlaceholder + " h-full min-h-80"}>No image</div>
            )}
          </div>

          <div className="flex h-full flex-col">
            <h1 className="font-[family-name:var(--font-display)] text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
              {product.name}
            </h1>
            <p className={ui.text.subtitle + " mt-1"}>SKU: {product.sku}</p>

            <div className="border-y border-black/10 py-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div>
                  <p className={ui.text.price + " whitespace-nowrap"}>
                    {product.price !== null && product.currency ? `${product.currency} ${product.price.toFixed(2)}` : "Price unavailable"}
                  </p>
                </div>
                <div className="text-left sm:justify-self-end sm:text-right">
                  <p className={ui.text.value}>In stock</p>
                </div>
              </div>
            </div>
            <form action={addToCartAction} className="mt-3">
              <input type="hidden" name="sku" value={product.sku} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <label className="block text-sm">
                  <span className={ui.text.label + " mb-1 block"}>Qty</span>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    defaultValue={1}
                    className={ui.form.inputCompact + " w-20"}
                  />
                </label>
                <div className="text-left sm:justify-self-end sm:text-right">
                  <button type="submit" className={ui.action.buttonPrimary + " w-full sm:w-auto"}>
                    Add to cart
                  </button>
                </div>
              </div>
            </form>
            {wishlistMessage ? (
              <p className={(wishlistMessage.type === "success" ? ui.state.success : ui.state.warning) + " mt-3"}>
                {wishlistMessage.text}
              </p>
            ) : null}

            <div className="mt-auto space-y-2 pt-3">
              {isInWishlist ? (
                <p className="flex justify-end text-sm font-medium text-ember">
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M12 21s-6.5-4.1-9.1-7.5C.8 10.9 1.3 6.9 4.6 5.1c2.1-1.1 4.8-.5 6.4 1.4 1.6-1.9 4.3-2.5 6.4-1.4 3.3 1.8 3.8 5.8 1.7 8.4C18.5 16.9 12 21 12 21z" />
                    </svg>
                    In your wish list
                  </span>
                </p>
              ) : (
                <form action={addToWishlistAction} className="flex justify-end">
                  <input type="hidden" name="sku" value={product.sku} />
                  <input type="hidden" name="quantity" value="1" />
                  <input type="hidden" name="return_to" value={`/product/${product.urlKey}`} />
                  <button type="submit" className="inline-flex items-center gap-1 text-sm font-medium text-ember transition-colors hover:text-ocean hover:no-underline">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 21s-6.5-4.1-9.1-7.5C.8 10.9 1.3 6.9 4.6 5.1c2.1-1.1 4.8-.5 6.4 1.4 1.6-1.9 4.3-2.5 6.4-1.4 3.3 1.8 3.8 5.8 1.7 8.4C18.5 16.9 12 21 12 21z" />
                    </svg>
                    Add to wish list
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={ui.surface.panel}>
        <h2 className={ui.text.value}>Details</h2>
        {sanitizedDescriptionHtml ? (
          <div className={ui.misc.prose + " mt-3"} dangerouslySetInnerHTML={{ __html: sanitizedDescriptionHtml }} />
        ) : (
          <p className={ui.text.subtitle + " mt-3"}>No product details available.</p>
        )}
      </section>
    </article>
  );
}
