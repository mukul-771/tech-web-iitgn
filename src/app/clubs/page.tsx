"use client"

import { useEffect, useState } from "react"

import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClubCard } from "@/components/clubs/club-card"

interface Club {
  id: string;
  name: string;
  description: string;
  type: "club" | "hobby-group" | "technical-council-group";
  category: string;
  logoPath?: string;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/clubs", {
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch clubs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      setError(error instanceof Error ? error.message : "Failed to load clubs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // Separate clubs, hobby groups, and technical council groups
  const technicalClubs = clubs.filter(item => item.type === "club")
  const hobbyGroups = clubs.filter(item => item.type === "hobby-group")
  const technicalCouncilGroups = clubs.filter(item => item.type === "technical-council-group")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading clubs and hobby groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-red-600 mb-4 text-center max-w-md">{error}</p>
        <Button onClick={fetchClubs} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative section-padding">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container relative z-10 mobile-padding">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6 text-center">
            <h1 className="responsive-text-3xl font-bold tracking-tighter font-space-grotesk leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Clubs</span>
            </h1>
            <p className="mx-auto max-w-[700px] responsive-text-base text-muted-foreground leading-relaxed px-4 sm:px-0">
              Discover your passion and join a community of like-minded innovators across technical clubs and hobby groups
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section-padding bg-muted/20">
        <div className="container mobile-padding">
          <div className="responsive-grid-1-3 gap-6 sm:gap-8 text-center">
            <div className="space-y-2 sm:space-y-3 mobile-card bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="responsive-text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {technicalClubs.length}
              </div>
              <div className="responsive-text-lg font-semibold">Technical Clubs</div>
              <div className="responsive-text-sm text-muted-foreground">
                Cutting-edge technology and innovation
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 mobile-card bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="responsive-text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {hobbyGroups.length}
              </div>
              <div className="responsive-text-lg font-semibold">Hobby Groups</div>
              <div className="responsive-text-sm text-muted-foreground">
                Creative and recreational activities
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 mobile-card bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="responsive-text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                500+
              </div>
              <div className="responsive-text-lg font-semibold">Active Members</div>
              <div className="responsive-text-sm text-muted-foreground">
                Students engaged across all groups
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Clubs Section */}
      {technicalClubs.length > 0 && (
        <section className="section-padding">
          <div className="container mobile-padding">
            <div className="text-center section-margin">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk mb-4">
                Technical <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Clubs</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join our technical clubs to enhance your skills, work on cutting-edge projects, and collaborate with fellow tech enthusiasts
              </p>
            </div>
            <div className="responsive-grid-1-2-3 gap-4 sm:gap-6">
              {technicalClubs.map((club) => (
                <ClubCard key={club.id} club={club} variant="technical" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Groups under Technical Council Section */}
      {technicalCouncilGroups.length > 0 && (
        <section className="section-padding bg-muted/20">
          <div className="container mobile-padding">
            <div className="text-center section-margin">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk mb-4">
                Groups under <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Technical Council</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Specialized groups operating under the Technical Council, providing unique resources and opportunities for innovation and development
              </p>
            </div>
            <div className="responsive-grid-1-2-3 gap-4 sm:gap-6">
              {technicalCouncilGroups.map((group) => (
                <ClubCard key={group.id} club={group} variant="council" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hobby Groups Section */}
      {hobbyGroups.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container mobile-padding">
            <div className="text-center section-margin">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk mb-4">
                Hobby <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Groups</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore your creative side and pursue your hobbies with like-minded individuals in our diverse hobby groups
              </p>
            </div>
            <div className="responsive-grid-1-2-3 gap-4 sm:gap-6">
              {hobbyGroups.map((group) => (
                <ClubCard key={group.id} club={group} variant="hobby" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {technicalClubs.length === 0 && technicalCouncilGroups.length === 0 && hobbyGroups.length === 0 && (
        <section className="section-padding">
          <div className="container mobile-padding">
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No Clubs Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We're working on adding exciting clubs and groups. Check back soon for updates!
              </p>
              <Button onClick={fetchClubs} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
