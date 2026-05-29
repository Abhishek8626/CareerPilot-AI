import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with increased limit for resume processing
app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Google Gemini client to prevent startup crash if API key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in the Secrets panel under Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Global error handler utility for API routes
const handleApiError = (res: express.Response, error: any) => {
  console.error("API Error occurred: ", error);
  res.status(500).json({
    error: error.message || "An unexpected error occurred during AI processing.",
  });
};

/* ==========================================
   API ENDPOINT 1: AI ROADMAP GENERATOR
   ========================================== */
app.post("/api/generate-roadmap", async (req, res) => {
  try {
    const { targetRoles, experienceLevel, existingSkills } = req.body;
    if (!targetRoles || targetRoles.length === 0) {
      return res.status(400).json({ error: "At least one target role is required." });
    }

    const ai = getGeminiClient();
    const prompt = `Generate a comprehensive, highly personalized step-by-step career learning roadmap for an individual targeting the following role(s): ${targetRoles.join(
      ", "
    )}.
Their current experience level is: ${experienceLevel || "Beginner"}.
Their existing known skills are: ${existingSkills && existingSkills.length > 0 ? existingSkills.join(", ") : "None"}.

Make sure to include strict, logical skill dependencies (e.g., Docker requires Linux, Kubernetes requires Docker & YAML, etc.).
Structure the learning path in 3 chronological phases (Foundations, core Security/DevOps/Engineering Skills, and Advanced Topics).
Provide estimated durations in weeks/months, a learning priority level (critical, important, optional), and career relevance scores (out of 100).
For each topic, provide 2 curated study resource suggestions with realistic mock URLs or descriptions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        topicName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        difficulty: { type: Type.STRING, description: "Beginner, Intermediate, or Advanced" },
                        estimatedDuration: { type: Type.STRING },
                        learningPriorityScore: { type: Type.STRING, description: "critical, important, or optional" },
                        careerRelevanceScore: { type: Type.INTEGER, description: "0-100 indicating percentage relevance" },
                        prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
                        resources: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              type: { type: Type.STRING, description: "YouTube, Documentation, Blog, Course, Lab, or Practice" },
                              title: { type: Type.STRING },
                              url: { type: Type.STRING },
                              isFree: { type: Type.BOOLEAN },
                            },
                            required: ["type", "title", "url", "isFree"],
                          },
                        },
                      },
                      required: [
                        "topicName",
                        "description",
                        "difficulty",
                        "estimatedDuration",
                        "learningPriorityScore",
                        "careerRelevanceScore",
                        "prerequisites",
                        "resources",
                      ],
                    },
                  },
                },
                required: ["phaseName", "description", "topics"],
              },
            },
          },
          required: ["title", "description", "phases"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    handleApiError(res, err);
  }
});

/* ==========================================
   API ENDPOINT 2: SKILL GAP ANALYSIS
   ========================================== */
app.post("/api/analyze-gap", async (req, res) => {
  try {
    const { targetRole, resumeText, existingSkills } = req.body;
    if (!targetRole) {
      return res.status(400).json({ error: "targetRole is required." });
    }

    const ai = getGeminiClient();
    const prompt = `Perform a comprehensive skill gap analysis for a candidate aiming to become a ${targetRole}.
Analyze the following input details:
- Manual skills checklist: ${existingSkills && existingSkills.length > 0 ? existingSkills.join(", ") : "None declared"}
- Resume content / LinkedIn profile: ${resumeText || "No resume uploaded"}

Identify:
1. Known Skills (strengths with confidence score %).
2. Missing Skills (gaps, graded with urgency 'High', 'Medium', or 'Low').
3. Weak Areas.
4. Strength Areas.
5. Overall Readiness Percentage (e.g. 0 to 100).
6. Next actionable steps.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readinessScore: { type: Type.INTEGER },
            knownSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  confidence: { type: Type.INTEGER },
                },
                required: ["name", "confidence"],
              },
            },
            missingSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  urgency: { type: Type.STRING, description: "High, Medium, or Low" },
                },
                required: ["name", "urgency"],
              },
            },
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengthAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["readinessScore", "knownSkills", "missingSkills", "weakAreas", "strengthAreas", "nextSteps"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    handleApiError(res, err);
  }
});

/* ==========================================
   API ENDPOINT 3: DAILY STUDY PLANNER
   ========================================== */
app.post("/api/generate-schedule", async (req, res) => {
  try {
    const { availableTime, selectedTopics, daysMissed } = req.body;
    if (!selectedTopics || selectedTopics.length === 0) {
      return res.status(400).json({ error: "At least one learning topic is required." });
    }

    const ai = getGeminiClient();
    const prompt = `Create an elegant, highly adaptive weekly study planner.
User specifications:
- Available study time limit: ${availableTime || "1 hr/day"}
- Selected topics to focus on: ${selectedTopics.join(", ")}
- Days subsequently missed context: ${daysMissed || 0} days missed.

Smart recalibration behavior:
- If the user missed days, don't penalize them or reset to Day 1. Instead, dynamically redistribute the workload across the rest of the week, reducing intensity slightly if needed, keeping under their standard daily limit to avoid burnout.
- Schedule tasks from Monday through Sunday. Provide theory study, hands-on lab sessions, and quick revision elements.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rebalancedReasoning: { type: Type.STRING, description: "Brief overview explaining how the schedule was calibrated to fit available time or adjust for missed days." },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        focus: { type: Type.STRING },
                        activityType: { type: Type.STRING, description: "Theory, Lab, or Revision" },
                      },
                      required: ["title", "durationMinutes", "focus", "activityType"],
                    },
                  },
                },
                required: ["day", "tasks"],
              },
            },
          },
          required: ["rebalancedReasoning", "schedule"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    handleApiError(res, err);
  }
});

/* ==========================================
   API ENDPOINT 4: PROJECT RECOMMENDATION ENGINE
   ========================================== */
app.post("/api/recommend-projects", async (req, res) => {
  try {
    const { targetRoles, skills } = req.body;
    if (!targetRoles || targetRoles.length === 0) {
      return res.status(400).json({ error: "targetRoles is required." });
    }

    const ai = getGeminiClient();
    const prompt = `Recommend 4 practical, portfolio-building projects matching target roles: ${targetRoles.join(
      ", "
    )} and based on known skills: ${skills && skills.length > 0 ? skills.join(", ") : "None declared yet"}.
Generate projects categorized clearly across different difficulty levels (e.g., 1 Beginner, 2 Intermediate, 1 Advanced).
Each project must provide:
- High, Medium, or Low GitHub portfolio value.
- Clear required skills.
- Core learning outcome.
- Detailed step-by-step implementation roadmap stages (4 logical steps).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              difficulty: { type: Type.STRING, description: "Beginner, Intermediate, or Advanced" },
              estimatedDuration: { type: Type.STRING },
              requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              learningOutcome: { type: Type.STRING },
              portfolioValue: { type: Type.STRING, description: "High, Medium, or Low" },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["title", "difficulty", "estimatedDuration", "requiredSkills", "learningOutcome", "portfolioValue", "steps"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    res.json(data);
  } catch (err: any) {
    handleApiError(res, err);
  }
});

/* ==========================================
   API ENDPOINT 5: JOB MARKET INTELLIGENCE
   ========================================== */
app.post("/api/market-trends", async (req, res) => {
  try {
    const { targetRole } = req.body;
    if (!targetRole) {
      return res.status(400).json({ error: "targetRole is required." });
    }

    const ai = getGeminiClient();
    const prompt = `Provide the latest analyzed job market trend intelligence for the career role: "${targetRole}".
Analyze typical demand patterns (e.g. from global job aggregators like LinkedIn/Indeed/Careers).
Output:
1. Top requested skills and technologies with estimated demand percentages (%).
2. Trending tools or tech stacks with detailed rationale.
3. Emerging skills to prioritize.
4. Competitive salary indicator ranges (Entry, Mid, Senior).
5. High-demand regions or hubs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roleName: { type: Type.STRING },
            skillsDemand: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skillName: { type: Type.STRING },
                  demandPercentage: { type: Type.INTEGER },
                },
                required: ["skillName", "demandPercentage"],
              },
            },
            trendingTools: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["name", "reason"],
              },
            },
            emergingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            salaryLevel: {
              type: Type.OBJECT,
              properties: {
                entry: { type: Type.STRING },
                mid: { type: Type.STRING },
                senior: { type: Type.STRING },
              },
              required: ["entry", "mid", "senior"],
            },
            locationDemand: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  city: { type: Type.STRING },
                  index: { type: Type.STRING, description: "High, Medium, or Low" },
                },
                required: ["city", "index"],
              },
            },
          },
          required: ["roleName", "skillsDemand", "trendingTools", "emergingSkills", "salaryLevel", "locationDemand"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    handleApiError(res, err);
  }
});

/* ==========================================
   API ENDPOINT 6: GENERATE MOCK INTERVIEW
   ========================================== */
app.post("/api/mock-interview/generate", async (req, res) => {
  try {
    const { targetRole, topic, mode } = req.body;
    if (!targetRole) {
      return res.status(400).json({ error: "targetRole is required." });
    }

    const ai = getGeminiClient();
    const prompt = `Generate exactly 5 highly interactive role-specific interview preparation questions for a candidate studying for a ${targetRole} role.
Focused Topic area: ${topic || "General Technical Concepts"}.
Desired Mode style: ${mode || "Technical"}. (Modes can be MCQ, Technical, or Scenario).

For MCQ mode: Provide 4 options and the 0-indexed correct option.
For Technical or Scenario mode: Output options as empty list, and correctOptionIndex as -1. Provide a concise 'sampleAnswer' block to explain the optimal response.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctOptionIndex: { type: Type.INTEGER },
              sampleAnswer: { type: Type.STRING },
            },
            required: ["id", "text", "options", "correctOptionIndex", "sampleAnswer"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    res.json(data);
  } catch (err: any) {
    handleApiError(res, err);
  }
});

/* ==========================================
   API ENDPOINT 7: EVALUATE MOCK INTERVIEW RESPONSE
   ========================================== */
app.post("/api/mock-interview/evaluate", async (req, res) => {
  try {
    const { questionText, userAnswer, sampleAnswer } = req.body;
    if (!questionText || !userAnswer) {
      return res.status(400).json({ error: "questionText and userAnswer are required." });
    }

    const ai = getGeminiClient();
    const prompt = `Assess the candidate's custom response for a professional technical interview.
Question asked: "${questionText}"
Candidate's response: "${userAnswer}"
Ideal Guide Answer key: "${sampleAnswer || "Evaluate based on industry-standard concepts."}"

Provide detailed evaluation scoring out of 100 for Accuracy, Technical Clarity, and Technical Depth.
Give clear feedback and 3 concrete, actionable expansion suggestions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accuracy: { type: Type.INTEGER, description: "0-100" },
            clarityScore: { type: Type.INTEGER, description: "0-100" },
            technicalDepthScore: { type: Type.INTEGER, description: "0-100" },
            feedback: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["accuracy", "clarityScore", "technicalDepthScore", "feedback", "suggestions"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    handleApiError(res, err);
  }
});

/* ==========================================
   API ENDPOINT 8: RESUME + PORTFOLIO OPTIMIZER
   ========================================== */
app.post("/api/optimize-resume", async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText || !targetRole) {
      return res.status(400).json({ error: "resumeText and targetRole are required." });
    }

    const ai = getGeminiClient();
    const prompt = `Analyze this resume and provide deep optimization advice to elevate the ATS (Applicant Tracking System) compatibility score for a "${targetRole}" role.
Resume text:
"""
${resumeText}
"""

Ensure that you:
- Estimate an ATS compatibility rating (0-100).
- Generate a keyword coverage checklist (indicating whether they were found or not).
- Spot missing key skills based on modern market standards.
- Recommend 3 direct project suggestions to fill experienced gaps.
- Spot other experience gaps.
- Re-write up to 3 bullet points with a high-impact, STAR-method metrics focus, explaining the rationale.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsCompatibilityScore: { type: Type.INTEGER },
            keywordCoverage: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  found: { type: Type.BOOLEAN },
                },
                required: ["keyword", "found"],
              },
            },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            projectSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            experienceGapAnalysis: { type: Type.STRING },
            bulletImprovements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ["original", "improved", "rationale"],
              },
            },
          },
          required: [
            "atsCompatibilityScore",
            "keywordCoverage",
            "missingSkills",
            "projectSuggestions",
            "experienceGapAnalysis",
            "bulletImprovements",
          ],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    handleApiError(res, err);
  }
});

/* ==========================================
   API ENDPOINT 9: AI CAREER COACH CHATBOT
   ========================================== */
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userProfile } = req.body;
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "messages list is required." });
    }

    const ai = getGeminiClient();

    // Construct profile knowledge context
    const profileContext = userProfile
      ? `User Career Interest: ${userProfile.targetRoles?.join(", ")}
Level: ${userProfile.experienceLevel}
Learned/Completed topics: ${userProfile.completedTopics?.join(", ") || "None"}
Weak Areas: ${userProfile.weakAreas?.join(", ") || "None declared"}`
      : "No user profile details available yet.";

    const systemInstruction = `You are a world-class AI Career Coach guiding a job seeker to pivot or fast-track their career in modern digital tech industries.
Be helpful, practical, encouraging, and highly analytical. Provide actionable guidance, technical breakdowns, resource advice, and resume mentoring.
Context of the user's active goals:
${profileContext}
Always ground suggestions in current industry standards. Keep replies clear, conversational, and nicely structured with markdown.`;

    // Map conversation stream history to Gemini parts
    const geminiContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    handleApiError(res, err);
  }
});


/* ==========================================
   VITE DEVELOPMENT & PRODUCTION INDEX HANDLERS
   ========================================== */
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware so static react assets can hot-reload inside port 3000
    app.use(vite.middlewares);
  } else {
    // In production, serve bundled static files inside /dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Core Sever booted and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
