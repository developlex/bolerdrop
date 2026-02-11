"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateCustomerToken } from "@/src/lib/commerce/customer";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing-credentials");
  }

  const token = await generateCustomerToken(email, password);
  const cookieStore = await cookies();
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
