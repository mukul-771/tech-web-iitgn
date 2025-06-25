export interface Hackathon {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  category: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  registrationLink?: string;
  
  // Organizer details
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  organizerWebsite?: string;
  
  // Requirements and eligibility
  requirements?: string;
  eligibility?: string;
  teamSize?: string;
  
  // Prize pool
  firstPrize?: string;
  secondPrize?: string;
  thirdPrize?: string;
  specialPrizes?: string;
  
  // Timeline and important details
  timeline?: string;
  importantNotes?: string;
  
  // Additional details
  themes?: string;
  judingCriteria?: string;
  submissionGuidelines?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Basic hackathon interface for simple storage (matches current Blob structure)
export type BasicHackathon = Hackathon;

// Convert BasicHackathon to full Hackathon (no-op now)
export function expandBasicHackathon(basic: BasicHackathon): Hackathon {
  return { ...basic };
}

// Hackathon categories
export const hackathonCategories = [
  "Web Development",
  "Mobile App Development",
  "AI/ML",
  "Blockchain",
  "IoT",
  "Cybersecurity",
  "Game Development",
  "Data Science",
  "Open Innovation",
  "Social Impact",
  "Fintech",
  "Healthcare",
  "Education",
  "Sustainability",
  "Other"
];

// Hackathon statuses
export const hackathonStatuses = [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled"
];

// Default hackathons data (minimal)
export const defaultHackathonsData: Record<string, Hackathon> = {
  "iitgnhacks-2024": {
    id: "iitgnhacks-2024",
    name: "IITGNHacks 2024",
    description: "48-hour hackathon bringing together brilliant minds to solve real-world problems using cutting-edge technology.",
    longDescription: "IITGNHacks 2024 is our flagship hackathon event that challenges participants to develop innovative solutions to real-world problems. Teams work around the clock to create applications, websites, and software solutions that could make a meaningful impact. The event fosters creativity, collaboration, and technical excellence among participants from various backgrounds.",
    date: "2024-03-15",
    location: "Computer Center, IIT Gandhinagar",
    category: "Open Innovation",
    status: "upcoming",
    registrationLink: "https://forms.google.com/iitgnhacks2024",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  "smart-india-hackathon-2023": {
    id: "smart-india-hackathon-2023",
    name: "Smart India Hackathon 2023",
    description: "National level hackathon organized by Government of India to solve pressing problems faced by our country.",
    longDescription: "Smart India Hackathon is a nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives, and thus inculcate a culture of product innovation and a mindset of problem-solving.",
    date: "2023-12-01",
    location: "IIT Gandhinagar (Nodal Center)",
    category: "Social Impact",
    status: "completed",
    registrationLink: "https://sih.gov.in",
    createdAt: "2023-10-01T00:00:00Z",
    updatedAt: "2023-12-05T00:00:00Z"
  }
};
