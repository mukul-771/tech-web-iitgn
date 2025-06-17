"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Event } from "@/lib/events-data";
import { AdminLayout } from "@/components/admin/admin-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Search,
  Upload,
  Download,
  Eye,
  Trash2,
  Filter,
  Grid,
  List
} from "lucide-react";

export default function GalleryManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    fetchEvents();
  }, [session, status, router]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/events");

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button onClick={fetchEvents}>Try Again</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Get all photos from all events
  const allPhotos = Object.entries(events).flatMap(([eventId, event]) =>
    (event.gallery || []).map((photo, index) => ({
      url: photo.url,
      eventId,
      eventTitle: event.title,
      eventCategory: event.category,
      index
    }))
  );

  const eventOptions = ["all", ...Object.entries(events).map(([id, event]) => ({ id, title: event.title }))];

  const filteredPhotos = allPhotos.filter(photo => {
    const matchesSearch = photo.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === "all" || photo.eventId === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  const totalPhotos = allPhotos.length;
  const eventsWithPhotos = Object.values(events).filter(event => event.gallery && event.gallery.length > 0).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Photo Gallery Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and organize photos across all events
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Photos</p>
                  <p className="text-2xl font-bold">{totalPhotos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Events with Photos</p>
                  <p className="text-2xl font-bold">{eventsWithPhotos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Filtered Results</p>
                  <p className="text-2xl font-bold">{filteredPhotos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Average per Event</p>
                  <p className="text-2xl font-bold">
                    {eventsWithPhotos > 0 ? Math.round(totalPhotos / eventsWithPhotos) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Controls */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by event name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background min-w-[200px]"
              >
                <option value="all">All Events</option>
                {Object.entries(events).map(([id, event]) => (
                  <option key={id} value={id}>
                    {event.title} ({event.gallery?.length || 0} photos)
                  </option>
                ))}
              </select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos Display */}
        {filteredPhotos.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No photos found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedEvent !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No photos have been uploaded yet"
                }
              </p>
              <Button onClick={() => router.push('/admin/events/new')}>
                Add Event with Photos
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPhotos.map((photo, index) => (
              <Card key={`${photo.eventId}-${photo.index}`} className="glass hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                    <img
                      src={photo.url}
                      alt={`${photo.eventTitle} - Photo ${photo.index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm line-clamp-1">{photo.eventTitle}</h4>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {photo.eventCategory}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(photo.url, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/events/${photo.eventId}/edit`)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredPhotos.map((photo, index) => (
                  <div key={`${photo.eventId}-${photo.index}`} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                    <img
                      src={photo.url}
                      alt={`${photo.eventTitle} - Photo ${photo.index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{photo.eventTitle}</h4>
                      <p className="text-sm text-muted-foreground">Photo {photo.index + 1}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {photo.eventCategory}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(photo.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/events/${photo.eventId}/edit`)}
                      >
                        Edit Event
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
