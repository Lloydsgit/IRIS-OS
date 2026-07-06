# IRIS OS

AI Operating System - Your Intelligent Personal Assistant

![IRIS OS](https://img.shields.io/badge/Version-1.0.0-red?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Vercel-black?style=for-the-badge)
![Framework](https://img.shields.io/badge/Framework-Vite-646CFF?style=for-the-badge)

## Features

- **Voice Control** - Speak to IRIS with natural language commands
- **OpenRouter Integration** - Access to Claude, Gemini, Llama, Mistral & more
- **Auto Model Selection** - AI automatically picks the best model for each task
- **Open Source LLMs** - Use free models like Llama, Mistral, Qwen
- **Text-to-Speech** - ElevenLabs voices for realistic responses
- **Dashboard** - Monitor goals, decisions, watchlists, and more
- **Deep Research** - AI-powered research tools
- **Security Tools** - Phishing detection, link analysis
- **Vision Module** - AI-powered camera analysis
- **HUD Interface** - Futuristic Arc Reactor-inspired UI

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Lloydsgit/IRIS-OS.git
cd IRIS-OS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Keys

IRIS OS uses **OpenRouter** for AI - you provide your own API key:

1. Get an OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)
   - OpenRouter gives **$1 free credits** on signup
   - Supports Claude, Gemini, GPT-4, Llama, Mistral & more
2. (Optional) Get an ElevenLabs API key from [elevenlabs.io](https://elevenlabs.io) for premium voice
3. Open the app and go to **Settings → AI Configuration**
4. Enter your API key and click **Save Keys**
5. Enable **Auto-Select Model** for best experience

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## OpenRouter Models

The app supports these model tiers:

| Tier | Models | Use Case |
|------|--------|----------|
| **Most Capable** | Claude 3.5 Sonnet, Gemini 2.0, GPT-4o | Complex reasoning, analysis |
| **Fast & Smart** | Claude 3 Haiku, Gemini 1.5 Pro, Llama 3.1 70B | General purpose |
| **Free & Open Source** | Llama 3.2, Mistral 7B, Qwen 72B, Phi-3 | Budget-friendly |
| **Ultra Fast** | GPT-4o Mini, Gemini Flash 1.5 | Quick responses |

Enable **Auto-Select** to let IRIS pick the best model for each task.

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Lloydsgit/IRIS-OS)

### Manual Deploy

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

   For production:
   ```bash
   vercel --prod
   ```

### Environment Variables (Optional)

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter API key |
| `VITE_ELEVENLABS_API_KEY` | Your ElevenLabs API key |
| `VITE_LLM_MODEL` | Default model (optional) |

## Project Structure

```
IRIS-OS/
├── public/
│   ├── iris-icon.svg      # App icon
│   └── manifest.json      # PWA manifest
├── src/
│   ├── api/
│   │   └── base44Client.js    # API client (BYOK)
│   ├── components/
│   │   ├── chat/         # Chat components
│   │   ├── dashboard/    # Dashboard widgets
│   │   ├── hud/          # HUD interface components
│   │   ├── ui/           # UI components (shadcn/ui)
│   │   └── voice/        # Voice control components
│   ├── lib/
│   │   ├── apiClient.js  # BYOK/OpenRouter API functions
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   ├── tts.js        # Text-to-speech
│   │   └── utils.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Settings.jsx
│   │   ├── Tools.jsx
│   │   └── ...
│   └── App.jsx
├── vercel.json           # Vercel configuration
├── vite.config.js        # Vite configuration
└── package.json
```

## Tech Stack

- **Frontend**: React 18 + Vite
- **AI**: OpenRouter API (Claude, Gemini, Llama, Mistral, etc.)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **TTS**: ElevenLabs / OpenAI TTS
- **Deployment**: Vercel

## License

MIT License - See LICENSE file for details.

## Support

For issues and feature requests, please open a GitHub issue.

---

Built with ❤️ by [Tejas Reddy](https://github.com/Lloydsgit)
