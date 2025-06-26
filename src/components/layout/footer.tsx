"use client";

import { Mail, MapPin, ChevronDown, ChevronUp, Phone } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo"

interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  socialMedia: {
    instagram: string;
    youtube: string;
    linkedin: string;
    facebook: string;
  };
}

export function Footer() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info');
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };

    fetchContactInfo();
  }, []);
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mobile-padding">
        {/* Mobile-First Design: Social Media Bar at Top */}
        <div className="py-4 md:hidden">
          <div className="flex items-center justify-center space-x-4 mx-auto max-w-fit">
            <a
              href={contactInfo?.socialMedia.instagram || "https://www.instagram.com/tech_iitgn?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-110 transition-transform duration-200 touch-target"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <a
              href={contactInfo?.socialMedia.youtube || "https://www.youtube.com/@tech_iitgn"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-red-600 text-white hover:scale-110 transition-transform duration-200 touch-target"
              aria-label="YouTube"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            <a
              href={contactInfo?.socialMedia.linkedin || "https://www.linkedin.com/school/tech-council-iitgn/"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-blue-600 text-white hover:scale-110 transition-transform duration-200 touch-target"
              aria-label="LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>

            <a
              href={contactInfo?.socialMedia.facebook || "https://www.facebook.com/tech.iitgn"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-blue-500 text-white hover:scale-110 transition-transform duration-200 touch-target"
              aria-label="Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile Contact Info - Always Visible */}
        <div className="py-3 border-t border-gray-200 dark:border-gray-800 md:hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <ThemeAwareLogo
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
              <span className="font-bold font-space-grotesk text-base">Technical Council</span>
            </div>

            <div className="flex flex-col space-y-2 text-center">
              <a
                href={`mailto:${contactInfo?.email || 'technical.secretary@iitgn.ac.in'}`}
                className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline touch-target py-1"
              >
                <Mail className="h-4 w-4" />
                <span className="truncate max-w-[250px]">{contactInfo?.email || 'technical.secretary@iitgn.ac.in'}</span>
              </a>

              {contactInfo?.phone && (
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400 hover:underline touch-target py-1"
                >
                  <Phone className="h-4 w-4" />
                  <span>{contactInfo.phone}</span>
                </a>
              )}

              <div className="flex items-center justify-center space-x-1 text-xs text-gray-500 dark:text-gray-500 mt-2">
                <MapPin className="h-3 w-3" />
                <span className="text-center leading-tight">
                  {contactInfo ? (
                    `${contactInfo.address.city}, ${contactInfo.address.state}`
                  ) : (
                    'Gandhinagar, Gujarat'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Collapsible Sections */}
        <div className="md:hidden">
          {/* Quick Links Section */}
          <div className="mobile-footer-section">
            <button
              onClick={() => toggleSection('links')}
              className="mobile-footer-toggle"
              aria-expanded={expandedSection === 'links'}
            >
              <span className="font-semibold text-blue-600 dark:text-blue-400">Quick Links</span>
              {expandedSection === 'links' ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedSection === 'links' && (
              <div className="mobile-footer-content grid grid-cols-2 gap-x-4 gap-y-1">
                <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 touch-target">
                  Home
                </Link>
                <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 touch-target">
                  About Us
                </Link>
                <Link href="/clubs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 touch-target">
                  Clubs & Groups
                </Link>
                <Link href="/hackathons" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 touch-target">
                  Hackathons
                </Link>
                <Link href="/achievements" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 touch-target">
                  Achievements
                </Link>
                <Link href="/torque" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 touch-target">
                  Torque Magazine
                </Link>
              </div>
            )}
          </div>

          {/* Resources Section */}
          <div className="mobile-footer-section">
            <button
              onClick={() => toggleSection('resources')}
              className="mobile-footer-toggle"
              aria-expanded={expandedSection === 'resources'}
            >
              <span className="font-semibold text-purple-600 dark:text-purple-400">Resources</span>
              {expandedSection === 'resources' ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedSection === 'resources' && (
              <div className="mobile-footer-content grid grid-cols-2 gap-x-4 gap-y-1">
                <Link href="/internships" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2 touch-target">
                  Internships
                </Link>
                <a href="https://iitgn.ac.in" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2 touch-target">
                  IIT Gandhinagar
                </a>
                <a href="https://iitgn.ac.in/academics" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2 touch-target">
                  Academics
                </a>
                <a href="https://iitgn.ac.in/student/lifeoncampus/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2 touch-target">
                  Student Life
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout - Hidden on Mobile */}
        <div className="hidden md:block section-padding">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Technical Council */}
          <div className="space-y-3 sm:space-y-4 text-center md:text-left">
            <div className="flex items-center space-x-2 justify-center md:justify-start">
              <ThemeAwareLogo
                width={64}
                height={64}
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"
              />
              <span className="font-bold font-space-grotesk responsive-text-lg">Technical Council</span>
            </div>
            <p className="responsive-text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              &ldquo;To create a culture where technology is the solution of every problem.&rdquo;
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-space-grotesk text-blue-600">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/clubs"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Clubs & Groups
              </Link>
              <Link
                href="/hackathons"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Hackathons
              </Link>
              <Link
                href="/achievements"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Achievements
              </Link>
              <Link
                href="/torque"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Torque Magazine
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-space-grotesk text-purple-600">Resources</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/internships"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Internships
              </Link>
              <a
                href="https://iitgn.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                IIT Gandhinagar
              </a>
              <a
                href="https://iitgn.ac.in/academics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Academics
              </a>
              <a
                href="https://iitgn.ac.in/student/lifeoncampus/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Student Life
              </a>
              <a
                href="https://iitgn.ac.in/research"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Research
              </a>
            </nav>
          </div>

          {/* Social & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-space-grotesk text-green-600">Connect With Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">
                  {contactInfo ? (
                    <>
                      {contactInfo.address.street}<br />
                      {contactInfo.address.city}, {contactInfo.address.state} - {contactInfo.address.postalCode}
                    </>
                  ) : (
                    <>
                      323, Acad Block 4, IIT Gandhinagar<br />
                      Palaj, Gandhinagar, Gujarat - 382355
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>{contactInfo?.email || 'technical.secretary@iitgn.ac.in'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={contactInfo?.socialMedia.instagram || "https://www.instagram.com/tech_iitgn?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-110 transition-transform duration-200"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href={contactInfo?.socialMedia.youtube || "https://www.youtube.com/@tech_iitgn"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-red-600 text-white hover:scale-110 transition-transform duration-200"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <a
                href={contactInfo?.socialMedia.linkedin || "https://www.linkedin.com/school/tech-council-iitgn/"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-blue-600 text-white hover:scale-110 transition-transform duration-200"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              <a
                href={contactInfo?.socialMedia.facebook || "https://www.facebook.com/tech.iitgn"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-blue-500 text-white hover:scale-110 transition-transform duration-200"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
            <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Technical Council, IIT Gandhinagar. All rights reserved.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Built with ❤️ by Tech Council
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Copyright - Compact */}
        <div className="py-4 border-t border-gray-200 dark:border-gray-800 text-center md:hidden">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Technical Council, IIT Gandhinagar
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Built with ❤️ by Tech Council
          </p>
        </div>
      </div>
    </footer>
  )
}
