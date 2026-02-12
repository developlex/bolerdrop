import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect } from "@/app/account/_lib";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "My Account | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  registered?: string | string[];
};

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

function formatAddress(address: {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  postcode: string;
  countryCode: string;
  telephone: string;
  region: string | null;
}): string[] {
  const lines: string[] = [];
  lines.push(`${address.firstname} ${address.lastname}`.trim());
  lines.push(...address.street);
  const locality = [address.city, address.region, address.postcode].filter((value) => value && value.trim().length > 0).join(", ");
  if (locality) {
    lines.push(locality);
  }
  if (address.countryCode) {
    lines.push(address.countryCode);
  }
  if (address.telephone) {
    lines.push(`T: ${address.telephone}`);
  }
  return lines.filter((line) => line.trim().length > 0);
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

function toMoney(value: number | null, currency: string | null): string {
  if (value === null || !currency) {
    return "n/a";
  }
  return `${value.toFixed(2)} ${currency}`;
}

export default async function AccountPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const registrationNotice = firstValue(resolvedSearchParams?.registered) === "1";
  const dashboard = await getDashboardOrRedirect();

  const defaultBilling = dashboard.addresses.find((address) => address.defaultBilling || address.id === dashboard.defaultBillingId) ?? null;
  const defaultShipping = dashboard.addresses.find((address) => address.defaultShipping || address.id === dashboard.defaultShippingId) ?? null;

  return (
    <AccountShell dashboard={dashboard} active="dashboard">
      <section className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>My Account</h1>
        {registrationNotice ? (
          <p className={ui.state.success + " mt-4"}>Account created successfully.</p>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className={ui.surface.panel}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className={ui.text.value}>Account Information</p>
              <Link href="/account/edit" className={ui.text.link}>Edit</Link>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className={ui.text.label}>First name</dt>
                <dd className={ui.text.value}>{dashboard.profile.firstname}</dd>
              </div>
              <div>
                <dt className={ui.text.label}>Last name</dt>
                <dd className={ui.text.value}>{dashboard.profile.lastname}</dd>
              </div>
              <div>
                <dt className={ui.text.label}>Email</dt>
                <dd className={ui.text.value}>{dashboard.profile.email}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Link href="/account/password" className={ui.text.link}>Change Password</Link>
            </div>
          </div>

          <div className={ui.surface.panel}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className={ui.text.value}>Newsletters</p>
              <Link href="/account/newsletter" className={ui.text.link}>Manage</Link>
            </div>
            <p className={ui.text.subtitle + " mt-3"}>
              {dashboard.isSubscribed ? "Subscribed to newsletter." : "You are not subscribed to newsletter."}
            </p>
          </div>
        </div>
        <div className="my-6 border-t border-black/10" />

        <section className={ui.surface.panel}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className={ui.text.value}>Address Book</h2>
            <Link href="/account/addresses" className={ui.text.link}>Manage Addresses</Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className={ui.text.label}>Default Billing Address</p>
              {defaultBilling ? (
                <address className={ui.text.subtitle + " mt-2 not-italic"}>
                  {formatAddress(defaultBilling).map((line, index) => (
                    <div key={`${line}-${index}`}>{line}</div>
                  ))}
                </address>
              ) : (
                <p className={ui.text.subtitle + " mt-2"}>You have not set a default billing address.</p>
              )}
            </div>
            <div>
              <p className={ui.text.label}>Default Shipping Address</p>
              {defaultShipping ? (
                <address className={ui.text.subtitle + " mt-2 not-italic"}>
                  {formatAddress(defaultShipping).map((line, index) => (
                    <div key={`${line}-${index}`}>{line}</div>
                  ))}
                </address>
              ) : (
                <p className={ui.text.subtitle + " mt-2"}>You have not set a default shipping address.</p>
              )}
            </div>
          </div>
        </section>

        <div className="my-6 border-t border-black/10" />

        <section className={ui.surface.panel}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className={ui.text.value}>Recent Orders</h2>
            <Link href="/account/orders" className={ui.text.link}>View All</Link>
          </div>
          {dashboard.orders.length === 0 ? (
            <p className={ui.text.subtitle}>You have no recent orders.</p>
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
                  {dashboard.orders.map((order) => (
                    <tr key={order.number} className="border-b border-black/10">
                      <td className="px-2 py-2 font-medium text-ink">
                        <Link href={`/account/orders/${encodeURIComponent(order.number)}`} className={ui.text.link}>{order.number}</Link>
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
      </section>
    </AccountShell>
  );
}
