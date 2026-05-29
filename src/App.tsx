import React, { useState, useEffect, useRef } from "react";
import Onboarding from "./components/Onboarding";
import { 
  UserProfile, 
  Roadmap, 
  GapAnalysis, 
  StudyPlan, 
  ProjectRec, 
  MarketTrend, 
  ChatMessage, 
  MockQuestion, 
  OptimizeAnalysis 
} from "./types";
import { 
  DEFAULT_PROFILE, 
  STARTER_ROADMAP_SECURITY, 
  STARTER_GAP_SECURITY, 
  STARTER_SCHEDULE_SECURITY, 
  STARTER_PROJECTS_SECURITY, 
  STARTER_MARKET_TRENDS_SECURITY 
} from "./mockData";
import { 
  Compass, 
  Layers, 
  Calendar, 
  Code, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  BarChart2, 
  Users, 
  MapPin, 
  Search, 
  CheckCircle, 
  BookOpen, 
  Bookmark, 
  AlertTriangle, 
  ExternalLink, 
  Play, 
  Sparkles, 
  User, 
  RefreshCw, 
  Flame, 
  GraduationCap, 
  Settings, 
  Upload, 
  HelpCircle, 
  Terminal, 
  ThumbsUp, 
  Clock, 
  Plus, 
  FileCheck 
} from "lucide-react";

export default function App() {
  // Load profile from localStorage or fallback
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("career_roadmap_profile");
    return saved ? JSON.parse(saved) : null;
  });

  // Active Module tab
  const [activeTab, setActiveTab] = useState<string>("roadmap");

  // State entities
  const [roadmap, setRoadmap] = useState<Roadmap | null>(() => {
    const saved = localStorage.getItem("career_roadmap_data");
    return saved ? JSON.parse(saved) : STARTER_ROADMAP_SECURITY;
  });

  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(() => {
    const saved = localStorage.getItem("career_gap_data");
    return saved ? JSON.parse(saved) : STARTER_GAP_SECURITY;
  });

  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(() => {
    const saved = localStorage.getItem("career_schedule_data");
    return saved ? JSON.parse(saved) : STARTER_SCHEDULE_SECURITY;
  });

  const [projects, setProjects] = useState<ProjectRec[]>(() => {
    const saved = localStorage.getItem("career_projects_data");
    return saved ? JSON.parse(saved) : STARTER_PROJECTS_SECURITY;
  });

  const [marketTrends, setMarketTrends] = useState<MarketTrend | null>(() => {
    const saved = localStorage.getItem("career_trends_data");
    return saved ? JSON.parse(saved) : STARTER_MARKET_TRENDS_SECURITY;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("career_chat_messages");
    return saved ? JSON.parse(saved) : [
      {
        id: "init-1",
        role: "model",
        text: "Hi there! I am your AI Career Coach. Feel free to ask me any question about your target roles, resume optimization, study habits, or specific technical queries like 'Explain Docker in simple terms'.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const [activeInterviewQuestions, setActiveInterviewQuestions] = useState<MockQuestion[]>([]);
  const [interviewTopic, setInterviewTopic] = useState("Networking & Cloud Security");
  const [interviewMode, setInterviewMode] = useState<"Technical" | "MCQ" | "Scenario">("Technical");
  const [resumeOptimization, setResumeOptimization] = useState<OptimizeAnalysis | null>(null);

  // Loading/API Action States
  const [loading, setLoading] = useState<Record<string, boolean>>({
    roadmap: false,
    gap: false,
    schedule: false,
    projects: false,
    trends: false,
    chat: false,
    interview: false,
    resume: false,
  });

  const [apiError, setApiError] = useState<string | null>(null);

  // Local interaction states
  const [resourceFilter, setResourceFilter] = useState<"all" | "free" | "paid" | "fast">("all");
  const [chatInput, setChatInput] = useState("");
  const [typedResume, setTypedResume] = useState("");
  const [resumeFileError, setResumeFileError] = useState<string | null>(null);
  const [missedDaysCount, setMissedDaysCount] = useState(0);
  const [manualSkillInput, setManualSkillInput] = useState("");

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Persist Profile helper
  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("career_roadmap_profile", JSON.stringify(newProfile));
  };

  // Helper trigger to recalculate / generate initial data using user profile
  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    saveProfile(newProfile);
    // Request AI items automatically
    await triggerRoadmapGeneration(newProfile);
    await triggerMarketTrends(newProfile.targetRoles[0] || "Security Engineer");
    await triggerGapAnalysis(newProfile);
    await triggerScheduleGeneration(newProfile);
    await triggerProjectRecommendations(newProfile);
    setActiveTab("roadmap");
  };

  // 1. AI Roadmap Generation
  const triggerRoadmapGeneration = async (currentProfile = profile) => {
    if (!currentProfile) return;
    setLoading((prev) => ({ ...prev, roadmap: true }));
    setApiError(null);
    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRoles: currentProfile.targetRoles,
          experienceLevel: currentProfile.experienceLevel,
          existingSkills: currentProfile.existingSkills,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed server roadmap request.");
      }
      const data = await res.json() as Roadmap;
      setRoadmap(data);
      localStorage.setItem("career_roadmap_data", JSON.stringify(data));
    } catch (err: any) {
      console.warn("AI Generation failed. Falling back to structured static data and warning user.", err);
      setApiError("Using offline cached roadmap pattern. Set your GEMINI_API_KEY in Secrets to enable full continuous dynamic generation!");
    } finally {
      setLoading((prev) => ({ ...prev, roadmap: false }));
    }
  };

  // 2. Skill Gap Analysis
  const triggerGapAnalysis = async (currentProfile = profile, providedText = "") => {
    if (!currentProfile) return;
    setLoading((prev) => ({ ...prev, gap: true }));
    setApiError(null);
    try {
      const res = await fetch("/api/analyze-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: currentProfile.targetRoles[0] || "Security Engineer",
          resumeText: providedText || typedResume || "Manual inventory list provided",
          existingSkills: currentProfile.existingSkills,
        }),
      });
      if (!res.ok) throw new Error("Faulty response");
      const data = await res.json() as GapAnalysis;
      setGapAnalysis(data);
      localStorage.setItem("career_gap_data", JSON.stringify(data));
    } catch (err) {
      console.warn("Using baseline GAP data instead due to connectivity limits.");
      setGapAnalysis(STARTER_GAP_SECURITY);
    } finally {
      setLoading((prev) => ({ ...prev, gap: false }));
    }
  };

  // 3. Daily Planner Adaptive Workload Calibration
  const triggerScheduleGeneration = async (currentProfile = profile, daysMissed = 0) => {
    if (!currentProfile || !roadmap) return;
    setLoading((prev) => ({ ...prev, schedule: true }));
    setApiError(null);

    // Grab up to 4 incomplete topics to form plan
    const incomplete = roadmap.phases
      .flatMap((p) => p.topics)
      .filter((t) => !t.completed)
      .map((t) => t.topicName)
      .slice(0, 4);

    try {
      const res = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availableTime: currentProfile.availableTime,
          selectedTopics: incomplete.length > 0 ? incomplete : ["General Core Engineering Paths"],
          daysMissed: daysMissed,
        }),
      });
      if (!res.ok) throw new Error("Faulty schedule data response");
      const data = await res.json() as StudyPlan;
      setStudyPlan(data);
      localStorage.setItem("career_schedule_data", JSON.stringify(data));
    } catch (err) {
      console.warn("Study plan could not recalibrate via API. Applying robust static redistributions instead.");
      setStudyPlan(STARTER_SCHEDULE_SECURITY);
    } finally {
      setLoading((prev) => ({ ...prev, schedule: false }));
    }
  };

  // 4. Project Recommendations
  const triggerProjectRecommendations = async (currentProfile = profile) => {
    if (!currentProfile) return;
    setLoading((prev) => ({ ...prev, projects: true }));
    setApiError(null);
    try {
      const res = await fetch("/api/recommend-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRoles: currentProfile.targetRoles,
          skills: currentProfile.existingSkills,
        }),
      });
      if (!res.ok) throw new Error("Failed server project recommendations.");
      const data = await res.json() as ProjectRec[];
      setProjects(data);
      localStorage.setItem("career_projects_data", JSON.stringify(data));
    } catch (err) {
      console.warn("Setting pre-constructed project patterns.");
      setProjects(STARTER_PROJECTS_SECURITY);
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  };

  // 5. Job Market Trends Check
  const triggerMarketTrends = async (roleName: string) => {
    setLoading((prev) => ({ ...prev, trends: true }));
    setApiError(null);
    try {
      const res = await fetch("/api/market-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: roleName }),
      });
      if (!res.ok) throw new Error("Market analyzer is busy.");
      const data = await res.json() as MarketTrend;
      setMarketTrends(data);
      localStorage.setItem("career_trends_data", JSON.stringify(data));
    } catch (err) {
      console.warn("Retaining baseline security standard analytics.");
      setMarketTrends(STARTER_MARKET_TRENDS_SECURITY);
    } finally {
      setLoading((prev) => ({ ...prev, trends: false }));
    }
  };

  // 6. Resume Optimize STAR analysis
  const triggerResumeOptimization = async () => {
    if (!typedResume.trim()) {
      setResumeFileError("Please copy and paste your resume text details first!");
      return;
    }
    setLoading((prev) => ({ ...prev, resume: true }));
    setResumeFileError(null);
    try {
      const res = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: typedResume,
          targetRole: profile?.targetRoles[0] || "Security Engineer",
        }),
      });
      if (!res.ok) throw new Error("Problem compiling standard ATS checklists.");
      const data = await res.json() as OptimizeAnalysis;
      setResumeOptimization(data);
    } catch (err) {
      setResumeFileError("Error optimizing via AI model. Please verify your GEMINI_API_KEY inside your configuration panel.");
    } finally {
      setLoading((prev) => ({ ...prev, resume: false }));
    }
  };

  // 7. Core AI Chat bot assistant coach
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setLoading((prev) => ({ ...prev, chat: true }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({ role: m.role, text: m.text })),
          userProfile: profile ? {
            targetRoles: profile.targetRoles,
            experienceLevel: profile.experienceLevel,
            completedTopics: profile.completedTopics,
            weakAreas: gapAnalysis?.weakAreas || [],
          } : undefined,
        }),
      });
      if (!res.ok) throw new Error("Chat generation limits hit.");
      const data = await res.json();
      
      setChatMessages((prev) => [...prev, {
        id: `ai-${Date.now()}`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, {
        id: `ai-err-${Date.now()}`,
        role: "model",
        text: "I experienced trouble connecting. Please check that a valid `GEMINI_API_KEY` is present. In the meantime, feel free to ask me questions once online!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading((prev) => ({ ...prev, chat: false }));
    }
  };

  // 8. Interactive Interview Practice generator
  const triggerGenerateInterview = async () => {
    setLoading((prev) => ({ ...prev, interview: true }));
    try {
      const res = await fetch("/api/mock-interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: profile?.targetRoles[0] || "Security Engineer",
          topic: interviewTopic,
          mode: interviewMode,
        }),
      });
      if (!res.ok) throw new Error("Interview generation is currently unavailable.");
      const data = await res.json() as MockQuestion[];
      setActiveInterviewQuestions(data);
    } catch (err) {
      setApiError("Mock interview scenario could not launch. Review server connectivity settings.");
    } finally {
      setLoading((prev) => ({ ...prev, interview: false }));
    }
  };

  // Submit Answer & Evaluate via AI feedback check
  const handleEvaluateAnswer = async (qId: string, textAns: string) => {
    const activeQ = activeInterviewQuestions.find(q => q.id === qId);
    if (!activeQ || !textAns.trim()) return;

    // Set interactive temporary state to show loading icon
    setActiveInterviewQuestions(prev => prev.map(q => q.id === qId ? { ...q, userAnswer: textAns } : q));

    try {
      const res = await fetch("/api/mock-interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: activeQ.text,
          userAnswer: textAns,
          sampleAnswer: activeQ.sampleAnswer,
        }),
      });
      if (!res.ok) throw new Error();
      const scoreData = await res.json();
      
      setActiveInterviewQuestions(prev => prev.map(q => q.id === qId ? {
        ...q,
        feedback: scoreData,
      } : q));
    } catch (err) {
      // Fallback local simulation in case of missing keys
      setActiveInterviewQuestions(prev => prev.map(q => q.id === qId ? {
        ...q,
        feedback: {
          accuracy: 80,
          clarityScore: 75,
          technicalDepthScore: 82,
          feedback: "Good attempt! This is a mock feedback evaluations loop. You effectively mentioned core architectural parameters. Strengthen logs detail for security scenarios.",
          suggestions: ["Mention Principle of Least Privilege specifically", "Cite exact container port namespaces"],
        },
      } : q));
    }
  };

  // Handlers to toggle roadmap topic completions locally & update progress scores!
  const toggleTopicCompletion = (phaseIndex: number, topicIndex: number) => {
    if (!roadmap) return;
    const updated = { ...roadmap };
    const topic = updated.phases[phaseIndex].topics[topicIndex];
    topic.completed = !topic.completed;

    setRoadmap(updated);
    localStorage.setItem("career_roadmap_data", JSON.stringify(updated));

    // Sync state metadata in active profile
    if (profile) {
      const compSet = new Set(profile.completedTopics);
      if (topic.completed) {
        compSet.add(topic.topicName);
      } else {
        compSet.delete(topic.topicName);
      }
      
      const newProf: UserProfile = { ...profile, completedTopics: Array.from(compSet) };
      // Increment study streak if checking off tasks
      if (topic.completed) {
        newProf.streakCount = Math.min(newProf.streakCount + 1, 365);
      }
      saveProfile(newProf);
    }
  };

  // Quick helper to insert custom skills inside active profile inventory
  const handleQuickAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualSkillInput.trim() && profile) {
      const updatedSkills = [...profile.existingSkills];
      if (!updatedSkills.includes(manualSkillInput.trim())) {
        updatedSkills.push(manualSkillInput.trim());
        const updatedProfile = { ...profile, existingSkills: updatedSkills };
        saveProfile(updatedProfile);
        setManualSkillInput("");
        triggerGapAnalysis(updatedProfile);
      }
    }
  };

  // Reset profile / start over onboarding
  const handleResetApp = () => {
    localStorage.removeItem("career_roadmap_profile");
    localStorage.removeItem("career_roadmap_data");
    localStorage.removeItem("career_gap_data");
    localStorage.removeItem("career_schedule_data");
    localStorage.removeItem("career_projects_data");
    localStorage.removeItem("career_trends_data");
    setProfile(null);
    setRoadmap(STARTER_ROADMAP_SECURITY);
    setGapAnalysis(STARTER_GAP_SECURITY);
    setStudyPlan(STARTER_SCHEDULE_SECURITY);
    setProjects(STARTER_PROJECTS_SECURITY);
    setMarketTrends(STARTER_MARKET_TRENDS_SECURITY);
  };

  // Computed visual parameters
  const totalRoadmapTopics = roadmap?.phases.flatMap((p) => p.topics).length || 0;
  const completedRoadmapTopics = roadmap?.phases.flatMap((p) => p.topics).filter((t) => t.completed).length || 0;
  const readinessCompletionPercentage = totalRoadmapTopics > 0 ? Math.round((completedRoadmapTopics / totalRoadmapTopics) * 100) : 0;

  // Render onboarding screen if profile is uninitialized
  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans flex flex-col justify-between py-12 px-4 selection:bg-teal-500 selection:text-black">
        <div className="text-center mb-8 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950/40 text-teal-400 border border-teal-800/80 rounded-full text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Career Planner
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Career Roadmap Builder
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Specify your desired trajectory. We'll identify exact learning sequences, audit known checkpoints, draft weekly calendars, and suggest hands-on laboratory builds.
          </p>
        </div>

        <Onboarding onComplete={handleOnboardingComplete} />

        <div className="text-center text-[10px] text-zinc-600 font-mono mt-12">
          MADE WITH GOOGLE GEMINI 3.5 FLASH • ZERO THIRD-PARTY COOKIES REQUIRED
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-teal-500 selection:text-black">
      
      {/* Top Professional App Grid Status Strip */}
      <header className="border-b border-zinc-900 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-xl shadow-lg shadow-teal-500/10 text-white shrink-0">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-white">Career Roadmap Builder</h1>
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-900 px-1.5 py-0.5 rounded-md uppercase">
                  Beta
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pacing {profile.name} to target:{" "}
                <strong className="text-zinc-200">{profile.targetRoles.join(" & ")}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Study Streak indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs" title="Study streak active consistency counts">
              <Flame className="w-4 h-4 text-orange-400 shrink-0 fill-orange-400" />
              <span className="font-mono text-zinc-300 font-semibold">{profile.streakCount} Day Streak</span>
            </div>

            {/* Quick Readiness Progress Bar */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
              <span className="text-zinc-400 font-mono">Completed:</span>
              <div className="w-20 bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: `${readinessCompletionPercentage}%` }} />
              </div>
              <span className="font-mono font-bold text-teal-400">{readinessCompletionPercentage}%</span>
            </div>

            <button
              onClick={handleResetApp}
              className="px-3 py-1.5 border border-zinc-805 bg-zinc-950 text-zinc-400 hover:text-white rounded-lg text-xs transition-colors flex items-center gap-1.5 font-medium hover:border-zinc-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start Over
            </button>
          </div>
        </div>
      </header>

      {/* Global alert messages */}
      {apiError && (
        <div className="bg-yellow-905/10 border-b border-yellow-800/40 py-2.5 px-4 text-center">
          <p className="text-xs text-yellow-300 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-500" />
            <span>{apiError}</span>
          </p>
        </div>
      )}

      {/* Main Grid Chassis */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav (3 Units) */}
        <aside className="lg:col-span-3 flex flex-col gap-5">
          <div className="p-4 bg-zinc-900 border border-zinc-850/60 rounded-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">NAVIGATION BOARD</span>
            <nav className="flex flex-col gap-1">
              {[
                { id: "roadmap", label: "My Roadmap Study", icon: Compass, badge: null },
                { id: "gap", label: "Skill Gap Analysis", icon: Layers, badge: `${gapAnalysis?.missingSkills.length || 0} gaps` },
                { id: "planner", label: "Daily Study Planner", icon: Calendar, badge: null },
                { id: "projects", label: "Project Lab Guides", icon: Code, badge: `${projects.length || 0} builds` },
                { id: "chat", label: "AI Coach Chatbot", icon: MessageSquare, badge: "AI Ready" },
                { id: "market", label: "Market Intelligence", icon: TrendingUp, badge: null },
                { id: "interview", label: "Mock Interviews", icon: GraduationCap, badge: null },
                { id: "cv", label: "ATS CV Optimizer", icon: FileText, badge: null },
                { id: "community", label: "Accountability Cohorts", icon: Users, badge: "Join" },
              ].map((item) => {
                const IconComp = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 text-left rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isSelected 
                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? "text-teal-400" : "text-zinc-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded-md ${isSelected ? "bg-teal-500 text-black font-bold" : "bg-zinc-800 text-zinc-400"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Profile metadata summary */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-850/60 rounded-xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">MY ACTIVE PROFILE</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-zinc-800/40 pb-1.5 text-zinc-400">
                <span>Selected Focus:</span>
                <span className="font-semibold text-zinc-100 truncate max-w-[140px]">{profile.targetRoles.join(", ")}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/40 pb-1.5 text-zinc-400">
                <span>Proficiency:</span>
                <span className="font-semibold text-teal-400">{profile.experienceLevel}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/40 pb-1.5 text-zinc-400">
                <span>Daily bandwidth:</span>
                <span className="font-semibold text-zinc-100">{profile.availableTime}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Location:</span>
                <span className="font-semibold text-zinc-100 truncate max-w-[140px]">{profile.country}</span>
              </div>
            </div>

            {/* Quick Skill list inventory display inside card */}
            <div className="pt-2 border-t border-zinc-800/60 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">LOCAL SKILLS INVENTORY</span>
              <div className="flex flex-wrap gap-1 pt-1 max-h-[80px] overflow-y-auto">
                {profile.existingSkills.map(sk => (
                  <span key={sk} className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[10px] text-zinc-300">
                    {sk}
                  </span>
                ))}
              </div>
              
              {/* Form to quickly add skill and recalculate gap */}
              <form onSubmit={handleQuickAddSkill} className="flex gap-1 pt-2">
                <input 
                  type="text" 
                  placeholder="Add skill..." 
                  value={manualSkillInput}
                  onChange={(e) => setManualSkillInput(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 p-1 rounded text-[10px] w-full focus:outline-none focus:border-teal-500"
                />
                <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 px-2 rounded text-[10px] text-zinc-100">
                  +
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Content Panel (9 Units) */}
        <main className="lg:col-span-9 bg-zinc-900 border border-zinc-850/60 rounded-xl p-6 md:p-8 space-y-6">
          
          {/* ==========================================
             TAB 1: AI ROADMAP VIEW (FEATURE 1)
             ========================================== */}
          {activeTab === "roadmap" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800/80 pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                    {roadmap?.title || "My Structured Career Roadmap"}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Chronological path generated to minimize technical skill barriers. Mark topics completed as you study.
                  </p>
                </div>
                
                {/* Resource filter tools (FEATURE 7) */}
                <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-500 px-2 uppercase">RESOURCES FILTER</span>
                  {(["all", "free", "paid", "fast"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setResourceFilter(mode)}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-md capitalize transition-all ${
                        resourceFilter === mode
                          ? "bg-teal-500 text-black font-bold shadow"
                          : "text-zinc-650 hover:text-zinc-300"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {roadmap?.description && (
                <p className="text-xs text-zinc-400 bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl leading-relaxed">
                  {roadmap.description}
                </p>
              )}

              {/* Dynamic Loading Overlay / Trigger */}
              {loading.roadmap ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-400" />
                  <p className="text-xs font-mono text-zinc-400">Redrafting learning milestones matching active parameters...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {roadmap?.phases.map((phase, pIdx) => (
                    <div key={pIdx} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-950 border border-indigo-900 rounded text-indigo-400">
                          {pIdx + 1}
                        </span>
                        <h3 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">{phase.phaseName}</h3>
                      </div>
                      <p className="text-xs text-zinc-500 ml-8">{phase.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                        {phase.topics.map((topic, tIdx) => {
                          // Check if filters apply to listed resources
                          const filteredResources = topic.resources.filter((res) => {
                            if (resourceFilter === "free") return res.isFree;
                            if (resourceFilter === "paid") return !res.isFree;
                            if (resourceFilter === "fast") return res.type === "Lab" || res.type === "Practice";
                            return true;
                          });

                          return (
                            <div 
                              key={tIdx} 
                              className={`p-4 border rounded-xl space-y-3 transition-colors ${
                                topic.completed 
                                  ? "border-teal-550/30 bg-teal-950/5" 
                                  : "border-zinc-800 bg-zinc-950/30 hover:bg-zinc-950/50"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <h4 className={`text-sm font-bold leading-snug ${topic.completed ? "text-teal-400 line-through" : "text-zinc-200"}`}>
                                    {topic.topicName}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-mono uppercase bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                                      {topic.difficulty}
                                    </span>
                                    <span className="text-[10px] font-mono text-teal-400">
                                      ⏱ {topic.estimatedDuration}
                                    </span>
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                      topic.learningPriorityScore === "critical" ? "bg-rose-950 text-rose-400 border border-rose-900" :
                                      topic.learningPriorityScore === "important" ? "bg-amber-950 text-amber-400 border border-amber-900" : "bg-zinc-800 text-zinc-400"
                                    }`}>
                                      {topic.learningPriorityScore}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => toggleTopicCompletion(pIdx, tIdx)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    topic.completed 
                                      ? "bg-teal-500 border-teal-500 text-black" 
                                      : "border-zinc-800 hover:border-zinc-650 hover:bg-zinc-900 text-zinc-500"
                                  }`}
                                  title="Mark topic as completed"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </div>

                              <p className="text-xs text-zinc-405 leading-relaxed">
                                {topic.description}
                              </p>

                              {/* Dependencies metadata check */}
                              {topic.prerequisites && topic.prerequisites.length > 0 && (
                                <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                                  <span className="text-zinc-600">Requires:</span>
                                  <span className="text-indigo-400 font-semibold">{topic.prerequisites.join(", ")}</span>
                                </div>
                              )}

                              {/* Career Relevance stat widget */}
                              <div className="flex items-center justify-between text-[10px] font-mono border-t border-zinc-800/50 pt-2.5">
                                <span className="text-zinc-500">Career Relevance Score:</span>
                                <span className="font-bold text-indigo-400">{topic.careerRelevanceScore}%</span>
                              </div>

                              {/* Target curated list of resources */}
                              <div className="space-y-1.5 pt-1 border-t border-zinc-800/30">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase block">CURATED LEARNING PATHS:</span>
                                {filteredResources.length === 0 ? (
                                  <p className="text-[10px] text-zinc-500 italic">No resources match applied filter.</p>
                                ) : (
                                  <div className="grid grid-cols-1 gap-1">
                                    {filteredResources.map((res, rIdx) => (
                                      <a
                                        key={rIdx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 px-1.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-700/80 rounded text-[10px] flex items-center justify-between text-zinc-300 transition-colors"
                                      >
                                        <div className="flex items-center gap-1.5 truncate">
                                          <BookOpen className="w-3 h-3 text-teal-400 shrink-0" />
                                          <span className="truncate">{res.title}</span>
                                          <span className="text-[8px] font-mono text-zinc-550 border border-zinc-800 px-1 py-0.1 select-none uppercase">
                                            {res.type}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[8px] text-zinc-450 shrink-0">
                                          <span>{res.isFree ? "Free" : "Premium"}</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={() => triggerRoadmapGeneration(profile)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 rounded-lg text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all text-zinc-200"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" /> Regenerate Roadmap using AI
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
             TAB 2: SKILL GAP DASHBOARD (FEATURE 2)
             ========================================== */}
          {activeTab === "gap" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800/80 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                  Skill Gap Audit Dashboard
                </h2>
                <p className="text-xs text-zinc-400">
                  Contrast current baseline competencies relative to {profile.targetRoles[0] || "Target Roles"} standards.
                </p>
              </div>

              {loading.gap ? (
                <div className="py-20 text-center space-y-3 animate-pulse">
                  <Layers className="w-8 h-8 animate-bounce mx-auto text-teal-400" />
                  <p className="text-xs font-mono text-zinc-400">Evaluating resume parameters relative to modern production roles...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Gauge metrics and strengths breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-zinc-950/50 border border-zinc-800 rounded-xl flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-450 mb-3">CAREER READINESS SCORE</span>
                      
                      <div className="relative flex items-center justify-center">
                        <svg className="w-28 h-28 transform -rotate-90">
                          {/* Radial Background */}
                          <circle cx="56" cy="56" r="48" stroke="#18181b" strokeWidth="8" fill="none" />
                          {/* Radial Value */}
                          <circle 
                            cx="56" 
                            cy="56" 
                            r="48" 
                            stroke="#0ea5e9" 
                            strokeWidth="8" 
                            fill="none" 
                            strokeDasharray={2 * Math.PI * 48}
                            strokeDashoffset={2 * Math.PI * 48 * (1 - (gapAnalysis?.readinessScore || 35) / 100)}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-2xl font-bold text-white">{gapAnalysis?.readinessScore || 35}%</span>
                          <span className="text-[9px] font-mono text-zinc-500 block">READY</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-500 font-mono mt-4">Calculated based on 14 standard metrics</p>
                    </div>

                    <div className="md:col-span-2 p-5 bg-zinc-950/20 border border-zinc-800 rounded-xl space-y-3">
                      <h3 className="font-bold text-xs font-mono tracking-wider text-teal-400 uppercase flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4 text-teal-400 shrink-0" /> Strength Core Areas
                      </h3>
                      <div className="space-y-1.5 text-xs">
                        {gapAnalysis?.strengthAreas.map((st, sIdx) => (
                          <div key={sIdx} className="flex gap-2 items-start text-zinc-300">
                            <span className="text-teal-400 font-bold">✔</span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] font-mono uppercase text-rose-400 tracking-wider block mb-1.5">Weakness Gaps Highlighted:</span>
                        <div className="space-y-1 text-xs">
                          {gapAnalysis?.weakAreas.slice(0, 3).map((wk, wIdx) => (
                            <p key={wIdx} className="text-zinc-400/80">• {wk}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Missing vs Known skill groups */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Known Skills List */}
                    <div className="p-5 bg-zinc-950/20 border border-zinc-800 rounded-xl space-y-3">
                      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-zinc-800/80 pb-2">
                        KNOWN & VERIFIED SKILLS ({gapAnalysis?.knownSkills.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                        {gapAnalysis?.knownSkills.map((sk) => (
                          <div key={sk.name} className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-900 rounded-lg text-xs">
                            <span className="font-semibold text-zinc-200">{sk.name}</span>
                            <div className="flex items-center gap-1.5 font-mono text-teal-400 text-[10px]">
                              <span>Confidence:</span>
                              <span className="font-bold">{sk.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missing Gaps List */}
                    <div className="p-5 bg-zinc-950/20 border border-zinc-855 rounded-xl space-y-3">
                      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-zinc-800/80 pb-2">
                        IDENTIFIED PATHWAY GAPS ({gapAnalysis?.missingSkills.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                        {gapAnalysis?.missingSkills.map((sk) => (
                          <div key={sk.name} className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-900 rounded-lg text-xs">
                            <span className="font-semibold text-zinc-200">{sk.name}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono leading-none rounded-md font-bold uppercase ${
                              sk.urgency === "High" ? "bg-rose-950 text-rose-400 border border-rose-900" :
                              sk.urgency === "Medium" ? "bg-amber-950 text-amber-400 border border-amber-900" :
                              "bg-indigo-950 text-indigo-400 border border-indigo-900"
                            }`}>
                              {sk.urgency} Urgency
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Immediate Action Steps */}
                  <div className="p-5 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-200">
                      AI Gap Remediation Recommendation:
                    </h3>
                    <div className="space-y-2">
                      {gapAnalysis?.nextSteps.map((stepText, i) => (
                        <div key={i} className="flex gap-3 text-xs leading-relaxed text-zinc-400">
                          <span className="text-teal-400 font-mono font-bold">0{i+1}.</span>
                          <span>{stepText}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manual Input to trigger re-analysis */}
                  <div className="p-5 bg-zinc-950/20 border border-zinc-800 rounded-xl space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                        Paste LinkedIn profile or Resume content to re-evaluate
                      </h3>
                      <p className="text-[11px] text-zinc-550">
                        Paste text to analyze exact ATS keywords, missing certifications, or unrecorded project work to recalculate readiness.
                      </p>
                    </div>

                    <textarea
                      rows={5}
                      placeholder="Paste your resume, LinkedIn copy, or detailed skills lists..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs focus:outline-none focus:border-teal-500 text-zinc-100"
                      value={typedResume}
                      onChange={(e) => setTypedResume(e.target.value)}
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={() => triggerGapAnalysis(profile)}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold rounded-lg flex items-center gap-1 transition-transform"
                      >
                        Recalculate Gap Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
             TAB 3: DAILY PLAANER GRID (FEATURE 3)
             ========================================== */}
          {activeTab === "planner" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800/80 pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                    Daily Study Planner
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Adaptive calendar automatically balancing learning load based on complete state and timezone constraints.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500">Bandwidth:</span>
                  <span className="text-xs font-bold font-mono text-teal-400 bg-teal-950/40 border border-teal-900 px-2 py-0.5 rounded">
                    {profile.availableTime} Target
                  </span>
                </div>
              </div>

              {/* Missed Day Recalibration tool widget */}
              <div className="p-4 bg-purple-950/15 border border-purple-900/40 rounded-xl space-y-3">
                <div className="flex gap-2.5 items-start">
                  <Clock className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-zinc-200">Adaptive Calendar Shift (Time Balance Protection)</h3>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Did you run behind, experience career interruptions, or miss study slots? Our model dynamically calibrates the remaining weekly distribution list instead of resetting your plan progress.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2 border-t border-purple-900/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Days missed recently:</span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setMissedDaysCount(m => Math.max(0, m - 1))}
                        className="px-2 py-1 bg-zinc-950 border border-zinc-800 text-xs rounded text-zinc-300 font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-zinc-200 font-bold w-6 text-center">{missedDaysCount}</span>
                      <button 
                        onClick={() => setMissedDaysCount(m => Math.min(7, m + 1))}
                        className="px-2 py-1 bg-zinc-950 border border-zinc-800 text-xs rounded text-zinc-300 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerScheduleGeneration(profile, missedDaysCount)}
                    disabled={loading.schedule}
                    className="px-3.5 py-1.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading.schedule ? "animate-spin" : ""}`} /> Calibrate Plan Schedules
                  </button>
                </div>
              </div>

              {studyPlan?.rebalancedReasoning && (
                <p className="text-xs italic bg-zinc-950/40 p-3.5 border border-zinc-800 rounded-lg text-zinc-405 leading-relaxed">
                  <strong className="text-purple-400 font-sans uppercase text-[10px] block mb-1">AI CALIBRATION STRATEGY:</strong>
                  {studyPlan.rebalancedReasoning}
                </p>
              )}

              {loading.schedule ? (
                <div className="py-20 text-center animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-400 mb-3" />
                  <p className="text-xs font-mono text-zinc-400">Redistributing learning timesheets...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyPlan?.schedule.map((dayPlan, idx) => (
                    <div key={idx} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2 mb-2">
                          <span className="font-bold text-sm tracking-wide text-zinc-100">{dayPlan.day}</span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            ⏱ {dayPlan.tasks.reduce((acc, current) => acc + current.durationMinutes, 0)} total mins
                          </span>
                        </div>

                        <div className="space-y-2">
                          {dayPlan.tasks.map((task, tIdx) => (
                            <div 
                              key={tIdx} 
                              className={`p-2 rounded-lg border text-xs transition-colors ${
                                task.completed
                                  ? "bg-teal-950/15 border-teal-500/20 text-zinc-400"
                                  : "bg-zinc-950 border-zinc-900 text-zinc-200"
                              }`}
                            >
                              <div className="flex items-start gap-2 justify-between">
                                <div className="space-y-1">
                                  <p className={`font-semibold ${task.completed ? "line-through text-zinc-500" : ""}`}>
                                    {task.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-[9px] font-mono">
                                    <span className="text-teal-400 font-semibold">{task.durationMinutes} mins</span>
                                    <span className="text-zinc-550 border border-zinc-805 px-1 rounded uppercase">
                                      {task.activityType}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    const updated = { ...studyPlan };
                                    const t = updated.schedule[idx].tasks[tIdx];
                                    t.completed = !t.completed;
                                    setStudyPlan(updated);
                                    localStorage.setItem("career_schedule_data", JSON.stringify(updated));
                                  }}
                                  className={`p-1 rounded ${task.completed ? "bg-teal-500 text-black" : "text-zinc-650 hover:text-white"}`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <p className="text-[10px] text-zinc-500 mt-1.5 leading-snug">Focus: {task.focus}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 text-center border-t border-zinc-900 mt-3">
                        <span className="text-[9px] font-mono text-zinc-600 block">DAILY SLOTS MATCHED</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
             TAB 4: PORTFOLIO PROJECTS PANEL (FEATURE 4)
             ========================================== */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800/80 pb-4">
                <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                  Practical Portfolio Build Recipes
                </h2>
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  Recommending real hands-on systems designed to maximize ATS keyword scores and portfolio GitHub ratings.
                </p>
              </div>

              {loading.projects ? (
                <div className="py-20 text-center animate-pulse">
                  <Code className="w-8 h-8 animate-spin text-teal-400 mx-auto mb-3" />
                  <p className="text-xs font-mono text-zinc-400">Constructing interactive blueprints and code setups...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-zinc-800/60 pb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm tracking-wide text-zinc-100">{proj.title}</h3>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                              proj.portfolioValue === "High" ? "bg-indigo-950 text-indigo-400 border border-indigo-900" : "bg-zinc-850 text-zinc-450"
                            }`}>
                              {proj.portfolioValue} ATS Value
                            </span>
                          </div>
                          <p className="text-xs text-zinc-405 leading-relaxed">{proj.learningOutcome}</p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <span className="text-[10px] font-mono bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-zinc-400">
                            {proj.difficulty}
                          </span>
                          <span className="text-[10px] font-mono text-teal-400 bg-zinc-950 border border-zinc-850 px-2 py-1 rounded">
                            ⏱ {proj.estimatedDuration}
                          </span>
                        </div>
                      </div>

                      {/* Required skills catalog list */}
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Skills exercised:</span>
                        <div className="flex flex-wrap gap-1">
                          {proj.requiredSkills.map((sk) => (
                            <span key={sk} className="bg-zinc-955 border border-zinc-805 text-[10px] font-semibold px-2 py-0.5 rounded text-zinc-400">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Step-by-Step interactive manual blueprint guides */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-teal-400 font-bold block uppercase tracking-wider">
                          BUILD ROADMAP SEQUENCE STEPS:
                        </span>
                        
                        <div className="relative border-l border-zinc-800 ml-2.5 pl-4 space-y-3 text-xs leading-relaxed">
                          {proj.steps.map((st, sIdx) => (
                            <div key={sIdx} className="relative">
                              <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-zinc-900" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold">STAGE {sIdx+1}</span>
                                <p className="text-zinc-300">{st}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-zinc-950/20 border border-zinc-805 rounded-xl text-center">
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                      <strong>Need custom labs?</strong> Ask the Coach chatbot in the next tab to generate a custom step-by-step home lab layout matching your exact VM setups.
                    </p>
                    <button
                      onClick={() => triggerProjectRecommendations(profile)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-xs font-semibold rounded-lg flex items-center gap-1.5 mx-auto transition-transform"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" /> Regenerate Interactive Lab Projects
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
             TAB 5: CAREER COACH CHATBOT (FEATURE 5)
             ========================================== */}
          {activeTab === "chat" && (
            <div className="space-y-5 flex flex-col h-[560px]">
              <div className="border-b border-zinc-800/80 pb-3 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white mb-0.5">
                    AI Career Coach Assistant
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Your persistent virtual mentor. Tailoring explanations directly to your background data dynamically.
                  </p>
                </div>
                <span className="w-2 h-2 rounded-full bg-teal-400 border border-zinc-900 animate-pulse shrink-0" />
              </div>

              {/* Chat conversations trail container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 p-2 bg-zinc-950/40 rounded-xl border border-zinc-850">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={msg.id || idx} 
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-teal-500 text-black font-semibold rounded-tr-none" 
                        : "bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-tl-none whitespace-pre-wrap"
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-[8px] font-mono block mt-1.5 text-right ${
                        msg.role === "user" ? "text-zinc-800" : "text-zinc-550"
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                
                {loading.chat && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 mr-auto w-fit animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin text-teal-400" />
                    <span>Coach is drafting response...</span>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Form submission */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2 shrink-0 pt-2 border-t border-zinc-800">
                <input
                  type="text"
                  placeholder="Ask any questions (e.g., 'What order should I learn Docker?', 'Why does Kubernetes need Docker?')"
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-teal-500 rounded-xl p-3 text-xs focus:outline-none transition-colors text-zinc-100 placeholder-zinc-550"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading.chat || !chatInput.trim()}
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0 shadow shadow-teal-500/10"
                >
                  Ask AI
                </button>
              </form>

              {/* Recommended templates inside chat */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] shrink-0">
                <span className="text-zinc-550 flex items-center font-mono uppercase tracking-wider select-none shrink-0">Try Asking:</span>
                {[
                  "What should I learn after Linux?",
                  "Explain Docker in simple plain terms",
                  "Suggest certifications for SOC SOC Team entry",
                  "Review standard salary patterns of AWS administrators",
                ].map((promptIdea, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setChatInput(promptIdea);
                    }}
                    className="p-1 px-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-650 hover:bg-zinc-800 shadow rounded text-zinc-400 hover:text-zinc-100 transition-colors"
                  >
                    "{promptIdea}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
             TAB 6: JOB MARKET INTELLIGENCE (FEATURE 6)
             ========================================== */}
          {activeTab === "market" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-800/80 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                    Job Market Intelligence Analytics
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Real-time aggregated industry metrics matching the "{marketTrends?.roleName || "Target role"}" profile.
                  </p>
                </div>

                <div className="flex gap-2">
                  <select 
                    className="bg-zinc-950 border border-zinc-800 p-1.5 rounded text-xs text-zinc-300"
                    onChange={(e) => triggerMarketTrends(e.target.value)}
                    value={marketTrends?.roleName || "Security Engineer"}
                  >
                    {profile.targetRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading.trends ? (
                <div className="py-20 text-center animate-pulse">
                  <TrendingUp className="w-8 h-8 animate-spin text-teal-400 mx-auto mb-3" />
                  <p className="text-xs font-mono text-zinc-400">Sifting global listings datasets...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Salary guidelines widget */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { tier: "Junior / Entry Level", amount: marketTrends?.salaryLevel.entry || "$75,000" },
                      { tier: "Mid-Career Standard", amount: marketTrends?.salaryLevel.mid || "$115,000" },
                      { tier: "Senior Team Architect", amount: marketTrends?.salaryLevel.senior || "$168,000+" },
                    ].map((sal, i) => (
                      <div key={i} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{sal.tier}</span>
                        <p className="text-lg font-bold text-teal-400">{sal.amount}</p>
                        <span className="text-[9px] text-zinc-650 block">Yearly baseline range guide</span>
                      </div>
                    ))}
                  </div>

                  {/* Skills frequency diagram (D3 styled interactive mockup utilizing raw SVG geometry mapping) */}
                  <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      AGGREGATED TECHNICAL SKILL REQUISITION VALUE DEMAND (%)
                    </h3>
                    
                    <div className="space-y-3.5">
                      {marketTrends?.skillsDemand.map((stat, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs text-zinc-350">
                            <span className="font-semibold text-zinc-200">{stat.skillName}</span>
                            <span className="font-mono text-teal-400 font-bold">{stat.demandPercentage}% of vacancy specs</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-850">
                            <div 
                              className="h-full bg-gradient-to-r from-teal-500 to-indigo-550 transition-all duration-700" 
                              style={{ width: `${stat.demandPercentage}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trending tools & package systems list */}
                    <div className="p-5 bg-zinc-950/20 border border-zinc-800 rounded-xl space-y-3">
                      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-zinc-800/80 pb-2">
                        TRENDING SECURITY & TOOL STACKS
                      </h3>
                      <div className="space-y-3">
                        {marketTrends?.trendingTools.map((tool, i) => (
                          <div key={i} className="space-y-1">
                            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                              {tool.name}
                            </span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed pl-3">{tool.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Emerging tech paradigms */}
                    <div className="p-5 bg-zinc-950/20 border border-zinc-800 rounded-xl space-y-3">
                      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-zinc-800/80 pb-2">
                        EMERGING DOMAINS FOR SPECIALISTS (AI RESISTANT)
                      </h3>
                      <div className="space-y-2">
                        {marketTrends?.emergingSkills.map((ems, i) => (
                          <div key={i} className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs font-semibold text-teal-400">
                            🚀 {ems}
                          </div>
                        ))}
                      </div>

                      {/* Location hotspots lists */}
                      <div className="pt-3 space-y-2.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">GEOGRAPHIC VACANCY INDEX:</span>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {marketTrends?.locationDemand.map((loc, i) => (
                            <span key={i} className="p-1 px-2 border border-zinc-850 bg-zinc-950 rounded-lg text-zinc-300">
                              <MapPin className="w-3 h-3 text-indigo-400 inline shrink-0 mr-1" />
                              {loc.city} <strong className="text-teal-400 uppercase font-mono ml-1 text-[9px]">({loc.index})</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
             TAB 7: MOCK INTERVIEW SYSTEMS (FEATURE 9)
             ========================================== */}
          {activeTab === "interview" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800/80 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                    AI Tech Mock Interview Suite
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Draft customized role scenario questions, submit answers, and receive graded rubrics covering depth + clarity.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">Active:</span>
                  <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/40 border border-teal-900 px-2 py-0.5 rounded uppercase">
                    {profile.targetRoles[0] || "Security"} Standard
                  </span>
                </div>
              </div>

              {/* Generate Config Box */}
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                <h3 className="text-xs font-mono text-zinc-350 uppercase tracking-wider font-bold">
                  LAUNCH NEW PRACTICE SESSION
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-450 mb-2">TARGET ROLE TOPIC MATCH</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500 rounded-lg p-2.5 text-xs text-zinc-100"
                      value={interviewTopic}
                      onChange={(e) => setInterviewTopic(e.target.value)}
                      placeholder="e.g. Linux OS or Cloud IAM"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-450 mb-2">MCQ OR OPEN TECH SCENARIOS</label>
                    <select
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 p-2.5 rounded-lg text-xs"
                      value={interviewMode}
                      onChange={(e) => setInterviewMode(e.target.value as any)}
                    >
                      <option value="Technical">Technical Open - Ended</option>
                      <option value="Scenario">Real-Time Scenario Crisis</option>
                      <option value="MCQ">Standard Choice Question (MCQ)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={triggerGenerateInterview}
                      disabled={loading.interview}
                      className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-transform"
                    >
                      <Plus className="w-4 h-4" /> {loading.interview ? "Compiling..." : "Generate Interview Session"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Display generated interview question list */}
              {activeInterviewQuestions.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-bold text-xs uppercase text-teal-400 tracking-wider">
                    QUESTIONS FOR SESSION: ({activeInterviewQuestions.length})
                  </h3>

                  <div className="space-y-4">
                    {activeInterviewQuestions.map((q, idx) => {
                      const [ansInput, setAnsInput] = useState("");

                      return (
                        <div key={q.id || idx} className="p-5 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-4">
                          <div className="flex gap-2">
                            <span className="text-[10px] font-mono text-zinc-500 shrink-0 font-bold">Q{idx + 1}.</span>
                            <p className="text-xs text-zinc-200 font-semibold">{q.text}</p>
                          </div>

                          {/* Render MCQ choices if present */}
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = q.correctOptionIndex === oIdx;
                                const isSelected = q.userAnswer === opt;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => {
                                      // Log completion state instantly
                                      const updated = [...activeInterviewQuestions];
                                      updated[idx].userAnswer = opt;
                                      
                                      // Stub static evaluation metrics matching MCQ selections
                                      updated[idx].feedback = {
                                        accuracy: isCorrect ? 100 : 0,
                                        clarityScore: 100,
                                        technicalDepthScore: 100,
                                        feedback: isCorrect 
                                          ? "Correct! Great understanding of the technical principle here."
                                          : `Incorrect choice. The right answer is: ${q.options[q.correctOptionIndex]}`,
                                        suggestions: isCorrect ? ["Well done, proceed."] : ["Review foundational TCP guidelines."],
                                      };
                                      setActiveInterviewQuestions(updated);
                                    }}
                                    className={`p-2.5 text-left border rounded-lg text-[11px] transition-all ${
                                      isSelected
                                        ? isCorrect ? "bg-teal-950/20 border-teal-500/50 text-teal-400" : "bg-rose-955/20 border-rose-500/50 text-rose-400"
                                        : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Render Text Area for technical questions */}
                          {(!q.options || q.options.length === 0) && !q.feedback && (
                            <div className="space-y-3 pl-6">
                              <textarea
                                rows={3}
                                placeholder="Type your detailed candidate technical response here..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                                value={ansInput}
                                onChange={(e) => setAnsInput(e.target.value)}
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleEvaluateAnswer(q.id, ansInput)}
                                  disabled={!ansInput.trim()}
                                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg flex items-center gap-1.5 text-zinc-200 transition-colors"
                                >
                                  Submit & Evaluate Response
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Display Graded evaluation feedback directly beneath question */}
                          {q.feedback && (
                            <div className="ml-6 p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3">
                              <div className="flex flex-wrap items-center gap-4 border-b border-zinc-900 pb-2">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider">AI EVALUATION FEEDBACK CRITIQUE SCORECARD:</span>
                                
                                <div className="flex gap-3 text-xs font-mono ml-auto">
                                  <span className="text-teal-400">Accuracy: <strong className="font-bold">{q.feedback.accuracy}%</strong></span>
                                  <span className="text-indigo-400">Clarity: <strong className="font-bold">{q.feedback.clarityScore}%</strong></span>
                                  <span className="text-purple-400">Depth: <strong className="font-bold">{q.feedback.technicalDepthScore}%</strong></span>
                                </div>
                              </div>

                              <p className="text-xs text-zinc-405 leading-relaxed">
                                {q.feedback.feedback}
                              </p>

                              {q.feedback.suggestions && q.feedback.suggestions.length > 0 && (
                                <div className="pt-2 space-y-1 text-xs text-zinc-450 border-t border-zinc-900">
                                  <strong className="text-[11px] text-zinc-350 block">Next step suggestions for technical review:</strong>
                                  {q.feedback.suggestions.map((s, sIdx) => (
                                    <p key={sIdx}>✔ {s}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
             TAB 8: ATS RESUME OPTIMIZER (FEATURE 10)
             ========================================== */}
          {activeTab === "cv" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800/80 pb-4">
                <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                  ATS Resume & STAR Metric Optimizer
                </h2>
                <p className="text-xs text-zinc-400">
                  Contrast candidate CV layouts relative to automated software benchmarks. Review STAR structured metrics.
                </p>
              </div>

              {resumeFileError && (
                <div className="p-3 bg-rose-950/20 text-rose-450 border border-rose-900 text-xs rounded-lg">
                  {resumeFileError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">COPY & PASTE RESUME CONTENT TEXT BOX</label>
                  <textarea
                    rows={8}
                    placeholder="John Doe&#10;Software Engineer&#10;Skills: Git, Python, Linux Basics&#10;Work: Worked on setting up bash files and automation commands."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs focus:outline-none focus:border-teal-500 text-zinc-100 placeholder-zinc-700"
                    value={typedResume}
                    onChange={(e) => setTypedResume(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center bg-zinc-950/40 border border-zinc-800 p-4 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <FileCheck className="w-5 h-5 text-teal-400 shrink-0" />
                    <span>ATS scanner matches requirements for: <strong>{profile.targetRoles[0]}</strong></span>
                  </div>
                  <button
                    onClick={triggerResumeOptimization}
                    disabled={loading.resume}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold rounded-lg transition-transform"
                  >
                    {loading.resume ? "Assessing..." : "Audit CV Keywords"}
                  </button>
                </div>
              </div>

              {/* Optimization advice blocks */}
              {resumeOptimization && (
                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Score badge */}
                    <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col justify-center items-center text-center">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2">ESTIMATED ATS COMPATIBILITY RATIO</span>
                      <span className="text-4xl font-black text-teal-400">{resumeOptimization.atsCompatibilityScore}%</span>
                      <span className="text-[10px] text-zinc-450 mt-1 font-mono">Passing baseline is 75%</span>
                    </div>

                    <div className="md:col-span-2 p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                      <h3 className="font-bold text-xs uppercase text-zinc-200">ATS Keyword Screening Coverage:</h3>
                      <div className="flex flex-wrap gap-2">
                        {resumeOptimization.keywordCoverage.map((chk, i) => (
                          <span 
                            key={i} 
                            className={`p-1 px-2 text-[10px] rounded border font-mono ${
                              chk.found 
                                ? "bg-teal-950/20 border-teal-800/40 text-teal-400" 
                                : "bg-zinc-900 border-zinc-800 text-zinc-500"
                            }`}
                          >
                            {chk.found ? "✔" : "✖"} {chk.keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Missing key technologies matching role standards */}
                  <div className="p-5 bg-zinc-950/20 border border-zinc-800 rounded-xl space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-zinc-805 pb-2">
                      MISSING STRATEGIC TECHNOLOGIES DECLARED IN STANDARD PATHS
                    </h3>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {resumeOptimization.missingSkills.map((sk) => (
                        <span key={sk} className="p-1 px-2.5 bg-rose-950/10 border border-rose-900/40 text-rose-450 text-[10px] rounded-lg">
                          ✖ {sk}
                        </span>
                      ))}
                    </div>

                    {/* Recommend builders to bridge gaps */}
                    <p className="text-[11px] text-zinc-500 leading-relaxed pt-2">
                      <strong>Gap Bridge project advice:</strong> {resumeOptimization.projectSuggestions.join(", ")}
                    </p>
                  </div>

                  {/* STAR rewrite suggestions */}
                  <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                    <h3 className="text-xs font-mono text-teal-400 uppercase tracking-widest font-bold">
                      RE-WRITE RECOMMENDATIONS (METRIC STAR RECTIFICATION)
                    </h3>

                    <div className="space-y-4 text-xs">
                      {resumeOptimization.bulletImprovements.map((imp, idx) => (
                        <div key={idx} className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-rose-500 uppercase block">User Original bullet:</span>
                            <p className="italic text-zinc-500">"{imp.original}"</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-teal-400 uppercase block">STAR format corrected:</span>
                            <p className="font-semibold text-zinc-200 bg-zinc-900 p-2 rounded">"{imp.improved}"</p>
                          </div>

                          <p className="text-[10px] text-zinc-450 leading-relaxed pl-1">
                            <strong>Rationale:</strong> {imp.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
             TAB 9: ACCOUNTABILITY COHORTS COMMUNITY (FEATURE 11)
             ========================================== */}
          {activeTab === "community" && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800/80 pb-4">
                <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                  Community & Shared Accountability Board
                </h2>
                <p className="text-xs text-zinc-400">
                  Compare anonymous study rates relative to active tech cohorts. Stay focused with virtual peer networks.
                </p>
              </div>

              {/* Daily Challenge Card */}
              <div className="p-5 bg-gradient-to-r from-zinc-900 to-indigo-950 border border-indigo-900/40 rounded-xl space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">COHORT CHALLENGE WEEK ACTIVE:</span>
                  <span className="px-2 py-0.5 bg-indigo-500 text-black text-[9px] font-bold rounded">LIVE</span>
                </div>
                <h3 className="font-bold text-sm text-zinc-100">Setup 3 Dockerized Containers under Linux Host VM</h3>
                <p className="text-zinc-400 text-xs">
                  Join 142 other learners this week. Complete the Linux Basics and Docker segments and share your validation screenshot under the group channels to claim badges.
                </p>
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => {
                      alert("Joined Cohort Challenge! Track progress under elements checklist.");
                    }}
                    className="p-1 px-3 bg-indigo-650 hover:bg-indigo-600 font-bold rounded text-[11px] text-zinc-100 transition-colors"
                  >
                    Accept Challenge
                  </button>
                  <span className="text-zinc-550 border border-zinc-805 px-2 py-1 rounded inline-block">142 joined</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cohort Leaderboard */}
                <div className="p-5 bg-zinc-950/20 border border-zinc-800 rounded-xl space-y-3 text-xs">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-2 flex justify-between items-center">
                    <span>COHORT LEADERS BY STUDY HOURS</span>
                    <span className="text-[9px] text-zinc-550 font-normal">REALTIME UPDATES</span>
                  </h3>

                  <div className="space-y-1.5 pt-1">
                    {[
                      { rank: 1, name: "Maria S. (Penetration Switcher)", hours: 32, badge: "🔥 12d streak" },
                      { rank: 2, name: "David L. (AWS Associate)", hours: 28, badge: "⭐ 9d streak" },
                      { rank: 3, name: "Alex R. (You - Security Target)", hours: 24, badge: "🔥 5d streak", highlight: true },
                      { rank: 4, name: "Hassan K. (DevOps Switcher)", hours: 22, badge: "" },
                      { rank: 5, name: "Kenji T. (Data Analyst Target)", hours: 19, badge: "" },
                    ].map((user, i) => (
                      <div 
                        key={i} 
                        className={`p-2.5 rounded-lg border text-xs flex justify-between items-center ${
                          user.highlight 
                            ? "bg-teal-500/10 border-teal-500/30 text-teal-450" 
                            : "bg-zinc-950 border-zinc-900 text-zinc-350"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-550 w-4">#{user.rank}</span>
                          <span className="font-semibold truncate max-w-[150px]">{user.name}</span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span className="font-bold">{user.hours} hrs</span>
                          {user.badge && <span className="text-orange-400 text-[9px]">{user.badge}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accountability study interest groups */}
                <div className="p-5 bg-zinc-950/20 border border-zinc-800 rounded-xl space-y-3 text-xs">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-450 border-b border-zinc-800 pb-2">
                    ACTIVE PEER STUDY GROUPS
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {[
                      { title: "Kali Linux / Wireshark Labs", members: 48, status: "Active study block: 2 hrs ago" },
                      { title: "AWS Solutions Architect cohort", members: 62, status: "Exam target date: June 15" },
                      { title: "Kubernetes CKAD Preps", members: 31, status: "Weekly call: Saturday 2 PM" },
                    ].map((group, i) => (
                      <div key={i} className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-zinc-100">{group.title}</h4>
                          <span className="text-[9px] font-mono text-zinc-550 bg-zinc-900 px-1.5 py-0.5 rounded">
                            {group.members} members
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{group.status}</p>
                        <button 
                          onClick={() => alert(`Joined ${group.title}! Notifications enabled.`)}
                          className="w-full text-center py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[9px] text-zinc-300 rounded font-semibold"
                        >
                          Join Peer Room
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <footer className="border-t border-zinc-900/60 py-8 bg-zinc-950 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <div>
            &copy; 2026 Career Roadmap Builder • Designed for modern visual precision.
          </div>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="#settings" onClick={() => setActiveTab("roadmap")} className="hover:text-zinc-300 transition-colors">Global Preferences</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
