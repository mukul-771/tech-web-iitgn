export interface Hackathon {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  date: string;
  registrationDeadline: string;
  location: string;
  duration: string;
  maxParticipants?: string;
  currentParticipants?: string;
  prizes: Prize[];
  organizers: Organizer[];
  registrationLink?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  category: string;
  requirements: string[];
  schedule: ScheduleItem[];
  sponsors: Sponsor[];
  winners?: Winner[];
  logoPath?: string;
  bannerPath?: string;
  gallery: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prize {
  position: string;
  amount: string;
  description?: string;
}

export interface Organizer {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface ScheduleItem {
  time: string;
  activity: string;
  description?: string;
  location?: string;
}

export interface Sponsor {
  name: string;
  logoPath?: string;
  website?: string;
  tier: "title" | "gold" | "silver" | "bronze" | "partner";
}

export interface Winner {
  position: string;
  teamName: string;
  members: string[];
  project: string;
  description?: string;
  prize: string;
}

// Basic hackathon interface for simple storage (matches current Blob structure)
export interface BasicHackathon {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  date: string;
  location: string;
  category: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  registrationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Convert BasicHackathon to full Hackathon with defaults
export function expandBasicHackathon(basic: BasicHackathon): Hackathon {
  return {
    id: basic.id,
    name: basic.name,
    description: basic.description,
    longDescription: basic.longDescription,
    date: basic.date,
    registrationDeadline: '',
    location: basic.location,
    duration: '',
    maxParticipants: '',
    currentParticipants: '',
    prizes: [],
    organizers: [],
    registrationLink: basic.registrationUrl,
    status: basic.status,
    category: basic.category,
    requirements: [],
    schedule: [],
    sponsors: [],
    winners: [],
    logoPath: '',
    bannerPath: '',
    gallery: [],
    createdAt: basic.createdAt,
    updatedAt: basic.updatedAt,
  };
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

// Prize positions
export const prizePositions = [
  "1st Place",
  "2nd Place", 
  "3rd Place",
  "Best Innovation",
  "Best Design",
  "Best Technical Implementation",
  "People's Choice",
  "Best Beginner Team",
  "Special Recognition",
  "Other"
];

// Organizer roles
export const organizerRoles = [
  "Event Coordinator",
  "Technical Lead",
  "Logistics Manager",
  "Marketing Lead",
  "Mentor Coordinator",
  "Registration Manager",
  "Volunteer Coordinator",
  "Sponsor Relations",
  "Other"
];

// Sponsor tiers
export const sponsorTiers = [
  { value: "title", label: "Title Sponsor" },
  { value: "gold", label: "Gold Sponsor" },
  { value: "silver", label: "Silver Sponsor" },
  { value: "bronze", label: "Bronze Sponsor" },
  { value: "partner", label: "Partner" }
];

// Default hackathons data
export const defaultHackathonsData: Record<string, Hackathon> = {
  "iitgnhacks-2024": {
    id: "iitgnhacks-2024",
    name: "IITGNHacks 2024",
    description: "48-hour hackathon bringing together brilliant minds to solve real-world problems using cutting-edge technology.",
    longDescription: "IITGNHacks 2024 is our flagship hackathon event that challenges participants to develop innovative solutions to real-world problems. Teams work around the clock to create applications, websites, and software solutions that could make a meaningful impact. The event fosters creativity, collaboration, and technical excellence among participants from various backgrounds.",
    date: "March 15-17, 2024",
    registrationDeadline: "March 10, 2024",
    location: "Computer Center, IIT Gandhinagar",
    duration: "48 hours",
    maxParticipants: "300",
    currentParticipants: "250",
    prizes: [
      { position: "1st Place", amount: "₹50,000", description: "Winner takes all" },
      { position: "2nd Place", amount: "₹30,000", description: "Runner-up prize" },
      { position: "3rd Place", amount: "₹20,000", description: "Third place prize" },
      { position: "Best Innovation", amount: "₹15,000", description: "Most innovative solution" }
    ],
    organizers: [
      { name: "Rahul Sharma", role: "Event Coordinator", email: "rahul.sharma@iitgn.ac.in", phone: "+91 9876543210" },
      { name: "Priya Patel", role: "Technical Lead", email: "priya.patel@iitgn.ac.in" },
      { name: "Amit Kumar", role: "Logistics Manager", email: "amit.kumar@iitgn.ac.in" }
    ],
    registrationLink: "https://forms.google.com/iitgnhacks2024",
    status: "upcoming",
    category: "Open Innovation",
    requirements: [
      "Team of 2-4 members",
      "At least one member should be a student",
      "Bring your own laptop",
      "Basic programming knowledge required"
    ],
    schedule: [
      { time: "09:00 AM", activity: "Registration & Check-in", location: "Main Lobby" },
      { time: "10:00 AM", activity: "Opening Ceremony", location: "Auditorium" },
      { time: "11:00 AM", activity: "Hacking Begins", location: "Computer Center" },
      { time: "01:00 PM", activity: "Lunch Break", location: "Cafeteria" },
      { time: "06:00 PM", activity: "Mentor Sessions", location: "Various Rooms" },
      { time: "08:00 PM", activity: "Dinner", location: "Cafeteria" }
    ],
    sponsors: [
      { name: "Google", tier: "title", website: "https://google.com" },
      { name: "Microsoft", tier: "gold", website: "https://microsoft.com" },
      { name: "GitHub", tier: "silver", website: "https://github.com" }
    ],
    winners: [],
    gallery: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  "smart-india-hackathon-2023": {
    id: "smart-india-hackathon-2023",
    name: "Smart India Hackathon 2023",
    description: "National level hackathon organized by Government of India to solve pressing problems faced by our country.",
    longDescription: "Smart India Hackathon is a nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives, and thus inculcate a culture of product innovation and a mindset of problem-solving.",
    date: "December 1-2, 2023",
    registrationDeadline: "November 15, 2023",
    location: "IIT Gandhinagar (Nodal Center)",
    duration: "36 hours",
    maxParticipants: "200",
    currentParticipants: "200",
    prizes: [
      { position: "1st Place", amount: "₹1,00,000", description: "Winner prize from Government of India" },
      { position: "2nd Place", amount: "₹75,000", description: "Runner-up prize" },
      { position: "3rd Place", amount: "₹50,000", description: "Third place prize" }
    ],
    organizers: [
      { name: "Dr. Anirban Guha", role: "Event Coordinator", email: "anirban@iitgn.ac.in" },
      { name: "Sneha Agarwal", role: "Student Coordinator", email: "sneha.agarwal@iitgn.ac.in" }
    ],
    registrationLink: "https://sih.gov.in",
    status: "completed",
    category: "Social Impact",
    requirements: [
      "Team of 6 members",
      "All members must be students",
      "Valid student ID required",
      "Problem statement selection mandatory"
    ],
    schedule: [
      { time: "09:00 AM", activity: "Registration", location: "Main Gate" },
      { time: "10:30 AM", activity: "Inauguration", location: "Auditorium" },
      { time: "12:00 PM", activity: "Hacking Begins", location: "Labs" },
      { time: "02:00 PM", activity: "Lunch", location: "Mess" }
    ],
    sponsors: [
      { name: "Government of India", tier: "title" },
      { name: "AICTE", tier: "partner" }
    ],
    winners: [
      {
        position: "1st Place",
        teamName: "Team InnovatorsGN",
        members: ["Arjun Patel", "Kavya Sharma", "Rohit Gupta", "Sneha Singh", "Vikram Kumar", "Ananya Reddy"],
        project: "AI-Powered Healthcare Assistant",
        description: "An AI-powered mobile application that helps rural healthcare workers diagnose common diseases",
        prize: "₹1,00,000"
      }
    ],
    gallery: ["/hackathons/sih-2023-1.jpg", "/hackathons/sih-2023-2.jpg"],
    createdAt: "2023-10-01T00:00:00Z",
    updatedAt: "2023-12-05T00:00:00Z"
  }
};
