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
    this.setupResizeHandles();
    this.setupStickerDeleteHandler();
    this.setupClipboardAndFileDrop();
  },

  bindEvents() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    const SUBCARD_SELECTOR = '.build-step-col, .mistake-row, .hero-item, .objective-cell, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .mistake-item, .objective-card, .step-card, .wiring-step-card, .sub-card';

    // Selection on Click (Innermost In-Card subcards get absolute priority!)
    canvas.addEventListener('click', (e) => {
      const inCardChild = e.target.closest(SUBCARD_SELECTOR);
      const outerCard = e.target.closest('.card-base, .concept-card, .code-snippet-card, .mission-header-banner, .space-filler-card, .image-holder-card');

      const target = inCardChild || outerCard;

      if (target) {
        this.selectElement(target);
        e.stopPropagation();
      } else if (!e.target.closest('#ultraminds-context-menu')) {
        this.deselectElement();
      }
    });

    // Double-click to upload image file or replace emoji with image (Universal for all cards)
    canvas.addEventListener('dblclick', (e) => {
      // ONLY target specific image frame containers or actual image tags, NEVER outer card containers!
      const frame = e.target.closest('.image-frame-container, img.holder-img, img.clipart-img, .floating-clipart-sticker img, .incard-image-box img, .image-placeholder-prompt');
      const mascotWrapper = e.target.closest('.cover-mascot-wrapper, .cover-illustration-placeholder, .badge-mascot, .badge-mascot-wrapper, .cover-mascot-area, .story-img-sticker, .floating-clipart-sticker, .badge-mascot-note');

      // Comprehensive selector for all icon/emoji elements across all cards
      const iconZone = e.target.closest(
        '.rw-icon, .real-world-icon, .item-icon, .step-img-box, .step-img-placeholder, .industry-img-placeholder, ' +
        '.component-img-placeholder, .component-img-box, .obs-img-box, .observe-image-placeholder, .sensor-half, ' +
        '.beyond-step-icon, .hero-icon, .obj-icon, .mistake-icon-col, .capsule-icon, .card-icon-badge, .card-icon, ' +
        '.round-icon-badge, .card-emoji-area, .cover-icon-big, .footer-tip-label, .var-icon, .block-icon, .badge-icon, ' +
        '.page-ribbon, .top-mission-pill, .top-corner-badge, .obj-num-circle, .step-num-badge, .card-ribbon'
      ) || (e.target.tagName === 'SPAN' && e.target.textContent && /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(e.target.textContent.trim()) ? e.target : null);

      if (frame) {
        const frameContainer = frame.closest('.image-frame-container') || frame.parentElement || frame;
        this.triggerImageUpload(frameContainer);
      } else if (mascotWrapper) {
        this.triggerMascotUpload(mascotWrapper);
      } else if (iconZone) {
        this.triggerEmojiToImageUpload(iconZone);
      }
    });

    // Single click trigger on image placeholder prompts for instant image selection
    canvas.addEventListener('click', (e) => {
      const prompt = e.target.closest('.image-placeholder-prompt');
      if (prompt) {
        const frameContainer = prompt.closest('.image-frame-container') || prompt.parentElement;
        if (frameContainer) {
          this.triggerImageUpload(frameContainer);
        }
      }
    });

    // Contenteditable auto-reflow trigger
    canvas.addEventListener('input', (e) => {
      if (e.target.isContentEditable) {
        window.LayoutEngine.autoReflowPages();
      }
    });

    // Keyboard Delete & Backspace listener for active selected element
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.shiftKey) {
        const isTyping = document.activeElement && (
          document.activeElement.isContentEditable ||
          document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT'
        );
        if (!isTyping && this.selectedElement) {
          e.preventDefault();
          window.ContextMenu.deleteElement(this.selectedElement);
        }
      }
    });
  },

  setupStickerDrag() {
    let activeSticker = null;
    let offsetX = 0, offsetY = 0;

    document.addEventListener('mousedown', (e) => {
      // Also allow free drag on .card-floating cards (#7)
      const sticker = e.target.closest('.floating-clipart-sticker, .card-floating');
      // Don't intercept if user is clicking contenteditable or a button
      if (sticker && !e.target.isContentEditable && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
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

  // ─── UNIVERSAL RESIZE ENGINE ─────────────────────────────────────────────────
  // Works on any element with class .um-resize-handle (all cards via makeCard())
  setupResizeHandles() {
    let activeResize = null;
    let startX = 0, startY = 0, startW = 0, startH = 0;

    document.addEventListener('mousedown', (e) => {
      const handle = e.target.closest('.um-resize-handle');
      if (!handle) return;
      e.preventDefault();
      e.stopPropagation();

      const card = handle.closest('.card-base, .draggable-element, .dynamic-subheader-card, .split-layout');
      if (!card) return;

      activeResize = card;
      startX = e.clientX;
      startY = e.clientY;
      startW = card.offsetWidth;
      startH = card.offsetHeight;

      // Ensure position is set for resize to work
      if (!card.style.minHeight) card.style.minHeight = startH + 'px';
      card.style.overflow = 'hidden';

      document.body.style.cursor = 'se-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!activeResize) return;
      const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-zoom')) || 0.75;
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;
      const newH = Math.max(60, startH + dy);
      activeResize.style.minHeight = newH + 'px';
      activeResize.style.height = newH + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (activeResize) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        activeResize = null;
        window.LayoutEngine?.autoReflowPages();
      }
    });
  },

  // ─── QUICK INSERT HELPERS ─────────────────────────────────────────────────────

  insertBulletCard() {
    const secData = {
      type: 'dynamic-bullets',
      title: 'KEY POINTS',
      icon: '📋',
      bullets: ['First point — click to edit', 'Second point — click to edit', 'Third point — click to edit']
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertTextCard() {
    const secData = {
      type: 'dynamic-text',
      title: 'TEXT BLOCK',
      icon: '📄',
      content: 'Click to edit this text content. You can type anything here.'
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertSubheaderCard() {
    const secData = {
      type: 'dynamic-subheader',
      title: 'NEW SECTION HEADING',
      content: ''
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertImageCard() {
    this.insertComponent('image-holder');
  },

  insertMixedCard() {
    const secData = {
      type: 'dynamic-mixed',
      title: 'INFORMATION BLOCK',
      icon: '📦',
      content: 'Click to edit this content block.',
      bullets: []
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertComparisonCard() {
    const secData = {
      type: 'dynamic-comparison',
      title: 'COMPARISON',
      icon: '⚖️',
      leftTitle: 'OPTION A',
      rightTitle: 'OPTION B',
      leftItems: [{ text: 'Point one' }, { text: 'Point two' }],
      rightItems: [{ text: 'Point one' }, { text: 'Point two' }],
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertTableCard() {
    const secData = {
      type: 'dynamic-table',
      title: 'DATA TABLE',
      icon: '📊',
      tableHeaders: ['Column A', 'Column B', 'Column C'],
      tableRows: [['Row 1A', 'Row 1B', 'Row 1C'], ['Row 2A', 'Row 2B', 'Row 2C']]
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertCapsuleCard() {
    const secData = {
      type: 'dynamic-capsule',
      title: 'KEY HIGHLIGHT',
      icon: '💡',
      content: 'This is an important highlight or takeaway point.'
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertPlainSubcard() {
    if (this.selectedElement && window.LayoutEngine?._addInCardSubcard) {
      window.LayoutEngine._addInCardSubcard(this.selectedElement.querySelector('.incard-element-bar') || this.selectedElement);
    } else {
      const secData = {
        type: 'dynamic-synthesized',
        title: 'PLAIN SUBCARD CONTAINER',
        icon: '📦',
        subcards: [{ title: 'STEP 1', body: 'Subcard details...' }]
      };
      this._insertSectionAtActivePosition(secData);
    }
  },

  insertCalloutBox() {
    if (this.selectedElement && window.LayoutEngine?._addInCardElement) {
      window.LayoutEngine._addInCardElement(this.selectedElement.querySelector('.incard-element-bar') || this.selectedElement, 'callout');
    } else {
      const secData = {
        type: 'dynamic-synthesized',
        title: 'IMPORTANT CALLOUT',
        icon: '💡',
        callouts: [{ icon: '💡', text: 'Important takeaway or key note...' }]
      };
      this._insertSectionAtActivePosition(secData);
    }
  },

  insertKeyValuePair() {
    if (this.selectedElement && window.LayoutEngine?._addInCardElement) {
      window.LayoutEngine._addInCardElement(this.selectedElement.querySelector('.incard-element-bar') || this.selectedElement, 'pair');
    } else {
      const secData = {
        type: 'dynamic-synthesized',
        title: 'SPECIFICATIONS MATRIX',
        icon: '🏷️',
        pairs: [{ key: 'PORT', value: 'I2C Port' }, { key: 'VOLTAGE', value: '5V DC' }]
      };
      this._insertSectionAtActivePosition(secData);
    }
  },

  insertSynthesizedCard() {
    const secData = {
      type: 'dynamic-synthesized',
      title: 'SMART SYNTHESIZED CARD',
      icon: '⚙️',
      subcards: [{ title: 'FEATURE A', body: 'Description A...' }],
      callouts: [{ icon: '💡', text: 'Auto-synthesized key point...' }]
    };
    this._insertSectionAtActivePosition(secData);
  },

  _insertSectionAtActivePosition(secData) {
    const newEl = window.LayoutEngine?.renderSection(secData);
    if (!newEl) return;

    if (this.selectedElement && this.selectedElement.parentNode) {
      this.selectedElement.parentNode.insertBefore(newEl, this.selectedElement.nextSibling);
    } else {
      const activePageBody = document.querySelector('.book-page .page-body-container');
      if (activePageBody) activePageBody.appendChild(newEl);
      else return;
    }

    this.selectElement(newEl);
    newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    window.LayoutEngine?.autoReflowPages();
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
        window.HistoryEngine?.pushState('Upload Image');
        const reader = new FileReader();
        reader.onload = (evt) => {
          let img = frameEl.querySelector('img.holder-img, img.clipart-img, img') ||
                    frameEl.closest('.image-holder-card, .incard-image-box, .floating-clipart-sticker')?.querySelector('img');
          if (!img) {
            img = document.createElement('img');
            img.className = 'holder-img';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            frameEl.appendChild(img);
          }
          img.src = evt.target.result;
          img.style.display = 'block';

          // Hide image placeholder prompt overlay
          const prompt = frameEl.querySelector('.image-placeholder-prompt') || frameEl.closest('.image-holder-card, .incard-image-box')?.querySelector('.image-placeholder-prompt');
          if (prompt) prompt.style.display = 'none';

          window.SaveEngine?._showToast('🖼️ Image loaded successfully!');
          window.LayoutEngine?.autoReflowPages();
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  },

  triggerEmojiToImageUpload(emojiEl) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        window.HistoryEngine?.pushState('Upload Emoji Image');
        const reader = new FileReader();
        reader.onload = (evt) => {
          emojiEl.style.resize = 'both';
          emojiEl.style.overflow = 'auto';
          emojiEl.style.display = 'flex';
          emojiEl.style.alignItems = 'center';
          emojiEl.style.justifyContent = 'center';
          if (!emojiEl.style.width) emojiEl.style.width = '100%';
          if (!emojiEl.style.height) emojiEl.style.height = '100%';

          emojiEl.innerHTML = `
            <img src="${evt.target.result}" class="card-icon-img" style="width:100%; height:100%; max-width:100%; max-height:100%; object-fit:contain; border-radius:6px; vertical-align:middle; display:block; cursor:pointer;" title="Double-click to replace image, drag corner to resize" />
            <button class="mascot-del-btn" onclick="event.stopPropagation(); window.CanvasEditor.deleteMascotOrIcon(this);" title="Delete Icon/Emoji">✕</button>
          `;
          window.SaveEngine?._showToast('🖼️ Emoji replaced with resizable card-fit image!');
          window.LayoutEngine?.autoReflowPages();
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  },

  deleteMascotOrIcon(btnTarget) {
    if (!btnTarget) return;
    window.HistoryEngine?.pushState('Delete Mascot / Icon');

    const el = btnTarget.nodeType === 1 ? btnTarget : null;
    if (!el) return;

    const targetSelector = '.cover-mascot-wrapper, .badge-mascot, .badge-mascot-wrapper, .cover-illustration-placeholder, .story-img-sticker, .round-icon-badge, .card-icon-badge, .card-emoji-area, .real-world-icon, .step-img-box, .industry-img-placeholder, .component-img-placeholder, .component-img-box, .obs-img-box, .observe-image-placeholder, .sensor-half, .beyond-step-icon, .hero-icon, .obj-icon, .mistake-icon-col, .capsule-icon, .card-icon, .footer-tip-label, .var-icon, .block-icon, .badge-icon, .incard-icon-box, .pin-sticker, .card-icon-img';

    const container = el.closest(targetSelector) || el.parentElement;
    if (container) {
      container.remove();
    } else {
      el.remove();
    }

    if (this.selectedElement === container || this.selectedElement === el) {
      this.deselectElement();
    }

    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast('🗑️ Icon/Emoji deleted!');
  },

  triggerMascotUpload(wrapperEl) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.HistoryEngine?.pushState('Upload Mascot Image');
      const reader = new FileReader();
      reader.onload = (evt) => {
        let img = wrapperEl.querySelector('img');
        if (img) {
          img.src = evt.target.result;
          img.style.display = 'block';
        } else {
          wrapperEl.innerHTML = `
            <img src="${evt.target.result}"
              class="cover-mascot-img holder-img"
              style="width:72px; height:72px; object-fit:cover; border-radius:8px; resize:both; overflow:auto; display:inline-block;
                     box-shadow:0 4px 16px rgba(0,0,0,0.4); cursor:pointer;"
              title="Double-click to replace image, drag corner to stretch/resize" />
            <button class="mascot-del-btn" onclick="event.stopPropagation(); window.CanvasEditor.deleteMascotOrIcon(this);" title="Delete Mascot">✕</button>
          `;
        }
        window.SaveEngine?._showToast('🖼️ Mascot image updated!');
        window.LayoutEngine?.autoReflowPages();
      };
      reader.readAsDataURL(file);
    };

    fileInput.click();
  },

  selectElement(el) {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected-card');
      this.removeMoveArrows();
    }
    this.selectedElement = el;
    if (window.ContextMenu) window.ContextMenu.activeTarget = el;
    this.selectedElement.classList.add('selected-card');

    // Show top toolbar In-Card Add Actions when a card is selected
    const pcbActions = document.getElementById('pcb-card-actions');
    if (pcbActions) {
      pcbActions.style.display = 'flex';
    }

    // Force overflow visible on element and ancestor card containers so floating handles/overlays are never clipped
    el.style.overflow = 'visible';
    let p = el.parentElement;
    while (p && !p.classList.contains('book-page')) {
      if (p.classList.contains('card-base') || p.classList.contains('concept-card') || p.classList.contains('code-snippet-card') || p.classList.contains('grid-2col') || p.classList.contains('split-layout') || p.classList.contains('image-holder-card')) {
        p.style.overflow = 'visible';
      }
      p = p.parentElement;
    }

    this.renderMoveArrows(el);
    this.updateInspector(el);
  },

  deselectElement() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected-card');
      this.removeMoveArrows();
      this.selectedElement = null;
    }
    const inspector = document.getElementById('element-inspector');
    if (inspector) inspector.innerHTML = '<div class="inspector-placeholder">Click any card on the canvas to inspect & adjust styling.</div>';
  },

  insertInCardElement(type) {
    let targetCard = this.selectedElement ? (this.selectedElement.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .draggable-element, section') || this.selectedElement) : null;

    if (!targetCard) {
      // Pick last card on active page canvas if no card is explicitly selected
      const activePageBody = document.querySelector('.book-page .page-body-container');
      if (activePageBody) {
        targetCard = activePageBody.querySelector('.card-base:last-of-type, .concept-card:last-of-type, section:last-of-type, .draggable-element:last-of-type');
        if (!targetCard) {
          this.insertComponent('dynamic-text');
          targetCard = this.selectedElement;
        }
      }
    }

    if (!targetCard) return alert("Please create or select a page canvas first.");

    if (type === 'subcard') {
      if (window.LayoutEngine?._addInCardSubcard) {
        window.LayoutEngine._addInCardSubcard(targetCard);
      }
    } else if (window.LayoutEngine?._addInCardElement) {
      window.LayoutEngine._addInCardElement(targetCard, type);
    }
  },

  insertImageCapsule() {
    let card = this.selectedElement ? (this.selectedElement.closest('.card-base, .image-holder-card, .incard-image-box, section') || this.selectedElement) : null;
    if (!card) {
      const activePageBody = document.querySelector('.book-page .page-body-container');
      if (activePageBody) {
        card = activePageBody.querySelector('.image-holder-card, .incard-image-box, .card-base');
      }
    }

    if (!card) return alert("Please select or create an Image Card first.");

    window.HistoryEngine?.pushState('Add Image Caption Capsule');

    let capsule = card.querySelector('.image-caption-capsule');
    if (!capsule) {
      capsule = document.createElement('div');
      capsule.className = 'image-caption-capsule';
      capsule.style.cssText = 'margin-top:6px; padding:4px 10px; background:rgba(0,240,255,0.1); border:1px solid #00F0FF; border-radius:14px; font-size:0.75rem; color:#00F0FF; text-align:center; position:relative; display:flex; align-items:center; justify-content:space-between; width:100%; box-sizing:border-box;';
      capsule.innerHTML = `
        <span contenteditable="true" style="flex:1; outline:none;">📷 Figure Caption: Edit image specification details...</span>
        <button class="incard-del-btn" onclick="this.closest('.image-caption-capsule').remove(); window.LayoutEngine?.autoReflowPages();" style="background:#EF4444; color:#FFF; border:none; border-radius:50%; width:16px; height:16px; font-size:10px; cursor:pointer; margin-left:6px; display:flex; align-items:center; justify-content:center;" title="Delete Caption">✕</button>
      `;
      const frame = card.querySelector('.image-frame-container') || card;
      if (frame !== card && frame.nextSibling) {
        card.insertBefore(capsule, frame.nextSibling);
      } else {
        card.appendChild(capsule);
      }
    }

    const span = capsule.querySelector('span');
    if (span) span.focus();
    window.SaveEngine?._showToast('📷 Image Caption Capsule added!');
    window.LayoutEngine?.autoReflowPages();
  },

  setupClipboardAndFileDrop() {
    // 1. Desktop Image File Drop onto Canvas Page
    document.addEventListener('dragover', (e) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
      }
    });

    document.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            e.preventDefault();
            e.stopPropagation();
            const page = e.target.closest('.book-page') || document.querySelector('.book-page');
            if (page) {
              const reader = new FileReader();
              reader.onload = (evt) => {
                this.createImageFromDataUrl(evt.target.result, page);
              };
              reader.readAsDataURL(file);
            }
          }
        }
      }
    });

    // 2. Ctrl+V Clipboard Paste Listener
    document.addEventListener('paste', (e) => {
      const items = (e.clipboardData || window.clipboardData)?.items;
      if (!items) return;

      let hasImage = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          hasImage = true;
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const page = this.selectedElement?.closest('.book-page') || document.querySelector('.book-page');
            const reader = new FileReader();
            reader.onload = (evt) => {
              this.createImageFromDataUrl(evt.target.result, page);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }

      if (!hasImage) {
        const isTyping = document.activeElement && (
          document.activeElement.isContentEditable ||
          document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA'
        );
        if (!isTyping) {
          const textData = e.clipboardData.getData('text');
          if (textData && textData.trim()) {
            e.preventDefault();
            this.insertTextCardFromPaste(textData.trim());
          }
        }
      }
    });
  },

  createImageFromDataUrl(dataUrl, pageTarget) {
    window.HistoryEngine?.pushState('Paste / Drop Image');
    const newEl = window.LayoutEngine.renderSection({
      type: 'image-holder',
      title: 'IMAGE CARD',
      image: dataUrl
    });

    if (!newEl) return;

    // Explicitly update image element source & display state
    const img = newEl.querySelector('img.holder-img, img');
    if (img) {
      img.src = dataUrl;
      img.style.display = 'block';
    }
    const prompt = newEl.querySelector('.image-placeholder-prompt');
    if (prompt) prompt.style.display = 'none';

    if (this.selectedElement && this.selectedElement.parentNode) {
      this.selectedElement.parentNode.insertBefore(newEl, this.selectedElement.nextSibling);
    } else {
      const body = pageTarget ? pageTarget.querySelector('.page-body-container') : document.querySelector('.book-page .page-body-container');
      if (body) body.appendChild(newEl);
    }

    this.selectElement(newEl);
    window.LayoutEngine?.autoReflowPages();

    window.SaveEngine?._showToast(
      '🖼️ Image pasted! <button style="background:#00F0FF; color:#0F172A; border:none; border-radius:4px; padding:2px 8px; font-weight:700; cursor:pointer; margin-left:8px;" onclick="window.CanvasEditor.makeElementFloating(window.CanvasEditor.selectedElement)">Make Floating Sticker</button>',
      4500
    );
  },

  insertTextCardFromPaste(text) {
    window.HistoryEngine?.pushState('Paste Text Card');
    const newEl = window.LayoutEngine.renderSection({
      type: 'dynamic-text',
      title: 'PASTED TEXT',
      icon: '📄',
      content: text
    });

    if (!newEl) return;

    if (this.selectedElement && this.selectedElement.parentNode) {
      this.selectedElement.parentNode.insertBefore(newEl, this.selectedElement.nextSibling);
    } else {
      const body = document.querySelector('.book-page .page-body-container');
      if (body) body.appendChild(newEl);
    }

    this.selectElement(newEl);
    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast('📄 Text pasted into new card below active element!');
  },

  makeElementFloating(el) {
    if (!el) return;
    window.HistoryEngine?.pushState('Make Floating Sticker');
    el.classList.add('floating-clipart-sticker');
    el.style.position = 'absolute';
    el.style.top = '120px';
    el.style.left = '60px';
    el.style.zIndex = '1000';
    el.style.width = '240px';
    window.SaveEngine?._showToast('✨ Converted into floating sticker!');
    this.selectElement(el);
  },

  renderMoveArrows(el) {
    this.removeMoveArrows();
    if (!el) return;

    const isSticker = el.classList.contains('floating-clipart-sticker') || el.classList.contains('story-img-sticker');
    const subcardSelector = '.build-step-col, .mistake-row, .hero-item, .objective-cell, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .mistake-item, .objective-card, .step-card, .wiring-step-card, .sub-card, .dynamic-bullet-item, .in-card-subcard, .callout-box-container, .key-value-pair-item';
    const isSubcard = el.matches(subcardSelector);

    const overlay = document.createElement('div');
    overlay.className = 'card-move-arrows-overlay';
    overlay.style.cssText = 'position:absolute; top:-36px; right:4px; display:flex; gap:4px; z-index:1000000; background:rgba(15,23,42,0.96); padding:4px 10px; border-radius:14px; border:1.5px solid #00F0FF; box-shadow:0 6px 20px rgba(0,0,0,0.6), 0 0 12px rgba(0,240,255,0.4); pointer-events:auto; white-space:nowrap;';

    if (isSticker) {
      overlay.innerHTML = `
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.deleteElement(window.CanvasEditor.selectedElement)" title="Delete Sticker" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:0.78rem; font-weight:bold;">🗑️ Delete</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.duplicateElement(window.CanvasEditor.selectedElement)" title="Duplicate Sticker" style="background:none; border:none; color:#10B981; cursor:pointer; font-size:0.78rem;">📋 Duplicate</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.CanvasEditor.adjustStickerZIndex(window.CanvasEditor.selectedElement, 10)" title="Bring Layer Forward" style="background:none; border:none; color:#00F0FF; cursor:pointer; font-size:0.78rem;">⬆ Forward</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.CanvasEditor.adjustStickerZIndex(window.CanvasEditor.selectedElement, -10)" title="Send Layer Backward" style="background:none; border:none; color:#00F0FF; cursor:pointer; font-size:0.78rem;">⬇ Backward</button>
      `;
    } else if (isSubcard) {
      overlay.innerHTML = `
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.moveSubcard('left')" title="Move Subcard Left" style="background:none; border:none; color:#00F0FF; cursor:pointer; font-size:0.75rem;">◀</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.moveSubcard('right')" title="Move Subcard Right" style="background:none; border:none; color:#00F0FF; cursor:pointer; font-size:0.75rem;">▶</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.moveSubcard('up')" title="Move Subcard Up" style="background:none; border:none; color:#00F0FF; cursor:pointer; font-size:0.75rem;">▲</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.moveSubcard('down')" title="Move Subcard Down" style="background:none; border:none; color:#00F0FF; cursor:pointer; font-size:0.75rem;">▼</button>
        <span style="color:rgba(255,255,255,0.2); margin:0 2px;">|</span>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.addSubcard()" title="Add New Subcard Step" style="background:none; border:none; color:#F59E0B; cursor:pointer; font-size:0.75rem;">➕</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.duplicateElement(window.CanvasEditor.selectedElement)" title="Duplicate Subcard" style="background:none; border:none; color:#10B981; cursor:pointer; font-size:0.75rem;">📋</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.deleteElement(window.CanvasEditor.selectedElement)" title="Delete Subcard" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:0.75rem; font-weight:bold;">🗑️ Delete</button>
      `;
    } else {
      overlay.innerHTML = `
        <button class="arrow-btn" onclick="event.stopPropagation(); window.PageManager.moveElementUp(window.CanvasEditor.selectedElement)" title="Move Card Up (Shift+Up)" style="background:none; border:none; color:#00F0FF; cursor:pointer; font-size:0.78rem;">▲</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.PageManager.moveElementDown(window.CanvasEditor.selectedElement)" title="Move Card Down / Next Page (Shift+Down)" style="background:none; border:none; color:#00F0FF; cursor:pointer; font-size:0.78rem;">▼</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.PageManager.moveElementDown(window.CanvasEditor.selectedElement)" title="Move to Next Page" style="background:none; border:none; color:#F59E0B; cursor:pointer; font-size:0.75rem; font-weight:700;">📄 Next Page</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.duplicateElement(window.CanvasEditor.selectedElement)" title="Duplicate Card" style="background:none; border:none; color:#10B981; cursor:pointer; font-size:0.78rem;">📋</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.toggle8PointResize(window.CanvasEditor.selectedElement)" title="Toggle 8-Point Resize Handles" style="background:none; border:none; color:#93C5FD; cursor:pointer; font-size:0.78rem;">📐 8-Pt</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.ContextMenu.deleteElement(window.CanvasEditor.selectedElement)" title="Delete Card" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:0.78rem; font-weight:bold;">🗑️ Delete</button>
        <button class="arrow-btn" onclick="event.stopPropagation(); window.CanvasEditor.toggleCardFloating(window.CanvasEditor.selectedElement)" title="Make Card Floating (Free Move)" style="background:none; border:none; color:#F59E0B; cursor:pointer; font-size:0.78rem;">📌</button>
      `;
    }

    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
    el.style.overflow = 'visible';
    el.appendChild(overlay);
  },

  adjustStickerZIndex(el, delta) {
    if (!el) return;
    const currentZ = parseInt(window.getComputedStyle(el).zIndex) || 100;
    const newZ = Math.max(1, currentZ + delta);
    el.style.zIndex = newZ;
    window.SaveEngine?._showToast(`Layer adjusted (z-index: ${newZ})`);
  },

  removeMoveArrows() {
    document.querySelectorAll('.card-move-arrows-overlay').forEach(o => o.remove());
  },

  toggleCardFloating(el) {
    if (!el) return;
    const isFloating = el.classList.toggle('card-floating');
    if (isFloating) {
      el.style.position = 'absolute';
      el.style.zIndex = '100';
      el.style.width = el.offsetWidth ? `${el.offsetWidth}px` : '300px';
      window.SaveEngine?._showToast('📌 Card is now floating freely!');
    } else {
      el.style.position = '';
      el.style.zIndex = '';
      el.style.width = '';
      el.style.left = '';
      el.style.top = '';
      window.SaveEngine?._showToast('🔒 Card re-anchored to page layout!');
    }
    if (window.LayoutEngine) window.LayoutEngine.autoReflowPages();
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
    window.HistoryEngine?.pushState(`Insert ${typeKey}`);
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
    const subcardSelector = '.build-step-col, .mistake-row, .hero-item, .objective-cell, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .mistake-item, .objective-card, .step-card, .wiring-step-card, .sub-card';

    document.addEventListener('dragstart', (e) => {
      const inCardItem = e.target.closest(subcardSelector);
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
        window.HistoryEngine?.pushState('Reorder Cards');
        window.LayoutEngine.autoReflowPages();
      }
    });

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      if (!dragged || e.dataTransfer.files?.length) return;

      const isInCardDragged = dragged.matches(subcardSelector);

      if (isInCardDragged) {
        // Reorder strictly inside parent card body container!
        const dropTarget = e.target.closest(subcardSelector + ', .card-body-text, .build-lab, .mistakes-list, .build-steps-grid, .heroes-grid');
        if (dropTarget && dropTarget !== dragged) {
          e.preventDefault();
          e.stopPropagation();

          if (dropTarget.parentNode === dragged.parentNode) {
            dragged.parentNode.insertBefore(dragged, dropTarget);
          } else if (dropTarget.classList.contains('card-body-text') || dropTarget.classList.contains('build-lab') || dropTarget.classList.contains('mistakes-list') || dropTarget.classList.contains('build-steps-grid') || dropTarget.classList.contains('heroes-grid')) {
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
  },

  setupStickerDeleteHandler() {
    document.addEventListener('click', (e) => {
      const sticker = e.target.closest('.story-img-sticker, .badge-mascot, .cover-mascot-wrapper, .card-icon-badge');
      if (!sticker) return;

      const rect = sticker.getBoundingClientRect();
      // Check if clicked in top-right 22px area (delete button zone)
      if (e.clientX >= rect.right - 22 && e.clientY <= rect.top + 22) {
        e.stopPropagation();
        e.preventDefault();
        window.HistoryEngine?.pushState('Delete Emoji Sticker');
        sticker.remove();
        window.LayoutEngine?.autoReflowPages();
      }
    });
  }
};
