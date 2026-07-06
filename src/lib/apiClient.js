// BYOK API Client - Bring Your Own Key
// Supports OpenRouter with auto-model selection and open source LLMs
// Environment variables take precedence (for Vercel deployment)

const API_KEY_STORAGE = "iris_byok_api_key";
const API_BASE_STORAGE = "iris_byok_api_base";
const LLM_MODEL_STORAGE = "iris_byok_llm_model";
const TTS_KEY_STORAGE = "iris_byok_tts_key";
const AUTO_MODEL_STORAGE = "iris_byok_auto_model";

export const DEFAULT_API_BASE = "https://openrouter.ai/api/v1";

// Environment variable support for Vercel deployment
const ENV_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
const ENV_API_BASE = import.meta.env.VITE_OPENROUTER_API_BASE || import.meta.env.VITE_OPENAI_API_BASE;
const ENV_LLM_MODEL = import.meta.env.VITE_LLM_MODEL;
const ENV_TTS_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// OpenRouter Models - Curated list of best open source LLMs
// Sorted by capability tier
export const LLM_MODELS = [
  // Tier 1: Most Capable (Reasoning/Agent)
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", description: "Best overall reasoning", tier: 1, supports_vision: true, context_length: 200000 },
  { id: "google/gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "Google", description: "Fast & capable", tier: 1, supports_vision: true, context_length: 1000000 },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", description: "Most capable", tier: 1, supports_vision: true, context_length: 128000 },
  
  // Tier 2: Fast & Smart (General Purpose)
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", description: "Fastest & efficient", tier: 2, supports_vision: true, context_length: 200000 },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", description: "Long context", tier: 2, supports_vision: true, context_length: 2000000 },
  { id: "mistralai/mistral-nemo-12b-instruct", name: "Mistral Nemo", provider: "Mistral", description: "Balanced performance", tier: 2, supports_vision: false, context_length: 128000 },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Meta", description: "Open source powerhouse", tier: 2, supports_vision: false, context_length: 128000 },
  
  // Tier 3: Free & Open Source
  { id: "meta-llama/llama-3.2-3b-instruct", name: "Llama 3.2 3B", provider: "Meta", description: "Fast local model", tier: 3, supports_vision: true, context_length: 128000 },
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", provider: "Qwen", description: "Powerful open source", tier: 3, supports_vision: false, context_length: 32000 },
  { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B", provider: "Mistral", description: "Efficient & fast", tier: 3, supports_vision: false, context_length: 32000 },
  { id: "microsoft/phi-3-medium", name: "Phi-3 Medium", provider: "Microsoft", description: "Small & capable", tier: 3, supports_vision: false, context_length: 128000 },
  { id: "google/gemma-2-27b-it", name: "Gemma 2 27B", provider: "Google", description: "Efficient open model", tier: 3, supports_vision: false, context_length: 8000 },
  
  // Tier 4: Ultra Fast (Code/Simple Tasks)
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", description: "Fast & cheap", tier: 4, supports_vision: true, context_length: 128000 },
  { id: "google/gemini-flash-1.5", name: "Gemini Flash 1.5", provider: "Google", description: "Very fast", tier: 4, supports_vision: true, context_length: 1000000 },
];

// Model presets for different use cases
export const MODEL_PRESETS = [
  { id: "auto", name: "Auto-Select", description: "Best model for the task" },
  { id: "balanced", name: "Balanced", description: "Good performance & cost" },
  { id: "fast", name: "Fast", description: "Quick responses" },
  { id: "powerful", name: "Powerful", description: "Maximum capability" },
  { id: "free", name: "Free", description: "Open source models" },
];

// TTS Providers
export const TTS_PROVIDERS = [
  { id: "openai", name: "OpenAI TTS", baseUrl: "https://api.openai.com/v1" },
  { id: "elevenlabs", name: "ElevenLabs", baseUrl: "https://api.elevenlabs.io/v1" },
];

// Getters
export function getStoredApiKey() {
  return ENV_API_KEY || localStorage.getItem(API_KEY_STORAGE) || "";
}

export function getStoredApiBase() {
  return ENV_API_BASE || localStorage.getItem(API_BASE_STORAGE) || DEFAULT_API_BASE;
}

export function getStoredLlmModel() {
  return ENV_LLM_MODEL || localStorage.getItem(LLM_MODEL_STORAGE) || "anthropic/claude-3-haiku";
}

export function getStoredTtsKey() {
  return ENV_TTS_KEY || localStorage.getItem(TTS_KEY_STORAGE) || localStorage.getItem("jarvis-el-key") || "";
}

export function getAutoModelEnabled() {
  return localStorage.getItem(AUTO_MODEL_STORAGE) === "true";
}

// Setters
export function saveApiKey(key) {
  if (!ENV_API_KEY) localStorage.setItem(API_KEY_STORAGE, key);
}

export function saveApiBase(base) {
  if (!ENV_API_BASE) localStorage.setItem(API_BASE_STORAGE, base);
}

export function saveLlmModel(model) {
  if (!ENV_LLM_MODEL) localStorage.setItem(LLM_MODEL_STORAGE, model);
}

export function saveTtsKey(key) {
  if (!ENV_TTS_KEY) localStorage.setItem(TTS_KEY_STORAGE, key);
}

export function saveAutoModelEnabled(enabled) {
  localStorage.setItem(AUTO_MODEL_STORAGE, enabled ? "true" : "false");
}

// Checkers
export function hasApiKey() {
  return getStoredApiKey().length > 10;
}

export function hasTtsKey() {
  return getStoredTtsKey().length > 10;
}

// Auto-select model based on task complexity
export function autoSelectModel(taskType = "general") {
  const taskModels = {
    vision: LLM_MODELS.filter(m => m.supports_vision && m.tier <= 2),
    long_context: LLM_MODELS.filter(m => m.context_length >= 100000),
    fast: LLM_MODELS.filter(m => m.tier >= 3),
    general: LLM_MODELS.filter(m => m.tier <= 2),
    reasoning: LLM_MODELS.filter(m => m.tier === 1),
  };
  
  const candidates = taskModels[taskType] || taskModels.general;
  if (candidates.length === 0) return "anthropic/claude-3-haiku";
  
  return candidates.sort((a, b) => a.tier - b.tier)[0].id;
}

// Generic fetch wrapper
async function apiFetch(endpoint, options = {}) {
  const apiKey = getStoredApiKey();
  const apiBase = getStoredApiBase();
  
  if (!apiKey) {
    throw new Error("No API key configured. Add your OpenRouter key in Settings.");
  }
  
  const url = endpoint.startsWith("http") ? endpoint : `${apiBase}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    ...options.headers,
  };
  
  // OpenRouter-specific headers
  if (apiBase.includes("openrouter")) {
    headers["HTTP-Referer"] = window.location.origin || "https://iris-os.vercel.app";
    headers["X-Title"] = "IRIS OS";
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || `API Error: ${response.status}`);
  }
  
  return response.json();
}

// LLM Integration - OpenRouter compatible
export async function invokeLLM({ prompt, messages, model, temperature = 0.7, max_tokens = 1000, taskType = "general" }) {
  const chatMessages = messages || [{ role: "user", content: prompt }];
  
  let selectedModel = model || getStoredLlmModel();
  if (getAutoModelEnabled() && !model) {
    selectedModel = autoSelectModel(taskType);
  }
  
  const response = await apiFetch("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: selectedModel,
      messages: chatMessages,
      temperature,
      max_tokens,
    }),
  });
  
  return response.choices?.[0]?.message?.content || "";
}

// TTS - OpenAI TTS
export async function generateSpeech({ text, voice = "alloy", model = "tts-1" }) {
  const apiKey = getStoredApiKey();
  const apiBase = getStoredApiBase();
  
  if (!apiKey) {
    throw new Error("No API key configured for TTS.");
  }
  
  const response = await fetch(`${apiBase}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      voice,
      input: text.slice(0, 4096),
    }),
  });
  
  if (!response.ok) {
    throw new Error(`TTS Error: ${response.status}`);
  }
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// ElevenLabs TTS
export async function generateSpeechElevenLabs({ text, voice_id, api_key }) {
  const key = api_key || getStoredTtsKey();
  
  if (!key) {
    throw new Error("No ElevenLabs API key configured.");
  }
  
  const voice = voice_id || "rachel";
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": key,
    },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || `ElevenLabs Error: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    audio_url: data.audio_url || `data:audio/mpeg;base64,${data.audio_base64}`,
    audio_base64: data.audio_base64,
  };
}

// File upload
export async function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        file_url: reader.result,
        file_name: file.name,
        file_size: file.size,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Image analysis with vision
export async function analyzeImage({ image_url, prompt, model }) {
  let selectedModel = model || getStoredLlmModel();
  
  const modelInfo = LLM_MODELS.find(m => m.id === selectedModel);
  if (!modelInfo?.supports_vision) {
    selectedModel = autoSelectModel("vision");
  }
  
  const imageData = image_url;
  
  const response = await apiFetch("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt || "Describe this image in detail." },
            { type: "image_url", image_url: { url: imageData } },
          ],
        },
      ],
      max_tokens: 1000,
    }),
  });
  
  return response.choices?.[0]?.message?.content || "";
}

// Web search
export async function webSearch({ query, model }) {
  const selectedModel = model || getStoredLlmModel();
  
  const response = await apiFetch("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: selectedModel,
      messages: [{ role: "user", content: `Search for: ${query}. Provide a brief summary.` }],
      max_tokens: 500,
    }),
  });
  
  return response.choices?.[0]?.message?.content || "";
}

// Test connection & get available models
export async function testConnection() {
  try {
    const apiBase = getStoredApiBase();
    
    if (apiBase.includes("openrouter")) {
      const response = await apiFetch("/models", { method: "GET" });
      return { 
        success: true, 
        provider: "OpenRouter",
        models: response.data?.slice(0, 10) || [],
      };
    } else {
      const response = await apiFetch("/models", { method: "GET" });
      return { 
        success: true, 
        provider: "OpenAI Compatible",
        models: response.data?.slice(0, 10) || [],
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Default export
export const byok = {
  invokeLLM,
  generateSpeech,
  generateSpeechElevenLabs,
  uploadFile,
  analyzeImage,
  webSearch,
  testConnection,
  autoSelectModel,
  LLM_MODELS,
  MODEL_PRESETS,
  getStoredApiKey,
  saveApiKey,
  getStoredApiBase,
  saveApiBase,
  getStoredLlmModel,
  saveLlmModel,
  getAutoModelEnabled,
  saveAutoModelEnabled,
  getStoredTtsKey,
  saveTtsKey,
  hasApiKey,
  hasTtsKey,
  DEFAULT_API_BASE,
};

export default byok;