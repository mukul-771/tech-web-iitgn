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
import { iitList, competitionCategories, teamRoles, participantRoles, academicBranches, academicYears } from "@/lib/inter-iit-data";

interface CompetitionEvent {
  id: string;
  name: string;
  category: string;
  description: string;
  date: string;
  venue: string;
  teamSize: number;
}

interface TeamMember {
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  role: string;
  email: string;
  phone?: string;
  events: string[];
}

interface Achievement {
  event: string;
  position: number;
  medal?: "gold" | "silver" | "bronze";
  points: number;
  participants: string[];
  description?: string;
  date: string;
}

export default function NewInterIITEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    description: "",
    longDescription: "",
    location: "",
    hostIIT: "",
    startDate: "",
    endDate: ""
  });

  const [participatingIITs, setParticipatingIITs] = useState<string[]>([]);
  const [events, setEvents] = useState<CompetitionEvent[]>([{
    id: "",
    name: "",
    category: "",
    description: "",
    date: "",
    venue: "",
    teamSize: 1
  }]);
  const [teamRoster, setTeamRoster] = useState<TeamMember[]>([{
    name: "",
    rollNumber: "",
    branch: "",
    year: "",
    role: "",
    email: "",
    phone: "",
    events: []
  }]);
  const [achievements, setAchievements] = useState<Achievement[]>([{
    event: "",
    position: 1,
    points: 0,
    participants: [],
    description: "",
    date: ""
  }]);
  const [highlights, setHighlights] = useState<string[]>([""]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIITSelection = (iit: string, checked: boolean) => {
    if (checked) {
      setParticipatingIITs(prev => [...prev, iit]);
    } else {
      setParticipatingIITs(prev => prev.filter(i => i !== iit));
    }
  };

  const handleEventChange = (index: number, field: keyof CompetitionEvent, value: string | number) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setEvents(newEvents);
  };

  const addEvent = () => {
    setEvents([...events, {
      id: "",
      name: "",
      category: "",
      description: "",
      date: "",
      venue: "",
      teamSize: 1
    }]);
  };

  const removeEvent = (index: number) => {
    if (events.length > 1) {
      setEvents(events.filter((_, i) => i !== index));
    }
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string | string[]) => {
    const newTeamRoster = [...teamRoster];
    newTeamRoster[index] = { ...newTeamRoster[index], [field]: value };
    setTeamRoster(newTeamRoster);
  };

  const addTeamMember = () => {
    setTeamRoster([...teamRoster, {
      name: "",
      rollNumber: "",
      branch: "",
      year: "",
      role: "",
      email: "",
      phone: "",
      events: []
    }]);
  };

  const removeTeamMember = (index: number) => {
    if (teamRoster.length > 1) {
      setTeamRoster(teamRoster.filter((_, i) => i !== index));
    }
  };

  const handleAchievementChange = (index: number, field: keyof Achievement, value: string | number | string[]) => {
    const newAchievements = [...achievements];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    setAchievements(newAchievements);
  };

  const addAchievement = () => {
    setAchievements([...achievements, {
      event: "",
      position: 1,
      points: 0,
      participants: [],
      description: "",
      date: ""
    }]);
  };

  const removeAchievement = (index: number) => {
    if (achievements.length > 1) {
      setAchievements(achievements.filter((_, i) => i !== index));
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const addHighlight = () => {
    setHighlights([...highlights, ""]);
  };

  const removeHighlight = (index: number) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert("Event name is required");
        return;
      }
      if (!formData.year.trim()) {
        alert("Year is required");
        return;
      }
      if (!formData.description.trim()) {
        alert("Description is required");
        return;
      }
      if (!formData.longDescription.trim()) {
        alert("Long description is required");
        return;
      }
      if (!formData.location.trim()) {
        alert("Location is required");
        return;
      }
      if (!formData.hostIIT.trim()) {
        alert("Host IIT is required");
        return;
      }
      if (!formData.startDate.trim()) {
        alert("Start date is required");
        return;
      }
      if (!formData.endDate.trim()) {
        alert("End date is required");
        return;
      }

      // Generate event IDs
      const validEvents = events.filter(e => e.name.trim() !== "").map(event => ({
        ...event,
        id: event.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
      }));

      const eventData = {
        ...formData,
        participatingIITs,
        events: validEvents,
        overallResults: [], // Will be filled later
        teamRoster: teamRoster.filter(member => member.name.trim() !== "" && member.email.trim() !== ""),
        achievements: achievements.filter(achievement => achievement.event.trim() !== ""),
        highlights: highlights.filter(h => h.trim() !== ""),
        gallery: [],
        documents: []
      };

      const response = await fetch("/api/admin/inter-iit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create Inter-IIT event");
      }

      alert("Inter-IIT event created successfully!");
      router.push("/admin/inter-iit");
    } catch (error) {
      console.error("Error creating Inter-IIT event:", error);
      alert(error instanceof Error ? error.message : "Failed to create Inter-IIT event. Please try again.");
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
            <Link href="/admin/inter-iit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inter-IIT Events
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Create New Inter-IIT Event
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new Inter-IIT Tech Meet event
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details about the Inter-IIT event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
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

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the event"
                  required
                />
              </div>

              <div>
                <Label htmlFor="longDescription">Long Description *</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange("longDescription", e.target.value)}
                  placeholder="Detailed description of the event"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participating IITs */}
          <Card>
            <CardHeader>
              <CardTitle>Participating IITs</CardTitle>
              <CardDescription>
                Select the IITs that participated in this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {iitList.map((iit) => (
                  <label key={iit} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={participatingIITs.includes(iit)}
                      onChange={(e) => handleIITSelection(iit, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">{iit}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competition Events */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Events</CardTitle>
              <CardDescription>
                Add the various competitions held during the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Event Name</Label>
                    <Input
                      value={event.name}
                      onChange={(e) => handleEventChange(index, "name", e.target.value)}
                      placeholder="e.g., Programming Contest"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={event.category}
                      onValueChange={(value) => handleEventChange(index, "category", value)}
                    >
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
                    <Label>Team Size</Label>
                    <Input
                      type="number"
                      min="1"
                      value={event.teamSize}
                      onChange={(e) => handleEventChange(index, "teamSize", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={event.description}
                      onChange={(e) => handleEventChange(index, "description", e.target.value)}
                      placeholder="Brief description of the event"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEvent(index)}
                      disabled={events.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={event.date}
                      onChange={(e) => handleEventChange(index, "date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Venue</Label>
                    <Input
                      value={event.venue}
                      onChange={(e) => handleEventChange(index, "venue", e.target.value)}
                      placeholder="e.g., Computer Lab"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>

          {/* Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Event Highlights</CardTitle>
              <CardDescription>
                Add key highlights and achievements from the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <Input
                    value={highlight}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                    placeholder="e.g., Bronze medal in Robotics Challenge"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeHighlight(index)}
                    disabled={highlights.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addHighlight}>
                <Plus className="h-4 w-4 mr-2" />
                Add Highlight
              </Button>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Inter-IIT Event"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
