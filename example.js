import dotenv from "dotenv";
import { tts, stt, merge } from "./index.js";

dotenv.config();

// Deepgram TTS Example
tts({
  provider: "deepgram",
  apiKey: process.env.DEEPGRAM_API_KEY,
  text: "Hello! This is a test using the Deepgrams's Aura-2 tts model.",
  voice: "aura-2-luna-en",
  outputFile: "output_1.mp3",
});

tts({
  provider: "deepgram",
  apiKey: process.env.DEEPGRAM_API_KEY,
  text: "This voice is called Luna.",
  voice: "aura-2-luna-en",
  outputFile: "output_2.mp3",
});

// Deepgram STT Example
stt({
  provider: "deepgram",
  apiKey: process.env.DEEPGRAM_API_KEY,
  audioFile: "https://dpgr.am/spacewalk.wav",
  outputFile: "transcription.json",
});

// File merge Example [First there should be two audio files for this to work]
merge({
  inputFiles: ["output_1.mp3", "output_2.mp3"],
  outputFile: "Combined.mp3",
});
