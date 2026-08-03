/**
 * UltraMinds Canvas Interactive Editor & Inspector Engine (V9 - Strict In-Card Step Dragging & Multi-Row Grid Wrapping)
 */

window.CanvasEditor = {
  selectedElement: null,

  init() {
    this.bindEvents();
    this.setupDragAndDrop();
    this.setupImageHolderEvents();
    this.setupStickerDrag();
  },

  bindEvents() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    // Selection on Click (Innermost In-Card elements get absolute priority!)
    canvas.addEventListener('click', (e) => {
      const inCardChild = e.target.closest('.in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .mistake-item, .objective-card, .floating-clipart-sticker');
      const outerCard = e.target.closest('.card-base, .concept-card, .code-snippet-card, .mission-header-banner, .space-filler-card, .image-holder-card');

      const target = inCardChild || outerCard;

      if (target) {
        this.selectElement(target);
        e.stopPropagation();
      } else if (!e.target.closest('#ultraminds-context-menu')) {
        this.deselectElement();
      }
    });

    // Double-click to upload image file
    canvas.addEventListener('dblclick', (e) => {
      const frame = e.target.closest('.image-frame-container, .image-holder-card, .incard-image-box, .floating-clipart-sticker');
      if (frame) {
        this.triggerImageUpload(frame);
      }
    });

    // Contenteditable auto-reflow trigger
    canvas.addEventListener('input', (e) => {
      if (e.target.isContentEditable) {
        window.LayoutEngine.autoReflowPages();
      }
    });
  },

  setupStickerDrag() {
    let activeSticker = null;
    let offsetX = 0, offsetY = 0;

    document.addEventListener('mousedown', (e) => {
      const sticker = e.target.closest('.floating-clipart-sticker');
      if (sticker) {
        activeSticker = sticker;
        const rect = sticker.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        this.selectElement(sticker);
        e.stopPropagation();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (activeSticker) {
        const page = activeSticker.closest('.book-page');
        if (page) {
          const pageRect = page.getBoundingClientRect();
          const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-zoom')) || 0.7;

          const relX = (e.clientX - pageRect.left) / zoom - (offsetX / zoom);
          const relY = (e.clientY - pageRect.top) / zoom - (offsetY / zoom);

          activeSticker.style.left = `${Math.max(0, relX)}px`;
          activeSticker.style.top = `${Math.max(0, relY)}px`;
        }
      }
    });

    document.addEventListener('mouseup', () => {
      activeSticker = null;
    });
  },

  setupImageHolderEvents() {
    document.addEventListener('dragover', (e) => {
      const frame = e.target.closest('.image-frame-container, .floating-clipart-sticker');
      if (frame) {
        e.preventDefault();
      }
    });

    document.addEventListener('drop', (e) => {
      const frame = e.target.closest('.image-frame-container, .floating-clipart-sticker');
      if (frame && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = frame.querySelector('img.holder-img, img.clipart-img') || frame.querySelector('img');
            if (img) img.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      }
    });
  },

  triggerImageUpload(frameEl) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = frameEl.querySelector('img.holder-img, img.clipart-img') || frameEl.querySelector('img') || frameEl.closest('.image-holder-card, .incard-image-box, .floating-clipart-sticker')?.querySelector('img');
          if (img) img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  },

  selectElement(el) {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected-card');
    }
    this.selectedElement = el;
    this.selectedElement.classList.add('selected-card');
    this.updateInspector(el);
  },

  deselectElement() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected-card');
      this.selectedElement = null;
    }
    const inspector = document.getElementById('element-inspector');
    if (inspector) inspector.innerHTML = '<div class="inspector-placeholder">Click any card on the canvas to inspect & adjust styling.</div>';
  },

  updateInspector(el) {
    const inspector = document.getElementById('element-inspector');
    if (!inspector) return;

    const computedStyle = window.getComputedStyle(el);

    inspector.innerHTML = `
      <div class="inspector-section">
        <div class="ctx-label">Active Element Inspector</div>
        <div class="inspector-row">
          <label>Type:</label>
          <span style="font-weight:bold; color:var(--accent-cyan);">${el.classList[1] || el.tagName.toLowerCase()}</span>
        </div>
        <div class="inspector-row">
          <label>Bg Color:</label>
          <input type="color" value="${this.rgbToHex(computedStyle.backgroundColor)}" onchange="window.ContextMenu.setCardBg(this.value)">
        </div>
        <div class="inspector-row">
          <label>Text Color:</label>
          <input type="color" value="${this.rgbToHex(computedStyle.color)}" onchange="window.ContextMenu.setTextColor(this.value)">
        </div>
        <div class="inspector-actions">
          <button class="btn btn-primary" style="font-size:0.7rem; padding:4px 6px;" onclick="window.CanvasEditor.insertImageInsideCard()">🖼️ Insert In-Card Image</button>
          <button class="btn btn-secondary" onclick="window.ContextMenu.duplicateElement()">📋 Duplicate</button>
          <button class="btn btn-danger" onclick="window.ContextMenu.deleteElement()">🗑️ Delete</button>
        </div>
      </div>
    `;
  },

  insertComponent(typeKey) {
    const elementSpec = window.ULTRAMINDS_50_ELEMENTS[typeKey];
    if (!elementSpec) {
      alert("Element type specification not found: " + typeKey);
      return;
    }

    const secData = elementSpec.presetData || {
      type: typeKey,
      title: elementSpec.name.toUpperCase(),
      icon: elementSpec.icon || '📌',
      content: `Ready-to-use ${elementSpec.name} content. Edit this text directly on the canvas!`
    };

    const newEl = window.LayoutEngine.renderSection(secData);
    if (!newEl) return;

    const activePage = document.querySelector('.book-page');

    if (typeKey === 'floating-clipart') {
      if (activePage) {
        activePage.appendChild(newEl);
      } else {
        alert("Please load or create a page canvas first!");
        return;
      }
    } else if (this.selectedElement) {
      const bodyTarget = this.selectedElement.querySelector('.card-body-text, .build-lab') || (this.selectedElement.classList.contains('card-base') || this.selectedElement.classList.contains('concept-card') ? this.selectedElement : null);

      if (typeKey === 'incard-image-holder' && bodyTarget) {
        bodyTarget.appendChild(newEl);
      } else if (this.selectedElement.parentNode) {
        this.selectedElement.parentNode.insertBefore(newEl, this.selectedElement.nextSibling);
      }
    } else {
      const activePageBody = document.querySelector('.book-page .page-body-container');
      if (activePageBody) {
        activePageBody.appendChild(newEl);
      } else {
        alert("Please load or create a page canvas first!");
        return;
      }
    }

    this.selectElement(newEl);
    newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (typeKey !== 'floating-clipart') {
      window.LayoutEngine.autoReflowPages();
    }
  },

  insertImageInsideCard() {
    this.insertComponent('incard-image-holder');
  },

  setupDragAndDrop() {
    let dragged = null;

    document.addEventListener('dragstart', (e) => {
      // Prioritize in-card items strictly before checking outer parent card containers
      const inCardItem = e.target.closest('.in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .mistake-item, .objective-card');
      const outerCard = e.target.closest('.concept-card, .card-base, .code-snippet-card, .image-holder-card, .space-filler-card');

      const target = inCardItem ? inCardItem : outerCard;

      if (target) {
        dragged = target;
        dragged.style.opacity = '0.5';
        e.stopPropagation();
      }
    });

    document.addEventListener('dragend', (e) => {
      if (dragged) {
        dragged.style.opacity = '';
        dragged = null;
        window.LayoutEngine.autoReflowPages();
      }
    });

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      if (!dragged || e.dataTransfer.files?.length) return;

      const isInCardDragged = dragged.classList.contains('in-card-step') || dragged.classList.contains('lab-step') || dragged.classList.contains('incard-image-box') || dragged.classList.contains('inline-sub-capsule') || dragged.classList.contains('mistake-item') || dragged.classList.contains('objective-card');

      if (isInCardDragged) {
        // Reorder strictly inside parent card body container!
        const dropTarget = e.target.closest('.in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .mistake-item, .objective-card, .card-body-text, .build-lab, .mistakes-list');
        if (dropTarget && dropTarget !== dragged) {
          e.preventDefault();
          e.stopPropagation();

          if (dropTarget.parentNode === dragged.parentNode) {
            dragged.parentNode.insertBefore(dragged, dropTarget);
          } else if (dropTarget.classList.contains('card-body-text') || dropTarget.classList.contains('build-lab') || dropTarget.classList.contains('mistakes-list')) {
            dropTarget.appendChild(dragged);
          }
          window.LayoutEngine.autoReflowPages();
        }
      } else {
        // Reorder outer cards on page
        const targetCard = e.target.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card');
        if (targetCard && targetCard !== dragged) {
          e.preventDefault();
          const parent = targetCard.parentNode;
          if (parent) {
            parent.insertBefore(dragged, targetCard);
            window.LayoutEngine.autoReflowPages();
          }
        }
      }
    });
  },

  rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#ffffff';
    const parts = rgb.match(/\d+/g);
    if (!parts || parts.length < 3) return '#ffffff';
    return "#" + ((1 << 24) + (parseInt(parts[0]) << 16) + (parseInt(parts[1]) << 8) + parseInt(parts[2])).toString(16).slice(1);
  }
};
