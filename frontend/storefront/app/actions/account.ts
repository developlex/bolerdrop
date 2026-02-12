"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError } from "@/src/lib/commerce/client";
import { hasMinimumPasswordLength, normalizePassword, passwordsMatch } from "@/src/lib/forms/password";
import { REGISTER_PREFILL_COOKIE, createRegisterPrefill, serializeRegisterPrefill } from "@/src/lib/forms/register";
import { createCustomerAccount, generateCustomerToken } from "@/src/lib/commerce/customer";

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function messageSuggestsExistingEmail(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("already exists") || normalized.includes("already registered");
}

function messageSuggestsWeakPassword(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("password") && (
    normalized.includes("minimum") ||
    normalized.includes("at least") ||
    normalized.includes("strength")
  );
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing-credentials");
  }

  const cookieStore = await cookies();
  let token: string;

  try {
    token = await generateCustomerToken(email, password);
  } catch (error: unknown) {
    cookieStore.delete("customer_token");
    if (error instanceof CommerceError) {
      redirect("/login?error=invalid-credentials");
    }
    redirect("/login?error=auth-unavailable");
  }

  cookieStore.set("customer_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24
  });
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("customer_token");
  redirect("/");
}

export async function registerAction(formData: FormData): Promise<void> {
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rawPassword = String(formData.get("password") ?? "");
  const rawConfirmPassword = String(formData.get("confirm_password") ?? "");
  const password = normalizePassword(rawPassword);
  const cookieStore = await cookies();
  let token: string;

  const registrationPrefill = createRegisterPrefill(firstname, lastname, email);
  const persistRegistrationPrefill = () => {
    cookieStore.set(REGISTER_PREFILL_COOKIE, serializeRegisterPrefill(registrationPrefill), {
      httpOnly: true,
      sameSite: "lax",
      path: "/register",
      maxAge: 60 * 10
    });
  };

  if (!firstname || !lastname || !email || !rawPassword || !rawConfirmPassword) {
    persistRegistrationPrefill();
    redirect("/register?error=missing-fields");
  }

  if (!looksLikeEmail(email)) {
    persistRegistrationPrefill();
    redirect("/register?error=invalid-email");
  }

  if (!passwordsMatch(rawPassword, rawConfirmPassword)) {
    persistRegistrationPrefill();
    redirect("/register?error=password-mismatch");
  }

  if (!hasMinimumPasswordLength(rawPassword)) {
    persistRegistrationPrefill();
    redirect("/register?error=weak-password");
  }

  try {
    await createCustomerAccount({
      firstname,
      lastname,
      email,
      password
    });
    token = await generateCustomerToken(email, password);
  } catch (error: unknown) {
    cookieStore.delete("customer_token");
    persistRegistrationPrefill();
    if (error instanceof CommerceError) {
      if (messageSuggestsExistingEmail(error.message)) {
        redirect("/register?error=email-exists");
      }
      if (messageSuggestsWeakPassword(error.message)) {
        redirect("/register?error=weak-password");
      }
      redirect("/register?error=register-failed");
    }
    redirect("/register?error=register-unavailable");
  }

  cookieStore.set("customer_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24
  });
  cookieStore.delete(REGISTER_PREFILL_COOKIE);
  redirect("/account?registered=1");
}
