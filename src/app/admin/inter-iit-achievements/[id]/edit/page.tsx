"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { 
  achievementTypes, 
  competitionCategories, 
  teamMemberRoles, 
  academicBranches, 
  academicYears, 
  iitList, 
  achievementStatuses,
  TeamMember,
  InterIITAchievement 
} from "@/lib/inter-iit-achievements-data";

interface FormData {
  achievementType: string;
  competitionName: string;
  interIITEdition: string;
  year: string;
  hostIIT: string;
  location: string;
  ranking: number | null;
  achievementDescription: string;
  significance: string;
  competitionCategory: string;
  achievementDate: string;
  points: number | null;
  status: string;
}

export default function EditInterIITAchievementPage() {
  const router = useRouter();
  const params = useParams();
  const achievementId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    achievementType: "",
    competitionName: "",
    interIITEdition: "",
    year: "",
    hostIIT: "",
    location: "",
    ranking: null,
    achievementDescription: "",
    significance: "",
    competitionCategory: "",
    achievementDate: "",
    points: null,
    status: "verified"
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Load existing achievement data
  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        
        const response = await fetch(`/api/admin/inter-iit-achievements/${achievementId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch achievement data");
        }
        
        const achievement: InterIITAchievement = await response.json();
        
        // Populate form data
        setFormData({
          achievementType: achievement.achievementType,
          competitionName: achievement.competitionName,
          interIITEdition: achievement.interIITEdition,
          year: achievement.year,
          hostIIT: achievement.hostIIT,
          location: achievement.location,
          ranking: achievement.ranking || null,
          achievementDescription: achievement.achievementDescription,
          significance: achievement.significance,
          competitionCategory: achievement.competitionCategory,
          achievementDate: achievement.achievementDate,
          points: achievement.points || null,
          status: achievement.status
        });
        
        setTeamMembers(achievement.teamMembers);
      } catch (error) {
        console.error("Error fetching achievement:", error);
        setError("Failed to load achievement data. Please try again.");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (achievementId) {
      fetchAchievement();
    }
  }, [achievementId]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: any) => {
    setTeamMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
  };

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, {
      name: "",
      rollNumber: "",
      branch: "",
      year: "",
      role: "Member",
      email: "",
      phone: "",
      achievements: []
    }]);
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields: (keyof FormData)[] = [
      'achievementType', 'competitionName', 'interIITEdition', 'year',
      'hostIIT', 'location', 'achievementDescription', 'significance',
      'competitionCategory', 'achievementDate', 'status'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    // Validate team members
    const validTeamMembers = teamMembers.filter(member => 
      member.name.trim() && member.rollNumber.trim() && member.email.trim()
    );

    if (validTeamMembers.length === 0) {
      alert("Please add at least one team member with name, roll number, and email");
      return;
    }

    // Validate ranking for ranking achievements
    if (formData.achievementType === 'ranking' && (!formData.ranking || formData.ranking < 1)) {
      alert("Please provide a valid ranking for ranking achievements");
      return;
    }

    setIsLoading(true);

    try {
      const achievementData = {
        ...formData,
        teamMembers: validTeamMembers,
        supportingDocuments: [] // Keep existing documents for now
      };

      const response = await fetch(`/api/admin/inter-iit-achievements/${achievementId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(achievementData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update Inter-IIT achievement");
      }

      alert("Inter-IIT achievement updated successfully!");
      router.push("/admin/inter-iit-achievements");
    } catch (error) {
      console.error("Error updating Inter-IIT achievement:", error);
      alert(error instanceof Error ? error.message : "Failed to update Inter-IIT achievement");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading achievement data...</p>
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
          <Link href="/admin/inter-iit-achievements">
            <Button variant="outline">
              Back to Achievements
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/inter-iit-achievements">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Achievements
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Edit Inter-IIT Achievement
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update the Inter-IIT Tech Meet achievement details
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the basic details about the Inter-IIT achievement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="competitionName">Competition Name *</Label>
                  <Input
                    id="competitionName"
                    value={formData.competitionName}
                    onChange={(e) => handleInputChange("competitionName", e.target.value)}
                    placeholder="e.g., Programming Contest"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="achievementType">Achievement Type *</Label>
                  <Select value={formData.achievementType} onValueChange={(value) => handleInputChange("achievementType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select achievement type" />
                    </SelectTrigger>
                    <SelectContent>
                      {achievementTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interIITEdition">Inter-IIT Edition *</Label>
                  <Input
                    id="interIITEdition"
                    value={formData.interIITEdition}
                    onChange={(e) => handleInputChange("interIITEdition", e.target.value)}
                    placeholder="e.g., Inter-IIT Tech Meet 12.0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    placeholder="e.g., 2023"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hostIIT">Host IIT *</Label>
                  <Select value={formData.hostIIT} onValueChange={(value) => handleInputChange("hostIIT", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select host IIT" />
                    </SelectTrigger>
                    <SelectContent>
                      {iitList.map((iit) => (
                        <SelectItem key={iit} value={iit}>
                          {iit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Chennai, Tamil Nadu"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="competitionCategory">Competition Category *</Label>
                  <Select value={formData.competitionCategory} onValueChange={(value) => handleInputChange("competitionCategory", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitionCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ranking">Ranking {formData.achievementType === 'ranking' ? '*' : '(Optional)'}</Label>
                  <Input
                    id="ranking"
                    type="number"
                    min="1"
                    value={formData.ranking || ""}
                    onChange={(e) => handleInputChange("ranking", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g., 3"
                  />
                </div>
                <div>
                  <Label htmlFor="points">Points (Optional)</Label>
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    value={formData.points || ""}
                    onChange={(e) => handleInputChange("points", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g., 95"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="achievementDate">Achievement Date *</Label>
                  <Input
                    id="achievementDate"
                    type="date"
                    value={formData.achievementDate}
                    onChange={(e) => handleInputChange("achievementDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {achievementStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Details */}
          <Card>
            <CardHeader>
              <CardTitle>Achievement Details</CardTitle>
              <CardDescription>
                Update detailed information about the achievement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="achievementDescription">Achievement Description *</Label>
                <Textarea
                  id="achievementDescription"
                  value={formData.achievementDescription}
                  onChange={(e) => handleInputChange("achievementDescription", e.target.value)}
                  placeholder="Describe the achievement in detail..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="significance">Significance *</Label>
                <Textarea
                  id="significance"
                  value={formData.significance}
                  onChange={(e) => handleInputChange("significance", e.target.value)}
                  placeholder="Explain why this achievement is important..."
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Update the team members who participated in this achievement
                  </CardDescription>
                </div>
                <Button type="button" onClick={addTeamMember} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg relative">
                  {teamMembers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTeamMember(index)}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={member.name}
                      onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Roll Number *</Label>
                    <Input
                      value={member.rollNumber}
                      onChange={(e) => handleTeamMemberChange(index, "rollNumber", e.target.value)}
                      placeholder="e.g., 21110178"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={member.email}
                      onChange={(e) => handleTeamMemberChange(index, "email", e.target.value)}
                      placeholder="email@iitgn.ac.in"
                    />
                  </div>

                  <div>
                    <Label>Branch *</Label>
                    <Select
                      value={member.branch}
                      onValueChange={(value) => handleTeamMemberChange(index, "branch", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicBranches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year *</Label>
                    <Select
                      value={member.year}
                      onValueChange={(value) => handleTeamMemberChange(index, "year", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Role *</Label>
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleTeamMemberChange(index, "role", value as TeamMember['role'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMemberRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-3">
                    <Label>Phone (Optional)</Label>
                    <Input
                      value={member.phone || ""}
                      onChange={(e) => handleTeamMemberChange(index, "phone", e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Achievement"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
