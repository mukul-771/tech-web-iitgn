import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Users, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageSlider } from "@/components/ui/image-slider"
import { getEventById } from "@/lib/db/events"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let event;
  try {
    event = await getEventById(resolvedParams.id);
  } catch {
    return {
      title: "Event Not Found",
    }
  }

  if (!event) {
    return {
      title: "Event Not Found",
    }
  }

  return {
    title: `${event.title} - Technical Council IITGN`,
    description: event.description,
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  let event;
  try {
    event = await getEventById(resolvedParams.id);
  } catch {
    // No fallback data - return not found if event doesn't exist
    notFound();
  }

  if (!event) {
    notFound()
  }

  return (
    <div className="flex flex-col">
      {/* Back Navigation */}
      <div className="container px-4 md:px-6 py-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/achievements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Achievements
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-xs font-medium text-blue-600">
                  {event.category}
                </span>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-space-grotesk">
                  {event.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {event.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>{event.participants} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{event.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Organized by:</span>
                <span className="text-blue-600 font-medium">{event.organizer}</span>
              </div>
            </div>

            <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
              <Image
                src={typeof event.gallery[0] === 'string' ? event.gallery[0] : event.gallery[0]?.url || '/events/placeholder-1.svg'}
                alt={typeof event.gallery[0] === 'string' ? event.title : event.gallery[0]?.alt || event.title}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Event Description */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl font-space-grotesk">
                About the Event
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Event Highlights</h3>
              <ul className="grid gap-2 md:grid-cols-2">
                {event.highlights.map((highlight: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl font-space-grotesk">
                Event Gallery
              </h2>
              <p className="text-muted-foreground">
                Capturing the moments and memories from {event.title}
              </p>
            </div>

            <div className="group">
              <ImageSlider images={event.gallery} eventTitle={event.title} />
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
