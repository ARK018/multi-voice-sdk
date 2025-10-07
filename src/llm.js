import OpenAI from "openai";

/**
 * Generate text using OpenAI's language models
 * @param {Object} options - LLM configuration options
 * @param {string} options.apiKey - OpenAI API key
 * @param {string} options.text - Input text/prompt
 * @param {string} [options.model="gpt-4o-mini"] - Model to use
 * @param {string} [options.systemPrompt] - System message to set context
 * @param {number} [options.temperature=0.7] - Sampling temperature (0-2)
 * @param {number} [options.maxTokens] - Maximum tokens to generate
 * @param {boolean} [options.stream=false] - Whether to stream the response
 * @returns {Promise<string|AsyncGenerator>} Promise that resolves with generated text or stream
 */
export async function llm({
  apiKey,
  text,
  model = "gpt-4o-mini",
  systemPrompt,
  temperature = 0.7,
  maxTokens,
  stream = false,
}) {
  if (!apiKey || !text) {
    throw new Error("Missing required parameters: apiKey or text.");
  }

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

    console.log(`🤖 Generating response with ${model}...`);

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

      console.log(`✅ Response generated successfully`);
      return response;
    }
  } catch (err) {
    console.error("❌ OpenAI LLM error:", err.message);
    throw err;
  }
}

/**
 * Generate text using OpenAI's language models with conversation history
 * @param {Object} options - LLM configuration options
 * @param {string} options.apiKey - OpenAI API key
 * @param {Array<{role: string, content: string}>} options.messages - Conversation history
 * @param {string} [options.model="gpt-4o-mini"] - Model to use
 * @param {number} [options.temperature=0.7] - Sampling temperature (0-2)
 * @param {number} [options.maxTokens] - Maximum tokens to generate
 * @param {boolean} [options.stream=false] - Whether to stream the response
 * @returns {Promise<string|AsyncGenerator>} Promise that resolves with generated text or stream
 */
export async function llmChat({
  apiKey,
  messages,
  model = "gpt-4o-mini",
  temperature = 0.7,
  maxTokens,
  stream = false,
}) {
  if (!apiKey || !messages || !Array.isArray(messages)) {
    throw new Error("Missing required parameters: apiKey or messages array.");
  }

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

    console.log(`🤖 Generating chat response with ${model}...`);

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

      console.log(`✅ Chat response generated successfully`);
      return response;
    }
  } catch (err) {
    console.error("❌ OpenAI Chat error:", err.message);
    throw err;
  }
}
