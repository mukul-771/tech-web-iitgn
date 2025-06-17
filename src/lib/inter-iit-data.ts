export interface InterIITEvent {
  id: string;
  name: string;
  year: string;
  description: string;
  longDescription: string;
  location: string;
  hostIIT: string;
  startDate: string;
  endDate: string;
  participatingIITs: string[];
  events: CompetitionEvent[];
  overallResults: OverallResult[];
  teamRoster: TeamMember[];
  achievements: Achievement[];
  highlights: string[];
  gallery: string[];
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionEvent {
  id: string;
  name: string;
  category: string;
  description: string;
  date: string;
  venue: string;
  teamSize: number;
  participants: Participant[];
  result?: EventResult;
  rules?: string[];
  equipment?: string[];
}

export interface Participant {
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  role: string; // "Team Lead", "Member", "Substitute"
  email: string;
  phone?: string;
}

export interface EventResult {
  position: number;
  points: number;
  medal?: "gold" | "silver" | "bronze";
  description?: string;
  certificate?: string;
}

export interface OverallResult {
  iit: string;
  totalPoints: number;
  position: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
}

export interface TeamMember {
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  role: string; // "Captain", "Vice-Captain", "Team Member", "Coach", "Manager"
  email: string;
  phone?: string;
  events: string[]; // Array of event IDs they participate in
  achievements?: string[];
}

export interface Achievement {
  event: string;
  position: number;
  medal?: "gold" | "silver" | "bronze";
  points: number;
  participants: string[]; // Array of participant names
  description?: string;
  date: string;
}

export interface Document {
  name: string;
  type: "rulebook" | "schedule" | "results" | "certificate" | "report" | "other";
  filePath: string;
  uploadDate: string;
  description?: string;
}

// Competition categories
export const competitionCategories = [
  "Programming",
  "Robotics",
  "Electronics",
  "Mechanical",
  "Civil",
  "Chemical",
  "Aerospace",
  "Data Science",
  "AI/ML",
  "Cybersecurity",
  "Design",
  "Innovation",
  "Research",
  "Management",
  "Other"
];

// Team roles
export const teamRoles = [
  "Captain",
  "Vice-Captain", 
  "Team Member",
  "Coach",
  "Manager",
  "Technical Lead",
  "Substitute"
];

// Participant roles
export const participantRoles = [
  "Team Lead",
  "Member",
  "Substitute"
];

// Academic branches
export const academicBranches = [
  "Computer Science and Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Materials Science and Engineering",
  "Bioengineering",
  "Mathematics and Computing",
  "Physics",
  "Chemistry",
  "Other"
];

// Academic years
export const academicYears = [
  "1st Year",
  "2nd Year", 
  "3rd Year",
  "4th Year",
  "5th Year",
  "PhD",
  "Other"
];

// IIT list
export const iitList = [
  "IIT Bombay",
  "IIT Delhi", 
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Madras",
  "IIT Roorkee",
  "IIT Guwahati",
  "IIT Gandhinagar",
  "IIT Hyderabad",
  "IIT Indore",
  "IIT Mandi",
  "IIT Patna",
  "IIT Ropar",
  "IIT Bhubaneswar",
  "IIT Jodhpur",
  "IIT Varanasi (BHU)",
  "IIT Palakkad",
  "IIT Tirupati",
  "IIT Dhanbad",
  "IIT Bhilai",
  "IIT Goa",
  "IIT Jammu",
  "IIT Dharwad"
];

// Default Inter-IIT data
export const defaultInterIITData: Record<string, InterIITEvent> = {
  "inter-iit-tech-meet-12": {
    id: "inter-iit-tech-meet-12",
    name: "Inter-IIT Tech Meet 12.0",
    year: "2023",
    description: "The 12th edition of Inter-IIT Tech Meet hosted by IIT Madras, featuring cutting-edge technology competitions.",
    longDescription: "Inter-IIT Tech Meet 12.0 was a spectacular showcase of technical excellence, bringing together the brightest minds from all IITs. The event featured competitions in various domains including programming, robotics, data science, and innovation challenges. IIT Gandhinagar participated with great enthusiasm and achieved remarkable results.",
    location: "Chennai, Tamil Nadu",
    hostIIT: "IIT Madras",
    startDate: "2023-12-15",
    endDate: "2023-12-18",
    participatingIITs: [
      "IIT Bombay", "IIT Delhi", "IIT Kanpur", "IIT Kharagpur", "IIT Madras",
      "IIT Roorkee", "IIT Guwahati", "IIT Gandhinagar", "IIT Hyderabad", "IIT Indore",
      "IIT Mandi", "IIT Patna", "IIT Ropar", "IIT Bhubaneswar", "IIT Jodhpur",
      "IIT Varanasi (BHU)", "IIT Palakkad", "IIT Tirupati", "IIT Dhanbad"
    ],
    events: [
      {
        id: "programming-contest",
        name: "Programming Contest",
        category: "Programming",
        description: "Competitive programming contest testing algorithmic and problem-solving skills",
        date: "2023-12-16",
        venue: "Computer Science Department",
        teamSize: 3,
        participants: [
          {
            name: "Arjun Patel",
            rollNumber: "21110045",
            branch: "Computer Science and Engineering",
            year: "3rd Year",
            role: "Team Lead",
            email: "arjun.patel@iitgn.ac.in"
          },
          {
            name: "Kavya Sharma", 
            rollNumber: "21110089",
            branch: "Computer Science and Engineering",
            year: "3rd Year",
            role: "Member",
            email: "kavya.sharma@iitgn.ac.in"
          },
          {
            name: "Rohit Gupta",
            rollNumber: "21110156",
            branch: "Mathematics and Computing", 
            year: "3rd Year",
            role: "Member",
            email: "rohit.gupta@iitgn.ac.in"
          }
        ],
        result: {
          position: 5,
          points: 85,
          description: "Strong performance in algorithmic challenges"
        }
      },
      {
        id: "robotics-challenge",
        name: "Autonomous Robotics Challenge",
        category: "Robotics",
        description: "Design and build autonomous robots for navigation and task completion",
        date: "2023-12-17",
        venue: "Robotics Lab",
        teamSize: 4,
        participants: [
          {
            name: "Sneha Agarwal",
            rollNumber: "21110178",
            branch: "Mechanical Engineering",
            year: "3rd Year", 
            role: "Team Lead",
            email: "sneha.agarwal@iitgn.ac.in"
          },
          {
            name: "Vikram Singh",
            rollNumber: "21110203",
            branch: "Electrical Engineering",
            year: "3rd Year",
            role: "Member",
            email: "vikram.singh@iitgn.ac.in"
          },
          {
            name: "Priya Sharma",
            rollNumber: "21110134",
            branch: "Computer Science and Engineering",
            year: "3rd Year",
            role: "Member", 
            email: "priya.sharma@iitgn.ac.in"
          },
          {
            name: "Amit Kumar",
            rollNumber: "21110023",
            branch: "Mechanical Engineering",
            year: "2nd Year",
            role: "Member",
            email: "amit.kumar@iitgn.ac.in"
          }
        ],
        result: {
          position: 3,
          points: 95,
          medal: "bronze",
          description: "Excellent autonomous navigation and task completion"
        }
      }
    ],
    overallResults: [
      { iit: "IIT Bombay", totalPoints: 450, position: 1, goldMedals: 5, silverMedals: 3, bronzeMedals: 2 },
      { iit: "IIT Delhi", totalPoints: 420, position: 2, goldMedals: 4, silverMedals: 4, bronzeMedals: 2 },
      { iit: "IIT Kanpur", totalPoints: 380, position: 3, goldMedals: 3, silverMedals: 5, bronzeMedals: 2 },
      { iit: "IIT Gandhinagar", totalPoints: 285, position: 8, goldMedals: 1, silverMedals: 2, bronzeMedals: 4 }
    ],
    teamRoster: [
      {
        name: "Chandrabhan Patel",
        rollNumber: "20110034",
        branch: "Computer Science and Engineering",
        year: "4th Year",
        role: "Captain",
        email: "chandrabhan.patel@iitgn.ac.in",
        events: ["programming-contest", "data-science-challenge"],
        achievements: ["Team Captain", "Programming Contest Participant"]
      },
      {
        name: "Arjun Patel", 
        rollNumber: "21110045",
        branch: "Computer Science and Engineering",
        year: "3rd Year",
        role: "Vice-Captain",
        email: "arjun.patel@iitgn.ac.in",
        events: ["programming-contest"],
        achievements: ["Programming Contest Team Lead"]
      }
    ],
    achievements: [
      {
        event: "Autonomous Robotics Challenge",
        position: 3,
        medal: "bronze",
        points: 95,
        participants: ["Sneha Agarwal", "Vikram Singh", "Priya Sharma", "Amit Kumar"],
        description: "Bronze medal in autonomous robotics with excellent navigation",
        date: "2023-12-17"
      },
      {
        event: "Innovation Challenge",
        position: 2,
        medal: "silver", 
        points: 98,
        participants: ["Kavya Reddy", "Rohit Sharma"],
        description: "Silver medal for innovative IoT solution",
        date: "2023-12-18"
      }
    ],
    highlights: [
      "Bronze medal in Autonomous Robotics Challenge",
      "Silver medal in Innovation Challenge", 
      "Top 5 finish in Programming Contest",
      "Strong team performance across multiple events",
      "Excellent representation of IIT Gandhinagar"
    ],
    gallery: [
      "/inter-iit/2023/team-photo.jpg",
      "/inter-iit/2023/robotics-challenge.jpg",
      "/inter-iit/2023/programming-contest.jpg",
      "/inter-iit/2023/awards-ceremony.jpg"
    ],
    documents: [
      {
        name: "Inter-IIT Tech Meet 12.0 Rulebook",
        type: "rulebook",
        filePath: "/documents/inter-iit-2023-rulebook.pdf",
        uploadDate: "2023-11-01",
        description: "Official rulebook for all competitions"
      },
      {
        name: "Final Results",
        type: "results", 
        filePath: "/documents/inter-iit-2023-results.pdf",
        uploadDate: "2023-12-20",
        description: "Complete results of all events"
      }
    ],
    createdAt: "2023-10-01T00:00:00Z",
    updatedAt: "2023-12-20T00:00:00Z"
  }
};
