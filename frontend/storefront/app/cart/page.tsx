import Link from "next/link";
import { cookies } from "next/headers";
import { getCart } from "@/src/lib/commerce/cart";
import { ui } from "@/src/ui/styles";

export default async function CartPage() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart_id")?.value;

  if (!cartId) {
    return (
      <section>
        <h1 className={ui.text.pageTitle}>Cart</h1>
        <p className={ui.text.subtitle + " mt-4"}>Your cart is empty.</p>
        <Link href="/" className={ui.text.link + " mt-4"}>
          Continue shopping
        </Link>
      </section>
    );
  }

  let cart;
  try {
    cart = await getCart(cartId);
  } catch {
    return (
      <section>
        <h1 className={ui.text.pageTitle}>Cart</h1>
        <p className={ui.text.subtitle + " mt-4"}>Cart could not be loaded. Create a new cart by adding an item from product pages.</p>
        <Link href="/" className={ui.text.link + " mt-4"}>
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h1 className={ui.text.pageTitle}>Cart</h1>
      <p className={ui.text.subtitle + " mt-2"}>Items: {cart.totalQuantity}</p>
      <div className="mt-6 space-y-3">
        {cart.items.map((item) => (
          <article key={item.uid} className={ui.surface.panel}>
            <h2 className={ui.text.value}>{item.name}</h2>
            <p className={ui.text.subtitle}>SKU: {item.sku}</p>
            <p className={ui.text.subtitle}>Qty: {item.quantity}</p>
            <p className={ui.text.body + " text-sm"}>
              {item.lineTotal !== null && item.currency ? `${item.currency} ${item.lineTotal.toFixed(2)}` : "Line total unavailable"}
            </p>
          </article>
        ))}
      </div>
      <div className={ui.surface.panel + " mt-6"}>
        <p className={ui.text.value}>
          Grand total: {cart.grandTotal !== null && cart.currency ? `${cart.currency} ${cart.grandTotal.toFixed(2)}` : "Unavailable"}
        </p>
        <p className={ui.text.subtitle + " mt-2"}>Checkout flow integration is the next implementation slice.</p>
      </div>
    </section>
  );
}
