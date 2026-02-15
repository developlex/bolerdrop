import Link from "next/link";
import { addToCartAction } from "@/app/actions/cart";
import { WishlistToggleButton } from "@/src/components/wishlist-toggle-button";
import type { CatalogProduct } from "@/src/lib/commerce/types";
import { ui } from "@/src/ui/styles";

type ProductCardProps = {
  product: CatalogProduct;
  isInWishlist?: boolean;
};

export function ProductCard({ product, isInWishlist = false }: ProductCardProps) {
  return (
    <article className={ui.surface.card + " relative flex h-full flex-col"}>
      <div className="absolute right-3 top-3 z-10">
        <WishlistToggleButton
          sku={product.sku}
          productName={product.name}
          initialInWishlist={isInWishlist}
        />
      </div>
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
        <form action={addToCartAction}>
          <input type="hidden" name="sku" value={product.sku} />
          <input type="hidden" name="quantity" value="1" />
          <button type="submit" className={ui.action.buttonPrimary + " w-full"}>
            Add to cart
          </button>
        </form>
      </div>
    </article>
  );
}
