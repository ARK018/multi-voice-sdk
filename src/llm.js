import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

/**
 * Generate text using language models (OpenAI or Google Gemini)
 * @param {Object} options - LLM configuration options
 * @param {string} [options.provider="openai"] - Provider to use ("openai" or "gemini")
 * @param {string} options.apiKey - API key for the selected provider
 * @param {string} options.text - Input text/prompt
 * @param {string} [options.model] - Model to use (defaults based on provider)
 * @param {string} [options.systemPrompt] - System message to set context
 * @param {number} [options.temperature=0.7] - Sampling temperature (0-2)
 * @param {number} [options.maxTokens] - Maximum tokens to generate
 * @param {boolean} [options.stream=false] - Whether to stream the response
 * @returns {Promise<string|AsyncGenerator>} Promise that resolves with generated text or stream
 */
export async function llm({
  provider = "openai",
  apiKey,
  text,
  model,
  systemPrompt,
  temperature = 0.7,
  maxTokens,
  stream = false,
}) {
  if (!apiKey || !text) {
    throw new Error("Missing required parameters: apiKey or text.");
  }

  // Set default model based on provider
  if (!model) {
    model = provider === "gemini" ? "gemini-2.0-flash-exp" : "gpt-4o-mini";
  }

  try {
    if (provider === "openai") {
      return await generateWithOpenAI({
        apiKey,
        text,
        model,
        systemPrompt,
        temperature,
        maxTokens,
        stream,
      });
    } else if (provider === "gemini") {
      return await generateWithGemini({
        apiKey,
        text,
        model,
        systemPrompt,
        temperature,
        maxTokens,
        stream,
      });
    } else {
      throw new Error(
        `Unsupported provider: ${provider}. Supported providers are "openai" and "gemini".`
      );
    }
  } catch (err) {
    console.error(`❌ ${provider.toUpperCase()} LLM error:`, err.message);
    throw err;
  }
}

/**
 * Generate text using OpenAI's language models
 */
async function generateWithOpenAI({
  apiKey,
  text,
  model,
  systemPrompt,
  temperature,
  maxTokens,
  stream,
}) {
  try {
    const openai = new OpenAI({ apiKey });

    const messages = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    // Add user message
    messages.push({ role: "user", content: text });

    const requestOptions = {
      model,
      messages,
      temperature,
      stream,
    };

    // Add max_tokens if provided
    if (maxTokens) {
      requestOptions.max_tokens = maxTokens;
    }

    console.log(`🤖 Generating response with OpenAI ${model}...`);

    if (stream) {
      // Return the stream for the caller to handle
      const stream = await openai.chat.completions.create(requestOptions);
      return stream;
    } else {
      // Return the complete response
      const completion = await openai.chat.completions.create(requestOptions);
      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("No response generated from OpenAI");
      }

      console.log(`✅ OpenAI response generated successfully`);
      return response;
    }
  } catch (err) {
    console.error("❌ OpenAI LLM error:", err.message);
    throw err;
  }
}

/**
 * Generate text using Google Gemini's language models
 */
async function generateWithGemini({
  apiKey,
  text,
  model,
  systemPrompt,
  temperature,
  maxTokens,
  stream,
}) {
  try {
    const genAI = new GoogleGenAI(apiKey);

    console.log(`🤖 Generating response with Gemini ${model}...`);

    const requestOptions = {
      model,
      contents: text,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    if (systemPrompt) {
      requestOptions.systemInstruction = systemPrompt;
    }

    if (stream) {
      // Return the stream for the caller to handle
      const result = await genAI.models.generateContentStream(requestOptions);
      return result;
    } else {
      // Return the complete response
      const result = await genAI.models.generateContent(requestOptions);
      const response = result.text;

      if (!response) {
        throw new Error("No response generated from Gemini");
      }

      console.log(`✅ Gemini response generated successfully`);
      return response;
    }
  } catch (err) {
    console.error("❌ Gemini LLM error:", err.message);
    throw err;
  }
}

/**
 * Generate text using language models with conversation history (OpenAI or Google Gemini)
 * @param {Object} options - LLM configuration options
 * @param {string} [options.provider="openai"] - Provider to use ("openai" or "gemini")
 * @param {string} options.apiKey - API key for the selected provider
 * @param {Array<{role: string, content: string}>} options.messages - Conversation history
 * @param {string} [options.model] - Model to use (defaults based on provider)
 * @param {number} [options.temperature=0.7] - Sampling temperature (0-2)
 * @param {number} [options.maxTokens] - Maximum tokens to generate
 * @param {boolean} [options.stream=false] - Whether to stream the response
 * @returns {Promise<string|AsyncGenerator>} Promise that resolves with generated text or stream
 */
export async function llmChat({
  provider = "openai",
  apiKey,
  messages,
  model,
  temperature = 0.7,
  maxTokens,
  stream = false,
}) {
  if (!apiKey || !messages || !Array.isArray(messages)) {
    throw new Error("Missing required parameters: apiKey or messages array.");
  }

  // Set default model based on provider
  if (!model) {
    model = provider === "gemini" ? "gemini-2.0-flash-exp" : "gpt-4o-mini";
  }

  try {
    if (provider === "openai") {
      return await chatWithOpenAI({
        apiKey,
        messages,
        model,
        temperature,
        maxTokens,
        stream,
      });
    } else if (provider === "gemini") {
      return await chatWithGemini({
        apiKey,
        messages,
        model,
        temperature,
        maxTokens,
        stream,
      });
    } else {
      throw new Error(
        `Unsupported provider: ${provider}. Supported providers are "openai" and "gemini".`
      );
    }
  } catch (err) {
    console.error(`❌ ${provider.toUpperCase()} Chat error:`, err.message);
    throw err;
  }
}

/**
 * Generate text using OpenAI's language models with conversation history
 */
async function chatWithOpenAI({
  apiKey,
  messages,
  model,
  temperature,
  maxTokens,
  stream,
}) {
  try {
    const openai = new OpenAI({ apiKey });

    const requestOptions = {
      model,
      messages,
      temperature,
      stream,
    };

    // Add max_tokens if provided
    if (maxTokens) {
      requestOptions.max_tokens = maxTokens;
    }

    console.log(`🤖 Generating chat response with OpenAI ${model}...`);

    if (stream) {
      // Return the stream for the caller to handle
      const stream = await openai.chat.completions.create(requestOptions);
      return stream;
    } else {
      // Return the complete response
      const completion = await openai.chat.completions.create(requestOptions);
      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("No response generated from OpenAI");
      }

      console.log(`✅ OpenAI chat response generated successfully`);
      return response;
    }
  } catch (err) {
    console.error("❌ OpenAI Chat error:", err.message);
    throw err;
  }
}

/**
 * Generate text using Google Gemini's language models with conversation history
 */
async function chatWithGemini({
  apiKey,
  messages,
  model,
  temperature,
  maxTokens,
  stream,
}) {
  try {
    const genAI = new GoogleGenAI(apiKey);

    console.log(`🤖 Generating chat response with Gemini ${model}...`);

    // Convert OpenAI-style messages to a single conversation string
    const conversationText = messages
      .map((msg) => {
        const role =
          msg.role === "assistant"
            ? "Assistant"
            : msg.role === "system"
            ? "System"
            : "User";
        return `${role}: ${msg.content}`;
      })
      .join("\n\n");

    const requestOptions = {
      model,
      contents: conversationText,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    if (stream) {
      // Return the stream for the caller to handle
      const result = await genAI.models.generateContentStream(requestOptions);
      return result;
    } else {
      // Return the complete response
      const result = await genAI.models.generateContent(requestOptions);
      const response = result.text;

      if (!response) {
        throw new Error("No response generated from Gemini");
      }

      console.log(`✅ Gemini chat response generated successfully`);
      return response;
    }
  } catch (err) {
    console.error("❌ Gemini Chat error:", err.message);
    throw err;
  }
}
