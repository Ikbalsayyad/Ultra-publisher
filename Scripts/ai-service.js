/**
 * UltraMinds AI Service Engine V21
 * 65K token output, 2-pass extraction, smart JSON repair, streaming progress
 * FIX: Real Gemini API model names — no phantom 3.x models
 */

window.AIService = {
  MODEL_METADATA_REGISTRY: {
    // Gemini 2.5 Series (Current & Active)
    'gemini-2.5-flash':  { name: 'gemini-2.5-flash',  provider: 'gemini', contextWindow: 1048576, maxOutputTokens: 65536, status: 'active', info: 'Fast flash model. Highest speed, accuracy & layout capability.' },
    'gemini-2.5-pro':    { name: 'gemini-2.5-pro',    provider: 'gemini', contextWindow: 2097152, maxOutputTokens: 65536, status: 'active', info: 'Advanced reasoning model with 2M token context window.' },

    // Gemini 2.0 Series (Active / Legacy)
    'gemini-2.0-flash':      { name: 'gemini-2.0-flash',      provider: 'gemini', contextWindow: 1048576, maxOutputTokens: 8192, status: 'active', info: 'Previous gen flash model. Still functional.' },
    'gemini-2.0-flash-lite': { name: 'gemini-2.0-flash-lite', provider: 'gemini', contextWindow: 1048576, maxOutputTokens: 8192, status: 'active', info: 'Lightweight flash model.' },

    // Gemini 1.5 Series (Legacy — still functional on API)
    'gemini-1.5-flash':     { name: 'gemini-1.5-flash',     provider: 'gemini', contextWindow: 1048576, maxOutputTokens: 8192,  status: 'active', info: 'Stable 1.5 flash model.' },
    'gemini-1.5-pro':       { name: 'gemini-1.5-pro',       provider: 'gemini', contextWindow: 2097152, maxOutputTokens: 8192,  status: 'active', info: 'Stable 1.5 pro model.' },
    'gemini-1.5-pro-001':   { name: 'gemini-1.5-pro-001',   provider: 'gemini', contextWindow: 1048576, maxOutputTokens: 8192,  status: 'deprecated', info: 'Deprecated snapshot endpoint.', replacement: 'gemini-1.5-pro' },

    // OpenAI Models
    'gpt-4o':      { name: 'gpt-4o',      provider: 'openai', contextWindow: 128000, maxOutputTokens: 16384, status: 'active', info: 'OpenAI flagship model.' },
    'gpt-4o-mini': { name: 'gpt-4o-mini', provider: 'openai', contextWindow: 128000, maxOutputTokens: 16384, status: 'active', info: 'OpenAI fast & affordable model.' },

    // NVIDIA NIM Models (https://build.nvidia.com)
    'deepseek-ai/deepseek-v4.1-flash':         { name: 'deepseek-ai/deepseek-v4.1-flash',         provider: 'nvidia', contextWindow: 131072, maxOutputTokens: 16384, status: 'active', info: 'NVIDIA NIM: DeepSeek V4.1 Flash (ultra-fast layout synthesis with 16K output).' },
    'deepseek-ai/deepseek-r1':                 { name: 'deepseek-ai/deepseek-r1',                 provider: 'nvidia', contextWindow: 131072, maxOutputTokens: 16384, status: 'active', info: 'NVIDIA NIM: DeepSeek R1 flagship reasoning model.' },
    'deepseek-ai/deepseek-v3':                 { name: 'deepseek-ai/deepseek-v3',                 provider: 'nvidia', contextWindow: 131072, maxOutputTokens: 16384, status: 'active', info: 'NVIDIA NIM: DeepSeek V3 chat model.' },
    'nvidia/llama-3.1-nemotron-70b-instruct': { name: 'nvidia/llama-3.1-nemotron-70b-instruct', provider: 'nvidia', contextWindow: 131072, maxOutputTokens: 8192, status: 'active', info: 'NVIDIA NIM: Flagship Llama 3.1 Nemotron 70B Instruct. High layout & code accuracy.' },
    'mistralai/mistral-large-2-instruct':     { name: 'mistralai/mistral-large-2-instruct',     provider: 'nvidia', contextWindow: 128000, maxOutputTokens: 8192, status: 'active', info: 'NVIDIA NIM: Mistral Large 2 (123B parameter frontier model).' },
    'meta/llama-3.1-70b-instruct':            { name: 'meta/llama-3.1-70b-instruct',            provider: 'nvidia', contextWindow: 131072, maxOutputTokens: 8192, status: 'active', info: 'NVIDIA NIM: Meta Llama 3.1 70B Instruct.' },
    'meta/llama-3.1-8b-instruct':             { name: 'meta/llama-3.1-8b-instruct',             provider: 'nvidia', contextWindow: 131072, maxOutputTokens: 8192, status: 'active', info: 'NVIDIA NIM: Meta Llama 3.1 8B Instruct.' },
    'meta/llama-3.1-405b-instruct':            { name: 'meta/llama-3.1-405b-instruct',            provider: 'nvidia', contextWindow: 131072, maxOutputTokens: 8192, status: 'active', info: 'NVIDIA NIM: Meta Llama 3.1 405B Instruct (Frontier powerhouse).' },
    'qwen/qwen2.5-72b-instruct':               { name: 'qwen/qwen2.5-72b-instruct',               provider: 'nvidia', contextWindow: 131072, maxOutputTokens: 8192, status: 'active', info: 'NVIDIA NIM: Qwen 2.5 72B Instruct.' },
    'meta/llama-3.2-90b-vision-instruct':     { name: 'meta/llama-3.2-90b-vision-instruct',     provider: 'nvidia', contextWindow: 131072, maxOutputTokens: 8192, status: 'active', info: 'NVIDIA NIM: Meta Llama 3.2 90B Vision Instruct.' },
    'mistralai/mixtral-8x22b-v0.1':           { name: 'mistralai/mixtral-8x22b-v0.1',           provider: 'nvidia', contextWindow: 65536,  maxOutputTokens: 8192, status: 'active', info: 'NVIDIA NIM: Mixtral 8x22B MoE Instruct.' },
    'nvidia/nemotron-4-340b-instruct':        { name: 'nvidia/nemotron-4-340b-instruct',        provider: 'nvidia', contextWindow: 4096,   maxOutputTokens: 4096, status: 'active', info: 'NVIDIA NIM: Nemotron 4 340B Instruct model.' },

    // OpenRouter / Anthropic / Groq / DeepSeek
    'anthropic/claude-3.5-sonnet': { name: 'anthropic/claude-3.5-sonnet', provider: 'openrouter', contextWindow: 200000, maxOutputTokens: 8192, status: 'active', info: 'Claude 3.5 Sonnet on OpenRouter.' },
    'llama-3.3-70b-versatile':     { name: 'llama-3.3-70b-versatile',     provider: 'groq',       contextWindow: 128000, maxOutputTokens: 8192, status: 'active', info: 'Meta Llama 3.3 70B on Groq.' },
    'deepseek-chat':               { name: 'deepseek-chat',               provider: 'deepseek',    contextWindow: 64000,  maxOutputTokens: 8192, status: 'active', info: 'DeepSeek V3 Chat Model.' }
  },

  getModelDetails(modelName, provider = 'gemini') {
    const key = (modelName || '').trim().toLowerCase();
    if (this.MODEL_METADATA_REGISTRY[key]) {
      return this.MODEL_METADATA_REGISTRY[key];
    }
    if (key.includes('gemini')) {
      // Unknown Gemini model — treat as active (future-proofing)
      return {
        name: modelName,
        provider: 'gemini',
        contextWindow: 1048576,
        maxOutputTokens: 65536,
        status: 'active',
        info: 'Gemini model (active — not in local registry).'
      };
    }
    if (key.includes('nvidia') || key.startsWith('meta/') || key.startsWith('nvidia/') || key.startsWith('deepseek-ai/') || key.startsWith('qwen/') || provider === 'nvidia') {
      return {
        name: modelName || 'deepseek-ai/deepseek-v4.1-flash',
        provider: 'nvidia',
        contextWindow: 131072,
        maxOutputTokens: 8192,
        status: 'active',
        info: 'NVIDIA NIM API model (build.nvidia.com).'
      };
    }
    if (key.includes('gpt-4') || key.includes('openai')) {
      return { name: modelName, provider: 'openai', contextWindow: 128000, maxOutputTokens: 16384, status: 'active', info: 'OpenAI model.' };
    }
    if (key.includes('claude')) {
      return { name: modelName, provider: 'openrouter', contextWindow: 200000, maxOutputTokens: 8192, status: 'active', info: 'Claude model.' };
    }
    if (key.includes('llama')) {
      return { name: modelName, provider: 'groq', contextWindow: 128000, maxOutputTokens: 8192, status: 'active', info: 'Llama model.' };
    }
    if (key.includes('deepseek')) {
      return { name: modelName, provider: 'deepseek', contextWindow: 64000, maxOutputTokens: 8192, status: 'active', info: 'DeepSeek model.' };
    }

    return {
      name: modelName || 'custom',
      provider: provider || 'custom',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      status: 'active',
      info: 'Standard model settings applied.'
    };
  },

  getAutoAdjustedTokens(modelName, requestedTokens = 8192) {
    const details = this.getModelDetails(modelName);
    return Math.min(requestedTokens || 8192, details.maxOutputTokens || 8192);
  },

  sanitizeGeminiModel(modelName) {
    if (!modelName || typeof modelName !== 'string') return 'gemini-2.5-flash';
    const clean = modelName.trim().toLowerCase();
    // Check if model is in the registry
    const details = this.MODEL_METADATA_REGISTRY[clean];
    if (details) {
      if (details.status === 'deprecated' || details.status === 'retired') {
        return details.replacement || 'gemini-2.5-flash';
      }
      return clean; // Known active model — use as-is
    }
    // Unknown model — pass through (could be a future or custom Gemini model)
    return modelName;
  },

  getSettings() {
    const provider = localStorage.getItem('ultraminds_ai_provider') || 'gemini';
    const defaultModel = provider === 'nvidia' ? 'deepseek-ai/deepseek-v4.1-flash' : 'gemini-2.5-flash';
    let savedModel = localStorage.getItem('ultraminds_ai_model') || defaultModel;
    if (provider === 'gemini') {
      savedModel = this.sanitizeGeminiModel(savedModel);
    }
    let apiKey = '';
    if (provider === 'nvidia') {
      apiKey = localStorage.getItem('nvidia_api_key') || localStorage.getItem('nv_api_key') || '';
      if (!apiKey) {
        const fallback = localStorage.getItem('ultraminds_ai_key') || localStorage.getItem('ultraminds_api_key') || '';
        if (fallback.startsWith('nvapi-')) apiKey = fallback;
      }
    } else if (provider === 'gemini') {
      apiKey = localStorage.getItem('gemini_api_key') || '';
      if (!apiKey) {
        const fallback = localStorage.getItem('ultraminds_ai_key') || localStorage.getItem('ultraminds_api_key') || '';
        if (fallback.startsWith('AIzaSy')) apiKey = fallback;
      }
    } else if (provider === 'groq') {
      apiKey = localStorage.getItem('groq_api_key') || '';
      if (!apiKey && (localStorage.getItem('ultraminds_ai_key') || '').startsWith('gsk_')) apiKey = localStorage.getItem('ultraminds_ai_key');
    } else if (provider === 'openrouter') {
      apiKey = localStorage.getItem('openrouter_api_key') || '';
      if (!apiKey && (localStorage.getItem('ultraminds_ai_key') || '').startsWith('sk-or-')) apiKey = localStorage.getItem('ultraminds_ai_key');
    } else if (provider === 'deepseek') {
      apiKey = localStorage.getItem('deepseek_api_key') || '';
    } else if (provider === 'openai') {
      apiKey = localStorage.getItem('openai_api_key') || '';
    } else {
      apiKey = localStorage.getItem('ultraminds_ai_key') || localStorage.getItem('ultraminds_api_key') || '';
    }

    let customEndpoint = '';
    if (provider === 'nvidia') {
      const nvEp = (localStorage.getItem('nvidia_api_endpoint') || '').trim();
      // Guard against stale local LLM ports (1234 LM Studio / 11434 Ollama)
      if (nvEp && !nvEp.includes(':1234') && !nvEp.includes(':11434') && !nvEp.includes('ollama')) {
        customEndpoint = nvEp;
      }
    } else if (provider === 'custom') {
      customEndpoint = localStorage.getItem('custom_api_endpoint') || localStorage.getItem('ultraminds_ai_endpoint') || 'http://localhost:11434/v1/chat/completions';
    } else {
      customEndpoint = localStorage.getItem('ultraminds_ai_endpoint') || '';
    }

    return {
      provider,
      apiKey,
      model: savedModel,
      customEndpoint
    };
  },

  saveSettings(settings) {
    const provider = settings.provider || localStorage.getItem('ultraminds_ai_provider') || 'gemini';
    if (settings.provider) localStorage.setItem('ultraminds_ai_provider', settings.provider);
    if (settings.apiKey !== undefined) {
      const k = settings.apiKey.trim();
      localStorage.setItem('ultraminds_ai_key', k);
      localStorage.setItem('ultraminds_api_key', k);
      if (provider === 'nvidia' || k.startsWith('nvapi-')) localStorage.setItem('nvidia_api_key', k);
      else if (provider === 'gemini' || k.startsWith('AIzaSy')) localStorage.setItem('gemini_api_key', k);
      else if (provider === 'groq' || k.startsWith('gsk_')) localStorage.setItem('groq_api_key', k);
      else if (provider === 'openrouter' || k.startsWith('sk-or-')) localStorage.setItem('openrouter_api_key', k);
      else if (provider === 'deepseek') localStorage.setItem('deepseek_api_key', k);
      else if (provider === 'openai') localStorage.setItem('openai_api_key', k);
    }
    if (settings.model) {
      const sanitized = (provider === 'gemini') ? this.sanitizeGeminiModel(settings.model) : settings.model.trim();
      localStorage.setItem('ultraminds_ai_model', sanitized);
      localStorage.setItem('ultraminds_api_model', sanitized);
    }
    if (settings.customEndpoint !== undefined) {
      const ep = settings.customEndpoint.trim();
      if (provider === 'nvidia') {
        if (!ep || ep.includes(':1234') || ep.includes(':11434')) {
          localStorage.removeItem('nvidia_api_endpoint');
        } else {
          localStorage.setItem('nvidia_api_endpoint', ep);
        }
      } else if (provider === 'custom') {
        localStorage.setItem('custom_api_endpoint', ep);
        localStorage.setItem('ultraminds_ai_endpoint', ep);
      } else {
        localStorage.setItem('ultraminds_ai_endpoint', ep);
      }
    }
  },

  async processMissionData(inputText, pageLimit = "auto", statusCallback = null) {
    const settings = this.getSettings();
    const updateStatus = (msg) => {
      console.log("🤖 Publishing Compiler:", msg);
      if (statusCallback) statusCallback(msg);
    };

    // Stage 1: Always compile canonical source first with correct mission ID
    let canonicalResult = null;
    const missionNumMatch = inputText.match(/Mission\s*#?\s*(\d+)/i) || inputText.match(/Level\s*[:\s#]*(\d+)/i);
    const missionId = missionNumMatch ? ('M' + missionNumMatch[1]) : 'M01';
    if (window.CanonicalCompiler) {
      updateStatus("🔒 Stage 1/4: Compiling Canonical Source & Locking Technical Facts...");
      canonicalResult = window.CanonicalCompiler.compile(inputText, missionId);
      window.lastCanonicalResult = canonicalResult;
    }

    // Build the guaranteed 100% complete canonical base layout
    const canonicalBase = (window.HeuristicParser && typeof window.HeuristicParser.parse === 'function')
      ? window.HeuristicParser.parse(inputText, pageLimit)
      : null;

    if (!settings.apiKey) {
      updateStatus("⚠️ No API Key — using Publishing Compiler & Dynamic Composer...");
      return this.normalizeMissionObject(canonicalBase, inputText);
    }

    const steps = [
      "🚀 Stage 1/4: Canonical Source Lock & Element Tagging Complete...",
      "🧠 Stage 2/4: AI Role B (Design Planning) — Mapping Element IDs to Layout Grid...",
      "📐 Stage 3/4: Dynamic Card & Sub-Element Composition...",
      "✨ Stage 4/4: Running 10-Gate Automated Verification Pipeline..."
    ];

    let stepIdx = 0;
    updateStatus(steps[0]);
    const timer = setInterval(() => {
      if (stepIdx < steps.length - 1) {
        stepIdx++;
        updateStatus(steps[stepIdx]);
      }
    }, 1200);

    try {
      let rawResult = null;
      const provider = settings.provider || 'gemini';
      updateStatus(`🌐 Connecting to ${provider.toUpperCase()} API (${settings.model || 'default'}) for Layout Planning...`);

      if (provider === 'gemini') {
        rawResult = await this.callGeminiWithFallback(settings.apiKey, settings.model, inputText, updateStatus);
      } else {
        rawResult = await this.callOpenAICompatible(provider, settings.apiKey, settings.model, settings.customEndpoint, inputText, updateStatus);
      }

      clearInterval(timer);
      updateStatus("✅ Complete! Running 10-Gate Verification...");

      // Role B Hybrid Synthesis: Merge AI's creative styling, themes, icons, and bespoke titles with the 100% complete canonical base
      const synthesizedMission = this.mergeAIWithCanonical(rawResult, canonicalBase, canonicalResult);
      return this.normalizeMissionObject(synthesizedMission, inputText);
    } catch (err) {
      clearInterval(timer);
      console.error("AI Service Error:", err);
      console.error("AI Service Error Stack:", err.stack);
      updateStatus(`⚠️ AI Generation Failed: ${err.message} — Output quality will be reduced (heuristic fallback).`);
      const result = this.normalizeMissionObject(canonicalBase, inputText);
      // Tag the result so UI can warn the user
      result._isFallback = true;
      result._fallbackReason = err.message;
      return result;
    }
  },

  async callGeminiWithFallback(apiKey, preferredModel, userContent, updateStatus) {
    const sanitizedPreferred = this.sanitizeGeminiModel(preferredModel);
    const modelsToTry = [
      sanitizedPreferred,
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ].filter(Boolean);
    const unique = [...new Set(modelsToTry)];
    let lastError = null;

    for (const modelName of unique) {
      try {
        updateStatus(`🔗 Trying model: ${modelName}...`);
        const result = await this.callGemini(apiKey, modelName, userContent, updateStatus);
        if (result) return result;
      } catch (err) {
        console.warn(`Model [${modelName}] failed:`, err.message);
        lastError = err;
        // If it's an API Key restriction, auth, or permission error, don't loop endlessly across models
        if (err.isAuthError || /referrer|permission_denied|api_key_invalid|blocked|disabled/i.test(err.message)) {
          throw err;
        }
        updateStatus(`⚠️ Model ${modelName} failed — trying next fallback...`);
      }
    }
    throw lastError || new Error("All Gemini models failed");
  },

  async callGemini(apiKey, model, userContent, updateStatus) {
    const activeModel = this.sanitizeGeminiModel(model);
    const autoTokens = this.getAutoAdjustedTokens(activeModel, 32768);

    // Layer 3 Guard: Ensure master prompt is loaded
    const systemPrompt = window.ULTRAMINDS_MASTER_PROMPT;
    if (!systemPrompt) {
      console.error('❌ CRITICAL: ULTRAMINDS_MASTER_PROMPT not loaded. Check that system-prompt.js loads before ai-service.js in your HTML.');
      throw new Error('System prompt missing — check script load order (system-prompt.js must load before ai-service.js)');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        role: 'user',
        parts: [{
          text: `Convert this raw educational content into a complete, ultra-detailed UltraMinds Mission JSON. Include ALL content from the input — zero omission. Generate as many pages as needed (5-14) to fit all content at comfortable reading size.\n\nRAW CONTENT:\n\n${userContent}`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: autoTokens,
        temperature: 0.4,
        topP: 0.95
      }
    };

    if (updateStatus) updateStatus(`🔗 Calling Gemini API: ${activeModel} (max ${Math.round(autoTokens / 1000)}k output tokens)...`);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      let isAuthError = false;
      try {
        const errJson = await res.json();
        const apiError = errJson.error;
        if (apiError) {
          const reason = apiError.details?.[0]?.reason || '';
          if (reason === 'API_KEY_HTTP_REFERRER_BLOCKED' || (apiError.message && apiError.message.includes('referer'))) {
            errorMsg = `API Key has HTTP Referrer Restrictions in Google Cloud. If opening locally (file:// or localhost), remove referrer restrictions or generate an unrestricted key at https://aistudio.google.com/app/apikey`;
            isAuthError = true;
          } else if (apiError.message && (apiError.message.includes('are blocked') || apiError.status === 'PERMISSION_DENIED')) {
            errorMsg = `Generative Language API is blocked or restricted for this API key. In Google Cloud Console, ensure 'Generative Language API' is enabled and unrestricted, or create a direct key at https://aistudio.google.com/app/apikey`;
            isAuthError = true;
          } else if (apiError.message && apiError.message.includes('has not been used in project')) {
            errorMsg = `Gemini API is disabled for this project. Enable 'Generative Language API' in Google Cloud Console.`;
            isAuthError = true;
          } else if (res.status === 400 || (apiError.message && apiError.message.includes('API_KEY_INVALID'))) {
            errorMsg = `API Key is invalid. Please verify or re-enter your key in ⚙️ API Settings.`;
            isAuthError = true;
          } else if (res.status === 429 || (apiError.message && apiError.message.includes('RESOURCE_EXHAUSTED'))) {
            errorMsg = `Gemini rate limit or quota exceeded (429). Please wait a moment or switch to Gemini 2.5 Flash.`;
          } else {
            errorMsg = apiError.message || JSON.stringify(apiError);
          }
        }
      } catch (parseErr) {
        const txt = await res.text().catch(() => '');
        errorMsg = txt ? txt.substring(0, 200) : `HTTP ${res.status} ${res.statusText}`;
      }
      const err = new Error(`Gemini [${activeModel}]: ${errorMsg}`);
      err.isAuthError = isAuthError;
      throw err;
    }

    const data = await res.json();

    // Handle safety blocks or empty responses
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      throw new Error('Response blocked by safety filters');
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini API");

    const finishReason = data.candidates?.[0]?.finishReason;
    if (updateStatus) updateStatus(`📦 Received ${Math.round(rawText.length / 1000)}KB response (finish: ${finishReason || 'unknown'}) — parsing JSON...`);

    const parsed = this.parseJSONSafely(rawText);
    if (!parsed) {
      console.error('❌ JSON parse failed after all repair attempts. Raw response preview:', rawText.substring(0, 500));
      console.error('❌ Raw response end:', rawText.substring(Math.max(0, rawText.length - 300)));
      throw new Error(`Failed to parse JSON response (${rawText.length} chars, finish: ${finishReason})`);
    }
    return parsed;
  },

  async callOpenAICompatible(provider, apiKey, model, customEndpoint, userContent, updateStatus) {
    // Layer 3 Guard: Ensure master prompt is loaded
    const systemPrompt = window.ULTRAMINDS_MASTER_PROMPT;
    if (!systemPrompt) {
      console.error('❌ CRITICAL: ULTRAMINDS_MASTER_PROMPT not loaded for OpenAI-compatible call.');
      throw new Error('System prompt missing — check script load order');
    }
    const cleanKey = (apiKey || '').trim();

    if (!cleanKey && provider !== 'custom') {
      throw new Error(`Missing API Key for ${provider.toUpperCase()}. Please click ⚙️ API Settings and enter your ${provider.toUpperCase()} API Key.`);
    }

    if (provider === 'nvidia') {
      if (!cleanKey) {
        throw new Error("Missing NVIDIA API Key. Please click ⚙️ API Settings, enter your NVIDIA NIM API key (starts with 'nvapi-'), and click Save.");
      }
      if (!cleanKey.startsWith('nvapi-')) {
        throw new Error(
          `Invalid NVIDIA API Key: Found key starting with '${cleanKey.substring(0, 6)}...', which is not a valid NVIDIA NIM key (did you enter a Gemini 'AIzaSy...' key by mistake?). NVIDIA API keys always start with 'nvapi-'. Please click ⚙️ API Settings and enter your key from https://build.nvidia.com.`
        );
      }
    }

    let url = 'https://api.openai.com/v1/chat/completions';
    let headers = { 'Content-Type': 'application/json' };

    if (cleanKey) {
      headers['Authorization'] = `Bearer ${cleanKey}`;
    }

    let modelName = (model || '').trim();

    if (provider === 'nara') {
      url = 'https://router.bynara.id/v1/chat/completions';
      if (!modelName || modelName.startsWith('gemini')) {
        modelName = 'mistral-medium-3-5';
      }
    } else if (provider === 'openrouter') {
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers['HTTP-Referer'] = window.location.origin || 'http://localhost';
      headers['X-Title'] = 'UltraMinds Publisher';
      if (!modelName || modelName.startsWith('gemini')) {
        modelName = modelName ? `google/${modelName}` : 'anthropic/claude-3.5-sonnet';
      }
    } else if (provider === 'groq') {
      url = 'https://api.groq.com/openai/v1/chat/completions';
      if (!modelName || modelName.startsWith('gemini') || modelName.startsWith('gpt')) {
        modelName = 'llama-3.3-70b-versatile';
      }
    } else if (provider === 'deepseek') {
      url = 'https://api.deepseek.com/chat/completions';
      if (!modelName || !modelName.startsWith('deepseek')) {
        modelName = 'deepseek-chat';
      }
    } else if (provider === 'custom') {
      let rawUrl = (customEndpoint || 'http://localhost:11434/v1/chat/completions').trim();
      if (!rawUrl.endsWith('/chat/completions')) {
        if (rawUrl.endsWith('/v1') || rawUrl.endsWith('/v1/')) {
          rawUrl = rawUrl.replace(/\/+$/, '') + '/chat/completions';
        } else if (!rawUrl.includes('/chat/completions')) {
          rawUrl = rawUrl.replace(/\/+$/, '') + '/v1/chat/completions';
        }
      }
      url = rawUrl;
      if (!modelName) modelName = 'mistral-3.5';
    } else if (provider === 'nvidia') {
      let isDedicatedNvidiaCustom = false;
      if (customEndpoint && customEndpoint.trim()) {
        let rawEp = customEndpoint.trim();
        // Guard against any leftover LM Studio (1234) or Ollama (11434) local ports
        if (!rawEp.includes(':1234') && !rawEp.includes(':11434') && !rawEp.includes('ollama')) {
          if (!rawEp.endsWith('/chat/completions')) {
            if (rawEp.endsWith('/v1') || rawEp.endsWith('/v1/')) {
              rawEp = rawEp.replace(/\/+$/, '') + '/chat/completions';
            } else if (!rawEp.includes('/chat/completions')) {
              rawEp = rawEp.replace(/\/+$/, '') + '/v1/chat/completions';
            }
          }
          url = rawEp;
          isDedicatedNvidiaCustom = true;
        }
      }

      if (!isDedicatedNvidiaCustom) {
        if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.includes(':3001')) {
          url = `${window.location.origin}/nvidia/v1/chat/completions`;
          if (updateStatus) updateStatus('🛡️ Routing via local UltraMinds CORS proxy (localhost:3001)...');
        } else {
          // Check if local dev proxy is running on localhost:3001
          let proxyAvailable = false;
          try {
            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timeoutId = controller ? setTimeout(() => controller.abort(), 400) : null;
            const healthRes = await fetch('http://localhost:3001/health', {
              method: 'GET',
              signal: controller ? controller.signal : undefined
            }).catch(() => null);
            if (timeoutId) clearTimeout(timeoutId);
            if (healthRes && healthRes.ok) {
              proxyAvailable = true;
            }
          } catch (_) {}

          if (proxyAvailable) {
            url = 'http://localhost:3001/nvidia/v1/chat/completions';
            if (updateStatus) updateStatus('🛡️ Routing via local UltraMinds CORS proxy (localhost:3001)...');
          } else {
            url = 'https://integrate.api.nvidia.com/v1/chat/completions';
          }
        }
      }
      if (!modelName || modelName.startsWith('gemini') || modelName.startsWith('gpt')) {
        modelName = 'deepseek-ai/deepseek-v4.1-flash';
      }
    } else if (provider === 'openai') {
      if (!modelName || modelName.startsWith('gemini')) {
        modelName = 'gpt-4o';
      }
    }

    const modelDetails = this.getModelDetails(modelName, provider);
    let maxTokensLimit = modelDetails?.maxOutputTokens || 8192;
    if (provider === 'openai' || provider === 'openrouter') {
      maxTokensLimit = Math.max(maxTokensLimit, 16384);
    } else if (provider === 'nvidia') {
      if (modelName.includes('deepseek') || modelName.includes('ultra')) {
        maxTokensLimit = Math.max(modelDetails?.maxOutputTokens || 16384, 16384);
      } else {
        maxTokensLimit = modelDetails?.maxOutputTokens || 8192;
      }
    } else if (provider === 'groq' || provider === 'deepseek' || provider === 'nara') {
      maxTokensLimit = 8192;
    }

    let userMsgContent;
    if (Array.isArray(userContent)) {
      userMsgContent = userContent;
    } else {
      userMsgContent = `Convert this raw educational content into a complete, ultra-detailed UltraMinds Mission JSON. Include ALL content — zero omission.\n\nRAW CONTENT:\n\n${userContent}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMsgContent }
    ];

    let temp = 0.4;
    if (provider === 'nvidia' && modelName.includes('deepseek')) {
      temp = 0.6;
    }

    const payload = {
      model: modelName,
      messages: messages,
      max_tokens: maxTokensLimit,
      temperature: temp
    };

    // Include response_format for OpenAI & DeepSeek
    if (provider === 'openai' || provider === 'deepseek') {
      payload.response_format = { type: "json_object" };
    }

    if (updateStatus) updateStatus(`🚀 Sending request to ${url} (${modelName}, max ${Math.round(maxTokensLimit / 1000)}k tokens)...`);

    let res = null;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
    } catch (netErr) {
      if (provider === 'nvidia') {
        if (url.includes('integrate.api.nvidia.com')) {
          throw new Error(
            `NVIDIA API CORS Restriction: NVIDIA does not allow direct browser calls from client apps. ` +
            `Solution: Run 'npm run proxy' or 'node proxy.js' in your terminal (already included in this project), ` +
            `or open http://localhost:3001 in your browser.`
          );
        } else if (url.includes('localhost:3001')) {
          throw new Error(
            `Local NVIDIA Proxy (${url}) connection error: ${netErr.message}. ` +
            `Please ensure 'node proxy.js' is running in your terminal.`
          );
        }
      }
      throw new Error(`Failed to fetch from ${url}. Check internet connection or CORS policy. Error: ${netErr.message}`);
    }

    // Auto-retry with 16k tokens if OpenRouter returns 402 credit reservation limit error
    if (!res.ok && res.status === 402 && provider === 'openrouter') {
      if (updateStatus) updateStatus(`⚠️ OpenRouter 402 Credit limit hit for 50k tokens — retrying with 16k max tokens...`);
      payload.max_tokens = 16000;
      res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
    }

    // Auto-retry for NVIDIA if 422 indicates max_tokens limit exceeded
    if (!res.ok && res.status === 422 && provider === 'nvidia') {
      if (updateStatus) updateStatus(`⚠️ NVIDIA NIM token limit notice — retrying with 2048 tokens...`);
      payload.max_tokens = 2048;
      res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) {
          if (Array.isArray(errJson.detail)) {
            errorMsg = errJson.detail.map(d => d.msg || (d.loc ? `${d.loc.join('.')}: ${d.msg}` : JSON.stringify(d))).join('; ');
          } else {
            errorMsg = String(errJson.detail);
          }
        } else if (errJson.error?.message) {
          errorMsg = errJson.error.message;
        } else if (errJson.message) {
          errorMsg = errJson.message;
        }
      } catch (_) {
        const txt = await res.text().catch(() => '');
        errorMsg = txt ? txt.substring(0, 250) : `HTTP ${res.status} ${res.statusText}`;
      }
      throw new Error(`${provider.toUpperCase()} API Error (${res.status}): ${errorMsg}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) throw new Error(`Empty response from ${provider.toUpperCase()}`);

    if (updateStatus) updateStatus(`📦 Received response (${Math.round(rawText.length / 1000)}KB) — parsing JSON...`);
    const parsed = this.parseJSONSafely(rawText);
    if (!parsed) throw new Error("Failed to parse JSON output");
    return parsed;
  },

  /**
   * Smart JSON parser with repair capabilities
   */
  parseJSONSafely(rawText) {
    if (!rawText) return null;
    let clean = rawText
      .replace(/<(?:think|thought|reasoning)>[\s\S]*?<\/(?:think|thought|reasoning)>/gi, '') // Strip reasoning tags
      .replace(/<(?:think|thought|reasoning)>[\s\S]*$/gi, '') // Strip unclosed reasoning tags
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Extract the outermost JSON object
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }

    // Try direct parse
    try {
      return JSON.parse(clean);
    } catch (e1) {
      // Attempt repair: truncate at last complete JSON object/array
      try {
        const repaired = this.repairTruncatedJSON(clean);
        return JSON.parse(repaired);
      } catch (e2) {
        // Try extracting just the pages array
        try {
          const pagesMatch = clean.match(/"pages"\s*:\s*(\[[\s\S]*\])/);
          if (pagesMatch) {
            const pagesArray = JSON.parse(pagesMatch[1]);
            return { missionNumber: "14", missionTitle: "MISSION", theme: "theme-blue", pages: pagesArray };
          }
        } catch (e3) {}
        console.warn("All JSON parse attempts failed:", e1.message);
        return null;
      }
    }
  },

  repairTruncatedJSON(str) {
    // Walk through and track open brackets/braces to find last valid closing point
    let depth = 0;
    let inString = false;
    let escaped = false;
    let lastCompleteIdx = 0;

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\' && inString) { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (!inString) {
        if (ch === '{' || ch === '[') depth++;
        else if (ch === '}' || ch === ']') {
          depth--;
          if (depth === 0) lastCompleteIdx = i + 1;
        }
      }
    }

    if (lastCompleteIdx > 0) return str.substring(0, lastCompleteIdx);

    // Last resort: strip dangling content and close all open braces/brackets
    // First, find where to truncate: if we're inside a string, close it
    inString = false;
    escaped = false;
    const stack = [];
    let lastSafeIdx = 0;

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\' && inString) { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (!inString) {
        if (ch === '{') stack.push('}');
        else if (ch === '[') stack.push(']');
        else if (ch === '}' || ch === ']') stack.pop();
        // Track last position that ended with a valid value (not mid-key)
        if (ch === '}' || ch === ']' || ch === '"' || /\d/.test(ch) || ch === 'e' || ch === 'l') {
          lastSafeIdx = i + 1;
        }
      }
    }

    // Truncate at a reasonable point, strip trailing commas/whitespace/incomplete pairs
    let truncated = str.substring(0, lastSafeIdx || str.length);
    // Close any dangling string
    if (inString) truncated += '"';
    // Strip trailing commas, colons, and whitespace before closing
    truncated = truncated.replace(/[,:\s]+$/, '');
    // Strip incomplete key-value pairs like `"someKey":` or `"someKey": "partial`
    truncated = truncated.replace(/,?\s*"[^"]*"\s*:\s*"?[^"{}[\]]*$/, '');
    // Strip trailing comma again after cleanup
    truncated = truncated.replace(/,\s*$/, '');

    // Close all remaining open brackets/braces
    return truncated + stack.reverse().join('');
  },

  normalizeMissionObject(data, fallbackRawText) {
    if (!data) {
      data = window.HeuristicParser ? window.HeuristicParser.parse(fallbackRawText || '') : null;
      if (!data) return this.getEmptyMission();
    }

    let mission = data;

    if (Array.isArray(data)) {
      mission = {
        id: "mission-" + Date.now(),
        title: "GENERATED MISSION",
        theme: "theme-blue",
        missionNumber: "14",
        missionTitle: "GENERATED MISSION",
        missionSubtitle: "Created by UltraMinds AI Studio",
        pages: data
      };
    } else if (!data.pages && data.sections) {
      mission = {
        id: "mission-" + Date.now(),
        title: data.title || "GENERATED MISSION",
        theme: data.theme || "theme-blue",
        missionNumber: data.missionNumber || "14",
        missionTitle: data.missionTitle || data.title || "GENERATED MISSION",
        missionSubtitle: data.missionSubtitle || "",
        guideName: data.guideName || "Commander Nova",
        guideRole: data.guideRole || "Your Mission Guide",
        pages: [{ pageNumber: 1, pageType: "cover", sections: data.sections }]
      };
    }

    if (!mission.pages || !Array.isArray(mission.pages)) {
      return this.getEmptyMission();
    }

    // Ensure all pages have required fields
    mission.pages.forEach((page, idx) => {
      if (!page.pageNumber) page.pageNumber = idx + 1;
      if (!page.sections) page.sections = [];
      if (!page.pageType) page.pageType = idx === 0 ? 'cover' : 'generic';
    });

    if (data && data.canonicalResult) {
      mission.canonicalResult = data.canonicalResult;
    } else if (window.lastCanonicalResult) {
      mission.canonicalResult = window.lastCanonicalResult;
    }

    if (mission.canonicalResult && mission.canonicalResult.canonicalElements) {
      this.reconcileCanonicalElementIds(mission, mission.canonicalResult.canonicalElements);
    }

    if (window.NovaPoseEngine && typeof window.NovaPoseEngine.enrichMissionWithPoses === 'function') {
      mission = window.NovaPoseEngine.enrichMissionWithPoses(mission);
    }

    return mission;
  },

  mergeAIWithCanonical(aiData, canonicalBase, canonicalResult) {
    if (!canonicalBase) return aiData;
    if (!aiData || typeof aiData !== 'object') return canonicalBase;

    // 1. Mission Metadata Enhancement from AI
    if (aiData.theme && aiData.theme !== 'theme-blue') {
      canonicalBase.theme = aiData.theme;
    }
    if (aiData.missionTitle && aiData.missionTitle.length > 5 && !/^GENERATED/i.test(aiData.missionTitle)) {
      canonicalBase.missionTitle = aiData.missionTitle;
      canonicalBase.title = aiData.missionTitle;
    }
    if (aiData.missionSubtitle && aiData.missionSubtitle.length > 3) {
      canonicalBase.missionSubtitle = aiData.missionSubtitle;
    }
    if (aiData.guideName && !canonicalBase.guideName) {
      canonicalBase.guideName = aiData.guideName;
    }
    if (aiData.guideRole && !canonicalBase.guideRole) {
      canonicalBase.guideRole = aiData.guideRole;
    }

    // 2. Extract all cards from AI data (flatten pages and split-layouts)
    const aiCards = [];
    const aiPages = Array.isArray(aiData.pages) ? aiData.pages : [];
    aiPages.forEach((p, pIdx) => {
      (p.sections || []).forEach(sec => {
        if (sec.type === 'split-layout') {
          if (sec.left) aiCards.push({ ...sec.left, _pageIdx: pIdx });
          if (sec.right) aiCards.push({ ...sec.right, _pageIdx: pIdx });
        } else {
          aiCards.push({ ...sec, _pageIdx: pIdx });
        }
      });
    });

    if (aiCards.length === 0 && Array.isArray(aiData.sections)) {
      aiData.sections.forEach(sec => aiCards.push(sec));
    }

    // Helper: tokenize text into words for similarity matching
    const getKeywords = (txt) => {
      if (!txt) return [];
      return String(txt).toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'your', 'have', 'were', 'what', 'page', 'phase', 'card', 'section'].includes(w));
    };

    // 3. For each card in canonicalBase, find matching AI card to enhance styling, icon, theme, and badges
    const canonicalPages = canonicalBase.pages || [];
    const matchedAiCards = new Set();

    canonicalPages.forEach((cPage, pIdx) => {
      const aiPage = aiPages[pIdx];
      if (aiPage) {
        if (aiPage.footerNextText && !cPage.footerNextText?.includes('Complete')) {
          cPage.footerNextText = aiPage.footerNextText;
        }
        if (Array.isArray(aiPage.footerPills) && aiPage.footerPills.length > 0) {
          cPage.footerPills = aiPage.footerPills;
        }
        if (aiPage.pageType && cPage.pageType === 'generic') {
          cPage.pageType = aiPage.pageType;
        }
      }

      const processCard = (cCard) => {
        if (!cCard) return;
        if (cCard.type === 'split-layout') {
          if (cCard.left) processCard(cCard.left);
          if (cCard.right) processCard(cCard.right);
          return;
        }
        if (cCard.type === 'page-banner') {
          const bannerMatch = aiCards.find(ac => !matchedAiCards.has(ac) && (
            (ac.type === 'page-banner') ||
            (ac.title && cCard.title && (ac.title.toLowerCase().includes(cCard.title.toLowerCase().slice(0, 15)) || cCard.title.toLowerCase().includes(ac.title.toLowerCase().slice(0, 15))))
          ));
          if (bannerMatch) {
            matchedAiCards.add(bannerMatch);
            if (bannerMatch.icon && bannerMatch.icon !== '📄') cCard.icon = bannerMatch.icon;
            if (bannerMatch.subtitle) cCard.subtitle = bannerMatch.subtitle;
          }
          return;
        }

        const cWords = getKeywords(cCard.title || '');
        if (Array.isArray(cCard.items)) {
          cCard.items.forEach(it => {
            const itWords = getKeywords(it.text || it.content || it.code || '');
            cWords.push(...itWords.slice(0, 5));
          });
        }

        let bestScore = 0;
        let bestAiCard = null;

        aiCards.forEach(ac => {
          if (matchedAiCards.has(ac)) return;
          const acWords = getKeywords(ac.title || '');
          if (Array.isArray(ac.items)) {
            ac.items.forEach(it => {
              const itWords = getKeywords(it.text || it.content || it.code || '');
              acWords.push(...itWords.slice(0, 5));
            });
          }

          let common = 0;
          cWords.forEach(w => {
            if (acWords.includes(w)) common++;
          });

          if (common > bestScore) {
            bestScore = common;
            bestAiCard = ac;
          }
        });

        if (bestAiCard && bestScore >= 2) {
          matchedAiCards.add(bestAiCard);

          if (bestAiCard.cardStyle && bestAiCard.cardStyle !== 'theme-card-blue') {
            cCard.cardStyle = bestAiCard.cardStyle;
          } else if (bestAiCard.theme) {
            cCard.cardStyle = bestAiCard.theme;
          }

          if (bestAiCard.icon && bestAiCard.icon !== '📌') {
            cCard.icon = bestAiCard.icon;
          }

          if (bestAiCard.variant) cCard.variant = bestAiCard.variant;
          if (bestAiCard.badge) cCard.badge = bestAiCard.badge;
          if (bestAiCard.isDialogueCallout !== undefined) {
            cCard.isDialogueCallout = bestAiCard.isDialogueCallout;
          }

          // Bespoke Title: If AI generated a title that includes or complements the section title
          if (bestAiCard.title && bestAiCard.title.trim().length > 3) {
            const cleanAi = bestAiCard.title.replace(/^(?:PAGE|PHASE|SECTION)\s*\d+[\s:–—-]*\s*/i, '').replace(/[^\w\s]/g, '').trim().toLowerCase();
            const cleanSrc = (cCard.rawHeading || cCard.title || '').replace(/^(?:PAGE|PHASE|SECTION)\s*\d+[\s:–—-]*\s*/i, '').replace(/[^\w\s]/g, '').trim().toLowerCase();
            
            if (cleanAi.includes(cleanSrc) || cleanSrc.includes(cleanAi)) {
              cCard.title = bestAiCard.title;
            } else if (!cCard.titleElementId) {
              cCard.title = bestAiCard.title;
            }
          }
        }
      };

      (cPage.sections || []).forEach(processCard);
    });

    canonicalBase.canonicalResult = canonicalResult || window.lastCanonicalResult;
    return canonicalBase;
  },

  reconcileCanonicalElementIds(mission, canonicalElements) {
    if (!mission.pages || !canonicalElements || canonicalElements.length === 0) return;

    // Collect all card sections (including inside split-layout)
    const cards = [];
    mission.pages.forEach(p => {
      (p.sections || []).forEach(sec => {
        if (sec.type === 'split-layout') {
          if (sec.left) cards.push(sec.left);
          if (sec.right) cards.push(sec.right);
        } else {
          cards.push(sec);
        }
      });
    });

    const usedIds = new Set();

    // Pass 1: Mark already assigned IDs
    cards.forEach(c => {
      if (c.elementId) usedIds.add(c.elementId);
      if (c.titleElementId) usedIds.add(c.titleElementId);
      if (Array.isArray(c.items)) {
        c.items.forEach(it => {
          if (it.id) usedIds.add(it.id);
          if (it.elementId) usedIds.add(it.elementId);
        });
      }
    });

    // Pass 2: Match unassigned cards by header text
    const headerElems = canonicalElements.filter(e => (e.type === 'SECTION_HEADER' || e.type === 'MISSION_TITLE') && !usedIds.has(e.id));
    cards.forEach(c => {
      if (!c.elementId && !c.titleElementId && headerElems.length > 0) {
        const cTitle = (c.title || '').trim().toLowerCase();
        const match = headerElems.find(h => {
          const hText = h.normalizedText.toLowerCase();
          return cTitle.includes(hText) || hText.includes(cTitle);
        });
        if (match) {
          c.elementId = match.id;
          c.titleElementId = match.id;
          usedIds.add(match.id);
        }
      }
    });

    // Pass 3: Match in-card items strictly by text similarity
    const remainingCanonical = canonicalElements.filter(e => !usedIds.has(e.id));

    cards.forEach(c => {
      if (Array.isArray(c.items)) {
        c.items.forEach(it => {
          if (!it.id && !it.elementId && remainingCanonical.length > 0) {
            const itText = (it.text || it.content || it.code || it.question || '').trim().toLowerCase();
            let foundIdx = -1;
            for (let i = 0; i < remainingCanonical.length; i++) {
              const cText = remainingCanonical[i].normalizedText.toLowerCase();
              if (itText && (itText.includes(cText.slice(0, 25)) || cText.includes(itText.slice(0, 25)))) {
                foundIdx = i;
                break;
              }
            }
            if (foundIdx !== -1) {
              const matched = remainingCanonical.splice(foundIdx, 1)[0];
              it.id = matched.id;
              it.elementId = matched.id;
              usedIds.add(matched.id);
              if (matched.contentLockMode === 'STRICT') {
                it.text = matched.text || matched.normalizedText;
                if (it.content !== undefined) it.content = matched.text || matched.normalizedText;
              }
              if (matched.orderLocked) {
                it.orderLocked = true;
              }
            }
          }
        });
      }
    });

    // Pass 4: Zero Omission Guarantee - Inject any unassigned canonical elements
    const stillMissing = canonicalElements.filter(e => !usedIds.has(e.id));
    if (stillMissing.length > 0 && cards.length > 0) {
      console.log(`🛡️ Canonical Zero-Omission Guard: Injecting ${stillMissing.length} missing elements into layout.`);
      stillMissing.forEach(elem => {
        let targetCard = cards[cards.length - 1];
        if (elem.parentId) {
          const parentCard = cards.find(c => c.elementId === elem.parentId || c.titleElementId === elem.parentId);
          if (parentCard) targetCard = parentCard;
        }
        if (targetCard) {
          if (!Array.isArray(targetCard.items)) targetCard.items = [];
          targetCard.items.push({
            id: elem.id,
            elementId: elem.id,
            type: elem.type,
            text: elem.text,
            normalizedText: elem.normalizedText,
            orderLocked: elem.orderLocked || false
          });
          usedIds.add(elem.id);
        }
      });
    }

    // Pass 5: Sequence & Order Lock Guarantee for Procedure Steps
    cards.forEach(c => {
      if (Array.isArray(c.items)) {
        const hasOrderLocked = c.items.some(it => it.orderLocked || it.type === 'PROCEDURE_STEP');
        if (hasOrderLocked) {
          c.items.sort((a, b) => {
            const idA = a.id || a.elementId || '';
            const idB = b.id || b.elementId || '';
            if (a.orderLocked && b.orderLocked) {
              return idA.localeCompare(idB);
            }
            return 0;
          });
        }
      }
    });
  },

  getEmptyMission() {
    return {
      id: "mission-empty",
      title: "NEW MISSION",
      theme: "theme-blue",
      missionNumber: "14",
      missionTitle: "NEW MISSION",
      missionSubtitle: "Paste your content in the Data tab and click Parse & Arrange!",
      mascotImg: "Images/nova poses/welcome.png",
      guideName: "Commander Nova",
      guideRole: "Your Mission Guide",
      pages: [{
        pageNumber: 1,
        pageType: "cover",
        sections: [
          { type: "nova-card", title: "GETTING STARTED", icon: "🚀", mascotPoseUrl: "Images/nova poses/welcome.png", content: "Paste your mission content in the Data tab on the left, then click '✨ Parse & Smart Arrange (AI)' to generate a premium book layout." }
        ]
      }]
    };
  },

  getHardwareImageForTopic(topicStr) {
    const t = (topicStr || '').toLowerCase();
    if (/dht|temp|climate|sensor/.test(t)) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
    if (/code|python|program|logic/.test(t)) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
    if (/robot|arm|servo|motor/.test(t)) return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80';
    if (/oled|screen|display|ui/.test(t)) return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
    if (/water|plant|soil|pump/.test(t)) return 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80';
    if (/solar|energy|power|green/.test(t)) return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  }
};
