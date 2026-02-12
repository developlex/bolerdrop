import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect, requireAccountToken } from "@/app/account/_lib";
import { getCustomerOrderByNumber } from "@/src/lib/commerce/customer";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Order Details | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

function toMoney(value: number | null, currency: string | null): string {
  if (value === null || !currency) {
    return "n/a";
  }
  return `${value.toFixed(2)} ${currency}`;
}

function formatOrderDate(value: string): string {
  if (!value) {
    return "n/a";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function renderAddress(address: {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  region: string | null;
  postcode: string;
  countryCode: string;
  telephone: string;
} | null) {
  if (!address) {
    return <p className={ui.text.subtitle}>n/a</p>;
  }
  const lines = [
    `${address.firstname} ${address.lastname}`.trim(),
    ...address.street,
    [address.city, address.region, address.postcode].filter(Boolean).join(", "),
    address.countryCode,
    address.telephone ? `T: ${address.telephone}` : ""
  ].filter((line) => line && line.trim().length > 0);

  return (
    <address className={ui.text.subtitle + " not-italic"}>
      {lines.map((line, index) => (
        <div key={`${line}-${index}`}>{line}</div>
      ))}
    </address>
  );
}

export default async function AccountOrderDetailsPage({
  params
}: {
  params: Promise<{ number: string }>;
}) {
  const token = await requireAccountToken();
  const { number } = await params;
  const decodedNumber = decodeURIComponent(number);
  const [dashboard, order] = await Promise.all([
    getDashboardOrRedirect(),
    getCustomerOrderByNumber(token, decodedNumber)
  ]);

  if (!order) {
    notFound();
  }

  return (
    <AccountShell dashboard={dashboard} active="orders">
      <section className={ui.surface.panelLg}>
        <div className="flex items-center justify-between gap-3">
          <h1 className={ui.text.pageTitle}>Order #{order.number}</h1>
          <Link href="/account/orders" className={ui.text.link}>Back to orders</Link>
        </div>
        <p className={ui.text.subtitle + " mt-2"}>
          {formatOrderDate(order.orderDate)} · {order.status || "n/a"} · {toMoney(order.grandTotal, order.currency)}
        </p>
      </section>

      <section className={ui.surface.panel}>
        <h2 className={ui.text.value}>Items</h2>
        {order.items.length === 0 ? (
          <p className={ui.text.subtitle + " mt-3"}>No order items available.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left">
                  <th className="px-2 py-2">Product</th>
                  <th className="px-2 py-2">SKU</th>
                  <th className="px-2 py-2">Qty</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-black/10">
                    <td className="px-2 py-2 text-ink">{item.productName || "n/a"}</td>
                    <td className="px-2 py-2 text-steel">{item.productSku || "n/a"}</td>
                    <td className="px-2 py-2 text-steel">{item.quantityOrdered}</td>
                    <td className="px-2 py-2 text-steel">{item.status || "n/a"}</td>
                    <td className="px-2 py-2 text-steel">{toMoney(item.salePrice, item.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={ui.surface.panel}>
          <h2 className={ui.text.value + " mb-3"}>Billing Address</h2>
          {renderAddress(order.billingAddress)}
        </div>
        <div className={ui.surface.panel}>
          <h2 className={ui.text.value + " mb-3"}>Shipping Address</h2>
          {renderAddress(order.shippingAddress)}
        </div>
      </section>

      <section className={ui.surface.panel}>
        <h2 className={ui.text.value}>Shipping Method</h2>
        <p className={ui.text.subtitle + " mt-2"}>{order.shippingMethod || "n/a"}</p>
      </section>
    </AccountShell>
  );
}
