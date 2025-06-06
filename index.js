import fs from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@deepgram/sdk";
import OpenAI from "openai";
import wav from "wav";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Merge multiple audio files into a single file
 * @param {Object} options - Merge configuration options
 * @param {string[]} options.inputFiles - Array of input file paths to merge
 * @param {string} options.outputFile - Output file path for the merged audio
 * @returns {Promise<void>} Promise that resolves when merging is complete
 */
export async function merge({ inputFiles, outputFile }) {
  if (!inputFiles || !Array.isArray(inputFiles) || inputFiles.length === 0) {
    throw new Error("inputFiles must be a non-empty array of file paths.");
  }

  if (!outputFile) {
    throw new Error("outputFile parameter is required.");
  }

  for (const file of inputFiles) {
    try {
      await fs.access(file);
    } catch (error) {
      throw new Error(`Input file not found: ${file}`);
    }
  }
  console.log(`🔄 Merging ${inputFiles.length} audio files...`);
  console.log(`📁 Input files: ${inputFiles.join(", ")}`);
  console.log(`📤 Output file: ${outputFile}`);

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    inputFiles.forEach((file) => {
      command = command.input(file);
    });

    command
      .complexFilter([
        {
          filter: "concat",
          options: {
            n: inputFiles.length,
            v: 0,
            a: 1,
          },
          outputs: "out",
        },
      ])
      .outputOptions(["-map", "[out]"])
      .output(outputFile)
      .on("start", () => {
        console.log("🎵 Merging process started:");
      })
      .on("end", () => {
        console.log(`✅ Audio files merged successfully to ${outputFile}`);
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg error:", err.message);
        reject(new Error(`Failed to merge audio files: ${err.message}`));
      })
      .run();
  });
}

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
 * @param {"gemini"|"deepgram"|"openai"} options.provider - TTS provider to use
 * @param {string} options.apiKey - API key for the chosen provider
 * @param {string} options.text - Text to convert to speech
 * @param {string} options.voice - Voice identifier (provider-specific)
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

    default:
      throw new Error(`Provider "${provider}" is not supported.`);
  }
}
