import { ProductCard } from "@/src/components/product-card";
import { getCatalogProducts } from "@/src/lib/commerce/catalog";
import { ui } from "@/src/ui/styles";

export const revalidate = 120;

export default async function HomePage() {
  const products = await getCatalogProducts(12, 1);

  return (
    <section>
      <h1 className={ui.text.pageTitle + " mb-6"}>Products</h1>
      {products.length === 0 ? (
        <p className={ui.state.warning}>
          No catalog data returned from Magento GraphQL.
        </p>
      ) : (
        <div className={ui.grid.catalog}>
          {products.map((product) => (
            <ProductCard key={product.id || product.sku} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
