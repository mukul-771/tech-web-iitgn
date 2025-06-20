"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadTeamPhoto } from "@/lib/upload-firebase";
import { storage } from "@/lib/firebase-config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Utility to sanitize Firebase Storage URLs (decode if double-encoded)
function sanitizeFirebaseUrl(url: string): string {
  try {
    const decoded = decodeURIComponent(url);
    if (decodeURIComponent(decoded) !== decoded) {
      return decodeURIComponent(decoded);
    }
    return decoded;
  } catch {
    return url;
  }
}

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl ? sanitizeFirebaseUrl(currentPhotoUrl) : null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<unknown>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setPreviewUrl(currentPhotoUrl ? sanitizeFirebaseUrl(currentPhotoUrl) : null);
  }, [currentPhotoUrl]);

  const targetSize = isSecretary ? 300 : 200;

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setUploadError(null);

    if (checkingAuth) {
      setUploadError("Checking authentication, please wait...");
      return;
    }
    if (!firebaseUser) {
      setUploadError("You must be signed in to upload. Please log in as an admin.");
      setIsUploading(false);
      setUploadProgress(null);
      return;
    }

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
    setUploadProgress(0);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      if (!storage) throw new Error("Firebase Storage not initialized");
      const storageRef = ref(storage, `team/${memberId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setUploadError(error.message || String(error));
          setIsUploading(false);
          setUploadProgress(null);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadProgress(null);
          onPhotoUploaded(sanitizeFirebaseUrl(url));
          setIsUploading(false);
        }
      );
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to upload photo");
      setPreviewUrl(currentPhotoUrl ? sanitizeFirebaseUrl(currentPhotoUrl) : null);
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    try {
      // Optionally: Remove from Firebase Storage using the Firebase SDK if needed
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
      {checkingAuth ? (
        <div className="text-blue-500 text-sm">Checking authentication...</div>
      ) : uploadError && (
        <div className="text-red-500 text-sm">Upload error: {uploadError}</div>
      )}

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
                {uploadProgress !== null && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : previewUrl ? (
              <div className="space-y-4">
                <div className="relative mx-auto" style={{ width: targetSize, height: targetSize }}>
                  <Image
                    src={previewUrl ? sanitizeFirebaseUrl(previewUrl) : ""}
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
