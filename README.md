# Multi-Voice SDK

A universal Text-to-Speech (TTS) and Speech-to-Text (STT) SDK that supports multiple providers including Google Gemini, Deepgram, OpenAI, Groq PlayAI, Cartesia, and AssemblyAI. Easily generate audio content, transcribe speech, and manage audio files with a unified API.

## Features

- 🎵 **Multi-Provider TTS**: Gemini, Deepgram, OpenAI, Groq PlayAI, and Cartesia TTS
- 🎙️ **Speech-to-Text**: Deepgram and AssemblyAI STT with advanced features
- 🔧 **Audio Merging**: Combine multiple audio files seamlessly
- 🎯 **Simple API**: Easy-to-use functions with consistent interface
- 📦 **ESM Ready**: Modern ES modules support

## Installation

```bash
npm install multi-voice-sdk
```

## Quick Start

```javascript
import { tts, stt, merge } from "multi-voice-sdk";

// Generate speech with OpenAI
tts({
  provider: "openai",
  apiKey: "your-api-key",
  text: "Hello, world!",
  voice: "nova",
  outputFile: "output.mp3",
});

// Transcribe audio with Deepgram
stt({
  apiKey: "your-deepgram-key",
  audioFile: "https://example.com/audio.wav", // Can be URL or local file
});

// Merge multiple audio files
merge({
  inputFiles: ["file1.mp3", "file2.mp3"],
  outputFile: "combined.mp3",
});
```

## API Reference

### `tts(options)`

Generate speech from text using various TTS providers.

#### Parameters

| Parameter    | Type     | Required | Description                                                                   |
| ------------ | -------- | -------- | ----------------------------------------------------------------------------- |
| `provider`   | `string` | ✅       | TTS provider: `"gemini"`, `"deepgram"`, `"openai"`, `"groq"`, or `"cartesia"` |
| `apiKey`     | `string` | ✅       | API key for the chosen provider                                               |
| `text`       | `string` | ✅       | Text to convert to speech                                                     |
| `voice`      | `string` | ✅       | Voice identifier (provider-specific, for Cartesia use voice ID)               |
| `outputFile` | `string` | optional | Output file path (default: `"output.mp3"`)                                    |
| `model`      | `string` | optional | Model to use (provider-specific)                                              |
| `prompt`     | `string` | optional | Additional instructions for speech generation                                 |

#### Examples

**OpenAI TTS**

```javascript
tts({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini-tts",
  text: "Hello from OpenAI!",
  voice: "nova",
  prompt: "Speak in a cheerful tone",
  outputFile: "openai_output.mp3",
});
```

**Google Gemini TTS**

```javascript
tts({
  provider: "gemini",
  apiKey: process.env.GEMINI_API_KEY,
  text: "Hello from Gemini!",
  voice: "iapetus",
  prompt: "In a pleasant and calm tone",
  outputFile: "gemini_output.mp3",
});
```

**Deepgram TTS**

```javascript
tts({
  provider: "deepgram",
  apiKey: process.env.DEEPGRAM_API_KEY,
  text: "Hello from Deepgram!",
  voice: "aura-2-luna-en",
  outputFile: "deepgram_output.mp3",
});
```

**Groq PlayAI TTS**

```javascript
tts({
  provider: "groq",
  apiKey: process.env.GROQ_API_KEY,
  text: "Hello from Groq PlayAI!",
  voice: "Arista-PlayAI",
  outputFile: "groq_output.wav",
});
```

**Cartesia TTS**

```javascript
tts({
  provider: "cartesia",
  apiKey: process.env.CARTESIA_API_KEY,
  text: "Hello from Cartesia!",
  voice: "694f9389-aac1-45b6-b726-9d9369183238", // Voice ID
  outputFile: "cartesia_output.mp3",
});
```

### `stt(options)`

Transcribe audio to text using Speech-to-Text providers.

#### Parameters

| Parameter         | Type      | Required | Description                                                               |
| ----------------- | --------- | -------- | ------------------------------------------------------------------------- |
| `provider`        | `string`  | ✅       | STT provider: `"deepgram"` or `"assemblyai"`                              |
| `apiKey`          | `string`  | ✅       | API key for the chosen provider                                           |
| `audioFile`       | `string`  | ✅       | Path to local audio file or URL of remote audio file to transcribe        |
| `outputFile`      | `string`  | optional | Output file path for results (default: `"transcription.json"`)            |
| `model`           | `string`  | optional | Model to use (default: `"nova-3"`)                                        |
| `smartFormat`     | `boolean` | optional | Enable smart formatting (default: `true`)                                 |
| `detect_language` | `boolean` | optional | Automatic language detection (default: `true`)                            |
| `punctuate`       | `boolean` | optional | Enable punctuation (default: `true`)                                      |
| `diarize`         | `boolean` | optional | Enable speaker diarization (default: `false`)                             |
| `channels`        | `number`  | optional | Number of audio channels (default: `1`)                                   |
| `fullResponse`    | `boolean` | optional | Return full response object instead of just transcript (default: `false`) |

#### Returns

- **Default**: Returns transcript as a string
- **With `fullResponse: true`**: Returns object with transcript, confidence, words, and metadata

#### Examples

### `Deepgram : Basic Transcription (Remote URL)`

```javascript
stt({
  provider: "deepgram",
  apiKey: process.env.DEEPGRAM_API_KEY,
  audioFile: "https://example.com/audio.wav", // Remote URL
});
```

### `Deepgram : Local File Transcription`

```javascript
stt({
  provider: "deepgram",
  apiKey: process.env.DEEPGRAM_API_KEY,
  audioFile: "./my-audio.mp3", // Local file path
  outputFile: "transcription.json",
});
```

### `AssemblyAI : Basic Transcription (Remote URL)`

```javascript
stt({
  provider: "assemblyai",
  apiKey: process.env.ASSEMBLYAI_API_KEY,
  audioFile: "https://example.com/audio.wav", // Remote URL
  outputFile: "transcription.json",
});
```

### `AssemblyAI : Local File Transcription`

```javascript
stt({
  provider: "assemblyai",
  apiKey: process.env.ASSEMBLYAI_API_KEY,
  audioFile: "./my-audio.mp3", // Local file path
  outputFile: "transcription.json",
  fullResponse: true, // Get detailed response
});
```

### `merge(options)`

Merge multiple audio files into a single file.

#### Parameters

| Parameter    | Type       | Required | Description               |
| ------------ | ---------- | -------- | ------------------------- |
| `inputFiles` | `string[]` | ✅       | Array of input file paths |
| `outputFile` | `string`   | ✅       | Output file path          |

#### Example

```javascript
merge({
  inputFiles: ["intro.mp3", "main.mp3", "outro.mp3"],
  outputFile: "complete_audio.mp3",
});
```

## Supported Voices

### OpenAI

- `alloy`, `ash`, `ballad`, `coral`, `echo`, `fable`, `onyx`, `nova`, `sage`, `shimmer`, `verse`

### Gemini

- `zephyr` (Bright), `puck` (Upbeat), `charon` (Informative), `kore` (Firm), `fenrir` (Excitable), `leda` (Youthful), `orus` (Firm), `aoede` (Breezy), `autonoe` (Bright), `enceladus` (Breathy), `iapetus` (Clear)

For a complete list of available Gemini voices, see: [Gemini Speech Generation Documentation](https://ai.google.dev/gemini-api/docs/speech-generation#voices)

### Deepgram

- `aura-2-luna-en`, `aura-2-stella-en`, `aura-2-arcas-en`, and more

For a complete list of available Deepgram voices, see: [Deepgram TTS Models Documentation](https://developers.deepgram.com/docs/tts-models#featured-voices)

### Groq PlayAI

- `Atlas-PlayAI`, `Arista-PlayAI`, `Basil-PlayAI`, `Briggs-PlayAI`, and more

For a complete list of available Groq PlayAI voices, see: [Groq TTS Documentation](https://console.groq.com/docs/text-to-speech)

### Cartesia

Cartesia uses voice IDs instead of voice names. Example voice IDs:

- `694f9389-aac1-45b6-b726-9d9369183238` (Default voice)
- Use the Cartesia console to find available voice IDs for your account

For more information about Cartesia voices, see: [Cartesia Console](https://play.cartesia.ai/voices)

## Environment Variables

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
GROQ_API_KEY=your_groq_api_key
CARTESIA_API_KEY=your_cartesia_api_key
```

## Requirements

- Node.js 16.x or higher

## License

ISC
