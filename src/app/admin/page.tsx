import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { isSignedIn } from "@/lib/admin-auth";
import { getOrderStore } from "@/lib/orders/store";
import { AdminLogin } from "./AdminLogin";
import { OrderBoard } from "./OrderBoard";

export const metadata: Metadata = { title: "Order board", robots: { index: false } };

/** The bakery's view of every order, newest first. */
export default async function AdminPage() {
  if (!(await isSignedIn())) {
    return (
      <>
        <SiteHeader />
        <AdminLogin configured={Boolean(process.env.ADMIN_PASSWORD)} />
      </>
    );
  }

  const orders = await getOrderStore().list();

  return (
    <>
      <SiteHeader />
      <OrderBoard orders={orders} />
    </>
  );
}
