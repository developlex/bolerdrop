import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart";
import { getProductByUrlKey } from "@/src/lib/commerce/catalog";
import { absoluteStorefrontUrl, toMetaDescription } from "@/src/lib/seo";
import { ui } from "@/src/ui/styles";

export async function generateMetadata({ params }: { params: { urlKey: string } }): Promise<Metadata> {
  const product = await getProductByUrlKey(params.urlKey);
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
  const description = toMetaDescription(product.shortDescriptionHtml) ?? toMetaDescription(product.descriptionHtml);

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

export default async function ProductPage({ params }: { params: { urlKey: string } }) {
  const product = await getProductByUrlKey(params.urlKey);

  if (!product) {
    notFound();
  }

  const productCanonicalPath = `/product/${encodeURIComponent(product.urlKey)}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    url: absoluteStorefrontUrl(productCanonicalPath),
    image: product.imageUrl ? [absoluteStorefrontUrl(product.imageUrl)] : undefined,
    description: toMetaDescription(product.descriptionHtml) ?? undefined,
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
    <article className={ui.grid.product}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className={ui.surface.media}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className={ui.surface.mediaPlaceholder + " h-96"}>No image</div>
        )}
      </div>
      <div>
        <h1 className={ui.text.heroTitle}>{product.name}</h1>
        <p className={ui.text.subtitle + " mt-2"}>SKU: {product.sku}</p>
        <p className={ui.text.price + " mt-4"}>
          {product.price !== null && product.currency ? `${product.currency} ${product.price.toFixed(2)}` : "Price unavailable"}
        </p>
        <form action={addToCartAction} className="mt-6 flex items-center gap-3">
          <input type="hidden" name="sku" value={product.sku} />
          <input
            type="number"
            name="quantity"
            min={1}
            defaultValue={1}
            className={ui.form.inputCompact}
          />
          <button type="submit" className={ui.action.buttonPrimary}>
            Add to cart
          </button>
        </form>
        {product.descriptionHtml ? (
          <div className={ui.misc.prose} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
        ) : null}
      </div>
    </article>
  );
}
