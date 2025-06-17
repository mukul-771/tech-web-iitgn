"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Save, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AdminLayout } from "@/components/admin/admin-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Event, eventCategories, organizingBodies } from "@/lib/events-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEvent({ params }: PageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [eventId, setEventId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    duration: "",
    participants: "",
    organizer: "",
    category: "",
    highlights: [] as string[],
    gallery: [] as Array<{ id: string; url: string; alt: string; caption?: string }>,
    draft: false
  });
  const [newHighlight, setNewHighlight] = useState("");
  const [newGalleryItem, setNewGalleryItem] = useState({
    url: "",
    alt: "",
    caption: ""
  });

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    if (eventId) {
      fetchEvent();
    }
  }, [session, status, router, eventId]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }

      const eventData = await response.json();
      setEvent(eventData);
      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        date: eventData.date || "",
        location: eventData.location || "",
        duration: eventData.duration || "",
        participants: eventData.participants || "",
        organizer: eventData.organizer || "",
        category: eventData.category || "",
        highlights: eventData.highlights || [],
        gallery: eventData.gallery || [],
        draft: eventData.draft || false
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      alert("Failed to load event");
      router.push("/admin/events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      alert("Event updated successfully!");
      router.push("/admin/events");
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event");
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

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const addGalleryItem = () => {
    if (newGalleryItem.url.trim() && newGalleryItem.alt.trim()) {
      const newItem = {
        id: Date.now().toString(),
        url: newGalleryItem.url.trim(),
        alt: newGalleryItem.alt.trim(),
        caption: newGalleryItem.caption.trim() || undefined
      };
      
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, newItem]
      }));
      
      setNewGalleryItem({ url: "", alt: "", caption: "" });
    }
  };

  const removeGalleryItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const deleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      alert("Event deleted successfully!");
      router.push("/admin/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Event Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The event you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/admin/events")}>
              Back to Events
            </Button>
          </div>
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
              onClick={() => router.push("/admin/events")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-space-grotesk">
                Edit Event
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Update event details and gallery
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(`/achievements/events/${eventId}`, '_blank')}
            >
              View Public Page
            </Button>
            <Button
              variant="destructive"
              onClick={deleteEvent}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe the event"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        placeholder="e.g., March 15-17, 2023"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Event location"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        placeholder="e.g., 3 days"
                      />
                    </div>
                    <div>
                      <Label htmlFor="participants">Participants</Label>
                      <Input
                        id="participants"
                        value={formData.participants}
                        onChange={(e) => handleInputChange("participants", e.target.value)}
                        placeholder="e.g., 500+"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="organizer">Organizer *</Label>
                      <Select
                        value={formData.organizer}
                        onValueChange={(value) => handleInputChange("organizer", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select organizer" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizingBodies.map((body) => (
                            <SelectItem key={body} value={body}>
                              {body}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Highlights Section */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Event Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {formData.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={highlight}
                          onChange={(e) => {
                            const newHighlights = [...formData.highlights];
                            newHighlights[index] = e.target.value;
                            handleInputChange("highlights", newHighlights);
                          }}
                          placeholder="Enter highlight"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeHighlight(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      placeholder="Add new highlight"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addHighlight();
                        }
                      }}
                    />
                    <Button type="button" onClick={addHighlight}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery Section */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Event Gallery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-6">
                    {formData.gallery.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Image {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeGalleryItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <ImageUpload
                          label="Gallery Image"
                          currentImageUrl={item.url}
                          onImageUploaded={(url) => {
                            const newGallery = [...formData.gallery];
                            newGallery[index].url = url;
                            handleInputChange("gallery", newGallery);
                          }}
                          onImageRemoved={() => {
                            const newGallery = [...formData.gallery];
                            newGallery[index].url = "";
                            handleInputChange("gallery", newGallery);
                          }}
                          showAltText={true}
                          altText={item.alt}
                          onAltTextChange={(altText) => {
                            const newGallery = [...formData.gallery];
                            newGallery[index].alt = altText;
                            handleInputChange("gallery", newGallery);
                          }}
                          showCaption={true}
                          caption={item.caption || ""}
                          onCaptionChange={(caption) => {
                            const newGallery = [...formData.gallery];
                            newGallery[index].caption = caption;
                            handleInputChange("gallery", newGallery);
                          }}
                          required={true}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Add New Image</h4>
                    <ImageUpload
                      label="Upload New Gallery Image"
                      currentImageUrl={newGalleryItem.url}
                      onImageUploaded={(url) => setNewGalleryItem(prev => ({ ...prev, url }))}
                      onImageRemoved={() => setNewGalleryItem(prev => ({ ...prev, url: "" }))}
                      showAltText={true}
                      altText={newGalleryItem.alt}
                      onAltTextChange={(altText) => setNewGalleryItem(prev => ({ ...prev, alt: altText }))}
                      showCaption={true}
                      caption={newGalleryItem.caption}
                      onCaptionChange={(caption) => setNewGalleryItem(prev => ({ ...prev, caption }))}
                      required={true}
                    />
                    <Button
                      type="button"
                      onClick={addGalleryItem}
                      disabled={!newGalleryItem.url || !newGalleryItem.alt}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Event Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="draft">Draft Mode</Label>
                    <Switch
                      id="draft"
                      checked={formData.draft}
                      onCheckedChange={(checked) => handleInputChange("draft", checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.draft
                      ? "Event is in draft mode and not visible to public"
                      : "Event is published and visible to public"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event ID:</span>
                    <span className="font-mono">{eventId}</span>
                  </div>
                  {event && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{new Date(event.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/admin/events")}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
