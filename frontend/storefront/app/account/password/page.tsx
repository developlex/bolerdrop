import type { Metadata } from "next";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect } from "@/app/account/_lib";
import { changePasswordAction } from "@/app/actions/account-management";
import { AccountPasswordFields } from "@/src/components/account-password-fields";
import { PASSWORD_MIN_LENGTH_MESSAGE } from "@/src/lib/forms/password";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Change Password | BoilerDrop Storefront",
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
    "missing-fields": "All fields are required.",
    "weak-password": PASSWORD_MIN_LENGTH_MESSAGE,
    "password-mismatch": "Please make sure your passwords match.",
    "change-failed": "Unable to change password. Check current password and try again.",
    "service-unavailable": "Password service is temporarily unavailable."
  };
  return byCode[error] ?? "Password change failed.";
}

export default async function AccountPasswordPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const dashboard = await getDashboardOrRedirect();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const updated = firstValue(resolvedSearchParams?.updated) === "1";
  const error = resolveErrorMessage(resolvedSearchParams);

  return (
    <AccountShell dashboard={dashboard} active="edit">
      <section className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>Change Password</h1>
        <p className={ui.text.subtitle + " mt-2"}>Updates apply directly to Magento customer credentials.</p>
        {updated ? <p className={ui.state.success + " mt-4"}>Password changed successfully.</p> : null}
        {error ? <p className={ui.state.warning + " mt-4"}>{error}</p> : null}
      </section>

      <section className={ui.surface.panel}>
        <form action={changePasswordAction} className="space-y-3">
          <AccountPasswordFields />
          <button type="submit" className={ui.action.buttonPrimary}>
            Update Password
          </button>
        </form>
      </section>
    </AccountShell>
  );
}
