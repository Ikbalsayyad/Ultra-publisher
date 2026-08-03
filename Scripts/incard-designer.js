/**
 * UltraMinds In-Card Micro-Designer Engine (V3 - Includes Instant Auto-Dismissal & Escape Listener)
 * Provides Floating Selection Quick-Format Toolbar, In-Card Sub-Capsule Creator, Highlight Marker, and Selection-Only Formatting.
 */

window.InCardDesigner = {
  activeSelectionRange: null,

  init() {
    this.createToolbarMarkup();
    this.bindEvents();
  },

  createToolbarMarkup() {
    document.getElementById('floating-selection-toolbar')?.remove();

    const toolbar = document.createElement('div');
    toolbar.id = 'floating-selection-toolbar';
    toolbar.className = 'floating-text-toolbar';
    toolbar.innerHTML = `
      <button class="floating-btn" onclick="window.InCardDesigner.toggleBold()" title="Bold Selection"><b>B</b> Bold</button>
      <button class="floating-btn" onclick="window.InCardDesigner.toggleItalic()" title="Italic Selection"><i>I</i> Italic</button>
      
      <div class="floating-divider"></div>
      
      <button class="floating-btn" style="background:#FEF08A; color:#0F172A;" onclick="window.InCardDesigner.applyHighlight('#FEF08A')" title="Yellow Highlight">🟨 Highlight</button>
      <button class="floating-btn" style="background:#86EFAC; color:#0F172A;" onclick="window.InCardDesigner.applyHighlight('#86EFAC')" title="Green Highlight">🟩 Green</button>
      <button class="floating-btn" style="background:#A5F3FC; color:#0F172A;" onclick="window.InCardDesigner.applyHighlight('#A5F3FC')" title="Cyan Highlight">🟦 Cyan</button>
      
      <div class="floating-divider"></div>
      
      <button class="floating-btn" style="background:linear-gradient(135deg, #2563EB, #00F0FF); color:#FFF;" onclick="window.InCardDesigner.createInCardCapsule()" title="Convert Selected Text to Capsule Badge">🏷️ Create Capsule</button>
      
      <div class="floating-divider"></div>
      
      <div style="display:flex; align-items:center; gap:2px;" title="Text Color for Selection">
        <label style="font-size:0.68rem; color:#94A3B8; margin-right:2px;">Color:</label>
        <input type="color" value="#2563EB" style="width:20px; height:20px; border:none; background:none; cursor:pointer;" onchange="window.InCardDesigner.applyTextColor(this.value)">
      </div>

      <div class="floating-divider"></div>

      <button class="floating-btn" style="background:#0F172A; border-color:var(--accent-cyan);" onclick="window.InCardDesigner.insertInCardImage()" title="Insert In-Card Image at Cursor">🖼️ Image</button>

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
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.activeSelectionRange);
    }
  },

  toggleBold() {
    this.restoreSelection();
    document.execCommand('bold', false, null);
    window.LayoutEngine.autoReflowPages();
  },

  toggleItalic() {
    this.restoreSelection();
    document.execCommand('italic', false, null);
    window.LayoutEngine.autoReflowPages();
  },

  applyHighlight(colorHex) {
    this.restoreSelection();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    const mark = document.createElement('mark');
    mark.className = 'text-highlight';
    mark.style.backgroundColor = colorHex;
    mark.textContent = selectedText;

    range.deleteContents();
    range.insertNode(mark);

    this.hideToolbar();
    window.LayoutEngine.autoReflowPages();
  },

  createInCardCapsule() {
    this.restoreSelection();
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

  applyTextColor(colorHex) {
    this.restoreSelection();
    document.execCommand('foreColor', false, colorHex);
    window.LayoutEngine.autoReflowPages();
  },

  insertInCardImage() {
    this.restoreSelection();
    window.CanvasEditor.insertComponent('incard-image-holder');
    this.hideToolbar();
  }
};
