import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Server-side authentication check
  if (!session?.user?.isAdmin) {
    redirect("/admin/login");
  }

  return <AdminDashboardClient />;
}
