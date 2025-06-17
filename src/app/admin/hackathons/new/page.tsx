"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { hackathonCategories, hackathonStatuses, prizePositions, organizerRoles, sponsorTiers } from "@/lib/hackathons-data";
import { ImageUpload } from "@/components/admin/image-upload";

interface Prize {
  position: string;
  amount: string;
  description?: string;
}

interface Organizer {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

interface ScheduleItem {
  time: string;
  activity: string;
  description?: string;
  location?: string;
}

interface Sponsor {
  name: string;
  logoPath?: string;
  website?: string;
  tier: string;
}

export default function NewHackathonPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
    registrationLink: "",
    status: "upcoming" as const,
    category: "",
    logoPath: "",
    bannerPath: ""
  });

  const [prizes, setPrizes] = useState<Prize[]>([{ position: "", amount: "", description: "" }]);
  const [organizers, setOrganizers] = useState<Organizer[]>([{ name: "", role: "", email: "", phone: "" }]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([{ time: "", activity: "", description: "", location: "" }]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([{ name: "", tier: "", website: "" }]);
  const [gallery, setGallery] = useState<Array<{ id: string; url: string; alt: string; caption?: string }>>([]);
  const [newGalleryItem, setNewGalleryItem] = useState({
    url: "",
    alt: "",
    caption: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrizeChange = (index: number, field: keyof Prize, value: string) => {
    const newPrizes = [...prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setPrizes(newPrizes);
  };

  const addPrize = () => {
    setPrizes([...prizes, { position: "", amount: "", description: "" }]);
  };

  const removePrize = (index: number) => {
    if (prizes.length > 1) {
      setPrizes(prizes.filter((_, i) => i !== index));
    }
  };

  const handleOrganizerChange = (index: number, field: keyof Organizer, value: string) => {
    const newOrganizers = [...organizers];
    newOrganizers[index] = { ...newOrganizers[index], [field]: value };
    setOrganizers(newOrganizers);
  };

  const addOrganizer = () => {
    setOrganizers([...organizers, { name: "", role: "", email: "", phone: "" }]);
  };

  const removeOrganizer = (index: number) => {
    if (organizers.length > 1) {
      setOrganizers(organizers.filter((_, i) => i !== index));
    }
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const handleScheduleChange = (index: number, field: keyof ScheduleItem, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const addScheduleItem = () => {
    setSchedule([...schedule, { time: "", activity: "", description: "", location: "" }]);
  };

  const removeScheduleItem = (index: number) => {
    if (schedule.length > 1) {
      setSchedule(schedule.filter((_, i) => i !== index));
    }
  };

  const handleSponsorChange = (index: number, field: keyof Sponsor, value: string) => {
    const newSponsors = [...sponsors];
    newSponsors[index] = { ...newSponsors[index], [field]: value };
    setSponsors(newSponsors);
  };

  const addSponsor = () => {
    setSponsors([...sponsors, { name: "", tier: "", website: "" }]);
  };

  const removeSponsor = (index: number) => {
    if (sponsors.length > 1) {
      setSponsors(sponsors.filter((_, i) => i !== index));
    }
  };

  const addGalleryItem = () => {
    if (newGalleryItem.url.trim() && newGalleryItem.alt.trim()) {
      const newItem = {
        id: Date.now().toString(),
        url: newGalleryItem.url.trim(),
        alt: newGalleryItem.alt.trim(),
        caption: newGalleryItem.caption.trim() || undefined
      };

      setGallery(prev => [...prev, newItem]);
      setNewGalleryItem({ url: "", alt: "", caption: "" });
    }
  };

  const removeGalleryItem = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert("Hackathon name is required");
        return;
      }
      if (!formData.description.trim()) {
        alert("Hackathon description is required");
        return;
      }
      if (!formData.longDescription.trim()) {
        alert("Long description is required");
        return;
      }
      if (!formData.date.trim()) {
        alert("Date is required");
        return;
      }
      if (!formData.location.trim()) {
        alert("Location is required");
        return;
      }
      if (!formData.category.trim()) {
        alert("Category is required");
        return;
      }

      // Validate organizers
      const validOrganizers = organizers.filter(o => o.name.trim() !== "" && o.role.trim() !== "" && o.email.trim() !== "");
      if (validOrganizers.length === 0) {
        alert("At least one organizer is required");
        return;
      }

      const hackathonData = {
        ...formData,
        prizes: prizes.filter(p => p.position.trim() !== "" && p.amount.trim() !== ""),
        organizers: validOrganizers,
        requirements: requirements.filter(r => r.trim() !== ""),
        schedule: schedule.filter(s => s.time.trim() !== "" && s.activity.trim() !== ""),
        sponsors: sponsors.filter(s => s.name.trim() !== "" && s.tier.trim() !== ""),
        winners: [],
        gallery: gallery
      };

      const response = await fetch("/api/admin/hackathons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hackathonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create hackathon");
      }

      alert("Hackathon created successfully!");
      router.push("/admin/hackathons");
    } catch (error) {
      console.error("Error creating hackathon:", error);
      alert(error instanceof Error ? error.message : "Failed to create hackathon. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/hackathons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hackathons
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Create New Hackathon
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new hackathon or competition event
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details about the hackathon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Hackathon Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
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

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the hackathon"
                  required
                />
              </div>

              <div>
                <Label htmlFor="longDescription">Long Description *</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange("longDescription", e.target.value)}
                  placeholder="Detailed description of the hackathon"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathonStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="registrationLink">Registration Link</Label>
                  <Input
                    id="registrationLink"
                    type="url"
                    value={formData.registrationLink}
                    onChange={(e) => handleInputChange("registrationLink", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Specify the event timing and logistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Event Date *</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    placeholder="e.g., March 15-17, 2024"
                    required
                  />
                </div>
                <div>
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
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Computer Center, IIT Gandhinagar"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="e.g., 48 hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                    placeholder="e.g., 300"
                  />
                </div>
                <div>
                  <Label htmlFor="currentParticipants">Current Participants</Label>
                  <Input
                    id="currentParticipants"
                    value={formData.currentParticipants}
                    onChange={(e) => handleInputChange("currentParticipants", e.target.value)}
                    placeholder="e.g., 150"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card>
            <CardHeader>
              <CardTitle>Prizes</CardTitle>
              <CardDescription>
                Add prize information for the hackathon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prizes.map((prize, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Position</Label>
                    <Select
                      value={prize.position}
                      onValueChange={(value) => handlePrizeChange(index, "position", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {prizePositions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Amount</Label>
                    <Input
                      value={prize.amount}
                      onChange={(e) => handlePrizeChange(index, "amount", e.target.value)}
                      placeholder="e.g., ₹50,000"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Description</Label>
                    <Input
                      value={prize.description || ""}
                      onChange={(e) => handlePrizeChange(index, "description", e.target.value)}
                      placeholder="Prize description"
                    />
                  </div>
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
                Add organizing team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {organizers.map((organizer, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={organizer.name}
                      onChange={(e) => handleOrganizerChange(index, "name", e.target.value)}
                      placeholder="Organizer name"
                    />
                  </div>
                  <div>
                    <Label>Role *</Label>
                    <Select
                      value={organizer.role}
                      onValueChange={(value) => handleOrganizerChange(index, "role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizerRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={organizer.email}
                      onChange={(e) => handleOrganizerChange(index, "email", e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Phone</Label>
                      <Input
                        value={organizer.phone || ""}
                        onChange={(e) => handleOrganizerChange(index, "phone", e.target.value)}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOrganizer(index)}
                      disabled={organizers.length === 1}
                      className="mt-6"
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
                List the requirements for participation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <Input
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder="e.g., Team of 2-4 members"
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
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Hackathon"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
