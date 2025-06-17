export interface InterIITAchievement {
  id: string;
  achievementType: "gold-medal" | "silver-medal" | "bronze-medal" | "ranking" | "special-award" | "recognition";
  competitionName: string; // e.g., "Programming Contest", "Robotics Challenge"
  interIITEdition: string; // e.g., "Inter-IIT Tech Meet 12.0"
  year: string;
  hostIIT: string;
  location: string;
  ranking?: number; // For non-medal achievements (1st, 2nd, 3rd place, etc.)
  teamMembers: TeamMember[]; // With roles: Team Lead, Member, Coach, Substitute
  achievementDescription: string;
  significance: string; // Why this achievement is important
  competitionCategory: string; // Programming, Robotics, AI/ML, etc.
  supportingDocuments: Document[];
  achievementDate: string;
  points?: number; // Points earned for overall ranking
  status: "verified" | "pending-verification" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  role: "Team Lead" | "Member" | "Coach" | "Substitute";
  email: string;
  phone?: string;
  achievements?: string[]; // Array of achievement descriptions
}

export interface Document {
  name: string;
  type: "certificate" | "photo" | "report" | "rulebook" | "other";
  filePath: string;
  uploadDate: string;
  description?: string;
}

// Achievement types
export const achievementTypes = [
  { value: "gold-medal", label: "Gold Medal", color: "text-yellow-600" },
  { value: "silver-medal", label: "Silver Medal", color: "text-gray-600" },
  { value: "bronze-medal", label: "Bronze Medal", color: "text-orange-600" },
  { value: "ranking", label: "Ranking Achievement", color: "text-blue-600" },
  { value: "special-award", label: "Special Award", color: "text-purple-600" },
  { value: "recognition", label: "Recognition", color: "text-green-600" }
];

// Competition categories
export const competitionCategories = [
  "Programming",
  "Robotics",
  "AI/ML",
  "Data Science",
  "Cybersecurity",
  "Web Development",
  "App Development",
  "Hardware Design",
  "Innovation Challenge",
  "Case Study",
  "Design Competition",
  "Research Presentation",
  "Technical Quiz",
  "Debate",
  "Other"
];

// Team member roles
export const teamMemberRoles = [
  "Team Lead",
  "Member",
  "Coach",
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

// Achievement status options
export const achievementStatuses = [
  { value: "verified", label: "Verified", color: "text-green-600" },
  { value: "pending-verification", label: "Pending Verification", color: "text-yellow-600" },
  { value: "archived", label: "Archived", color: "text-gray-600" }
];

// Default achievements data (migrated from Inter-IIT events)
export const defaultAchievementsData: Record<string, InterIITAchievement> = {
  "robotics-bronze-2023": {
    id: "robotics-bronze-2023",
    achievementType: "bronze-medal",
    competitionName: "Autonomous Robotics Challenge",
    interIITEdition: "Inter-IIT Tech Meet 12.0",
    year: "2023",
    hostIIT: "IIT Madras",
    location: "Chennai, Tamil Nadu",
    ranking: 3,
    teamMembers: [
      {
        name: "Sneha Agarwal",
        rollNumber: "21110178",
        branch: "Mechanical Engineering",
        year: "3rd Year",
        role: "Team Lead",
        email: "sneha.agarwal@iitgn.ac.in",
        achievements: ["Team Lead for Bronze Medal in Robotics"]
      },
      {
        name: "Vikram Singh",
        rollNumber: "21110203",
        branch: "Electrical Engineering",
        year: "3rd Year",
        role: "Member",
        email: "vikram.singh@iitgn.ac.in",
        achievements: ["Bronze Medal in Robotics Challenge"]
      },
      {
        name: "Priya Sharma",
        rollNumber: "21110134",
        branch: "Computer Science and Engineering",
        year: "3rd Year",
        role: "Member",
        email: "priya.sharma@iitgn.ac.in",
        achievements: ["Bronze Medal in Robotics Challenge"]
      },
      {
        name: "Amit Kumar",
        rollNumber: "21110023",
        branch: "Mechanical Engineering",
        year: "2nd Year",
        role: "Member",
        email: "amit.kumar@iitgn.ac.in",
        achievements: ["Bronze Medal in Robotics Challenge"]
      }
    ],
    achievementDescription: "Secured 3rd position in the Autonomous Robotics Challenge with excellent navigation and task completion capabilities.",
    significance: "This achievement demonstrates IIT Gandhinagar's strong capabilities in robotics and autonomous systems, showcasing our students' technical excellence in a highly competitive environment.",
    competitionCategory: "Robotics",
    supportingDocuments: [
      {
        name: "Bronze Medal Certificate",
        type: "certificate",
        filePath: "/documents/robotics-bronze-2023.pdf",
        uploadDate: "2023-12-17",
        description: "Official certificate for bronze medal in robotics challenge"
      },
      {
        name: "Team Photo",
        type: "photo",
        filePath: "/images/robotics-team-2023.jpg",
        uploadDate: "2023-12-17",
        description: "Team photo with the bronze medal"
      }
    ],
    achievementDate: "2023-12-17",
    points: 95,
    status: "verified",
    createdAt: "2023-12-17T00:00:00Z",
    updatedAt: "2023-12-17T00:00:00Z"
  },
  "innovation-silver-2023": {
    id: "innovation-silver-2023",
    achievementType: "silver-medal",
    competitionName: "Innovation Challenge",
    interIITEdition: "Inter-IIT Tech Meet 12.0",
    year: "2023",
    hostIIT: "IIT Madras",
    location: "Chennai, Tamil Nadu",
    ranking: 2,
    teamMembers: [
      {
        name: "Kavya Reddy",
        rollNumber: "21110087",
        branch: "Computer Science and Engineering",
        year: "3rd Year",
        role: "Team Lead",
        email: "kavya.reddy@iitgn.ac.in",
        achievements: ["Team Lead for Silver Medal in Innovation Challenge"]
      },
      {
        name: "Rohit Sharma",
        rollNumber: "21110155",
        branch: "Electrical Engineering",
        year: "3rd Year",
        role: "Member",
        email: "rohit.sharma@iitgn.ac.in",
        achievements: ["Silver Medal in Innovation Challenge"]
      }
    ],
    achievementDescription: "Secured 2nd position in the Innovation Challenge with an innovative IoT solution for smart campus management.",
    significance: "This silver medal highlights IIT Gandhinagar's innovation capabilities and our students' ability to develop practical solutions for real-world problems using cutting-edge technology.",
    competitionCategory: "Innovation Challenge",
    supportingDocuments: [
      {
        name: "Silver Medal Certificate",
        type: "certificate",
        filePath: "/documents/innovation-silver-2023.pdf",
        uploadDate: "2023-12-18",
        description: "Official certificate for silver medal in innovation challenge"
      },
      {
        name: "Project Report",
        type: "report",
        filePath: "/documents/iot-solution-report-2023.pdf",
        uploadDate: "2023-12-18",
        description: "Detailed project report of the IoT solution"
      }
    ],
    achievementDate: "2023-12-18",
    points: 98,
    status: "verified",
    createdAt: "2023-12-18T00:00:00Z",
    updatedAt: "2023-12-18T00:00:00Z"
  },
  "programming-ranking-2023": {
    id: "programming-ranking-2023",
    achievementType: "ranking",
    competitionName: "Programming Contest",
    interIITEdition: "Inter-IIT Tech Meet 12.0",
    year: "2023",
    hostIIT: "IIT Madras",
    location: "Chennai, Tamil Nadu",
    ranking: 5,
    teamMembers: [
      {
        name: "Arjun Patel",
        rollNumber: "21110045",
        branch: "Computer Science and Engineering",
        year: "3rd Year",
        role: "Team Lead",
        email: "arjun.patel@iitgn.ac.in",
        achievements: ["Team Lead for Programming Contest"]
      },
      {
        name: "Kavya Sharma",
        rollNumber: "21110089",
        branch: "Computer Science and Engineering",
        year: "3rd Year",
        role: "Member",
        email: "kavya.sharma@iitgn.ac.in",
        achievements: ["Top 5 finish in Programming Contest"]
      },
      {
        name: "Rohit Gupta",
        rollNumber: "21110156",
        branch: "Mathematics and Computing",
        year: "3rd Year",
        role: "Member",
        email: "rohit.gupta@iitgn.ac.in",
        achievements: ["Top 5 finish in Programming Contest"]
      }
    ],
    achievementDescription: "Achieved 5th position in the highly competitive Programming Contest, demonstrating strong algorithmic and problem-solving skills.",
    significance: "This achievement showcases the programming excellence of IIT Gandhinagar students and their ability to compete at the highest level in algorithmic challenges.",
    competitionCategory: "Programming",
    supportingDocuments: [
      {
        name: "Participation Certificate",
        type: "certificate",
        filePath: "/documents/programming-contest-2023.pdf",
        uploadDate: "2023-12-16",
        description: "Certificate for participation and ranking in programming contest"
      }
    ],
    achievementDate: "2023-12-16",
    points: 85,
    status: "verified",
    createdAt: "2023-12-16T00:00:00Z",
    updatedAt: "2023-12-16T00:00:00Z"
  }
};
