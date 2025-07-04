"use client";

import Link from "next/link"
import Image from "next/image"
import { Trophy, Medal, Award, Calendar, Users, Camera, ArrowRight } from "lucide-react"
import { Event } from "@/lib/events-data"
import { useEffect, useState } from "react"

// Client-side rendering for dynamic data

interface TeamMember {
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  role: string;
  email: string;
  achievements: string[];
}

interface Achievement {
  id: string;
  achievementType: string;
  competitionName: string;
  interIITEdition: string;
  year: string;
  hostIIT: string;
  location: string;
  ranking?: number;
  achievementDescription: string;
  significance: string;
  competitionCategory: string;
  achievementDate: string;
  points?: number;
  status: string;
  teamMembers: TeamMember[];
}

// Metadata handled by layout since this is a client component

interface UIAchievement {
  year: string;
  position: string;
  event: string;
  description: string;
  team: string;
  medal: string;
}

// This will fetch fresh data from the API for dynamic updates
async function getInterIITAchievements() {
  try {
    // Use relative API calls to work with any domain
    const apiUrl = '/api/inter-iit-achievements';
    
    console.log('Fetching achievements from:', apiUrl);
    const response = await fetch(apiUrl, {
      cache: 'no-store', // Ensure no caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const achievements: Achievement[] = await response.json();
    console.log('Fetched achievements count:', achievements.length);
    
    if (achievements.length === 0) {
      console.warn('No achievements found');
      return [];
    }

    // Transform the data to match the expected format for the UI
    return achievements.map((achievement: Achievement) => {
      let medal = "bronze";
      let position = `${achievement.ranking || 'N/A'}`;

      if (achievement.achievementType === "gold-medal") {
        medal = "gold";
        position = "1st Place";
      } else if (achievement.achievementType === "silver-medal") {
        medal = "silver";
        position = "2nd Place";
      } else if (achievement.achievementType === "bronze-medal") {
        medal = "bronze";
        position = "3rd Place";
      } else if (achievement.ranking) {
        position = `${achievement.ranking}${achievement.ranking === 1 ? 'st' : achievement.ranking === 2 ? 'nd' : achievement.ranking === 3 ? 'rd' : 'th'} Place`;
      }

      return {
        year: achievement.year,
        position,
        event: achievement.competitionName,
        description: achievement.achievementDescription,
        team: achievement.teamMembers.map((member: TeamMember) => member.name).join(", "),
        medal
      };
    });
  } catch (error) {
    console.error('Error fetching Inter-IIT achievements:', error);
    // Return empty array instead of error object to avoid showing errors in UI
    return [];
  }
}



// This will fetch fresh data from the events API for dynamic updates
async function getEventGallery(): Promise<Event[]> {
  try {
    // Use relative API calls to work with any domain
    const apiUrl = '/api/events';
    
    console.log('Fetching events from:', apiUrl);
    const response = await fetch(apiUrl, {
      cache: 'no-store', // Ensure no caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const events = await response.json();
    console.log('Fetched events count:', events.length);
    
    return events || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    // Return empty array instead of error object to avoid showing errors in UI
    return [];
  }
}

export default function AchievementsPage() {
  const [eventGallery, setEventGallery] = useState<Event[]>([]);
  const [interIITAchievements, setInterIITAchievements] = useState<UIAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsData, achievementsData] = await Promise.all([
          getEventGallery(),
          getInterIITAchievements()
        ]);
        setEventGallery(eventsData);
        setInterIITAchievements(achievementsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const stats = {
    totalAwards: interIITAchievements.length,
    competitions: new Set(interIITAchievements.map((a: UIAchievement) => a.event)).size,
    participants: new Set(interIITAchievements.flatMap((a: UIAchievement) => a.team.split(", "))).size,
    yearsActive: new Set(interIITAchievements.map((a: UIAchievement) => a.year)).size
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-space-grotesk">
              Our <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Achievements</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Celebrating excellence in technology, innovation, and competitive spirit
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.totalAwards}+</div>
              <div className="text-sm text-muted-foreground">Awards Won</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.competitions}+</div>
              <div className="text-sm text-muted-foreground">Competitions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.participants}+</div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.yearsActive}</div>
              <div className="text-sm text-muted-foreground">Years Running</div>
            </div>
          </div>
        </div>
      </section>

      {/* Inter-IIT Tech Meet */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                Inter-IIT Tech Meet
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Our stellar performance in the most prestigious technical competition among IITs
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interIITAchievements.length > 0 ? (
                interIITAchievements.map((achievement: UIAchievement, index: number) => (
                  <div key={index} className="glass rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {achievement.medal === "gold" && <Trophy className="h-6 w-6 text-yellow-500" />}
                        {achievement.medal === "silver" && <Medal className="h-6 w-6 text-gray-400" />}
                        {achievement.medal === "bronze" && <Award className="h-6 w-6 text-orange-600" />}
                        <span className="font-bold text-lg">{achievement.position}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{achievement.year}</span>
                    </div>

                    <h3 className="font-semibold mb-2">{achievement.event}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>

                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <Users className="h-3 w-3" />
                      {achievement.team}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Achievements Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Check back later for updates on our Inter-IIT performance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>



      {/* Event Gallery */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                Event Gallery
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Explore our recent events, workshops, and conferences that showcase innovation and learning
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {eventGallery.length > 0 ? (
                eventGallery.map((event, index) => (
                  <Link key={index} href={`/achievements/events/${event.id}`} className="group block">
                    <div className="glass rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      {/* Event Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                        <Image
                          src={event.gallery[0]?.url || "/events/placeholder-1.svg"}
                          alt={event.gallery[0]?.alt || event.title}
                          width={400}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute top-4 right-4">
                          <span className="inline-block rounded-full bg-white/90 dark:bg-gray-900/90 px-3 py-1 text-xs font-medium text-gray-900 dark:text-gray-100">
                            {event.category}
                          </span>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <Camera className="h-5 w-5 text-white/80" />
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors duration-300">
                            {event.title}
                          </h3>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-blue-600">
                            <Users className="h-3 w-3" />
                            {event.organizer}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {event.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Events Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay tuned for upcoming events and activities.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
