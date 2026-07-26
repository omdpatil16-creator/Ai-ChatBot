import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize Gemini Client lazily or gracefully handle missing key
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Healthcheck API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// Chat API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, provider = "gemini", model = "gemini-3.6-flash", systemInstruction } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required" });
      return;
    }

    // Mock mode or non-gemini provider simulated fallback
    if (provider === "mock" || !process.env.GEMINI_API_KEY) {
      const lastMsg = messages[messages.length - 1];
      const textContent = typeof lastMsg.content === "string" ? lastMsg.content : lastMsg.content?.[0]?.text || "";
      
      let mockReply = "";
      if (textContent.toLowerCase().includes("hello") || textContent.toLowerCase().includes("hi")) {
        mockReply = "Hello! I am your AI Assistant. How can I assist you with your tasks or questions today?";
      } else if (textContent.toLowerCase().includes("code") || textContent.toLowerCase().includes("function") || textContent.toLowerCase().includes("python") || textContent.toLowerCase().includes("javascript")) {
        mockReply = "Here is a code snippet to help you out:\n\n```typescript\nfunction calculateStats(data: number[]): { sum: number; avg: number } {\n  const sum = data.reduce((acc, val) => acc + val, 0);\n  const avg = data.length > 0 ? sum / data.length : 0;\n  return { sum, avg };\n}\n\nconsole.log(calculateStats([10, 20, 30, 40]));\n```\nLet me know if you'd like me to explain how this works!";
      } else if (textContent.toLowerCase().includes("weather")) {
        mockReply = "I don't have real-time live sensors, but generally standard forecast models suggest checking your local meteorological API. Would you like me to generate code for fetching live weather data?";
      } else {
        mockReply = `That's an insightful question! Regarding "${textContent.slice(0, 60)}...", here are a few key points to consider:\n\n1. **Structured Approach**: Divide the problem into modular components.\n2. **Optimization**: Review performance bottlenecks and state management.\n3. **Flexibility**: Keep the solution extensible for future enhancements.\n\nWould you like me to elaborate further on any of these aspects?`;
      }

      res.json({ reply: mockReply, providerUsed: provider === "mock" ? "Mock AI" : "Mock AI (No GEMINI_API_KEY)" });
      return;
    }

    // Gemini API integration
    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({ error: "Gemini API client unavailable" });
      return;
    }

    // Convert message structure for Gemini
    // Form contents from chat history
    const formattedContents = messages.map((m: any) => {
      const role = m.role === "user" ? "user" : "model";
      const parts: any[] = [];

      if (typeof m.content === "string") {
        parts.push({ text: m.content });
      } else if (Array.isArray(m.content)) {
        m.content.forEach((part: any) => {
          if (part.type === "text") {
            parts.push({ text: part.text });
          } else if (part.type === "image_url" && part.image_url?.url) {
            const dataUrl = part.image_url.url;
            const matches = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
            if (matches) {
              parts.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2],
                },
              });
            }
          }
        });
      }

      return { role, parts };
    });

    const selectedModel = model || "gemini-3.6-flash";

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction || "You are a helpful, intelligent, and friendly AI Assistant similar to ChatGPT. Use clear markdown formatting, code blocks with syntax highlighting where relevant, and concise structured answers.",
      },
    });

    const replyText = response.text || "No response received from model.";
    res.json({ reply: replyText, providerUsed: `Gemini (${selectedModel})` });
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ error: err.message || "Failed to process chat request" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
