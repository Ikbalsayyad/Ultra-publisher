/**
 * UltraMinds AI Service Engine (V6 - Smooth 10-Step Progress Stream & Null-Safe Rendering Guard)
 * Connects directly to Google Gemini 3.5 Flash / Pro API or OpenAI API using user API keys.
 * Executes a smooth progressive 10-Step Pipeline for ultra-high-precision STEM textbook chapters.
 */

window.AIService = {
  getSettings() {
    return {
      provider: localStorage.getItem('ultraminds_ai_provider') || 'gemini',
      apiKey: localStorage.getItem('ultraminds_ai_key') || localStorage.getItem('ultraminds_api_key') || localStorage.getItem('gemini_api_key') || '',
      model: localStorage.getItem('ultraminds_ai_model') || localStorage.getItem('ultraminds_api_model') || 'gemini-3.1-pro',
      customEndpoint: localStorage.getItem('ultraminds_ai_endpoint') || ''
    };
  },

  saveSettings(settings) {
    if (settings.provider) localStorage.setItem('ultraminds_ai_provider', settings.provider);
    if (settings.apiKey !== undefined) {
      const keyVal = settings.apiKey.trim();
      localStorage.setItem('ultraminds_ai_key', keyVal);
      localStorage.setItem('ultraminds_api_key', keyVal);
      localStorage.setItem('gemini_api_key', keyVal);
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
      console.log("🤖 AI Status Pipeline:", msg);
      if (statusCallback && typeof statusCallback === 'function') {
        statusCallback(msg);
      }
    };

    // If no API Key is set on this computer, inform user clearly
    if (!settings.apiKey) {
      updateStatus("⚠️ No API Key found on this device. Click ⚙️ API in top navbar to enter your key. Falling back to Heuristic Engine...");
      const parsed = window.HeuristicParser.parse(inputText, pageLimit);
      return this.normalizeMissionObject(parsed, inputText);
    }

    const masterPrompt = window.ULTRAMINDS_MASTER_PROMPT || `You are the Executive Design Director for UltraMinds Engineering Magazine. Structure the given text into an UltraMinds Book Mission JSON object.`;

    const stepsMessages = [
      `🚀 Step 1/10: Connecting to ${settings.provider.toUpperCase()} API (${settings.model || 'gemini-3.1-pro'})...`,
      "🧠 Step 2/10: Analyzing raw topic & mapping 52-Element UltraMinds STEM Ontology...",
      "📖 Step 3/10: Synthesizing Page 1: Mission Story, Real World Impact & OLED STEM Fact...",
      "🎯 Step 4/10: Synthesizing Page 2: Mission Objectives Grid & Component Anatomy Specs...",
      "🛠️ Step 5/10: Synthesizing Page 3: Breadboard Pinout Lab & Hardware Diagrams...",
      "💻 Step 6/10: Synthesizing Page 4: MicroPython/C++ Code Snippets & API Reference...",
      "⚠️ Step 7/10: Synthesizing Page 5: Troubleshooting Debug Corner & Scenario Comparison...",
      "🎓 Step 8/10: Synthesizing Page 6-8: STEM Careers, Safety Warnings & Achievement Badges...",
      "🖼️ Step 9/10: Resolving High-Res Hardware Schematics & Mascot Overlay Layer..."
    ];

    let currentStepIdx = 0;
    updateStatus(stepsMessages[0]);

    // Smooth progressive timer for real-time UI status updates while fetching
    const progressTimer = setInterval(() => {
      if (currentStepIdx < stepsMessages.length - 1) {
        currentStepIdx++;
        updateStatus(stepsMessages[currentStepIdx]);
      }
    }, 1200);

    try {
      let rawResult = null;

      if (settings.provider === 'gemini') {
        rawResult = await this.callGemini(settings.apiKey, settings.model || 'gemini-3.1-pro', masterPrompt, inputText, updateStatus);
      } else if (settings.provider === 'openai') {
        rawResult = await this.callOpenAI(settings.apiKey, settings.model || 'gpt-4o-mini', masterPrompt, inputText, updateStatus);
      } else {
        rawResult = await this.callCustom(settings.customEndpoint, settings.apiKey, masterPrompt, inputText, updateStatus);
      }

      clearInterval(progressTimer);

      updateStatus("✨ Step 10/10: Complete! Masterpiece Premium Engineering Magazine Chapter Ready!");
      return this.normalizeMissionObject(rawResult, inputText);

    } catch (err) {
      clearInterval(progressTimer);
      console.error("AI Service API Call Failed:", err);
      updateStatus(`⚠️ API Notice: ${err.message}. Using Smart Heuristic Engine fallback...`);

      const fallback = window.HeuristicParser.parse(inputText, pageLimit);
      return this.normalizeMissionObject(fallback, inputText);
    }
  },

  async callGemini(apiKey, model, systemPrompt, userContent, updateStatus) {
    const modelsToTry = [model || 'gemini-3.1-pro', 'gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'].filter(Boolean);
    const uniqueModels = [...new Set(modelsToTry)];
    let lastError = null;

    for (const modelName of uniqueModels) {
      try {
        if (updateStatus) updateStatus(`🚀 Connecting to Gemini API (${modelName})...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const payload = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: `Here is the raw mission topic/content to transform into an ultra-detailed 5-14 page Premium Engineering Magazine JSON chapter:\n\n${userContent}` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
            temperature: 0.7
          }
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini API Error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("Empty response from Gemini API");

        const parsed = this.parseJSONSafely(rawText);
        if (parsed) return parsed;
      } catch (err) {
        console.warn(`Gemini Model [${modelName}] failed:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error("All Gemini API models failed to return valid JSON");
  },

  async callOpenAI(apiKey, model, systemPrompt, userContent, updateStatus) {
    const modelName = model || 'gpt-4o-mini';
    const url = `https://api.openai.com/v1/chat/completions`;

    const payload = {
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) throw new Error("Empty response from OpenAI API");

    return this.parseJSONSafely(rawText);
  },

  parseJSONSafely(rawText) {
    let cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    const firstBracket = cleanText.indexOf('[');
    const lastBracket = cleanText.lastIndexOf(']');

    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket !== -1) {
      cleanText = cleanText.substring(firstBracket, lastBracket + 1);
    }

    try {
      return JSON.parse(cleanText);
    } catch (e) {
      console.warn("Failed to parse raw JSON from AI:", e, rawText);
      return null;
    }
  },

  /**
   * ZERO-FAIL MISSION NORMALIZER & HARDWARE IMAGE ENRICHER
   */
  normalizeMissionObject(data, fallbackRawText) {
    if (!data) {
      data = window.HeuristicParser.parse(fallbackRawText);
    }

    let mission = data;

    if (Array.isArray(data)) {
      mission = {
        id: "mission-" + Date.now(),
        title: "GENERATED MISSION",
        theme: "theme-blue",
        missionNumber: "15",
        missionTitle: "GENERATED MISSION",
        missionSubtitle: "Created automatically by UltraMinds AI Studio",
        pages: data
      };
    } else if (!data.pages && data.sections) {
      mission = {
        id: "mission-" + Date.now(),
        title: data.title || "GENERATED MISSION",
        theme: data.theme || "theme-blue",
        missionNumber: data.missionNumber || "15",
        missionTitle: data.missionTitle || data.title || "GENERATED MISSION",
        missionSubtitle: data.missionSubtitle || "",
        pages: [{ pageNumber: 1, sections: data.sections }]
      };
    }

    // Auto-Enrich Image URLs with high-res Unsplash hardware photos if missing or generic
    if (mission.pages && Array.isArray(mission.pages)) {
      mission.pages.forEach(page => {
        if (page.sections && Array.isArray(page.sections)) {
          page.sections.forEach(sec => {
            if (sec.type === 'image-holder' || sec.type === 'incard-image-holder') {
              if (!sec.imgUrl || sec.imgUrl.includes('placeholder')) {
                sec.imgUrl = this.getHardwareImageForTopic(sec.title || sec.caption || mission.title || '');
              }
            }
          });
        }
      });
    }

    return mission;
  },

  getHardwareImageForTopic(topicStr) {
    const t = (topicStr || '').toLowerCase();
    if (t.includes('dht') || t.includes('temp') || t.includes('climate') || t.includes('sensor')) {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('code') || t.includes('python') || t.includes('program') || t.includes('logic')) {
      return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('robot') || t.includes('arm') || t.includes('servo') || t.includes('motor')) {
      return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('oled') || t.includes('screen') || t.includes('display') || t.includes('ui')) {
      return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('water') || t.includes('plant') || t.includes('soil') || t.includes('pump')) {
      return 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('solar') || t.includes('energy') || t.includes('power') || t.includes('green')) {
      return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  }
};
