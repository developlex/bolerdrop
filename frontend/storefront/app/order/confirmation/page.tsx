import type { Metadata } from "next";
import Link from "next/link";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Order Confirmation | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  order?: string | string[];
};

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

export function resolveOrderNumber(searchParams?: SearchParams): string | null {
  const raw = firstValue(searchParams?.order);
  if (!raw) {
    return null;
  }
  const value = raw.trim();
  return value.length > 0 ? value : null;
}

export default async function OrderConfirmationPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const orderNumber = resolveOrderNumber(resolvedSearchParams);

  return (
    <section className="mx-auto max-w-2xl">
      <div className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>Order confirmation</h1>
        {orderNumber ? (
          <p className={ui.state.success + " mt-4"}>Order placed successfully. Order number: {orderNumber}</p>
        ) : (
          <p className={ui.state.warning + " mt-4"}>Order confirmation details are unavailable.</p>
        )}
        <p className={ui.text.subtitle + " mt-4"}>
          Keep the order number for support and fulfillment tracking.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className={ui.action.buttonSecondary}>
            Continue shopping
          </Link>
          <Link href="/account" className={ui.action.buttonPrimary}>
            Go to account
          </Link>
        </div>
      </div>
    </section>
  );
}
