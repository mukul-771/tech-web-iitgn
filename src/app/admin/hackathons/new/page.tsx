"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { hackathonCategories, hackathonStatuses } from "@/lib/hackathons-data";

export default function NewHackathonPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    date: "",
    location: "",
    category: "",
    status: "upcoming" as const,
    registrationLink: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      if (!formData.registrationLink.trim()) {
        alert("Registration link is required");
        return;
      }
      const hackathonData = {
        ...formData
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
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details about the hackathon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Hackathon Name *</Label>
                  <Input id="name" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} required placeholder="e.g. Winter Hackathon 2025" />
                </div>
                <div>
                  <Label htmlFor="description">Short Description *</Label>
                  <Input id="description" value={formData.description} onChange={e => handleInputChange("description", e.target.value)} required placeholder="A one-line summary" />
                </div>
                <div>
                  <Label htmlFor="longDescription">Full Description *</Label>
                  <Textarea id="longDescription" value={formData.longDescription} onChange={e => handleInputChange("longDescription", e.target.value)} required placeholder="Full details about the event" />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={formData.date} onChange={e => handleInputChange("date", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" value={formData.location} onChange={e => handleInputChange("location", e.target.value)} required placeholder="e.g. IIT Gandhinagar or Online" />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={value => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathonCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={value => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathonStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="registrationLink">Registration Link *</Label>
                  <Input id="registrationLink" value={formData.registrationLink} onChange={e => handleInputChange("registrationLink", e.target.value)} required placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Hackathon"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
