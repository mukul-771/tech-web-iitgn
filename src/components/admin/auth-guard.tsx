import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export async function AuthGuard({ children, requireAdmin = true }: AuthGuardProps) {
  const session = await getServerSession(authOptions);

  // If admin access is required but user is not admin, redirect to login
  if (requireAdmin && !session?.user?.isAdmin) {
    redirect("/admin/login");
  }

  // If user is not authenticated at all, redirect to login
  if (!session) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
