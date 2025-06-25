import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Users, Clock, ExternalLink, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
                  {(hackathon.startTime || hackathon.endTime) && (
                    <p className="text-sm text-muted-foreground">
                      {hackathon.startTime && hackathon.endTime 
                        ? `${hackathon.startTime} - ${hackathon.endTime}`
                        : hackathon.startTime || hackathon.endTime}
                    </p>
                  )}
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
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{hackathon.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="font-medium">{hackathon.teamSize || "Open"}</p>
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

              {/* Themes/Tracks */}
              <Card>
                <CardHeader>
                  <CardTitle>Themes & Tracks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hackathon.themes || "No specific themes announced yet. Stay tuned for updates!"}
                  </p>
                </CardContent>
              </Card>

              {/* Requirements & Eligibility */}
              <Card>
                <CardHeader>
                  <CardTitle>Requirements & Eligibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Eligibility Criteria</h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {hackathon.eligibility || "Open to all participants. Specific eligibility criteria will be announced soon."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Technical Requirements</h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {hackathon.requirements || "Basic technical requirements will be shared closer to the event date."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-muted-foreground leading-relaxed whitespace-pre-line font-sans">
                    {hackathon.timeline || "Detailed event timeline will be shared soon. Stay tuned for updates!"}
                  </pre>
                </CardContent>
              </Card>

              {/* Prize Pool */}
              <Card>
                <CardHeader>
                  <CardTitle>Prize Pool</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">🥇</div>
                      <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">First Prize</h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">{hackathon.firstPrize || "TBA"}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">🥈</div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">Second Prize</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{hackathon.secondPrize || "TBA"}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">🥉</div>
                      <h4 className="font-semibold text-orange-700 dark:text-orange-300">Third Prize</h4>
                      <p className="text-sm text-orange-600 dark:text-orange-400">{hackathon.thirdPrize || "TBA"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Special Prizes</h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {hackathon.specialPrizes || "Additional special category prizes will be announced soon!"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Judging Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle>Judging Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hackathon.judingCriteria || "Detailed judging criteria will be shared before the event."}
                  </p>
                </CardContent>
              </Card>

              {/* Submission Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Submission Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hackathon.submissionGuidelines || "Submission guidelines and requirements will be provided before the event."}
                  </p>
                </CardContent>
              </Card>

              {/* Important Notes */}
              <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader>
                  <CardTitle className="text-orange-700 dark:text-orange-300">Important Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-600 dark:text-orange-400 leading-relaxed whitespace-pre-line">
                    {hackathon.importantNotes || "Important notes and special instructions will be shared closer to the event date."}
                  </p>
                </CardContent>
              </Card>
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
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{hackathon.date}</p>
                    {(hackathon.startTime || hackathon.endTime) && (
                      <p className="text-sm text-muted-foreground">
                        {hackathon.startTime && hackathon.endTime 
                          ? `${hackathon.startTime} - ${hackathon.endTime}`
                          : hackathon.startTime || hackathon.endTime}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{hackathon.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Team Size</p>
                    <p className="font-medium">{hackathon.teamSize || "Individual or Team (TBA)"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Organizer Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Organizers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Organizer</p>
                    <p className="font-medium">{hackathon.organizerName || "Technical Council"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    {hackathon.organizerEmail ? (
                      <Link 
                        href={`mailto:${hackathon.organizerEmail}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {hackathon.organizerEmail}
                      </Link>
                    ) : (
                      <p className="font-medium text-muted-foreground">Contact details will be shared soon</p>
                    )}
                  </div>
                  {hackathon.organizerPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <Link 
                        href={`tel:${hackathon.organizerPhone}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {hackathon.organizerPhone}
                      </Link>
                    </div>
                  )}
                  {hackathon.organizerWebsite && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <Link 
                        href={hackathon.organizerWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
