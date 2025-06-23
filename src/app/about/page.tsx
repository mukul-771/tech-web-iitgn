import { Metadata } from "next"
import { Target, Eye, MapPin, BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { defaultTeamData, TeamMember } from "@/lib/team-data"
import { TechCube3D } from "@/components/ui/tech-cube-3d"
import { TeamMemberImage } from "@/components/ui/team-member-image";
import { getAllTeamMembers } from "@/lib/team-storage";

export const metadata: Metadata = {
  title: "About Us - Technical Council IITGN",
  description: "Learn about the Technical Council of IIT Gandhinagar, our mission, vision, and plans for fostering innovation.",
}

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AboutPage() {
  // Get team data from Blob storage (same source as admin panel)
  let teamMembers: TeamMember[] = [];
  try {
    const teamData = await getAllTeamMembers();
    teamMembers = Object.values(teamData) as TeamMember[];
    console.log('About page: Loaded team members from storage:', teamMembers.length);
  } catch (error) {
    console.error('Error loading team data from storage:', error);
    // Fallback to default data
    teamMembers = Object.values(defaultTeamData) as TeamMember[];
  }

  // Get leadership team (secretary)
  const secretary = teamMembers.find(member => member.category === "leadership");

  // Get coordinators
  const coordinators = teamMembers.filter(member => member.category === "coordinator");
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-space-grotesk">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tech Council</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Driving innovation and technical excellence at IIT Gandhinagar
            </p>
          </div>
        </div>
      </section>

      {/* About Tech Team Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6 order-1 lg:order-1">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                About Tech Team
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The Technical Council of IIT Gandhinagar serves as the central hub for all technical activities
                  on campus. We are a diverse community of passionate students, researchers, and innovators who
                  believe in the power of technology to transform the world.
                </p>
                <p>
                  Our council oversees multiple technical clubs, organizes workshops, hackathons, and competitions,
                  and provides a platform for students to explore their technical interests. From robotics and AI
                  to web development and cybersecurity, we cover the entire spectrum of modern technology.
                </p>
                <p>
                  We foster a culture of learning, collaboration, and innovation, where ideas are nurtured and
                  transformed into reality. Our members have gone on to work at top tech companies, start their
                  own ventures, and pursue advanced research in cutting-edge fields.
                </p>
              </div>
            </div>
            <div className="relative flex justify-center items-center overflow-visible min-h-[600px] hidden lg:block order-2 lg:order-2">
              <TechCube3D />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Plan */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Mission */}
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold">Mission</h3>
              <p className="text-muted-foreground">
                To provide students a platform to learn and understand technologies that drive innovation. We enable skill development through hobby groups, clubs, workshops, and hackathons. Our initiatives equip students with knowledge for successful careers in academia and industry.
              </p>
            </div>

            {/* Vision */}
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold">Vision</h3>
              <p className="text-muted-foreground">
                To create an environment that nurtures future technology leaders who positively impact the world. We foster a culture of giving back through student-run courses and peer mentorship. Our goal is to develop leaders who drive meaningful change.
              </p>
            </div>

            {/* Plan */}
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold">Plan</h3>
              <p className="text-muted-foreground">
                Through four specialized clubs, Tinkerers&apos; Lab, and diverse hobby groups, we promote exploration across multiple technical domains. We host hackathons and invite industry experts to provide students with insights into their future career paths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Team</span>
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                Meet the dedicated leaders driving innovation and technical excellence at IIT Gandhinagar
              </p>
            </div>

            {/* Team Grid - Secretary on top, Coordinators below */}
            <div className="space-y-12">
              {/* Technical Secretary - Featured Position */}
              {secretary && (
                <div className="flex justify-center">
                  <div className="glass rounded-2xl p-4 sm:p-6 md:p-8 text-center transition-all duration-300 hover:scale-105 max-w-sm sm:max-w-md md:max-w-lg">
                    <div className="relative mb-4 sm:mb-6">
                      <TeamMemberImage
                        src={secretary.photoPath}
                        alt={secretary.name}
                        initials={secretary.initials}
                        gradientFrom={secretary.gradientFrom}
                        gradientTo={secretary.gradientTo}
                        width={300}
                        height={300}
                        className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] mx-auto"
                        isSecretary={true}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-2 font-space-grotesk">{secretary.name}</h3>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 sm:mb-4">{secretary.position}</p>
                    <div className="space-y-2 sm:space-y-3">
                      <a
                        href={`mailto:${secretary.email}`}
                        className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 bg-blue-50 dark:bg-blue-950/30 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 break-all max-w-full"
                      >
                        <span className="truncate">{secretary.email}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Coordinators Grid */}
              <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-7xl mx-auto justify-items-center">
                {coordinators.map((coordinator, index) => {
                  // Define color schemes for coordinators
                  const colorSchemes = [
                    { bg: "purple", text: "purple-600", hover: "purple-600" },
                    { bg: "green", text: "green-600", hover: "green-600" },
                    { bg: "emerald", text: "emerald-600", hover: "emerald-600" },
                    { bg: "indigo", text: "indigo-600", hover: "indigo-600" },
                    { bg: "orange", text: "orange-600", hover: "orange-600" }
                  ];
                  const colorScheme = colorSchemes[index % colorSchemes.length];

                  return (
                    <div key={coordinator.id} className="glass rounded-2xl p-3 lg:p-4 text-center transition-all duration-300 hover:scale-105 w-full max-w-[240px]">
                      <div className="relative mb-3 lg:mb-4">
                        <TeamMemberImage
                          src={coordinator.photoPath}
                          alt={coordinator.name}
                          initials={coordinator.initials}
                          gradientFrom={coordinator.gradientFrom}
                          gradientTo={coordinator.gradientTo}
                          width={200}
                          height={200}
                          className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] lg:w-[180px] lg:h-[180px] mx-auto"
                          isSecretary={false}
                        />
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${coordinator.gradientFrom}/30 ${coordinator.gradientTo}/30 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300`} />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-1 lg:mb-2 font-space-grotesk">{coordinator.name}</h3>
                      <p className={`text-xs lg:text-sm font-semibold text-${colorScheme.text} dark:text-${colorScheme.text.replace('600', '400')} mb-2 lg:mb-3`}>
                        {coordinator.position}
                      </p>
                      <div className="space-y-1 lg:space-y-2">
                        <a
                          href={`mailto:${coordinator.email}`}
                          className="inline-flex items-center text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-800/50 px-2 lg:px-3 py-1 lg:py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 break-all max-w-full"
                        >
                          <span className="truncate">{coordinator.email}</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Council Members Button */}
              <div className="flex justify-center mt-12">
                <a
                  href="/about/council-members"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <span className="mr-2">View All Council Members</span>
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Torque Magazine Highlight */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                Torque Magazine
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                Torque is the annual flagship magazine of the Technical Council, IITGN. It showcases
                the innovative projects, research work, and achievements of our students and faculty.
                The magazine serves as a platform to share knowledge, inspire creativity, and celebrate
                the spirit of innovation that defines our community.
              </p>
            </div>
            <div className="glass rounded-lg p-8 max-w-2xl">
              <h3 className="text-xl font-semibold mb-4">What You&apos;ll Find in Torque</h3>
              <div className="grid gap-4 sm:grid-cols-2 text-left">
                <div>
                  <h4 className="font-medium">Student Projects</h4>
                  <p className="text-sm text-muted-foreground">Innovative solutions and prototypes</p>
                </div>
                <div>
                  <h4 className="font-medium">Research Articles</h4>
                  <p className="text-sm text-muted-foreground">Cutting-edge research insights</p>
                </div>
                <div>
                  <h4 className="font-medium">Industry Insights</h4>
                  <p className="text-sm text-muted-foreground">Expert perspectives and trends</p>
                </div>
                <div>
                  <h4 className="font-medium">Success Stories</h4>
                  <p className="text-sm text-muted-foreground">Alumni achievements and journeys</p>
                </div>
              </div>
            </div>

            {/* Read Magazine Button */}
            <div className="flex justify-center">
              <Link href="/torque">
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white hover:text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span>Read Magazine</span>
                  <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Utility to sanitize Firebase Storage URLs (decode if double-encoded)

