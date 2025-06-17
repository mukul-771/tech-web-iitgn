"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Event } from "@/lib/events-data";
import { AdminLayout } from "@/components/admin/admin-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Image as ImageIcon,
  Users,
  Eye,
  Download,
  Filter
} from "lucide-react";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <button onClick={fetchEvents} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const eventsArray = Object.entries(events);
  const totalPhotos = Object.values(events).reduce((total, event) => total + (event.gallery?.length || 0), 0);
  const categories = [...new Set(Object.values(events).map(event => event.category))];
  const publishedEvents = Object.values(events); // All events are considered published

  // Calculate category distribution
  const categoryStats = categories.map(category => ({
    name: category,
    count: Object.values(events).filter(event => event.category === category).length,
    photos: Object.values(events)
      .filter(event => event.category === category)
      .reduce((total, event) => total + (event.gallery?.length || 0), 0)
  }));

  // Calculate monthly distribution
  const monthlyStats = eventsArray.reduce((acc, [id, event]) => {
    const month = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentEvents = eventsArray
    .sort(([, a], [, b]) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const topCategories = categoryStats
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Insights and statistics about your events and content
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventsArray.length}</div>
              <p className="text-xs text-muted-foreground">
                All events published
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPhotos}</div>
              <p className="text-xs text-muted-foreground">
                Avg {eventsArray.length > 0 ? Math.round(totalPhotos / eventsArray.length) : 0} per event
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                {topCategories[0]?.name || "No categories"} is most popular
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">
                Events this month vs last
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Distribution */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{category.count} events</Badge>
                      <span className="text-sm text-muted-foreground">{category.photos} photos</span>
                    </div>
                  </div>
                ))}
                {categoryStats.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No categories yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map(([id, event]) => (
                  <div key={id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-medium line-clamp-1">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} • {event.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        Published
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.gallery?.length || 0} photos
                      </span>
                    </div>
                  </div>
                ))}
                {recentEvents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No events yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Event Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-6">
              {Object.entries(monthlyStats).map(([month, count]) => (
                <div key={month} className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium">{month}</p>
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-xs text-muted-foreground">events</p>
                </div>
              ))}
              {Object.keys(monthlyStats).length === 0 && (
                <div className="col-span-6 text-center py-8 text-muted-foreground">
                  No events data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-green-600">Most Active Category</h4>
                <p className="text-lg font-bold">{topCategories[0]?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">
                  {topCategories[0]?.count || 0} events
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-blue-600">Average Photos per Event</h4>
                <p className="text-lg font-bold">
                  {eventsArray.length > 0 ? Math.round(totalPhotos / eventsArray.length) : 0}
                </p>
                <p className="text-sm text-muted-foreground">photos</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-purple-600">Content Status</h4>
                <p className="text-lg font-bold">
                  {eventsArray.length > 0 ? Math.round((publishedEvents.length / eventsArray.length) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">published</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
