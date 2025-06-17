"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Event } from "@/lib/events-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  MapPin,
  Eye
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DeleteEventDialog } from "./delete-event-dialog";

interface EventsListProps {
  events: Record<string, Event>;
  onEventUpdate: () => void;
}

export function EventsList({ events, onEventUpdate }: EventsListProps) {
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  const eventsList = Object.values(events).sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onEventUpdate();
        setDeleteEventId(null);
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      // TODO: Show error toast
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-space-grotesk">Events</h2>
        <Link href="/admin/events/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Event
          </Button>
        </Link>
      </div>

      {eventsList.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Get started by creating your first event
            </p>
            <Link href="/admin/events/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventsList.map((event) => (
            <Card key={event.id} className="glass hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {event.title}
                    </CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      {event.category}
                    </Badge>
                  </div>
                </div>

                {event.gallery.length > 0 && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={event.gallery[0].url}
                      alt={event.gallery[0].alt}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{event.participants} participants</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    {event.gallery.length} photos
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated {formatDate(event.updatedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link href={`/achievements/events/${event.id}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/events/${event.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteEventId(event.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteEventDialog
        isOpen={!!deleteEventId}
        onClose={() => setDeleteEventId(null)}
        onConfirm={() => deleteEventId && handleDeleteEvent(deleteEventId)}
        eventTitle={deleteEventId ? events[deleteEventId]?.title : ""}
      />
    </div>
  );
}
