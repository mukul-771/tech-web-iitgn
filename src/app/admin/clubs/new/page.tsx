"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { LogoUpload } from "@/components/admin/logo-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { clubCategories, clubTypes } from "@/lib/clubs-data";

interface TeamMember {
  name: string;
  role: string;
  email: string;
}

function NewClubPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get the type from URL parameters
  const typeParam = searchParams.get('type') as 'club' | 'hobby-group' | 'technical-council-group' | null;
  const defaultType = typeParam || 'club';

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    type: defaultType,
    category: "",
    email: "",
    members: "",
    established: "",
    logoPath: ""
  });
  const [achievements, setAchievements] = useState<string[]>([""]);
  const [projects, setProjects] = useState<string[]>([""]);
  const [team, setTeam] = useState<TeamMember[]>([{ name: "", role: "", email: "" }]);

  // Update form type when URL parameter changes
  useEffect(() => {
    if (typeParam && typeParam !== formData.type) {
      setFormData(prev => ({ ...prev, type: typeParam }));
    }
  }, [typeParam, formData.type]);

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

    const entityType = formData.type === 'club' ? 'Club' :
                       formData.type === 'hobby-group' ? 'Hobby Group' :
                       'Technical Council Group';

    try {
      // Validate required fields
      const entityType = formData.type === 'club' ? 'Club' :
                        formData.type === 'hobby-group' ? 'Hobby Group' :
                        'Technical Council Group';
      if (!formData.name.trim()) {
        alert(`${entityType} name is required`);
        return;
      }
      if (!formData.description.trim()) {
        alert(`${entityType} description is required`);
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

      const response = await fetch("/api/admin/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clubData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create club");
      }

      alert(`${entityType} created successfully!`);
      router.push("/admin/clubs");
    } catch (error) {
      console.error(`Error creating ${entityType.toLowerCase()}:`, error);
      alert(error instanceof Error ? error.message : `Failed to create ${entityType.toLowerCase()}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

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
              Create New {formData.type === 'club' ? 'Club' :
                         formData.type === 'hobby-group' ? 'Hobby Group' :
                         'Technical Council Group'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new {formData.type === 'club' ? 'technical club' :
                        formData.type === 'hobby-group' ? 'hobby group' :
                        'technical council group'}
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
                  <Label htmlFor="name">{formData.type === 'club' ? 'Club' :
                                                   formData.type === 'hobby-group' ? 'Hobby Group' :
                                                   'Technical Council Group'} Name *</Label>
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
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clubCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                clubId={formData.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') || 'new-club'}
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
              {isLoading ? "Creating..." : `Create ${formData.type === 'club' ? 'Club' :
                                                    formData.type === 'hobby-group' ? 'Hobby Group' :
                                                    'Technical Council Group'}`}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default function NewClubPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewClubPageContent />
    </Suspense>
  );
}
