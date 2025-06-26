import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Users, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageSlider } from "@/components/ui/image-slider"
import { getEventById } from "@/lib/events-storage"

// Fallback event data for development
const fallbackEventsData: Record<string, unknown> = {
  "tech-symposium-2023": {
    title: "Annual Tech Symposium 2023",
    description: "A grand showcase of innovation featuring project exhibitions, tech talks, and networking sessions with industry leaders.",
    longDescription: "The Annual Tech Symposium 2023 was a landmark event that brought together students, faculty, and industry professionals to celebrate innovation and technological advancement. The event featured cutting-edge project exhibitions, inspiring keynote speeches, and valuable networking opportunities. Participants had the chance to showcase their research, learn from industry experts, and connect with like-minded individuals passionate about technology.",
    organizer: "Technical Council",
    date: "March 15-17, 2023",
    location: "IIT Gandhinagar Campus",
    duration: "3 Days",
    participants: "500+",
    category: "Symposium",
    highlights: [
      "50+ Project Exhibitions",
      "10 Industry Expert Talks",
      "Networking Sessions",
      "Innovation Awards",
      "Student Research Presentations"
    ],
    gallery: [
      "/events/placeholder-1.svg",
      "/events/placeholder-2.svg",
      "/events/placeholder-3.svg",
      "/events/placeholder-1.svg",
      "/events/placeholder-2.svg",
      "/events/placeholder-3.svg"
    ]
  },
  "robotics-workshop-2023": {
    title: "Robotics Workshop Series",
    description: "Hands-on workshop series covering autonomous navigation, computer vision, and machine learning in robotics.",
    longDescription: "The Robotics Workshop Series 2023 was an intensive hands-on program designed to introduce students to the fascinating world of robotics. The workshop covered fundamental concepts in autonomous navigation, computer vision applications, and machine learning integration in robotic systems. Participants worked with real robots and learned practical skills in programming, sensor integration, and AI implementation.",
    organizer: "Robotics Club",
    date: "September 10-24, 2023",
    location: "Robotics Lab, IIT Gandhinagar",
    duration: "2 Weeks",
    participants: "80+",
    category: "Workshop",
    highlights: [
      "Autonomous Navigation Programming",
      "Computer Vision Implementation",
      "Machine Learning in Robotics",
      "Hands-on Robot Building",
      "Competition and Showcase"
    ],
    gallery: [
      "/events/placeholder-3.svg",
      "/events/placeholder-1.svg",
      "/events/placeholder-2.svg",
      "/events/placeholder-3.svg"
    ]
  },
  "hackathon-2023": {
    title: "IITGNHacks 2023",
    description: "48-hour hackathon bringing together brilliant minds to solve real-world problems using cutting-edge technology.",
    longDescription: "IITGNHacks 2023 was an exhilarating 48-hour hackathon that challenged participants to develop innovative solutions to real-world problems. Teams worked around the clock to create applications, websites, and software solutions that could make a meaningful impact. The event fostered creativity, collaboration, and technical excellence among participants from various backgrounds.",
    organizer: "Programming Club",
    date: "November 18-20, 2023",
    location: "Academic Block, IIT Gandhinagar",
    duration: "48 Hours",
    participants: "200+",
    category: "Hackathon",
    highlights: [
      "48-Hour Coding Marathon",
      "Real-world Problem Solving",
      "Mentorship from Industry Experts",
      "Prize Pool of ₹1,00,000",
      "Networking and Learning"
    ],
    gallery: [
      "/events/placeholder-2.svg",
      "/events/placeholder-1.svg",
      "/events/placeholder-3.svg",
      "/events/placeholder-2.svg",
      "/events/placeholder-1.svg"
    ]
  },
  "ai-ml-conference-2023": {
    title: "AI/ML Conference 2023",
    description: "Conference featuring research presentations, industry insights, and hands-on sessions on artificial intelligence and machine learning.",
    longDescription: "The AI/ML Conference 2023 was a comprehensive event that brought together researchers, students, and industry professionals to explore the latest developments in artificial intelligence and machine learning. The conference featured research paper presentations, industry case studies, and hands-on workshops that provided participants with both theoretical knowledge and practical skills.",
    organizer: "AI/ML Club",
    date: "February 25-26, 2023",
    location: "Convention Center, IIT Gandhinagar",
    duration: "2 Days",
    participants: "300+",
    category: "Conference",
    highlights: [
      "Research Paper Presentations",
      "Industry Case Studies",
      "Hands-on ML Workshops",
      "AI Ethics Panel Discussion",
      "Networking with Researchers"
    ],
    gallery: [
      "/events/placeholder-1.svg",
      "/events/placeholder-3.svg",
      "/events/placeholder-2.svg",
      "/events/placeholder-1.svg"
    ]
  },
  "cybersecurity-bootcamp-2023": {
    title: "Cybersecurity Bootcamp",
    description: "Intensive bootcamp covering ethical hacking, penetration testing, and cybersecurity best practices.",
    longDescription: "The Cybersecurity Bootcamp 2023 was an intensive training program designed to equip participants with essential cybersecurity skills. The bootcamp covered ethical hacking techniques, penetration testing methodologies, and cybersecurity best practices. Participants gained hands-on experience with security tools and learned how to identify and mitigate various security threats.",
    organizer: "Cybersecurity Club",
    date: "August 5-12, 2023",
    location: "Computer Lab, IIT Gandhinagar",
    duration: "1 Week",
    participants: "60+",
    category: "Bootcamp",
    highlights: [
      "Ethical Hacking Techniques",
      "Penetration Testing Labs",
      "Security Tools Training",
      "Capture The Flag Competition",
      "Industry Expert Sessions"
    ],
    gallery: [
      "/events/placeholder-2.svg",
      "/events/placeholder-3.svg",
      "/events/placeholder-1.svg"
    ]
  },
  "web-dev-workshop-2023": {
    title: "Full-Stack Development Workshop",
    description: "Comprehensive workshop series on modern web development technologies including React, Node.js, and cloud deployment.",
    longDescription: "The Full-Stack Development Workshop 2023 was a comprehensive program that covered modern web development from frontend to backend. Participants learned to build complete web applications using React for the frontend, Node.js for the backend, and various cloud platforms for deployment. The workshop emphasized practical, project-based learning.",
    organizer: "Web Development Club",
    date: "October 8-22, 2023",
    location: "Computer Center, IIT Gandhinagar",
    duration: "2 Weeks",
    participants: "120+",
    category: "Workshop",
    highlights: [
      "React Frontend Development",
      "Node.js Backend Programming",
      "Database Integration",
      "Cloud Deployment",
      "Project Showcase"
    ],
    gallery: [
      "/events/placeholder-3.svg",
      "/events/placeholder-2.svg",
      "/events/placeholder-1.svg",
      "/events/placeholder-3.svg"
    ]
  }
}

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
