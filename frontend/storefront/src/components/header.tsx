import Link from "next/link";
import { ui } from "@/src/ui/styles";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className={ui.layout.headerWrap}>
        <Link href="/" className={ui.nav.brand}>
          BoilerDrop Storefront
        </Link>
        <nav className={ui.nav.header}>
          <Link href="/" className={ui.nav.navLink}>Products</Link>
          <Link href="/cart" className={ui.nav.navLink}>Cart</Link>
          <Link href="/account" className={ui.nav.navLink}>Account</Link>
        </nav>
      </div>
    </header>
  );
}
