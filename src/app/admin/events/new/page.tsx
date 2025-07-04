"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
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
  Edit,
  Replace
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

    // Validate gallery images have alt text
    const invalidImages = formData.gallery.filter(img => !img.alt || !img.alt.trim());
    if (invalidImages.length > 0) {
      newErrors.gallery = "All images must have alt text for accessibility";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const addGalleryItem = (url: string, alt: string, caption?: string) => {
    // Check if we've reached the maximum limit
    if (formData.gallery.length >= 10) {
      setErrors(prev => ({ ...prev, gallery: "Maximum 10 images allowed per event" }));
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      url: url.trim(),
      alt: alt.trim(),
      caption: caption?.trim() || undefined
    };

    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, newItem]
    }));

    // Clear gallery error if it exists
    if (errors.gallery) {
      setErrors(prev => ({ ...prev, gallery: undefined }));
    }
  };

  const removeGalleryItem = (index: number) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      gallery: newGallery
    }));

    // Clear gallery error if it exists
    if (errors.gallery) {
      setErrors(prev => ({ ...prev, gallery: undefined }));
    }
  };

  const replaceGalleryItem = (index: number, url: string, alt: string, caption?: string) => {
    const newGallery = [...formData.gallery];
    newGallery[index] = {
      id: Date.now().toString(),
      url: url.trim(),
      alt: alt.trim(),
      caption: caption?.trim() || undefined
    };
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
                    Upload up to 10 images to showcase the event
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {errors.gallery && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-600">{errors.gallery}</p>
                    </div>
                  )}

                  {/* Gallery Grid */}
                  <div className="grid grid-cols-5 gap-3">
                    {formData.gallery.map((item, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary/50 transition-all duration-200"
                      >
                        <Image
                          src={item.url}
                          alt={item.alt}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="h-7 w-7 p-0 text-xs"
                              onClick={() => {
                                // Create a temporary file input for replacing
                                const fileInput = document.createElement('input');
                                fileInput.type = 'file';
                                fileInput.accept = 'image/*';
                                fileInput.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (!file) return;

                                  // Validate file size
                                  if (file.size > 10 * 1024 * 1024) {
                                    alert('File size must be less than 10MB');
                                    return;
                                  }

                                  try {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    formData.append("folder", "events");

                                    const response = await fetch("/api/admin/upload", {
                                      method: "POST",
                                      body: formData,
                                    });

                                    if (!response.ok) {
                                      throw new Error("Failed to upload");
                                    }

                                    const result = await response.json();
                                    const newAlt = prompt("Enter alt text for the new image:", item.alt) || item.alt;
                                    const newCaption = prompt("Enter caption (optional):", item.caption || "") || item.caption;
                                    
                                    if (newAlt.trim()) {
                                      replaceGalleryItem(index, result.url, newAlt, newCaption);
                                    } else {
                                      alert("Alt text is required for accessibility");
                                    }
                                  } catch {
                                    alert("Failed to upload replacement image");
                                  }
                                };
                                fileInput.click();
                              }}
                              title="Replace image"
                            >
                              <Replace className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                const newAlt = prompt("Edit alt text:", item.alt);
                                if (newAlt !== null && newAlt.trim()) {
                                  const newCaption = prompt("Edit caption (optional):", item.caption || "");
                                  const newGallery = [...formData.gallery];
                                  newGallery[index].alt = newAlt.trim();
                                  newGallery[index].caption = newCaption?.trim() || undefined;
                                  setFormData(prev => ({ ...prev, gallery: newGallery }));
                                }
                              }}
                              title="Edit details"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="h-7 w-7 p-0"
                              onClick={() => removeGalleryItem(index)}
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Image Counter */}
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}

                    {/* Add New Image Slot */}
                    {formData.gallery.length < 10 && (
                      <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors bg-gray-50 hover:bg-gray-100">
                        <SimpleImageUpload
                          onImageUploaded={(url) => {
                            const alt = prompt("Enter alt text for this image (required for accessibility):");
                            if (alt && alt.trim()) {
                              const caption = prompt("Enter a caption for this image (optional):") || "";
                              addGalleryItem(url, alt.trim(), caption.trim());
                            } else {
                              alert("Alt text is required for accessibility. Image not added.");
                            }
                          }}
                          disabled={isLoading}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Gallery Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formData.gallery.length} of 10 images
                    </span>
                    {formData.gallery.length >= 10 && (
                      <span className="text-amber-600 font-medium">
                        Gallery is full - remove an image to add more
                      </span>
                    )}
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
