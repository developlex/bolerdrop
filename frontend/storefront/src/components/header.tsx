"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/src/components/theme-switcher";
import type { StorefrontThemeId } from "@/src/themes/themes";
import { ui } from "@/src/ui/styles";

type HeaderCartItemPreview = {
  uid: string;
  name: string;
  quantity: number;
  lineTotal: number | null;
  currency: string | null;
};

type HeaderCartPreview = {
  totalQuantity: number;
  grandTotal: number | null;
  currency: string | null;
  items: HeaderCartItemPreview[];
};

type HeaderProps = {
  activeThemeId: StorefrontThemeId;
  cartPreview: HeaderCartPreview | null;
};

function formatMoney(value: number | null, currency: string | null): string {
  if (value == null) {
    return "USD 0.00";
  }
  if (!currency) {
    return value.toFixed(2);
  }
  return `${currency} ${value.toFixed(2)}`;
}

export function Header({ activeThemeId, cartPreview }: HeaderProps) {
  const pathname = usePathname() || "/";
  const isHomeActive = pathname === "/" || pathname.startsWith("/page/") || pathname.startsWith("/product/");
  const isCartActive = pathname.startsWith("/cart") || pathname.startsWith("/checkout") || pathname.startsWith("/order/confirmation");
  const isAccountActive = pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register");
  const cartQuantity = cartPreview?.totalQuantity ?? 0;
  const activeNavClass = "bg-[rgba(190,79,46,0.14)] text-ink";

  return (
    <>
      <div className="site-topbar relative z-40">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-steel sm:px-6 lg:px-8">
          <span>Free shipping on local demo orders</span>
          <ThemeSwitcher activeThemeId={activeThemeId} />
        </div>
      </div>
      <header className="site-header sticky top-0 z-40 backdrop-blur-md">
        <div className={ui.layout.headerWrap}>
          <Link href="/" className={ui.nav.brand}>
            BoilerDrop
          </Link>
          <nav className={ui.nav.header}>
            <Link href="/" className={`${ui.nav.navLink} ${isHomeActive ? activeNavClass : ""}`}>Home</Link>
            <div className="group relative">
              <Link href="/cart" className={`${ui.nav.navLink} ${isCartActive ? activeNavClass : ""} inline-flex items-center gap-2`}>
                <span>Cart</span>
                <span
                  aria-label={`Cart items: ${cartQuantity}`}
                  className="inline-flex min-w-6 items-center justify-center rounded-full bg-ink/90 px-2 py-0.5 text-[11px] font-semibold text-white"
                >
                  {cartQuantity}
                </span>
              </Link>
              <div className="pointer-events-none absolute right-0 top-[calc(100%+0.55rem)] z-50 hidden w-80 group-hover:block group-focus-within:block">
                <section className={`${ui.surface.panel} !bg-white !backdrop-blur-none pointer-events-auto space-y-3 p-4`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-steel">My Cart</p>
                    <p className="text-sm font-semibold text-ink">{cartQuantity} item{cartQuantity === 1 ? "" : "s"}</p>
                  </div>
                  {cartPreview && cartPreview.items.length > 0 ? (
                    <>
                      <ul className="space-y-2">
                        {cartPreview.items.map((item) => (
                          <li key={item.uid} className="rounded-xl border border-black/6 bg-white px-3 py-2">
                            <p className="line-clamp-2 text-sm text-ink">{item.name}</p>
                            <p className="mt-1 text-xs text-steel">
                              Qty {item.quantity} · {formatMoney(item.lineTotal, item.currency || cartPreview.currency)}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between border-t border-black/8 pt-2">
                        <span className="text-sm text-steel">Subtotal</span>
                        <span className="text-sm font-semibold text-ink">
                          {formatMoney(cartPreview.grandTotal, cartPreview.currency)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link href="/cart" className={`${ui.action.buttonSecondary} w-full`}>
                          View cart
                        </Link>
                        <Link href="/checkout#shipping" className={`${ui.action.buttonPrimary} w-full`}>
                          Checkout
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-black/6 bg-white px-3 py-3 text-sm text-steel">
                      Your cart is empty.
                    </div>
                  )}
                </section>
              </div>
            </div>
            <Link href="/account" className={`${ui.nav.navLink} ${isAccountActive ? activeNavClass : ""}`}>Account</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
