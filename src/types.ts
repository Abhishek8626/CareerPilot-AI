export interface Resource {
  type: "YouTube" | "Documentation" | "Blog" | "Course" | "Lab" | "Practice" | string;
  title: string;
  url: string;
  isFree: boolean;
}

export interface Topic {
  topicName: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | string;
  estimatedDuration: string;
  learningPriorityScore: "critical" | "important" | "optional" | string;
  careerRelevanceScore: number;
  prerequisites: string[];
  resources: Resource[];
  completed?: boolean;
}

export interface Phase {
  phaseName: string;
  description: string;
  topics: Topic[];
}

export interface Roadmap {
  title: string;
  description: string;
  phases: Phase[];
}

export interface KnownSkill {
  name: string;
  confidence: number;
}

export interface MissingSkill {
  name: string;
  urgency: "High" | "Medium" | "Low" | string;
}

export interface GapAnalysis {
  readinessScore: number;
  knownSkills: KnownSkill[];
  missingSkills: MissingSkill[];
  weakAreas: string[];
  strengthAreas: string[];
  nextSteps: string[];
}

export interface PlannerTask {
  title: string;
  durationMinutes: number;
  focus: string;
  activityType: "Theory" | "Lab" | "Revision" | string;
  completed?: boolean;
}

export interface DailySchedule {
  day: string;
  tasks: PlannerTask[];
}

export interface StudyPlan {
  rebalancedReasoning: string;
  schedule: DailySchedule[];
}

export interface ProjectRec {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | string;
  estimatedDuration: string;
  requiredSkills: string[];
  learningOutcome: string;
  portfolioValue: "High" | "Medium" | "Low" | string;
  steps: string[];
}

export interface SkillDemand {
  skillName: string;
  demandPercentage: number;
}

export interface MarketTrend {
  roleName: string;
  skillsDemand: SkillDemand[];
  trendingTools: Array<{ name: string; reason: string }>;
  emergingSkills: string[];
  salaryLevel: {
    entry: string;
    mid: string;
    senior: string;
  };
  locationDemand: Array<{ city: string; index: "High" | "Medium" | "Low" | string }>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface MockQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  sampleAnswer: string;
  userAnswer?: string;
  feedback?: {
    accuracy: number;
    clarityScore: number;
    technicalDepthScore: number;
    feedback: string;
    suggestions: string[];
  };
}

export interface OptimizeBullet {
  original: string;
  improved: string;
  rationale: string;
}

export interface OptimizeAnalysis {
  atsCompatibilityScore: number;
  keywordCoverage: Array<{ keyword: string; found: boolean }>;
  missingSkills: string[];
  projectSuggestions: string[];
  experienceGapAnalysis: string;
  bulletImprovements: OptimizeBullet[];
}

export interface UserProfile {
  name: string;
  email: string;
  country: string;
  timezone: string;
  educationStatus: "Student" | "Working Professional" | "Career Switcher" | "Fresher" | "Experienced Professional" | string;
  targetRoles: string[];
  experienceLevel: "Beginner" | "Intermediate" | "Advanced" | string;
  existingSkills: string[];
  availableTime: string;
  completedTopics: string[];
  daysMissedAccumulated: number;
  streakCount: number;
}
