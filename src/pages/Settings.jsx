import { useState } from "react";
import { useTheme, THEMES } from "../lib/ThemeContext";
import HudPanel from "../components/hud/HudPanel";
import { Check, Target, Eye, Scale, Mic, Upload, GitBranch, Key, Globe, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  getStoredApiKey, saveApiKey, getStoredApiBase, saveApiBase,
  getStoredLlmModel, saveLlmModel, LLM_MODELS, DEFAULT_API_BASE,
  getStoredTtsKey, saveTtsKey, testConnection, hasApiKey 
} from "../lib/apiClient";

export default function Settings() {
  const { themeId, changeTheme } = useTheme();
  const [elKey, setElKey] = useState(() => localStorage.getItem("jarvis-el-key") || "");
  const [elSaving, setElSaving] = useState(false);

  // BYOK Settings
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [apiBase, setApiBase] = useState(() => getStoredApiBase());
  const [llmModel, setLlmModel] = useState(() => getStoredLlmModel());
  const [ttsKey, setTtsKey] = useState(() => getStoredTtsKey());
  const [byokSaving, setByokSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleByokSave = async () => {
    saveApiKey(apiKey);
    saveApiBase(apiBase);
    saveLlmModel(llmModel);
    saveTtsKey(ttsKey);
    setByokSaving(true);
    
    // Test connection
    const result = await testConnection();
    setConnectionStatus(result);
    
    setTimeout(() => setByokSaving(false), 2000);
  };

  const handleTestConnection = async () => {
    setConnectionStatus({ testing: true });
    const result = await testConnection();
    setConnectionStatus(result);
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
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => changeTheme(id)}
                  className={`relative p-3 rounded-lg border text-left transition-all ${
                    isActive
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/40 bg-card/30 hover:border-primary/30"
                  }`}
                >
                  {/* Preview swatch */}
                  <div
                    className="w-full h-10 rounded mb-2 overflow-hidden"
                    style={{ background: `hsl(${bgHsl})` }}
                  >
                    <div className="flex h-full items-end p-1.5 gap-1">
                      <div className="h-2 rounded-full flex-1" style={{ background: `hsl(${primaryHsl})`, opacity: 0.9 }} />
                      <div className="h-1.5 rounded-full w-6" style={{ background: `hsl(${primaryHsl})`, opacity: 0.4 }} />
                      <div className="h-1 rounded-full w-4" style={{ background: `hsl(${primaryHsl})`, opacity: 0.3 }} />
                    </div>
                  </div>
                  <p className="text-xs font-heading text-foreground/80">{theme.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">{theme.description}</p>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </HudPanel>

        {/* BYOK - Bring Your Own API Key */}
        <HudPanel title="AI Configuration (BYOK)">
          <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">
            Connect your own API keys to power IRIS with your preferred AI services. Your keys are stored locally and never sent to our servers.
          </p>
          
          {/* API Key */}
          <div className="mb-4">
            <label className="text-[9px] font-mono text-muted-foreground/60 tracking-wider uppercase block mb-1.5">
              <Key className="w-3 h-3 inline mr-1" />OpenAI API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type={showApiKey ? "text" : "password"} 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none pr-8"
                  style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} 
                />
                <button 
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/40 hover:text-muted-foreground/70"
                >
                  {showApiKey ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
          </div>

          {/* API Base URL */}
          <div className="mb-4">
            <label className="text-[9px] font-mono text-muted-foreground/60 tracking-wider uppercase block mb-1.5">
              <Globe className="w-3 h-3 inline mr-1" />API Base URL
            </label>
            <input 
              type="text" 
              value={apiBase} 
              onChange={e => setApiBase(e.target.value)}
              placeholder={DEFAULT_API_BASE}
              className="w-full px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} 
            />
            <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(180,80,80,0.35)" }}>
              Default: OpenAI. Use for compatible APIs (OpenRouter, Groq, etc.)
            </p>
          </div>

          {/* LLM Model */}
          <div className="mb-4">
            <label className="text-[9px] font-mono text-muted-foreground/60 tracking-wider uppercase block mb-1.5">
              <Sparkles className="w-3 h-3 inline mr-1" />LLM Model
            </label>
            <select 
              value={llmModel} 
              onChange={e => setLlmModel(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }}
            >
              {LLM_MODELS.map(model => (
                <option key={model.id} value={model.id}>{model.name} ({model.provider})</option>
              ))}
            </select>
          </div>

          {/* ElevenLabs Key (separate for TTS) */}
          <div className="mb-4">
            <label className="text-[9px] font-mono text-muted-foreground/60 tracking-wider uppercase block mb-1.5">
              <Mic className="w-3 h-3 inline mr-1" />ElevenLabs API Key (Optional)
            </label>
            <input 
              type="password" 
              value={ttsKey} 
              onChange={e => setTtsKey(e.target.value)}
              placeholder="sk_..."
              className="w-full px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} 
            />
            <p className="text-[9px] font-mono mt-1" style={{ color: "rgba(180,80,80,0.35)" }}>
              For premium voice synthesis. Get free key at elevenlabs.io
            </p>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "rgba(200,30,30,0.1)" }}>
            <button 
              onClick={handleTestConnection}
              disabled={!apiKey || connectionStatus?.testing}
              className="px-3 py-1.5 rounded-lg text-[9px] font-mono transition-all disabled:opacity-50"
              style={{ background: "rgba(200,30,30,0.1)", border: "1px solid rgba(200,30,30,0.2)", color: "rgba(255,120,120,0.7)" }}
            >
              {connectionStatus?.testing ? "TESTING..." : "TEST CONNECTION"}
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
              {byokSaving ? "SAVED ✓" : "SAVE KEYS"}
            </button>
            
            {connectionStatus && (
              <span className="ml-auto text-[9px] font-mono" 
                style={{ color: connectionStatus.success ? "rgba(80,255,120,0.7)" : "rgba(255,80,80,0.7)" }}>
                {connectionStatus.success ? "✓ Connected" : `✗ ${connectionStatus.error}`}
              </span>
            )}
          </div>

          {hasApiKey() && (
            <div className="mt-3 flex items-center gap-2 text-[9px] font-mono" style={{ color: "rgba(80,255,120,0.5)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              API Key configured
            </div>
          )}
        </HudPanel>

        {/* Advanced sections */}
        <HudPanel title="Data & Memory">
          <div className="space-y-1.5">
            {[
              { label: "Goal Trajectory", path: "/goals", icon: Target },
              { label: "Decision Journal", path: "/decisions", icon: Scale },
              { label: "Watchlist", path: "/watchlist", icon: Eye },
              { label: "Voice Configuration", path: "/voice-settings", icon: Mic },
              { label: "Bulk Import (CSV)", path: "/bulk-import", icon: Upload },
              { label: "Automation Hub", path: "/automation", icon: GitBranch },
            ].map(({ label, path, icon: Icon }) => (
              <Link key={path} to={path} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-foreground/4 transition-all group">
                <Icon className="w-3.5 h-3.5 text-foreground/30 group-hover:text-foreground/60" />
                <span className="text-xs font-mono text-foreground/50 group-hover:text-foreground/70">{label}</span>
                <span className="ml-auto text-foreground/20 text-xs">→</span>
              </Link>
            ))}
          </div>
        </HudPanel>

        <HudPanel title="ElevenLabs API Key">
          <p className="text-[10px] font-mono text-muted-foreground/40 mb-3">Required for realistic voice. Configure full voice settings in the Voice module.</p>
          <div className="flex gap-2">
            <input type="password" value={elKey} onChange={e => setElKey(e.target.value)}
              placeholder="sk_…"
              className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
              style={{ background: "rgba(20,4,4,0.7)", border: "1px solid rgba(200,30,30,0.15)", color: "rgba(255,200,200,0.8)" }} />
            <button onClick={() => { localStorage.setItem("jarvis-el-key", elKey); setElSaving(true); setTimeout(() => setElSaving(false), 1500); }}
              className="px-3 py-1.5 rounded-lg text-[9px] font-mono transition-all"
              style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(200,30,30,0.25)", color: elSaving ? "rgba(80,255,120,0.8)" : "rgba(255,120,120,0.7)" }}>
              {elSaving ? "SAVED ✓" : "SAVE"}
            </button>
          </div>
          <p className="text-[9px] font-mono mt-2" style={{ color: "rgba(180,80,80,0.35)" }}>Get your key at elevenlabs.io — free tier available.</p>
        </HudPanel>

        <HudPanel title="System Info">
          <div className="space-y-2">
            {[
              { label: "Version", value: "IRIS v1.0.0" },
              { label: "Build", value: "Arc Reactor Edition" },
              { label: "Agent", value: "IRIS AI — 14 Domains" },
              { label: "System", value: "IRIS — Intelligence & Reconnaissance Integrated System" },
              { label: "Operator", value: "Mr. Lloyds (Tejas Reddy)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/60 font-mono">{item.label}</span>
                <span className="text-xs text-foreground/70 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </HudPanel>
      </div>
    </div>
  );
}