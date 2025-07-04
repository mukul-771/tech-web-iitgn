"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TeamMember } from "@/lib/team-data";
import { TeamMemberImage } from "@/components/ui/team-member-image";

export default function CouncilMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team');
        if (response.ok) {
          const members = await response.json();
          // Filter to show only general members, design team, and social media team
          const councilMembers = members.filter((member: TeamMember) =>
            member.category === 'general' ||
            member.category === 'design' ||
            member.category === 'social'
          );
          setTeamMembers(councilMembers);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const categories = [
    { id: "general", name: "General Council Members", color: "blue" },
    { id: "design", name: "Design Team", color: "pink" },
    { id: "social", name: "Social Media Team", color: "purple" }
  ];



  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading team members...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 font-space-grotesk">
              Council Members
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Meet the dedicated team members who drive innovation and excellence at IITGN Tech Council
            </p>
          </motion.div>

          {/* Categories */}
          {categories.map((category, categoryIndex) => {
            const categoryMembers = teamMembers.filter(member => member.category === category.id);

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white font-space-grotesk">
                  {category.name}
                </h2>

                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 max-w-7xl mx-auto justify-items-center">
                  {categoryMembers.map((member, index) => (
                    <motion.div
                      key={member.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-[280px]"
                    >
                      <div className="relative mb-6">
                        <TeamMemberImage
                          src={member.photoPath}
                          alt={member.name}
                          initials={member.initials}
                          gradientFrom={member.gradientFrom}
                          gradientTo={member.gradientTo}
                          width={200}
                          height={200}
                          className="w-[200px] h-[200px] mx-auto"
                        />
                      </div>
                      <h3 className="font-bold text-lg mb-2 font-space-grotesk text-gray-800 dark:text-white">{member.name}</h3>
                      <p className="text-sm font-semibold mb-4 text-gray-600 dark:text-gray-300">
                        {member.position}
                      </p>
                      <div className="space-y-2">
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 break-all max-w-full"
                        >
                          <span className="truncate">{member.email}</span>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
