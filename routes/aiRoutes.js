const express = require("express");
const router = express.Router();

// Simple in-memory rate limiting map: ip -> lastRequestTimestamp
const rateLimitMap = new Map();

router.post("/generate-description", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required to generate a description"
      });
    }

    // Rate limit check: 1 request per 10 seconds per IP
    const clientIp = req.ip || req.connection?.remoteAddress || "client";
    const now = Date.now();
    const lastRequest = rateLimitMap.get(clientIp);

    if (lastRequest && now - lastRequest < 10000) {
      const waitSeconds = Math.ceil((10000 - (now - lastRequest)) / 1000);
      return res.status(429).json({
        message: `Rate limit exceeded. Please wait ${waitSeconds}s before requesting again.`,
        fallback: true
      });
    }

    rateLimitMap.set(clientIp, now);

    // Check for OpenAI API Key in server environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey !== "your_key_here" && apiKey.startsWith("sk-")) {
      try {
        const OpenAI = require("openai");
        const client = new OpenAI({ apiKey });

        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an assistant that writes concise, professional 1-2 sentence descriptions for task management items."
            },
            {
              role: "user",
              content: `Write a short task description for: ${title.trim()}`
            }
          ],
          max_tokens: 100
        });

        const generatedDescription = completion.choices?.[0]?.message?.content?.trim();

        if (generatedDescription) {
          return res.status(200).json({
            description: generatedDescription,
            source: "OpenAI GPT-4o-mini",
            fallback: false
          });
        }
      } catch (apiError) {
        console.warn("OpenAI API call failed, gracefully falling back:", apiError.message);
        // Graceful degradation: return sensible fallback instead of crashing
      }
    }

    // Context-aware fallback description (Graceful Degradation)
    const cleanTitle = title.trim();
    const fallbackDescription = `Ensure complete execution, testing, and documentation for "${cleanTitle}". Coordinate deliverables and verify quality checkpoints.`;

    return res.status(200).json({
      description: fallbackDescription,
      source: "Heuristic Fallback Engine (Graceful Degradation)",
      fallback: true
    });
  } catch (err) {
    console.error("AI Generation Route Error:", err);
    return res.status(200).json({
      description: "Complete all required deliverables and verify specifications.",
      fallback: true
    });
  }
});

module.exports = router;
