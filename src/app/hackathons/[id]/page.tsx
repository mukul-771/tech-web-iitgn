import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Users, Trophy, Clock, ExternalLink, ArrowLeft, Mail, Phone, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getHackathonById } from "@/lib/hackathons-storage"

interface HackathonPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: HackathonPageProps): Promise<Metadata> {
  const { id } = await params;
  const hackathon = await getHackathonById(id);

  if (!hackathon) {
    return {
      title: "Hackathon Not Found - Technical Council IITGN",
    };
  }

  return {
    title: `${hackathon.name} - Technical Council IITGN`,
    description: hackathon.description,
  };
}

export default async function HackathonPage({ params }: HackathonPageProps) {
  const { id } = await params;
  const hackathon = await getHackathonById(id);

  if (!hackathon) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "ongoing": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="space-y-6">
            <Button asChild variant="ghost" className="w-fit">
              <Link href="/hackathons">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Hackathons
              </Link>
            </Button>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tighter font-space-grotesk">
                  {hackathon.name}
                </h1>
                <Badge className={getStatusColor(hackathon.status)}>
                  {hackathon.status}
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {hackathon.description}
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{hackathon.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{hackathon.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{hackathon.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="font-medium">{hackathon.currentParticipants || '0'} / {hackathon.maxParticipants || 'Unlimited'}</p>
                </div>
              </div>
            </div>

            {/* Registration Button */}
            {hackathon.registrationLink && (hackathon.status === 'upcoming' || hackathon.status === 'ongoing') && (
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Button asChild size="lg" className="w-fit">
                  <Link href={hackathon.registrationLink} target="_blank" rel="noopener noreferrer">
                    {hackathon.status === 'upcoming' ? 'Register Now' : 'Join Now'}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                {hackathon.status === 'ongoing' && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="font-medium">Event is currently ongoing!</span>
                  </div>
                )}
                {hackathon.status === 'upcoming' && hackathon.registrationDeadline && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <Clock className="h-4 w-4" />
                    <span>Registration closes: {hackathon.registrationDeadline}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {hackathon.longDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Requirements */}
              {hackathon.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {hackathon.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Schedule */}
              {hackathon.schedule.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hackathon.schedule.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-20 text-sm font-medium text-muted-foreground flex-shrink-0">
                            {item.time}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.activity}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                            {item.location && (
                              <p className="text-sm text-muted-foreground mt-1">📍 {item.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Winners (for completed hackathons) */}
              {hackathon.status === 'completed' && hackathon.winners && hackathon.winners.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Winners</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hackathon.winners.map((winner, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{winner.position}</h4>
                            <Badge variant="outline">{winner.prize}</Badge>
                          </div>
                          <p className="font-medium">{winner.teamName}</p>
                          <p className="text-sm text-muted-foreground">{winner.members.join(", ")}</p>
                          <p className="text-sm mt-2">{winner.project}</p>
                          {winner.description && (
                            <p className="text-sm text-muted-foreground mt-1">{winner.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              {hackathon.registrationLink && (hackathon.status === 'upcoming' || hackathon.status === 'ongoing') && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {hackathon.status === 'upcoming' ? (
                        <>
                          <Calendar className="h-5 w-5 text-primary" />
                          Registration Open
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          Join Live Event
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hackathon.status === 'upcoming' && hackathon.registrationDeadline && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Deadline:</strong> {hackathon.registrationDeadline}
                      </div>
                    )}
                    {hackathon.status === 'ongoing' && (
                      <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        🔴 Event is currently live! Join now to participate.
                      </div>
                    )}
                    <Button asChild className="w-full" size="lg">
                      <Link href={hackathon.registrationLink} target="_blank" rel="noopener noreferrer">
                        {hackathon.status === 'upcoming' ? 'Register Now' : 'Join Event'}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    {hackathon.maxParticipants && (
                      <div className="text-xs text-muted-foreground text-center">
                        {hackathon.currentParticipants || '0'} / {hackathon.maxParticipants} participants
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="outline">{hackathon.category}</Badge>
                  </div>
                  
                  {hackathon.registrationDeadline && (
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Deadline</p>
                      <p className="font-medium">{hackathon.registrationDeadline}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prizes */}
              {hackathon.prizes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prizes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hackathon.prizes.map((prize, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium">{prize.position}</span>
                          <Badge variant="outline">{prize.amount}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Organizers */}
              {hackathon.organizers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Organizers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hackathon.organizers.map((organizer, index) => (
                        <div key={index} className="space-y-1">
                          <p className="font-medium">{organizer.name}</p>
                          <p className="text-sm text-muted-foreground">{organizer.role}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${organizer.email}`} className="text-primary hover:underline">
                              {organizer.email}
                            </a>
                          </div>
                          {organizer.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{organizer.phone}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sponsors */}
              {hackathon.sponsors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sponsors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hackathon.sponsors.map((sponsor, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{sponsor.name}</span>
                          <Badge variant="outline">{sponsor.tier}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
