"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";

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

      // Upload file - temporarily using debug endpoint for better error info
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clubId", cleanClubId);
      formData.append("clubType", clubType);

      console.log('Uploading with debug endpoint:', {
        cleanClubId,
        clubType,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const response = await fetch("/api/debug-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error response:', error);
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      onLogoUploaded(result.url);
      setUploadSuccess(true);

    } catch (error) {
      console.error("Error uploading logo:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload logo. Please try again.";
      alert(errorMessage);
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
    <div className="space-y-4">
      <Label className="text-base font-semibold">Club Logo</Label>

      {/* Current Logo Display */}
      {previewUrl && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
          <Image
            src={previewUrl}
            alt="Club logo"
            width={64}
            height={64}
            className="w-16 h-16 object-contain rounded-lg border bg-white p-2"
            onError={handleImageError}
          />
          <div className="flex-1">
            <p className="font-medium text-sm">Current Logo</p>
            <p className="text-xs text-muted-foreground">Click below to replace or remove</p>
            {uploadSuccess && (
              <p className="text-xs text-green-600 mt-1">✓ Logo updated successfully!</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveLogo}
            disabled={isUploading}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      )}

      {!previewUrl && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border text-center">
          <p className="text-sm text-muted-foreground">No logo uploaded yet</p>
        </div>
      )}

      {/* Upload Area */}
      <Card
        className={`cursor-pointer transition-all duration-200 ${
          isDragOver 
            ? 'border-2 border-primary bg-primary/5' 
            : 'border-2 border-dashed border-gray-300 hover:border-primary/50'
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">
                  {isDragOver ? 'Drop your logo here' : previewUrl ? 'Replace Logo' : 'Upload Logo'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag & drop or click to browse (JPEG, PNG, WebP, SVG • Max 5MB)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
