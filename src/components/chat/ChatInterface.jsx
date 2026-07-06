import { useState, useEffect, useRef, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Volume2, VolumeX } from "lucide-react";
import { speak as irisSpeak, stopSpeaking } from "@/lib/tts";
import { invokeLLM, hasApiKey } from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES_STORAGE_KEY = "iris_chat_messages";

export default function ChatInterface({ conversationId, onConversationCreated, forceNewConv }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [atsActive, setAtsActive] = useState(false);
  const [detectedTone, setDetectedTone] = useState(null);
  const [voiceMuted, setVoiceMuted] = useState(() => localStorage.getItem("iris-voice-muted") === "1");
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const lastSpokenRef = useRef("");

  useEffect(() => {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (forceNewConv) {
      setMessages([]);
      setError(null);
    }
  }, [forceNewConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleVoice = () => {
    const next = !voiceMuted;
    setVoiceMuted(next);
    localStorage.setItem("iris-voice-muted", next ? "1" : "0");
    if (next) stopSpeaking();
  };

  const activateATS = useCallback(() => {
    setAtsActive(true);
    document.documentElement.classList.add("ats-active");
  }, []);

  const deactivateATS = useCallback(() => {
    setAtsActive(false);
    document.documentElement.classList.remove("ats-active");
  }, []);

  function detectTone(text) {
    const t = text.toLowerCase();
    let state = "neutral";
    if (/stressed|anxious|panic|overwhelmed/i.test(t)) state = "stressed";
    else if (/tired|exhausted|sleep/i.test(t)) state = "tired";
    else if (/excited|amazing|awesome|nailed/i.test(t)) state = "energized";
    else if (/sad|down|bad day|not okay/i.test(t)) state = "down";
    return state;
  }

  function buildSystemPrompt() {
    let prompt = "You are IRIS, a hyper-intelligent AI assistant. The user addresses you as Sir. Be direct, helpful, and concise.";
    if (atsActive) {
      prompt += " You are in Advanced Thinking System (ATS) mode. Provide detailed, thorough analysis.";
    }
    return prompt;
  }

  const handleSend = async (content) => {
    if (!hasApiKey()) {
      setError("No API key configured. Please add your API key in Settings.");
      return;
    }

    setIsLoading(true);
    setError(null);

    if (/use ats|activate ats|run ats|advanced thinking/i.test(content.toLowerCase())) {
      activateATS();
    }
    if (/exit ats|normal mode/i.test(content.toLowerCase())) {
      deactivateATS();
    }

    const tone = detectTone(content);
    setDetectedTone(tone !== "neutral" ? tone : null);

    const userMsg = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);

    try {
      const llmMessages = [
        { role: "system", content: buildSystemPrompt() },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content }
      ];

      let taskType = "general";
      if (content.toLowerCase().includes("analyze") || content.toLowerCase().includes("research")) {
        taskType = "reasoning";
      }

      const response = await invokeLLM({
        messages: llmMessages,
        max_tokens: 2000,
        taskType
      });

      const assistantMsg = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMsg]);

      if (!voiceMuted && response !== lastSpokenRef.current) {
        lastSpokenRef.current = response;
        irisSpeak(response);
      }
    } catch (e) {
      setError(e.message || "Failed to get response");
    }

    setIsLoading(false);
  };

  return (
    <div className={`flex flex-col h-full ${atsActive ? "bg-red-950/5" : "bg-transparent"}`}>
      <div className="flex items-center justify-end px-4 pt-2 pb-0 flex-shrink-0">
        <button onClick={toggleVoice}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-mono transition-all"
          style={{ 
            background: voiceMuted ? "rgba(200,30,30,0.12)" : "rgba(80,200,80,0.08)", 
            border: `1px solid ${voiceMuted ? "rgba(200,30,30,0.25)" : "rgba(80,200,80,0.2)"}`, 
            color: voiceMuted ? "rgba(255,80,80,0.6)" : "rgba(80,220,80,0.6)" 
          }}>
          {voiceMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          {voiceMuted ? "VOICE OFF" : "VOICE ON"}
        </button>
      </div>

      <AnimatePresence>
        {atsActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-3 py-1.5 border-b border-red-900/30 bg-red-950/20"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono text-red-500 tracking-widest">ATS ACTIVE - ADVANCED THINKING</span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {detectedTone && (
        <div className="flex items-center gap-2 px-4 py-1"
          style={{ background: "rgba(160,80,255,0.06)", borderBottom: "1px solid rgba(160,80,255,0.1)" }}>
          <span className="text-[9px] font-mono" style={{ color: "rgba(180,120,255,0.5)" }}>
            TONE: {detectedTone.toUpperCase()} - IRIS ADAPTING
          </span>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-2 p-3 rounded-lg text-xs font-mono"
          style={{ background: "rgba(200,30,30,0.1)", border: "1px solid rgba(200,30,30,0.2)", color: "rgba(255,100,100,0.8)" }}>
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="font-heading text-sm tracking-[0.4em] text-foreground/15">IRIS</p>
              <p className="text-[10px] text-foreground/15 mt-3 font-mono tracking-widest">READY TO ASSIST</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} atsActive={atsActive} />
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="h-7 w-7 rounded-full border flex items-center justify-center"
              style={{ borderColor: "rgba(200,16,46,0.35)", background: "rgba(200,16,46,0.06)" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <div className="relative w-4 h-4">
                  {[0, 120, 240].map(deg => (
                    <div key={deg} className="absolute w-1 h-1 rounded-full"
                      style={{ background: "rgba(255,0,51,0.8)", top: "50%", left: "50%", transform: `rotate(${deg}deg) translateY(-6px)` }} />
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="rounded-xl px-4 py-3 flex items-center gap-2"
              style={{ background: "rgba(200,16,46,0.04)", border: "1px solid rgba(200,16,46,0.1)" }}>
              <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>THINKING</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1 h-1 rounded-full" style={{ background: "rgba(255,0,51,0.6)" }}
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} atsActive={atsActive} />
    </div>
  );
}
