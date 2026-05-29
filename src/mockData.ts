import { UserProfile, Roadmap, GapAnalysis, StudyPlan, ProjectRec, MarketTrend } from "./types";

export const DEFAULT_PROFILE: UserProfile = {
  name: "Alex Rivera",
  email: "alex.rivera@example.com",
  country: "United States",
  timezone: "UTC -5 (EST)",
  educationStatus: "Career Switcher",
  targetRoles: ["Security Engineer"],
  experienceLevel: "Beginner",
  existingSkills: ["Linux", "Python Basics", "Basic Networking"],
  availableTime: "1 hr/day",
  completedTopics: ["Linux Basics"],
  daysMissedAccumulated: 0,
  streakCount: 5,
};

export const PRESET_ROLES = [
  "DevOps Engineer",
  "Security Engineer",
  "Cloud Engineer",
  "Data Analyst",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Machine Learning Engineer",
  "Site Reliability Engineer",
  "SOC Analyst",
  "Penetration Tester",
  "Product Manager",
];

export const PRESET_SKILLS: Record<string, string[]> = {
  "DevOps": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Bash", "Terraform", "Networking", "Git", "Ansible"],
  "Security": ["Linux", "Networking", "Python", "SIEM", "Cloud Security", "Threat Detection", "OWASP", "Vulnerability Assessment", "Cryptography"],
  "Software Engineering": ["JavaScript", "React", "TypeScript", "Python", "Node.js", "Docker", "SQL", "Git", "Data Structures", "APIs"],
  "Data Analysis": ["Python", "SQL", "Excel", "Tableau", "Power BI", "Statistics", "R", "Pandas", "Data Cleaning", "Storytelling"],
};

export const STARTER_ROADMAP_SECURITY: Roadmap = {
  title: "Security Engineer Path",
  description: "A chronological journey from general foundations to production-grade threat modeling and cloud defenses.",
  phases: [
    {
      phaseName: "PHASE 1 — Foundations",
      description: "Establish strong fundamental baselines in command line utilities and security core definitions.",
      topics: [
        {
          topicName: "Linux Fundamentals",
          description: "Mastering terminal environments, system controls, bash automation, and user directories.",
          difficulty: "Beginner",
          estimatedDuration: "2 weeks",
          learningPriorityScore: "critical",
          careerRelevanceScore: 90,
          prerequisites: [],
          resources: [
            { type: "YouTube", title: "Linux Basics for Hackers Course", url: "https://www.youtube.com", isFree: true },
            { type: "Documentation", title: "Debian Administrator Reference", url: "https://www.debian.org", isFree: true },
          ],
          completed: true,
        },
        {
          topicName: "Networking Fundamentals",
          description: "Comprehensive understanding of TCP/IP, DNS, OSI Model, Subnets, and routing protocols.",
          difficulty: "Beginner",
          estimatedDuration: "3 weeks",
          learningPriorityScore: "critical",
          careerRelevanceScore: 92,
          prerequisites: ["Linux Fundamentals"],
          resources: [
            { type: "Course", title: "CompTIA Network+ Boot Camp", url: "https://www.professormesser.com", isFree: true },
            { type: "Lab", title: "Wireshark Packet Analysis Labs", url: "https://www.wireshark.org", isFree: true },
          ],
          completed: false,
        },
      ],
    },
    {
      phaseName: "PHASE 2 — Security Core",
      description: "Dive deep into modern security architectures, identity controls, and system monitoring setups.",
      topics: [
        {
          topicName: "Identity & Access Management (IAM)",
          description: "Implementing role-based access, oauth, single sign-on constraints, and security boundary principles.",
          difficulty: "Intermediate",
          estimatedDuration: "2 weeks",
          learningPriorityScore: "critical",
          careerRelevanceScore: 95,
          prerequisites: ["Networking Fundamentals"],
          resources: [
            { type: "Documentation", title: "AWS IAM Best Practices Guide", url: "https://aws.amazon.com", isFree: true },
            { type: "Blog", title: "SSO and OAuth 2.0 Explained", url: "https://auth0.com/blog", isFree: true },
          ],
          completed: false,
        },
        {
          topicName: "SIEM & Threat Detection",
          description: "Aggregating audit logs from active directories, host endpoints, and firewalls using Grafana, Elastic, or Splunk.",
          difficulty: "Intermediate",
          estimatedDuration: "4 weeks",
          learningPriorityScore: "important",
          careerRelevanceScore: 88,
          prerequisites: ["Linux Fundamentals", "Networking Fundamentals"],
          resources: [
            { type: "Practice", title: "Splunk Free Interactive Security Core", url: "https://www.splunk.com", isFree: true },
            { type: "Lab", title: "Wazuh SIEM Deploy with Docker", url: "https://wazuh.com", isFree: true },
          ],
          completed: false,
        },
      ],
    },
    {
      phaseName: "PHASE 3 — Advanced Security",
      description: "Apply modern cloud infrastructure defenses, custom scripting automation, and threat defense protocols.",
      topics: [
        {
          topicName: "Cloud Infrastructure Defense",
          description: "Targeting Kubernetes hardening, network security groups, container vulnerability scanning, and IAM least privilege.",
          difficulty: "Advanced",
          estimatedDuration: "3 weeks",
          learningPriorityScore: "important",
          careerRelevanceScore: 94,
          prerequisites: ["Identity & Access Management (IAM)", "SIEM & Threat Detection"],
          resources: [
            { type: "Course", title: "Certified Cloud Security Professional Labs", url: "https://www.isc2.org", isFree: false },
          ],
          completed: false,
        },
      ],
    },
  ],
};

export const STARTER_GAP_SECURITY: GapAnalysis = {
  readinessScore: 35,
  knownSkills: [
    { name: "Linux Basics", confidence: 85 },
    { name: "Python Scripting Fundamentals", confidence: 70 },
    { name: "Git & Version Controls", confidence: 80 },
  ],
  missingSkills: [
    { name: "SIEM Systems (Splunk / Wazuh)", urgency: "High" },
    { name: "Cloud Security Configuration", urgency: "High" },
    { name: "Advanced Networking Protocols", urgency: "Medium" },
    { name: "Threat Modeling (OWASP / STRIDE)", urgency: "Medium" },
    { name: "Incident Response Protocols", urgency: "Low" },
  ],
  weakAreas: [
    "Vulnerability Patching strategies",
    "Packet Analysis under Wireshark",
    "IAM Authorization policies",
  ],
  strengthAreas: [
    "Local terminal automation",
    "Simple web scraping and data scripts with Python",
  ],
  nextSteps: [
    "Prioritize getting familiar with Wireshark tool to patch network gaps.",
    "Launch a security logging home lab to capture test cyber audit trails.",
  ],
};

export const STARTER_SCHEDULE_SECURITY: StudyPlan = {
  rebalancedReasoning: "Redistributed evenly over active sessions, balancing theoretical IAM modules with packet tracer labs to accommodate weekdays.",
  schedule: [
    {
      day: "Monday",
      tasks: [
        { title: "Review Networking Protocols (IP, TCP)", durationMinutes: 30, focus: "IP addressing & flags", activityType: "Theory" },
        { title: "Python Automation Commands", durationMinutes: 30, focus: "Handling string inputs in sys module", activityType: "Theory" },
      ],
    },
    {
      day: "Tuesday",
      tasks: [
        { title: "Hands-on Wireshark Capturing Study", durationMinutes: 60, focus: "Analyze TCP Handshake packet exchanges", activityType: "Lab" },
      ],
    },
    {
      day: "Wednesday",
      tasks: [
        { title: "IAM Policy Syntax Review", durationMinutes: 30, focus: "JSON Policies matching Principle of Least Privilege", activityType: "Theory" },
        { title: "Weekly Revision & Quiz", durationMinutes: 30, focus: "Foundations Checkpoint", activityType: "Revision" },
      ],
    },
    {
      day: "Thursday",
      tasks: [
        { title: "Setup Local Docker Wazuh Container", durationMinutes: 60, focus: "Deploying Elastic SIEM node locally", activityType: "Lab" },
      ],
    },
    {
      day: "Friday",
      tasks: [
        { title: "OWASP Top 10 Web Vulnerability Review", durationMinutes: 45, focus: "Injection Attacks & Safe Sanitizing concepts", activityType: "Theory" },
      ],
    },
    {
      day: "Saturday",
      tasks: [
        { title: "SIEM Log Query Building", durationMinutes: 60, focus: "Write Splunk Search Processing Language matching threat logs", activityType: "Lab" },
      ],
    },
    {
      day: "Sunday",
      tasks: [
        { title: "Self Reflected Weekly Checkpoint", durationMinutes: 30, focus: "Mark completed items & schedule upcoming tasks", activityType: "Revision" },
      ],
    },
  ],
};

export const STARTER_PROJECTS_SECURITY: ProjectRec[] = [
  {
    title: "Deploy a Wazuh Home SIEM Lab",
    difficulty: "Beginner",
    estimatedDuration: "8 hours",
    requiredSkills: ["Linux", "Docker Concepts"],
    learningOutcome: "Hands-on understanding of Central log aggregation, active endpoint agent scanning, and alert creation.",
    portfolioValue: "High",
    steps: [
      "Provision a virtual cloud Linux instance (Ubuntu VM).",
      "Deploy Wazuh SIEM stack utilizing docker-compose configurations.",
      "Install Wazuh agent on your personal machine to monitor security telemetry of endpoints.",
      "Simulate a simple SSH brute-force attack and monitor triggered telemetry alerts under Kibana.",
    ],
  },
  {
    title: "AWS Secure Cloud Infrastructure",
    difficulty: "Intermediate",
    estimatedDuration: "14 hours",
    requiredSkills: ["AWS Basics", "IAM Architectures"],
    learningOutcome: "Deploy multi-tier VPC architectures, strict IAM role permissions, and active resource monitoring shields.",
    portfolioValue: "High",
    steps: [
      "Set up custom VPC with private subnet pathways.",
      "Configure cloud trail logs synced inside isolated S3 buckets.",
      "Establish least-privilege IAM policies controlling active virtual machines.",
    ],
  },
];

export const STARTER_MARKET_TRENDS_SECURITY: MarketTrend = {
  roleName: "Security Engineer",
  skillsDemand: [
    { skillName: "Cloud Infrastructure (AWS/Azure)", demandPercentage: 88 },
    { skillName: "SIEM Log Platforms", demandPercentage: 74 },
    { skillName: "Python Coding for Scripting", demandPercentage: 68 },
    { skillName: "Kubernetes & Container Hardening", demandPercentage: 62 },
    { skillName: "CI/CD Secure Pipelines", demandPercentage: 55 },
  ],
  trendingTools: [
    { name: "Snyk / Trivy", reason: "Automated vulnerability detection inside build pipelines." },
    { name: "Wazuh / Splunk", reason: "Widespread adaptation to support threat intelligence aggregation." },
    { name: "Terraform Security Scanning", reason: "Evaluating Infrastructure-as-code files to spot misconfigurations easily." },
  ],
  emergingSkills: [
    "AI Code Security Auditing",
    "Zero Trust Access Implementations",
    "Secure Software Bill of Materials (SBOM)",
  ],
  salaryLevel: {
    entry: "$78,000 - $98,000",
    mid: "$105,000 - $135,000",
    senior: "$145,000 - $185,000+",
  },
  locationDemand: [
    { city: "San Francisco / Remote", index: "High" },
    { city: "New York City", index: "High" },
    { city: "Seattle", index: "Medium" },
    { city: "Austin", index: "Medium" },
  ],
};
