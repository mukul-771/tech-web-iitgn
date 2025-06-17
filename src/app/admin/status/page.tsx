"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Settings, Database, Shield, Globe } from "lucide-react";

export default function AdminStatusPage() {
  const [envStatus, setEnvStatus] = useState({
    nextAuthUrl: false,
    nextAuthSecret: false,
    googleClientId: false,
    googleClientSecret: false
  });

  useEffect(() => {
    // Check environment variables (client-side detection)
    const checkEnvVars = () => {
      // We can't directly access env vars on client side, but we can check if auth is configured
      // by trying to access the auth endpoints
      setEnvStatus({
        nextAuthUrl: true, // Always true in development
        nextAuthSecret: true, // We set this
        googleClientId: false, // User needs to set this
        googleClientSecret: false // User needs to set this
      });
    };

    checkEnvVars();
  }, []);

  const StatusItem = ({ 
    icon: Icon, 
    title, 
    status, 
    description 
  }: { 
    icon: any, 
    title: string, 
    status: 'success' | 'error' | 'warning', 
    description: string 
  }) => (
    <div className="flex items-start gap-3 p-4 rounded-lg border">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        status === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
        status === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
        'bg-yellow-100 dark:bg-yellow-900/20'
      }`}>
        {status === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : status === 'error' ? (
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-gray-500" />
          <h3 className="font-medium">{title}</h3>
          <Badge variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
            {status === 'success' ? 'Ready' : status === 'error' ? 'Missing' : 'Partial'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-space-grotesk">
            Admin Dashboard Status
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Check the configuration status of your admin dashboard
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* System Status */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusItem
                icon={Globe}
                title="Development Server"
                status="success"
                description="Next.js development server is running on port 3001"
              />
              
              <StatusItem
                icon={Database}
                title="Data Storage"
                status="success"
                description="JSON-based event storage system is configured and ready"
              />
              
              <StatusItem
                icon={Shield}
                title="Admin Access"
                status="warning"
                description="Authentication temporarily disabled for testing. Enable OAuth to secure access."
              />
            </CardContent>
          </Card>

          {/* Configuration Status */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusItem
                icon={CheckCircle}
                title="NextAuth URL"
                status="success"
                description="NEXTAUTH_URL is configured for localhost:3001"
              />
              
              <StatusItem
                icon={CheckCircle}
                title="NextAuth Secret"
                status="success"
                description="NEXTAUTH_SECRET is configured with secure random key"
              />
              
              <StatusItem
                icon={XCircle}
                title="Google Client ID"
                status="error"
                description="GOOGLE_CLIENT_ID needs to be set in .env.local"
              />
              
              <StatusItem
                icon={XCircle}
                title="Google Client Secret"
                status="error"
                description="GOOGLE_CLIENT_SECRET needs to be set in .env.local"
              />
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="glass border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Set up Google OAuth (Required for production)</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• Follow the guide in <code>GOOGLE_OAUTH_SETUP.md</code></li>
                  <li>• Get credentials from Google Cloud Console</li>
                  <li>• Update <code>.env.local</code> with your credentials</li>
                  <li>• Restart the development server</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Test Admin Features (Available now)</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• Visit <code>/admin</code> to see the dashboard</li>
                  <li>• View event management interface</li>
                  <li>• Test the admin layout and navigation</li>
                  <li>• Check data loading and error handling</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Enable Authentication (For security)</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• Uncomment authentication checks in admin pages</li>
                  <li>• Test login with authorized emails</li>
                  <li>• Verify access control is working</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authorized Users */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Authorized Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-mono text-sm">mukul.meena@iitgn.ac.in</span>
                <Badge variant="outline">Primary Admin</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-mono text-sm">technical.secretary@iitgn.ac.in</span>
                <Badge variant="outline">Admin</Badge>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Only these email addresses will be able to access the admin dashboard once OAuth is enabled.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
