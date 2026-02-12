import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect, requireAccountToken } from "@/app/account/_lib";
import { getCustomerDownloadableProducts } from "@/src/lib/commerce/customer";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "My Downloadable Products | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccountDownloadsPage() {
  const token = await requireAccountToken();
  const [dashboard, products] = await Promise.all([
    getDashboardOrRedirect(),
    getCustomerDownloadableProducts(token)
  ]);

  return (
    <AccountShell dashboard={dashboard} active="downloads">
      <section className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>My Downloadable Products</h1>
        <p className={ui.text.subtitle + " mt-2"}>Download history is loaded from Magento customer downloads.</p>
      </section>

      <section className={ui.surface.panel}>
        {products.length === 0 ? (
          <p className={ui.text.subtitle}>No downloadable products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left">
                  <th className="px-2 py-2">Order #</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Remaining</th>
                  <th className="px-2 py-2">Download</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={`${product.orderIncrementId}-${product.date}`} className="border-b border-black/10">
                    <td className="px-2 py-2 text-steel">{product.orderIncrementId || "n/a"}</td>
                    <td className="px-2 py-2 text-steel">{product.date || "n/a"}</td>
                    <td className="px-2 py-2 text-steel">{product.status || "n/a"}</td>
                    <td className="px-2 py-2 text-steel">{product.remainingDownloads ?? "n/a"}</td>
                    <td className="px-2 py-2 text-steel">
                      {product.downloadUrl ? (
                        <Link href={product.downloadUrl} className={ui.text.link}>Download</Link>
                      ) : (
                        "n/a"
                      )}
                    </td>
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
