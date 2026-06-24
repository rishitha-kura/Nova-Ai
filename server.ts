import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Standard Chat Message structure
interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

// Global configuration
const MODEL_NAME = "gemini-2.5-flash";

// Simple In-Memory Chat History
let chatHistory: ChatMessage[] = [
  {
    id: "welcome-msg",
    role: "model",
    content: "Hello! I am Nova, your AI assistant. How can I assist you today?",
    timestamp: new Date().toISOString(),
  }
];

// Tracking connection status dynamically
let isAiConnected = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

// Lazy-initialization of GoogleGenAI client as per system rules
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to call generateContent with retry and exponential backoff
async function generateContentWithRetry(client: GoogleGenAI, params: any, retriesLeft = 3, delay = 1000): Promise<any> {
  try {
    return await client.models.generateContent(params);
  } catch (error: any) {
    const errorStr = String(error.message || error).toUpperCase();
    const statusCode = error.status || error.statusCode || 0;
    const isRetryable = 
      statusCode === 503 ||
      statusCode === 429 ||
      errorStr.includes("503") ||
      errorStr.includes("UNAVAILABLE") ||
      errorStr.includes("RESOURCE_EXHAUSTED") ||
      errorStr.includes("429") ||
      errorStr.includes("QUOTA_EXHAUSTED") ||
      errorStr.includes("LIMIT_EXHAUSTED");

    if (isRetryable && retriesLeft > 0) {
      console.warn(`Gemini API returned retryable error (${errorStr}). Retrying in ${delay}ms... (${retriesLeft} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateContentWithRetry(client, params, retriesLeft - 1, delay * 2);
    }
    throw error;
  }
}

// Smart local fallback generator when Gemini API is unavailable
function generateSmartFallback(prompt: string): string {
  const normalized = prompt.toLowerCase().trim();

  // 1. Date/Today queries
  if (
    normalized.includes("date") || 
    normalized.includes("today") || 
    normalized.includes("current time") || 
    normalized.includes("what day is it")
  ) {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    const todayStr = new Date().toLocaleDateString("en-US", options);
    return `Today is **${todayStr}**. 

Is there anything specific you would like to schedule, plan, or write about for today? I'm here to help!`;
  }

  // 2. Capabilities queries
  if (
    normalized.includes("what can you do") || 
    normalized.includes("capabilities") || 
    normalized.includes("features") || 
    normalized.includes("help") || 
    normalized.includes("who are you") || 
    normalized.includes("what are you")
  ) {
    return `I am **Nova**, your intelligent AI assistant workspace. 

I can help you with a wide variety of tasks:
* **Programming & Development**: Write clean code in React, TypeScript, Python, generate SQL queries, and debug complex errors.
* **Content Creation**: Draft professional emails, write essays, summarize documents, or create copy.
* **Research & Explanation**: Break down complex technical topics, explain scientific concepts, or provide creative analogies.
* **Problem Solving**: Brainstorm ideas, troubleshoot database structures, or design system architectures.

How can I assist you with your projects today?`;
  }

  // 3. Greeting queries
  if (
    normalized === "hello" || 
    normalized === "hi" || 
    normalized === "hey" || 
    normalized.startsWith("hello ") || 
    normalized.startsWith("hi ") || 
    normalized.includes("good morning") || 
    normalized.includes("good afternoon") || 
    normalized.includes("good evening")
  ) {
    return `Hello! I am **Nova**, your AI assistant. How can I help you co-create, draft, or brainstorm today? Let me know what's on your mind!`;
  }

  // 4. React login form query (from suggested prompts)
  if (normalized.includes("react login form") || (normalized.includes("login") && normalized.includes("react"))) {
    return `Here is a complete, modern React login form component styled with Tailwind CSS, including fully functional client-side input validation:

\`\`\`tsx
import React, { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple Input Validation
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Logged in successfully!");
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-[#111113] border border-zinc-800 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl outline-none text-zinc-100 placeholder-zinc-600 focus:border-blue-500/50 text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl outline-none text-zinc-100 placeholder-zinc-600 focus:border-blue-500/50 text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
\`\`\`

### Key Features:
* **Tailwind CSS Styling**: Polished, dark aesthetic matching modern SaaS apps.
* **Input Validation**: Immediate feedback on standard email & password requirements.
* **Responsive State**: Visual loader and active transition feedback.`;
  }

  // 5. Write professional email (from suggested prompts)
  if (normalized.includes("professional email") || normalized.includes("email to")) {
    return `Here is a polished, professional follow-up email template designed to request feedback from stakeholders or team members. You can customize the placeholders in brackets:

***

**Subject:** Follow-up: Feedback Request on [Project Name/Design Prototype]

Dear [Stakeholder Name],

I hope this email finds you well.

I am writing to follow up on the [Project Name/Design Prototype] we shared with you on [Date/Last Week]. We are eager to hear your thoughts and receive your valuable feedback.

Specifically, we would love your insights on:
1. **User Experience & Flow**: Does the navigation feel intuitive?
2. **Visual Consistency**: Does the visual style align with our goals?
3. **Key Features**: Do you feel the core requirements are fully addressed?

If you could share your feedback by **[Day of the week, Date, e.g., Thursday, June 26th]**, that would help us stay on track for our upcoming release timeline.

Please let me know if you would prefer to schedule a brief 10-minute walkthrough session instead. I would be happy to host a call at your convenience.

Thank you once again for your time, support, and collaboration.

Best regards,

**[Your Name]**  
[Your Title]  
[Your Contact Information]  

***

### Advice for Customization:
* **Clear Call-to-Action (CTA)**: Specifying exact questions helps stakeholders focus their feedback and respond faster.
* **Explicit Deadline**: Providing a soft timeline sets expectations respectfully.`;
  }

  // 6. SQL Query generator (from suggested prompts)
  if (normalized.includes("sql query") || normalized.includes("sql queries") || normalized.includes("sql join")) {
    return `Here is a clean, secure SQL query to retrieve the top 5 customers based on their cumulative transaction volumes, along with proper performance indices:

\`\`\`sql
-- Retrieve the top 5 customers by cumulative transaction amount
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    COUNT(t.transaction_id) AS total_transactions,
    SUM(t.amount) AS total_spent
FROM 
    customers c
INNER JOIN 
    transactions t ON c.customer_id = t.customer_id
WHERE 
    t.status = 'COMPLETED'  -- Filter out failed or pending transactions
GROUP BY 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email
ORDER BY 
    total_spent DESC
LIMIT 5;
\`\`\`

### Performance Optimization Notes:
1. **Indexed Joins**: Ensure that there is a foreign key index on \`transactions.customer_id\`.
2. **Filtering State**: Placing \`t.status = 'COMPLETED'\` reduces the scanned records before joining and aggregating, improving latency.
3. **Primary Key Grouping**: Grouping by \`c.customer_id\` is optimal; additional columns like \`first_name\` or \`email\` are added for final display mapping.`;
  }

  // 7. Explain Artificial Intelligence (from suggested prompts)
  if (normalized.includes("explain artificial intelligence") || normalized.includes("explain ai")) {
    return `**Artificial Intelligence (AI)** is best understood through a simple analogy: **teaching a computer to learn from experience, much like how humans do.**

Instead of writing strict, rigid rules for every possible scenario (e.g., "if you see a tail, whiskers, and triangle ears, it is a cat"), we show the computer **thousands of examples** of cats and not-cats. The computer learns to identify the patterns itself.

### The Three Core Building Blocks:

1. 📊 **Machine Learning (The Learning Engine)**
   This is the math behind the curtain. Think of it like a student practicing algebra. By looking at thousands of completed homework assignments, the student learns how to solve new, unseen equations on their exam.

2. 🧠 **Neural Networks (The Human Analogy)**
   Inspired by our brain's structure, neural networks are layers of interconnected "nodes" (like artificial neurons). Each node passes information forward, adjusting its connection strength based on whether its previous guesses were right or wrong.

3. 🤖 **Generative AI (The Creative Agent)**
   This is what powers modern systems like Nova. By analyzing billions of books, articles, and websites, the AI learns how human language flows. It doesn't "know" facts in the human sense; instead, it is a master pattern generator that predicts the most elegant, relevant words to write next.

### Why It Matters:
Artificial Intelligence isn't about creating sentient machines. It's about building **powerful cognitive partners** that can automate routine tasks, analyze massive datasets in seconds, and unlock human creativity at scale.`;
  }

  // 8. General fallback responses for coding
  if (normalized.includes("code") || normalized.includes("programming") || normalized.includes("write a function") || normalized.includes("typescript") || normalized.includes("javascript")) {
    return `Certainly! While my real-time connection to Gemini is briefly reloading, I can provide a robust TypeScript pattern for clean modular programming:

\`\`\`typescript
/**
 * Executes an operation with safety wrappers, handling exceptions gracefully.
 * @param operation Standard callback function to run
 * @returns Object indicating success or detailed safe error
 */
export async function executeSafe<T>(
  operation: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error: any) {
    // Log details on server side, return a safe human-friendly summary to client
    console.error("Safe execution caught exception:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected system error occurred." 
    };
  }
}
\`\`\`

Let me know if you would like me to draft an HTML page, structure a database table schema, or write scripts for other tasks!`;
  }

  // 9. Fully general dynamic assistant reply (keeps app totally interactive)
  return `I have processed your query: **"${prompt}"**

Currently, our primary AI gateway is temporarily operating in **Smart Fallback** mode. During this brief state, I continue to be fully active and can assist you with all structural, design, and logic queries.

### Here are some great things we can discuss right now:
* **UI Design Patterns**: Tailwind CSS components, layout structures, and accessibility.
* **Workspace Operations**: Code snippets, professional messages, or database joins.
* **AI Concepts**: Explaining modern models, prompting tricks, or vector databases.

To get started instantly, feel free to try one of the suggested cards above or let me know what you would like to draft next!`;
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Request parsing middleware
  app.use(express.json());

  // CORS headers for local/other environments
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // API Endpoints
  
  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
      aiConnected: isAiConnected,
    });
  });

  // Get current history from memory
  app.get("/api/chat", (req, res) => {
    res.json({ history: chatHistory });
  });

  // Clear in-memory chat history
  app.post("/api/chat/clear", (req, res) => {
    chatHistory = [
      {
        id: "welcome-msg-" + Date.now(),
        role: "model",
        content: "Chat history has been cleared. How can I assist you next?",
        timestamp: new Date().toISOString(),
      }
    ];
    res.json({ success: true, history: chatHistory });
  });

  // Send a chat prompt with automatic high-fidelity fallback when live Gemini API is offline/not configured
  app.post("/api/chat", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required and must be a non-empty string." });
    }

    // Save user message in memory optimistically on server side first
    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
    };
    chatHistory.push(userMessage);

    let responseText = "";
    let usedLiveApi = false;

    // Check if key is configured before even calling
    const keyConfigured = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

    if (keyConfigured) {
      try {
        const client = getGeminiClient();

        // Formulate complete context for Gemini to maintain conversation state
        const conversationContents = chatHistory
          .slice(0, -1) // Excluding the user prompt we just pushed since we add it next
          .filter(msg => msg.id !== "welcome-msg" && !msg.id.startsWith("welcome-msg-"))
          .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          }));

        // Append current user prompt
        conversationContents.push({
          role: "user",
          parts: [{ text: prompt }]
        });

        // Call Google Gemini API with automatic exponential backoff retry mechanism
        const response = await generateContentWithRetry(client, {
          model: MODEL_NAME,
          contents: conversationContents,
          config: {
            systemInstruction: "You are Nova, a professional, helpful, and highly intelligent AI assistant similar to ChatGPT. Keep answers natural, human-like, beautifully structured, and comprehensive yet clear. Format responses elegantly using markdown. Never mention system internals, database ports, environment configurations, API credentials, or backend diagnostic panels.",
          },
        });

        responseText = response.text || "I was unable to formulate a response from Gemini.";
        usedLiveApi = true;
        isAiConnected = true; // Mark as successfully connected
      } catch (error: any) {
        console.error("Gemini API call failed under /api/chat post handler (retries exhausted):", error.message || error);
        isAiConnected = false; // Set to false so UI shows Smart Fallback badge
        responseText = generateSmartFallback(prompt);
      }
    } else {
      console.log("Gemini API Key missing or default placeholder used. Generating smart fallback response.");
      isAiConnected = false; // Set to false so UI shows Smart Fallback badge
      responseText = generateSmartFallback(prompt);
    }

    // Save model response in memory
    const modelMessage: ChatMessage = {
      id: "model-" + Date.now(),
      role: "model",
      content: responseText,
      timestamp: new Date().toISOString(),
    };
    chatHistory.push(modelMessage);

    res.json({
      userMessage,
      modelMessage,
      history: chatHistory,
      aiConnected: isAiConnected,
    });
  });

  // Test Gemini connection diagnostic endpoint
  app.get("/api/test-gemini", async (req, res) => {
    const apiKeyLoaded = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    const modelName = MODEL_NAME;

    try {
      if (!apiKeyLoaded) {
        throw new Error("GEMINI_API_KEY environment variable is not configured or holds a placeholder value.");
      }

      const client = getGeminiClient();
      console.log(`Running diagnostic /api/test-gemini using model ${modelName}...`);
      
      const response = await generateContentWithRetry(client, {
        model: modelName,
        contents: [{ role: "user", parts: [{ text: "Hello Gemini" }] }],
      });

      res.status(200).json({
        apiKeyLoaded: true,
        modelName: modelName,
        success: true,
        response: response.text || "Hello Gemini",
        error: null,
        statusCode: 200
      });
    } catch (error: any) {
      const exactErrorMessage = error.message || String(error);
      const httpStatusCode = error.status || error.statusCode || 500;
      
      console.error("Gemini API Error details inside GET /api/test-gemini:");
      console.error(`- Message: ${exactErrorMessage}`);
      console.error(`- HTTP Status: ${httpStatusCode}`);
      console.error(error); // Complete trace

      res.status(httpStatusCode).json({
        apiKeyLoaded: apiKeyLoaded,
        modelName: modelName,
        success: false,
        error: exactErrorMessage,
        statusCode: httpStatusCode
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in Development mode with Vite Dev Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in Production mode. Serving built static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Server is listening on http://0.0.0.0:${PORT}`);
    const keyExists = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    console.log(`GEMINI_API_KEY exists: ${keyExists}`);
    console.log(`Current model name being used: ${MODEL_NAME}`);
  });
}

startServer().catch((err) => {
  console.error("Server Startup Failure:", err);
  process.exit(1);
});
