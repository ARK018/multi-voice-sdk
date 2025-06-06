import dotenv from "dotenv";
import { tts } from "./index.js";
import { merge } from "./index.js";

dotenv.config();

// Gemini TTS Example
tts({
  provider: "gemini",
  apiKey: process.env.GEMINI_API_KEY,
  prompt: "In a pleasant and calm tone.",
  text: "Hello! This is a test using the Gemini's tts model.",
  voice: "iapetus",
  outputFile: "gemini_tts_output.mp3", // Optional
});

// Deepgram TTS Example
tts({
  provider: "deepgram",
  apiKey: process.env.DEEPGRAM_API_KEY,
  text: "Hello! This is a test using the Deepgrams's Aura-2 tts model.",
  voice: "aura-2-luna-en",
});

// OpenAI TTS Example
tts({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini-tts",
  prompt: "Speak in a cheerful and energetic tone.",
  text: "Hello! This is a test using GPT-4o-mini-TTS with custom instructions.",
  voice: "nova",
  outputFile: "openai_tts_output.mp3", // Optional
});

// File merge Example
merge({
  inputFiles: ["gemini_tts_output.mp3", "openai_tts_output.mp3"],
  outputFile: "Combined.mp3",
});
