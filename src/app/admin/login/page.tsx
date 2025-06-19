"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use localStorage/sessionStorage or remove session check if not needed
    // Or use useSession from next-auth/react for client-side session
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signIn("google", { callbackUrl: "/admin" });
    } catch (err) {
      setError("Failed to sign in with Google");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="mt-8 space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in with Google"}
              </button>
            </div>

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
