"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  endSession,
  isSignedIn,
  passwordMatches,
  startSession,
} from "@/lib/admin-auth";
import { getOrderStore } from "@/lib/orders/store";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/types";

export async function signIn(
  _previous: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD) {
    return { error: "No staff password is configured for this deployment." };
  }
  if (!passwordMatches(password)) {
    return { error: "That password isn't right." };
  }

  await startSession();
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/admin");
}

/** Move an order along the workflow, or record a note against it. */
export async function updateOrder(formData: FormData): Promise<void> {
  if (!(await isSignedIn())) redirect("/admin");

  const reference = String(formData.get("reference") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const bakeryNotes = String(formData.get("bakeryNotes") ?? "").slice(0, 2000);

  if (!ORDER_STATUSES.includes(status)) return;

  await getOrderStore().update(reference, { status, bakeryNotes });
  revalidatePath("/admin");
  revalidatePath(`/orders/${reference}`);
}
