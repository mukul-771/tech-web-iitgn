"use client";
import { useSyncFirebaseAuth } from "@/lib/useSyncFirebaseAuth";

export default function SyncFirebaseAuthClient() {
  useSyncFirebaseAuth();
  return null;
}
