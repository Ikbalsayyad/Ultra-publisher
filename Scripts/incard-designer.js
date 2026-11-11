/**
 * UltraMinds In-Card Micro-Designer Engine (V3 - Includes Instant Auto-Dismissal & Escape Listener)
 * Provides Floating Selection Quick-Format Toolbar, In-Card Sub-Capsule Creator, Highlight Marker, and Selection-Only Formatting.
 */

window.InCardDesigner = {
  activeSelectionRange: null,
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.createToolbarMarkup();
    this.bindEvents();
  },

  createToolbarMarkup() {
    document.getElementById('floating-selection-toolbar')?.remove();

    const toolbar = document.createElement('div');
    toolbar.id = 'floating-selection-toolbar';
    toolbar.className = 'floating-text-toolbar';
    toolbar.innerHTML = `
      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.toggleBold()" title="Bold Selection"><b>B</b></button>
      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.toggleItalic()" title="Italic Selection"><i>I</i></button>
      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.toggleUnderline()" title="Underline Selection"><u>U</u></button>
      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.toggleStrikethrough()" title="Strikethrough Selection"><s>S</s></button>
      
      <div class="floating-divider"></div>

      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.alignText('left')" title="Align Left">L</button>
      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.alignText('center')" title="Align Center">C</button>
      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.alignText('right')" title="Align Right">R</button>
      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.alignText('justify')" title="Justify Text">J</button>

      <div class="floating-divider"></div>

      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.changeFontSize(1)" title="Increase Font Size">A+</button>
      <button class="floating-btn" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.changeFontSize(-1)" title="Decrease Font Size">A-</button>

      <div class="floating-divider"></div>
      
      <button class="floating-btn" style="background:#FEF08A; color:#0F172A;" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.applyHighlight('#FEF08A')" title="Yellow Highlight">🟨</button>
      <button class="floating-btn" style="background:#86EFAC; color:#0F172A;" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.applyHighlight('#86EFAC')" title="Green Highlight">🟩</button>
      <button class="floating-btn" style="background:#A5F3FC; color:#0F172A;" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.applyHighlight('#A5F3FC')" title="Cyan Highlight">🟦</button>
      
      <div class="floating-divider"></div>
      
      <button class="floating-btn" style="background:linear-gradient(135deg, #2563EB, #00F0FF); color:#FFF;" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.createInCardCapsule()" title="Convert Selected Text to Capsule Badge">🏷️</button>
      
      <div class="floating-divider"></div>
      
      <div style="display:flex; align-items:center; gap:3px; padding:0 2px;" title="Text Color for Selection">
        <span class="floating-color-dot" style="background:#0F172A;" onmousedown="event.preventDefault(); window.InCardDesigner.applyTextColor('#0F172A')" title="Dark / Black"></span>
        <span class="floating-color-dot" style="background:#2563EB;" onmousedown="event.preventDefault(); window.InCardDesigner.applyTextColor('#2563EB')" title="Royal Blue"></span>
        <span class="floating-color-dot" style="background:#16A34A;" onmousedown="event.preventDefault(); window.InCardDesigner.applyTextColor('#16A34A')" title="Emerald Green"></span>
        <span class="floating-color-dot" style="background:#DC2626;" onmousedown="event.preventDefault(); window.InCardDesigner.applyTextColor('#DC2626')" title="Crimson Red"></span>
        <span class="floating-color-dot" style="background:#7C3AED;" onmousedown="event.preventDefault(); window.InCardDesigner.applyTextColor('#7C3AED')" title="Purple"></span>
        <span class="floating-color-dot" style="background:#D97706;" onmousedown="event.preventDefault(); window.InCardDesigner.applyTextColor('#D97706')" title="Amber Orange"></span>
        <span class="floating-color-dot" style="background:#0284C7;" onmousedown="event.preventDefault(); window.InCardDesigner.applyTextColor('#0284C7')" title="Cyan"></span>
        <input type="color" id="floating-color-picker" value="#2563EB" style="width:18px; height:18px; border:none; background:none; cursor:pointer; padding:0;" onmousedown="window.InCardDesigner.saveSelectionRange()" oninput="window.InCardDesigner.applyTextColor(this.value)" title="Custom Color Palette">
      </div>

      <div class="floating-divider"></div>

      <button class="floating-btn" style="background:#0F172A; border-color:var(--accent-cyan);" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.insertInCardImage()" title="Insert In-Card Image at Cursor">🖼️ Image</button>
      <button class="floating-btn" style="background:#0F172A; border-color:#00F0FF;" onmousedown="event.preventDefault()" onclick="window.InCardDesigner.insertPureInCardImage()" title="Insert Pure Bezel-Free Image at Cursor">🖼️✨ Pure</button>

      <button class="floating-btn" style="background:rgba(255,255,255,0.1); font-size:0.65rem;" onclick="window.InCardDesigner.hideToolbar()" title="Close Toolbar (Esc)">✕</button>
    `;

    document.body.appendChild(toolbar);
  },

  bindEvents() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    const handleSelection = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.rangeCount || !selection.toString().trim()) {
          this.hideToolbar();
          return;
        }

        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;

        const editableParent = container.nodeType === 3 ? container.parentNode.closest('[contenteditable="true"]') : container.closest('[contenteditable="true"]');

        if (editableParent && canvas.contains(editableParent)) {
          this.activeSelectionRange = range.cloneRange();
          const rect = range.getBoundingClientRect();
          this.showToolbar(rect);
        } else {
          this.hideToolbar();
        }
      }, 20);
    };

    canvas.addEventListener('mouseup', handleSelection);
    canvas.addEventListener('keyup', handleSelection);

    // Global Listener: Auto-hide floating toolbar on selection clear or Escape key
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        this.hideToolbar();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideToolbar();
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest('#floating-selection-toolbar')) {
        setTimeout(() => {
          const selection = window.getSelection();
          if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            this.hideToolbar();
          }
        }, 30);
      }
    });
  },

  showToolbar(rect) {
    const toolbar = document.getElementById('floating-selection-toolbar');
    if (!toolbar) return;

    toolbar.style.display = 'flex';
    const toolbarWidth = toolbar.offsetWidth || 400;
    const toolbarHeight = toolbar.offsetHeight || 42;

    let top = window.scrollY + rect.top - toolbarHeight - 8;
    let left = window.scrollX + rect.left + (rect.width / 2) - (toolbarWidth / 2);

    // Screen Boundary Clamping
    const maxLeft = window.innerWidth - toolbarWidth - 16;
    const clampLeft = Math.max(16, Math.min(left, maxLeft));
    const clampTop = Math.max(10, top);

    toolbar.style.top = `${clampTop}px`;
    toolbar.style.left = `${clampLeft}px`;
    toolbar.style.zIndex = '999999';
    toolbar.classList.add('show-floating');
  },

  hideToolbar() {
    const toolbar = document.getElementById('floating-selection-toolbar');
    if (toolbar) {
      toolbar.classList.remove('show-floating');
      toolbar.style.display = 'none';
    }
  },

  restoreSelection() {
    if (this.activeSelectionRange) {
      if (!this.activeSelectionRange.startContainer.isConnected) return false;
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.activeSelectionRange);
      return true;
    }
    return false;
  },

  toggleBold() {
    if (!this.restoreSelection()) return;
    document.execCommand('bold', false, null);
    window.LayoutEngine.autoReflowPages();
  },

  toggleItalic() {
    if (!this.restoreSelection()) return;
    document.execCommand('italic', false, null);
    window.LayoutEngine.autoReflowPages();
  },

  toggleUnderline() {
    if (!this.restoreSelection()) return;
    document.execCommand('underline', false, null);
    window.LayoutEngine.autoReflowPages();
  },

  toggleStrikethrough() {
    if (!this.restoreSelection()) return;
    document.execCommand('strikeThrough', false, null);
    window.LayoutEngine.autoReflowPages();
  },

  alignText(alignType) {
    if (!this.restoreSelection()) return;
    document.execCommand('justify' + alignType.charAt(0).toUpperCase() + alignType.slice(1), false, null);
    window.LayoutEngine.autoReflowPages();
  },

  applyHighlight(colorHex) {
    if (!this.restoreSelection()) return;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    const mark = document.createElement('mark');
    mark.className = 'text-highlight';
    mark.style.setProperty('background-color', colorHex, 'important');
    mark.style.setProperty('color', '#0F172A', 'important');
    mark.textContent = selectedText;

    range.deleteContents();
    range.insertNode(mark);

    this.hideToolbar();
    window.LayoutEngine.autoReflowPages();
  },

  createInCardCapsule() {
    if (!this.restoreSelection()) return;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim() || 'INLINE CAPSULE';

    const capsulePill = document.createElement('span');
    capsulePill.className = 'inline-sub-capsule';
    capsulePill.setAttribute('contenteditable', 'true');
    capsulePill.textContent = selectedText;

    range.deleteContents();
    range.insertNode(capsulePill);

    this.hideToolbar();
    window.LayoutEngine.autoReflowPages();
  },

  saveSelectionRange() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      this.activeSelectionRange = sel.getRangeAt(0).cloneRange();
    }
  },

  applyTextColor(colorHex) {
    if (!this.restoreSelection()) {
      if (this.activeSelectionRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(this.activeSelectionRange);
      } else {
        return;
      }
    }

    document.execCommand('styleWithCSS', false, true);
    const ok = document.execCommand('foreColor', false, colorHex);
    if (!ok) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        span.style.color = colorHex;
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }
    }
    window.LayoutEngine?.autoReflowPages();
  },

  changeFontSize(delta) {
    if (!this.restoreSelection()) return;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const node = selection.anchorNode?.parentElement;
    if (node) {
      const currentSize = parseFloat(window.getComputedStyle(node).fontSize) || 14;
      const newSize = Math.max(10, Math.min(48, currentSize + delta * 2));
      node.style.fontSize = `${newSize}px`;
    }
    window.LayoutEngine.autoReflowPages();
  },

  insertInCardImage() {
    if (!this.restoreSelection()) return;
    window.CanvasEditor.insertComponent('incard-image-holder');
    this.hideToolbar();
  },

  insertPureInCardImage() {
    if (!this.restoreSelection()) return;
    window.CanvasEditor.insertComponent('pure-image-holder');
    this.hideToolbar();
  }
};
