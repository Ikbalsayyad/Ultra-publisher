/**
 * UltraMinds Save Engine V1 — Full Project Save & Load
 * Supports:
 *  - Save/Load named localStorage slots (up to 5 recent)
 *  - Export project as .umproj JSON file (downloadable)
 *  - Import .umproj file and restore full layout with images
 */

window.SaveEngine = {

  SLOT_PREFIX: 'umproj_slot_',
  MAX_SLOTS: 5,

  // ─────────────────────────────────────────────────
  // CORE SNAPSHOT — capture full project state
  // ─────────────────────────────────────────────────
  captureSnapshot() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return null;

    // Collect all pages' full HTML content
    const pages = Array.from(canvas.querySelectorAll('.book-page'));
    const pageSnapshots = pages.map((page, i) => {
      // Clone page, strip interactive artifacts
      // Ensure all images have explicit src attribute set in DOM before clone
      page.querySelectorAll('img').forEach(img => {
        if (img.src) img.setAttribute('src', img.src);
      });

      const clone = page.cloneNode(true);
      clone.querySelectorAll('.transform-handle, #ultraminds-context-menu, #floating-selection-toolbar, .card-move-arrows, .floating-action-bar').forEach(el => el.remove());
      clone.querySelectorAll('[style*="outline"]').forEach(el => el.style.outline = '');

      // Collect images within this page
      const images = {};
      page.querySelectorAll('img').forEach((img, idx) => {
        if (!img.src) return;
        const key = `page${i}_img${idx}`;
        images[key] = img.src;
        const cloneImg = clone.querySelectorAll('img')[idx];
        if (cloneImg) {
          cloneImg.setAttribute('src', img.src);
          cloneImg.setAttribute('data-save-key', key);
        }
      });

      return {
        pageNum: i + 1,
        html: clone.innerHTML,
        images,
        dataset: { ...page.dataset }
      };
    });

    // Capture mission metadata
    const mission = window.currentMission ? JSON.parse(JSON.stringify(window.currentMission)) : {};

    // Capture page setup settings
    const settings = {
      theme: document.body.className.match(/theme-[\w-]+/)?.[0] || 'theme-blue',
      zoom: document.documentElement.style.getPropertyValue('--canvas-zoom') || '0.75',
      font: localStorage.getItem('ultraminds_global_font') || '',
      bgImg: localStorage.getItem('ultraminds_page_bg_img') || '',
      bgOpacity: localStorage.getItem('ultraminds_page_bg_opacity') || '1.0',
      fontScale: document.documentElement.style.getPropertyValue('--font-scale') || '1',
      // Fix #14: save page gap so it persists across save/load cycles
      pageGap: document.documentElement.style.getPropertyValue('--page-gap') || '44px',
      twoPage: document.body.classList.contains('view-two-page'),
      manualMode: document.body.classList.contains('manual-mode')
    };

    return {
      version: 3,
      savedAt: new Date().toISOString(),
      title: mission.missionTitle || mission.title || 'UltraMinds Project',
      mission,
      pages: pageSnapshots,
      settings
    };
  },

  // ─────────────────────────────────────────────────
  // RESTORE — load a snapshot back into the editor
  // ─────────────────────────────────────────────────
  restoreSnapshot(snapshot) {
    if (!snapshot || snapshot.version < 3) {
      // Attempt legacy restore
      if (snapshot?.mission && window.LayoutEngine) {
        window.currentMission = snapshot.mission;
        window.LayoutEngine.renderMission(snapshot.mission, document.getElementById('a4-canvas-container'));
        return true;
      }
      // Fix #5: replace alert() with toast
      this._showToast('⚠️ Invalid or incompatible project file.');
      return false;
    }

    // Restore settings
    const s = snapshot.settings || {};
    if (s.theme) {
      const classes = document.body.className.split(' ').filter(c => !c.startsWith('theme-'));
      document.body.className = [...classes, s.theme].join(' ');
    }
    if (s.zoom) document.documentElement.style.setProperty('--canvas-zoom', s.zoom);
    if (s.fontScale) document.documentElement.style.setProperty('--font-scale', s.fontScale);
    // Fix #14: restore page gap
    if (s.pageGap) document.documentElement.style.setProperty('--page-gap', s.pageGap);
    if (s.font) localStorage.setItem('ultraminds_global_font', s.font);
    if (s.bgImg) localStorage.setItem('ultraminds_page_bg_img', s.bgImg);
    if (s.bgOpacity) localStorage.setItem('ultraminds_page_bg_opacity', s.bgOpacity);
    document.body.classList.toggle('view-two-page', !!s.twoPage);
    document.body.classList.toggle('manual-mode', !!s.manualMode);

    // Restore mission data
    if (snapshot.mission) {
      window.currentMission = snapshot.mission;
    }

    // Restore pages into canvas
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas || !snapshot.pages || snapshot.pages.length === 0) {
      if (snapshot.mission && window.LayoutEngine) {
        window.LayoutEngine.renderMission(snapshot.mission, canvas);
      }
      return true;
    }

    canvas.innerHTML = '';

    snapshot.pages.forEach(ps => {
      const page = document.createElement('div');
      const isLandscape = ps.isLandscape || (ps.dataset && ps.dataset.landscape === 'true');
      page.className = 'book-page a4-page' + (isLandscape ? ' page-landscape' : '');
      if (ps.style) page.setAttribute('style', ps.style);
      Object.assign(page.dataset, ps.dataset || {});
      page.innerHTML = ps.html || '';

      // Restore images from base64 keys
      if (ps.images) {
        page.querySelectorAll('img[data-save-key]').forEach(img => {
          const key = img.getAttribute('data-save-key');
          if (key && ps.images[key]) {
            img.src = ps.images[key];
          }
          img.removeAttribute('data-save-key');
        });
      }

      // Restore page body margins from dataset to prevent margin reset on Undo/Redo
      const bodyContainer = page.querySelector('.page-body-container');
      if (bodyContainer && ps.dataset) {
        const top = ps.dataset.marginTop || ps.dataset.margin_top;
        const bottom = ps.dataset.marginBottom || ps.dataset.margin_bottom;
        const left = ps.dataset.marginLeft || ps.dataset.margin_left;
        const right = ps.dataset.marginRight || ps.dataset.margin_right;
        if (top) bodyContainer.style.paddingTop = `${top}px`;
        if (bottom) bodyContainer.style.paddingBottom = `${bottom}px`;
        if (left) bodyContainer.style.paddingLeft = `${left}px`;
        if (right) bodyContainer.style.paddingRight = `${right}px`;
      }

      canvas.appendChild(page);
    });

    if (window.PageManager?.loadSavedMargins) {
      window.PageManager.loadSavedMargins();
    }

    // Fix #3: Re-init only CanvasEditor (re-attaches canvas-level click handlers to new DOM).
    // Do NOT re-init ContextMenu, InCardDesigner, PageManager — they bind document-level listeners
    // and calling init() again creates duplicate event handlers that cause ghost drops,
    // double-reflows, and erratic key handling.
    if (window.CanvasEditor) window.CanvasEditor.init();
    if (window.LayoutEngine) {
      setTimeout(() => window.LayoutEngine.autoReflowPages(), 100);
    }

    // Sync theme picker
    const themePicker = document.getElementById('theme-picker');
    if (themePicker && s.theme) themePicker.value = s.theme;

    // Fix #12: Sync zoom label — try both IDs since they may differ between app.js and save-engine.js
    const zoomSlider = document.getElementById('canvas-zoom-slider');
    const zoomLabel = document.getElementById('zoom-value-label') || document.getElementById('canvas-zoom-val');
    if (zoomSlider && s.zoom) {
      zoomSlider.value = parseFloat(s.zoom);
      if (zoomLabel) zoomLabel.textContent = `${Math.round(parseFloat(s.zoom) * 100)}%`;
    }

    return true;
  },

  // ─────────────────────────────────────────────────
  // LOCAL STORAGE SLOTS
  // ─────────────────────────────────────────────────
  listSlots() {
    const slots = [];
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const raw = localStorage.getItem(`${this.SLOT_PREFIX}${i}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          slots.push({ index: i, title: parsed.title || `Slot ${i + 1}`, savedAt: parsed.savedAt });
        } catch {
          slots.push({ index: i, title: `Slot ${i + 1}`, savedAt: '' });
        }
      }
    }
    return slots;
  },

  saveToSlot(slotIndex, name) {
    const snap = this.captureSnapshot();
    if (!snap) return false;
    if (name) snap.title = name;
    try {
      localStorage.setItem(`${this.SLOT_PREFIX}${slotIndex}`, JSON.stringify(snap));
      return true;
    } catch (e) {
      console.error('Save slot error:', e);
      this._showToast('⚠️ Slot save failed — project may be too large. Use Save to Device (.ultraminds) instead.');
      return false;
    }
  },

  loadFromSlot(slotIndex) {
    const raw = localStorage.getItem(`${this.SLOT_PREFIX}${slotIndex}`);
    if (!raw) {
      this._showToast('⚠️ No project saved in this slot.');
      return false;
    }
    try {
      const snap = JSON.parse(raw);
      return this.restoreSnapshot(snap);
    } catch (e) {
      this._showToast('❌ Failed to load project: ' + e.message);
      return false;
    }
  },

  deleteSlot(slotIndex) {
    localStorage.removeItem(`${this.SLOT_PREFIX}${slotIndex}`);
  },

  // ─────────────────────────────────────────────────
  // FILE EXPORT / IMPORT (UNLIMITED DEVICE STORAGE)
  // ─────────────────────────────────────────────────
  exportToFile() {
    const snap = this.captureSnapshot();
    if (!snap) {
      this._showToast('⚠️ Nothing to save.');
      return;
    }

    this._showPrompt(
      "Enter project title for device file export:",
      snap.title || "UltraMinds Project",
      (customTitle) => {
        if (customTitle && customTitle.trim()) snap.title = customTitle.trim();

        const jsonStr = JSON.stringify(snap, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = (snap.title || 'project').replace(/[^a-zA-Z0-9_\- ]/g, '_');
        a.href = url;
        a.download = `${safeName}.ultraminds`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this._showToast(`💾 Exported "${snap.title}" to device file (.ultraminds)!`);
      }
    );
  },

  importFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ultraminds,.umproj,.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const snap = JSON.parse(text);
        const ok = this.restoreSnapshot(snap);
        if (ok) {
          this._showToast(`✅ Project "${snap.title || file.name}" reloaded cleanly!`);
          if (window.HistoryEngine) window.HistoryEngine.pushState(`Opened File: ${snap.title || file.name}`);
        }
      } catch (err) {
        this._showToast('❌ Failed to import project file: ' + err.message);
      }
    };
    input.click();
  },

  setupProjectFileDrop() {
    window.addEventListener('dragover', (e) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
      }
    });

    window.addEventListener('drop', async (e) => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.endsWith('.ultraminds') || file.name.endsWith('.umproj') || file.name.endsWith('.json')) {
          e.preventDefault();
          e.stopPropagation();
          try {
            const text = await file.text();
            const snap = JSON.parse(text);
            if (snap.version || snap.pages || snap.mission) {
              this._showConfirm(
                `📂 Load project file "${snap.title || file.name}" into editor?`,
                () => {
                  this.restoreSnapshot(snap);
                  this._showToast(`✅ Project "${snap.title || file.name}" loaded from file!`);
                }
              );
            }
          } catch (err) {
            console.error('Project file drop error:', err);
          }
          break;
        }
      }
    });
  },

  // ─────────────────────────────────────────────────
  // QUICK SAVE / LOAD (auto slot 0 — most recent)
  // ─────────────────────────────────────────────────
  quickSave() {
    const title = window.currentMission?.missionTitle || window.currentMission?.title || 'Quick Save';
    const ok = this.saveToSlot(0, title);
    if (ok) this._showToast('💾 Project quick-saved!');
  },

  quickLoad() {
    if (!localStorage.getItem(`${this.SLOT_PREFIX}0`)) {
      this._showToast('ℹ️ No quick-save found. Use Save to Device first.');
      return;
    }
    const ok = this.loadFromSlot(0);
    if (ok) this._showToast('📂 Project loaded!');
  },

  // ─────────────────────────────────────────────────
  // AUTO-SAVE ENGINE (Slot: umproj_autosave)
  // ─────────────────────────────────────────────────
  AUTOSAVE_KEY: 'umproj_autosave',
  _autoSaveTimer: null,
  _lastAutoSaveTime: null,

  triggerAutoSave() {
    clearTimeout(this._autoSaveTimer);
    this._autoSaveTimer = setTimeout(() => {
      this.performAutoSave();
    }, 20000); // 20s debounce after last user action
  },

  performAutoSave() {
    const snap = this.captureSnapshot();
    if (!snap || !snap.pages || snap.pages.length === 0) return;
    try {
      snap.title = (snap.title || 'Project') + ' (Auto-Save)';
      localStorage.setItem(this.AUTOSAVE_KEY, JSON.stringify(snap));
      this._lastAutoSaveTime = new Date();
      this._updateAutoSaveUI();
    } catch (e) {
      // If full snapshot exceeds quota (e.g. large base64 images), save lightweight snapshot
      try {
        const lightweightSnap = {
          ...snap,
          pages: (snap.pages || []).map(p => ({
            ...p,
            images: {},
            html: p.html ? p.html.replace(/src="data:image\/[^"]+"/g, 'src=""') : ''
          }))
        };
        localStorage.setItem(this.AUTOSAVE_KEY, JSON.stringify(lightweightSnap));
        this._lastAutoSaveTime = new Date();
        this._updateAutoSaveUI();
      } catch (innerErr) {
        // Quota completely full: clean up corrupted autosave key so other items can save
        try { localStorage.removeItem(this.AUTOSAVE_KEY); } catch (_) {}
      }
    }
  },

  _updateAutoSaveUI() {
    const indicator = document.getElementById('autosave-indicator');
    if (indicator && this._lastAutoSaveTime) {
      const timeStr = this._lastAutoSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      indicator.textContent = `● Auto-saved ${timeStr}`;
      indicator.style.opacity = '1';
    }
  },

  // ─────────────────────────────────────────────────
  // SAVE/LOAD MODAL UI
  // ─────────────────────────────────────────────────
  openModal() {
    let modal = document.getElementById('save-load-modal');
    if (!modal) return;

    const slots = this.listSlots();
    const slotListEl = document.getElementById('save-slot-list');
    if (slotListEl) {
      slotListEl.innerHTML = '';
      for (let i = 0; i < this.MAX_SLOTS; i++) {
        const slot = slots.find(s => s.index === i);
        const li = document.createElement('div');
        li.className = 'save-slot-row';
        li.innerHTML = `
          <div class="save-slot-info">
            <span class="save-slot-name">${slot ? `💾 ${slot.title}` : `— Empty Slot ${i + 1} —`}</span>
            ${slot ? `<span class="save-slot-date">${new Date(slot.savedAt).toLocaleString()}</span>` : ''}
          </div>
          <div class="save-slot-actions">
            <button class="ctx-btn-sm" onclick="window.SaveEngine._slotSave(${i})">${slot ? '🔄 Overwrite' : '💾 Save Here'}</button>
            ${slot ? `<button class="ctx-btn-sm" style="background:#10B981;" onclick="window.SaveEngine.loadFromSlot(${i}); window.SaveEngine.closeModal(); window.SaveEngine._showToast('Project loaded!')">📂 Load</button>` : ''}
            ${slot ? `<button class="ctx-btn-sm" style="background:#EF4444;" onclick="window.SaveEngine.deleteSlot(${i}); window.SaveEngine.openModal()">🗑 Del</button>` : ''}
          </div>
        `;
        slotListEl.appendChild(li);
      }
    }

    modal.classList.add('show-modal');
  },

  closeModal() {
    const modal = document.getElementById('save-load-modal');
    if (modal) modal.classList.remove('show-modal');
  },

  _slotSave(index) {
    this._showPrompt(
      'Project name:',
      window.currentMission?.missionTitle || `Project ${index + 1}`,
      (name) => {
        const ok = this.saveToSlot(index, name || `Project ${index + 1}`);
        if (ok) {
          this._showToast(`💾 Saved to Slot ${index + 1}!`);
          this.openModal();
        }
      }
    );
  },

  // ─────────────────────────────────────────────────
  // TOAST QUEUE SYSTEM (Fix #9: Stacking & Animation)
  // ─────────────────────────────────────────────────
  _showToast(msg, duration = 2800) {
    let container = document.getElementById('um-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'um-toast-container';
      container.style.cssText = 'position:fixed;top:64px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;z-index:999999;pointer-events:none;';
      document.body.appendChild(container);
    }

    // Limit active toasts in queue to 3
    const existing = container.querySelectorAll('.um-toast-item');
    if (existing.length >= 3) {
      existing[0].remove();
    }

    const toast = document.createElement('div');
    toast.className = 'um-toast-item';
    toast.style.cssText = 'background:rgba(13,19,34,0.94);backdrop-filter:blur(20px);color:#F8FAFC;padding:9px 20px;border-radius:14px;font-size:0.82rem;font-weight:700;box-shadow:0 12px 32px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.2);border:1px solid rgba(0,240,255,0.38);opacity:0;transform:translateY(12px) scale(0.96);transition:all 0.22s cubic-bezier(0.16, 1, 0.3, 1);pointer-events:auto;user-select:none;display:flex;align-items:center;gap:8px;';
    toast.textContent = msg;

    container.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0) scale(1)';
    });

    // Auto dismiss
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px) scale(0.95)';
      setTimeout(() => toast.remove(), 240);
    }, duration);
  },

  // ─────────────────────────────────────────────────
  // CUSTOM MODAL DIALOGS (Fix #5: _showConfirm & _showPrompt)
  // ─────────────────────────────────────────────────
  _showConfirm(message, onYes, onNo) {
    document.getElementById('um-custom-dialog-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'um-custom-dialog-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,28,0.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:9999999;animation:umFadeIn 0.15s ease-out;';

    const card = document.createElement('div');
    card.style.cssText = 'background:#1E293B;border:1px solid rgba(255,255,255,0.15);border-radius:14px;padding:22px 24px;max-width:440px;width:90%;box-shadow:0 20px 50px rgba(0,0,0,0.6);display:flex;flex-direction:column;gap:14px;color:#F8FAFC;font-family:inherit;';

    card.innerHTML = `
      <div style="font-size:1.0rem;font-weight:700;line-height:1.4;display:flex;align-items:flex-start;gap:10px;">
        <span>${message}</span>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px;">
        <button id="um-dialog-cancel" class="btn btn-secondary" style="padding:6px 16px;">Cancel</button>
        <button id="um-dialog-confirm" class="btn btn-primary" style="background:#EF4444;border-color:#DC2626;padding:6px 18px;font-weight:700;">Confirm</button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const cleanup = () => overlay.remove();

    card.querySelector('#um-dialog-confirm').onclick = () => {
      cleanup();
      if (typeof onYes === 'function') onYes();
    };

    card.querySelector('#um-dialog-cancel').onclick = () => {
      cleanup();
      if (typeof onNo === 'function') onNo();
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') { cleanup(); if (onNo) onNo(); document.removeEventListener('keydown', handleKey); }
      if (e.key === 'Enter') { cleanup(); if (onYes) onYes(); document.removeEventListener('keydown', handleKey); }
    };
    document.addEventListener('keydown', handleKey);
  },

  _showPrompt(message, defaultValue = '', onOk, onCancel) {
    document.getElementById('um-custom-dialog-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'um-custom-dialog-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,28,0.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:9999999;animation:umFadeIn 0.15s ease-out;';

    const card = document.createElement('div');
    card.style.cssText = 'background:#1E293B;border:1px solid rgba(0,240,255,0.3);border-radius:14px;padding:22px 24px;max-width:440px;width:90%;box-shadow:0 20px 50px rgba(0,0,0,0.6);display:flex;flex-direction:column;gap:14px;color:#F8FAFC;font-family:inherit;';

    card.innerHTML = `
      <div style="font-size:0.95rem;font-weight:700;color:var(--accent-cyan);">${message}</div>
      <input type="text" id="um-dialog-input" value="${defaultValue}" style="background:#0F172A;border:1px solid rgba(255,255,255,0.2);color:#FFF;border-radius:8px;padding:9px 12px;font-size:0.9rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;">
        <button id="um-dialog-cancel" class="btn btn-secondary" style="padding:6px 16px;">Cancel</button>
        <button id="um-dialog-submit" class="btn btn-primary" style="background:#2563EB;padding:6px 18px;font-weight:700;">Save / OK</button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const input = card.querySelector('#um-dialog-input');
    input.focus();
    input.select();

    const cleanup = () => overlay.remove();

    card.querySelector('#um-dialog-submit').onclick = () => {
      const val = input.value;
      cleanup();
      if (typeof onOk === 'function') onOk(val);
    };

    card.querySelector('#um-dialog-cancel').onclick = () => {
      cleanup();
      if (typeof onCancel === 'function') onCancel();
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') { cleanup(); if (onCancel) onCancel(); document.removeEventListener('keydown', handleKey); }
      if (e.key === 'Enter') {
        const val = input.value;
        cleanup();
        if (onOk) onOk(val);
        document.removeEventListener('keydown', handleKey);
      }
    };
    document.addEventListener('keydown', handleKey);
  }
};

// Expose unified dialogs globally
window.UltraDialogs = {
  confirm: (msg, onYes, onNo) => window.SaveEngine._showConfirm(msg, onYes, onNo),
  prompt: (msg, def, onOk, onCancel) => window.SaveEngine._showPrompt(msg, def, onOk, onCancel),
  toast: (msg, duration) => window.SaveEngine._showToast(msg, duration)
};
