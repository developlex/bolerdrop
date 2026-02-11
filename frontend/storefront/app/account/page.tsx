import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { logoutAction } from "@/app/actions/account";
import { getCustomerProfile } from "@/src/lib/commerce/customer";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "My Account | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value;

  if (!token) {
    return (
      <section>
        <h1 className={ui.text.pageTitle}>My Account</h1>
        <p className={ui.text.subtitle + " mt-3"}>You are not signed in.</p>
        <Link href="/login" className={ui.text.link + " mt-4"}>
          Go to sign in
        </Link>
      </section>
    );
  }

  let customer;
  try {
    customer = await getCustomerProfile(token);
  } catch {
    return (
      <section>
        <h1 className={ui.text.pageTitle}>My Account</h1>
        <p className={ui.text.subtitle + " mt-3"}>Session is no longer valid.</p>
        <Link href="/login" className={ui.text.link + " mt-4"}>
          Sign in again
        </Link>
      </section>
    );
  }

  return (
    <section className={ui.surface.panelLg}>
      <h1 className={ui.text.pageTitle}>My Account</h1>
      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className={ui.text.label}>First name</dt>
          <dd className={ui.text.value}>{customer.firstname}</dd>
        </div>
        <div>
          <dt className={ui.text.label}>Last name</dt>
          <dd className={ui.text.value}>{customer.lastname}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className={ui.text.label}>Email</dt>
          <dd className={ui.text.value}>{customer.email}</dd>
        </div>
      </dl>
      <form action={logoutAction} className="mt-6">
        <button type="submit" className={ui.action.buttonSecondary}>
          Sign out
        </button>
      </form>
    </section>
  );
}
