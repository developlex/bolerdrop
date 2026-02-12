import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { registerAction } from "@/app/actions/account";
import { RegisterPasswordFields } from "@/src/components/register-password-fields";
import { PASSWORD_MIN_LENGTH_MESSAGE } from "@/src/lib/forms/password";
import { REGISTER_PREFILL_COOKIE, parseRegisterPrefill } from "@/src/lib/forms/register";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Create Account | BoilerDrop Storefront",
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

export function resolveRegistrationErrorMessage(searchParams?: SearchParams): string | null {
  const errorCode = firstValue(searchParams?.error);
  if (!errorCode) {
    return null;
  }

  const byCode: Record<string, string> = {
    "missing-fields": "All fields are required.",
    "invalid-email": "Enter a valid email address.",
    "password-mismatch": "Passwords do not match.",
    "weak-password": PASSWORD_MIN_LENGTH_MESSAGE,
    "email-exists": "An account with this email already exists.",
    "register-failed": "Account creation failed. Please review your input and try again.",
    "register-unavailable": "Registration service is temporarily unavailable."
  };

  return byCode[errorCode] ?? "Account creation failed. Please try again.";
}

export default async function RegisterPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const registrationError = resolveRegistrationErrorMessage(resolvedSearchParams);
  const cookieStore = await cookies();
  const registrationPrefill = parseRegisterPrefill(cookieStore.get(REGISTER_PREFILL_COOKIE)?.value);

  return (
    <section className="mx-auto max-w-md">
      <div className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>Create account</h1>
        <p className={ui.text.subtitle + " mt-2"}>
          Register a new customer account backed by Magento.
        </p>
        {registrationError ? (
          <p className={ui.state.warning + " mt-4"}>{registrationError}</p>
        ) : null}
        <form action={registerAction} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>First name</span>
            <input name="firstname" type="text" required className={ui.form.input} defaultValue={registrationPrefill?.firstname ?? ""} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Last name</span>
            <input name="lastname" type="text" required className={ui.form.input} defaultValue={registrationPrefill?.lastname ?? ""} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Email</span>
            <input name="email" type="email" required className={ui.form.input} defaultValue={registrationPrefill?.email ?? ""} />
          </label>
          <RegisterPasswordFields />
          <button type="submit" className={ui.action.buttonPrimary + " w-full"}>
            Create account
          </button>
        </form>
        <p className={ui.text.subtitle + " mt-4"}>
          Already have an account?{" "}
          <Link href="/login" className={ui.text.link}>
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
