import axios from "axios";

/**
 * Calls the configured AI provider with a prompt and returns raw text output.
 * Supports OpenAI, Google Gemini, and Anthropic Claude - controlled by AI_PROVIDER env var.
 * Set AI_API_KEY to the relevant provider's API key.
 */
const callAI = async (systemPrompt, userPrompt) => {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "openai") {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  }

  if (provider === "claude") {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: process.env.CLAUDE_MODEL || "claude-3-5-haiku-20241022",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      },
      {
        headers: {
          "x-api-key": process.env.AI_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.content[0].text;
  }

  if (provider === "gemini") {
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.AI_API_KEY}`,
      {
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data.candidates[0].content.parts[0].text;
  }

  if (provider === "mistral") {
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: process.env.MISTRAL_MODEL || "mistral-tiny",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  }

  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
};

/**
 * Strips markdown code fences and parses the model's response as JSON.
 */
const parseJSONResponse = (raw) => {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

export { callAI, parseJSONResponse };
