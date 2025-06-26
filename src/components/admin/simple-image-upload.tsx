"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Plus } from "lucide-react";

interface SimpleImageUploadProps {
  onImageUploaded: (url: string) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export function SimpleImageUpload({ 
  onImageUploaded, 
  disabled = false, 
  className = "",
  compact = false
}: SimpleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "events");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const result = await response.json();
      onImageUploaded(result.url);
      
      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      {!compact && (
        <>
          <Label className="text-sm font-medium">Upload Image to Vercel Blob</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {isUploading && (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Supported: JPEG, PNG, WebP. Max size: 10MB
          </p>
        </>
      )}
      {compact && (
        <div className="w-full h-full flex items-center justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            id="minimal-upload"
          />
          <Label 
            htmlFor="minimal-upload"
            className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors rounded-lg"
            style={{ minHeight: 0, minWidth: 0 }}
          >
            {isUploading ? (
              <LoadingSpinner />
            ) : (
              <Plus className="h-8 w-8 text-muted-foreground" />
            )}
          </Label>
        </div>
      )}
    </div>
  );
}
