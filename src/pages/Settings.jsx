import { useState } from "react";
import { useTheme, THEMES } from "../lib/ThemeContext";
import HudPanel from "../components/hud/HudPanel";
import { Check, Target, Eye, Scale, Mic, Key, Globe, Sparkles, Server, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { 
  getStoredApiKey as getApiKey, saveApiKey as setApiKey, 
  getStoredApiBase as getApiBase, saveApiBase as setApiBase, 
  getStoredLlmModel as getModel, saveLlmModel as setModel, 
  getStoredTtsKey as getTtsKey, saveTtsKey as setTtsKey, 
  testConnection, hasApiKey, getAutoModelEnabled, saveAutoModelEnabled,
  LLM_MODELS, DEFAULT_API_BASE, LOCAL_MODELS
} from "../lib/apiClient";

export default function Settings() {
  const { themeId, changeTheme } = useTheme();

  const [apiKey, setApiKeyState] = useState(() => getApiKey());
  const [apiBase, setApiBaseState] = useState(() => getApiBase());
  const [model, setModelState] = useState(() => getModel());
  const [ttsKey, setTtsKeyState] = useState(() => getTtsKey());
  const [autoModel, setAutoModel] = useState(() => getAutoModelEnabled());
  const [byokSaving, setByokSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleByokSave = async () => {
    setApiKey(apiKey);
    setApiBase(apiBase);
    setModel(model);
    setTtsKey(ttsKey);
    saveAutoModelEnabled(autoModel);
    setByokSaving(true);
    
    const result = await testConnection();
    setConnectionStatus(result);
    
    setTimeout(() => setByokSaving(false), 2000);
  };

  const handleTestConnection = async () => {
    setConnectionStatus({ testing: true });
    const result = await testConnection();
    setConnectionStatus(result);
  };

  const handleClearMemory = () => {
    if (confirm("Clear all conversation history?")) {
      localStorage.setItem("iris_memory", "[]");
      alert("Memory cleared!");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-lg text-foreground tracking-wide">System Settings</h1>
          <p className="text-xs text-muted-foreground/50 font-mono">Customize your IRIS interface.</p>
        </div>

        <HudPanel title="Color Theme">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-1">
            {Object.entries(THEMES).map(([id, theme]) => {
              const isActive = themeId === id;
              const primaryHsl = theme.vars["--primary"];
              const bgHsl = theme.vars["--background"];
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => changeTheme(id)}
                  className="relative p-3 rounded-xl transition-all"
                  style={{
                    background: isActive ? `${bgHsl}55` : `${bgHsl}22`,
                    border: `1px solid ${isActive ? primaryHsl : `${primaryHsl}33`}`,
                    boxShadow: isActive ? `0 0 12px ${primaryHsl}44` : "none",
                  }}
                >
                  <div className="w-full h-8 rounded-lg mb-2" style={{ background: `${primaryHsl}55`, border: `1px solid ${primaryHsl}` }} />
                  <p className="text-[10px] font-heading tracking-wider" style={{ color: primaryHsl }}>{theme.name}</p>
                  {isActive && <div className="absolute top-2 right-2"><Check className="w-3 h-3" style={{ color: primaryHsl }} /></div>}
                </motion.button>
              );
            })}
          </div>
        </HudPanel>

        <HudPanel title="AI Configuration">
          <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">
            Connect to OpenRouter or local LLMs. Keys stored locally.
          </p>

          <div className="mb-4">
            <label className="text-[9px] font-mono text-muted-foreground/60 tracking-wider uppercase block mb-1.5">
              <Globe className="w-3 h-3 inline mr-1" />API Base URL
            </label>
            <input
              type="text"
              value={apiBase}
              onChange={e => setApiBaseState(e.target.value)}
              placeholder={DEFAULT_API_BASE}
              className="w-full px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }}
            />
            <p className="text-[8px] font-mono mt-1" style={{ color: "rgba(180,80,80,0.35)" }}>
              OpenRouter: openrouter.ai | Ollama: localhost:11434 | LM Studio: localhost:1234
            </p>
          </div>

          <div className="mb-4">
            <label className="text-[9px] font-mono text-muted-foreground/60 tracking-wider uppercase block mb-1.5">
              <Key className="w-3 h-3 inline mr-1" />API Key (for cloud providers)
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKeyState(e.target.value)}
                placeholder="sk-or-... (or leave empty for local)"
                className="w-full px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none pr-8"
                style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }}
              />
              <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/40">
                {showApiKey ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[9px] font-mono text-muted-foreground/60 tracking-wider uppercase block mb-1.5">
              <Sparkles className="w-3 h-3 inline mr-1" />Model
            </label>
            <select
              value={model}
              onChange={e => setModelState(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }}
            >
              {LLM_MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name} - {m.provider}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-[9px] font-mono text-muted-foreground/60 tracking-wider uppercase block mb-1.5">
              <Mic className="w-3 h-3 inline mr-1" />ElevenLabs Key (Optional)
            </label>
            <input
              type="password"
              value={ttsKey}
              onChange={e => setTtsKeyState(e.target.value)}
              placeholder="sk_..."
              className="w-full px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }}
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "rgba(200,30,30,0.1)" }}>
            <button
              onClick={handleTestConnection}
              disabled={connectionStatus?.testing || (!hasApiKey() && PROVIDERS[selectedProvider]?.requiresKey)}
              className="px-3 py-1.5 rounded-lg text-[9px] font-mono transition-all disabled:opacity-50"
              style={{ background: "rgba(200,30,30,0.1)", border: "1px solid rgba(200,30,30,0.2)", color: "rgba(255,120,120,0.7)" }}
            >
              {connectionStatus?.testing ? "TESTING..." : "TEST"}
            </button>
            <button
              onClick={handleByokSave}
              className="px-3 py-1.5 rounded-lg text-[9px] font-mono transition-all"
              style={{
                background: byokSaving ? "rgba(80,255,120,0.2)" : "rgba(200,30,30,0.2)",
                border: `1px solid ${byokSaving ? "rgba(80,255,120,0.3)" : "rgba(200,30,30,0.25)"}`,
                color: byokSaving ? "rgba(80,255,120,0.8)" : "rgba(255,120,120,0.7)"
              }}
            >
              {byokSaving ? "SAVED" : "SAVE"}
            </button>
            {connectionStatus && (
              <span className="ml-auto text-[9px] font-mono" style={{ color: connectionStatus.success ? "rgba(80,255,120,0.7)" : "rgba(255,80,80,0.7)" }}>
                {connectionStatus.success ? `OK (${connectionStatus.provider})` : connectionStatus.error}
              </span>
            )}
          </div>
        </HudPanel>

        <HudPanel title="Memory">
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-muted-foreground/50">
              Conversation history stored locally in browser.
            </p>
            <button
              onClick={handleClearMemory}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-mono transition-all"
              style={{ background: "rgba(200,30,30,0.1)", border: "1px solid rgba(200,30,30,0.2)", color: "rgba(255,80,80,0.7)" }}
            >
              <Trash2 className="w-3 h-3" />
              Clear Memory
            </button>
          </div>
        </HudPanel>

        <HudPanel title="About">
          <div className="text-center py-2">
            <p className="font-heading text-sm tracking-[0.3em] text-primary/60">IRIS</p>
            <p className="text-[9px] font-mono text-muted-foreground/30 mt-1">VERSION 1.0.0</p>
          </div>
        </HudPanel>
      </div>
    </div>
  );
}