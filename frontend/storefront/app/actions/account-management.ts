"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError } from "@/src/lib/commerce/client";
import { hasMinimumPasswordLength, normalizePassword } from "@/src/lib/forms/password";
import { US_COUNTRY_CODE } from "@/src/lib/forms/us-states";
import {
  changeCustomerPassword,
  createCustomerAddress,
  deleteCustomerAddress,
  generateCustomerToken,
  getCustomerProfile,
  removeWishlistItem,
  updateCustomerAddress,
  updateCustomerEmail,
  updateCustomerProfile,
  updateNewsletterSubscription,
  updateWishlistItemQuantity
} from "@/src/lib/commerce/customer";
import type { CustomerAddressInput } from "@/src/lib/commerce/types";

function requireCustomerToken(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  const token = cookieStore.get("customer_token")?.value;
  if (!token) {
    redirect("/login");
  }
  return token;
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseStreetLines(formData: FormData): string[] {
  const streetLine1 = String(formData.get("street_line1") ?? "").trim();
  const streetLine2 = String(formData.get("street_line2") ?? "").trim();
  const legacyStreetRaw = String(formData.get("street") ?? "").trim();

  if (streetLine1 || streetLine2) {
    return [streetLine1, streetLine2].filter((line) => line.length > 0);
  }

  return legacyStreetRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function toAddressInput(formData: FormData): CustomerAddressInput | null {
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const street = parseStreetLines(formData);
  const city = String(formData.get("city") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();
  const countryCodeRaw = String(formData.get("country_code") ?? "").trim().toUpperCase();
  const countryCode = countryCodeRaw || US_COUNTRY_CODE;
  const telephone = String(formData.get("telephone") ?? "").trim();
  const regionRaw = String(formData.get("state") ?? formData.get("region") ?? "").trim().toUpperCase();
  const defaultShipping = String(formData.get("default_shipping") ?? "") === "on";
  const defaultBilling = String(formData.get("default_billing") ?? "") === "on";

  if (
    !firstname ||
    !lastname ||
    street.length === 0 ||
    !city ||
    !postcode ||
    !countryCode ||
    !telephone ||
    !regionRaw
  ) {
    return null;
  }

  return {
    firstname,
    lastname,
    street,
    city,
    postcode,
    countryCode,
    telephone,
    region: regionRaw || null,
    defaultShipping,
    defaultBilling
  };
}

function logActionError(action: string, error: unknown): void {
  if (error instanceof CommerceError) {
    console.error(`[account-management:${action}] commerce error: ${error.message}`);
    return;
  }
  console.error(`[account-management:${action}] unexpected error`, error);
}

async function verifyPasswordChange(email: string | null, newPassword: string): Promise<boolean> {
  if (!email) {
    return false;
  }
  try {
    await generateCustomerToken(email, newPassword);
    return true;
  } catch {
    return false;
  }
}

export async function updateAccountProfileAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = requireCustomerToken(cookieStore);
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const originalEmail = String(formData.get("original_email") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("current_password") ?? "");

  if (!firstname || !lastname || !email) {
    redirect("/account/edit?error=missing-fields");
  }
  if (!looksLikeEmail(email)) {
    redirect("/account/edit?error=invalid-email");
  }
  if (email !== originalEmail && !currentPassword) {
    redirect("/account/edit?error=password-required");
  }

  let destination = "/account/edit?updated=1";
  try {
    await updateCustomerProfile(token, { firstname, lastname });
    if (email !== originalEmail) {
      await updateCustomerEmail(token, email, currentPassword);
    }
  } catch (error: unknown) {
    logActionError("update-account-profile", error);
    if (error instanceof CommerceError) {
      const message = error.message.toLowerCase();
      if (message.includes("already exists")) {
        destination = "/account/edit?error=email-exists";
      } else if (message.includes("password")) {
        destination = "/account/edit?error=invalid-password";
      } else {
        destination = "/account/edit?error=update-failed";
      }
    } else {
      destination = "/account/edit?error=service-unavailable";
    }
  }
  redirect(destination);
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = requireCustomerToken(cookieStore);
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPasswordRaw = String(formData.get("new_password") ?? "");
  const confirmPasswordRaw = String(formData.get("confirm_password") ?? "");
  const newPassword = normalizePassword(newPasswordRaw);
  const confirmPassword = normalizePassword(confirmPasswordRaw);

  if (!currentPassword || !newPasswordRaw || !confirmPasswordRaw) {
    redirect("/account/password?error=missing-fields");
  }
  if (!hasMinimumPasswordLength(newPasswordRaw)) {
    redirect("/account/password?error=weak-password");
  }
  if (newPassword !== confirmPassword) {
    redirect("/account/password?error=password-mismatch");
  }

  const customerEmail = await getCustomerProfile(token)
    .then((profile) => profile.email)
    .catch(() => null);

  let destination = "/account/password?updated=1";
  try {
    await changeCustomerPassword(token, currentPassword, newPassword);
  } catch (error: unknown) {
    logActionError("change-password", error);
    if (error instanceof CommerceError) {
      const changed = await verifyPasswordChange(customerEmail, newPassword);
      destination = changed ? "/account/password?updated=1" : "/account/password?error=change-failed";
    } else {
      destination = "/account/password?error=service-unavailable";
    }
  }
  redirect(destination);
}

export async function saveAddressAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = requireCustomerToken(cookieStore);
  const addressInput = toAddressInput(formData);
  const addressIdRaw = String(formData.get("address_id") ?? "").trim();
  const submittedCountry = String(formData.get("country_code") ?? "").trim().toUpperCase();

  if (submittedCountry && submittedCountry !== US_COUNTRY_CODE) {
    redirect("/account/addresses?error=country-not-supported");
  }
  if (!addressInput) {
    redirect("/account/addresses?error=invalid-address");
  }
  if (addressIdRaw) {
    const addressId = Number(addressIdRaw);
    if (!Number.isInteger(addressId) || addressId <= 0) {
      redirect("/account/addresses?error=invalid-address-id");
    }
  }

  let destination = "/account/addresses?updated=1";
  try {
    if (addressIdRaw) {
      const addressId = Number(addressIdRaw);
      await updateCustomerAddress(token, addressId, addressInput);
    } else {
      await createCustomerAddress(token, addressInput);
    }
  } catch (error: unknown) {
    logActionError("save-address", error);
    if (error instanceof CommerceError) {
      const message = error.message.toLowerCase();
      destination = message.includes("region_id is required")
        ? "/account/addresses?error=region-required"
        : "/account/addresses?error=save-failed";
    } else {
      destination = "/account/addresses?error=service-unavailable";
    }
  }
  redirect(destination);
}

export async function deleteAddressAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = requireCustomerToken(cookieStore);
  const addressIdRaw = String(formData.get("address_id") ?? "").trim();
  const addressId = Number(addressIdRaw);

  if (!Number.isInteger(addressId) || addressId <= 0) {
    redirect("/account/addresses?error=invalid-address-id");
  }

  let destination = "/account/addresses?deleted=1";
  try {
    await deleteCustomerAddress(token, addressId);
  } catch (error: unknown) {
    logActionError("delete-address", error);
    if (error instanceof CommerceError) {
      destination = "/account/addresses?error=delete-failed";
    } else {
      destination = "/account/addresses?error=service-unavailable";
    }
  }
  redirect(destination);
}

export async function updateNewsletterAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = requireCustomerToken(cookieStore);
  const subscribed = String(formData.get("subscribed") ?? "") === "1";

  let destination = "/account/newsletter?updated=1";
  try {
    await updateNewsletterSubscription(token, subscribed);
  } catch (error: unknown) {
    logActionError("update-newsletter", error);
    if (error instanceof CommerceError) {
      destination = "/account/newsletter?error=update-failed";
    } else {
      destination = "/account/newsletter?error=service-unavailable";
    }
  }
  redirect(destination);
}

export async function removeWishlistItemAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = requireCustomerToken(cookieStore);
  const wishlistId = String(formData.get("wishlist_id") ?? "").trim();
  const itemId = String(formData.get("item_id") ?? "").trim();

  if (!wishlistId || !itemId) {
    redirect("/account/wishlist?error=invalid-item");
  }

  let destination = "/account/wishlist?updated=1";
  try {
    const userErrors = await removeWishlistItem(token, wishlistId, itemId);
    if (userErrors.length > 0) {
      destination = "/account/wishlist?error=remove-failed";
    }
  } catch (error: unknown) {
    logActionError("remove-wishlist-item", error);
    if (error instanceof CommerceError) {
      destination = "/account/wishlist?error=remove-failed";
    } else {
      destination = "/account/wishlist?error=service-unavailable";
    }
  }
  redirect(destination);
}

export async function updateWishlistItemQuantityAction(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = requireCustomerToken(cookieStore);
  const wishlistId = String(formData.get("wishlist_id") ?? "").trim();
  const itemId = String(formData.get("item_id") ?? "").trim();
  const quantity = Number(String(formData.get("quantity") ?? "").trim());

  if (!wishlistId || !itemId || !Number.isFinite(quantity) || quantity <= 0) {
    redirect("/account/wishlist?error=invalid-quantity");
  }

  let destination = "/account/wishlist?updated=1";
  try {
    const userErrors = await updateWishlistItemQuantity(token, wishlistId, itemId, quantity);
    if (userErrors.length > 0) {
      destination = "/account/wishlist?error=update-failed";
    }
  } catch (error: unknown) {
    logActionError("update-wishlist-item-quantity", error);
    if (error instanceof CommerceError) {
      destination = "/account/wishlist?error=update-failed";
    } else {
      destination = "/account/wishlist?error=service-unavailable";
    }
  }
  redirect(destination);
}
