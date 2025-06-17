export interface Club {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  type: "club" | "hobby-group" | "technical-council-group";
  category: string;
  members?: string;
  established?: string;
  email: string;
  achievements: string[];
  projects: string[];
  team: TeamMember[];
  logoPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  name: string;
  role: string;
  email: string;
}

// Default clubs data
export const defaultClubsData: Record<string, Club> = {
  "metis": {
    id: "metis",
    name: "Metis, Development Club",
    description: "Focuses on software development and coding, where members work on real-world projects, contribute to open-source, and hone their programming skills.",
    longDescription: "Metis, the Development Club, is dedicated to fostering software development skills among students. We focus on real-world project development, open-source contributions, and modern programming practices. Our members work with various technologies including web development, mobile apps, and system programming to create innovative solutions.",
    type: "club",
    category: "Software Development",
    members: "60+",
    established: "2018",
    email: "metis@iitgn.ac.in",
    achievements: [
      "Contributed to 50+ open-source projects",
      "Developed campus management applications",
      "Winner - National Coding Competition 2023",
      "Published multiple software libraries"
    ],
    projects: [
      "Campus Event Management System",
      "Student Collaboration Platform",
      "Open Source Library Development",
      "Mobile App for Campus Services"
    ],
    team: [
      { name: "Aryan Sharma", role: "Club President", email: "aryan@iitgn.ac.in" },
      { name: "Priya Singh", role: "Technical Lead", email: "priya.singh@iitgn.ac.in" },
      { name: "Rohit Gupta", role: "Open Source Coordinator", email: "rohit.gupta@iitgn.ac.in" },
      { name: "Sneha Patel", role: "Project Manager", email: "sneha.patel@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "digis": {
    id: "digis",
    name: "Digis, Digital Sports Club",
    description: "Combines technology with gaming, offering a platform for students interested in game development, e-sports, and the study of digital sports ecosystems.",
    longDescription: "Digis, the Digital Sports Club, bridges the gap between technology and gaming. We focus on game development, e-sports competitions, and understanding digital sports ecosystems. Our members explore game design, competitive gaming strategies, and the technological aspects of modern sports.",
    type: "club",
    category: "Gaming & Sports Technology",
    members: "45+",
    established: "2019",
    email: "digis@iitgn.ac.in",
    achievements: [
      "Organized inter-college e-sports tournaments",
      "Developed mobile gaming applications",
      "Winner - National Game Development Contest",
      "Partnership with gaming industry leaders"
    ],
    projects: [
      "Campus E-sports Platform",
      "Game Development Framework",
      "Sports Analytics Dashboard",
      "Virtual Reality Gaming Experience"
    ],
    team: [
      { name: "Karan Patel", role: "Club President", email: "karan.patel@iitgn.ac.in" },
      { name: "Riya Sharma", role: "Game Development Lead", email: "riya.sharma@iitgn.ac.in" },
      { name: "Amit Joshi", role: "E-sports Coordinator", email: "amit.joshi@iitgn.ac.in" },
      { name: "Neha Gupta", role: "Community Manager", email: "neha.gupta@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "mean-mechanics": {
    id: "mean-mechanics",
    name: "Mean Mechanics, Robotics Club",
    description: "Specialises in designing and building robots, providing hands-on experience in robotics, automation, and mechatronics.",
    longDescription: "Mean Mechanics, the Robotics Club, is dedicated to advancing robotics and automation technologies. We provide hands-on experience in robot design, construction, and programming. Our members work on cutting-edge projects involving autonomous systems, industrial automation, and innovative mechatronic solutions.",
    type: "club",
    category: "Robotics & Automation",
    members: "55+",
    established: "2017",
    email: "meanmechanics@iitgn.ac.in",
    achievements: [
      "Winner - National Robotics Championship 2023",
      "Developed autonomous campus delivery system",
      "Best Innovation Award - National Robotics Meet",
      "Published research in robotics journals"
    ],
    projects: [
      "Autonomous Navigation Robot",
      "Industrial Automation System",
      "Swarm Robotics Research",
      "Robotic Arm for Manufacturing"
    ],
    team: [
      { name: "Aditya Kumar", role: "Club President", email: "aditya.kumar@iitgn.ac.in" },
      { name: "Meera Patel", role: "Hardware Lead", email: "meera.patel@iitgn.ac.in" },
      { name: "Rahul Verma", role: "Software Lead", email: "rahul.verma@iitgn.ac.in" },
      { name: "Pooja Jain", role: "Research Coordinator", email: "pooja.jain@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "odyssey": {
    id: "odyssey",
    name: "Odyssey, Astronomy Club",
    description: "Explores the wonders of the universe, with activities ranging from stargazing sessions to discussions on astrophysics and space technology.",
    longDescription: "Odyssey, the Astronomy Club, is dedicated to exploring the cosmos and advancing our understanding of the universe. We organize stargazing sessions, astrophysics discussions, and space technology workshops. Our members engage in astronomical observations, space mission simulations, and collaborative research projects.",
    type: "club",
    category: "Astronomy & Space",
    members: "40+",
    established: "2019",
    email: "odyssey@iitgn.ac.in",
    achievements: [
      "Organized successful stargazing events",
      "Built campus observatory telescope",
      "Collaboration with ISRO for student projects",
      "Published astronomical research papers"
    ],
    projects: [
      "Campus Observatory Development",
      "Asteroid Discovery Program",
      "Space Mission Simulation",
      "Astrophotography Documentation"
    ],
    team: [
      { name: "Siddharth Joshi", role: "Club President", email: "siddharth.joshi@iitgn.ac.in" },
      { name: "Kavya Sharma", role: "Observation Lead", email: "kavya.sharma@iitgn.ac.in" },
      { name: "Arjun Reddy", role: "Research Coordinator", email: "arjun.reddy@iitgn.ac.in" },
      { name: "Nisha Gupta", role: "Outreach Manager", email: "nisha.gupta@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "grasp": {
    id: "grasp",
    name: "GRASP, CP Club",
    description: "Dedicated to competitive programming, where members regularly participate in coding contests and work on improving their problem-solving abilities.",
    longDescription: "GRASP, the Competitive Programming Club, focuses on developing algorithmic thinking and problem-solving skills. We prepare students for coding competitions, organize practice sessions, and provide mentorship for programming contests. Our members regularly participate in national and international coding competitions.",
    type: "club",
    category: "Competitive Programming",
    members: "80+",
    established: "2017",
    email: "grasp@iitgn.ac.in",
    achievements: [
      "Multiple ICPC regional qualifications",
      "Winners in national coding competitions",
      "Organized inter-college programming contests",
      "Top performers in major coding contests"
    ],
    projects: [
      "Online Judge Platform Development",
      "Algorithm Visualization Tools",
      "Contest Management System",
      "Competitive Programming Training Portal"
    ],
    team: [
      { name: "Harsh Agarwal", role: "Club President", email: "harsh.agarwal@iitgn.ac.in" },
      { name: "Divya Singh", role: "Training Coordinator", email: "divya.singh@iitgn.ac.in" },
      { name: "Rohan Patel", role: "Contest Manager", email: "rohan.patel@iitgn.ac.in" },
      { name: "Ankit Sharma", role: "Mentorship Lead", email: "ankit.sharma@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "machine-learning": {
    id: "machine-learning",
    name: "Machine Learning Club",
    description: "Focuses on machine learning and AI, offering a space for students to experiment with algorithms, data science projects, and cutting-edge research.",
    longDescription: "The Machine Learning Club is dedicated to advancing artificial intelligence and machine learning technologies. We provide hands-on experience with ML algorithms, data science projects, and cutting-edge AI research. Our members work on real-world applications and contribute to the growing field of artificial intelligence.",
    type: "club",
    category: "Artificial Intelligence",
    members: "70+",
    established: "2018",
    email: "mlclub@iitgn.ac.in",
    achievements: [
      "Published research in top AI conferences",
      "Winner - National AI Challenge 2023",
      "Collaboration with industry AI labs",
      "Developed AI solutions for social good"
    ],
    projects: [
      "Computer Vision for Healthcare",
      "Natural Language Processing Research",
      "Reinforcement Learning Applications",
      "AI Ethics and Fairness Studies"
    ],
    team: [
      { name: "Priyanka Reddy", role: "Club President", email: "priyanka.reddy@iitgn.ac.in" },
      { name: "Amit Joshi", role: "Research Lead", email: "amit.joshi@iitgn.ac.in" },
      { name: "Neha Gupta", role: "Project Coordinator", email: "neha.gupta@iitgn.ac.in" },
      { name: "Vikash Kumar", role: "Industry Liaison", email: "vikash.kumar@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "tinkerers-lab": {
    id: "tinkerers-lab",
    name: "TINKERER'S LAB",
    description: "A hands-on innovation space where students experiment with hardware, prototyping, and creative engineering solutions to bring ideas to life.",
    longDescription: "TINKERER'S LAB is a hands-on innovation space dedicated to hardware experimentation, prototyping, and creative engineering solutions. We provide access to tools, equipment, and mentorship for students to bring their ideas to life through practical implementation and iterative design.",
    type: "club",
    category: "Innovation & Prototyping",
    members: "50+",
    established: "2020",
    email: "tinkererslab@iitgn.ac.in",
    achievements: [
      "Built innovative hardware prototypes",
      "Winner - National Innovation Challenge",
      "Developed IoT solutions for campus",
      "Mentored 100+ student projects"
    ],
    projects: [
      "Smart Campus IoT Network",
      "Sustainable Energy Solutions",
      "Assistive Technology Development",
      "Maker Space Equipment Design"
    ],
    team: [
      { name: "Rajesh Kumar", role: "Lab Coordinator", email: "rajesh.kumar@iitgn.ac.in" },
      { name: "Sneha Agarwal", role: "Hardware Lead", email: "sneha.agarwal@iitgn.ac.in" },
      { name: "Vikram Singh", role: "Innovation Manager", email: "vikram.singh@iitgn.ac.in" },
      { name: "Priya Sharma", role: "Mentorship Coordinator", email: "priya.sharma@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "anveshanam": {
    id: "anveshanam",
    name: "Anveshanam",
    description: "Research and innovation club focused on exploring cutting-edge technologies and conducting academic research projects.",
    longDescription: "Anveshanam is a research and innovation club dedicated to exploring cutting-edge technologies and conducting academic research projects. We foster a culture of scientific inquiry, innovation, and knowledge creation among students interested in research and development.",
    type: "club",
    category: "Research & Innovation",
    members: "35+",
    established: "2021",
    email: "anveshanam@iitgn.ac.in",
    achievements: [
      "Published research papers in conferences",
      "Secured research grants for student projects",
      "Collaboration with faculty on research",
      "Innovation awards in national competitions"
    ],
    projects: [
      "Interdisciplinary Research Projects",
      "Technology Innovation Studies",
      "Academic Research Collaboration",
      "Student Research Mentorship"
    ],
    team: [
      { name: "Arjun Patel", role: "Research Coordinator", email: "arjun.patel@iitgn.ac.in" },
      { name: "Kavya Reddy", role: "Innovation Lead", email: "kavya.reddy@iitgn.ac.in" },
      { name: "Rohit Sharma", role: "Project Manager", email: "rohit.sharma@iitgn.ac.in" },
      { name: "Ananya Singh", role: "Academic Liaison", email: "ananya.singh@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "systems": {
    id: "systems",
    name: "Systems Club",
    description: "Explores computer systems, networking, and hardware-software integration.",
    longDescription: "The Systems Club focuses on computer systems, networking technologies, and hardware-software integration. We explore system architecture, network protocols, and the intersection of hardware and software in modern computing systems.",
    type: "hobby-group",
    category: "Systems & Networking",
    members: "25+",
    established: "2020",
    email: "systems@iitgn.ac.in",
    achievements: [
      "Built campus network monitoring tools",
      "Organized system administration workshops",
      "Contributed to open-source system tools",
      "Network security research projects"
    ],
    projects: [
      "Campus Network Monitoring",
      "System Performance Analysis",
      "Network Security Tools",
      "Distributed Systems Research"
    ],
    team: [
      { name: "Karan Singh", role: "Group Coordinator", email: "karan.singh@iitgn.ac.in" },
      { name: "Riya Patel", role: "Network Lead", email: "riya.patel@iitgn.ac.in" },
      { name: "Amit Gupta", role: "Systems Specialist", email: "amit.gupta@iitgn.ac.in" },
      { name: "Pooja Sharma", role: "Security Researcher", email: "pooja.sharma@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "embed": {
    id: "embed",
    name: "Embed Club",
    description: "Focuses on embedded systems and microcontroller-based IoT projects.",
    longDescription: "The Embed Club specializes in embedded systems development and microcontroller-based IoT projects. We work with various microcontrollers, sensors, and embedded platforms to create innovative IoT solutions and embedded applications.",
    type: "hobby-group",
    category: "Embedded Systems",
    members: "30+",
    established: "2019",
    email: "embed@iitgn.ac.in",
    achievements: [
      "Developed IoT solutions for campus",
      "Winner - National Embedded Systems Contest",
      "Built smart home automation systems",
      "Contributed to open-source embedded projects"
    ],
    projects: [
      "Smart Campus Monitoring System",
      "IoT-based Environmental Sensors",
      "Embedded System Prototypes",
      "Microcontroller Programming Workshops"
    ],
    team: [
      { name: "Rahul Joshi", role: "Group Coordinator", email: "rahul.joshi@iitgn.ac.in" },
      { name: "Sneha Reddy", role: "Hardware Lead", email: "sneha.reddy@iitgn.ac.in" },
      { name: "Vikram Patel", role: "IoT Specialist", email: "vikram.patel@iitgn.ac.in" },
      { name: "Ananya Gupta", role: "Project Manager", email: "ananya.gupta@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "twist-theory": {
    id: "twist-theory",
    name: "Twist Theory, Speed Cubing Hobby Group",
    description: "Competitive speedcubing with advanced algorithms and official WCA competitions.",
    longDescription: "Twist Theory is the Speed Cubing Hobby Group dedicated to the art and sport of speedcubing. We practice advanced algorithms, participate in official WCA competitions, and promote the speedcubing community on campus through workshops and competitions.",
    type: "hobby-group",
    category: "Competitive Gaming",
    members: "20+",
    established: "2020",
    email: "twisttheory@iitgn.ac.in",
    achievements: [
      "Organized campus speedcubing competitions",
      "Multiple WCA competition participations",
      "Achieved sub-15 second average times",
      "Taught 100+ students to solve cubes"
    ],
    projects: [
      "Campus Speedcubing Championships",
      "Algorithm Development and Optimization",
      "Beginner Cubing Workshops",
      "Advanced Method Training Sessions"
    ],
    team: [
      { name: "Aditya Sharma", role: "Group Coordinator", email: "aditya.sharma@iitgn.ac.in" },
      { name: "Priya Joshi", role: "Competition Manager", email: "priya.joshi@iitgn.ac.in" },
      { name: "Rohan Gupta", role: "Training Lead", email: "rohan.gupta@iitgn.ac.in" },
      { name: "Kavya Singh", role: "Event Organizer", email: "kavya.singh@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "cybersentinel": {
    id: "cybersentinel",
    name: "CyberSentinel",
    description: "Cybersecurity group focused on ethical hacking, digital forensics, and CTF challenges.",
    longDescription: "CyberSentinel is a cybersecurity hobby group focused on ethical hacking, digital forensics, and Capture The Flag (CTF) challenges. We promote cybersecurity awareness, conduct security research, and participate in national and international cybersecurity competitions.",
    type: "hobby-group",
    category: "Cybersecurity",
    members: "40+",
    established: "2019",
    email: "cybersentinel@iitgn.ac.in",
    achievements: [
      "Top rankings in national CTF competitions",
      "Conducted cybersecurity workshops",
      "Identified and reported security vulnerabilities",
      "Collaborated with industry on security research"
    ],
    projects: [
      "Campus Security Assessment",
      "CTF Challenge Development",
      "Digital Forensics Research",
      "Ethical Hacking Training Programs"
    ],
    team: [
      { name: "Arjun Singh", role: "Group Coordinator", email: "arjun.singh@iitgn.ac.in" },
      { name: "Neha Patel", role: "CTF Lead", email: "neha.patel@iitgn.ac.in" },
      { name: "Vikash Sharma", role: "Forensics Specialist", email: "vikash.sharma@iitgn.ac.in" },
      { name: "Riya Gupta", role: "Security Researcher", email: "riya.gupta@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "lambda": {
    id: "lambda",
    name: "Lambda",
    description: "Programming languages theory and implementation through research and hands-on projects.",
    longDescription: "Lambda is a hobby group dedicated to programming languages theory and implementation. We explore functional programming, compiler design, type systems, and language implementation through research projects and hands-on development.",
    type: "hobby-group",
    category: "Programming Languages",
    members: "15+",
    established: "2020",
    email: "lambda@iitgn.ac.in",
    achievements: [
      "Developed experimental programming languages",
      "Contributed to open-source compilers",
      "Organized programming language workshops",
      "Published research on type systems"
    ],
    projects: [
      "Functional Programming Language Design",
      "Compiler Optimization Research",
      "Type System Implementation",
      "Language Interoperability Studies"
    ],
    team: [
      { name: "Varun Agarwal", role: "Group Coordinator", email: "varun.agarwal@iitgn.ac.in" },
      { name: "Nisha Reddy", role: "Research Lead", email: "nisha.reddy@iitgn.ac.in" },
      { name: "Siddharth Gupta", role: "Compiler Specialist", email: "siddharth.gupta@iitgn.ac.in" },
      { name: "Ananya Jain", role: "Theory Researcher", email: "ananya.jain@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  "blockchain-hobby": {
    id: "blockchain-hobby",
    name: "Blockchain Hobby Group",
    description: "Explores blockchain fundamentals and real-world applications through hands-on sessions.",
    longDescription: "The Blockchain Hobby Group explores blockchain technology fundamentals and real-world applications through hands-on development sessions. We work on cryptocurrency projects, smart contracts, and decentralized applications while studying the underlying blockchain technologies.",
    type: "hobby-group",
    category: "Blockchain",
    members: "25+",
    established: "2021",
    email: "blockchain@iitgn.ac.in",
    achievements: [
      "Developed decentralized applications",
      "Created educational blockchain content",
      "Participated in blockchain hackathons",
      "Built smart contract solutions"
    ],
    projects: [
      "Campus Cryptocurrency System",
      "Smart Contract Development",
      "DeFi Protocol Research",
      "Blockchain Education Platform"
    ],
    team: [
      { name: "Karan Reddy", role: "Group Coordinator", email: "karan.reddy@iitgn.ac.in" },
      { name: "Priya Agarwal", role: "Smart Contract Lead", email: "priya.agarwal@iitgn.ac.in" },
      { name: "Rohit Joshi", role: "DApp Developer", email: "rohit.joshi@iitgn.ac.in" },
      { name: "Sneha Singh", role: "Research Coordinator", email: "sneha.singh@iitgn.ac.in" }
    ],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  }
};

// Club categories
export const clubCategories = [
  "Software Development",
  "Gaming & Sports Technology",
  "Robotics & Automation",
  "Artificial Intelligence",
  "Cybersecurity",
  "Electronics & Hardware",
  "Aerospace",
  "Research & Innovation",
  "Systems & Networking",
  "Embedded Systems",
  "Blockchain",
  "Astronomy & Space",
  "Competitive Programming",
  "Innovation & Prototyping",
  "Competitive Gaming",
  "Programming Languages",
  "Other"
];

// Club types
export const clubTypes = [
  { value: "club", label: "Technical Club" },
  { value: "hobby-group", label: "Hobby Group" },
  { value: "technical-council-group", label: "Technical Council Group" }
];
