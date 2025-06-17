"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

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
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      formData.append("clubId", clubId);
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
        `/api/admin/clubs/upload-logo?clubId=${clubId}&clubType=${clubType}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete logo");
      }

      setPreviewUrl(null);
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
      <Label>Club Logo</Label>

      {/* Current Logo Preview */}
      {previewUrl && (
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Club logo"
                  className="w-16 h-16 object-contain rounded-lg border"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Current Logo</p>
                <p className="text-xs text-muted-foreground">
                  Click upload area to replace
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveLogo}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
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
                <p className="text-sm text-muted-foreground">Uploading logo...</p>
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
                    {previewUrl ? 'Replace Logo' : 'Replace Logo'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to select
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Supported formats: JPEG, PNG, WebP, SVG</p>
                  <p>Maximum size: 5MB</p>
                  <p>Recommended: Square aspect ratio</p>
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
        accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
