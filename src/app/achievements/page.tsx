import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Trophy, Medal, Award, Calendar, Users, Camera, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Achievements - Technical Council IITGN",
  description: "Explore the achievements and victories of Technical Council clubs in Inter-IIT Tech Meet, hackathons, and competitions.",
}

// This will be replaced with dynamic data fetching
async function getInterIITAchievements() {
  try {
    // In production, this would fetch from the API
    // For now, we'll use a server-side import of the storage function
    const { getInterIITAchievementsForDisplay } = await import('@/lib/inter-iit-achievements-storage');
    const achievements = await getInterIITAchievementsForDisplay();

    // Transform the data to match the expected format for the UI
    return achievements.map(achievement => {
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
        team: achievement.teamMembers.map(member => member.name).join(", "),
        medal
      };
    });
  } catch (error) {
    console.error('Error fetching Inter-IIT achievements:', error);
    // Fallback to default data
    return [
      {
        year: "2023",
        position: "3rd Place",
        event: "Autonomous Robotics Challenge",
        description: "Secured 3rd position in the Autonomous Robotics Challenge with excellent navigation and task completion capabilities.",
        team: "Sneha Agarwal, Vikram Singh, Priya Sharma, Amit Kumar",
        medal: "bronze"
      },
      {
        year: "2023",
        position: "2nd Place",
        event: "Innovation Challenge",
        description: "Secured 2nd position in the Innovation Challenge with an innovative IoT solution for smart campus management.",
        team: "Kavya Reddy, Rohit Sharma",
        medal: "silver"
      },
      {
        year: "2023",
        position: "5th Place",
        event: "Programming Contest",
        description: "Achieved 5th position in the highly competitive Programming Contest, demonstrating strong algorithmic and problem-solving skills.",
        team: "Arjun Patel, Kavya Sharma, Rohit Gupta",
        medal: "bronze"
      }
    ];
  }
}



// This will be replaced with dynamic data fetching
async function getEventGallery() {
  try {
    // In production, this would fetch from the API
    // For now, we'll use a server-side import of the storage function
    const { getEventsForDisplay } = await import('@/lib/events-storage');
    return await getEventsForDisplay();
  } catch (error) {
    console.error('Error fetching events:', error);
    // Fallback to default data
    return [
      {
        id: "tech-symposium-2023",
        title: "Annual Tech Symposium 2023",
        description: "A grand showcase of innovation featuring project exhibitions, tech talks, and networking sessions with industry leaders.",
        organizer: "Technical Council",
        date: "March 2023",
        image: "/events/placeholder-1.svg",
        category: "Symposium"
      },
      {
        id: "robotics-workshop-2023",
        title: "Robotics Workshop Series",
        description: "Hands-on workshop series covering autonomous navigation, computer vision, and machine learning in robotics.",
        organizer: "Robotics Club",
        date: "September 2023",
        image: "/events/placeholder-3.svg",
        category: "Workshop"
      },
      {
        id: "hackathon-2023",
        title: "IITGNHacks 2023",
        description: "48-hour hackathon bringing together brilliant minds to solve real-world problems using cutting-edge technology.",
        organizer: "Programming Club",
        date: "November 2023",
        image: "/events/placeholder-2.svg",
        category: "Hackathon"
      }
    ];
  }
}

export default async function AchievementsPage() {
  const eventGallery = await getEventGallery();
  const interIITAchievements = await getInterIITAchievements();

  // Calculate dynamic stats
  const stats = {
    totalAwards: interIITAchievements.length,
    competitions: new Set(interIITAchievements.map(a => a.event)).size,
    participants: new Set(interIITAchievements.flatMap(a => a.team.split(", "))).size,
    yearsActive: new Set(interIITAchievements.map(a => a.year)).size
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
              {interIITAchievements.map((achievement, index) => (
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
              ))}
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
              {eventGallery.map((event, index) => (
                <Link key={index} href={`/achievements/events/${event.id}`} className="group block">
                  <div className="glass rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    {/* Event Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                      <Image
                        src={event.image}
                        alt={event.title}
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
              ))}
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
