"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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

  // Sync preview URL with current logo URL prop changes
  useEffect(() => {
    console.log('LogoUpload: currentLogoUrl changed to:', currentLogoUrl);
    setPreviewUrl(currentLogoUrl || null);
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
      <Label className="text-base font-semibold">Club Logo</Label>

      {/* Debug Information (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
          Debug: currentLogoUrl = {currentLogoUrl || 'null'}, previewUrl = {previewUrl || 'null'}
        </div>
      )}

      {/* Current Logo Display - More Prominent */}
      {previewUrl ? (
        <Card className="glass border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative">
                <Image
                  src={previewUrl}
                  alt="Current club logo"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
                  onError={handleImageError}
                />
                <div className="absolute -top-2 -right-2">
                  <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                    Current
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Current Logo
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This is the logo currently displayed for your club
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Use the upload area below to replace with a new logo
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveLogo}
                disabled={isUploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass border border-gray-300 dark:border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  No Logo Set
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a logo using the area below
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area - Enhanced */}
      <Card
        className={`glass cursor-pointer transition-all duration-200 hover:shadow-md ${
          isDragOver 
            ? 'border-2 border-primary bg-primary/10 shadow-lg' 
            : previewUrl 
              ? 'border-dashed border-gray-300 dark:border-gray-600' 
              : 'border-2 border-dashed border-primary/50'
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
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-base font-medium">Uploading logo...</p>
                <p className="text-sm text-muted-foreground">Please wait</p>
              </>
            ) : (
              <>
                <div className={`p-4 rounded-full ${previewUrl ? 'bg-blue-50 dark:bg-blue-950' : 'bg-primary/10'}`}>
                  {previewUrl ? (
                    <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Upload className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {previewUrl ? 'Replace Current Logo' : 'Upload Club Logo'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag and drop your logo here, or click to browse
                  </p>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p><strong>Supported formats:</strong> JPEG, PNG, WebP, SVG</p>
                  <p><strong>Maximum size:</strong> 5MB</p>
                  <p><strong>Recommended:</strong> Square aspect ratio (512x512px)</p>
                  <p><strong>Background:</strong> Transparent or white for best results</p>
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
