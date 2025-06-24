"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Download, Star, BookOpen, FileText, Calendar } from "lucide-react";
import { TorqueMagazineData } from "@/lib/torque-storage";

export default function TorqueAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [magazines, setMagazines] = useState<Record<string, TorqueMagazineData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    fetchMagazines();
  }, [session, status, router]);

  const fetchMagazines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/torque");
      if (!response.ok) {
        throw new Error("Failed to fetch magazines");
      }
      
      const data = await response.json();
      setMagazines(data);
    } catch (error) {
      console.error("Error fetching magazines:", error);
      setError("Failed to load magazines");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMagazine = async (magazineId: string) => {
    if (!confirm("Are you sure you want to delete this magazine? This will also delete the associated file.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/torque/${magazineId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete magazine");
      }

      await fetchMagazines();
    } catch (error) {
      console.error("Error deleting magazine:", error);
      alert("Failed to delete magazine");
    }
  };

  const handleSetLatest = async (magazineId: string) => {
    try {
      const response = await fetch(`/api/admin/torque/${magazineId}/set-latest`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to set latest magazine";
        throw new Error(errorMessage);
      }

      await fetchMagazines();
    } catch (error) {
      console.error("Error setting latest magazine:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to set latest magazine";
      alert(errorMessage);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (status === "loading" || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading magazines...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const magazinesArray = Object.values(magazines).sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const latestMagazine = magazinesArray.find(mag => mag.isLatest);
  const totalPages = magazinesArray.reduce((sum, mag) => sum + mag.pages, 0);
  const totalArticles = magazinesArray.reduce((sum, mag) => sum + mag.articles, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Torque Magazine Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage magazine uploads and set the latest edition
            </p>
          </div>
          <Button onClick={() => router.push('/admin/torque/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Magazine
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={fetchMagazines} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{magazinesArray.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPages}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArticles}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Year</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestMagazine?.year || "N/A"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Magazine Highlight */}
        {latestMagazine && (
          <Card className="glass border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-600" />
                Latest Magazine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{latestMagazine.title} ({latestMagazine.year})</h3>
                  <p className="text-muted-foreground">{latestMagazine.description}</p>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{latestMagazine.pages} pages</span>
                    <span>{latestMagazine.articles} articles</span>
                    <span>{formatFileSize(latestMagazine.fileSize)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(latestMagazine.filePath, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/torque/${latestMagazine.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Magazines */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Magazines</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {magazinesArray.map((magazine) => (
              <Card key={magazine.id} className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {magazine.title}
                        {magazine.isLatest && <Star className="h-4 w-4 text-orange-600" />}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {magazine.year}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(magazine.filePath, '_blank')}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/torque/${magazine.id}/edit`)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMagazine(magazine.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {magazine.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{magazine.pages} pages</span>
                    <span>{magazine.articles} articles</span>
                    <span>{formatFileSize(magazine.fileSize)}</span>
                  </div>
                  <div className="flex gap-2">
                    {!magazine.isLatest && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetLatest(magazine.id)}
                        className="text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Set as Latest
                      </Button>
                    )}
                    {magazine.isLatest && (
                      <Badge variant="default" className="bg-orange-600">
                        Latest
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {magazinesArray.length === 0 && !isLoading && !error && (
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No magazines found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by uploading your first Torque magazine.
              </p>
              <Button onClick={() => router.push('/admin/torque/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Magazine
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
