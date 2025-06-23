"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { LogoUpload } from "@/components/admin/logo-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { clubTypes, Club } from "@/lib/clubs-data";

interface TeamMember {
  name: string;
  role: string;
  email: string;
}

export default function EditClubPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [club, setClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    type: "club" as "club" | "hobby-group" | "technical-council-group",
    category: "",
    email: "",
    members: "",
    established: "",
    logoPath: ""
  });
  const [achievements, setAchievements] = useState<string[]>([""]);
  const [projects, setProjects] = useState<string[]>([""]);
  const [team, setTeam] = useState<TeamMember[]>([{ name: "", role: "", email: "" }]);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        setIsLoadingData(true);
        const response = await fetch(`/api/admin/clubs/${clubId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch club");
        }

        const clubData = await response.json();
        setClub(clubData);

        // Populate form data
        setFormData({
          name: clubData.name,
          description: clubData.description,
          longDescription: clubData.longDescription,
          type: clubData.type,
          category: clubData.category,
          email: clubData.email,
          members: clubData.members || "",
          established: clubData.established || "",
          logoPath: clubData.logoPath || ""
        });

        setAchievements(clubData.achievements.length > 0 ? clubData.achievements : [""]);
        setProjects(clubData.projects.length > 0 ? clubData.projects : [""]);
        setTeam(clubData.team.length > 0 ? clubData.team : [{ name: "", role: "", email: "" }]);

      } catch (error) {
        console.error("Error fetching club:", error);
        alert("Failed to load club data");
        router.push("/admin/clubs");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchClubData();
  }, [clubId, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUploaded = (logoUrl: string) => {
    setFormData(prev => ({ ...prev, logoPath: logoUrl }));
  };

  const handleLogoRemoved = () => {
    setFormData(prev => ({ ...prev, logoPath: "" }));
  };

  const handleArrayChange = (
    array: string[],
    setArray: (arr: string[]) => void,
    index: number,
    value: string
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  const addArrayItem = (array: string[], setArray: (arr: string[]) => void) => {
    setArray([...array, ""]);
  };

  const removeArrayItem = (array: string[], setArray: (arr: string[]) => void, index: number) => {
    if (array.length > 1) {
      setArray(array.filter((_, i) => i !== index));
    }
  };

  const handleTeamChange = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...team];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setTeam(newTeam);
  };

  const addTeamMember = () => {
    setTeam([...team, { name: "", role: "", email: "" }]);
  };

  const removeTeamMember = (index: number) => {
    if (team.length > 1) {
      setTeam(team.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert("Club name is required");
        return;
      }
      if (!formData.description.trim()) {
        alert("Club description is required");
        return;
      }
      if (!formData.longDescription.trim()) {
        alert("Long description is required");
        return;
      }
      if (!formData.email.trim()) {
        alert("Email is required");
        return;
      }
      if (!formData.category.trim()) {
        alert("Category is required");
        return;
      }

      // Validate team members
      const validTeam = team.filter(t => t.name.trim() !== "" && t.role.trim() !== "" && t.email.trim() !== "");
      if (validTeam.length === 0) {
        alert("At least one team member is required");
        return;
      }

      // Check for Secretary role
      const hasSecretary = validTeam.some(t => t.role === "Secretary");
      if (!hasSecretary) {
        alert("At least one team member must have the Secretary role");
        return;
      }

      const clubData = {
        ...formData,
        achievements: achievements.filter(a => a.trim() !== ""),
        projects: projects.filter(p => p.trim() !== ""),
        team: validTeam
      };

      const response = await fetch(`/api/admin/clubs/${clubId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clubData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          clubData
        });
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      alert("Club updated successfully!");
      router.push("/admin/clubs");
    } catch (error) {
      console.error("Error updating club:", error);
      alert(error instanceof Error ? error.message : "Failed to update club. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading club data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!club) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Club not found</h1>
          <Button onClick={() => router.push("/admin/clubs")} className="mt-4">
            Back to Clubs
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Edit Club: {club.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update club information and details
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Club Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clubTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="e.g., Software Development, Gaming & Sports Technology"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="established">Established Year</Label>
                  <Input
                    id="established"
                    value={formData.established}
                    onChange={(e) => handleInputChange("established", e.target.value)}
                    placeholder="2020"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="members">Member Count</Label>
                  <Input
                    id="members"
                    value={formData.members}
                    onChange={(e) => handleInputChange("members", e.target.value)}
                    placeholder="50+"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <LogoUpload
                clubId={clubId}
                clubType={formData.type}
                currentLogoUrl={formData.logoPath}
                onLogoUploaded={handleLogoUploaded}
                onLogoRemoved={handleLogoRemoved}
              />

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="longDescription">Long Description *</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange("longDescription", e.target.value)}
                  required
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={achievement}
                    onChange={(e) => handleArrayChange(achievements, setAchievements, index, e.target.value)}
                    placeholder="Enter achievement"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(achievements, setAchievements, index)}
                    disabled={achievements.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem(achievements, setAchievements)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={project}
                    onChange={(e) => handleArrayChange(projects, setProjects, index, e.target.value)}
                    placeholder="Enter project"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(projects, setProjects, index)}
                    disabled={projects.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem(projects, setProjects)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {team.map((member, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-4 p-4 border rounded-lg">
                  <Input
                    value={member.name}
                    onChange={(e) => handleTeamChange(index, "name", e.target.value)}
                    placeholder="Name"
                  />
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleTeamChange(index, "role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Secretary">Secretary</SelectItem>
                      <SelectItem value="General Member">General Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="email"
                    value={member.email}
                    onChange={(e) => handleTeamChange(index, "email", e.target.value)}
                    placeholder="Email"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTeamMember(index)}
                    disabled={team.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTeamMember}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Club"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
