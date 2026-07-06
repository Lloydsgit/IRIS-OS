import { generateSpeech, generateSpeechElevenLabs, hasApiKey, hasTtsKey, getStoredApiKey } from "./apiClient";

// ── IRIS TTS Engine ──────────────────────────────────────────────────────────
// Uses BYOK API keys for TTS. Falls back through providers.
// Priority: ElevenLabs (if key) → OpenAI TTS (if key)

let currentAudio = null;
let currentController = null;

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}

export async function speak(text, voiceId) {
  if (!text?.trim()) return;
  
  // Stop any current speech
  stopSpeaking();
  
  const clean = text
    .replace(/\[.*?\]/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/─+/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n{3,}/g, "\n")
    .trim()
    .slice(0, 2500);
  
  if (!clean) return;
  
  const storedVoice = voiceId || localStorage.getItem("iris-tts-voice") || null;
  
  // Provider 1: ElevenLabs (if key available)
  if (hasTtsKey()) {
    try {
      currentController = new AbortController();
      const result = await generateSpeechElevenLabs({ 
        text: clean, 
        voice_id: storedVoice || "rachel" 
      });
      const audioUrl = result.audio_url || result.audio_base64;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        currentAudio = audio;
        await audio.play();
        return;
      }
    } catch (elError) {
      console.warn("[IRIS TTS] ElevenLabs failed:", elError.message);
    }
  }
  
  // Provider 2: OpenAI TTS (if API key available)
  if (hasApiKey()) {
    try {
      currentController = new AbortController();
      const audioUrl = await generateSpeech({ 
        text: clean.slice(0, 4096),
        voice: "alloy",
      });
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        currentAudio = audio;
        await audio.play();
        return;
      }
    } catch (ttsError) {
      console.warn("[IRIS TTS] OpenAI TTS failed:", ttsError.message);
    }
  }
  
  // No TTS configured
  console.error("[IRIS TTS] No TTS provider configured. Add your API key in Settings.");
}

export function isSpeaking() {
  return currentAudio && !currentAudio.paused;
}