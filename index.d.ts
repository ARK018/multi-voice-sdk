/**
 * Multi-Voice SDK - TypeScript Definitions
 */

export interface TTSOptions {
  /** TTS provider: "gemini", "deepgram", or "openai" */
  provider: "gemini" | "deepgram" | "openai";
  /** API key for the chosen provider */
  apiKey: string;
  /** Text to convert to speech */
  text: string;
  /** Voice identifier (provider-specific) */
  voice: string;
  /** Output file path (default: "output.mp3") */
  outputFile?: string;
  /** Model to use (provider-specific) */
  model?: string;
  /** Additional instructions for speech generation */
  prompt?: string;
}

export interface MergeOptions {
  /** Array of input file paths to merge */
  inputFiles: string[];
  /** Output file path for the merged audio */
  outputFile: string;
}

/**
 * Generate speech from text using various TTS providers
 * @param options - TTS configuration options
 * @returns Promise that resolves when audio generation is complete
 */
export function tts(options: TTSOptions): Promise<void>;

/**
 * Merge multiple audio files into a single file
 * @param options - Merge configuration options
 * @returns Promise that resolves when merging is complete
 */
export function merge(options: MergeOptions): Promise<void>;
