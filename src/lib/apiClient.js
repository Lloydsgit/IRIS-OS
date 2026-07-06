// IRIS AI Client - Universal API Client
// Supports ALL AI Providers: DeepSeek, Gemini, OpenRouter, OpenAI, Groq, Claude, etc.

const API_KEY_STORAGE = "iris_byok_api_key";
const API_BASE_STORAGE = "iris_byok_api_base";
const LLM_MODEL_STORAGE = "iris_byok_llm_model";
const TTS_KEY_STORAGE = "iris_byok_tts_key";
const AUTO_MODEL_STORAGE = "iris_byok_auto_model";

// All supported AI providers with your API keys
export const PROVIDERS = {
  deepseek: {
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    apiKeyEnv: "VITE_DEEPSEEK_API_KEY",
    models: ["deepseek-chat", "deepseek-coder"],
    requiresKey: true
  },
  gemini: {
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    apiKeyEnv: "VITE_GEMINI_API_KEY",
    models: ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"],
    requiresKey: true
  },
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKeyEnv: "VITE_OPENROUTER_API_KEY",
    models: ["anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash-exp", "meta-llama/llama-3.1-70b-instruct"],
    requiresKey: true
  },
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    apiKeyEnv: "VITE_OPENAI_API_KEY",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    requiresKey: true
  },
  groq: {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    apiKeyEnv: "VITE_GROQ_API_KEY",
    models: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    requiresKey: true
  },
  anthropic: {
    name: "Claude (Anthropic)",
    baseUrl: "https://api.anthropic.com/v1",
    apiKeyEnv: "VITE_ANTHROPIC_API_KEY",
    models: ["claude-3-5-sonnet-latest", "claude-3-opus-latest", "claude-3-haiku-latest"],
    requiresKey: true
  },
  ollama: {
    name: "Ollama (Local)",
    baseUrl: "http://localhost:11434/v1",
    apiKeyEnv: null,
    models: ["llama3", "mistral", "phi3", "qwen2.5"],
    requiresKey: false
  },
  lmstudio: {
    name: "LM Studio (Local)",
    baseUrl: "http://localhost:1234/v1",
    apiKeyEnv: null,
    models: ["local-model"],
    requiresKey: false
  }
};

// Get API key from environment or storage
function getEnvKey(envName) {
  return import.meta.env[envName] || "";
}

// Detect provider from API base URL
export function detectProvider(url) {
  if (!url) return "openrouter";
  const u = url.toLowerCase();
  if (u.includes("deepseek")) return "deepseek";
  if (u.includes("anthropic")) return "anthropic";
  if (u.includes("google") || u.includes("generativelanguage")) return "gemini";
  if (u.includes("groq")) return "groq";
  if (u.includes("openrouter")) return "openrouter";
  if (u.includes("localhost") || u.includes("ollama")) return "ollama";
  if (u.includes("lmstudio")) return "lmstudio";
  if (u.includes("openai")) return "openai";
  return "openrouter";
}

export const DEFAULT_API_BASE = "https://api.deepseek.com/v1";

// Get API key - try multiple providers
function getEffectiveApiKey() {
  return getEnvKey("VITE_DEEPSEEK_API_KEY") || 
         getEnvKey("VITE_OPENROUTER_API_KEY") || 
         getEnvKey("VITE_OPENAI_API_KEY") || 
         getEnvKey("VITE_GROQ_API_KEY") ||
         localStorage.getItem(API_KEY_STORAGE) || "";
}

// Environment variables
const ENV_API_KEY = getEffectiveApiKey();
const ENV_API_BASE = import.meta.env.VITE_API_BASE || localStorage.getItem(API_BASE_STORAGE) || DEFAULT_API_BASE;
const ENV_LLM_MODEL = import.meta.env.VITE_LLM_MODEL;
const ENV_TTS_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || getEnvKey("VITE_ELEVENLABS_API_KEY");

// All available LLM models
export const LLM_MODELS = [
  // DeepSeek
  { id: "deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek", description: "DeepSeek's main model", tier: 1, supports_vision: false },
  { id: "deepseek-coder", name: "DeepSeek Coder", provider: "DeepSeek", description: "For code assistance", tier: 1, supports_vision: false },
  
  // Google Gemini
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "Google", description: "Fast & capable", tier: 1, supports_vision: true },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", description: "Long context", tier: 1, supports_vision: true },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google", description: "Fast responses", tier: 2, supports_vision: true },
  
  // OpenAI
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", description: "Most capable", tier: 1, supports_vision: true },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", description: "Fast & affordable", tier: 2, supports_vision: true },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI", description: "Previous flagship", tier: 1, supports_vision: true },
  
  // Claude (via OpenRouter)
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", description: "Best reasoning", tier: 1, supports_vision: true },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", description: "Fastest & efficient", tier: 2, supports_vision: true },
  
  // OpenRouter - Open Source
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Meta", description: "Open source powerhouse", tier: 2, supports_vision: false },
  { id: "mistralai/mistral-nemo-12b-instruct", name: "Mistral Nemo", provider: "Mistral", description: "Balanced", tier: 2, supports_vision: false },
  
  // Groq
  { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B (Groq)", provider: "Groq", description: "Ultra fast inference", tier: 2, supports_vision: false },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (Groq)", provider: "Groq", description: "Fast MoE model", tier: 2, supports_vision: false },
  
  // Local (Ollama)
  { id: "llama3", name: "Llama 3 (Local)", provider: "Ollama", description: "Free local model", tier: 3, supports_vision: false },
  { id: "mistral", name: "Mistral 7B (Local)", provider: "Ollama", description: "Free local model", tier: 3, supports_vision: false },
];

// Model presets
export const MODEL_PRESETS = [
  { id: "auto", name: "Auto-Select", description: "Best model for the task" },
  { id: "deepseek", name: "DeepSeek", description: "Use DeepSeek API" },
  { id: "gemini", name: "Gemini", description: "Use Google Gemini" },
  { id: "openai", name: "OpenAI", description: "Use OpenAI GPT-4" },
  { id: "groq", name: "Groq (Fast)", description: "Use Groq for speed" },
];

// Local LLM Models
export const LOCAL_MODELS = [
  { id: "llama3", name: "Llama 3", context: 8192 },
  { id: "mistral", name: "Mistral 7B", context: 8192 },
  { id: "phi3", name: "Phi-3", context: 4096 },
  { id: "qwen2.5", name: "Qwen 2.5", context: 32768 },
];

// Local Providers
export const LOCAL_PROVIDERS = [
  { id: "ollama", name: "Ollama", baseUrl: "http://localhost:11434/v1" },
  { id: "lmstudio", name: "LM Studio", baseUrl: "http://localhost:1234/v1" },
];

export function isLocalProvider() {
  const base = getStoredApiBase();
  return base.includes("localhost");
}

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
  // Local providers don't need API key
  if (isLocalProvider()) return true;
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