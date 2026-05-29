import React, { useState } from "react";
import { UserProfile } from "../types";
import { PRESET_ROLES, PRESET_SKILLS } from "../mockData";
import { Compass, Briefcase, Award, CheckSquare, Plus, Clock, Save, Sparkles, ChevronRight, User } from "lucide-react";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

export default function Onboarding({ onComplete, initialProfile }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(
    initialProfile || {
      name: "",
      email: "",
      country: "United States",
      timezone: "EST",
      educationStatus: "Student",
      targetRoles: [],
      experienceLevel: "Beginner",
      existingSkills: [],
      availableTime: "1 hr/day",
      completedTopics: [],
      daysMissedAccumulated: 0,
      streakCount: 1,
    }
  );

  const [customSkill, setCustomSkill] = useState("");

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 5) {
      setStep((s) => s + 1);
    } else {
      onComplete(profile);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const toggleTargetRole = (role: string) => {
    const active = profile.targetRoles.includes(role);
    if (active) {
      updateProfile("targetRoles", profile.targetRoles.filter((r) => r !== role));
    } else {
      updateProfile("targetRoles", [...profile.targetRoles, role]);
    }
  };

  const toggleExistingSkill = (skill: string) => {
    const active = profile.existingSkills.includes(skill);
    if (active) {
      updateProfile("existingSkills", profile.existingSkills.filter((s) => s !== skill));
    } else {
      updateProfile("existingSkills", [...profile.existingSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !profile.existingSkills.includes(customSkill.trim())) {
      updateProfile("existingSkills", [...profile.existingSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  // Extract preset skills that might be relevant to selected roles
  const getRelevantPresetSkills = () => {
    let skills: string[] = [];
    if (profile.targetRoles.some(r => r.includes("Security") || r.includes("SOC") || r.includes("Penetration"))) {
      skills = [...skills, ...PRESET_SKILLS["Security"]];
    }
    if (profile.targetRoles.some(r => r.includes("DevOps") || r.includes("Cloud") || r.includes("SRE"))) {
      skills = [...skills, ...PRESET_SKILLS["DevOps"]];
    }
    if (profile.targetRoles.some(r => r.includes("Analyst") || r.includes("Data"))) {
      skills = [...skills, ...PRESET_SKILLS["Data Analysis"]];
    }
    if (skills.length === 0) {
      skills = PRESET_SKILLS["Software Engineering"];
    }
    return Array.from(new Set(skills));
  };

  return (
    <div className="max-w-3xl mx-auto my-12 p-1 md:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl text-zinc-100">
      
      {/* Step Indicator */}
      <div className="mb-10 px-4 md:px-1">
        <div className="flex justify-between items-center text-xs font-mono tracking-wider text-zinc-400 mb-4">
          <span>STEP {step} OF 5</span>
          <span className="text-teal-400 font-semibold uppercase">{
            step === 1 ? "Basic Info" :
            step === 2 ? "Career Goal" :
            step === 3 ? "Skill Assessment" :
            step === 4 ? "Skills Inventory" : "Availability"
          }</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-500 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="min-h-[380px] p-2 md:p-4">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-teal-950/50 text-teal-400 border border-teal-800/60 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Begin Your Career Ascent</h2>
                <p className="text-sm text-zinc-400">Let's start with standard profile baselines to tailor your path.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-colors"
                  value={profile.name}
                  onChange={(e) => updateProfile("name", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-colors"
                  value={profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">Country</label>
                <input
                  type="text"
                  placeholder="e.g. United States"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-colors"
                  value={profile.country}
                  onChange={(e) => updateProfile("country", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">Timezone</label>
                <input
                  type="text"
                  placeholder="e.g. UTC -5 (EST)"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-colors"
                  value={profile.timezone}
                  onChange={(e) => updateProfile("timezone", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">Current Education / Work Status</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {["Student", "Working Professional", "Career Switcher", "Fresher", "Experienced Professional"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`p-3 text-left border rounded-xl text-xs font-medium transition-all ${
                      profile.educationStatus === status
                        ? "border-teal-500/60 bg-teal-950/20 text-teal-300 shadow-md shadow-teal-500/10"
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/60"
                    }`}
                    onClick={() => updateProfile("educationStatus", status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Goal Career Roles */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-teal-950/50 text-teal-400 border border-teal-800/60 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Select Career Target Roles</h2>
                <p className="text-sm text-zinc-400">Select one or more targets. We'll synchronize a path to reach them.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {PRESET_ROLES.map((role) => {
                const isSelected = profile.targetRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    className={`p-3 border rounded-xl text-xs font-medium text-left transition-all ${
                      isSelected
                        ? "border-teal-500/60 bg-teal-950/20 text-teal-300 shadow-sm shadow-teal-500/10"
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/60"
                    }`}
                    onClick={() => toggleTargetRole(role)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate">{role}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {profile.targetRoles.length === 0 && (
              <p className="text-xs text-rose-400/80 mt-2">Please select at least one target role to generate a blueprint roadmap.</p>
            )}
          </div>
        )}

        {/* Step 3: Skill Level */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-teal-950/50 text-teal-400 border border-teal-800/60 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Access Your Current Expertise</h2>
                <p className="text-sm text-zinc-400">Select your active technical proficiency level. We won't judge!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { level: "Beginner", desc: "No core background, switching careers, or learning first tech fundamentals." },
                { level: "Intermediate", desc: "Familiar with coding logic, basic terminal use, and deploy mechanics." },
                { level: "Advanced", desc: "Strong stack competency, understanding production scale architectures and tools." },
              ].map((item) => (
                <button
                  key={item.level}
                  type="button"
                  className={`p-5 text-left border rounded-xl transition-all flex flex-col justify-between ${
                    profile.experienceLevel === item.level
                      ? "border-teal-500/60 bg-teal-950/20 text-teal-300 shadow-md shadow-teal-500/10"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/60"
                  }`}
                  onClick={() => updateProfile("experienceLevel", item.level)}
                >
                  <div>
                    <h3 className="font-bold text-sm tracking-wide uppercase text-zinc-100 mb-2">{item.level}</h3>
                    <p className="text-xs leading-relaxed text-zinc-400">{item.desc}</p>
                  </div>
                  <span className="w-full text-[10px] font-mono mt-4 block text-zinc-500">SELECT PROFICIENCY</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Existing Skills Inventory */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-teal-950/50 text-teal-400 border border-teal-800/60 rounded-xl">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Existing Skills Inventory</h2>
                <p className="text-sm text-zinc-400">Check off what you already know to skip basic foundation steps.</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">Relevance presets matching your goal roles</p>
              <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto p-1 bg-zinc-950/30 rounded-xl border border-zinc-800/40">
                {getRelevantPresetSkills().map((skill) => {
                  const isSelected = profile.existingSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-all ${
                        isSelected
                          ? "border-teal-500/60 bg-teal-950/30 text-teal-300"
                          : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900"
                      }`}
                      onClick={() => toggleExistingSkill(skill)}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleAddCustomSkill} className="space-y-3 pt-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">Or manually add your own skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. AWS S3, Bash scripting, PowerBI..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-teal-500/50 rounded-lg p-2.5 text-xs focus:outline-none transition-colors text-zinc-100"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg text-xs font-semibold flex items-center gap-1 text-zinc-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>

            {profile.existingSkills.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-mono text-zinc-500 block mb-2">YOUR ACTIVE DECLARED SKILLS ({profile.existingSkills.length}):</span>
                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                  {profile.existingSkills.map((sk) => (
                    <span 
                      key={sk} 
                      className="px-2.5 py-1 bg-zinc-950 border border-zinc-800/80 rounded-md text-[11px] text-zinc-300 flex items-center gap-1.5"
                    >
                      {sk}
                      <button 
                        type="button" 
                        className="text-zinc-500 hover:text-rose-400 text-xs font-bold leading-none"
                        onClick={() => toggleExistingSkill(sk)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Study Time Commitment */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-teal-950/50 text-teal-400 border border-teal-800/60 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Time Availability Plan</h2>
                <p className="text-sm text-zinc-400">How much daily study bandwidth can you support? We'll adapt your planner workload.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                "30 mins/day",
                "1 hr/day",
                "2 hrs/day",
                "weekends only",
                "custom schedule",
              ].map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`p-4 text-center border rounded-xl font-medium transition-all text-xs flex flex-col justify-center items-center gap-3 ${
                    profile.availableTime === time
                      ? "border-teal-500/60 bg-teal-950/20 text-teal-300 shadow-md shadow-teal-500/10"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/60"
                  }`}
                  onClick={() => updateProfile("availableTime", time)}
                >
                  <Clock className={`w-4 h-4 ${profile.availableTime === time ? "text-teal-400" : "text-zinc-500"}`} />
                  <span className="capitalize">{time}</span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl">
              <div className="flex gap-2 text-xs text-zinc-400 leading-relaxed md:items-center">
                <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
                <span>
                  <strong>AI Smart Scheduling Protection:</strong> If you ever run behind or miss days, our internal planner dynamically balances study pacing rather than resetting you, preserving your overall momentum.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-zinc-800/80 flex justify-between items-center px-4 md:px-1">
        <button
          type="button"
          disabled={step === 1}
          className={`px-5 py-2.5 rounded-lg text-xs font-semibold border ${
            step === 1
              ? "border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed"
              : "border-zinc-850 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
          } transition-colors`}
          onClick={handlePrev}
        >
          Previous
        </button>

        <button
          type="button"
          disabled={step === 2 && profile.targetRoles.length === 0}
          className={`px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-teal-500/10 ${
            step === 2 && profile.targetRoles.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleNext}
        >
          {step === 5 ? (
            <>
              <Save className="w-4 h-4" /> Save Profile & Launch Dashboard
            </>
          ) : (
            <>
              Next Step <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
