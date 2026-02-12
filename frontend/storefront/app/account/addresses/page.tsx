import type { Metadata } from "next";
import { AccountShell } from "@/app/account/_components/account-shell";
import { getDashboardOrRedirect } from "@/app/account/_lib";
import { deleteAddressAction, saveAddressAction } from "@/app/actions/account-management";
import { getCountryRegions } from "@/src/lib/commerce/directory";
import {
  dedupeUsStateOptions,
  resolveUsStateCode,
  US_COUNTRY_CODE,
  US_COUNTRY_LABEL,
  US_STATE_OPTIONS
} from "@/src/lib/forms/us-states";
import { ui } from "@/src/ui/styles";

export const metadata: Metadata = {
  title: "Address Book | BoilerDrop Storefront",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  updated?: string | string[];
  deleted?: string | string[];
  error?: string | string[];
};

type StateOption = {
  code: string;
  name: string;
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
    "invalid-address": "Address fields are incomplete.",
    "invalid-address-id": "Address identifier is invalid.",
    "region-required": "State is required for United States addresses.",
    "country-not-supported": "Only United States addresses are supported right now.",
    "save-failed": "Address update failed.",
    "delete-failed": "Address deletion failed.",
    "service-unavailable": "Address service is temporarily unavailable."
  };
  return byCode[error] ?? "Address operation failed.";
}

type StreetLines = {
  line1: string;
  line2: string;
};

function splitStreetLines(street: string[]): StreetLines {
  return {
    line1: street[0] ?? "",
    line2: street.slice(1).join(" ")
  };
}

function addressStateCode(regionCode: string | null, region: string | null): string {
  return resolveUsStateCode(regionCode, region) ?? "";
}

export default async function AccountAddressesPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const dashboard = await getDashboardOrRedirect();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const updated = firstValue(resolvedSearchParams?.updated) === "1";
  const deleted = firstValue(resolvedSearchParams?.deleted) === "1";
  const error = resolveErrorMessage(resolvedSearchParams);
  const storeRegions = await getCountryRegions(US_COUNTRY_CODE).catch(() => []);
  const stateOptions: StateOption[] = dedupeUsStateOptions(storeRegions.length > 0
    ? storeRegions.map((region) => ({ code: region.code, name: region.name }))
    : [...US_STATE_OPTIONS]);

  return (
    <AccountShell dashboard={dashboard} active="addresses">
      <section className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>Address Book</h1>
        <p className={ui.text.subtitle + " mt-2"}>Manage customer addresses stored in Magento.</p>
        {updated ? <p className={ui.state.success + " mt-4"}>Address updated.</p> : null}
        {deleted ? <p className={ui.state.success + " mt-4"}>Address deleted.</p> : null}
        {error ? <p className={ui.state.warning + " mt-4"}>{error}</p> : null}
      </section>

      {dashboard.addresses.length === 0 ? (
        <section className={ui.surface.panel}>
          <p className={ui.text.subtitle}>No addresses saved yet.</p>
        </section>
      ) : (
        <section className="space-y-4">
          {dashboard.addresses.map((address) => {
            const streetLines = splitStreetLines(address.street);
            return (
              <section key={address.id} className={ui.surface.panel}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className={ui.text.value}>
                    Address #{address.id}
                    {address.defaultBilling ? " · Default Billing" : ""}
                    {address.defaultShipping ? " · Default Shipping" : ""}
                  </h2>
                  <form action={deleteAddressAction}>
                    <input type="hidden" name="address_id" value={address.id} />
                    <button type="submit" className={ui.action.buttonSecondary}>Delete</button>
                  </form>
                </div>
                <form action={saveAddressAction} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input type="hidden" name="address_id" value={address.id} />
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>First name *</span>
                    <input name="firstname" required defaultValue={address.firstname} className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Last name *</span>
                    <input name="lastname" required defaultValue={address.lastname} className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Street Line 1 *</span>
                    <input
                      name="street_line1"
                      required
                      defaultValue={streetLines.line1}
                      className={ui.form.input}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Street Line 2</span>
                    <input
                      name="street_line2"
                      defaultValue={streetLines.line2}
                      className={ui.form.input}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>City *</span>
                    <input name="city" required defaultValue={address.city} className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>State *</span>
                    <select name="state" required defaultValue={addressStateCode(address.regionCode, address.region)} className={ui.form.select}>
                      <option value="" disabled>Select state</option>
                      {stateOptions.map((state) => (
                        <option key={`${state.code}-${state.name}`} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>ZIP Code *</span>
                    <input name="postcode" required defaultValue={address.postcode} className={ui.form.input} />
                  </label>
                  <label className="block text-sm">
                    <span className={ui.text.label + " mb-1 block"}>Country *</span>
                    <select name="country_code" required defaultValue={US_COUNTRY_CODE} className={ui.form.select}>
                      <option value={US_COUNTRY_CODE}>{US_COUNTRY_LABEL}</option>
                    </select>
                  </label>
                  <label className="block text-sm md:col-span-2">
                    <span className={ui.text.label + " mb-1 block"}>Telephone *</span>
                    <input name="telephone" required defaultValue={address.telephone} className={ui.form.input} />
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" name="default_billing" defaultChecked={address.defaultBilling} />
                    <span className={ui.text.subtitle}>Default billing</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" name="default_shipping" defaultChecked={address.defaultShipping} />
                    <span className={ui.text.subtitle}>Default shipping</span>
                  </label>
                  <div className="md:col-span-2">
                    <button type="submit" className={ui.action.buttonPrimary}>Save Address</button>
                  </div>
                </form>
              </section>
            );
          })}
        </section>
      )}

      <section className={ui.surface.panel}>
        <h2 className={ui.text.value}>Add New Address</h2>
        <form action={saveAddressAction} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>First name *</span>
            <input name="firstname" required className={ui.form.input} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Last name *</span>
            <input name="lastname" required className={ui.form.input} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Street Line 1 *</span>
            <input name="street_line1" required className={ui.form.input} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Street Line 2</span>
            <input name="street_line2" className={ui.form.input} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>City *</span>
            <input name="city" required className={ui.form.input} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>State *</span>
            <select name="state" required defaultValue="" className={ui.form.select}>
              <option value="" disabled>Select state</option>
              {stateOptions.map((state) => (
                <option key={`${state.code}-${state.name}`} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>ZIP Code *</span>
            <input name="postcode" required className={ui.form.input} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Country *</span>
            <select name="country_code" required defaultValue={US_COUNTRY_CODE} className={ui.form.select}>
              <option value={US_COUNTRY_CODE}>{US_COUNTRY_LABEL}</option>
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className={ui.text.label + " mb-1 block"}>Telephone *</span>
            <input name="telephone" required className={ui.form.input} />
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="default_billing" />
            <span className={ui.text.subtitle}>Default billing</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="default_shipping" />
            <span className={ui.text.subtitle}>Default shipping</span>
          </label>
          <div className="md:col-span-2">
            <button type="submit" className={ui.action.buttonPrimary}>Create Address</button>
          </div>
        </form>
      </section>
    </AccountShell>
  );
}
