"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, FileText, Download, Star, Image, Trash2 } from "lucide-react";
import { TorqueMagazine, maxFileSize, maxImageSize } from "@/lib/torque-data";

export default function EditMagazinePage() {
  const router = useRouter();
  const params = useParams();
  const magazineId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [magazine, setMagazine] = useState<TorqueMagazine | null>(null);
  const [formData, setFormData] = useState({
    year: "",
    title: "",
    description: "",
    pages: "",
    articles: "",
    featured: "",
    isLatest: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchMagazine();
  }, [magazineId]);

  const fetchMagazine = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch(`/api/admin/torque/${magazineId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch magazine");
      }

      const magazineData = await response.json();
      setMagazine(magazineData);

      // Populate form data
      setFormData({
        year: magazineData.year,
        title: magazineData.title,
        description: magazineData.description,
        pages: magazineData.pages.toString(),
        articles: magazineData.articles.toString(),
        featured: magazineData.featured,
        isLatest: magazineData.isLatest
      });

    } catch (error) {
      console.error("Error fetching magazine:", error);
      alert("Failed to load magazine data");
      router.push("/admin/torque");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        alert(`File size too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP).');
        return;
      }

      // Validate file size
      if (file.size > maxImageSize) {
        alert(`Image size too large. Maximum size is ${maxImageSize / (1024 * 1024)}MB.`);
        return;
      }

      setSelectedCoverPhoto(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, year: string) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('year', year);

    const response = await fetch('/api/admin/torque/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  };

  const uploadCoverPhoto = async (file: File, magazineId: string) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('magazineId', magazineId);

    const response = await fetch('/api/admin/torque/upload-cover', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload cover photo');
    }

    return response.json();
  };

  const deleteCoverPhoto = async () => {
    try {
      const response = await fetch(`/api/admin/torque/${magazineId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverPhoto: null,
          coverPhotoFileName: null
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove cover photo");
      }

      // Update local state
      setMagazine(prev => prev ? { ...prev, coverPhoto: undefined, coverPhotoFileName: undefined } : null);
      alert("Cover photo removed successfully!");
    } catch (error) {
      console.error("Error removing cover photo:", error);
      alert("Failed to remove cover photo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadProgress(0);

    try {
      let updateData = {
        year: formData.year,
        title: formData.title,
        description: formData.description,
        pages: parseInt(formData.pages) || 0,
        articles: parseInt(formData.articles) || 0,
        featured: formData.featured,
        isLatest: formData.isLatest
      };

      // If a new file is selected, upload it first
      if (selectedFile) {
        setUploadProgress(30);
        const uploadResult = await uploadFile(selectedFile, formData.year);

        setUploadProgress(60);

        // Add file information to update data
        updateData = {
          ...updateData,
          filePath: uploadResult.filePath,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize
        } as any;
      }

      const response = await fetch(`/api/admin/torque/${magazineId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update magazine");
      }

      setUploadProgress(80);

      // Upload cover photo if selected
      if (selectedCoverPhoto) {
        setUploadProgress(85);
        const coverUploadResult = await uploadCoverPhoto(selectedCoverPhoto, magazineId);

        // Update magazine with cover photo
        const coverUpdateResponse = await fetch(`/api/admin/torque/${magazineId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coverPhoto: coverUploadResult.filePath,
            coverPhotoFileName: coverUploadResult.fileName
          }),
        });

        if (!coverUpdateResponse.ok) {
          console.warn("Failed to update magazine with cover photo");
        }
        setUploadProgress(95);
      }

      setUploadProgress(100);
      router.push("/admin/torque");
    } catch (error) {
      console.error("Error updating magazine:", error);
      alert(error instanceof Error ? error.message : "Failed to update magazine");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSetLatest = async () => {
    try {
      const response = await fetch(`/api/admin/torque/${magazineId}/set-latest`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to set latest magazine";
        throw new Error(errorMessage);
      }

      // Update local state
      setFormData(prev => ({ ...prev, isLatest: true }));
      alert("Magazine set as latest successfully!");
    } catch (error) {
      console.error("Error setting latest magazine:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to set latest magazine";
      alert(errorMessage);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (isLoadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading magazine data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!magazine) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Magazine not found</h1>
          <Button onClick={() => router.push("/admin/torque")} className="mt-4">
            Back to Torque
          </Button>
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
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-space-grotesk">
              Edit Magazine: {magazine.title} ({magazine.year})
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update magazine information and optionally replace the file
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(magazine.filePath, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Current
            </Button>
            {!magazine.isLatest && (
              <Button
                variant="outline"
                onClick={handleSetLatest}
              >
                <Star className="h-4 w-4 mr-2" />
                Set as Latest
              </Button>
            )}
          </div>
        </div>

        {/* Current File Info */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Current File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{magazine.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  Size: {formatFileSize(magazine.fileSize)} •
                  {magazine.isLatest && <span className="text-orange-600 ml-1">Latest Magazine</span>}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(magazine.filePath, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Cover Photo */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Cover Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {magazine.coverPhoto ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-40 flex-shrink-0">
                    <img
                      src={magazine.coverPhoto}
                      alt="Current cover photo"
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Current Cover Photo</p>
                    <p className="text-sm text-muted-foreground">
                      {magazine.coverPhotoFileName || 'cover-photo.jpg'}
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={deleteCoverPhoto}
                      className="mt-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Cover Photo
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No cover photo uploaded</p>
                <p className="text-sm text-muted-foreground">Upload a cover photo to enhance the magazine display</p>
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload (Optional) */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Replace File (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">New PDF File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to keep current file. Maximum file size: {formatFileSize(maxFileSize)}
                </p>
              </div>

              {selectedFile && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Size: {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Photo Upload */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                {magazine.coverPhoto ? 'Replace Cover Photo' : 'Upload Cover Photo'} (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coverPhoto">Cover Photo</Label>
                <Input
                  id="coverPhoto"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleCoverPhotoChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: {formatFileSize(maxImageSize)}. Supported formats: JPEG, PNG, WebP.
                </p>
              </div>

              {selectedCoverPhoto && (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      <span className="text-sm font-medium">{selectedCoverPhoto.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Size: {formatFileSize(selectedCoverPhoto.size)}
                    </p>
                  </div>

                  {coverPhotoPreview && (
                    <div className="space-y-2">
                      <Label>Preview:</Label>
                      <div className="relative w-48 h-64 mx-auto">
                        <img
                          src={coverPhotoPreview}
                          alt="Cover photo preview"
                          className="w-full h-full object-cover rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Magazine Information */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Magazine Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    required
                    placeholder="2024"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    placeholder="Innovation Unleashed"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  rows={3}
                  placeholder="Brief description of the magazine content"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="pages">Number of Pages *</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={formData.pages}
                    onChange={(e) => handleInputChange("pages", e.target.value)}
                    required
                    min="1"
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="articles">Number of Articles *</Label>
                  <Input
                    id="articles"
                    type="number"
                    value={formData.articles}
                    onChange={(e) => handleInputChange("articles", e.target.value)}
                    required
                    min="1"
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="featured">Featured Article *</Label>
                  <Input
                    id="featured"
                    value={formData.featured}
                    onChange={(e) => handleInputChange("featured", e.target.value)}
                    required
                    placeholder="AI in Healthcare"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isLatest"
                  checked={formData.isLatest}
                  onCheckedChange={(checked) => handleInputChange("isLatest", checked as boolean)}
                />
                <Label htmlFor="isLatest">
                  Set as latest magazine (will unset current latest)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Magazine"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
