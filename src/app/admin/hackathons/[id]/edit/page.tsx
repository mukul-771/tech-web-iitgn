"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Hackathon, hackathonCategories } from "@/lib/hackathons-data";

interface EditHackathonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditHackathonPage({ params }: EditHackathonPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [hackathonId, setHackathonId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    date: "",
    registrationDeadline: "",
    location: "",
    duration: "",
    maxParticipants: "",
    currentParticipants: "",
    category: "",
    status: "upcoming" as const,
    registrationLink: "",
  });

  const [prizes, setPrizes] = useState([{ position: "", amount: "", description: "" }]);
  const [organizers, setOrganizers] = useState([{ name: "", role: "", email: "", phone: "" }]);
  const [requirements, setRequirements] = useState([""]);
  const [schedule, setSchedule] = useState([{ time: "", activity: "", description: "", location: "" }]);
  const [sponsors, setSponsors] = useState([{ name: "", tier: "partner" as const, website: "" }]);

  useEffect(() => {
    const initializeParams = async () => {
      const { id } = await params;
      setHackathonId(id);
      fetchHackathon(id);
    };
    initializeParams();
  }, [params]);

  const fetchHackathon = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/hackathons/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch hackathon");
      }
      
      const data = await response.json();
      setHackathon(data);
      
      // Populate form data
      setFormData({
        name: data.name || "",
        description: data.description || "",
        longDescription: data.longDescription || "",
        date: data.date || "",
        registrationDeadline: data.registrationDeadline || "",
        location: data.location || "",
        duration: data.duration || "",
        maxParticipants: data.maxParticipants || "",
        currentParticipants: data.currentParticipants || "",
        category: data.category || "",
        status: data.status || "upcoming",
        registrationLink: data.registrationLink || "",
      });

      setPrizes(data.prizes?.length > 0 ? data.prizes : [{ position: "", amount: "", description: "" }]);
      setOrganizers(data.organizers?.length > 0 ? data.organizers : [{ name: "", role: "", email: "", phone: "" }]);
      setRequirements(data.requirements?.length > 0 ? data.requirements : [""]);
      setSchedule(data.schedule?.length > 0 ? data.schedule : [{ time: "", activity: "", description: "", location: "" }]);
      setSponsors(data.sponsors?.length > 0 ? data.sponsors : [{ name: "", tier: "partner", website: "" }]);
    } catch (error) {
      console.error("Error fetching hackathon:", error);
      alert("Failed to load hackathon data");
      router.push("/admin/hackathons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.longDescription.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      const hackathonData = {
        ...formData,
        prizes: prizes.filter(p => p.position.trim() !== "" && p.amount.trim() !== ""),
        organizers: organizers.filter(o => o.name.trim() !== "" && o.email.trim() !== ""),
        requirements: requirements.filter(r => r.trim() !== ""),
        schedule: schedule.filter(s => s.time.trim() !== "" && s.activity.trim() !== ""),
        sponsors: sponsors.filter(s => s.name.trim() !== ""),
      };

      const response = await fetch(`/api/admin/hackathons/${hackathonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hackathonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPrize = () => {
    setPrizes([...prizes, { position: "", amount: "", description: "" }]);
  };

  const removePrize = (index: number) => {
    if (prizes.length > 1) {
      setPrizes(prizes.filter((_, i) => i !== index));
    }
  };

  const addOrganizer = () => {
    setOrganizers([...organizers, { name: "", role: "", email: "", phone: "" }]);
  };

  const removeOrganizer = (index: number) => {
    if (organizers.length > 1) {
      setOrganizers(organizers.filter((_, i) => i !== index));
    }
  };

  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const addScheduleItem = () => {
    setSchedule([...schedule, { time: "", activity: "", description: "", location: "" }]);
  };

  const removeScheduleItem = (index: number) => {
    if (schedule.length > 1) {
      setSchedule(schedule.filter((_, i) => i !== index));
    }
  };

  const addSponsor = () => {
    setSponsors([...sponsors, { name: "", tier: "partner", website: "" }]);
  };

  const removeSponsor = (index: number) => {
    if (sponsors.length > 1) {
      setSponsors(sponsors.filter((_, i) => i !== index));
    }
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
              onClick={() => window.open(`/hackathons/${hackathonId}`, '_blank')}
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
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathonCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the hackathon"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description *</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange("longDescription", e.target.value)}
                  placeholder="Detailed description of the hackathon"
                  rows={5}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Date, location, and logistics information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    placeholder="e.g., March 15-17, 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                    placeholder="e.g., March 10, 2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., IIT Gandhinagar"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="e.g., 48 hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                    placeholder="e.g., 200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentParticipants">Current Participants</Label>
                  <Input
                    id="currentParticipants"
                    value={formData.currentParticipants}
                    onChange={(e) => handleInputChange("currentParticipants", e.target.value)}
                    placeholder="e.g., 150"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationLink">Registration Link</Label>
                <Input
                  id="registrationLink"
                  value={formData.registrationLink}
                  onChange={(e) => handleInputChange("registrationLink", e.target.value)}
                  placeholder="https://forms.google.com/..."
                  type="url"
                />
              </div>
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card>
            <CardHeader>
              <CardTitle>Prizes</CardTitle>
              <CardDescription>
                Prize structure for the hackathon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prizes.map((prize, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={prize.position}
                      onChange={(e) => {
                        const newPrizes = [...prizes];
                        newPrizes[index].position = e.target.value;
                        setPrizes(newPrizes);
                      }}
                      placeholder="e.g., 1st Place"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      value={prize.amount}
                      onChange={(e) => {
                        const newPrizes = [...prizes];
                        newPrizes[index].amount = e.target.value;
                        setPrizes(newPrizes);
                      }}
                      placeholder="e.g., ₹50,000"
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePrize(index)}
                      disabled={prizes.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPrize}>
                <Plus className="h-4 w-4 mr-2" />
                Add Prize
              </Button>
            </CardContent>
          </Card>

          {/* Organizers */}
          <Card>
            <CardHeader>
              <CardTitle>Organizers</CardTitle>
              <CardDescription>
                Contact information for event organizers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {organizers.map((organizer, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={organizer.name}
                      onChange={(e) => {
                        const newOrganizers = [...organizers];
                        newOrganizers[index].name = e.target.value;
                        setOrganizers(newOrganizers);
                      }}
                      placeholder="Organizer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={organizer.role}
                      onChange={(e) => {
                        const newOrganizers = [...organizers];
                        newOrganizers[index].role = e.target.value;
                        setOrganizers(newOrganizers);
                      }}
                      placeholder="e.g., Event Coordinator"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={organizer.email}
                      onChange={(e) => {
                        const newOrganizers = [...organizers];
                        newOrganizers[index].email = e.target.value;
                        setOrganizers(newOrganizers);
                      }}
                      placeholder="email@example.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOrganizer(index)}
                      disabled={organizers.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOrganizer}>
                <Plus className="h-4 w-4 mr-2" />
                Add Organizer
              </Button>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                Participation requirements and guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => {
                      const newRequirements = [...requirements];
                      newRequirements[index] = e.target.value;
                      setRequirements(newRequirements);
                    }}
                    placeholder="Enter requirement"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                    disabled={requirements.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addRequirement}>
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/hackathons")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Hackathon"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
