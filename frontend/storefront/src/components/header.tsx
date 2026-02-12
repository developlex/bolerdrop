"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/src/components/theme-switcher";
import type { StorefrontThemeId } from "@/src/themes/themes";
import { ui } from "@/src/ui/styles";

type HeaderProps = {
  activeThemeId: StorefrontThemeId;
};

export function Header({ activeThemeId }: HeaderProps) {
  const pathname = usePathname() || "/";
  const isHomeActive = pathname === "/" || pathname.startsWith("/page/") || pathname.startsWith("/product/");
  const isCartActive = pathname.startsWith("/cart") || pathname.startsWith("/order/confirmation");
  const isAccountActive = pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register");
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
            <Link href="/cart" className={`${ui.nav.navLink} ${isCartActive ? activeNavClass : ""}`}>Cart</Link>
            <Link href="/account" className={`${ui.nav.navLink} ${isAccountActive ? activeNavClass : ""}`}>Account</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
