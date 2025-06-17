"use client"

import { useEffect, useState } from "react"
import { BookOpen, Download, Eye, Calendar, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TorqueMagazine {
  id: string;
  year: string;
  title: string;
  description: string;
  pages: number;
  articles: number;
  featured: string;
  downloadUrl: string;
  viewUrl: string;
  coverPhoto?: string;
}

interface TorqueStats {
  totalYears: number;
  totalArticles: number;
  totalPages: number;
  totalDownloads: number;
}

const highlights = [
  {
    title: "Student Research",
    description: "Cutting-edge research projects by our students",
    icon: Users,
    count: "50+ Projects"
  },
  {
    title: "Faculty Insights",
    description: "Expert perspectives on emerging technologies",
    icon: Award,
    count: "15+ Articles"
  },
  {
    title: "Industry Trends",
    description: "Analysis of current and future tech trends",
    icon: BookOpen,
    count: "10+ Reports"
  }
]

export default function TorquePage() {
  const [magazines, setMagazines] = useState<TorqueMagazine[]>([])
  const [latestMagazine, setLatestMagazine] = useState<TorqueMagazine | null>(null)
  const [stats, setStats] = useState<TorqueStats>({
    totalYears: 0,
    totalArticles: 0,
    totalPages: 0,
    totalDownloads: 5000
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all magazines
        const magazinesResponse = await fetch('/api/torque')
        if (!magazinesResponse.ok) {
          throw new Error('Failed to fetch magazines')
        }
        const magazinesData = await magazinesResponse.json()
        setMagazines(magazinesData)

        // Fetch latest magazine
        const latestResponse = await fetch('/api/torque/latest')
        if (latestResponse.ok) {
          const latestData = await latestResponse.json()
          setLatestMagazine(latestData)
        }

        // Calculate stats
        const totalYears = magazinesData.length
        const totalArticles = magazinesData.reduce((sum: number, mag: TorqueMagazine) => sum + mag.articles, 0)
        const totalPages = magazinesData.reduce((sum: number, mag: TorqueMagazine) => sum + mag.pages, 0)

        setStats({
          totalYears,
          totalArticles,
          totalPages,
          totalDownloads: 5000
        })

      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load magazine data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading magazines...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Magazines</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-lg rotate-12 animate-float" />
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/10 rounded-full animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-500/10 rounded-lg -rotate-12 animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
              <BookOpen className="h-10 w-10 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-space-grotesk">
              Read <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Torque</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              The Annual Tech Council Magazine
            </p>
            <p className="mx-auto max-w-[600px] text-muted-foreground">
              Discover innovation, research, and technical excellence through our flagship publication
              that showcases the best of IIT Gandhinagar's technical community.
            </p>
          </div>
        </div>
      </section>

      {/* Magazine Stats */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.totalYears}</div>
              <div className="text-sm text-muted-foreground">Years Published</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalArticles}</div>
              <div className="text-sm text-muted-foreground">Total Articles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.totalPages}</div>
              <div className="text-sm text-muted-foreground">Total Pages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.totalDownloads}+</div>
              <div className="text-sm text-muted-foreground">Readers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Issue Highlight */}
      {latestMagazine && (
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="inline-block rounded-full bg-orange-100 dark:bg-orange-900 px-3 py-1 text-sm font-medium text-orange-600">
                    Latest Issue
                  </span>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                    Torque {latestMagazine.year}: {latestMagazine.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {latestMagazine.description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>{latestMagazine.pages} Pages</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>{latestMagazine.articles} Articles</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span>Published {latestMagazine.year}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span>Featured: {latestMagazine.featured}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild>
                    <a href={latestMagazine.viewUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="mr-2 h-4 w-4" />
                      Read Online
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={latestMagazine.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </a>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[3/4] rounded-lg shadow-2xl overflow-hidden relative">
                  {latestMagazine.coverPhoto ? (
                    <>
                      {/* Cover Photo Background */}
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${latestMagazine.coverPhoto})` }}
                      />
                      {/* Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-black/70" />
                      {/* Content */}
                      <div className="relative h-full p-8 text-white flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">TORQUE</h3>
                          <p className="text-white/90 drop-shadow-md">{latestMagazine.year} Edition</p>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold mb-2 drop-shadow-lg">{latestMagazine.title}</h4>
                          <p className="text-sm text-white/90 drop-shadow-md">
                            The Annual Magazine of Technical Council, IIT Gandhinagar
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Default Orange Background */
                    <div className="bg-gradient-to-br from-orange-600 to-red-600 p-8 text-white h-full">
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">TORQUE</h3>
                          <p className="text-orange-100">{latestMagazine.year} Edition</p>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold mb-2">{latestMagazine.title}</h4>
                          <p className="text-sm text-orange-100">
                            The Annual Magazine of Technical Council, IIT Gandhinagar
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Floating tech elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-lg rotate-12" />
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500/20 rounded-full" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Issues */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                All Issues
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Explore our complete collection of Torque magazines
              </p>
            </div>

            {magazines.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {magazines.map((issue) => (
                  <div key={issue.id} className="group border rounded-lg p-6 bg-background transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-block rounded-full bg-orange-100 dark:bg-orange-900 px-3 py-1 text-sm font-medium text-orange-600">
                          {issue.year}
                        </span>
                        <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 transition-colors" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-bold group-hover:text-orange-600 transition-colors">
                          {issue.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {issue.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span>{issue.pages} pages</span>
                        <span>{issue.articles} articles</span>
                        <span className="col-span-2">Featured: {issue.featured}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <a href={issue.viewUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <a href={issue.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-1 h-3 w-3" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No magazines available</h3>
                <p className="text-muted-foreground">
                  Check back later for new issues of Torque magazine.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                What's Inside Torque
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Discover the diverse content that makes Torque a must-read publication
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {highlights.map((highlight, index) => {
                const Icon = highlight.icon
                return (
                  <div key={index} className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                      <Icon className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{highlight.title}</h3>
                      <p className="text-muted-foreground">{highlight.description}</p>
                      <p className="text-sm font-medium text-orange-600">{highlight.count}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
