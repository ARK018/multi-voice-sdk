import fs from "fs";
import { createClient } from "@deepgram/sdk";
import { AssemblyAI } from "assemblyai";

/**
 * Transcribe audio to text using various STT providers
 * @param {Object} options - STT configuration options
 * @param {"deepgram"|"assemblyai"} options.provider - STT provider to use (required)
 * @param {string} options.apiKey - API key for the chosen provider
 * @param {string} [options.audioFile] - Path to local audio file or URL of remote audio file to transcribe
 * @param {string} [options.outputFile="transcription.json"] - Output file path for transcription results
 * @param {string} [options.model="nova-2"] - Model to use (provider-specific)
 * @param {boolean} [options.smartFormat=true] - Enable smart formatting
 * @param {boolean} [options.detect_language=true] - Automatic language detection
 * @param {boolean} [options.punctuate=true] - Enable punctuation
 * @param {boolean} [options.diarize=false] - Enable speaker diarization
 * @param {number} [options.channels=1] - Number of audio channels
 * @param {boolean} [options.fullResponse=false] - Return full detailed response instead of just transcript
 * @returns {Promise<string|Object>} Promise that resolves with transcript string or full transcription results object
 */
export async function stt({
  provider,
  apiKey,
  audioFile,
  outputFile = "transcription.json",
  model,
  smartFormat = true,
  detect_language = true,
  punctuate = true,
  diarize = false,
  channels = 1,
  fullResponse = false,
}) {
  if (!provider) {
    throw new Error("Missing required parameter: provider");
  }

  if (!apiKey) {
    throw new Error("Missing required parameter: apiKey");
  }

  if (!audioFile) {
    throw new Error(
      "audioFile parameter is required (can be local file path or HTTP URL)"
    );
  }
  // Validate provider
  const supportedProviders = ["deepgram", "assemblyai"];
  if (!supportedProviders.includes(provider.toLowerCase())) {
    throw new Error(
      `Provider "${provider}" is not supported. Supported providers: ${supportedProviders.join(
        ", "
      )}`
    );
  } // Detect if audioFile is a URL or local file path
  const isUrl = /^https?:\/\//i.test(audioFile);
  const audioUrl = isUrl ? audioFile : null;
  const localAudioFile = isUrl ? null : audioFile;
  switch (provider.toLowerCase()) {
    case "deepgram":
      return await transcribeWithDeepgram({
        apiKey,
        audioFile: localAudioFile || audioUrl, // Pass the actual audio source
        outputFile,
        model,
        smartFormat,
        detect_language,
        punctuate,
        diarize,
        channels,
        fullResponse,
      });
    case "assemblyai":
      return await transcribeWithAssemblyAI({
        apiKey,
        audioFile: localAudioFile || audioUrl, // Pass the actual audio source
        outputFile,
        model,
        fullResponse,
      });

    default:
      throw new Error(`Provider "${provider}" is not implemented yet.`);
  }
}

/**
 * Transcribe audio using Deepgram STT
 */
async function transcribeWithDeepgram({
  apiKey,
  audioFile,
  outputFile,
  model = "nova-3", // Default model
  smartFormat,
  detect_language,
  punctuate,
  diarize,
  channels,
  fullResponse,
}) {
  try {
    // STEP 1: Create a Deepgram client using the API key
    const deepgram = createClient(apiKey);

    // STEP 2: Detect if audioFile is a URL or local file path
    const isUrl = /^https?:\/\//i.test(audioFile);

    // STEP 3: Configure Deepgram options for audio analysis
    const options = {
      model,
      smart_format: smartFormat,
      detect_language,
      punctuate,
      diarize,
      channels,
    };

    let result, error;

    if (isUrl) {
      // STEP 4a: Transcribe remote file via URL
      console.log(`🎙️ Transcribing remote audio from URL: ${audioFile}`);
      console.log(`🔧 Using model: ${model}`);

      const response = await deepgram.listen.prerecorded.transcribeUrl(
        { url: audioFile },
        options
      );

      result = response.result;
      error = response.error;
    } else {
      // STEP 4b: Transcribe local file
      console.log(`🎙️ Transcribing local audio file: ${audioFile}`);
      console.log(`🔧 Using model: ${model}`);

      // Check if file exists
      if (!fs.existsSync(audioFile)) {
        throw new Error(`Audio file not found: ${audioFile}`);
      }

      const audioBuffer = fs.readFileSync(audioFile);
      const response = await deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        options
      );

      result = response.result;
      error = response.error;
    }

    if (error) {
      console.error("❌ Deepgram STT error:", error);
      throw error;
    }

    // STEP 4: Process and return results
    if (result) {
      const transcript =
        result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
      const confidence =
        result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
      const words =
        result.results?.channels?.[0]?.alternatives?.[0]?.words || [];

      console.log(`✅ Transcription completed successfully`);

      const transcriptionResult = {
        transcript,
        confidence,
        words,
        fullResult: result,
        metadata: {
          model,
          language:
            result.results?.channels?.[0]?.detected_language || detect_language,
          duration: result.metadata?.duration,
          channels: result.metadata?.channels,
          provider: "deepgram",
        },
      }; // Save results to output file if specified
      if (outputFile) {
        try {
          // Save based on fullResponse setting - just transcript or full object
          const dataToSave = fullResponse
            ? transcriptionResult
            : { transcript };
          await fs.promises.writeFile(
            outputFile,
            JSON.stringify(dataToSave, null, 2)
          );
          console.log(`💾 Transcription results saved to: ${outputFile}`);
        } catch (writeError) {
          console.warn(
            `⚠️ Failed to save transcription to file: ${writeError.message}`
          );
        }
      }

      // Return just transcript by default, or full response if requested
      return fullResponse ? transcriptionResult : transcript;
    } else {
      throw new Error("No transcription result received");
    }
  } catch (err) {
    console.error("❌ STT transcription failed:", err.message);
    throw err;
  }
}

/**
 * Transcribe audio using AssemblyAI STT
 */
async function transcribeWithAssemblyAI({
  apiKey,
  audioFile,
  outputFile,
  model,
  fullResponse,
}) {
  try {
    // STEP 1: Create an AssemblyAI client using the API key
    const client = new AssemblyAI({
      apiKey: apiKey,
    }); // STEP 2: Determine audio source
    const audioSource = audioFile;

    console.log(`🎙️ Transcribing audio with AssemblyAI: ${audioSource}`);
    console.log(`🔧 Using model: slam-1`); // STEP 3: Configure AssemblyAI options for audio analysis
    const params = {
      audio: audioSource,
      speech_model: "slam-1", // Always use slam-1 for AssemblyAI
    };

    // STEP 4: Start transcription
    const transcript = await client.transcripts.transcribe(params);

    if (transcript.status === "error") {
      console.error("❌ AssemblyAI STT error:", transcript.error);
      throw new Error(`AssemblyAI transcription failed: ${transcript.error}`);
    }

    // STEP 5: Process and return results
    if (transcript.status === "completed") {
      const transcriptText = transcript.text || "";
      const confidence = transcript.confidence || 0;
      const words = transcript.words || [];

      console.log(`✅ Transcription completed successfully`);

      const transcriptionResult = {
        transcript: transcriptText,
        confidence: confidence,
        words: words,
        fullResult: transcript,
        metadata: {
          model: "slam-1",
          language: transcript.language_code || "auto",
          duration: transcript.audio_duration,
          channels: 1,
          provider: "assemblyai",
        },
      };

      // Save results to output file if specified
      if (outputFile) {
        try {
          // Save based on fullResponse setting - just transcript or full object
          const dataToSave = fullResponse
            ? transcriptionResult
            : { transcript: transcriptText };
          await fs.promises.writeFile(
            outputFile,
            JSON.stringify(dataToSave, null, 2)
          );
          console.log(`💾 Transcription results saved to: ${outputFile}`);
        } catch (writeError) {
          console.warn(
            `⚠️ Failed to save transcription to file: ${writeError.message}`
          );
        }
      }

      // Return just transcript by default, or full response if requested
      return fullResponse ? transcriptionResult : transcriptText;
    } else {
      throw new Error(`Transcription failed with status: ${transcript.status}`);
    }
  } catch (err) {
    console.error("❌ STT transcription failed:", err.message);
    throw err;
  }
}
