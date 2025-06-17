"use client";

import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";
import { CustomFirebaseLogin } from "@/components/admin/custom-firebase-login";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user?.isAdmin) {
        router.push("/admin");
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <Card className="glass border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <ThemeAwareLogo
                width={64}
                height={64}
                className="h-16 w-16 rounded-full"
                priority={true}
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold font-space-grotesk">
                Admin Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Sign in to manage event gallery content
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <CustomFirebaseLogin />
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only authorized administrators can access this dashboard.
                <br />
                Contact the Technical Council if you need access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
