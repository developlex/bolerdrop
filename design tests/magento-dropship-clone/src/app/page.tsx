import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string; // emoji / simple placeholder
};

const products: Product[] = [
  { id: "p1", name: "Wireless Earbuds", price: "$29.99", image: "🎧" },
  { id: "p2", name: "Smart Watch", price: "$45.99", image: "⌚" },
  { id: "p3", name: "Aroma Diffuser", price: "$34.99", image: "💨" },
  { id: "p4", name: "Portable Blender", price: "$39.99", image: "🥤" },
  { id: "p5", name: "LED Ring Light", price: "$24.99", image: "💡" },
  { id: "p6", name: "Fitness Tracker", price: "$19.99", image: "📟" },
  { id: "p7", name: "Electric Massager", price: "$49.99", image: "🧖" },
  { id: "p8", name: "Travel Backpack", price: "$44.99", image: "🎒" },
];

function IconTruck(props: React.SVGProps<SVGSVGElement>) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
            d="M3 7h11v10H3V7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M14 10h4l3 3v4h-7v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M7 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
        />
      </svg>
  );
}
function IconShield(props: React.SVGProps<SVGSVGElement>) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
            d="M12 3 20 7v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M9.5 12.2 11.2 14 15 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
  );
}
function IconHeadset(props: React.SVGProps<SVGSVGElement>) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
            d="M4 12a8 8 0 0 1 16 0v6a2 2 0 0 1-2 2h-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
        <path
            d="M4 13v3a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M20 13v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
      </svg>
  );
}

export default function Page() {
  return (
      <main className="min-h-screen bg-white">
        {/* Top bar */}
        <div className="border-b border-line bg-white/90">
          <div className="container-page py-2 text-center text-sm text-muted">
            Free Shipping on All Orders!
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-line bg-white/80 backdrop-blur">
          <div className="container-page flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-white shadow-sm">
                {/* simple mark */}
                <span className="text-lg font-black">M</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-wide">
                  MAGENTO <span className="font-medium text-muted">DROPSHIP</span>
                </div>
              </div>
            </Link>

            {/* Nav */}
            <nav className="hidden items-center gap-8 md:flex">
              {["Home", "Shop", "About Us", "Contact"].map((item) => (
                  <Link
                      key={item}
                      href="#"
                      className={`text-sm font-medium ${
                          item === "Home"
                              ? "text-ink"
                              : "text-muted hover:text-ink"
                      }`}
                  >
                    {item}
                  </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button className="hidden rounded-full border border-line bg-white px-3 py-1.5 text-sm text-muted hover:text-ink md:inline-flex">
                Login
              </button>
              <button
                  aria-label="Wishlist"
                  className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-muted hover:text-ink"
              >
                ❤
              </button>
              <button
                  aria-label="Cart"
                  className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-muted hover:text-ink"
              >
                🛒
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* blurred hero background */}
          <div className="absolute inset-0">
            <div className="h-full w-full bg-gradient-to-b from-neutral-100 via-white to-white" />
            <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_20%,#ffffff_0%,transparent_55%),radial-gradient(circle_at_80%_40%,#ffffff_0%,transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(0,0,0,.04)_50%,transparent_100%)]" />
          </div>

          <div className="container-page relative py-14 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
                Discover The <span className="text-brand-600">Best</span> Deals For
                Your Lifestyle
              </h1>

              <div className="mt-4 flex items-center justify-center gap-4 text-muted">
                <span className="h-px w-16 bg-line" />
                <p className="text-sm md:text-base">
                  Shop Quality Products at Unbeatable Prices.
                </p>
                <span className="h-px w-16 bg-line" />
              </div>

              <div className="mt-8 flex justify-center">
                <Link href="#products" className="btn-brand">
                  Shop Now <span aria-hidden>›</span>
                </Link>
              </div>
            </div>

            {/* Feature strip */}
            <div className="mt-12 rounded-xl border border-line bg-white/70 shadow-soft backdrop-blur">
              <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
                <Feature
                    icon={<IconTruck className="h-7 w-7" />}
                    title="Free Shipping"
                    desc="On All Orders"
                />
                <Feature
                    icon={<IconShield className="h-7 w-7" />}
                    title="Money Back Guarantee"
                    desc="30-Day Refund Policy"
                />
                <Feature
                    icon={<IconHeadset className="h-7 w-7" />}
                    title="24/7 Support"
                    desc="We're Here to Help"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="py-10 md:py-14">
          <div className="container-page">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="pb-16">
          <div className="container-page">
            <div className="rounded-2xl border border-line bg-panel px-6 py-8 shadow-soft md:px-10">
              <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight md:text-2xl">
                    Sign Up &amp; Get{" "}
                    <span className="text-brand-700">10% Off</span> Your First
                    Order!
                  </h3>
                </div>

                <form
                    className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      // Demo only
                      alert("Subscribed! (demo)");
                    }}
                >
                  <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none ring-brand-500/30 placeholder:text-muted focus:ring-4"
                  />
                  <button className="btn-brand h-12 whitespace-nowrap">
                    Subscribe <span aria-hidden>›</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-line py-8">
          <div className="container-page text-center text-sm text-muted">
            © {new Date().getFullYear()} Magento Dropship — Demo UI
          </div>
        </footer>
      </main>
  );
}

function Feature({
                   icon,
                   title,
                   desc,
                 }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
      <div className="flex items-center gap-4 px-6 py-5">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-brand-600 shadow-sm">
          {icon}
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-ink">{title}</div>
          <div className="text-sm text-muted">{desc}</div>
        </div>
      </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
      <div className="group overflow-hidden rounded-xl border border-line bg-white shadow-soft transition hover:shadow-card">
        <div className="px-5 pt-5">
          <div className="text-base font-semibold text-ink">{product.name}</div>
          <div className="mt-1 text-lg font-extrabold text-brand-700">
            {product.price}
          </div>
        </div>

        <div className="mt-3 px-5">
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-neutral-100 to-white">
            {/* Replace with real product images later */}
            <div className="text-6xl drop-shadow-sm">{product.image}</div>

            {/* subtle “photo” highlight */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_30%_30%,rgba(255,255,255,.75)_0%,transparent_55%)]" />
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          <button className="btn-brand-sm w-full">
            Shop Now <span aria-hidden>›</span>
          </button>
        </div>
      </div>
  );
}
