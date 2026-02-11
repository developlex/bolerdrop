"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError } from "@/src/lib/commerce/client";
import { generateCustomerToken } from "@/src/lib/commerce/customer";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing-credentials");
  }

  const cookieStore = await cookies();

  try {
    const token = await generateCustomerToken(email, password);
    cookieStore.set("customer_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24
    });
    redirect("/account");
  } catch (error: unknown) {
    cookieStore.delete("customer_token");
    if (error instanceof CommerceError) {
      redirect("/login?error=invalid-credentials");
    }
    redirect("/login?error=auth-unavailable");
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("customer_token");
  redirect("/");
}
