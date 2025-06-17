"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  label?: string;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  required?: boolean;
  showAltText?: boolean;
  altText?: string;
  onAltTextChange?: (altText: string) => void;
  showCaption?: boolean;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
}

export function ImageUpload({
  label = "Upload Image",
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  accept = "image/jpeg,image/jpg,image/png,image/webp",
  maxSize = 10, // 10MB default
  className = "",
  required = false,
  showAltText = false,
  altText = "",
  onAltTextChange,
  showCaption = false,
  caption = "",
  onCaptionChange
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileTypeValid = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!fileTypeValid) {
      alert(`Invalid file type. Allowed types: ${accept}`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`File too large. Maximum size is ${maxSize}MB.`);
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
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image");
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    <div className={`space-y-4 ${className}`}>
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>

      {/* Current Image Preview */}
      {previewUrl && (
        <Card className="glass">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onError={() => setPreviewUrl(null)}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current image</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card
        className={`glass cursor-pointer transition-all duration-200 ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/25'
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading image...</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10">
                  {previewUrl ? (
                    <ImageIcon className="h-6 w-6 text-primary" />
                  ) : (
                    <Upload className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {previewUrl ? 'Replace Image' : 'Upload Image'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to select
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Supported formats: JPEG, PNG, WebP</p>
                  <p>Maximum size: {maxSize}MB</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alt Text Input */}
      {showAltText && (
        <div>
          <Label htmlFor="alt-text">Alt Text {required && <span className="text-red-500">*</span>}</Label>
          <Input
            id="alt-text"
            value={altText}
            onChange={(e) => onAltTextChange?.(e.target.value)}
            placeholder="Describe the image for accessibility"
            required={required}
          />
        </div>
      )}

      {/* Caption Input */}
      {showCaption && (
        <div>
          <Label htmlFor="caption">Caption (Optional)</Label>
          <Input
            id="caption"
            value={caption}
            onChange={(e) => onCaptionChange?.(e.target.value)}
            placeholder="Enter image caption"
          />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
