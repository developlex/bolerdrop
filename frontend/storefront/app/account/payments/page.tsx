import type { Metadata } from "next";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect, requireAccountToken } from "@/app/account/_lib";
import { getCustomerPaymentTokens } from "@/src/lib/commerce/customer";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Stored Payment Methods | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccountPaymentsPage() {
  const token = await requireAccountToken();
  const [dashboard, tokens] = await Promise.all([
    getDashboardOrRedirect(),
    getCustomerPaymentTokens(token)
  ]);

  return (
    <AccountShell dashboard={dashboard} active="payments">
      <section className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>Stored Payment Methods</h1>
        <p className={ui.text.subtitle + " mt-2"}>Saved payment tokens are read from Magento customer vault data.</p>
      </section>

      <section className={ui.surface.panel}>
        {tokens.length === 0 ? (
          <p className={ui.text.subtitle}>No stored payment methods found.</p>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <article key={token.publicHash} className="rounded-xl border border-black/10 bg-white/70 p-3">
                <p className={ui.text.value}>{token.paymentMethodCode}</p>
                <p className={ui.text.subtitle + " mt-1"}>Type: {token.type}</p>
                <p className={ui.text.subtitle + " mt-1"}>Hash: {token.publicHash}</p>
                {token.details ? <p className={ui.text.subtitle + " mt-1"}>{token.details}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </AccountShell>
  );
}
