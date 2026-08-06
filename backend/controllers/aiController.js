import { callAI, parseJSONResponse } from "../utils/aiClient.js";

// @route POST /api/ai/parse-task
// Body: { text: "Submit the client report by Friday 5pm, high priority" }
// Turns a free-text sentence into structured task fields.
export const parseTask = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const today = new Date().toISOString();

    const systemPrompt = `You convert a user's natural language task description into structured JSON.
Today's date/time is ${today}.
Respond with ONLY valid JSON, no markdown, no explanation, in this exact shape:
{
  "title": string,
  "description": string,
  "dueDate": string (ISO 8601 datetime, infer a sensible date/time if not explicit),
  "priority": "Low" | "Medium" | "High",
  "category": string (a short single word or two, e.g. Work, Personal, Health, Finance)
}`;

    const raw = await callAI(systemPrompt, text);
    const parsed = parseJSONResponse(raw);

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ message: "AI parsing failed", error: error.message });
  }
};

// @route POST /api/ai/suggest
// Body: { title, description }
// Suggests a priority + category for an already-drafted task.
export const suggestPriorityAndCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const systemPrompt = `You are a task triage assistant. Given a task title and optional description,
suggest a priority and category. Respond with ONLY valid JSON, no markdown, in this exact shape:
{
  "priority": "Low" | "Medium" | "High",
  "category": string (short, e.g. Work, Personal, Health, Finance, Errands),
  "reasoning": string (one short sentence explaining why)
}`;

    const userPrompt = `Title: ${title}\nDescription: ${description || "(none)"}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const parsed = parseJSONResponse(raw);

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ message: "AI suggestion failed", error: error.message });
  }
};
