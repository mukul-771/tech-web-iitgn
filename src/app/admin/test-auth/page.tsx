"use client";

import { useSession } from "next-auth/react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, User, Mail, Shield } from "lucide-react";

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading authentication status...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-space-grotesk">
            Authentication Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Verify your admin access and authentication status
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Authentication Status */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {session ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Authenticated</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">Not Authenticated</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {session?.user?.isAdmin ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Admin Access Granted</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">Admin Access Denied</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session?.user ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm">{session.user.name || "Not provided"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm">{session.user.email || "Not provided"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Role:</span>
                      <Badge variant={session.user.isAdmin ? "default" : "secondary"}>
                        {session.user.isAdmin ? "Admin" : "User"}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">No user information available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Authorized Emails */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Authorized Admin Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-mono text-sm">mukul.meena@iitgn.ac.in</span>
                <Badge variant="outline">Admin</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-mono text-sm">technical.secretary@iitgn.ac.in</span>
                <Badge variant="outline">Admin</Badge>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Only these email addresses can access the admin dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {!session && (
          <Card className="glass border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Complete Google OAuth setup following the <code>GOOGLE_OAUTH_SETUP.md</code> guide</li>
                <li>Add your Google Client ID and Secret to <code>.env.local</code></li>
                <li>Restart the development server</li>
                <li>Sign in with an authorized email address</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
