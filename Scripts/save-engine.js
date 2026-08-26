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
      alert('⚠️ Invalid or incompatible project file.');
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

    // Re-init canvas events
    if (window.CanvasEditor) window.CanvasEditor.init();
    if (window.ContextMenu) window.ContextMenu.init();
    if (window.InCardDesigner) window.InCardDesigner.init();
    if (window.PageManager) window.PageManager.init();
    if (window.LayoutEngine) {
      setTimeout(() => window.LayoutEngine.autoReflowPages(), 100);
    }

    // Sync theme picker
    const themePicker = document.getElementById('theme-picker');
    if (themePicker && s.theme) themePicker.value = s.theme;

    // Sync zoom slider
    const zoomSlider = document.getElementById('canvas-zoom-slider');
    const zoomLabel = document.getElementById('zoom-value-label');
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
      alert('⚠️ Slot save failed — project may be too large for localStorage. Use Export File instead.');
      return false;
    }
  },

  loadFromSlot(slotIndex) {
    const raw = localStorage.getItem(`${this.SLOT_PREFIX}${slotIndex}`);
    if (!raw) { alert('No project saved in this slot.'); return false; }
    try {
      const snap = JSON.parse(raw);
      return this.restoreSnapshot(snap);
    } catch (e) {
      alert('Failed to load project: ' + e.message);
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
    if (!snap) { alert('Nothing to save.'); return; }

    const customTitle = prompt("Enter project title for device file export:", snap.title || "UltraMinds Project");
    if (customTitle === null) return;
    if (customTitle.trim()) snap.title = customTitle.trim();

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
        alert('Failed to import project file: ' + err.message);
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
              if (confirm(`📂 Load project file "${snap.title || file.name}" into editor?`)) {
                this.restoreSnapshot(snap);
                this._showToast(`✅ Project "${snap.title || file.name}" loaded from file!`);
              }
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
      alert('No quick-save found. Use File → Save first.');
      return;
    }
    const ok = this.loadFromSlot(0);
    if (ok) this._showToast('📂 Project loaded!');
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
    const name = prompt('Project name:', window.currentMission?.missionTitle || `Project ${index + 1}`);
    if (name === null) return;
    const ok = this.saveToSlot(index, name || `Project ${index + 1}`);
    if (ok) {
      this._showToast(`💾 Saved to Slot ${index + 1}!`);
      this.openModal();
    }
  },

  _showToast(msg) {
    let toast = document.getElementById('um-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'um-toast';
      toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1E293B;color:#F8FAFC;padding:10px 22px;border-radius:24px;font-size:0.88rem;font-weight:600;z-index:999999;box-shadow:0 4px 24px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);transition:opacity 0.3s;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
  }
};
