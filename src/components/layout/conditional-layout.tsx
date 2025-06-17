"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current path is an admin route
  const isAdminRoute = pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    // Admin routes: no navbar/footer, just the content
    return <div className="min-h-screen">{children}</div>;
  }
  
  // Main website routes: include navbar and footer
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
