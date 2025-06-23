"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface LogoUploadProps {
  clubId: string;
  clubType: "club" | "hobby-group" | "technical-council-group";
  currentLogoUrl?: string;
  onLogoUploaded: (logoUrl: string) => void;
  onLogoRemoved: () => void;
}

export function LogoUpload({
  clubId,
  clubType,
  currentLogoUrl,
  onLogoUploaded,
  onLogoRemoved
}: LogoUploadProps) {
  // Clean the club ID (defensive measure against malformed IDs like "metis:1")
  const cleanClubId = clubId.split(':')[0];
  console.log('LogoUpload render - clubId:', clubId, 'cleanClubId:', cleanClubId, 'currentLogoUrl:', currentLogoUrl);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview URL with current logo URL prop changes
  useEffect(() => {
    console.log('LogoUpload: currentLogoUrl changed to:', currentLogoUrl);
    setPreviewUrl(currentLogoUrl || null);
    setUploadSuccess(false);
  }, [currentLogoUrl]);

  const handleImageError = () => {
    console.log('Logo image failed to load:', previewUrl);
    setPreviewUrl(null);
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clubId", cleanClubId);
      formData.append("clubType", clubType);

      const response = await fetch("/api/admin/clubs/upload-logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload logo");
      }

      const result = await response.json();
      onLogoUploaded(result.url);
      setUploadSuccess(true);

    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo. Please try again.");
      setPreviewUrl(currentLogoUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!currentLogoUrl) return;

    try {
      const response = await fetch(
        `/api/admin/clubs/upload-logo?clubId=${cleanClubId}&clubType=${clubType}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete logo");
      }

      setPreviewUrl(null);
      setUploadSuccess(false);
      onLogoRemoved();
    } catch (error) {
      console.error("Error removing logo:", error);
      alert("Failed to remove logo. Please try again.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <Label className="text-lg font-semibold">Club Logo Management</Label>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Current Logo
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Current Logo Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="relative">
                      <Image
                        src={previewUrl}
                        alt="Current club logo"
                        width={120}
                        height={120}
                        className="w-30 h-30 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm"
                        onError={handleImageError}
                      />
                      {uploadSuccess && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-1 rounded-full">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-400">
                          Logo Active
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This logo is currently displayed for your club across the website.
                      </p>
                      {uploadSuccess && (
                        <div className="bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 p-2 rounded-lg text-sm">
                          ✨ Logo updated successfully!
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      disabled={isUploading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove Logo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      No Logo Set
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your club currently does not have a logo. Upload one using the Upload New tab.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {previewUrl ? 'Replace Logo' : 'Upload New Logo'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isDragOver 
                    ? 'border-2 border-primary bg-primary/10 shadow-lg' 
                    : 'border-2 border-dashed border-primary/50 hover:border-primary/70'
                }`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-lg font-medium">Uploading logo...</p>
                        <p className="text-sm text-muted-foreground">Please wait while we process your image</p>
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-full bg-primary/10">
                          <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {isDragOver ? 'Drop your logo here' : 'Upload Club Logo'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Drag and drop your logo here, or click to browse files
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Guidelines */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-3">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  📋 Upload Guidelines
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <p><strong>Supported Formats:</strong></p>
                    <p className="text-muted-foreground">JPEG, PNG, WebP, SVG</p>
                  </div>
                  <div className="space-y-1">
                    <p><strong>Maximum Size:</strong></p>
                    <p className="text-muted-foreground">5MB</p>
                  </div>
                  <div className="space-y-1">
                    <p><strong>Recommended Size:</strong></p>
                    <p className="text-muted-foreground">512×512px (square)</p>
                  </div>
                  <div className="space-y-1">
                    <p><strong>Background:</strong></p>
                    <p className="text-muted-foreground">Transparent or white</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
