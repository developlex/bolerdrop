import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect, requireAccountToken } from "@/app/account/_lib";
import { getCustomerOrders } from "@/src/lib/commerce/customer";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "My Orders | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

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

function toMoney(value: number | null, currency: string | null): string {
  if (value === null || !currency) {
    return "n/a";
  }
  return `${value.toFixed(2)} ${currency}`;
}

export default async function AccountOrdersPage() {
  const token = await requireAccountToken();
  const [dashboard, orders] = await Promise.all([
    getDashboardOrRedirect(),
    getCustomerOrders(token, 20, 1)
  ]);

  return (
    <AccountShell dashboard={dashboard} active="orders">
      <section className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>My Orders</h1>
        <p className={ui.text.subtitle + " mt-2"}>Orders are fetched from Magento customer account data.</p>
      </section>

      <section className={ui.surface.panel}>
        {orders.length === 0 ? (
          <p className={ui.text.subtitle}>You have no orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left">
                  <th className="px-2 py-2">Order #</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.number} className="border-b border-black/10">
                    <td className="px-2 py-2 font-medium text-ink">
                      <Link href={`/account/orders/${encodeURIComponent(order.number)}`} className={ui.text.link}>
                        {order.number}
                      </Link>
                    </td>
                    <td className="px-2 py-2 text-steel">{formatOrderDate(order.orderDate)}</td>
                    <td className="px-2 py-2 text-steel">{order.status || "n/a"}</td>
                    <td className="px-2 py-2 text-steel">{toMoney(order.grandTotal, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AccountShell>
  );
}
