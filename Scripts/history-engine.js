/**
 * UltraMinds History Engine V1 (Safety 10-Step Undo/Redo System)
 * Manages up to 10 safety snapshots for instant Ctrl+Z (Undo) and Ctrl+Y (Redo).
 */

window.HistoryEngine = {
  stack: [],
  currentIndex: -1,
  maxSteps: 50,
  isNavigating: false,
  textTimer: null,

  init() {
    this.bindEvents();
    // Record initial snapshot after DOM render
    setTimeout(() => {
      this.pushState('Initial Layout');
    }, 400);
  },

  captureState() {
    if (!window.SaveEngine || typeof window.SaveEngine.captureSnapshot !== 'function') return null;
    return window.SaveEngine.captureSnapshot();
  },

  _computeFingerprint(snap) {
    if (!snap || !snap.pages) return '';
    let fp = `p:${snap.pages.length}|`;
    for (let i = 0; i < snap.pages.length; i++) {
      const p = snap.pages[i];
      const len = p.html ? p.html.length : 0;
      const head = p.html ? p.html.slice(0, 30) : '';
      const tail = p.html ? p.html.slice(-30) : '';
      fp += `${i}:${len}:${head}:${tail}|`;
    }
    return fp;
  },

  pushState(actionLabel = 'Edit') {
    if (this.isNavigating) return;
    const snap = this.captureState();
    if (!snap || !snap.pages) return;

    // Fast fingerprint dirty check — avoids multi-megabyte JSON stringifications on every keystroke
    const newFp = this._computeFingerprint(snap);
    const currentItem = this.stack[this.currentIndex];
    if (currentItem && currentItem.fp === newFp && this.stack.length > 0) {
      return;
    }

    // Discard any redo states if pushing a new action mid-history
    if (this.currentIndex < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.currentIndex + 1);
    }

    this.stack.push({ label: actionLabel, snap, fp: newFp });

    // Enforce 50-step action-specific history window
    if (this.stack.length > this.maxSteps) {
      this.stack.shift();
    }

    this.currentIndex = this.stack.length - 1;
    this.updateUI();

    // Trigger debounced auto-save
    window.SaveEngine?.triggerAutoSave?.();
  },

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.restoreCurrentState();
      const label = this.stack[this.currentIndex + 1]?.label || 'Action';
      window.SaveEngine?._showToast(`↩ Undo: ${label}`);
    } else {
      window.SaveEngine?._showToast('⚠️ Reached oldest history step');
    }
  },

  redo() {
    if (this.currentIndex < this.stack.length - 1) {
      this.currentIndex++;
      this.restoreCurrentState();
      const label = this.stack[this.currentIndex]?.label || 'Action';
      window.SaveEngine?._showToast(`↪ Redo: ${label}`);
    } else {
      window.SaveEngine?._showToast('⚠️ Reached newest history step');
    }
  },

  restoreCurrentState() {
    const item = this.stack[this.currentIndex];
    if (item && item.snap && window.SaveEngine) {
      this.isNavigating = true;
      window.SaveEngine.restoreSnapshot(item.snap);
      setTimeout(() => {
        this.isNavigating = false;
      }, 250);
      this.updateUI();
    }
  },

  updateUI() {
    const undoBtn = document.getElementById('btn-undo');
    const redoBtn = document.getElementById('btn-redo');

    const canUndo = this.currentIndex > 0;
    const canRedo = this.currentIndex < this.stack.length - 1;

    if (undoBtn) {
      undoBtn.disabled = !canUndo;
      undoBtn.style.opacity = canUndo ? '1' : '0.4';
      undoBtn.style.cursor = canUndo ? 'pointer' : 'not-allowed';
    }
    if (redoBtn) {
      redoBtn.disabled = !canRedo;
      redoBtn.style.opacity = canRedo ? '1' : '0.4';
      redoBtn.style.cursor = canRedo ? 'pointer' : 'not-allowed';
    }
  },

  bindEvents() {
    // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Y / Ctrl+Shift+Z (Redo)
    document.addEventListener('keydown', (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (!isCmdOrCtrl) return;

      const key = e.key.toLowerCase();
      if (key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          this.redo();
        } else {
          e.preventDefault();
          this.undo();
        }
      } else if (key === 'y') {
        e.preventDefault();
        this.redo();
      }
    });

    // Capture state on text edit debounced input and focusout
    const canvas = document.getElementById('a4-canvas-container');
    if (canvas) {
      canvas.addEventListener('input', (e) => {
        if (e.target && e.target.isContentEditable) {
          clearTimeout(this.textTimer);
          this.textTimer = setTimeout(() => {
            this.pushState('Edit Text');
          }, 750);
        }
      });

      canvas.addEventListener('focusout', (e) => {
        if (e.target && e.target.isContentEditable) {
          clearTimeout(this.textTimer);
          this.pushState('Edit Text');
        }
      });
    }
  }
};
