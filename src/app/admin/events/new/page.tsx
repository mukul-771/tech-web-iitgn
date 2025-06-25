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
  X,
  Plus,
  Image as ImageIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleImageUpload } from "@/components/admin/simple-image-upload";
import { eventCategories, organizingBodies } from "@/lib/events-data";

interface FormData {
  title: string;
  description: string;
  date: string;
  location: string;
  duration: string;
  participants: string;
  organizer: string;
  category: string;
  highlights: string[];
  gallery: Array<{ id: string; url: string; alt: string; caption?: string }>;
  draft: boolean;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  date?: string;
  organizer?: string;
  category?: string;
  gallery?: string;
}

export default function NewEvent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    date: "",
    location: "",
    duration: "",
    participants: "",
    organizer: "",
    category: "",
    highlights: [],
    gallery: [],
    draft: true
  });
  const [newHighlight, setNewHighlight] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryAlt, setNewGalleryAlt] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
    }
  }, [session, status, router]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Event description is required";
    }

    if (!formData.date.trim()) {
      newErrors.date = "Event date is required";
    }

    if (!formData.organizer) {
      newErrors.organizer = "Organizer is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Validate gallery URLs
    for (const item of formData.gallery) {
      if (item.url && !isValidUrl(item.url)) {
        newErrors.gallery = "Please provide valid image URLs";
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date.trim(),
        location: formData.location.trim() || undefined,
        duration: formData.duration.trim() || undefined,
        participants: formData.participants.trim() || undefined,
        organizer: formData.organizer,
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
        throw new Error(errorData.error || "Failed to create event");
      }

      router.push("/admin/events");
    } catch (err) {
      console.error("Error creating event:", err);
      alert(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      handleInputChange("highlights", [...formData.highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    const newHighlights = formData.highlights.filter((_, i) => i !== index);
    handleInputChange("highlights", newHighlights);
  };

  const addGalleryItem = () => {
    if (newGalleryUrl.trim() && newGalleryAlt.trim()) {
      if (!isValidUrl(newGalleryUrl.trim())) {
        alert("Please enter a valid image URL");
        return;
      }

      const newItem = {
        id: Date.now().toString(),
        url: newGalleryUrl.trim(),
        alt: newGalleryAlt.trim(),
        caption: newGalleryCaption.trim() || undefined
      };

      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, newItem]
      }));

      setNewGalleryUrl("");
      setNewGalleryAlt("");
      setNewGalleryCaption("");
    }
  };

  const removeGalleryItem = (index: number) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      gallery: newGallery
    }));
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
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Create New Event
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new event to showcase your activities
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
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe the event, its purpose, and what participants can expect"
                      rows={4}
                      required
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        placeholder="e.g., March 15-17, 2024"
                        required
                        className={errors.date ? "border-red-500" : ""}
                      />
                      {errors.date && (
                        <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Event location (optional)"
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
                        placeholder="e.g., 3 days (optional)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="participants">Participants</Label>
                      <Input
                        id="participants"
                        value={formData.participants}
                        onChange={(e) => handleInputChange("participants", e.target.value)}
                        placeholder="e.g., 500+ (optional)"
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
                        <SelectTrigger className={errors.organizer ? "border-red-500" : ""}>
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
                      {errors.organizer && (
                        <p className="text-sm text-red-500 mt-1">{errors.organizer}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                      >
                        <SelectTrigger className={errors.category ? "border-red-500" : ""}>
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
                      {errors.category && (
                        <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Highlights Section */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Event Highlights</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add key points that make this event special
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Add images to showcase the event (images must be uploaded to a hosting service)
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {errors.gallery && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-600">{errors.gallery}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {formData.gallery.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
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

                        <div className="grid gap-3">
                          <div>
                            <Label>Image URL *</Label>
                            <Input
                              value={item.url}
                              onChange={(e) => {
                                const newGallery = [...formData.gallery];
                                newGallery[index].url = e.target.value;
                                setFormData(prev => ({ ...prev, gallery: newGallery }));
                              }}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div>
                            <Label>Alt Text *</Label>
                            <Input
                              value={item.alt}
                              onChange={(e) => {
                                const newGallery = [...formData.gallery];
                                newGallery[index].alt = e.target.value;
                                setFormData(prev => ({ ...prev, gallery: newGallery }));
                              }}
                              placeholder="Describe the image for accessibility"
                            />
                          </div>
                          <div>
                            <Label>Caption (Optional)</Label>
                            <Input
                              value={item.caption || ""}
                              onChange={(e) => {
                                const newGallery = [...formData.gallery];
                                newGallery[index].caption = e.target.value;
                                setFormData(prev => ({ ...prev, gallery: newGallery }));
                              }}
                              placeholder="Image caption"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Image */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-medium">Add New Image</h4>
                    </div>
                    
                    {/* Upload Option */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <SimpleImageUpload
                        onImageUploaded={(url) => setNewGalleryUrl(url)}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Manual URL Option */}
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Option 2: Enter image URL manually</p>
                      <div>
                        <Label>Image URL *</Label>
                        <Input
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <Label>Alt Text *</Label>
                        <Input
                          value={newGalleryAlt}
                          onChange={(e) => setNewGalleryAlt(e.target.value)}
                          placeholder="Describe the image for accessibility"
                        />
                      </div>
                      <div>
                        <Label>Caption (Optional)</Label>
                        <Input
                          value={newGalleryCaption}
                          onChange={(e) => setNewGalleryCaption(e.target.value)}
                          placeholder="Image caption"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={addGalleryItem}
                        disabled={!newGalleryUrl || !newGalleryAlt}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </div>
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
                    disabled={isLoading || !formData.title || !formData.description || !formData.organizer || !formData.category}
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
                    <p><strong>Organizer:</strong> {formData.organizer || "No organizer"}</p>
                    <p><strong>Date:</strong> {formData.date || "No date set"}</p>
                    <p><strong>Images:</strong> {formData.gallery.length} image{formData.gallery.length !== 1 ? 's' : ''}</p>
                    <p><strong>Highlights:</strong> {formData.highlights.length} item{formData.highlights.length !== 1 ? 's' : ''}</p>
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
