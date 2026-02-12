import type { Metadata } from "next";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect } from "@/app/account/_lib";
import { updateNewsletterAction } from "@/app/actions/account-management";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Newsletter Subscriptions | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  updated?: string | string[];
  error?: string | string[];
};

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

function resolveErrorMessage(searchParams?: SearchParams): string | null {
  const error = firstValue(searchParams?.error);
  if (!error) {
    return null;
  }
  const byCode: Record<string, string> = {
    "update-failed": "Newsletter update failed.",
    "service-unavailable": "Newsletter service is temporarily unavailable."
  };
  return byCode[error] ?? "Newsletter update failed.";
}

export default async function AccountNewsletterPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const dashboard = await getDashboardOrRedirect();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const updated = firstValue(resolvedSearchParams?.updated) === "1";
  const error = resolveErrorMessage(resolvedSearchParams);

  return (
    <AccountShell dashboard={dashboard} active="newsletter">
      <section className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>Newsletter Subscriptions</h1>
        <p className={ui.text.subtitle + " mt-2"}>Subscription state is saved in Magento customer profile.</p>
        {updated ? <p className={ui.state.success + " mt-4"}>Newsletter preference updated.</p> : null}
        {error ? <p className={ui.state.warning + " mt-4"}>{error}</p> : null}
      </section>

      <section className={ui.surface.panel}>
        <p className={ui.text.subtitle + " mb-4"}>
          Current status: {dashboard.isSubscribed ? "Subscribed" : "Not subscribed"}
        </p>
        <form action={updateNewsletterAction} className="flex items-center gap-3">
          <input type="hidden" name="subscribed" value={dashboard.isSubscribed ? "0" : "1"} />
          <button type="submit" className={ui.action.buttonPrimary}>
            {dashboard.isSubscribed ? "Unsubscribe" : "Subscribe"}
          </button>
        </form>
      </section>
    </AccountShell>
  );
}
