import { Metadata } from "next"
import Link from "next/link"
import { Clock, Briefcase, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Internships - Technical Council IITGN",
  description: "Internship opportunities and programs through the Technical Council of IIT Gandhinagar.",
}

export default function InternshipsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-space-grotesk">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Internships</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Bridging the gap between academic learning and industry experience
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Clock className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                Coming Soon
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                We're working on building a comprehensive internship platform that will connect 
                our students with leading tech companies and research opportunities.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid gap-6 md:grid-cols-3 w-full max-w-4xl">
              <div className="glass rounded-lg p-6 text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">Industry Partnerships</h3>
                <p className="text-sm text-muted-foreground">
                  Collaborations with top tech companies for internship opportunities
                </p>
              </div>

              <div className="glass rounded-lg p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">Mentorship Programs</h3>
                <p className="text-sm text-muted-foreground">
                  Guidance from industry experts and alumni throughout your journey
                </p>
              </div>

              <div className="glass rounded-lg p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Skill Development</h3>
                <p className="text-sm text-muted-foreground">
                  Workshops and training sessions to prepare for internships
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                What to Expect
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Our upcoming internship platform will offer comprehensive support for your career journey
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">For Students</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Curated internship listings from partner companies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Application tracking and status updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Interview preparation resources and mock sessions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Mentorship matching with industry professionals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Skill assessment and development recommendations</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold">For Companies</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Access to top talent from IIT Gandhinagar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Streamlined recruitment and selection process</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Customized internship program design</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Regular progress tracking and feedback systems</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Long-term partnership opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                Development Timeline
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Our roadmap for launching the internship platform
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-2xl font-bold text-blue-600">Q1</span>
                </div>
                <h3 className="text-xl font-bold">Platform Development</h3>
                <p className="text-sm text-muted-foreground">
                  Building the core platform features and user interface
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <span className="text-2xl font-bold text-purple-600">Q2</span>
                </div>
                <h3 className="text-xl font-bold">Partner Onboarding</h3>
                <p className="text-sm text-muted-foreground">
                  Establishing partnerships with leading tech companies
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <span className="text-2xl font-bold text-green-600">Q3</span>
                </div>
                <h3 className="text-xl font-bold">Beta Launch</h3>
                <p className="text-sm text-muted-foreground">
                  Limited beta release with select students and companies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
              Stay Updated
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground">
              Be the first to know when our internship platform launches. 
              Contact us to express your interest or get involved in the development process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/contact">
                  Express Interest
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">
                  Learn More About Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
