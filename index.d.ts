/**
 * Multi-Voice SDK - TypeScript Definitions
 */

export interface TTSOptions {
  /** TTS provider: "gemini", "deepgram", "openai", "groq", or "cartesia" */
  provider: "gemini" | "deepgram" | "openai" | "groq" | "cartesia";
  /** API key for the chosen provider */
  apiKey: string;
  /** Text to convert to speech */
  text: string;
  /** Voice identifier (provider-specific, for Cartesia use voice ID) */
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

export interface STTOptions {
  /** STT provider: "deepgram" or "assemblyai" */
  provider: "deepgram" | "assemblyai";
  /** API key for the chosen provider */
  apiKey: string;
  /** Path to local audio file or URL of remote audio file to transcribe */
  audioFile: string;
  /** Output file path for transcription results (default: "transcription.json") */
  outputFile?: string;
  /** Model to use (provider-specific, default: "nova-3") */
  model?: string;
  /** Enable smart formatting (default: true) */
  smartFormat?: boolean;
  /** Automatic language detection (default: true) */
  detect_language?: boolean;
  /** Enable punctuation (default: true) */
  punctuate?: boolean;
  /** Enable speaker diarization (default: false) */
  diarize?: boolean;
  /** Number of audio channels (default: 1) */
  channels?: number;
  /** Return full detailed response instead of just transcript (default: false) */
  fullResponse?: boolean;
}

export interface STTResult {
  /** The transcribed text */
  transcript: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Array of word-level details */
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    punctuated_word: string;
  }>;
  /** Full raw result from the provider */
  fullResult: any;
  /** Metadata about the transcription */
  metadata: {
    model: string;
    language: string;
    duration: number;
    channels: number;
    provider: string;
  };
}

/**
 * Transcribe audio to text using various STT providers
 * @param options - STT configuration options
 * @returns Promise that resolves with transcript string (default) or full transcription results object
 */
export function stt(options: STTOptions): Promise<string | STTResult>;
