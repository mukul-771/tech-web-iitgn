import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, Trophy, Clock, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getHackathonsForDisplay, getHackathonStats } from "@/lib/hackathons-storage"

export const metadata: Metadata = {
  title: "Hackathons - Technical Council IITGN",
  description: "Explore upcoming, ongoing, and past hackathons organized by the Technical Council of IIT Gandhinagar.",
}

export default async function HackathonsPage() {
  let hackathons: any[] = [];
  let stats = { total: 0, upcoming: 0, totalParticipants: 0, totalPrizePool: 0 };
  
  try {
    hackathons = await getHackathonsForDisplay();
    stats = await getHackathonStats();
  } catch (error) {
    console.error('Error loading hackathons data:', error);
    // Continue with empty data for build-time rendering
  }

  // Ensure hackathons is an array
  if (!Array.isArray(hackathons)) {
    hackathons = [];
  }

  // Categorize hackathons by status
  const upcomingHackathons = hackathons.filter(h => h && h.status === 'upcoming');
  const ongoingHackathons = hackathons.filter(h => h && h.status === 'ongoing');
  const previousHackathons = hackathons.filter(h => h && h.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "ongoing": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const HackathonCard = ({ hackathon }: { hackathon: any }) => {
    const getStatusGradient = (status: string) => {
      switch (status) {
        case "upcoming": return "from-blue-600 to-purple-600";
        case "ongoing": return "from-green-600 to-emerald-600";
        case "completed": return "from-gray-600 to-slate-600";
        case "cancelled": return "from-red-600 to-pink-600";
        default: return "from-gray-600 to-slate-600";
      }
    };

    const getStatusBg = (status: string) => {
      switch (status) {
        case "upcoming": return "bg-blue-600/10 text-blue-600 dark:text-blue-400";
        case "ongoing": return "bg-green-600/10 text-green-600 dark:text-green-400";
        case "completed": return "bg-gray-600/10 text-gray-600 dark:text-gray-400";
        case "cancelled": return "bg-red-600/10 text-red-600 dark:text-red-400";
        default: return "bg-gray-600/10 text-gray-600 dark:text-gray-400";
      }
    };

    return (
      <div className="glass rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden">
        {/* Background Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient(hackathon.status)} opacity-0 group-hover:opacity-5 transition-all duration-300 rounded-2xl`} />

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <h3 className="text-lg font-bold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 line-clamp-2 font-space-grotesk">
                {hackathon.name}
              </h3>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBg(hackathon.status)} backdrop-blur-sm border border-current/20`}>
                {hackathon.status}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {hackathon.description}
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 dark:bg-white/5">
              <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">{hackathon.date}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 dark:bg-white/5">
              <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="truncate">{hackathon.location}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 dark:bg-white/5">
              <Clock className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span className="truncate">{hackathon.duration}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 dark:bg-white/5">
              <Users className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span className="truncate">{hackathon.currentParticipants || '0'} / {hackathon.maxParticipants || 'Unlimited'}</span>
            </div>
          </div>

          {/* Category and Prizes */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20 w-fit">
              {hackathon.category}
            </div>
            {hackathon.prizes && hackathon.prizes.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{hackathon.prizes.length} prize{hackathon.prizes.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href={`/hackathons/${hackathon.id}`}>
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            {hackathon.registrationLink && (hackathon.status === 'upcoming' || hackathon.status === 'ongoing') && (
              <Button asChild variant="outline" className="flex-1 sm:flex-none glass border-blue-600/30 hover:bg-blue-600/10 hover:border-blue-600/50 transition-all duration-300">
                <Link href={hackathon.registrationLink} target="_blank" rel="noopener noreferrer">
                  {hackathon.status === 'upcoming' ? 'Register' : 'Join Now'}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-space-grotesk leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Hackathons</span>
                <br />
                <span className="text-gray-900 dark:text-white">& Competitions</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground leading-relaxed">
                Join our exciting hackathons and coding competitions. Build innovative solutions, learn new technologies, and compete for amazing prizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-muted/20">
        <div className="container mobile-padding">
          <div className="responsive-grid-1-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Events */}
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-3 group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all duration-300">
                  <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/10 to-blue-600/10 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {stats.total}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Events</p>
            </div>

            {/* Upcoming Events */}
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 flex items-center justify-center mb-3 group-hover:from-blue-600/30 group-hover:to-cyan-600/30 transition-all duration-300">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/10 to-cyan-600/10 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {stats.upcoming}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
            </div>

            {/* Total Participants */}
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 flex items-center justify-center mb-3 group-hover:from-green-600/30 group-hover:to-emerald-600/30 transition-all duration-300">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600/10 to-emerald-600/10 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {stats.totalParticipants}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
            </div>

            {/* Total Prize Pool */}
            <div className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-yellow-600/20 to-orange-600/20 flex items-center justify-center mb-3 group-hover:from-yellow-600/30 group-hover:to-orange-600/30 transition-all duration-300">
                  <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-600/10 to-orange-600/10 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                ₹{(stats.totalPrizePool / 100000).toFixed(1)}L
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Prize Pool</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Hackathons */}
      {upcomingHackathons.length > 0 && (
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 mb-4">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-space-grotesk">
                  Upcoming <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Events</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-lg text-muted-foreground leading-relaxed">
                  Don't miss out on these exciting upcoming hackathons and competitions
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ongoing Hackathons */}
      {ongoingHackathons.length > 0 && (
        <section className="py-16 md:py-20 lg:py-24 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 mb-4">
                  <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-space-grotesk">
                  Ongoing <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Events</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-lg text-muted-foreground leading-relaxed">
                  These hackathons are currently in progress - join the action now!
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ongoingHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Previous Hackathons */}
      {previousHackathons.length > 0 && (
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-gray-600/20 to-purple-600/20 mb-4">
                  <Trophy className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-space-grotesk">
                  Previous <span className="bg-gradient-to-r from-gray-600 to-purple-600 bg-clip-text text-transparent">Events</span>
                </h2>
                <p className="mx-auto max-w-[600px] text-lg text-muted-foreground leading-relaxed">
                  Explore our past hackathons and their amazing outcomes
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {previousHackathons.slice(0, 6).map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
              {previousHackathons.length > 6 && (
                <div className="text-center">
                  <Button variant="outline" size="lg" className="glass border-purple-600/30 hover:bg-purple-600/10 hover:border-purple-600/50 transition-all duration-300 group">
                    View All Previous Events
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {hackathons.length === 0 && (
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-12">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-6">
                  <Trophy className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold mb-4 font-space-grotesk">No Hackathons Available</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  We're working on organizing exciting hackathons and competitions. Stay tuned for updates!
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  Get Notified
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
