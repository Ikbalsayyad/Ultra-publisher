/**
 * UltraMinds Studio Main Application Controller (V8 - Pinned Top Image & Sticker Holders + Alphabetical Palette)
 */

window.populateElementsPalette = function() {
  const container = document.getElementById('elements-palette-container');
  if (!container) return;

  if (!window.ULTRAMINDS_50_ELEMENTS) window.ULTRAMINDS_50_ELEMENTS = {};

  const newPaletteItems = {
    'in-card-subcard': { type: 'in-card-subcard', name: 'Plain Sub-Card Box', icon: '📦', desc: 'Nested plain sub-card container' },
    'callout-box': { type: 'callout-box', name: 'Callout Alert Box', icon: '💡', desc: 'Styled key takeaway callout box' },
    'key-value-pair': { type: 'key-value-pair', name: 'Key-Value Pair Matrix', icon: '🏷️', desc: 'Specification label-value pair grid' },
    'dynamic-synthesized': { type: 'dynamic-synthesized', name: 'Smart Synthesizer Card', icon: '⚙️', desc: 'Universal dynamic synthesizer card' }
  };

  Object.assign(window.ULTRAMINDS_50_ELEMENTS, newPaletteItems);

  container.innerHTML = '';
  const allItems = Object.values(window.ULTRAMINDS_50_ELEMENTS);

  // 1. PIN TOP 3 HOLDERS AT THE VERY TOP
  const pinnedKeys = ['floating-clipart', 'image-holder', 'incard-image-holder'];
  const pinnedItems = [];
  const remainingItems = [];

  allItems.forEach(item => {
    if (pinnedKeys.includes(item.type)) {
      pinnedItems.push(item);
    } else {
      remainingItems.push(item);
    }
  });

  // Ensure pinned items order matches pinnedKeys
  pinnedItems.sort((a, b) => pinnedKeys.indexOf(a.type) - pinnedKeys.indexOf(b.type));

  // SORT REMAINING ALPHABETICALLY A-Z BY COMPONENT NAME
  remainingItems.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const finalOrder = [...pinnedItems, ...remainingItems];

  finalOrder.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'palette-btn';
    if (pinnedKeys.includes(item.type)) {
      btn.style.border = '1px solid var(--accent-cyan)';
      btn.style.background = 'rgba(0, 240, 255, 0.12)';
    }
    btn.innerHTML = `<span style="font-size:1.0rem;">${item.icon || '📌'}</span> <span>${item.name}</span>`;
    btn.title = item.desc || item.name;
    btn.onclick = () => window.CanvasEditor.insertComponent(item.type);
    container.appendChild(btn);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Engines (V3 Stack)
  window.CanvasEditor.init();
  window.ContextMenu.init();
  if (window.InCardDesigner) window.InCardDesigner.init();
  if (window.PageManager) window.PageManager.init();
  if (window.BlocksEditor) window.BlocksEditor.init();
  if (window.CardDesigner) window.CardDesigner.init();
  if (window.PageManager) window.PageManager.loadSavedMargins();

  // Ctrl+S Quick Save Shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      window.SaveEngine?.quickSave();
    }
  });

  // Load Default Mission (Mission 14)
  window.currentMission = window.SAMPLE_MISSIONS.mission14;

  const canvasContainer = document.getElementById('a4-canvas-container');
  const presetSelect = document.getElementById('preset-mission-select');
  const rawInputText = document.getElementById('raw-mission-input');
  const tokenBadge = document.getElementById('token-count-badge');
  const parseBtn = document.getElementById('btn-parse-ai');
  const parseHeuristicBtn = document.getElementById('btn-parse-heuristic');
  const quickModelSelect = document.getElementById('quick-model-select');
  const themeSelect = document.getElementById('theme-picker');
  const fontScaler = document.getElementById('font-scaler');
  const manualModeBtn = document.getElementById('btn-toggle-manual');
  const zoomSlider = document.getElementById('canvas-zoom-slider');
  const zoomLabel = document.getElementById('canvas-zoom-val');

  const pageSetupBtn = document.getElementById('btn-page-setup');
  const pageSetupModal = document.getElementById('page-setup-modal');
  const savePageSetupBtn = document.getElementById('btn-save-page-setup');

  const aiToolsBtn = document.getElementById('btn-ai-tools');
  const aiToolsModal = document.getElementById('ai-tools-modal');
  const aiStatusMonitor = document.getElementById('ai-status-monitor');
  const aiStatusText = document.getElementById('ai-status-text');

  // Real-Time Token Counter (#13)
  const updateTokenCount = () => {
    if (!rawInputText || !tokenBadge) return;
    const text = rawInputText.value || '';
    const approxTokens = Math.ceil(text.length / 4);
    tokenBadge.textContent = `~${approxTokens.toLocaleString()} tokens`;
  };

  // Pre-fill raw text box
  if (rawInputText) {
    rawInputText.value = JSON.stringify(window.currentMission, null, 2);
    updateTokenCount();
    rawInputText.addEventListener('input', updateTokenCount);
  }

  // Populate 52 Elements Palette
  window.populateElementsPalette();

  // Initial Render — try to restore last quick-save first
  try {
    const hasQuickSave = localStorage.getItem(`${window.SaveEngine?.SLOT_PREFIX || 'umproj_slot_'}0`);
    if (hasQuickSave && window.SaveEngine) {
      // Silently restore without toast on startup
      const raw = localStorage.getItem(`${window.SaveEngine.SLOT_PREFIX}0`);
      try {
        const snap = JSON.parse(raw);
        window.SaveEngine.restoreSnapshot(snap);
      } catch (err) {
        console.error("Failed to restore save:", err);
        window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
      }
    } else {
      window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
    }
  } catch (err) {
    console.error("Critical error during initial render:", err);
  }

  // Initialize Safety History System (10-Step Undo/Redo)
  if (window.HistoryEngine) window.HistoryEngine.init();

  // Sync zoom label on startup
  const initialZoom = parseFloat(zoomSlider?.value || 0.75);
  if (zoomLabel) zoomLabel.textContent = `${Math.round(initialZoom * 100)}%`;
  document.documentElement.style.setProperty('--canvas-zoom', initialZoom);

  // Dynamic Zoom Slider Handler
  zoomSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const pct = Math.round(val * 100);
    if (zoomLabel) zoomLabel.textContent = `${pct}%`;

    document.documentElement.style.setProperty('--canvas-zoom', val);
    window.LayoutEngine.autoReflowPages();
  });

  // Sidebar Tab Switcher
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab') || btn.onclick?.toString().match(/'([^']+)'/)?.[1];
      const targetTab = document.getElementById(targetId);
      if (targetTab) {
        targetTab.classList.add('active');
        if (targetId === 'tab-palette') window.populateElementsPalette();
      }
    });
  });

  // Preset Mission Picker
  presetSelect?.addEventListener('change', async (e) => {
    const selectedKey = e.target.value;
    const parseText = (t) => (window.HeuristicParser && window.HeuristicParser.parse) ? window.HeuristicParser.parse(t) : null;
    if (selectedKey === 'mission99') {
      try {
        const resp = await fetch('Text/stress-test-mission.xhtml');
        const text = await resp.text();
        rawInputText.value = text;
        window.currentMission = window.AIService.normalizeMissionObject(parseText(text), text);
      } catch(err) {
        alert("Failed to load Mission 99 stress test text: " + err.message);
      }
    } else if (selectedKey === 'mission03') {
      rawInputText.value = window.SAMPLE_MISSIONS.mission03Text;
      window.currentMission = window.AIService.normalizeMissionObject(parseText(window.SAMPLE_MISSIONS.mission03Text), window.SAMPLE_MISSIONS.mission03Text);
    } else if (selectedKey === 'rawTextSample') {
      rawInputText.value = window.SAMPLE_MISSIONS.rawTextSample;
      window.currentMission = window.AIService.normalizeMissionObject(parseText(window.SAMPLE_MISSIONS.rawTextSample), window.SAMPLE_MISSIONS.rawTextSample);
    } else if (window.SAMPLE_MISSIONS[selectedKey]) {
      window.currentMission = window.SAMPLE_MISSIONS[selectedKey];
      rawInputText.value = JSON.stringify(window.currentMission, null, 2);
    }
    window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
  });

  // AI / Heuristic Parse Button with Real-Time Status Stream
  parseBtn?.addEventListener('click', async () => {
    const text = rawInputText.value;
    if (!text.trim()) {
      alert("Please paste some mission data into the text box first!");
      return;
    }

    parseBtn.disabled = true;
    parseBtn.innerHTML = '✨ Processing AI Layout...';

    if (aiStatusMonitor) aiStatusMonitor.style.display = 'block';

    const updateStatusUI = (statusMsg) => {
      if (aiStatusText) aiStatusText.innerHTML = statusMsg;
    };

    try {
      // Sync model from quick-model-select if user set a specific quick model
      const quickModel = quickModelSelect?.value;
      if (quickModel && quickModel !== 'heuristic' && quickModel !== 'saved') {
        window.AIService?.saveSettings?.({ model: quickModel });
      }

      if (quickModel === 'heuristic') {
        updateStatusUI('🔵 Running Smart Heuristic Parser (No API)...');
        const parsed = (window.HeuristicParser && window.HeuristicParser.parse) ? window.HeuristicParser.parse(text) : null;
        window.currentMission = window.AIService?.normalizeMissionObject ? window.AIService.normalizeMissionObject(parsed, text) : parsed;
      } else if (window.AIService?.processMissionData) {
        window.currentMission = await window.AIService.processMissionData(text, "auto", updateStatusUI);
      } else {
        const parsed = (window.HeuristicParser && window.HeuristicParser.parse) ? window.HeuristicParser.parse(text) : null;
        window.currentMission = parsed;
      }
      window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
    } catch (err) {
      console.error(err);
      alert("Error parsing mission data: " + err.message);
    } finally {
      parseBtn.disabled = false;
      parseBtn.innerHTML = '✨ Parse &amp; Smart Arrange (AI) — Premium Layout';
      setTimeout(() => {
        if (aiStatusMonitor) aiStatusMonitor.style.display = 'none';
      }, 5000);
    }
  });

  // Quick Heuristic Parse Button (offline)
  parseHeuristicBtn?.addEventListener('click', () => {
    const text = rawInputText?.value || '';
    if (!text.trim()) { alert('Paste content first!'); return; }
    const parsed = (window.HeuristicParser && window.HeuristicParser.parse) ? window.HeuristicParser.parse(text) : null;
    window.currentMission = window.AIService.normalizeMissionObject(parsed, text);
    window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
  });

  // Sync quick model select ↔ AI settings
  quickModelSelect?.addEventListener('change', (e) => {
    if (e.target.value !== 'heuristic' && e.target.value !== 'saved') {
      window.AIService?.saveSettings?.({ model: e.target.value });
    }
  });

  // Theme Picker
  themeSelect?.addEventListener('change', (e) => {
    window.currentMission.theme = e.target.value;
    window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
  });

  // Font Scaler
  fontScaler?.addEventListener('input', (e) => {
    const scale = e.target.value;
    document.documentElement.style.setProperty('--font-scale', scale);
    window.LayoutEngine.checkOverflows();
  });

  // Toggle Manual Mode
  manualModeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('manual-mode');
    const isManual = document.body.classList.contains('manual-mode');
    manualModeBtn.classList.toggle('active', isManual);
    manualModeBtn.innerHTML = isManual ? '🔓 Manual Mode (ON)' : '🔒 Manual Mode (OFF)';
  });

  // Toggle Left Sidebar Panel
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const leftPanel = document.querySelector('.left-control-panel');
  btnToggleSidebar?.addEventListener('click', () => {
    if (leftPanel) {
      leftPanel.classList.toggle('collapsed');
      const isCollapsed = leftPanel.classList.contains('collapsed');
      btnToggleSidebar.innerHTML = isCollapsed ? '▶ Panel' : '◀ Panel';
    }
  });

  // NEXT-LEVEL AI SUITE ACTIONS
  aiToolsBtn?.addEventListener('click', () => aiToolsModal.classList.add('show-modal'));
  document.getElementById('btn-close-ai-tools')?.addEventListener('click', () => aiToolsModal.classList.remove('show-modal'));

  document.getElementById('ai-tool-equalize')?.addEventListener('click', () => {
    window.AILayoutTools.autoEqualizePages();
    alert("⚡ AI Smart Page Equalizer redistributed cards evenly across pages!");
    aiToolsModal.classList.remove('show-modal');
  });

  document.getElementById('ai-tool-reorder')?.addEventListener('click', () => {
    window.AILayoutTools.autoReorderPedagogicalFlow();
    alert("📐 AI Pedagogical Flow sorted cards into ideal textbook learning order!");
    aiToolsModal.classList.remove('show-modal');
  });

  document.getElementById('ai-tool-alignfooters')?.addEventListener('click', () => {
    window.AILayoutTools.autoAlignPageFooters();
    alert("🪄 AI Whitespace Auto-Aligner inserted spacers to balance page footers!");
    aiToolsModal.classList.remove('show-modal');
  });

  document.getElementById('ai-tool-enhancehierarchy')?.addEventListener('click', () => {
    window.AILayoutTools.autoEnhanceVisualHierarchy();
    alert("🎨 AI Visual Hierarchy Enhancer applied hero colors and capsule themes!");
    aiToolsModal.classList.remove('show-modal');
  });

  document.getElementById('ai-tool-autotheme')?.addEventListener('click', () => {
    const themes = ['theme-blue', 'theme-green', 'theme-orange', 'theme-purple'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    window.currentMission.theme = randomTheme;
    document.getElementById('theme-picker').value = randomTheme;
    window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
    alert(`🎨 AI Theme Generator applied domain theme: ${randomTheme.toUpperCase()}`);
    aiToolsModal.classList.remove('show-modal');
  });

  document.getElementById('ai-tool-debuggen')?.addEventListener('click', () => {
    window.CanvasEditor.insertComponent('debug-corner');
    alert("🐛 Generated Common Mistakes & Debug Corner!");
    aiToolsModal.classList.remove('show-modal');
  });

  // Page Setup Modal & Actions
  pageSetupBtn?.addEventListener('click', () => {
    const savedFont = localStorage.getItem('ultraminds_global_font') || "'Inter', sans-serif";
    const savedBgImg = localStorage.getItem('ultraminds_page_bg_img') || '';
    const savedOpacity = localStorage.getItem('ultraminds_page_bg_opacity') || '1.0';

    const fontSelect = document.getElementById('page-font-select');
    const bgImgInput = document.getElementById('page-bg-img-input');
    const opacitySlider = document.getElementById('page-bg-opacity-slider');

    if (fontSelect) fontSelect.value = savedFont;
    if (bgImgInput) bgImgInput.value = savedBgImg;
    if (opacitySlider) opacitySlider.value = savedOpacity;

    pageSetupModal.classList.add('show-modal');
  });

  document.getElementById('btn-close-page-setup')?.addEventListener('click', () => {
    pageSetupModal.classList.remove('show-modal');
  });

  // Custom Background Image File Picker Handler
  document.getElementById('btn-upload-bg-img')?.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          document.getElementById('page-bg-img-input').value = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  });

  savePageSetupBtn?.addEventListener('click', () => {
    const fontVal = document.getElementById('page-font-select').value;
    const viewMode = document.getElementById('page-view-mode-select').value;
    const bgColor = document.getElementById('page-bg-color-picker').value;
    const bgImgUrl = document.getElementById('page-bg-img-input').value.trim();
    const texture = document.getElementById('page-texture-select').value;
    const opacityVal = document.getElementById('page-bg-opacity-slider').value;

    localStorage.setItem('ultraminds_global_font', fontVal);
    localStorage.setItem('ultraminds_page_bg_img', bgImgUrl);
    localStorage.setItem('ultraminds_page_bg_opacity', opacityVal);

    const isTwoPage = viewMode === 'two-page';
    document.body.classList.toggle('view-two-page', isTwoPage);

    window.LayoutEngine.applyTwoPageSpreadMode();

    const pages = document.querySelectorAll('.book-page');
    pages.forEach(p => {
      p.style.setProperty('--page-global-font', fontVal);
      p.style.backgroundColor = bgColor;

      const overlay = p.querySelector('.page-background-overlay');
      if (overlay) {
        if (bgImgUrl) {
          overlay.style.backgroundImage = `url("${bgImgUrl}")`;
        } else if (texture === 'grid') {
          overlay.style.backgroundImage = 'radial-gradient(#CBD5E1 1px, transparent 1px)';
          overlay.style.backgroundSize = '20px 20px';
        } else if (texture === 'dots') {
          overlay.style.backgroundImage = 'radial-gradient(#94A3B8 1px, transparent 1px)';
          overlay.style.backgroundSize = '12px 12px';
        } else {
          overlay.style.backgroundImage = 'none';
        }
        overlay.style.opacity = opacityVal;
      }
    });

    pageSetupModal.classList.remove('show-modal');
  });

  // Export Engine Bindings
  document.getElementById('btn-export-pdf')?.addEventListener('click', () => window.ExportEngine.exportPDF());
  document.getElementById('btn-export-word')?.addEventListener('click', () => window.ExportEngine.exportWord());
  document.getElementById('btn-export-pptx')?.addEventListener('click', () => window.ExportEngine.exportPPTX());
  document.getElementById('btn-export-xhtml')?.addEventListener('click', () => window.ExportEngine.exportXHTML());

  // Extracted API Settings functions below

  document.getElementById('btn-api-settings')?.addEventListener('click', window.openApiSettings);
  document.getElementById('btn-close-modal')?.addEventListener('click', window.closeApiSettings);
  document.getElementById('btn-save-api')?.addEventListener('click', window.saveApiSettings);
  document.getElementById('api-provider-select')?.addEventListener('change', (e) => {
    const p = e.target.value;
    const customGroup = document.getElementById('custom-endpoint-group');
    const keyInput = document.getElementById('api-key-input');
    const modelInput = document.getElementById('api-model-input');

    if (customGroup) customGroup.style.display = (p === 'custom') ? 'block' : 'none';

    if (keyInput) {
      if (p === 'nara') keyInput.placeholder = 'NaRA API Key (Bearer token)';
      else if (p === 'openrouter') keyInput.placeholder = 'sk-or-v1-... (OpenRouter API Key)';
      else if (p === 'groq') keyInput.placeholder = 'gsk_... (Groq API Key)';
      else if (p === 'deepseek') keyInput.placeholder = 'sk-... (DeepSeek API Key)';
      else if (p === 'openai') keyInput.placeholder = 'sk-... (OpenAI API Key)';
      else if (p === 'gemini') keyInput.placeholder = 'AIzaSy... (Gemini API Key)';
      else keyInput.placeholder = 'Optional for local LLM';
    }

    if (modelInput) {
      if (p === 'nara' && (!modelInput.value || modelInput.value.startsWith('gemini'))) modelInput.value = 'mistral-medium-3-5';
      else if (p === 'openrouter' && (!modelInput.value || modelInput.value.startsWith('gemini'))) modelInput.value = 'anthropic/claude-3.5-sonnet';
      else if (p === 'groq' && (!modelInput.value || modelInput.value.startsWith('gemini'))) modelInput.value = 'llama-3.3-70b-versatile';
      else if (p === 'deepseek' && (!modelInput.value || modelInput.value.startsWith('gemini'))) modelInput.value = 'deepseek-chat';
    }
  });

  // Initialize Drag & Drop project file loader (.ultraminds / .umproj / .json)
  if (window.SaveEngine && typeof window.SaveEngine.setupProjectFileDrop === 'function') {
    window.SaveEngine.setupProjectFileDrop();
  }
});

// Immediate Fallback Execution
setTimeout(() => window.populateElementsPalette && window.populateElementsPalette(), 100);

// API Settings Modal Global Functions
window.openApiSettings = function() {
  const settings = (window.AIService && typeof window.AIService.getSettings === 'function')
    ? window.AIService.getSettings()
    : {
        provider: localStorage.getItem('ultraminds_ai_provider') || 'gemini',
        apiKey: localStorage.getItem('ultraminds_ai_key') || localStorage.getItem('gemini_api_key') || '',
        model: localStorage.getItem('ultraminds_ai_model') || 'gemini-2.5-flash',
        customEndpoint: localStorage.getItem('ultraminds_ai_endpoint') || ''
      };

  const providerSelect = document.getElementById('api-provider-select');
  const keyInput = document.getElementById('api-key-input');
  const modelInput = document.getElementById('api-model-input');
  const endpointInput = document.getElementById('api-endpoint-input');
  const customGroup = document.getElementById('custom-endpoint-group');
  const apiSettingsModal = document.getElementById('api-settings-modal');

  if (providerSelect) providerSelect.value = settings.provider || 'gemini';
  if (keyInput) keyInput.value = settings.apiKey || '';
  if (modelInput) modelInput.value = settings.model || 'gemini-2.5-flash';
  if (endpointInput) endpointInput.value = settings.customEndpoint || 'http://localhost:11434/v1/chat/completions';

  if (customGroup) customGroup.style.display = (settings.provider === 'custom') ? 'block' : 'none';

  if (apiSettingsModal) {
    apiSettingsModal.classList.add('show-modal');
    apiSettingsModal.style.cssText = 'display: flex !important; z-index: 99999 !important;';
  }
};

window.closeApiSettings = function() {
  const apiSettingsModal = document.getElementById('api-settings-modal');
  if (apiSettingsModal) {
    apiSettingsModal.classList.remove('show-modal');
    apiSettingsModal.style.cssText = 'display: none !important;';
  }
};

window.saveApiSettings = function() {
  const provider = document.getElementById('api-provider-select')?.value || 'gemini';
  const key = document.getElementById('api-key-input')?.value.trim() || '';
  const model = document.getElementById('api-model-input')?.value.trim() || 'gemini-2.5-flash';
  const customEndpoint = document.getElementById('api-endpoint-input')?.value.trim() || '';

  if (window.AIService && typeof window.AIService.saveSettings === 'function') {
    window.AIService.saveSettings({ provider, apiKey: key, model, customEndpoint });
  } else {
    localStorage.setItem('ultraminds_ai_provider', provider);
    localStorage.setItem('ultraminds_ai_key', key);
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('ultraminds_ai_model', model);
    localStorage.setItem('ultraminds_ai_endpoint', customEndpoint);
  }

  alert("⚙️ API Settings saved successfully!");
  window.closeApiSettings();
};
