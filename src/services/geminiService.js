const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_MODEL = 'gemini-3.8-flash';
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const MODEL_ALIASES = {
  'gemini-2.5-flash': DEFAULT_MODEL,
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL;
  const modelName = MODEL_ALIASES[configuredModel] || configuredModel || DEFAULT_MODEL;

  if (configuredModel && MODEL_ALIASES[configuredModel]) {
    console.warn(`GEMINI_MODEL "${configuredModel}" is deprecated; using "${modelName}" instead.`);
  }

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Invalid Gemini response');
        }

        return text;
      } catch (error) {
        if (error.status !== 503 || attempt === MAX_ATTEMPTS) {
          throw error;
        }

        await wait(RETRY_DELAY_MS * attempt);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
};

module.exports = {
  callGemini,
};