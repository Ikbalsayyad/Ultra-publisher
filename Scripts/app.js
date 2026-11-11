/**
 * UltraMinds Studio Main Application Controller (V8.1 - Neo-Clay Pro, Categorized Palette & Spotlight Search)
 */

window.PALETTE_CATEGORY_MAP = {
  'floating-clipart': 'media',
  'image-holder': 'media',
  'pure-image-holder': 'media',
  'incard-image-holder': 'media',
  'page-banner': 'layout',
  'mission-progress': 'layout',
  'space-filler': 'layout',
  'drawing-canvas': 'layout',
  'in-card-subcard': 'layout',
  'callout-box': 'layout',
  'key-value-pair': 'layout',
  'dynamic-synthesized': 'layout',
  'mission-story': 'concept',
  'real-world': 'concept',
  'curiosity-box': 'concept',
  'stem-fact': 'concept',
  'mission-objectives': 'concept',
  'think-engineer': 'concept',
  'concept-card': 'concept',
  'inside-sensor': 'concept',
  'comparison-vs': 'concept',
  'did-you-know': 'concept',
  'engineer-tip': 'concept',
  'nova-card': 'concept',
  'vocabulary-builder': 'concept',
  'career-spotlight': 'concept',
  'component-spotlight': 'code',
  'code-snippet': 'code',
  'flowchart-sequence': 'code',
  'blocks-code': 'code',
  'variables-at-work': 'code',
  'oled-preview': 'code',
  'programming-studio': 'code',
  'device-ready': 'code',
  'build-steps': 'activity',
  'observe-card': 'activity',
  'predict-think': 'activity',
  'challenge-box': 'activity',
  'mini-upgrade': 'activity',
  'real-challenge': 'activity',
  'mission-challenge': 'activity',
  'in-this-lab': 'activity',
  'pro-tip': 'activity',
  'safety-card': 'activity',
  'common-mistakes': 'review',
  'engineers-everywhere': 'review',
  'mission-review-table': 'review',
  'ultra-badge': 'review',
  'beyond-mission': 'review',
  'next-preview': 'review',
  'worksheet-card': 'review',
  'quick-recap': 'review',
  'knowledge-check': 'review',
  'qr-resources': 'review'
};

window.paletteState = {
  query: '',
  category: 'all'
};

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
  const query = (window.paletteState?.query || '').trim().toLowerCase();
  const activeCat = window.paletteState?.category || 'all';

  const pinnedKeys = ['floating-clipart', 'image-holder', 'pure-image-holder', 'incard-image-holder'];

  // Filter items by query & category
  const filtered = allItems.filter(item => {
    const cat = window.PALETTE_CATEGORY_MAP[item.type] || 'concept';
    const matchesCat = activeCat === 'all' || cat === activeCat;
    const matchesQuery = !query ||
      (item.name || '').toLowerCase().includes(query) ||
      (item.desc || '').toLowerCase().includes(query) ||
      (item.type || '').toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  const pinnedItems = [];
  const remainingItems = [];

  filtered.forEach(item => {
    if (pinnedKeys.includes(item.type)) {
      pinnedItems.push(item);
    } else {
      remainingItems.push(item);
    }
  });

  pinnedItems.sort((a, b) => pinnedKeys.indexOf(a.type) - pinnedKeys.indexOf(b.type));
  remainingItems.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const createTile = (item, isPinned) => {
    const btn = document.createElement('button');
    btn.className = `palette-btn${isPinned ? ' pinned-tile' : ''}`;
    btn.innerHTML = `
      <span class="palette-btn-icon">${item.icon || '📌'}</span>
      <span class="palette-btn-name">${item.name}</span>
    `;
    btn.title = item.desc || item.name;
    btn.onclick = () => window.CanvasEditor.insertComponent(item.type);
    return btn;
  };

  if (pinnedItems.length > 0) {
    const heading = document.createElement('div');
    heading.className = 'palette-group-heading';
    heading.innerHTML = `<span>📌 Pinned Media &amp; Stickers</span><span>${pinnedItems.length}</span>`;
    container.appendChild(heading);
    pinnedItems.forEach(item => container.appendChild(createTile(item, true)));
  }

  if (remainingItems.length > 0) {
    const heading = document.createElement('div');
    heading.className = 'palette-group-heading';
    const catLabels = {
      all: 'All Book Elements',
      media: 'Media Elements',
      layout: 'Layout & Containers',
      concept: 'Concepts & Storytelling',
      code: 'Code & Hardware',
      activity: 'Labs & Challenges',
      review: 'Review & Assessment'
    };
    heading.innerHTML = `<span>🧩 ${catLabels[activeCat] || 'Elements'}</span><span>${remainingItems.length}</span>`;
    container.appendChild(heading);
    remainingItems.forEach(item => container.appendChild(createTile(item, false)));
  }

  if (pinnedItems.length === 0 && remainingItems.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'grid-column:1 / -1; text-align:center; padding:28px 14px; color:#94A3B8; font-size:0.78rem;';
    empty.innerHTML = `
      <div style="font-size:1.6rem; margin-bottom:6px;">🔍</div>
      <div>No elements match "<strong>${query}</strong>"</div>
      <button type="button" class="btn btn-secondary" style="margin-top:10px; font-size:0.72rem;" onclick="window.resetPaletteFilter?.()">Reset Filter</button>
    `;
    container.appendChild(empty);
  }
};

window.resetPaletteFilter = function() {
  window.paletteState = { query: '', category: 'all' };
  const input = document.getElementById('palette-search-input');
  const clearBtn = document.getElementById('palette-search-clear');
  if (input) input.value = '';
  if (clearBtn) clearBtn.classList.remove('visible');
  document.querySelectorAll('#palette-filter-pills .palette-filter-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.cat === 'all');
  });
  window.populateElementsPalette();
};

window.setCanvasZoom = function(val) {
  const clamped = Math.max(0.4, Math.min(1.2, parseFloat(val) || 0.75));
  const slider = document.getElementById('canvas-zoom-slider');
  const label = document.getElementById('zoom-value-label') || document.getElementById('canvas-zoom-val');
  if (slider) slider.value = clamped.toFixed(2);
  if (label) label.textContent = `${Math.round(clamped * 100)}%`;
  document.documentElement.style.setProperty('--canvas-zoom', clamped);
  window.LayoutEngine?.autoReflowPages();
};

window.adjustCanvasZoom = function(delta) {
  const slider = document.getElementById('canvas-zoom-slider');
  const current = parseFloat(slider?.value || 0.75);
  window.setCanvasZoom(current + delta);
};

window.selectThemeSwatch = function(themeVal, btnEl) {
  document.querySelectorAll('.theme-swatch-card').forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  const picker = document.getElementById('theme-picker');
  if (picker && picker.value !== themeVal) {
    picker.value = themeVal;
    picker.dispatchEvent(new Event('change'));
  }
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

  const canvasContainer = document.getElementById('a4-canvas-container');
  const presetSelect = document.getElementById('preset-mission-select');
  const rawInputText = document.getElementById('raw-mission-input');
  const tokenBadge = document.getElementById('token-count-badge');

  // Load Default Mission (Railway Gate or Mission 14)
  const initialPreset = presetSelect ? presetSelect.value : 'railwayGate';
  if (initialPreset === 'railwayGate' && window.SAMPLE_MISSIONS?.railwayGateText) {
    const text = window.SAMPLE_MISSIONS.railwayGateText;
    if (rawInputText) rawInputText.value = text;
    window.currentMission = (window.HeuristicParser && window.HeuristicParser.parse)
      ? window.AIService.normalizeMissionObject(window.HeuristicParser.parse(text), text)
      : window.SAMPLE_MISSIONS.mission14;
  } else {
    window.currentMission = window.SAMPLE_MISSIONS?.mission14 || {};
    if (rawInputText) rawInputText.value = JSON.stringify(window.currentMission, null, 2);
  }

  // Self-heal stale local LLM endpoints (e.g. 127.0.0.1:1234 from LM Studio) if NVIDIA is active
  try {
    const savedEp = localStorage.getItem('nvidia_api_endpoint') || localStorage.getItem('ultraminds_ai_endpoint') || '';
    if (savedEp.includes(':1234') || savedEp.includes(':11434') || savedEp.includes('ollama')) {
      if (localStorage.getItem('ultraminds_ai_provider') === 'nvidia') {
        localStorage.removeItem('nvidia_api_endpoint');
        localStorage.removeItem('ultraminds_ai_endpoint');
      }
    }
  } catch (_) {}

  const parseBtn = document.getElementById('btn-parse-ai');
  const parseHeuristicBtn = document.getElementById('btn-parse-heuristic');
  // AI model settings are managed strictly through ⚙️ API Settings modal
  const themeSelect = document.getElementById('theme-picker');
  const fontScaler = document.getElementById('font-scaler');
  const manualModeBtn = document.getElementById('btn-toggle-manual');
  const zoomSlider = document.getElementById('canvas-zoom-slider');
  const zoomLabel = document.getElementById('zoom-value-label') || document.getElementById('canvas-zoom-val');

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

  // Pre-fill raw text box & attach event listeners
  if (rawInputText) {
    updateTokenCount();
    ['input', 'change', 'keyup', 'paste', 'blur', 'focus'].forEach(evt => {
      rawInputText.addEventListener(evt, updateTokenCount);
    });
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
    if (selectedKey === 'railwayGate') {
      const text = window.SAMPLE_MISSIONS.railwayGateText || window.SAMPLE_MISSIONS.railwayGate;
      rawInputText.value = text;
      window.currentMission = window.AIService.normalizeMissionObject(parseText(text), text);
    } else if (selectedKey === 'mission99') {
      try {
        const resp = await fetch('Text/stress-test-mission.xhtml');
        const text = await resp.text();
        rawInputText.value = text;
        window.currentMission = window.AIService.normalizeMissionObject(parseText(text), text);
      } catch(err) {
        alert("Failed to load Mission 99 stress test text: " + err.message);
      }
    } else if (selectedKey === 'mission03' || selectedKey === 'mission3' || selectedKey === 'mission13') {
      const text = window.SAMPLE_MISSIONS.mission03Text;
      rawInputText.value = text;
      window.currentMission = window.AIService.normalizeMissionObject(parseText(text), text);
    } else if (selectedKey === 'rawTextSample') {
      rawInputText.value = window.SAMPLE_MISSIONS.rawTextSample;
      window.currentMission = window.AIService.normalizeMissionObject(parseText(window.SAMPLE_MISSIONS.rawTextSample), window.SAMPLE_MISSIONS.rawTextSample);
    } else if (window.SAMPLE_MISSIONS[selectedKey]) {
      window.currentMission = window.SAMPLE_MISSIONS[selectedKey];
      rawInputText.value = typeof window.currentMission === 'string' ? window.currentMission : JSON.stringify(window.currentMission, null, 2);
    }
    updateTokenCount();
    // Clear log for fresh chapter
    if (aiStatusText) aiStatusText.innerHTML = '';
    if (aiStatusMonitor) aiStatusMonitor.style.display = 'none';
    window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
  });

  // Helper for persistent real-time compilation & 10-gate verification log
  const appendLog = (msg, type = 'info') => {
    if (!aiStatusText) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const line = document.createElement('div');
    line.className = 'ai-status-line';

    let badgeHtml = '';
    let textColor = '#E2E8F0';

    if (type === 'stage') {
      textColor = '#00F0FF';
      badgeHtml = '<strong style="color:#00F0FF; margin-right:4px;">▶</strong>';
    } else if (type === 'pass') {
      textColor = '#34D399';
      badgeHtml = '<span style="background:rgba(16,185,129,0.2); color:#10B981; border:1px solid rgba(16,185,129,0.4); padding:0px 4px; border-radius:3px; font-size:0.62rem; font-weight:700; margin-right:4px;">PASS</span>';
    } else if (type === 'fail') {
      textColor = '#F87171';
      badgeHtml = '<span style="background:rgba(239,68,68,0.2); color:#EF4444; border:1px solid rgba(239,68,68,0.4); padding:0px 4px; border-radius:3px; font-size:0.62rem; font-weight:700; margin-right:4px;">FAIL</span>';
    } else if (type === 'warn') {
      textColor = '#FBBF24';
      badgeHtml = '<span style="background:rgba(245,158,11,0.2); color:#F59E0B; border:1px solid rgba(245,158,11,0.4); padding:0px 4px; border-radius:3px; font-size:0.62rem; font-weight:700; margin-right:4px;">WARN</span>';
    } else if (type === 'success') {
      textColor = '#A7F3D0';
      badgeHtml = '<span style="background:rgba(16,185,129,0.25); color:#10B981; border:1px solid #10B981; padding:1px 5px; border-radius:3px; font-size:0.65rem; font-weight:800; margin-right:4px;">READY</span>';
    }

    line.style.color = textColor;
    line.innerHTML = `<span style="color:#64748B; font-size:0.63rem; flex-shrink:0;">[${time}]</span> <span style="display:inline-block;">${badgeHtml}${msg}</span>`;
    aiStatusText.appendChild(line);
    aiStatusText.scrollTop = aiStatusText.scrollHeight;
  };

  // Clear Log Button
  document.getElementById('btn-clear-ai-log')?.addEventListener('click', () => {
    if (aiStatusText) aiStatusText.innerHTML = '';
    if (aiStatusMonitor) aiStatusMonitor.style.display = 'none';
  });

  // AI Parse Button with Persistent Real-Time Status & 10-Gate Verification
  parseBtn?.addEventListener('click', async () => {
    const text = rawInputText.value;
    if (!text.trim()) {
      alert("Please paste some mission data into the text box first!");
      return;
    }

    parseBtn.disabled = true;
    parseBtn.innerHTML = '✨ Processing AI Layout...';

    // Clear previous log when starting a new chapter / generation
    if (aiStatusText) aiStatusText.innerHTML = '';
    if (aiStatusMonitor) aiStatusMonitor.style.display = 'block';

    const spinner = document.getElementById('ai-status-spinner');
    if (spinner) {
      spinner.textContent = '⚡';
      spinner.classList.add('active');
    }

    const settings = window.AIService?.getSettings ? window.AIService.getSettings() : { provider: 'gemini', model: 'default' };
    appendLog(`🚀 Starting AI Layout Synthesis (${settings.provider.toUpperCase()} / ${settings.model})...`, 'stage');

    const updateStatusUI = (statusMsg) => {
      const isStage = statusMsg.includes('Stage') || statusMsg.includes('🔒') || statusMsg.includes('🧠') || statusMsg.includes('📐') || statusMsg.includes('✨') || statusMsg.includes('🚀');
      const isWarning = statusMsg.includes('⚠️');
      const isDone = statusMsg.includes('✅');
      const type = isWarning ? 'warn' : (isStage ? 'stage' : (isDone ? 'pass' : 'info'));
      appendLog(statusMsg, type);
    };

    try {
      if (window.AIService?.processMissionData) {
        window.currentMission = await window.AIService.processMissionData(text, "auto", updateStatusUI);
      } else {
        const parsed = (window.HeuristicParser && window.HeuristicParser.parse) ? window.HeuristicParser.parse(text) : null;
        window.currentMission = parsed;
      }

      appendLog(`📄 Layout synthesized into ${window.currentMission?.pages?.length || 0} pages. Rendering canvas...`, 'info');
      window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
      appendLog(`✅ DOM Rendering complete across all ${window.currentMission?.pages?.length || 0} A4 pages.`, 'pass');

      // Run and display 10-Gate Automated Verification System
      if (window.VerificationEngine && window.lastCanonicalResult) {
        appendLog(`🔍 Running 10-Gate Quality Assurance Verification...`, 'stage');
        const report = window.VerificationEngine.verifyPublishedDocument(window.lastCanonicalResult, canvasContainer);

        if (report.gateResults && Array.isArray(report.gateResults)) {
          report.gateResults.forEach((gate, idx) => {
            const isPass = gate.status === 'PASS';
            const details = gate.details ? `— ${gate.details}` : '';
            appendLog(`${gate.gate}: ${gate.status} ${details}`, isPass ? 'pass' : 'fail');
          });
        }

        const passCount = report.gateResults?.filter(g => g.status === 'PASS').length || 0;
        const totalGates = report.gateResults?.length || 10;
        if (report.passed) {
          appendLog(`🏆 All ${totalGates}/10 Verification Gates Passed: Release Ready (100% Zero Omission)!`, 'success');
        } else {
          appendLog(`⚠️ Verification Complete: ${passCount}/${totalGates} Gates Passed. See Release Audit for details.`, 'warn');
        }
      }

      if (window.currentMission?._isFallback) {
        const reason = window.currentMission._fallbackReason || 'Unknown error';
        if (window.SaveEngine?._showToast) {
          window.SaveEngine._showToast(`⚠️ AI API Notice: ${reason}`, 10000);
        }
      } else {
        if (window.SaveEngine?._showToast) {
          window.SaveEngine._showToast(`✨ Mission arranged into ${window.currentMission?.pages?.length || 0} pages with 100% fidelity!`);
        }
      }
    } catch (err) {
      console.error(err);
      appendLog(`❌ Parse Error: ${err.message}`, 'fail');
      alert("Error parsing mission data: " + err.message);
    } finally {
      parseBtn.disabled = false;
      parseBtn.innerHTML = '✨ Parse &amp; Smart Arrange (AI) — Premium Layout';
      if (spinner) {
        spinner.textContent = '✅';
        spinner.classList.remove('active');
      }
      // Note: aiStatusMonitor remains persistently visible until user clears it or starts the next chapter!
    }
  });

  // Quick Heuristic Parse Button (offline) with 10-Gate Verification
  parseHeuristicBtn?.addEventListener('click', () => {
    const text = rawInputText?.value || '';
    if (!text.trim()) { alert('Paste content first!'); return; }

    if (aiStatusText) aiStatusText.innerHTML = '';
    if (aiStatusMonitor) aiStatusMonitor.style.display = 'block';

    const spinner = document.getElementById('ai-status-spinner');
    if (spinner) {
      spinner.textContent = '⚡';
      spinner.classList.add('active');
    }

    appendLog('🔵 Running Offline Heuristic Publishing Compiler...', 'stage');
    appendLog('🔒 Stage 1/4: Compiling Canonical Source & Locking Technical Facts...', 'stage');
    const canonicalResult = window.CanonicalCompiler ? window.CanonicalCompiler.compile(text, 'M01') : null;
    window.lastCanonicalResult = canonicalResult;
    if (canonicalResult) {
      appendLog(`✓ Canonical Source locked (${canonicalResult.canonicalElements?.length || 0} elements, ${canonicalResult.technicalFactsRegistry?.length || 0} technical terms)`, 'pass');
    }

    const parsed = (window.HeuristicParser && window.HeuristicParser.parse) ? window.HeuristicParser.parse(text) : null;
    window.currentMission = window.AIService.normalizeMissionObject(parsed, text);
    window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
    appendLog(`✅ DOM Rendering complete across ${window.currentMission?.pages?.length || 0} pages.`, 'pass');

    // Run 10 Gates
    if (window.VerificationEngine && window.lastCanonicalResult) {
      appendLog(`🔍 Running 10-Gate Quality Assurance Verification...`, 'stage');
      const report = window.VerificationEngine.verifyPublishedDocument(canonicalResult, canvasContainer);
      if (report.gateResults && Array.isArray(report.gateResults)) {
        report.gateResults.forEach(gate => {
          const isPass = gate.status === 'PASS';
          const details = gate.details ? `— ${gate.details}` : '';
          appendLog(`${gate.gate}: ${gate.status} ${details}`, isPass ? 'pass' : 'fail');
        });
      }
      const passCount = report.gateResults?.filter(g => g.status === 'PASS').length || 0;
      const totalGates = report.gateResults?.length || 10;
      if (report.passed) {
        appendLog(`🏆 All ${totalGates}/10 Gates Passed: Release Ready!`, 'success');
      } else {
        appendLog(`⚠️ Verification Complete: ${passCount}/${totalGates} Gates Passed.`, 'warn');
      }
    }

    if (spinner) {
      spinner.textContent = '✅';
      spinner.classList.remove('active');
    }
  });

  // Theme Picker
  themeSelect?.addEventListener('change', (e) => {
    window.currentMission.theme = e.target.value;
    document.querySelectorAll('.theme-swatch-card').forEach(card => {
      card.classList.toggle('active', card.dataset.themeVal === e.target.value);
    });
    window.LayoutEngine.renderMission(window.currentMission, canvasContainer);
  });

  // Canvas Zoom Slider Handler (Fix #12)
  zoomSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.documentElement.style.setProperty('--canvas-zoom', val);
    const label = document.getElementById('zoom-value-label') || document.getElementById('canvas-zoom-val');
    if (label) label.textContent = `${Math.round(val * 100)}%`;
  });

  // Font Scaler
  fontScaler?.addEventListener('input', (e) => {
    const scale = parseFloat(e.target.value) || 1;
    document.documentElement.style.setProperty('--font-scale', scale);
    const scaleBadge = document.getElementById('font-scale-badge');
    if (scaleBadge) scaleBadge.textContent = `${Math.round(scale * 100)}%`;
    window.LayoutEngine.checkOverflows();
  });

  // Toggle Manual Mode
  manualModeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('manual-mode');
    const isManual = document.body.classList.contains('manual-mode');
    manualModeBtn.classList.toggle('active', isManual);
    manualModeBtn.innerHTML = isManual ? '<span>🔓 Manual Mode (ON)</span><small>Lock</small>' : '<span>🔒 Toggle Manual Mode</span><small>Lock</small>';
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

  // Searchable & Categorized 52-Element Palette Listeners
  const paletteSearch = document.getElementById('palette-search-input');
  const paletteClear = document.getElementById('palette-search-clear');
  paletteSearch?.addEventListener('input', (e) => {
    window.paletteState.query = e.target.value;
    if (paletteClear) paletteClear.classList.toggle('visible', e.target.value.trim().length > 0);
    window.populateElementsPalette();
  });
  paletteClear?.addEventListener('click', () => window.resetPaletteFilter?.());

  document.querySelectorAll('#palette-filter-pills .palette-filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#palette-filter-pills .palette-filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      window.paletteState.category = pill.dataset.cat || 'all';
      window.populateElementsPalette();
    });
  });

  // Close Floating Dock Popover when clicking outside
  document.addEventListener('click', (e) => {
    const popover = document.getElementById('dock-page-popover');
    if (popover && popover.classList.contains('open')) {
      if (!e.target.closest('.dock-popover-anchor')) {
        popover.classList.remove('open');
      }
    }
  });

  // NEXT-LEVEL AI SUITE ACTIONS
  aiToolsBtn?.addEventListener('click', () => aiToolsModal.classList.add('show-modal'));
  document.getElementById('btn-close-ai-tools')?.addEventListener('click', () => aiToolsModal.classList.remove('show-modal'));

  document.getElementById('ai-tool-equalize')?.addEventListener('click', () => {
    aiToolsModal.classList.remove('show-modal');
    window.AILayoutTools.autoEqualizePages();
  });

  document.getElementById('ai-tool-autofill')?.addEventListener('click', () => {
    aiToolsModal.classList.remove('show-modal');
    window.AILayoutTools.autoFillEmptyPage();
  });

  document.getElementById('ai-tool-reorder')?.addEventListener('click', () => {
    aiToolsModal.classList.remove('show-modal');
    window.AILayoutTools.autoReorderPedagogicalFlow();
  });

  document.getElementById('ai-tool-alignfooters')?.addEventListener('click', () => {
    aiToolsModal.classList.remove('show-modal');
    window.AILayoutTools.autoAlignPageFooters();
  });

  document.getElementById('ai-tool-enhancehierarchy')?.addEventListener('click', () => {
    aiToolsModal.classList.remove('show-modal');
    window.AILayoutTools.autoEnhanceVisualHierarchy();
  });

  document.getElementById('ai-tool-autotheme')?.addEventListener('click', () => {
    aiToolsModal.classList.remove('show-modal');
    window.AILayoutTools.autoApplyDomainTheme();
  });

  document.getElementById('ai-tool-debuggen')?.addEventListener('click', () => {
    aiToolsModal.classList.remove('show-modal');
    window.AILayoutTools.autoGenerateDebugContent();
  });

  // Layer adjustment buttons
  document.getElementById('ai-layer-front')?.addEventListener('click', () => window.AILayoutTools.adjustLayer('front'));
  document.getElementById('ai-layer-back')?.addEventListener('click', () => window.AILayoutTools.adjustLayer('back'));
  document.getElementById('ai-layer-forward')?.addEventListener('click', () => window.AILayoutTools.adjustLayer('forward'));
  document.getElementById('ai-layer-backward')?.addEventListener('click', () => window.AILayoutTools.adjustLayer('backward'));

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

  document.getElementById('btn-export-pdf')?.addEventListener('click', () => window.ExportEngine.exportPDF());
  document.getElementById('btn-export-word')?.addEventListener('click', () => window.ExportEngine.exportWord());
  document.getElementById('btn-export-pptx')?.addEventListener('click', () => window.ExportEngine.exportPPTX());
  document.getElementById('btn-export-xhtml')?.addEventListener('click', () => window.ExportEngine.exportXHTML());
  document.getElementById('btn-export-epub')?.addEventListener('click', () => window.ExportEngine.exportEPUB());
  document.getElementById('btn-export-json')?.addEventListener('click', () => window.ExportEngine.exportJSON());

  // Extracted API Settings functions below

  document.getElementById('btn-api-settings')?.addEventListener('click', window.openApiSettings);
  document.getElementById('btn-close-modal')?.addEventListener('click', window.closeApiSettings);
  document.getElementById('btn-save-api')?.addEventListener('click', window.saveApiSettings);
  document.getElementById('api-provider-select')?.addEventListener('change', (e) => {
    const p = e.target.value;
    const customGroup = document.getElementById('custom-endpoint-group');
    const keyInput = document.getElementById('api-key-input');
    const modelInput = document.getElementById('api-model-input');
    const endpointInput = document.getElementById('api-endpoint-input');

    if (customGroup) {
      const isCustom = (p === 'custom');
      const isNvidia = (p === 'nvidia');
      customGroup.style.display = (isCustom || isNvidia) ? 'block' : 'none';
      const endpointHelp = customGroup.querySelector('small');
      if (isNvidia) {
        if (endpointInput) {
          const savedNvEp = (localStorage.getItem('nvidia_api_endpoint') || '').trim();
          endpointInput.value = (savedNvEp && !savedNvEp.includes(':1234') && !savedNvEp.includes(':11434')) ? savedNvEp : '';
          endpointInput.placeholder = 'http://localhost:3001/nvidia/v1/chat/completions (or leave blank for auto-proxy)';
        }
        if (endpointHelp) endpointHelp.innerHTML = '⚡ <strong>NVIDIA NIM:</strong> Requests auto-route via local proxy (<code>http://localhost:3001</code>). Leave blank for auto-routing, or enter a custom proxy.';
      } else {
        if (endpointInput) {
          endpointInput.value = localStorage.getItem('custom_api_endpoint') || localStorage.getItem('ultraminds_ai_endpoint') || 'http://localhost:11434/v1/chat/completions';
          endpointInput.placeholder = 'http://localhost:11434/v1/chat/completions';
        }
        if (endpointHelp) endpointHelp.textContent = 'For Ollama: http://localhost:11434/v1/chat/completions | LM Studio: http://localhost:1234/v1/chat/completions';
      }
    }

    if (keyInput) {
      if (p === 'nvidia') {
        keyInput.placeholder = 'nvapi-... (NVIDIA NIM API Key from build.nvidia.com)';
        const savedNvKey = localStorage.getItem('nvidia_api_key') || localStorage.getItem('nv_api_key');
        if (savedNvKey) keyInput.value = savedNvKey;
      }
      else if (p === 'nara') keyInput.placeholder = 'NaRA API Key (Bearer token)';
      else if (p === 'openrouter') keyInput.placeholder = 'sk-or-v1-... (OpenRouter API Key)';
      else if (p === 'groq') keyInput.placeholder = 'gsk_... (Groq API Key)';
      else if (p === 'deepseek') keyInput.placeholder = 'sk-... (DeepSeek API Key)';
      else if (p === 'openai') keyInput.placeholder = 'sk-... (OpenAI API Key)';
      else if (p === 'gemini') {
        keyInput.placeholder = 'AIzaSy... (Gemini API Key)';
        const savedGeminiKey = localStorage.getItem('gemini_api_key');
        if (savedGeminiKey) keyInput.value = savedGeminiKey;
      }
      else keyInput.placeholder = 'Optional for local LLM';
    }

    if (modelInput) {
      if (p === 'nvidia' && (!modelInput.value || modelInput.value.startsWith('gemini') || modelInput.value.startsWith('gpt') || modelInput.value.includes('llama-3.3'))) modelInput.value = 'deepseek-ai/deepseek-v4.1-flash';
      else if (p === 'nara' && (!modelInput.value || modelInput.value.startsWith('gemini'))) modelInput.value = 'mistral-medium-3-5';
      else if (p === 'openrouter' && (!modelInput.value || modelInput.value.startsWith('gemini'))) modelInput.value = 'anthropic/claude-3.5-sonnet';
      else if (p === 'groq' && (!modelInput.value || modelInput.value.startsWith('gemini'))) modelInput.value = 'llama-3.3-70b-versatile';
      else if (p === 'deepseek' && (!modelInput.value || modelInput.value.startsWith('gemini'))) modelInput.value = 'deepseek-chat';
      else if (p === 'gemini' && (!modelInput.value || !modelInput.value.startsWith('gemini'))) modelInput.value = 'gemini-2.5-flash';
    }
  });

  // Initialize Drag & Drop project file loader (.ultraminds / .umproj / .json)
  if (window.SaveEngine && typeof window.SaveEngine.setupProjectFileDrop === 'function') {
    window.SaveEngine.setupProjectFileDrop();
  }

  // Initialize Spotlight Command Palette (Ctrl+K / Cmd+K)
  window.CommandPalette?.init();
});

// Immediate Fallback Execution
setTimeout(() => window.populateElementsPalette && window.populateElementsPalette(), 100);

// ==========================================================================
// SPOTLIGHT COMMAND PALETTE ENGINE (Ctrl+K / Cmd+K)
// ==========================================================================
window.CommandPalette = {
  isOpen: false,
  selectedIdx: 0,
  filteredItems: [],

  init() {
    const input = document.getElementById('cmd-palette-input');
    input?.addEventListener('input', (e) => {
      this.selectedIdx = 0;
      this.renderResults(e.target.value);
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.filteredItems.length > 0) {
          this.selectedIdx = (this.selectedIdx + 1) % this.filteredItems.length;
          this.highlightSelected();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.filteredItems.length > 0) {
          this.selectedIdx = (this.selectedIdx - 1 + this.filteredItems.length) % this.filteredItems.length;
          this.highlightSelected();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = this.filteredItems[this.selectedIdx];
        if (item) this.execute(item);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (this.isOpen) this.close();
        else this.open();
      } else if (e.key === 'Escape') {
        if (this.isOpen) {
          this.close();
        } else {
          document.getElementById('dock-page-popover')?.classList.remove('open');
          document.querySelectorAll('.modal-overlay.show-modal').forEach(m => {
            m.classList.remove('show-modal');
            if (m.id === 'api-settings-modal' || m.id === 'model-inspector-modal' || m.id === 'card-designer-modal' || m.id === 'blocks-editor-modal') {
              m.style.display = 'none';
            }
          });
        }
      }
    });
  },

  getCommands() {
    const baseCommands = [
      { icon: '➕', title: 'Add New A4 Page', cat: 'Page', run: () => window.PageManager?.addPage() },
      { icon: '🗑️', title: 'Delete Active Page', cat: 'Page', run: () => window.PageManager?.deletePage() },
      { icon: '⚡', title: 'Fix Page Overflows (Auto-Reflow)', cat: 'Page', run: () => { window.LayoutEngine?.autoReflowPages(); window.SaveEngine?._showToast('⚡ Auto-reflowed!'); } },
      { icon: '📐', title: 'Configure Margins & Print Bleed', cat: 'Page', run: () => window.PageManager?.openMarginModal() },
      { icon: '🔄', title: 'Toggle Landscape Mode on Active Page', cat: 'Page', run: () => window.PageManager?.toggleLandscapeMode() },
      { icon: '🦶', title: 'Add Page Footer', cat: 'Page', run: () => window.PageManager?.addFooterToPage() },
      { icon: '📄', title: 'Open Page Setup (Font, View Mode, BG)', cat: 'Page', run: () => document.getElementById('btn-page-setup')?.click() },
      { icon: '✨', title: 'AI Parse & Smart Arrange Chapter', cat: 'AI Compiler', run: () => document.getElementById('btn-parse-ai')?.click() },
      { icon: '🔵', title: 'Quick Heuristic Parse (Offline)', cat: 'AI Compiler', run: () => document.getElementById('btn-parse-heuristic')?.click() },
      { icon: '⚡', title: 'AI Smart Page Equalizer', cat: 'AI Suite', run: () => window.AILayoutTools?.autoEqualizePages() },
      { icon: '✨', title: 'AI Autofill Empty Page', cat: 'AI Suite', run: () => window.AILayoutTools?.autoFillEmptyPage() },
      { icon: '🪄', title: 'AI Whitespace Auto-Aligner', cat: 'AI Suite', run: () => window.AILayoutTools?.autoAlignPageFooters() },
      { icon: '📐', title: 'AI Pedagogical Flow Re-Order', cat: 'AI Suite', run: () => window.AILayoutTools?.autoReorderPedagogicalFlow() },
      { icon: '🎨', title: 'AI Visual Hierarchy Enhancer', cat: 'AI Suite', run: () => window.AILayoutTools?.autoEnhanceVisualHierarchy() },
      { icon: '🌐', title: 'AI Domain Theme Generator', cat: 'AI Suite', run: () => window.AILayoutTools?.autoApplyDomainTheme() },
      { icon: '🐛', title: 'AI Common Mistakes & Debug Generator', cat: 'AI Suite', run: () => window.AILayoutTools?.autoGenerateDebugContent() },
      { icon: '🤖', title: 'Open AI Layout Suite Dialog', cat: 'AI Suite', run: () => document.getElementById('btn-ai-tools')?.click() },
      { icon: '🔍', title: 'Run AI Page Inspector', cat: 'Inspector', run: () => { switchTab('tab-inspector', document.querySelector('[data-tab="tab-inspector"]')); window.AILayoutTools?.runPageInspector(); } },
      { icon: '🧱', title: 'Open MIT Blocks Visual Builder', cat: 'Builder', run: () => window.BlocksEditor?.open() },
      { icon: '🎨', title: 'Open Custom Card Designer', cat: 'Builder', run: () => window.CardDesigner?.open() },
      { icon: '🚀', title: 'Open Release Audit Dashboard (10 Gates)', cat: 'Quality', run: () => { if (window.VerificationEngine && window.lastCanonicalResult) { const r = window.VerificationEngine.verifyPublishedDocument(window.lastCanonicalResult, document.getElementById('a4-canvas-container')); window.ReleaseDashboard?.show(r, window.lastCanonicalResult); } else { window.SaveEngine?._showToast('ℹ️ Compile raw content first.'); } } },
      { icon: '📄', title: 'Export PDF Document', cat: 'Export', run: () => window.ExportEngine?.exportPDF() },
      { icon: '📊', title: 'Export High-Res PPTX Slides', cat: 'Export', run: () => window.ExportEngine?.exportPPTX() },
      { icon: '📝', title: 'Export Word Document (.doc)', cat: 'Export', run: () => window.ExportEngine?.exportWord() },
      { icon: '📚', title: 'Export EPUB 3 E-Book', cat: 'Export', run: () => window.ExportEngine?.exportEPUB() },
      { icon: '🌐', title: 'Export XHTML Web Package', cat: 'Export', run: () => window.ExportEngine?.exportXHTML() },
      { icon: '💾', title: 'Export Canonical JSON', cat: 'Export', run: () => window.ExportEngine?.exportJSON() },
      { icon: '💾', title: 'Save Project to Device (.ultraminds)', cat: 'Project', run: () => window.SaveEngine?.exportToFile() },
      { icon: '📂', title: 'Open Project File from Device', cat: 'Project', run: () => window.SaveEngine?.importFromFile() },
      { icon: '🗂️', title: 'Open Browser Save Slots', cat: 'Project', run: () => window.SaveEngine?.openModal() },
      { icon: '⚡', title: 'Quick Cache Save (Ctrl+S)', cat: 'Project', run: () => window.SaveEngine?.quickSave() },
      { icon: '🔑', title: 'Open AI API Settings', cat: 'Settings', run: () => window.openApiSettings?.() },
      { icon: 'ℹ️', title: 'Open Model & Token Limit Inspector', cat: 'Settings', run: () => window.openModelInspector?.() },
      { icon: '🎛️', title: 'Toggle Bottom Floating Dock', cat: 'View', run: () => window.ContextMenu?.toggleTopFormatBar() },
      { icon: '◀', title: 'Toggle Left Sidebar Panel', cat: 'View', run: () => document.getElementById('btn-toggle-sidebar')?.click() },
      { icon: '🔍', title: 'Zoom 100%', cat: 'View', run: () => window.setCanvasZoom?.(1.0) },
      { icon: '🔍', title: 'Zoom 75% (Default)', cat: 'View', run: () => window.setCanvasZoom?.(0.75) },
      { icon: '🔍', title: 'Zoom 50%', cat: 'View', run: () => window.setCanvasZoom?.(0.5) },
      { icon: '↩️', title: 'Undo Last Action (Ctrl+Z)', cat: 'History', run: () => window.HistoryEngine?.undo() },
      { icon: '↪️', title: 'Redo Action (Ctrl+Y)', cat: 'History', run: () => window.HistoryEngine?.redo() }
    ];

    const elementItems = Object.values(window.ULTRAMINDS_50_ELEMENTS || {}).map(el => ({
      icon: el.icon || '🧩',
      title: `Insert: ${el.name}`,
      cat: '55 Elements',
      keywords: el.desc || '',
      run: () => window.CanvasEditor?.insertComponent(el.type)
    }));

    return [...baseCommands, ...elementItems];
  },

  open() {
    const overlay = document.getElementById('um-command-palette');
    const input = document.getElementById('cmd-palette-input');
    if (!overlay || !input) return;
    this.isOpen = true;
    this.selectedIdx = 0;
    overlay.classList.add('open');
    input.value = '';
    this.renderResults('');
    setTimeout(() => input.focus(), 20);
  },

  close() {
    const overlay = document.getElementById('um-command-palette');
    if (overlay) overlay.classList.remove('open');
    this.isOpen = false;
  },

  renderResults(query) {
    const container = document.getElementById('cmd-palette-results');
    if (!container) return;

    const q = (query || '').trim().toLowerCase();
    const all = this.getCommands();
    this.filteredItems = q
      ? all.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.cat.toLowerCase().includes(q) ||
          (c.keywords && c.keywords.toLowerCase().includes(q))
        ).slice(0, 24)
      : all.slice(0, 16);

    if (this.selectedIdx >= this.filteredItems.length) this.selectedIdx = 0;

    if (this.filteredItems.length === 0) {
      container.innerHTML = `<div style="padding:24px; text-align:center; color:#64748B; font-size:0.8rem;">No matching tools or elements for "<strong>${q}</strong>"</div>`;
      return;
    }

    container.innerHTML = '';
    this.filteredItems.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `cmd-result-item${idx === this.selectedIdx ? ' selected' : ''}`;
      row.innerHTML = `
        <div class="cmd-result-left">
          <span class="cmd-result-icon">${item.icon}</span>
          <span class="cmd-result-title">${item.title}</span>
        </div>
        <span class="cmd-result-cat">${item.cat}</span>
      `;
      row.onclick = () => this.execute(item);
      row.onmouseenter = () => {
        this.selectedIdx = idx;
        this.highlightSelected();
      };
      container.appendChild(row);
    });
  },

  highlightSelected() {
    const rows = document.querySelectorAll('#cmd-palette-results .cmd-result-item');
    rows.forEach((r, i) => {
      const active = i === this.selectedIdx;
      r.classList.toggle('selected', active);
      if (active) r.scrollIntoView({ block: 'nearest' });
    });
  },

  execute(item) {
    this.close();
    try {
      item.run?.();
    } catch (err) {
      console.error('CommandPalette error:', err);
    }
  }
};

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
  if (keyInput) {
    keyInput.value = settings.apiKey || '';
    if (settings.provider === 'nvidia') {
      keyInput.placeholder = 'nvapi-... (NVIDIA NIM API Key from build.nvidia.com)';
    } else if (settings.provider === 'gemini') {
      keyInput.placeholder = 'AIzaSy... (Gemini API Key)';
    }
  }
  if (modelInput) modelInput.value = settings.model || (settings.provider === 'nvidia' ? 'deepseek-ai/deepseek-v4.1-flash' : 'gemini-2.5-flash');

  if (endpointInput) {
    if (settings.provider === 'nvidia') {
      const savedNvEp = (localStorage.getItem('nvidia_api_endpoint') || '').trim();
      endpointInput.value = (savedNvEp && !savedNvEp.includes(':1234') && !savedNvEp.includes(':11434')) ? savedNvEp : '';
      endpointInput.placeholder = 'http://localhost:3001/nvidia/v1/chat/completions (or leave blank for auto-proxy)';
    } else if (settings.provider === 'custom') {
      endpointInput.value = localStorage.getItem('custom_api_endpoint') || localStorage.getItem('ultraminds_ai_endpoint') || 'http://localhost:11434/v1/chat/completions';
      endpointInput.placeholder = 'http://localhost:11434/v1/chat/completions';
    } else {
      endpointInput.value = settings.customEndpoint || '';
      endpointInput.placeholder = '';
    }
  }

  if (customGroup) {
    const isCustom = (settings.provider === 'custom');
    const isNvidia = (settings.provider === 'nvidia');
    customGroup.style.display = (isCustom || isNvidia) ? 'block' : 'none';
    const endpointHelp = customGroup.querySelector('small');
    if (isNvidia) {
      if (endpointHelp) endpointHelp.innerHTML = '⚡ <strong>NVIDIA NIM:</strong> Requests auto-route via local proxy (<code>http://localhost:3001</code>). Leave blank for auto-routing, or enter a custom proxy.';
    } else {
      if (endpointHelp) endpointHelp.textContent = 'For Ollama: http://localhost:11434/v1/chat/completions | LM Studio: http://localhost:1234/v1/chat/completions';
    }
  }

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
  const rawModel = document.getElementById('api-model-input')?.value.trim() || 'gemini-2.5-flash';
  const model = (window.AIService && window.AIService.sanitizeGeminiModel)
    ? window.AIService.sanitizeGeminiModel(rawModel)
    : rawModel;
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


  window.SaveEngine?._showToast("⚙️ API Settings saved successfully!");
  window.closeApiSettings();
};

window.openModelInspector = function() {
  const modal = document.getElementById('model-inspector-modal');
  if (!modal) return;

  const currentModelName = document.getElementById('api-model-input')?.value.trim() ||
    localStorage.getItem('ultraminds_ai_model') || 'gemini-2.5-flash';
  const provider = document.getElementById('api-provider-select')?.value ||
    localStorage.getItem('ultraminds_ai_provider') || 'gemini';

  const details = (window.AIService && window.AIService.getModelDetails)
    ? window.AIService.getModelDetails(currentModelName, provider)
    : { name: currentModelName, contextWindow: 1048576, maxOutputTokens: 8192, status: 'active', info: 'Standard model' };

  const activeModelEl = document.getElementById('inspector-active-model');
  const statusEl = document.getElementById('inspector-model-status');
  const contextEl = document.getElementById('inspector-context-limit');
  const outputEl = document.getElementById('inspector-output-limit');
  const infoEl = document.getElementById('inspector-model-info');
  const rowsEl = document.getElementById('inspector-registry-rows');

  if (activeModelEl) activeModelEl.textContent = details.name;
  if (contextEl) contextEl.textContent = (details.contextWindow || 1048576).toLocaleString() + ' tokens';
  if (outputEl) outputEl.textContent = (details.maxOutputTokens || 8192).toLocaleString() + ' tokens';
  if (infoEl) infoEl.textContent = details.info || 'No extra info.';

  if (statusEl) {
    if (details.status === 'deprecated' || details.status === 'retired') {
      statusEl.innerHTML = `<span style="color:#EF4444;">⚠️ ${details.status.toUpperCase()}</span> — Auto-upgrades to ${details.replacement || 'gemini-2.5-flash'}`;
    } else {
      statusEl.innerHTML = `<span style="color:#10B981;">● Active (Supported)</span>`;
    }
  }

  // Populate Registry table
  if (rowsEl && window.AIService && window.AIService.MODEL_METADATA_REGISTRY) {
    const registry = window.AIService.MODEL_METADATA_REGISTRY;
    rowsEl.innerHTML = Object.keys(registry).map(mKey => {
      const m = registry[mKey];
      const statusBadge = m.status === 'active'
        ? `<span style="color:#10B981; font-weight:600;">ACTIVE</span>`
        : `<span style="color:#EF4444; font-weight:600;">${m.status.toUpperCase()}</span>`;
      return `
        <tr style="border-bottom:1px solid #1E293B;">
          <td style="padding:6px 10px; font-weight:600; color:#F8FAFC;">${m.name}</td>
          <td style="padding:6px 10px; color:#94A3B8;">${m.provider}</td>
          <td style="padding:6px 10px; color:#93C5FD;">${m.contextWindow.toLocaleString()}</td>
          <td style="padding:6px 10px; color:#A7F3D0;">${m.maxOutputTokens.toLocaleString()}</td>
          <td style="padding:6px 10px;">${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  modal.classList.add('show-modal');
  modal.style.cssText = 'display: flex !important; z-index: 999999 !important;';
};

window.closeModelInspector = function() {
  const modal = document.getElementById('model-inspector-modal');
  if (modal) {
    modal.classList.remove('show-modal');
    modal.style.cssText = 'display: none !important;';
  }
};
