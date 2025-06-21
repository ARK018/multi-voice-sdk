import fs from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@deepgram/sdk";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { CartesiaClient } from "@cartesia/cartesia-js";
import wav from "wav";

async function saveWaveFile(
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  const writer = new wav.FileWriter(filename, {
    channels,
    sampleRate: rate,
    bitDepth: sampleWidth * 8,
  });

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
    writer.write(pcmData);
    writer.end();
  });
}

/**
 * Generate speech from text using various TTS providers
 * @param {Object} options - TTS configuration options
 * @param {"gemini"|"deepgram"|"openai"|"groq"|"cartesia"} options.provider - TTS provider to use
 * @param {string} options.apiKey - API key for the chosen provider
 * @param {string} options.text - Text to convert to speech
 * @param {string} options.voice - Voice identifier (provider-specific, for Cartesia use voice ID)
 * @param {string} [options.outputFile="output.mp3"] - Output file path
 * @param {string} [options.model] - Model to use (provider-specific)
 * @param {string} [options.prompt] - Additional instructions for speech generation
 * @returns {Promise<void>} Promise that resolves when audio generation is complete
 */
export async function tts({
  provider,
  model = "",
  apiKey,
  prompt = "",
  text,
  voice,
  outputFile = "output.mp3",
}) {
  if (!provider || !apiKey || !text || !voice) {
    throw new Error(
      "Missing required parameters: provider, apiKey, text, or voice."
    );
  }

  switch (provider.toLowerCase()) {
    case "gemini":
      try {
        const genAI = new GoogleGenAI({ apiKey });

        console.log(
          `🔊 Generating audio with Gemini TTS using voice "${voice}"...`
        );

        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `${prompt}\n\n${text}`.trim() }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice },
              },
            },
          },
        });

        const base64 =
          result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64) throw new Error("No audio returned from Gemini");

        const buffer = Buffer.from(base64, "base64");
        const tempWav = outputFile;

        // Save WAV first
        await saveWaveFile(tempWav, buffer);

        console.log(`✅ Gemini audio saved to ${outputFile}`);
      } catch (err) {
        console.error("❌ Gemini error:", err.message);
      }
      break;
    case "deepgram":
      try {
        const deepgram = createClient(apiKey);
        console.log(`🔊 Generating audio with Deepgram TTS...`);
        const response = await deepgram.speak.request(
          { text },
          {
            model: voice,
          }
        );

        const stream = await response.getStream();
        if (stream) {
          const file = createWriteStream(outputFile);
          await pipeline(stream, file);
          console.log(`✅ Deepgram audio saved to ${outputFile}`);
        } else {
          throw new Error("No audio stream received from Deepgram");
        }
      } catch (err) {
        console.error("❌ Deepgram TTS error:", err.message);
      }
      break;
    case "openai":
      try {
        const openai = new OpenAI({ apiKey });

        const requestOptions = {
          model: model,
          voice: voice,
          input: text,
        };

        if (model === "gpt-4o-mini-tts" && prompt) {
          requestOptions.instructions = prompt;
        }

        const response = await openai.audio.speech.create(requestOptions);

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(outputFile, buffer);

        console.log(`✅ OpenAI audio saved to ${outputFile}`);
      } catch (err) {
        console.error("❌ OpenAI TTS error:", err.message);
      }
      break;

    case "groq":
      try {
        const groq = new Groq({ apiKey });

        console.log(
          `🔊 Generating audio with Groq PlayAI TTS using voice "${voice}"...`
        );

        const response = await groq.audio.speech.create({
          model: model || "playai-tts",
          voice: voice,
          response_format: "wav",
          input: text,
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(outputFile, buffer);

        console.log(`✅ Groq PlayAI audio saved to ${outputFile}`);
      } catch (err) {
        console.error("❌ Groq PlayAI TTS error:", err.message);
      }
      break;

    case "cartesia":
      try {
        const client = new CartesiaClient({ apiKey });

        console.log(
          `🔊 Generating audio with Cartesia TTS using voice ID "${voice}"...`
        );

        // Determine output format based on file extension
        const fileExt = outputFile.toLowerCase().split(".").pop();
        const container = fileExt === "wav" ? "wav" : "mp3";

        const audioBytes = await client.tts.bytes({
          modelId: model || "sonic-2",
          transcript: text,
          voice: {
            mode: "id",
            id: voice,
          },
          language: "en",
          outputFormat: {
            container: container,
            sampleRate: 44100,
            bitRate: container === "mp3" ? 128000 : undefined,
          },
        });

        await fs.writeFile(outputFile, Buffer.from(audioBytes));

        console.log(`✅ Cartesia audio saved to ${outputFile}`);
      } catch (err) {
        console.error("❌ Cartesia TTS error:", err.message);
      }
      break;

    default:
      throw new Error(`Provider "${provider}" is not supported.`);
  }
}
