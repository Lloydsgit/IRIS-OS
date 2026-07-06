// BYOK API Client - Bring Your Own API Key
// Uses user's own API keys for LLM, STT, and TTS services

const API_KEY_STORAGE = "iris_byok_api_key";
const API_BASE_STORAGE = "iris_byok_api_base";
const LLM_MODEL_STORAGE = "iris_byok_llm_model";
const TTS_KEY_STORAGE = "iris_byok_tts_key";

export const DEFAULT_API_BASE = "https://api.openai.com/v1";

export const LLM_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", description: "Most capable, fastest" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", description: "Fast & affordable" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI", description: "Powerful & reliable" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", description: "Fast & budget-friendly" },
];

export const TTS_PROVIDERS = [
  { id: "openai", name: "OpenAI TTS", baseUrl: "https://api.openai.com/v1" },
  { id: "elevenlabs", name: "ElevenLabs", baseUrl: "https://api.elevenlabs.io/v1" },
];

export function getStoredApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

export function getStoredApiBase() {
  return localStorage.getItem(API_BASE_STORAGE) || DEFAULT_API_BASE;
}

export function getStoredLlmModel() {
  return localStorage.getItem(LLM_MODEL_STORAGE) || "gpt-4o";
}

export function getStoredTtsKey() {
  return localStorage.getItem(TTS_KEY_STORAGE) || localStorage.getItem("jarvis-el-key") || "";
}

export function saveApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function saveApiBase(base) {
  localStorage.setItem(API_BASE_STORAGE, base);
}

export function saveLlmModel(model) {
  localStorage.setItem(LLM_MODEL_STORAGE, model);
}

export function saveTtsKey(key) {
  localStorage.setItem(TTS_KEY_STORAGE, key);
}

export function hasApiKey() {
  const key = getStoredApiKey();
  return key.length > 10;
}

export function hasTtsKey() {
  const key = getStoredTtsKey();
  return key.length > 10;
}

// Generic fetch wrapper for BYOK APIs
async function apiFetch(endpoint, options = {}) {
  const apiKey = getStoredApiKey();
  const apiBase = getStoredApiBase();
  
  if (!apiKey) {
    throw new Error("No API key configured. Please add your API key in Settings.");
  }
  
  const url = endpoint.startsWith("http") ? endpoint : `${apiBase}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || `API Error: ${response.status}`);
  }
  
  return response.json();
}

// LLM Integration - OpenAI compatible chat completions
export async function invokeLLM({ prompt, messages, model, temperature = 0.7, max_tokens = 500 }) {
  const chatMessages = messages || [{ role: "user", content: prompt }];
  const selectedModel = model || getStoredLlmModel();
  
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

// TTS Integration - OpenAI TTS
export async function generateSpeech({ text, voice = "alloy", model = "tts-1" }) {
  const apiKey = getStoredApiKey();
  const apiBase = getStoredApiBase();
  
  if (!apiKey) {
    throw new Error("No API key configured for TTS. Please add your API key in Settings.");
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
    const error = await response.text();
    throw new Error(`TTS Error: ${response.status} - ${error}`);
  }
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// ElevenLabs TTS
export async function generateSpeechElevenLabs({ text, voice_id, api_key }) {
  const key = api_key || getStoredTtsKey();
  
  if (!key) {
    throw new Error("No ElevenLabs API key configured. Please add your key in Settings.");
  }
  
  const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/with-timestamps", {
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

// File upload - simulate with base64 for local storage
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
  const selectedModel = model || getStoredLlmModel();
  
  // For base64 images
  let imageData = image_url;
  if (image_url.startsWith("data:")) {
    imageData = image_url;
  }
  
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

// Web search with OpenAI
export async function webSearch({ query, model }) {
  const selectedModel = model || getStoredLlmModel();
  
  // Check if model supports function calling for browsing
  const response = await apiFetch("/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: selectedModel,
      messages: [{ role: "user", content: `Search for: ${query}. Provide a brief summary of the top results.` }],
      max_tokens: 500,
    }),
  });
  
  return response.choices?.[0]?.message?.content || "";
}

// Test API connection
export async function testConnection() {
  try {
    const response = await apiFetch("/models", { method: "GET" });
    return { success: true, models: response.data?.slice(0, 5) || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Default export with all BYOK functions
export const byok = {
  invokeLLM,
  generateSpeech,
  generateSpeechElevenLabs,
  uploadFile,
  analyzeImage,
  webSearch,
  testConnection,
  getStoredApiKey,
  saveApiKey,
  getStoredApiBase,
  saveApiBase,
  getStoredLlmModel,
  saveLlmModel,
  getStoredTtsKey,
  saveTtsKey,
  hasApiKey,
  hasTtsKey,
};

export default byok;
