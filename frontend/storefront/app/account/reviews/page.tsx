import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect, requireAccountToken } from "@/app/account/_lib";
import { getCustomerProductReviews } from "@/src/lib/commerce/customer";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "My Product Reviews | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccountReviewsPage() {
  const token = await requireAccountToken();
  const [dashboard, reviews] = await Promise.all([
    getDashboardOrRedirect(),
    getCustomerProductReviews(token)
  ]);

  return (
    <AccountShell dashboard={dashboard} active="reviews">
      <section className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>My Product Reviews</h1>
        <p className={ui.text.subtitle + " mt-2"}>Review history is loaded from Magento customer review data.</p>
      </section>

      <section className={ui.surface.panel}>
        {reviews.length === 0 ? (
          <p className={ui.text.subtitle}>No product reviews found.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, index) => (
              <article key={`${review.createdAt}-${index}`} className="rounded-xl border border-black/10 bg-white/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {review.product?.urlKey ? (
                    <Link href={`/product/${review.product.urlKey}`} className={ui.text.link}>
                      {review.product.name || review.product.sku}
                    </Link>
                  ) : (
                    <p className={ui.text.value}>{review.product?.name || review.product?.sku || "Unknown product"}</p>
                  )}
                  <p className={ui.text.subtitle}>Rating: {review.averageRating ?? "n/a"}</p>
                </div>
                {review.summary ? <p className={ui.text.value + " mt-2"}>{review.summary}</p> : null}
                {review.text ? <p className={ui.text.subtitle + " mt-1"}>{review.text}</p> : null}
                <p className={ui.text.subtitle + " mt-2"}>{review.createdAt || "n/a"}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </AccountShell>
  );
}
