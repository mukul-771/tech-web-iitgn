"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Event } from "@/lib/events-data";
import { AdminLayout } from "@/components/admin/admin-layout";
import { EventsList } from "@/components/admin/events-list";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Image,
  Plus,
  Users,
  Settings,
  BarChart3,
  RefreshCw,
  BookOpen,
  Code,
  Trophy
} from "lucide-react";

export function AdminDashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [clubs, setClubs] = useState<any[]>([]);
  const [magazines, setMagazines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    fetchAllData();
  }, [session, status, router]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      // Fetch all data in parallel
      const [eventsRes, clubsRes, magazinesRes] = await Promise.all([
        fetch("/api/admin/events"),
        fetch("/api/admin/clubs"),
        fetch("/api/admin/torque")
      ]);

      if (!eventsRes.ok) throw new Error("Failed to fetch events");
      if (!clubsRes.ok) throw new Error("Failed to fetch clubs");
      if (!magazinesRes.ok) throw new Error("Failed to fetch magazines");

      const [eventsData, clubsData, magazinesData] = await Promise.all([
        eventsRes.json(),
        clubsRes.json(),
        magazinesRes.json()
      ]);

      setEvents(eventsData);
      setClubs(Object.values(clubsData));
      setMagazines(Object.values(magazinesData));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = fetchAllData;

  const handleEventUpdate = () => {
    fetchEvents();
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
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="responsive-text-2xl font-bold font-space-grotesk">
              Admin Dashboard
            </h1>
            <p className="responsive-text-sm text-gray-600 dark:text-gray-400 mt-2">
              Manage your Technical Council website content and events
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button onClick={fetchEvents} variant="outline" size="sm" className="touch-target w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => router.push('/admin/events/new')} size="sm" className="touch-target w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="responsive-grid-1-2-3 gap-4 sm:gap-6">
          <Card className="glass hover:shadow-lg transition-all duration-300 mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="responsive-text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="responsive-text-xl font-bold">{Object.keys(events).length}</div>
              <p className="responsive-text-xs text-muted-foreground">
                Active events in system
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300 mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="responsive-text-sm font-medium">Clubs & Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="responsive-text-xl font-bold">{clubs.length}</div>
              <p className="responsive-text-xs text-muted-foreground">
                Technical clubs and hobby groups
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300 mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="responsive-text-sm font-medium">Magazines</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="responsive-text-xl font-bold">{magazines.length}</div>
              <p className="responsive-text-xs text-muted-foreground">
                Torque magazine issues
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="responsive-grid-1-2-3 gap-4 sm:gap-6">
          <Card className="glass hover:shadow-lg transition-all duration-300 cursor-pointer touch-target mobile-card"
                onClick={() => router.push('/admin/events')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 responsive-text-lg">
                <Calendar className="h-5 w-5" />
                Event Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="responsive-text-sm text-muted-foreground mb-4">
                Create, edit, and manage events for the gallery
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="responsive-text-xs">{Object.keys(events).length} Events</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => router.push('/admin/clubs')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clubs Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage technical clubs and hobby groups
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">{clubs.length} Clubs & Groups</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => router.push('/admin/hackathons')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Hackathons & Competitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage hackathons and coding competitions
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">2 Hackathons</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => router.push('/admin/inter-iit-achievements')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Inter-IIT Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage Inter-IIT achievements and accomplishments
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">3 Achievements</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => router.push('/admin/torque')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Torque Magazine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upload and manage magazine files by year
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">{magazines.length} Magazine Issues</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => router.push('/admin/gallery')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Photo Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upload and organize photos for events
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {Object.values(events).reduce((total, event) => total + (event.gallery?.length || 0), 0)} Photos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => router.push('/admin/settings')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure website settings and preferences
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">System Config</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventsList
              events={events}
              onEventUpdate={handleEventUpdate}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
