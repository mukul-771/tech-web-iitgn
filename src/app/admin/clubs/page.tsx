"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Building } from "lucide-react";
import { Club } from "@/lib/clubs-data";

export default function ClubsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    fetchClubs();
  }, [session, status, router]);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/clubs");
      if (!response.ok) {
        throw new Error("Failed to fetch clubs");
      }
      
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      setError("Failed to load clubs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    if (!confirm("Are you sure you want to delete this club?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/clubs/${clubId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete club");
      }

      await fetchClubs();
    } catch (error) {
      console.error("Error deleting club:", error);
      alert("Failed to delete club");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading clubs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const clubsArray = Object.values(clubs);
  const technicalClubs = clubsArray.filter(club => club.type === "club");
  const hobbyGroups = clubsArray.filter(club => club.type === "hobby-group");
  const technicalCouncilGroups = clubsArray.filter(club => club.type === "technical-council-group");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Clubs Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage technical clubs, hobby groups, and technical council groups
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/admin/clubs/new?type=club')}>
              <Plus className="h-4 w-4 mr-2" />
              New Club
            </Button>
            <Button onClick={() => router.push('/admin/clubs/new?type=hobby-group')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Hobby Group
            </Button>
            <Button onClick={() => router.push('/admin/clubs/new?type=technical-council-group')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Technical Council Group
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={fetchClubs} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clubsArray.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Technical Clubs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{technicalClubs.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Technical Council Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{technicalCouncilGroups.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hobby Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hobbyGroups.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Clubs Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Technical Clubs</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {technicalClubs.map((club) => (
              <Card key={club.id} className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{club.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {club.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/clubs/${club.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClub(club.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {club.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{club.members || "N/A"} members</span>
                    <span>Est. {club.established || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Council Groups Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Groups under Technical Council</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {technicalCouncilGroups.map((group) => (
              <Card key={group.id} className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge variant="default" className="mt-1 bg-green-600">
                        {group.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/clubs/${group.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClub(group.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {group.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{group.members || "N/A"} members</span>
                    <span>Est. {group.established || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Hobby Groups Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Hobby Groups</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hobbyGroups.map((club) => (
              <Card key={club.id} className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{club.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {club.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/clubs/${club.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClub(club.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {club.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{club.members || "N/A"} members</span>
                    <span>Est. {club.established || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {clubsArray.length === 0 && !isLoading && !error && (
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clubs found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first club or hobby group.
              </p>
              <Button onClick={() => router.push('/admin/clubs/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Club
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
