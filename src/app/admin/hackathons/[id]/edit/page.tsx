"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Hackathon, hackathonCategories, hackathonStatuses, expandBasicHackathon } from "@/lib/hackathons-data";
import { Combobox } from "@/components/ui/combobox";
import { BasicHackathon } from "@/lib/hackathons-storage";

export default function EditHackathonPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    date: "",
    location: "",
    category: "",
    status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled",
    registrationLink: "",
  });

  // Resolve params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  const fetchHackathon = useCallback(async (hackathonId: string) => {
    try {
      setIsLoading(true);
      const fetchResponse = await fetch(`/api/admin/hackathons/${hackathonId}`);
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch hackathon");
      }
      
      const data: BasicHackathon = await fetchResponse.json();
      const expandedHackathon = expandBasicHackathon(data);
      setHackathon(expandedHackathon);
      
      setFormData({
        name: expandedHackathon.name || "",
        description: expandedHackathon.description || "",
        longDescription: expandedHackathon.longDescription || "",
        date: expandedHackathon.date || "",
        location: expandedHackathon.location || "",
        category: expandedHackathon.category || "",
        status: expandedHackathon.status || "upcoming",
        registrationLink: expandedHackathon.registrationLink || "",
      });

    } catch (error) {
      console.error("Error fetching hackathon:", error);
      alert("Failed to load hackathon data");
      router.push("/admin/hackathons");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (id) {
      fetchHackathon(id);
    }
  }, [id, fetchHackathon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !formData.name.trim() || !formData.description.trim() || !formData.longDescription.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      const updateResponse = await fetch(`/api/admin/hackathons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || "Failed to update hackathon");
      }

      alert("Hackathon updated successfully!");
      router.push("/admin/hackathons");
    } catch (error) {
      console.error("Error updating hackathon:", error);
      alert(error instanceof Error ? error.message : "Failed to update hackathon");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading hackathon...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!hackathon) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-red-600 mb-4">Hackathon not found</p>
          <Button onClick={() => router.push("/admin/hackathons")} variant="outline">
            Back to Hackathons
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const categoryOptions = hackathonCategories.map(c => ({ label: c, value: c }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/hackathons")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hackathons
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-space-grotesk">
                Edit Hackathon
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Update hackathon details and information
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => id && window.open(`/hackathons/${id}`, '_blank')}
              disabled={!id}
            >
              View Public Page
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about the hackathon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter hackathon name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    placeholder="e.g., October 26-27, 2024"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="A brief summary of the hackathon (for cards)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description *</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange("longDescription", e.target.value)}
                  placeholder="Full details about the hackathon (for the main page)"
                  required
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathonStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Combobox
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(value) => handleInputChange("category", value)}
                    customInput
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Online or SAC, IIT Bombay"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationLink">Registration Link</Label>
                  <Input
                    id="registrationLink"
                    value={formData.registrationLink}
                    onChange={(e) => handleInputChange("registrationLink", e.target.value)}
                    placeholder="https://forms.gle/example"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/hackathons")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
