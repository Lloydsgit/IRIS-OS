#!/usr/bin/env python3
"""
IRIS AI Backend Server
A unified API server that supports multiple LLM providers
"""

import os
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Providers
class LLMProvider:
    @staticmethod
    def create_openai(messages, model="gpt-4o-mini", **kwargs):
        from openai import OpenAI
        api_key = request.headers.get("X-API-Key") or os.getenv("OPENAI_API_KEY")
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(model=model, messages=messages, **kwargs)
        return response.choices[0].message.content
    
    @staticmethod
    def create_anthropic(messages, model="claude-3-5-sonnet-latest", **kwargs):
        import anthropic
        api_key = request.headers.get("X-API-Key") or os.getenv("ANTHROPIC_API_KEY")
        client = anthropic.Anthropic(api_key=api_key)
        
        system = ""
        filtered = []
        for msg in messages:
            if msg["role"] == "system":
                system = msg["content"]
            else:
                filtered.append(msg)
        
        response = client.messages.create(model=model, system=system, messages=filtered, **kwargs)
        return response.content[0].text
    
    @staticmethod
    def create_google(messages, model="gemini-1.5-flash", **kwargs):
        import google.generativeai as genai
        api_key = request.headers.get("X-API-Key") or os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=api_key)
        
        model_obj = genai.GenerativeModel(model)
        prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages if m["role"] != "system"])
        
        response = model_obj.generate_content(prompt, **kwargs)
        return response.text
    
    @staticmethod
    def create_ollama(messages, model="llama3", base_url="http://localhost:11434/v1", **kwargs):
        import openai
        client = openai.OpenAI(base_url=base_url, api_key="local", timeout=120)
        response = client.chat.completions.create(model=model, messages=messages, **kwargs)
        return response.choices[0].message.content

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    messages = data.get("messages", [])
    model = data.get("model", "gpt-4o-mini")
    provider = data.get("provider", "openai")
    base_url = data.get("base_url", "")
    temperature = data.get("temperature", 0.7)
    max_tokens = data.get("max_tokens", 4000)
    
    try:
        if provider == "anthropic":
            result = LLMProvider.create_anthropic(messages, model, max_tokens=max_tokens, temperature=temperature)
        elif provider == "google":
            result = LLMProvider.create_google(messages, model, generation_config={"temperature": temperature, "max_output_tokens": max_tokens})
        elif provider == "ollama":
            result = LLMProvider.create_ollama(messages, model, base_url=base_url or "http://localhost:11434/v1")
        else:
            result = LLMProvider.create_openai(messages, model, temperature=temperature, max_tokens=max_tokens)
        
        return jsonify({"success": True, "response": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/tts", methods=["POST"])
def text_to_speech():
    data = request.json
    text = data.get("text", "")
    voice = data.get("voice", "alloy")
    provider = data.get("provider", "openai")
    
    try:
        if provider == "elevenlabs":
            api_key = request.headers.get("X-API-Key") or os.getenv("ELEVENLABS_API_KEY")
            voice_id = data.get("voice_id", "rachel")
            
            import requests
            response = requests.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={"xi-api-key": api_key},
                json={"text": text[:2500], "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
            )
            
            if response.ok:
                audio_base64 = base64.b64encode(response.content).decode()
                return jsonify({"success": True, "audio_base64": audio_base64})
            else:
                return jsonify({"success": False, "error": "ElevenLabs TTS failed"}), 500
        
        elif provider == "openai" or provider == "default":
            from openai import OpenAI
            api_key = request.headers.get("X-API-Key") or os.getenv("OPENAI_API_KEY")
            client = OpenAI(api_key=api_key)
            
            response = client.audio.speech.create(model="tts-1", voice=voice, input=text[:4096])
            audio_base64 = base64.b64encode(response.content).decode()
            return jsonify({"success": True, "audio_base64": audio_base64})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/vision", methods=["POST"])
def vision():
    data = request.json
    image_data = data.get("image_data", "")
    prompt = data.get("prompt", "Describe this image.")
    model = data.get("model", "gpt-4o")
    provider = data.get("provider", "openai")
    
    try:
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        if provider == "anthropic":
            result = LLMProvider.create_anthropic(
                [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": image_data}}]}],
                model="claude-3-5-sonnet-latest",
                max_tokens=1000
            )
        else:
            result = LLMProvider.create_openai(
                [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}]}],
                model=model,
                max_tokens=1000
            )
        
        return jsonify({"success": True, "response": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/models", methods=["GET"])
def list_models():
    return jsonify({
        "openai": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
        "anthropic": ["claude-3-5-sonnet-latest", "claude-3-opus-latest", "claude-3-haiku-latest"],
        "google": ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"],
        "ollama": ["llama3", "llama3.1", "mistral", "mixtral", "phi3", "qwen2.5", "gemma2"],
        "groq": ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    })

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "iris-backend"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    print(f"Starting IRIS Backend on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
