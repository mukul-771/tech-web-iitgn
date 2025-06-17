"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in")
          }
        })
      },
      { threshold: 0.1 }
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg opacity-10" />

      {/* Animated background elements - responsive sizing */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="container relative z-10 mobile-padding" ref={heroRef}>
        <div className="flex flex-col items-center space-y-6 sm:space-y-8 text-center">
          {/* Main heading */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="responsive-text-3xl font-bold tracking-tighter font-space-grotesk leading-tight">
              Welcome to the Official
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                Tech Council Page
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] responsive-text-base text-gray-600 dark:text-gray-400 leading-relaxed px-4 sm:px-0">
              Explore Our Clubs, Read Our Magazine, Join the Innovation
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 w-full sm:w-auto">
            <Button asChild size="lg" className="group touch-target w-full sm:w-auto">
              <Link href="/clubs">
                <Users className="mr-2 h-4 w-4" />
                Explore Clubs
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="group touch-target w-full sm:w-auto">
              <Link href="/torque">
                <BookOpen className="mr-2 h-4 w-4" />
                Read Torque Magazine
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>


        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
