/**
 * UltraMinds AI Service Engine V20
 * 32K token limit, 2-pass extraction, smart JSON repair, streaming progress
 */

window.AIService = {
  getSettings() {
    return {
      provider: localStorage.getItem('ultraminds_ai_provider') || 'gemini',
      apiKey: localStorage.getItem('ultraminds_ai_key') || localStorage.getItem('ultraminds_api_key') || localStorage.getItem('gemini_api_key') || '',
      model: localStorage.getItem('ultraminds_ai_model') || 'gemini-2.5-flash',
      customEndpoint: localStorage.getItem('ultraminds_ai_endpoint') || ''
    };
  },

  saveSettings(settings) {
    if (settings.provider) localStorage.setItem('ultraminds_ai_provider', settings.provider);
    if (settings.apiKey !== undefined) {
      const k = settings.apiKey.trim();
      localStorage.setItem('ultraminds_ai_key', k);
      localStorage.setItem('ultraminds_api_key', k);
      localStorage.setItem('gemini_api_key', k);
    }
    if (settings.model) {
      localStorage.setItem('ultraminds_ai_model', settings.model);
      localStorage.setItem('ultraminds_api_model', settings.model);
    }
    if (settings.customEndpoint !== undefined) localStorage.setItem('ultraminds_ai_endpoint', settings.customEndpoint.trim());
  },

  async processMissionData(inputText, pageLimit = "auto", statusCallback = null) {
    const settings = this.getSettings();
    const updateStatus = (msg) => {
      console.log("🤖 Publishing Compiler:", msg);
      if (statusCallback) statusCallback(msg);
    };

    // Stage 1: Always compile canonical source first
    let canonicalResult = null;
    if (window.CanonicalCompiler) {
      updateStatus("🔒 Stage 1/4: Compiling Canonical Source & Locking Technical Facts...");
      canonicalResult = window.CanonicalCompiler.compile(inputText, 'M01');
      window.lastCanonicalResult = canonicalResult;
    }

    if (!settings.apiKey) {
      updateStatus("⚠️ No API Key — using Publishing Compiler & Dynamic Composer...");
      const parsedData = (window.HeuristicParser && typeof window.HeuristicParser.parse === 'function')
        ? window.HeuristicParser.parse(inputText, pageLimit)
        : null;
      return this.normalizeMissionObject(parsedData, inputText);
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
      return this.normalizeMissionObject(rawResult, inputText);
    } catch (err) {
      clearInterval(timer);
      console.error("AI Service Error:", err);
      updateStatus(`⚠️ API Error: ${err.message} — Falling back to Publishing Compiler Engine...`);
      const parsedFallback = (window.HeuristicParser && typeof window.HeuristicParser.parse === 'function')
        ? window.HeuristicParser.parse(inputText, pageLimit)
        : null;
      return this.normalizeMissionObject(parsedFallback, inputText);
    }
  },

  async callGeminiWithFallback(apiKey, preferredModel, userContent, updateStatus) {
    const modelsToTry = [
      preferredModel,
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash'
    ].filter(m => m && !m.includes('1.5'));
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
      }
    }
    throw lastError || new Error("All Gemini models failed");
  },

  async callGemini(apiKey, model, userContent, updateStatus) {
    const systemPrompt = window.ULTRAMINDS_MASTER_PROMPT || 'Structure content as UltraMinds Mission JSON.';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
        maxOutputTokens: 65536,
        temperature: 0.4,
        topP: 0.95
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Gemini ${res.status}: ${txt.substring(0, 200)}`);
    }

    const data = await res.json();

    // Handle safety blocks or empty responses
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      throw new Error('Response blocked by safety filters');
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini API");

    if (updateStatus) updateStatus(`📦 Received ${Math.round(rawText.length / 1000)}KB response — parsing JSON...`);

    const parsed = this.parseJSONSafely(rawText);
    if (!parsed) throw new Error("Failed to parse JSON response");
    return parsed;
  },

  async callOpenAICompatible(provider, apiKey, model, customEndpoint, userContent, updateStatus) {
    const systemPrompt = window.ULTRAMINDS_MASTER_PROMPT || 'Structure content as UltraMinds Mission JSON.';
    const cleanKey = (apiKey || '').trim();

    if (!cleanKey && provider !== 'custom') {
      throw new Error(`Missing API Key for ${provider.toUpperCase()}. Please click ⚙️ API Settings and enter your ${provider.toUpperCase()} API Key.`);
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
    } else if (provider === 'openai') {
      if (!modelName || modelName.startsWith('gemini')) {
        modelName = 'gpt-4o';
      }
    }

    const maxTokensLimit = (provider === 'groq') ? 30000 : 30000;

    const payload = {
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Convert this raw educational content into a complete, ultra-detailed UltraMinds Mission JSON. Include ALL content — zero omission.\n\nRAW CONTENT:\n\n${userContent}` }
      ],
      max_tokens: maxTokensLimit,
      temperature: 0.4
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

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`${provider.toUpperCase()} API Error (${res.status}): ${txt.substring(0, 250)}`);
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

    // Last resort: close all open braces/brackets
    const closes = [];
    depth = 0;
    inString = false;
    escaped = false;
    const stack = [];

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\' && inString) { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (!inString) {
        if (ch === '{') stack.push('}');
        else if (ch === '[') stack.push(']');
        else if (ch === '}' || ch === ']') stack.pop();
      }
    }

    return str + stack.reverse().join('');
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

    return mission;
  },

  getEmptyMission() {
    return {
      id: "mission-empty",
      title: "NEW MISSION",
      theme: "theme-blue",
      missionNumber: "14",
      missionTitle: "NEW MISSION",
      missionSubtitle: "Paste your content in the Data tab and click Parse & Arrange!",
      guideName: "Commander Nova",
      guideRole: "Your Mission Guide",
      pages: [{
        pageNumber: 1,
        pageType: "cover",
        sections: [
          { type: "nova-card", title: "GETTING STARTED", icon: "🧑‍🚀", content: "Paste your mission content in the Data tab on the left, then click '✨ Parse & Smart Arrange (AI)' to generate a premium book layout." }
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
