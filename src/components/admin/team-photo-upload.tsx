"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface TeamPhotoUploadProps {
  memberId: string;
  isSecretary?: boolean;
  currentPhotoUrl?: string;
  onPhotoUploaded: (photoUrl: string) => void;
  onPhotoRemoved: () => void;
}

export function TeamPhotoUpload({
  memberId,
  isSecretary = false,
  currentPhotoUrl,
  onPhotoUploaded,
  onPhotoRemoved
}: TeamPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetSize = isSecretary ? 300 : 200;

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }

    setIsUploading(true);

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
      formData.append("memberId", memberId);
      formData.append("isSecretary", isSecretary.toString());

      const response = await fetch("/api/admin/team/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload photo");
      }

      const result = await response.json();
      onPhotoUploaded(result.url);

    } catch (error) {
      console.error("Error uploading photo:", error);
      alert(error instanceof Error ? error.message : "Failed to upload photo");
      setPreviewUrl(currentPhotoUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    try {
      const filename = currentPhotoUrl.split('/').pop();
      if (!filename) return;

      const response = await fetch(`/api/admin/team/upload-photo?filename=${filename}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      setPreviewUrl(null);
      onPhotoRemoved();
    } catch (error) {
      console.error("Error removing photo:", error);
      alert("Failed to remove photo");
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
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
      <Label>Profile Photo</Label>

      <Card className="glass">
        <CardContent className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">Uploading photo...</p>
              </div>
            ) : previewUrl ? (
              <div className="space-y-4">
                <div className="relative mx-auto" style={{ width: targetSize, height: targetSize }}>
                  <Image
                    src={previewUrl}
                    alt="Profile preview"
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    Replace Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto();
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center space-y-2">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Upload Profile Photo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to select
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Supported formats: JPEG, PNG, WebP</p>
                  <p>Maximum size: 10MB</p>
                  <p>Recommended: Square aspect ratio</p>
                  <p>Target size: {targetSize}x{targetSize}px</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
