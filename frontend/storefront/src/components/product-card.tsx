import Link from "next/link";
import { addToWishlistAction } from "@/app/actions/wishlist";
import type { CatalogProduct } from "@/src/lib/commerce/types";
import { ui } from "@/src/ui/styles";

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className={ui.surface.card + " flex h-full flex-col"}>
      <Link href={`/product/${product.urlKey}`} className="no-underline hover:no-underline">
        <div className="mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-sand">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain bg-white p-2"
            />
          ) : (
            <div className={ui.surface.mediaPlaceholder}>No image</div>
          )}
        </div>
        <h2 className="line-clamp-3 h-[3.9rem] text-base leading-tight text-ink">{product.name}</h2>
      </Link>
      <p className="mt-2 text-base font-semibold text-ink">
        {product.price !== null && product.currency ? `${product.currency} ${product.price.toFixed(2)}` : "Price unavailable"}
      </p>
      <div className="mt-auto pt-4">
        <Link href={`/product/${product.urlKey}`} className={ui.action.buttonPrimary + " w-full"}>
          View product
        </Link>
        <form action={addToWishlistAction} className="mt-2">
          <input type="hidden" name="sku" value={product.sku} />
          <input type="hidden" name="quantity" value="1" />
          <input type="hidden" name="return_to" value="/account/wishlist" />
          <button type="submit" className={ui.action.buttonSecondary + " w-full"}>
            Add to wish list
          </button>
        </form>
      </div>
    </article>
  );
}
