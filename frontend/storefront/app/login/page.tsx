import type { Metadata } from "next";
import Link from "next/link";
import { loginAction } from "@/app/actions/account";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Sign in | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  error?: string | string[];
};

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

export function resolveLoginErrorMessage(searchParams?: SearchParams): string | null {
  const errorCode = firstValue(searchParams?.error);
  if (!errorCode) {
    return null;
  }

  const byCode: Record<string, string> = {
    "missing-credentials": "Email and password are required.",
    "invalid-credentials": "Sign-in failed. Check your credentials and try again.",
    "auth-unavailable": "Sign-in service is currently unavailable. Try again in a moment.",
    "session-expired": "Your session expired. Sign in again to continue.",
    "wishlist-auth": "Sign in to add products to your wish list."
  };

  return byCode[errorCode] ?? "Sign-in failed. Please try again.";
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const loginError = resolveLoginErrorMessage(resolvedSearchParams);

  return (
    <section className="mx-auto max-w-md">
      <div className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>Sign in</h1>
        <p className={ui.text.subtitle + " mt-2"}>Authenticate against Magento customer account.</p>
        {loginError ? (
          <p className={ui.state.warning + " mt-4"}>{loginError}</p>
        ) : null}
        <form action={loginAction} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Email</span>
            <input name="email" type="email" required className={ui.form.input} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Password</span>
            <input name="password" type="password" required className={ui.form.input} />
          </label>
          <button type="submit" className={ui.action.buttonPrimary + " w-full"}>
            Sign in
          </button>
        </form>
        <p className={ui.text.subtitle + " mt-4"}>
          New customer?{" "}
          <Link href="/register" className={ui.text.link}>
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
