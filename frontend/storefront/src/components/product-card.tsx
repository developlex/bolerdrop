import Link from "next/link";
import type { CatalogProduct } from "@/src/lib/commerce/types";
import { ui } from "@/src/ui/styles";

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className={ui.surface.card}>
      <Link href={`/product/${product.urlKey}`} className="no-underline hover:no-underline">
        <div className="mb-3 aspect-square overflow-hidden rounded bg-gray-100">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className={ui.surface.mediaPlaceholder}>No image</div>
          )}
        </div>
        <h2 className="line-clamp-2 text-base font-medium text-ink">{product.name}</h2>
      </Link>
      <p className={ui.text.subtitle + " mt-2"}>SKU: {product.sku}</p>
      <p className="mt-2 text-base font-semibold text-ink">
        {product.price !== null && product.currency ? `${product.currency} ${product.price.toFixed(2)}` : "Price unavailable"}
      </p>
    </article>
  );
}
