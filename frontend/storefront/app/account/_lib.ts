import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomerDashboard } from "@/src/lib/commerce/customer";
import { readCustomerTokenCookie } from "@/src/lib/session-cookies";
import type { CustomerDashboard } from "@/src/lib/commerce/types";

export async function requireAccountToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = readCustomerTokenCookie(cookieStore);
  if (!token) {
    redirect("/login");
  }
  return token;
}

export async function getDashboardOrRedirect(): Promise<CustomerDashboard> {
  const token = await requireAccountToken();
  try {
    return await getCustomerDashboard(token);
  } catch {
    redirect("/login?error=session-expired");
  }
}
