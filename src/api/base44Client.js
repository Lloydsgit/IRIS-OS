// BYOK (Bring Your Own Key) - Uses user's own API keys
// Import BYOK functions
import { invokeLLM, generateSpeech, generateSpeechElevenLabs, uploadFile, analyzeImage, hasApiKey, hasTtsKey, testConnection } from "../lib/apiClient";

// Legacy stub - returns no-op responses for backward compatibility
export const db = { 
  auth: { 
    isAuthenticated: async ()=>false, 
    me: async ()=>null,
    logout: async ()=>{},
    redirectToLogin: async ()=>{}
  }, 
  entities: new Proxy({}, { 
    get: ()=>({ 
      filter: async ()=>[], 
      list: async ()=>[],
      get: async ()=>null, 
      create: async ()=>({}), 
      update: async ()=>({}), 
      delete: async ()=>({}) 
    }) 
  }), 
  integrations: { 
    Core: { 
      UploadFile: async (file) => {
        if (hasApiKey()) {
          return await uploadFile(file);
        }
        return { file_url: '' };
      },
      InvokeLLM: async (params) => {
        if (hasApiKey()) {
          return await invokeLLM(params);
        }
        throw new Error("No API key configured. Add your key in Settings.");
      },
      GenerateSpeech: async (params) => {
        if (hasTtsKey()) {
          const result = await generateSpeechElevenLabs(params);
          return { url: result.audio_url || result.audio_base64 };
        }
        if (hasApiKey()) {
          const url = await generateSpeech(params);
          return { url };
        }
        throw new Error("No TTS API key configured. Add your key in Settings.");
      }
    } 
  },
  functions: {
    invoke: async (name, params) => {
      if (name === 'elevenlabsTTS' && hasTtsKey()) {
        const result = await generateSpeechElevenLabs(params);
        return { data: { audio_b64: result.audio_base64 } };
      }
      throw new Error(`Function ${name} not available without API keys`);
    }
  },
  agents: {
    getConversation: async () => null,
    createConversation: async () => ({}),
    subscribeToConversation: () => () => {},
    addMessage: async () => {},
  }
}; 

export const base44 = db; 
export default db;