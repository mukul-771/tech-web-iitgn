"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Plus, Search, Edit, Trash2, Calendar, MapPin, Trophy, Medal, Loader2, AlertCircle, Award, Users } from "lucide-react";
import { InterIITAchievement } from "@/lib/db/schema";

export default function AdminInterIITAchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<InterIITAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/inter-iit-achievements", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch Inter-IIT achievements");
      }
      
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      console.error("Error fetching Inter-IIT achievements:", error);
      setError("Failed to load Inter-IIT achievements. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleDelete = async (id: string, competitionName: string) => {
    const confirmMessage = `Are you sure you want to delete the achievement for "${competitionName}"?\n\nThis action cannot be undone and will immediately remove the achievement from the public website.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/inter-iit-achievements/${id}`, {
        method: "DELETE",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete Inter-IIT achievement");
      }

      await fetchAchievements(); // Refresh the list
      alert("Inter-IIT achievement deleted successfully! The change is now live on the public website.");
    } catch (error) {
      console.error("Error deleting Inter-IIT achievement:", error);
      alert(error instanceof Error ? error.message : "Failed to delete Inter-IIT achievement. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAchievements = achievements.filter(achievement =>
    achievement.competitionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.achievementDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.interIITEdition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.competitionCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.teamMembers.some(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAchievementTypeColor = (type: string) => {
    switch (type) {
      case "gold-medal": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "silver-medal": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "bronze-medal": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "ranking": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "special-award": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "recognition": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending-verification": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "archived": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Calculate statistics
  const stats = {
    total: achievements.length,
    goldMedals: achievements.filter(a => a.achievementType === 'gold-medal').length,
    silverMedals: achievements.filter(a => a.achievementType === 'silver-medal').length,
    bronzeMedals: achievements.filter(a => a.achievementType === 'bronze-medal').length,
    verified: achievements.filter(a => a.status === 'verified').length
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Inter-IIT achievements...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAchievements} variant="outline">
            Try Again
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Inter-IIT Achievements
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage Inter-IIT Tech Meet achievements and accomplishments
            </p>
          </div>
          <Button onClick={() => router.push('/admin/inter-iit-achievements/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Achievement
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gold</p>
                  <p className="text-2xl font-bold">{stats.goldMedals}</p>
                </div>
                <Medal className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Silver</p>
                  <p className="text-2xl font-bold">{stats.silverMedals}</p>
                </div>
                <Medal className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bronze</p>
                  <p className="text-2xl font-bold">{stats.bronzeMedals}</p>
                </div>
                <Medal className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{stats.verified}</p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements List */}
        <div className="grid gap-6">
          {filteredAchievements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No achievements match your search criteria." : "Get started by adding your first Inter-IIT achievement."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push('/admin/inter-iit-achievements/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredAchievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">{achievement.competitionName}</CardTitle>
                        <Badge className={getAchievementTypeColor(achievement.achievementType)}>
                          {achievement.achievementType.replace('-', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(achievement.status)}>
                          {achievement.status.replace('-', ' ')}
                        </Badge>
                        {achievement.ranking && (
                          <Badge variant="outline">
                            Rank #{achievement.ranking}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">
                        {achievement.achievementDescription}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/inter-iit-achievements/${achievement.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(achievement.id, achievement.competitionName)}
                        disabled={deletingId === achievement.id}
                      >
                        {deletingId === achievement.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{achievement.interIITEdition} ({achievement.year})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{achievement.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{achievement.teamMembers.length} team member{achievement.teamMembers.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{achievement.competitionCategory}</Badge>
                    <Badge variant="outline">Host: {achievement.hostIIT}</Badge>
                    {achievement.points && (
                      <Badge variant="outline">{achievement.points} points</Badge>
                    )}
                    {achievement.supportingDocuments.length > 0 && (
                      <Badge variant="outline">{achievement.supportingDocuments.length} document{achievement.supportingDocuments.length !== 1 ? 's' : ''}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
