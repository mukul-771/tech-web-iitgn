"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Image as ImageIcon
} from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventCategories, organizingBodies } from "@/lib/events-data";

export default function NewEvent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
    draft: true
  });
  const [newHighlight, setNewHighlight] = useState("");
  const [newGalleryItem, setNewGalleryItem] = useState({
    url: "",
    alt: "",
    caption: ""
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Transform form data to match API expectations
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location || "IITGN Campus",
        duration: formData.duration || "1 day",
        participants: formData.participants || "50+",
        organizer: formData.organizer || "Technical Council",
        category: formData.category,
        highlights: formData.highlights.filter(h => h.trim() !== ""),
        gallery: formData.gallery.filter(item => item.url && item.alt),
        draft: formData.draft
      };

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error("Failed to create event");
      }

      const result = await response.json();
      alert("Event created successfully!");
      router.push("/admin/events");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event");
    } finally {
      setIsLoading(false);
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

  const testCreateEvent = () => {
    setFormData({
      title: "Test Event",
      description: "This is a test event created from the admin panel",
      date: "2024-01-15",
      category: "Workshop",
      location: "IITGN Campus",
      duration: "3 days",
      participants: "100+",
      organizer: "Technical Council",
      highlights: ["Great speakers", "Hands-on workshops", "Networking opportunities"],
      draft: false,
      gallery: []
    });
  };

  const testDirectAPI = async () => {
    try {
      const testData = {
        title: "Direct API Test Event",
        description: "This is a test event created directly via API",
        date: "2024-01-15",
        category: "Workshop",
        location: "IITGN Campus",
        duration: "3 days",
        participants: "100+",
        organizer: "Technical Council",
        highlights: ["Great speakers", "Hands-on workshops", "Networking opportunities"],
        draft: false,
        gallery: []
      };

      console.log("Making direct API call with data:", testData);

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(`Failed to create event: ${JSON.stringify(errorData)}`);
      } else {
        const result = await response.json();
        console.log("Success result:", result);
        alert("Event created successfully via direct API!");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="secondary"
            onClick={testCreateEvent}
          >
            Fill Test Data
          </Button>
          <Button
            variant="outline"
            onClick={testDirectAPI}
          >
            Test Direct API
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Create New Event
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new event to your gallery
            </p>
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
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="draft">Save as Draft</Label>
                      <p className="text-sm text-muted-foreground">
                        Keep this event private until ready to publish
                      </p>
                    </div>
                    <Switch
                      id="draft"
                      checked={formData.draft}
                      onCheckedChange={(checked) => handleInputChange("draft", checked)}
                    />
                  </div>
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
                    disabled={isLoading || !formData.title || !formData.description}
                  >
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {formData.draft ? "Save Draft" : "Publish Event"}
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {formData.title || "Untitled Event"}</p>
                    <p><strong>Category:</strong> {formData.category || "Uncategorized"}</p>
                    <p><strong>Date:</strong> {formData.date ? new Date(formData.date).toLocaleDateString() : "No date set"}</p>
                    <p><strong>Photos:</strong> {formData.gallery.length} images</p>
                    <p><strong>Status:</strong> {formData.draft ? "Draft" : "Published"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
