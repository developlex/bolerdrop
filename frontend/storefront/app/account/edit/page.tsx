import type { Metadata } from "next";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect } from "@/app/account/_lib";
import { updateAccountProfileAction } from "@/app/actions/account-management";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Account Information | BoilerDrop Storefront",
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
    "invalid-email": "Enter a valid email address.",
    "password-required": "Current password is required to change email.",
    "invalid-password": "Current password is invalid.",
    "email-exists": "An account with this email already exists.",
    "update-failed": "Account update failed.",
    "service-unavailable": "Account service is temporarily unavailable."
  };
  return byCode[error] ?? "Account update failed.";
}

export default async function AccountInformationPage({
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
        <h1 className={ui.text.pageTitle}>Account Information</h1>
        <p className={ui.text.subtitle + " mt-2"}>Update profile details in Magento customer account.</p>
        {updated ? <p className={ui.state.success + " mt-4"}>Account information updated.</p> : null}
        {error ? <p className={ui.state.warning + " mt-4"}>{error}</p> : null}
      </section>

      <section className={ui.surface.panel}>
        <form action={updateAccountProfileAction} className="space-y-3">
          <input type="hidden" name="original_email" value={dashboard.profile.email} />
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>First name</span>
            <input
              suppressHydrationWarning
              name="firstname"
              type="text"
              required
              defaultValue={dashboard.profile.firstname}
              className={ui.form.input}
            />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Last name</span>
            <input
              suppressHydrationWarning
              name="lastname"
              type="text"
              required
              defaultValue={dashboard.profile.lastname}
              className={ui.form.input}
            />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Email</span>
            <input
              suppressHydrationWarning
              name="email"
              type="email"
              required
              defaultValue={dashboard.profile.email}
              className={ui.form.input}
            />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Current password (required only for email change)</span>
            <input
              suppressHydrationWarning
              name="current_password"
              type="password"
              className={ui.form.input}
            />
          </label>
          <button type="submit" className={ui.action.buttonPrimary}>
            Save Changes
          </button>
        </form>
      </section>
    </AccountShell>
  );
}
