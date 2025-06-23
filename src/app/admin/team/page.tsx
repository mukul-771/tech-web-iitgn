"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Users, 
  Crown,
  Star,
  User
} from "lucide-react";
import { TeamMember, defaultTeamData } from "@/lib/team-data";
import { TeamMemberImage } from "@/components/ui/team-member-image";

export default function TeamManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    fetchTeamMembers();
  }, [session, status, router]);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Load team data from API
      const response = await fetch('/api/team');
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch team members");
      // Fallback to default data
      setTeamMembers(defaultTeamData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) {
      return;
    }
    try {
      // For now, just remove from local state
      // In a real app, you'd want to update the JSON file via an API
      setTeamMembers(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
      alert("Team member removed from view. Note: This is temporary without a backend.");
    } catch (error) {
      console.error("Error deleting team member:", error);
      alert("Failed to delete team member");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "leadership":
        return <Crown className="h-4 w-4" />;
      case "coordinator":
        return <Star className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "leadership":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "coordinator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "general":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "design":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      case "social":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const groupedMembers = Object.values(teamMembers).reduce((acc, member) => {
    if (!acc[member.category]) {
      acc[member.category] = [];
    }
    acc[member.category].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  // Sort categories in desired order
  const categoryOrder = ["leadership", "coordinator", "general", "design", "social"];
  const sortedCategories = categoryOrder.filter(cat => groupedMembers[cat]);

  if (status === "loading" || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Team Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage team members, roles, and profile information
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchTeamMembers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => router.push('/admin/team/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Team Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(teamMembers).length}</p>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {sortedCategories.map(category => (
            <Card key={category} className="glass">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <div>
                    <p className="text-2xl font-bold">{groupedMembers[category].length}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {category === "leadership" ? "Leadership" : 
                       category === "coordinator" ? "Coordinators" :
                       category === "general" ? "General Members" :
                       category === "design" ? "Design Team" :
                       "Social Media Team"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Members by Category */}
        {sortedCategories.map(category => (
          <Card key={category} className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <span className="capitalize">
                  {category === "leadership" ? "Leadership Team" : 
                   category === "coordinator" ? "Coordinators" :
                   category === "general" ? "General Council Members" :
                   category === "design" ? "Design Team" :
                   "Social Media Team"}
                </span>
                <Badge variant="secondary">{groupedMembers[category].length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedMembers[category].map((member) => (
                  <Card key={member.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {/* Profile Photo */}
                        <div className="flex-shrink-0">
                          <TeamMemberImage
                            src={member.photoPath}
                            alt={member.name}
                            initials={member.initials}
                            gradientFrom={member.gradientFrom}
                            gradientTo={member.gradientTo}
                            width={member.isSecretary ? 60 : 48}
                            height={member.isSecretary ? 60 : 48}
                            className={`rounded-lg ${member.isSecretary ? 'w-15 h-15' : 'w-12 h-12'}`}
                          />
                        </div>

                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-sm truncate">{member.name}</h3>
                              <p className="text-xs text-muted-foreground">{member.position}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                            <Badge className={`text-xs ${getCategoryColor(member.category)}`}>
                              {member.category}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-1 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/team/${member.id}/edit`)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}


