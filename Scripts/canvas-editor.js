/**
 * UltraMinds Canvas Interactive Editor & Inspector Engine (V9 - Strict In-Card Step Dragging & Multi-Row Grid Wrapping)
 */

window.CanvasEditor = {
  selectedElement: null,
  initialized: false,

  init() {
    // Fix #2: Don't guard with initialized — restoreSnapshot() needs to call init() after
    // each Undo/Redo to re-attach canvas-level click handlers. Document-level listeners
    // (drag, resize, keydown) are attached conditionally to avoid duplication.
    const firstInit = !this.initialized;
    this.initialized = true;
    this.bindEvents();
    if (firstInit) {
      // These attach to `document` once — only on first init
      this.setupDragAndDrop();
      this.setupImageHolderEvents();
      this.setupStickerDrag();
      this.setupResizeHandles();
      this.setupStickerDeleteHandler();
      this.setupClipboardAndFileDrop();
      this.setupUniversalPointerSafetyWatchdog();
    }
  },

  setupUniversalPointerSafetyWatchdog() {
    const releaseAllPointersAndCursors = (e) => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (e && e.target && e.target.releasePointerCapture && e.pointerId !== undefined) {
        try {
          if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
            e.target.releasePointerCapture(e.pointerId);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('mouseup', releaseAllPointersAndCursors, { capture: true, passive: true });
    window.addEventListener('pointerup', releaseAllPointersAndCursors, { capture: true, passive: true });
    window.addEventListener('pointercancel', releaseAllPointersAndCursors, { capture: true, passive: true });
    window.addEventListener('blur', releaseAllPointersAndCursors, { passive: true });
  },

  bindEvents() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    const SUBCARD_SELECTOR = '.footer-code-pill-wrapper, .footer-next-zone, .footer-brand-wrapper, .footer-tip-zone, .footer-fact-zone, .cover-mascot-wrapper, .badge-mascot-wrapper, .build-step-col, .mistake-row, .hero-item, .objective-cell, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .mistake-item, .objective-card, .step-card, .wiring-step-card, .sub-card';

    // Selection on Click (Innermost In-Card subcards get absolute priority!)
    canvas.addEventListener('click', (e) => {
      // 1. If mascot/icon/sticker delete button clicked, trigger immediate deletion
      const delBtn = e.target.closest('.mascot-del-btn');
      if (delBtn) {
        e.stopPropagation();
        e.preventDefault();
        this.deleteMascotOrIcon(delBtn);
        return;
      }

      const inCardChild = e.target.closest(SUBCARD_SELECTOR);
      const outerCard = e.target.closest('.page-footer, .pure-image-holder-card, .card-base, .concept-card, .code-snippet-card, .mission-header-banner, .space-filler-card, .image-holder-card, .floating-clipart-sticker, .card-floating');

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
      // Check for illustration slot box placeholder first
      const illustrationSlot = e.target.closest('.illustration-slot-box');
      if (illustrationSlot) {
        this.triggerIllustrationSlotUpload(illustrationSlot);
        return;
      }

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

    // Keyboard Delete & Backspace listener for active selected element & empty line cleanups
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.shiftKey) {
        const isTyping = document.activeElement && (
          document.activeElement.isContentEditable ||
          document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT'
        );

        // When pressing Backspace on an empty text line / pill box, delete the wrapper cleanly
        if (isTyping && document.activeElement.isContentEditable && (e.key === 'Backspace' || e.key === 'Delete')) {
          const activeEl = document.activeElement;
          const text = (activeEl.textContent || '').trim();
          if (text === '' || text === '\n') {
            const wrapper = activeEl.closest(
              '.dynamic-paragraph-wrapper, .cca-options-pill-box, .answer-key-ribbon-box, ' +
              '.incard-text-line-wrapper, .incard-text-wrapper, .procedure-step-item, ' +
              '.worksheet-q-item, .worksheet-a-item, .dynamic-bullet-item, .cover-extra-text'
            );
            if (wrapper && wrapper.parentElement) {
              e.preventDefault();
              const allEditables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
              const curIdx = allEditables.indexOf(activeEl);
              const targetEditable = curIdx > 0 ? allEditables[curIdx - 1] : (allEditables[curIdx + 1] || null);

              wrapper.remove();
              window.LayoutEngine?.autoReflowPages();

              if (targetEditable && document.body.contains(targetEditable)) {
                targetEditable.focus();
                try {
                  const range = document.createRange();
                  range.selectNodeContents(targetEditable);
                  range.collapse(false);
                  const sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range);
                } catch (err) {}
              }
              return;
            }
          }
        }

        if (!isTyping && this.selectedElement) {
          e.preventDefault();
          window.ContextMenu.deleteElement(this.selectedElement);
        }
      }

      // Fix #13: Escape key deselects the active card and closes context menu
      if (e.key === 'Escape' && this.selectedElement) {
        this.deselectElement();
        window.ContextMenu?.hideMenu();
      }
    });
  },

  setupStickerDrag() {
    let activeSticker = null;
    let startClientX = 0, startClientY = 0;
    let startLeft = 0, startTop = 0;
    let isDragging = false;
    let hasMoved = false;

    document.addEventListener('mousedown', (e) => {
      // Don't intercept if user is clicking contenteditable, buttons, inputs, resize handles or action overlays
      if (e.target.isContentEditable || e.target.closest('button, input, select, textarea, .um-resize-handle, .transform-handle, .capsule-resize-handle, .card-move-arrows-overlay')) {
        return;
      }

      // Allow free drag on .floating-clipart-sticker, .card-floating, and mascots
      const sticker = e.target.closest('.floating-clipart-sticker, .card-floating, .cover-mascot-wrapper');
      if (sticker) {
        // Prepare drag session without modifying DOM or position yet (prevents click jumps)
        activeSticker = sticker;
        startClientX = e.clientX;
        startClientY = e.clientY;
        startLeft = parseFloat(sticker.style.left) || 0;
        startTop = parseFloat(sticker.style.top) || 0;
        isDragging = false;
        hasMoved = false;

        // Clear any conflicting 'right' or 'bottom' style when starting a drag session
        if (sticker.style.right) sticker.style.right = '';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!activeSticker) return;

      const dx = e.clientX - startClientX;
      const dy = e.clientY - startClientY;
      const dist = Math.hypot(dx, dy);

      // Dead-zone threshold: require at least 4px intentional movement before initiating drag
      // This completely stops clicks/double-clicks from displacing or hiding the mascot!
      if (e.buttons === 0) {
        endStickerDrag();
        return;
      }

      if (!isDragging) {
        if (dist < 4) return;
        isDragging = true;
        hasMoved = true;
        activeSticker.style.transition = 'none';
        activeSticker.style.cursor = 'grabbing';
        // Highest z-index while dragging so mascot floats above header box and title cards without fighting
        activeSticker.style.zIndex = '9999999';

        const overlay = activeSticker.querySelector('.card-move-arrows-overlay');
        if (overlay) overlay.style.display = 'none';
      }

      const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-zoom')) || 0.75;
      const nextLeft = startLeft + (dx / zoom);
      const nextTop = startTop + (dy / zoom);

      activeSticker.style.left = `${Math.round(nextLeft)}px`;
      activeSticker.style.top = `${Math.round(nextTop)}px`;
    });

    const endStickerDrag = () => {
      document.body.style.cursor = '';
      if (activeSticker) {
        activeSticker.style.cursor = '';
        activeSticker.style.transition = '';
        // Keep mascot comfortably above header banner & title center after drag
        activeSticker.style.zIndex = '2000';

        const overlay = activeSticker.querySelector('.card-move-arrows-overlay');
        if (overlay) overlay.style.display = 'flex';

        if (isDragging && hasMoved) {
          window.HistoryEngine?.pushState('Move Element Position');
        } else {
          // If it was just a click without dragging, select element cleanly
          this.selectElement(activeSticker);
        }

        activeSticker = null;
        isDragging = false;
        hasMoved = false;
      }
    };

    window.addEventListener('mouseup', endStickerDrag, { capture: true });
    window.addEventListener('pointerup', endStickerDrag, { capture: true });
    window.addEventListener('pointercancel', endStickerDrag, { capture: true });
    window.addEventListener('mouseleave', endStickerDrag);
    window.addEventListener('blur', endStickerDrag);
  },

  // ─── UNIVERSAL RESIZE ENGINE ─────────────────────────────────────────────────
  // Works on any element with class .um-resize-handle (all cards via makeCard())
  setupResizeHandles() {
    let activeResize = null;
    let startX = 0, startY = 0, startW = 0, startH = 0;

    const endResize = () => {
      window.removeEventListener('mousemove', onResizeMove, { capture: true });
      window.removeEventListener('mouseup', endResize, { capture: true });
      window.removeEventListener('pointermove', onResizeMove, { capture: true });
      window.removeEventListener('pointerup', endResize, { capture: true });
      window.removeEventListener('pointercancel', endResize, { capture: true });
      window.removeEventListener('blur', endResize);

      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (activeResize) {
        activeResize = null;
        try {
          window.HistoryEngine?.pushState('Resize Card');
          window.LayoutEngine?.autoReflowPages();
        } catch (err) {
          console.warn('Resize card autoReflow error:', err);
        }
      }
    };

    const onResizeMove = (e) => {
      if (!activeResize) {
        endResize();
        return;
      }
      if (e.buttons === 0) {
        endResize();
        return;
      }

      const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-zoom')) || 0.75;
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;
      const newH = Math.max(32, startH + dy);

      if (activeResize.classList.contains('incard-image-box') || activeResize.classList.contains('pure-image-holder-card')) {
        const frame = activeResize.querySelector('.image-frame-container');
        if (frame) {
          const subH = activeResize.classList.contains('pure-image-holder-card') || activeResize.classList.contains('bezel-free-pure-image') ? 0 : 32;
          frame.style.height = Math.max(50, newH - subH) + 'px';
        }
      } else if (activeResize.classList.contains('page-footer')) {
        // Footer is pinned to bottom: 0, dragging handle adjusts height upwards
        const footH = Math.max(32, startH - dy);
        activeResize.style.height = footH + 'px';
        activeResize.style.minHeight = footH + 'px';
        return;
      }

      activeResize.style.minHeight = newH + 'px';
      activeResize.style.height = newH + 'px';
    };

    const onResizeStart = (e) => {
      const handle = e.target.closest('.um-resize-handle');
      if (!handle) return;
      e.preventDefault();
      e.stopPropagation();

      const card = handle.closest('.card-base, .draggable-element, .dynamic-subheader-card, .split-layout, .incard-image-box, .pure-image-holder-card, .page-footer');
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

      window.addEventListener('mousemove', onResizeMove, { capture: true });
      window.addEventListener('mouseup', endResize, { capture: true });
      window.addEventListener('pointermove', onResizeMove, { capture: true });
      window.addEventListener('pointerup', endResize, { capture: true });
      window.addEventListener('pointercancel', endResize, { capture: true });
      window.addEventListener('blur', endResize);
    };

    document.addEventListener('pointerdown', onResizeStart);
    document.addEventListener('mousedown', (e) => {
      if (e.target.closest('.um-resize-handle')) {
        e.preventDefault();
        e.stopPropagation();
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

  startCapsuleResize(e, handleEl) {
    e.stopPropagation();
    e.preventDefault();

    if (handleEl._isResizing) return;
    handleEl._isResizing = true;

    const capsule = handleEl.closest('.capsule-header');
    if (!capsule) {
      handleEl._isResizing = false;
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = capsule.offsetWidth;
    const startH = capsule.offsetHeight;
    const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-zoom')) || 0.75;

    let hasResized = false;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const onPointerMove = (ev) => {
      if (ev.buttons === 0) {
        onPointerUp();
        return;
      }
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;

      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasResized = true;

      // Adjust Width: minWidth expands/contracts capsule horizontally without touching text font-size
      const newWidth = Math.max(60, startW + dx);
      capsule.style.minWidth = `${Math.round(newWidth)}px`;
      capsule.style.width = `${Math.round(newWidth)}px`;

      // Adjust Height: if dragging vertically, adjust padding and minHeight cleanly without changing font-size
      if (Math.abs(dy) > 2) {
        const newHeight = Math.max(22, startH + dy);
        capsule.style.minHeight = `${Math.round(newHeight)}px`;
        capsule.style.height = `${Math.round(newHeight)}px`;
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('mousemove', onPointerMove, { capture: true });
      window.removeEventListener('mouseup', onPointerUp, { capture: true });
      window.removeEventListener('pointermove', onPointerMove, { capture: true });
      window.removeEventListener('pointerup', onPointerUp, { capture: true });
      window.removeEventListener('pointercancel', onPointerUp, { capture: true });
      window.removeEventListener('blur', onPointerUp);

      handleEl._isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (hasResized) {
        try {
          window.HistoryEngine?.pushState('Resize Capsule Dimensions');
          window.LayoutEngine?.autoReflowPages();
        } catch (err) {
          console.warn('Capsule resize autoReflow error:', err);
        }
      }
    };

    window.addEventListener('mousemove', onPointerMove, { capture: true });
    window.addEventListener('mouseup', onPointerUp, { capture: true });
    window.addEventListener('pointermove', onPointerMove, { capture: true });
    window.addEventListener('pointerup', onPointerUp, { capture: true });
    window.addEventListener('pointercancel', onPointerUp, { capture: true });
    window.addEventListener('blur', onPointerUp);

    handleEl.ondblclick = (evt) => {
      evt.stopPropagation();
      capsule.style.minWidth = '';
      capsule.style.width = '';
      capsule.style.minHeight = '';
      capsule.style.height = '';
      capsule.style.paddingRight = '';
      capsule.style.paddingTop = '';
      capsule.style.paddingBottom = '';
      window.SaveEngine?._showToast('↺ Capsule dimensions reset to auto');
      window.LayoutEngine?.autoReflowPages();
    };
  },

  insertImageCard() {
    this.insertComponent('image-holder');
  },

  insertPureImageCard() {
    this.insertComponent('pure-image-holder');
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
      subtype: 'comparison',
      title: 'COMPARISON',
      icon: '⚖️',
      leftTitle: 'OPTION A',
      rightTitle: 'OPTION B',
      leftItems: [{ icon: '✅', text: 'Point one' }, { icon: '✅', text: 'Point two' }],
      rightItems: [{ icon: '✅', text: 'Point one' }, { icon: '✅', text: 'Point two' }],
      badgeText: 'VS'
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertMatchPairsCard() {
    const secData = {
      type: 'dynamic-comparison',
      subtype: 'match-pairs',
      isMatchPairs: true,
      title: 'MATCH THE PAIRS',
      icon: '🧩',
      prompt: 'Match each IoT block with its network duty:',
      leftTitle: 'COLUMN A (TERMS)',
      rightTitle: 'COLUMN B (DUTIES)',
      leftItems: [
        { icon: '🧩', text: '(1) Connect WiFi' },
        { icon: '🧩', text: '(2) Subscribe Topic' },
        { icon: '🧩', text: '(3) Publish Data' }
      ],
      rightItems: [
        { icon: '🎯', text: '[   ] A. Broadcasts live sensor telemetry to the cloud' },
        { icon: '🎯', text: '[   ] B. Links the UltraBoard to the local wireless router' },
        { icon: '🎯', text: '[   ] C. Listens for remote commands on a named channel' }
      ],
      badgeText: '⟷',
      bottomNote: 'Draw connecting lines or write the matching letters in the brackets above.'
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertCodeCompareCard() {
    const secData = {
      type: 'dynamic-comparison',
      subtype: 'code-compare',
      isCodeCompare: true,
      title: "NOVA'S CODE LOGIC MYSTERY",
      icon: '⚖️',
      prompt: 'Inspect these two cloud-listening algorithms in Ultra Studio, team:',
      leftTitle: '[❌ CODE IDEA A: BLOCKING DELAY TRAP]',
      rightTitle: '[✅ CODE IDEA B: EVENT-DRIVEN CLOUD]',
      leftCode: 'repeat while <true> do\n  If Data Received Topic: "relay1" Do:\n    Output Port # 1 Data(Power): 99\n  wait (10) Sec',
      rightCode: 'repeat while <true> do\n  If Data Received Topic: "relay1" Do:\n    Output Port # 1 Data(Power): 99\n    Set motor M1 speed 75 dir Forward\n    // No freezing delays! Instant response!',
      leftNotes: ['• Why Code A Fails: Code A pauses the processor for 10 full seconds with wait (10) Sec!'],
      rightNotes: ['• Why Code B Wins: Code B uses Non-Blocking Event Listening! Checks incoming topics hundreds of times per second!'],
      leftItems: [
        { icon: '❌', text: 'repeat while <true> do\n  If Data Received Topic: "relay1" Do:\n    Output Port # 1 Data(Power): 99\n  wait (10) Sec' }
      ],
      rightItems: [
        { icon: '✅', text: 'repeat while <true> do\n  If Data Received Topic: "relay1" Do:\n    Output Port # 1 Data(Power): 99\n    Set motor M1 speed 75 dir Forward\n    // No freezing delays! Instant response!' }
      ],
      badgeText: 'VS',
      bottomNote: 'Space for illustration: Diagram showing frozen processor missing Wi-Fi packets vs. non-blocking instant cloud event execution'
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertTableCard() {
    const rInput = window.prompt ? window.prompt("Enter number of rows (e.g. 3):", "3") : "3";
    if (rInput === null) return;
    const cInput = window.prompt ? window.prompt("Enter number of columns (e.g. 3):", "3") : "3";
    if (cInput === null) return;

    const rowCount = Math.max(1, parseInt(rInput, 10) || 3);
    const colCount = Math.max(1, parseInt(cInput, 10) || 3);

    const headers = [];
    for (let c = 1; c <= colCount; c++) headers.push(`Column ${c}`);
    const rows = [];
    for (let r = 1; r <= rowCount; r++) {
      const row = [];
      for (let c = 1; c <= colCount; c++) row.push(`Data ${r}.${c}`);
      rows.push(row);
    }

    const secData = {
      type: 'dynamic-table',
      title: 'DATA TABLE',
      icon: '📊',
      tableHeaders: headers,
      tableRows: rows
    };
    this._insertSectionAtActivePosition(secData);
  },

  insertTableInsideCard() {
    if (this.selectedElement && window.LayoutEngine?.addInCardItem) {
      window.LayoutEngine.addInCardItem(this.selectedElement, 'table');
    } else {
      this.insertTableCard();
    }
  },

  insertTextLine() {
    if (this.selectedElement && window.LayoutEngine?.addInCardItem) {
      window.LayoutEngine.addInCardItem(this.selectedElement, 'line');
    } else {
      const secData = {
        type: 'dynamic-text',
        title: 'NOTE / LINE',
        icon: '📝',
        content: 'New text line — click to edit'
      };
      this._insertSectionAtActivePosition(secData);
    }
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

  triggerIllustrationSlotUpload(slotEl) {
    if (!slotEl) return;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        window.HistoryEngine?.pushState('Upload Illustration Slot Image');
        const reader = new FileReader();
        reader.onload = (evt) => {
          const captionText = slotEl.querySelector('.dynamic-paragraph')?.textContent || 'Figure: Illustration';
          const html = window.LayoutEngine?.renderIncardImageBoxHtml(captionText, evt.target.result);
          if (html && slotEl.parentNode) {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const newBox = temp.firstElementChild;
            slotEl.parentNode.replaceChild(newBox, slotEl);
          } else {
            slotEl.innerHTML = `
              <div style="position:relative; width:100%; display:flex; justify-content:center; align-items:center;">
                <img class="holder-img" src="${evt.target.result}" style="max-width:100%; max-height:260px; object-fit:contain; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.15);" />
                <button class="incard-del-btn slot-del-btn" title="Delete Image" onclick="event.stopPropagation(); this.closest('.illustration-slot-box').remove(); window.LayoutEngine?.autoReflowPages();" style="position:absolute; top:4px; right:4px; width:22px; height:22px; background:#EF4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center; z-index:100;">✕</button>
              </div>
            `;
            slotEl.style.border = 'none';
            slotEl.style.background = 'transparent';
            slotEl.style.padding = '4px 0';
          }
          window.SaveEngine?._showToast('🖼️ Image loaded into in-card image box!');
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
    if (window.NovaPoseEngine && typeof window.NovaPoseEngine.openPosePicker === 'function') {
      window.NovaPoseEngine.openPosePicker((poseUrl) => {
        window.HistoryEngine?.pushState('Change Nova Mascot Pose');
        let img = wrapperEl.querySelector('img');
        if (img) {
          img.src = poseUrl;
          img.style.display = 'block';
        } else {
          wrapperEl.innerHTML = `
            <img src="${poseUrl}"
              class="cover-mascot-img holder-img"
              style="width:72px; height:72px; object-fit:contain; border-radius:8px; display:inline-block;
                     box-shadow:0 4px 16px rgba(0,0,0,0.4); cursor:pointer;"
              title="Commander Nova (Double-click to change pose or replace image)" />
            <button class="mascot-del-btn" onclick="event.stopPropagation(); window.CanvasEditor.deleteMascotOrIcon(this);" title="Delete Mascot">✕</button>
          `;
        }
        window.SaveEngine?._showToast('✨ Commander Nova pose updated!');
        window.LayoutEngine?.autoReflowPages();
      });
      return;
    }

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

    if (!targetCard) {
      window.SaveEngine?._showToast("ℹ️ Please create or select a page canvas first.");
      return;
    }

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

    if (!card) {
      window.SaveEngine?._showToast("ℹ️ Please select or create an Image Card first.");
      return;
    }

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
    if (!dataUrl) return;

    // If an image placeholder or frame is currently selected, fill it directly
    if (this.selectedElement) {
      const frame = this.selectedElement.classList.contains('image-frame-container')
        ? this.selectedElement
        : this.selectedElement.querySelector('.image-frame-container');
      if (frame) {
        let img = frame.querySelector('img.holder-img, img');
        if (!img) {
          img = document.createElement('img');
          img.className = 'holder-img';
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
          frame.appendChild(img);
        }
        img.src = dataUrl;
        img.style.display = 'block';
        const label = frame.querySelector('.img-placeholder-label, .image-placeholder-prompt');
        if (label) label.style.display = 'none';
        window.HistoryEngine?.pushState('Paste Image into Card');
        window.SaveEngine?._showToast('🖼️ Image loaded into selected card!');
        window.LayoutEngine?.autoReflowPages();
        return;
      }
    }

    window.HistoryEngine?.pushState('Paste / Drop Image');
    const newEl = window.LayoutEngine.renderSection({
      type: 'image-holder',
      imgUrl: dataUrl
    });

    if (!newEl) return;

    // Explicitly update image element source & display state
    const img = newEl.querySelector('img.holder-img, img');
    if (img) {
      img.src = dataUrl;
      img.style.display = 'block';
    }
    const prompt = newEl.querySelector('.image-placeholder-prompt, .img-placeholder-label');
    if (prompt) prompt.style.display = 'none';

    if (this.selectedElement && this.selectedElement.parentNode) {
      this.selectedElement.parentNode.insertBefore(newEl, this.selectedElement.nextSibling);
    } else {
      const body = pageTarget ? pageTarget.querySelector('.page-body-container') : document.querySelector('.book-page .page-body-container');
      if (body) body.appendChild(newEl);
    }

    this.selectElement(newEl);
    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast('🖼️ Image pasted!');
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
      <div class="inspector-section" style="background:rgba(24,34,56,0.65); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:12px; box-shadow:var(--clay-shadow-sm);">
        <div class="ctx-label" style="margin-bottom:8px;">Active Element Inspector</div>
        <div class="inspector-row">
          <label style="font-size:0.75rem; color:#94A3B8;">Type:</label>
          <span style="font-weight:700; font-size:0.76rem; color:var(--accent-cyan); font-family:'Fira Code', monospace;">${el.classList[1] || el.tagName.toLowerCase()}</span>
        </div>
        <div class="inspector-row">
          <label style="font-size:0.75rem; color:#94A3B8;">Bg Color:</label>
          <input type="color" value="${this.rgbToHex(computedStyle.backgroundColor)}" onchange="window.ContextMenu.setCardBg(this.value)" style="width:32px; height:24px; border:none; border-radius:6px; cursor:pointer; background:none;">
        </div>
        <div class="inspector-row">
          <label style="font-size:0.75rem; color:#94A3B8;">Text Color:</label>
          <input type="color" value="${this.rgbToHex(computedStyle.color)}" onchange="window.ContextMenu.setTextColor(this.value)" style="width:32px; height:24px; border:none; border-radius:6px; cursor:pointer; background:none;">
        </div>
        <button class="btn btn-clay-hero" style="width:100%; margin-top:8px; font-size:0.74rem; padding:7px;" onclick="window.ContextMenu?.showMenu(null, window.CanvasEditor.selectedElement)">🎨 Open Full Style &amp; Margin Drawer</button>
        <div class="inspector-actions" style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:8px;">
          <button class="btn btn-primary" style="font-size:0.7rem; padding:6px; grid-column:1 / -1;" onclick="window.CanvasEditor.insertImageInsideCard()">🖼️ Insert In-Card Image</button>
          <button class="btn btn-secondary" style="font-size:0.7rem; padding:6px;" onclick="window.ContextMenu.duplicateElement()">📋 Duplicate</button>
          <button class="btn btn-danger" style="font-size:0.7rem; padding:6px;" onclick="window.ContextMenu.deleteElement()">🗑️ Delete</button>
        </div>
      </div>
    `;
  },

  insertComponent(typeKey) {
    window.HistoryEngine?.pushState(`Insert ${typeKey}`);
    const elementSpec = window.ULTRAMINDS_50_ELEMENTS[typeKey];
    if (!elementSpec) {
      window.SaveEngine?._showToast("⚠️ Element type specification not found: " + typeKey);
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

    const activePage = (this.selectedElement ? this.selectedElement.closest('.book-page') : null) || document.querySelector('.book-page');

    if (typeKey === 'floating-clipart') {
      if (activePage) {
        newEl.style.zIndex = '1000';
        activePage.appendChild(newEl);
      } else {
        window.SaveEngine?._showToast("ℹ️ Please load or create a page canvas first!");
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
        window.SaveEngine?._showToast("ℹ️ Please load or create a page canvas first!");
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
    let dropIndicator = null;
    const subcardSelector = '.build-step-col, .mistake-row, .hero-item, .objective-cell, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .mistake-item, .objective-card, .step-card, .wiring-step-card, .sub-card';

    // Create a persistent drop indicator element
    const getDropIndicator = () => {
      if (!dropIndicator) {
        dropIndicator = document.createElement('div');
        dropIndicator.id = 'um-drop-indicator';
        dropIndicator.style.cssText = 'height:3px;background:linear-gradient(90deg,#00F0FF,#2563EB);border-radius:3px;margin:2px 0;pointer-events:none;transition:opacity 0.1s;box-shadow:0 0 8px rgba(0,240,255,0.6);';
        dropIndicator.style.display = 'none';
        document.body.appendChild(dropIndicator);
      }
      return dropIndicator;
    };

    const hideDropIndicator = () => {
      if (dropIndicator) dropIndicator.style.display = 'none';
    };

    document.addEventListener('dragstart', (e) => {
      // Do not initiate card drag when interacting with resize handles, buttons, inputs, contenteditable or overlays
      if (e.target.closest('.um-resize-handle, .capsule-resize-handle, .transform-handle, .card-move-arrows-overlay, .mascot-del-btn, .header-del-btn, .incard-del-btn, .step-del-btn, .bullet-del-btn, button, input, select, textarea, [contenteditable="true"]')) {
        e.preventDefault();
        return;
      }

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
        hideDropIndicator();
        // Clean up any drag-over highlights on page bodies
        document.querySelectorAll('.page-body-drag-over').forEach(el => el.classList.remove('page-body-drag-over'));
        window.HistoryEngine?.pushState('Reorder Cards');
        window.LayoutEngine.autoReflowPages();
      }
    });

    document.addEventListener('dragover', (e) => {
      if (!dragged) return;
      e.preventDefault();

      const isInCardDragged = dragged.matches(subcardSelector);
      if (isInCardDragged) return; // sub-card dragging handled separately

      // ── Check if hovering over a page body container (cross-page drop zone)
      const pageBody = e.target.closest('.page-body-container');
      if (pageBody) {
        e.dataTransfer.dropEffect = 'move';

        // Find best insertion position using mouse Y position
        const bodyCards = Array.from(pageBody.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > section'))
          .filter(c => c !== dragged && !c.classList.contains('empty-page-placeholder'));

        const indicator = getDropIndicator();

        if (bodyCards.length === 0) {
          // Empty body — show indicator at top
          pageBody.classList.add('page-body-drag-over');
          indicator.style.display = 'none';
          return;
        }

        // Find the card closest to mouse Y
        let targetCard = null;
        let insertBefore = true;

        for (const card of bodyCards) {
          const rect = card.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY <= midY) {
            targetCard = card;
            insertBefore = true;
            break;
          }
          targetCard = card;
          insertBefore = false;
        }

        // Position the drop indicator
        if (targetCard) {
          const rect = targetCard.getBoundingClientRect();
          const refY = insertBefore ? rect.top : rect.bottom;
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          indicator.style.display = 'block';
          indicator.style.position = 'fixed';
          indicator.style.top = `${refY - 2}px`;
          indicator.style.left = `${rect.left}px`;
          indicator.style.width = `${rect.width}px`;
          indicator.style.zIndex = '999999';
        }

        document.querySelectorAll('.page-body-drag-over').forEach(el => el.classList.remove('page-body-drag-over'));
        pageBody.classList.add('page-body-drag-over');
      } else {
        document.querySelectorAll('.page-body-drag-over').forEach(el => el.classList.remove('page-body-drag-over'));
        hideDropIndicator();
      }
    });

    document.addEventListener('drop', (e) => {
      if (!dragged || e.dataTransfer.files?.length) return;

      const isInCardDragged = dragged.matches(subcardSelector);

      if (isInCardDragged) {
        // Reorder strictly inside parent card body container
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
        e.preventDefault();
        hideDropIndicator();
        document.querySelectorAll('.page-body-drag-over').forEach(el => el.classList.remove('page-body-drag-over'));

        // ── Try cross-page drop onto page body directly
        const pageBody = e.target.closest('.page-body-container');
        if (pageBody) {
          // Find insertion position using mouse Y
          const bodyCards = Array.from(pageBody.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > section'))
            .filter(c => c !== dragged && !c.classList.contains('empty-page-placeholder'));

          let inserted = false;
          for (const card of bodyCards) {
            const rect = card.getBoundingClientRect();
            if (e.clientY <= rect.top + rect.height / 2) {
              pageBody.insertBefore(dragged, card);
              inserted = true;
              break;
            }
          }
          if (!inserted) pageBody.appendChild(dragged);
          window.LayoutEngine.autoReflowPages();
          return;
        }

        // ── Standard same-page card-to-card reorder
        const targetCard = e.target.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card');
        if (targetCard && targetCard !== dragged) {
          const parent = targetCard.parentNode;
          if (parent) {
            // Insert before or after based on mouse Y
            const rect = targetCard.getBoundingClientRect();
            if (e.clientY > rect.top + rect.height / 2) {
              parent.insertBefore(dragged, targetCard.nextSibling);
            } else {
              parent.insertBefore(dragged, targetCard);
            }
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
      const delBtn = e.target.closest('.mascot-del-btn');
      if (delBtn) {
        e.stopPropagation();
        e.preventDefault();
        this.deleteMascotOrIcon(delBtn);
        return;
      }

      const sticker = e.target.closest('.story-img-sticker, .badge-mascot, .cover-mascot-wrapper, .card-icon-badge, .round-icon-badge, .card-emoji-area');
      if (!sticker) return;

      const rect = sticker.getBoundingClientRect();
      // Check if clicked in top-right 24px area (delete button zone)
      if (e.clientX >= rect.right - 24 && e.clientY <= rect.top + 24) {
        e.stopPropagation();
        e.preventDefault();
        this.deleteMascotOrIcon(sticker);
      }
    }, true);
  }
};
