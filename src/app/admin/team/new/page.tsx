"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { TeamPhotoUpload } from "@/components/admin/team-photo-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  teamCategories,
  positionTypes,
  getCategoryFromPosition,
  isSecretaryPosition,
  isCoordinatorPosition
} from "@/lib/team-data";
import { createTeamMember } from "@/lib/team-firebase";

interface FormData {
  name: string;
  email: string;
  position: string;
  category: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  photoPath: string;
  isSecretary: boolean;
  isCoordinator: boolean;
}

const gradientOptions = [
  { from: "from-blue-600", to: "to-purple-600", label: "Blue to Purple" },
  { from: "from-blue-600", to: "to-indigo-600", label: "Blue to Indigo" },
  { from: "from-purple-600", to: "to-pink-600", label: "Purple to Pink" },
  { from: "from-green-600", to: "to-teal-600", label: "Green to Teal" },
  { from: "from-emerald-600", to: "to-teal-600", label: "Emerald to Teal" },
  { from: "from-orange-600", to: "to-red-600", label: "Orange to Red" },
  { from: "from-pink-600", to: "to-rose-600", label: "Pink to Rose" },
  { from: "from-indigo-600", to: "to-purple-600", label: "Indigo to Purple" },
];

export default function NewTeamMemberPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    position: "",
    category: "",
    initials: "",
    gradientFrom: "from-blue-600",
    gradientTo: "to-purple-600",
    photoPath: "",
    isSecretary: false,
    isCoordinator: false,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }
  }, [session, status, router]);

  // Auto-generate initials when name changes
  useEffect(() => {
    if (formData.name) {
      const initials = formData.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 3); // Limit to 3 characters
      setFormData(prev => ({ ...prev, initials }));
    }
  }, [formData.name]);

  // Auto-set category and flags based on position
  useEffect(() => {
    if (formData.position) {
      const category = getCategoryFromPosition(formData.position);
      const isSecretary = isSecretaryPosition(formData.position);
      const isCoordinator = isCoordinatorPosition(formData.position);

      setFormData(prev => ({
        ...prev,
        category,
        isSecretary,
        isCoordinator
      }));
    }
  }, [formData.position]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGradientChange = (value: string) => {
    const gradient = gradientOptions.find(g => `${g.from}-${g.to}` === value);
    if (gradient) {
      setFormData(prev => ({
        ...prev,
        gradientFrom: gradient.from,
        gradientTo: gradient.to,
      }));
    }
  };

  const handlePhotoUploaded = (photoUrl: string) => {
    setFormData(prev => ({ ...prev, photoPath: photoUrl }));
  };

  const handlePhotoRemoved = () => {
    setFormData(prev => ({ ...prev, photoPath: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.position || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Remove id, createdAt, updatedAt if present
      const { name, email, position, category, initials, gradientFrom, gradientTo, photoPath, isSecretary, isCoordinator } = formData;
      await createTeamMember({
        name,
        email,
        position,
        category,
        initials,
        gradientFrom,
        gradientTo,
        photoPath,
        isSecretary,
        isCoordinator,
      });
      router.push("/admin/team");
    } catch (error) {
      console.error("Error creating team member:", error);
      alert(error instanceof Error ? error.message : "Failed to create team member");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
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
            variant="outline"
            onClick={() => router.push("/admin/team")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Add New Team Member
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create a new team member profile
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
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="position">Position/Role *</Label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange("position", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionTypes.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category (Auto-assigned)</Label>
                  <Input
                    id="category"
                    value={teamCategories.find(cat => cat.id === formData.category)?.name || formData.category}
                    disabled
                    className="bg-muted"
                    placeholder="Category will be set based on position"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Category is automatically assigned based on the selected position
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="initials">Initials</Label>
                  <Input
                    id="initials"
                    value={formData.initials}
                    onChange={(e) => handleInputChange("initials", e.target.value)}
                    placeholder="Auto-generated from name"
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="gradient">Avatar Gradient</Label>
                  <Select
                    value={`${formData.gradientFrom}-${formData.gradientTo}`}
                    onValueChange={handleGradientChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gradient" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientOptions.map((gradient) => (
                        <SelectItem key={`${gradient.from}-${gradient.to}`} value={`${gradient.from}-${gradient.to}`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded bg-gradient-to-r ${gradient.from} ${gradient.to}`} />
                            {gradient.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Photo */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamPhotoUpload
                memberId={formData.name.toLowerCase().replace(/\s+/g, '-') || 'new-member'}
                isSecretary={formData.isSecretary}
                currentPhotoUrl={formData.photoPath}
                onPhotoUploaded={handlePhotoUploaded}
                onPhotoRemoved={handlePhotoRemoved}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/team")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Member
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
