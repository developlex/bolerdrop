import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions/account";
import { ui } from "@/src/ui/styles";
import type { CustomerDashboard } from "@/src/lib/commerce/types";

export type AccountSectionKey =
  | "dashboard"
  | "orders"
  | "downloads"
  | "wishlist"
  | "addresses"
  | "edit"
  | "payments"
  | "reviews"
  | "newsletter";

type AccountShellProps = {
  dashboard: CustomerDashboard;
  active: AccountSectionKey;
  children: ReactNode;
};

type NavItem = {
  key: AccountSectionKey;
  href: string;
  label: string;
  count?: number;
};

function navItems(dashboard: CustomerDashboard): NavItem[] {
  const wishlistItems = dashboard.wishlists.reduce((sum, wishlist) => sum + wishlist.itemsCount, 0);
  return [
    { key: "dashboard", href: "/account", label: "My Account" },
    { key: "orders", href: "/account/orders", label: "My Orders", count: dashboard.totalOrderCount },
    { key: "downloads", href: "/account/downloads", label: "My Downloadable Products" },
    { key: "wishlist", href: "/account/wishlist", label: "My Wish List", count: wishlistItems },
    { key: "addresses", href: "/account/addresses", label: "Address Book" },
    { key: "edit", href: "/account/edit", label: "Account Information" },
    { key: "payments", href: "/account/payments", label: "Stored Payment Methods" },
    { key: "reviews", href: "/account/reviews", label: "My Product Reviews" },
    { key: "newsletter", href: "/account/newsletter", label: "Newsletter Subscriptions" }
  ];
}

export function AccountShell({ dashboard, active, children }: AccountShellProps) {
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className={ui.surface.panel}>
          <h2 className={ui.text.label}>My Account</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {navItems(dashboard).map((item) => {
              const isActive = item.key === active;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={
                      isActive
                        ? "block rounded-lg bg-[rgba(190,79,46,0.14)] px-3 py-2 font-semibold text-ink no-underline"
                        : "block rounded-lg px-3 py-2 text-steel transition-colors hover:bg-black/5 hover:text-ink no-underline"
                    }
                  >
                    {item.label}
                    {typeof item.count === "number" ? ` (${item.count})` : ""}
                  </Link>
                </li>
              );
            })}
          </ul>
          <form action={logoutAction} className="mt-5">
            <button type="submit" className={ui.action.buttonSecondary + " w-full"}>
              Sign out
            </button>
          </form>
        </aside>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </section>
  );
}
