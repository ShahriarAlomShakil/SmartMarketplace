const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiModel = (modelName = 'gemini-pro') => {
  return genAI.getGenerativeModel({ model: modelName });
};

const geminiConfig = {
  temperature: 0.7,
  candidateCount: 1,
  maxOutputTokens: 256,
  topP: 0.8,
  topK: 40,
};

module.exports = {
  genAI,
  getGeminiModel,
  geminiConfig
};
