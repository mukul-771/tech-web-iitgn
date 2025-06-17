"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Plus, Search, Edit, Trash2, Calendar, MapPin, Trophy, Medal, Loader2, AlertCircle, Eye } from "lucide-react";
import { InterIITEvent } from "@/lib/inter-iit-data";

export default function AdminInterIITPage() {
  const router = useRouter();
  const [events, setEvents] = useState<InterIITEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/inter-iit");
      if (!response.ok) {
        throw new Error("Failed to fetch Inter-IIT events");
      }
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching Inter-IIT events:", error);
      setError("Failed to load Inter-IIT events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/inter-iit/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete Inter-IIT event");
      }

      await fetchEvents(); // Refresh the list
      alert("Inter-IIT event deleted successfully!");
    } catch (error) {
      console.error("Error deleting Inter-IIT event:", error);
      alert("Failed to delete Inter-IIT event. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.hostIIT.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalMedals = events.reduce((sum, event) => {
    const ourResult = event.overallResults.find(result => result.iit === 'IIT Gandhinagar');
    return sum + (ourResult ? ourResult.goldMedals + ourResult.silverMedals + ourResult.bronzeMedals : 0);
  }, 0);

  const totalEvents = events.reduce((sum, event) => sum + event.events.length, 0);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading Inter-IIT events...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchEvents} variant="outline">
            Try Again
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Inter-IIT Tech Meet
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage Inter-IIT Tech Meet events and achievements
            </p>
          </div>
          <Button onClick={() => router.push('/admin/inter-iit/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search Inter-IIT events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Competitions</p>
                  <p className="text-2xl font-bold">{totalEvents}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Medals</p>
                  <p className="text-2xl font-bold">{totalMedals}</p>
                </div>
                <Medal className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Latest Year</p>
                  <p className="text-2xl font-bold">{events.length > 0 ? events[0].year : '-'}</p>
                </div>
                <Trophy className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="grid gap-6">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Inter-IIT events found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No events match your search criteria." : "Get started by adding your first Inter-IIT event."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push('/admin/inter-iit/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => {
              const ourResult = event.overallResults.find(result => result.iit === 'IIT Gandhinagar');
              return (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{event.name}</CardTitle>
                          <Badge variant="outline">{event.year}</Badge>
                          {ourResult && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Rank #{ourResult.position}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base">
                          {event.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/achievements`, '_blank')}
                          title="View achievements page"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/inter-iit/${event.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(event.id, event.name)}
                          disabled={deletingId === event.id}
                        >
                          {deletingId === event.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{event.startDate} to {event.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span>Host: {event.hostIIT}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{event.events.length} competitions</Badge>
                      <Badge variant="outline">{event.teamRoster.length} team members</Badge>
                      <Badge variant="outline">{event.achievements.length} achievements</Badge>
                      {ourResult && (
                        <>
                          {ourResult.goldMedals > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              🥇 {ourResult.goldMedals}
                            </Badge>
                          )}
                          {ourResult.silverMedals > 0 && (
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                              🥈 {ourResult.silverMedals}
                            </Badge>
                          )}
                          {ourResult.bronzeMedals > 0 && (
                            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                              🥉 {ourResult.bronzeMedals}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
