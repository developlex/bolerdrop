import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart";
import { getProductByUrlKey } from "@/src/lib/commerce/catalog";
import { ui } from "@/src/ui/styles";

export async function generateMetadata({ params }: { params: { urlKey: string } }): Promise<Metadata> {
  const product = await getProductByUrlKey(params.urlKey);
  if (!product) {
    return { title: "Product not found" };
  }
  return {
    title: product.name,
    description: product.shortDescriptionHtml ? undefined : `Buy ${product.name} from BoilerDrop storefront`
  };
}

export default async function ProductPage({ params }: { params: { urlKey: string } }) {
  const product = await getProductByUrlKey(params.urlKey);

  if (!product) {
    notFound();
  }

  return (
    <article className={ui.grid.product}>
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
