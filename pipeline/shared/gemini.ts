import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import OpenAI from 'openai';

// ============================================
// AI Provider Configuration
// DeepSeek as primary, Gemini as fallback
// ============================================

let deepseekClient: OpenAI | null = null;
let genAI: GoogleGenerativeAI | null = null;
let geminiModel: GenerativeModel | null = null;

type AIProvider = 'deepseek' | 'gemini';
let currentProvider: AIProvider = 'deepseek';

function getDeepSeekClient(): OpenAI | null {
  if (deepseekClient) return deepseekClient;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn('DEEPSEEK_API_KEY not found, will use Gemini');
    return null;
  }

  deepseekClient = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });
  return deepseekClient;
}

function getGeminiModel(): GenerativeModel | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found');
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }

  if (!geminiModel) {
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  return geminiModel;
}

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rawResponse?: string;
  provider?: AIProvider;
}

// For backwards compatibility
export type GeminiResponse<T> = AIResponse<T>;

// ============================================
// DeepSeek Implementation
// ============================================

async function generateJSONWithDeepSeek<T>(
  prompt: string,
  options: {
    config?: 'default' | 'creative' | 'fast';
    systemPrompt?: string;
  } = {}
): Promise<AIResponse<T>> {
  const client = getDeepSeekClient();
  if (!client) {
    return { success: false, error: 'DeepSeek client not available' };
  }

  const { config = 'default', systemPrompt } = options;
  const temperature = config === 'creative' ? 0.3 : 0.1;
  const maxTokens = config === 'fast' ? 2048 : 8192;

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    // DeepSeek requires 'json' in the prompt when using json_object response format
    const jsonInstruction = 'Please respond with valid JSON format.';

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt + '\n\n' + jsonInstruction });
    } else {
      messages.push({ role: 'system', content: jsonInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '';

    try {
      // Handle markdown code blocks if present
      let jsonText = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }

      const data = JSON.parse(jsonText) as T;
      return { success: true, data, rawResponse: text, provider: 'deepseek' };
    } catch (parseError) {
      return {
        success: false,
        error: `Failed to parse JSON response: ${parseError}`,
        rawResponse: text,
        provider: 'deepseek',
      };
    }
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message, provider: 'deepseek' };
  }
}

// ============================================
// Gemini Implementation
// ============================================

const DEFAULT_CONFIG: GenerationConfig = {
  temperature: 0.1,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

const CREATIVE_CONFIG: GenerationConfig = {
  temperature: 0.3,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

const FAST_CONFIG: GenerationConfig = {
  temperature: 0.1,
  maxOutputTokens: 2048,
  responseMimeType: 'application/json',
};

async function generateJSONWithGemini<T>(
  prompt: string,
  options: {
    config?: 'default' | 'creative' | 'fast';
    systemPrompt?: string;
    maxRetries?: number;
  } = {}
): Promise<AIResponse<T>> {
  const gemini = getGeminiModel();
  if (!gemini) {
    return { success: false, error: 'Gemini model not available' };
  }

  const { config = 'default', systemPrompt, maxRetries = 3 } = options;
  const generationConfig =
    config === 'creative' ? CREATIVE_CONFIG : config === 'fast' ? FAST_CONFIG : DEFAULT_CONFIG;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

      const result = await gemini.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      try {
        let jsonText = text;
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }

        const data = JSON.parse(jsonText) as T;
        return { success: true, data, rawResponse: text, provider: 'gemini' };
      } catch (parseError) {
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed to parse JSON response: ${parseError}`,
            rawResponse: text,
            provider: 'gemini',
          };
        }
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`Gemini API attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error after all retries',
    provider: 'gemini',
  };
}

// ============================================
// Main API - DeepSeek first, Gemini fallback
// ============================================

export async function generateJSON<T>(
  prompt: string,
  options: {
    model?: 'pro' | 'flash'; // kept for backwards compatibility, ignored now
    config?: 'default' | 'creative' | 'fast';
    systemPrompt?: string;
    maxRetries?: number;
  } = {}
): Promise<AIResponse<T>> {
  const { config = 'default', systemPrompt, maxRetries = 3 } = options;

  // Try DeepSeek first
  const deepseekClient = getDeepSeekClient();
  if (deepseekClient) {
    const result = await generateJSONWithDeepSeek<T>(prompt, { config, systemPrompt });
    if (result.success) {
      return result;
    }
    console.warn('DeepSeek failed, falling back to Gemini:', result.error);
  }

  // Fallback to Gemini
  return generateJSONWithGemini<T>(prompt, { config, systemPrompt, maxRetries });
}

export async function generateText(
  prompt: string,
  options: {
    model?: 'pro' | 'flash';
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
): Promise<string | null> {
  const { temperature = 0.3, maxTokens = 4096, systemPrompt } = options;

  // Try DeepSeek first
  const client = getDeepSeekClient();
  if (client) {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('DeepSeek text generation failed, falling back to Gemini:', error);
    }
  }

  // Fallback to Gemini
  const gemini = getGeminiModel();
  if (!gemini) {
    return null;
  }

  try {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const result = await gemini.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    return result.response.text();
  } catch (error) {
    console.error('Gemini text generation failed:', error);
    return null;
  }
}

// ============================================
// Legacy exports for backwards compatibility
// ============================================

export function getModel(type: 'pro' | 'flash' = 'pro'): GenerativeModel {
  const model = getGeminiModel();
  if (!model) {
    throw new Error('Gemini model not available');
  }
  return model;
}

// Rate limiting helper (kept for backwards compatibility)
const requestQueue: Array<() => Promise<void>> = [];
let isProcessing = false;
const MIN_INTERVAL_MS = 500; // Reduced since DeepSeek has better rate limits

async function processQueue(): Promise<void> {
  if (isProcessing || requestQueue.length === 0) return;

  isProcessing = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      await request();
      await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS));
    }
  }

  isProcessing = false;
}

export async function rateLimitedRequest<T>(request: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}
