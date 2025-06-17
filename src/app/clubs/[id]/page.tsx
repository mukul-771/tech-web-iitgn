"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Mail, Users, Award, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Club {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  type: "club" | "hobby-group";
  category: string;
  members: string;
  established: string;
  email: string;
  achievements: string[];
  projects: string[];
  team: Array<{
    name: string;
    role: string;
    email: string;
  }>;
  logoPath?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get logo path
const getLogoPath = (club: Club) => {
  if (club.logoPath) {
    return club.logoPath;
  }

  // Fallback to static logo mapping for existing clubs
  const logoMap: Record<string, string> = {
    // Technical Clubs
    'metis': '/logos/clubs/metis.jpeg',
    'digis': '/logos/clubs/digis.jpg',
    'mean-mechanics': '/logos/clubs/mean-mechanics.png',
    'odyssey': '/logos/clubs/odyssey.jpg',
    'grasp': '/logos/clubs/grasp.png',
    'machine-learning': '/logos/clubs/machine-learning.jpeg',
    'tinkerers-lab': '/logos/clubs/tinkerers-lab.png',
    'anveshanam': '/logos/clubs/anveshanam.png',

    // Hobby Groups
    'embed': '/logos/hobby-groups/embed.png',
    'blockchain-hobby': '/logos/hobby-groups/blockchain-hobby.png',
  }

  return logoMap[club.id] || null
}

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params.id as string;

  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClub = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/clubs/${clubId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.status === 404) {
        notFound();
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch club: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setClub(data);
    } catch (error) {
      console.error("Error fetching club:", error);
      setError(error instanceof Error ? error.message : "Failed to load club details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchClub();
    }
  }, [clubId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading club details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-red-600 mb-4 text-center max-w-md">{error}</p>
        <Button onClick={fetchClub} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!club) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      {/* Back Navigation */}
      <div className="container px-4 md:px-6 py-4">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors">
          <Link href="/clubs">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-sm">Back to Clubs & Groups</span>
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-sm font-medium text-blue-600">
                  {club.category}
                </span>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-space-grotesk">
                  {club.name}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {club.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {club.members} members
                </div>
                {club.established && (
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Established {club.established}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
              {getLogoPath(club) ? (
                <Image
                  src={getLogoPath(club)!}
                  alt={`${club.name} logo`}
                  width={300}
                  height={300}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-6xl font-bold text-muted-foreground opacity-50">
                  {club.name.split(' ').map((word: string) => word[0]).join('')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tighter mb-6">About Us</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {club.longDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Achievements & Projects */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Achievements */}
            {club.achievements && club.achievements.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-600" />
                  <h3 className="text-2xl font-bold">Achievements</h3>
                </div>
                <ul className="space-y-3">
                  {club.achievements.map((achievement: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Projects */}
            {club.projects && club.projects.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Current Projects</h3>
                <ul className="space-y-3">
                  {club.projects.map((project: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{project}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Team Members */}
      {club.team && club.team.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container px-4 md:px-6">
            <h3 className="text-2xl font-bold mb-8">Team Members</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {club.team.map((member, index: number) => (
                <div key={index} className="glass rounded-lg p-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                  <Button asChild variant="outline" size="sm">
                    <a href={`mailto:${member.email}`}>
                      <Mail className="mr-2 h-3 w-3" />
                      Contact
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  )
}