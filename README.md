# Multi-Voice SDK

A universal Text-to-Speech (TTS) SDK that supports multiple providers including Google Gemini, Deepgram, and OpenAI. Easily generate and manage audio content with a unified API.

## Features

- 🎵 **Multi-Provider Support**: Gemini, Deepgram, and OpenAI TTS
- 🔧 **Audio Merging**: Combine multiple audio files seamlessly
- 🎛️ **Voice Customization**: Support for different voices and models
- 🎯 **Simple API**: Easy-to-use functions with consistent interface
- 📦 **ESM Ready**: Modern ES modules support

## Installation

```bash
npm install multi-voice-sdk
```

## Quick Start

```javascript
import { tts, merge } from "multi-voice-sdk";

// Generate speech with OpenAI
await tts({
  provider: "openai",
  apiKey: "your-api-key",
  text: "Hello, world!",
  voice: "nova",
  outputFile: "output.mp3",
});

// Merge multiple audio files
await merge({
  inputFiles: ["file1.mp3", "file2.mp3"],
  outputFile: "combined.mp3",
});
```

## API Reference

### `tts(options)`

Generate speech from text using various TTS providers.

#### Parameters

| Parameter    | Type     | Required | Description                                           |
| ------------ | -------- | -------- | ----------------------------------------------------- |
| `provider`   | `string` | ✅       | TTS provider: `"gemini"`, `"deepgram"`, or `"openai"` |
| `apiKey`     | `string` | ✅       | API key for the chosen provider                       |
| `text`       | `string` | ✅       | Text to convert to speech                             |
| `voice`      | `string` | ✅       | Voice identifier (provider-specific)                  |
| `outputFile` | `string` | ❌       | Output file path (default: `"output.mp3"`)            |
| `model`      | `string` | ❌       | Model to use (provider-specific)                      |
| `prompt`     | `string` | ❌       | Additional instructions for speech generation         |

#### Examples

**OpenAI TTS**

```javascript
await tts({
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
await tts({
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
await tts({
  provider: "deepgram",
  apiKey: process.env.DEEPGRAM_API_KEY,
  text: "Hello from Deepgram!",
  voice: "aura-2-luna-en",
  outputFile: "deepgram_output.mp3",
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
await merge({
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

## Environment Variables

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
```

## Requirements

- Node.js 16.x or higher

## License

ISC
