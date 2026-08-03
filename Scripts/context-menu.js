/**
 * UltraMinds Custom Context Menu & Transform Engine (V10 - Includes Split Layout Unstacker Engine)
 */

window.ContextMenu = {
  activeTarget: null,
  targetMode: 'whole',
  transformActive: false,

  init() {
    this.createMenuMarkup();
    this.bindEvents();
  },

  createMenuMarkup() {
    document.getElementById('ultraminds-context-menu')?.remove();

    const menu = document.createElement('div');
    menu.id = 'ultraminds-context-menu';
    menu.className = 'ultraminds-ctx-menu';
    menu.innerHTML = `
      <div class="ctx-header">
        <span class="ctx-title">🎨 Format & Style Inspector</span>
        <div style="display:flex; gap:6px;">
          <button class="ctx-btn-sm" style="background:#475569;" onclick="window.ContextMenu.resetTargetNodeStyles()" title="Reset Selected Styles">↺ Reset</button>
          <button class="ctx-btn-danger-sm" onclick="window.ContextMenu.deleteElement()" title="Delete Card">🗑️ Delete</button>
          <button class="ctx-close-btn" onclick="window.ContextMenu.hideMenu()">✕</button>
        </div>
      </div>

      <div class="ctx-body">
        <!-- ITEM 1: TARGET SELECTOR & MERGE/UNSTACK -->
        <div class="ctx-section">
          <div class="ctx-label">Target Selection & Page Layout</div>
          <div class="ctx-row">
            <select id="ctx-target-mode" class="ctx-select" onchange="window.ContextMenu.setTargetMode(this.value)">
              <option value="whole">Whole Card Container</option>
              <option value="title">Card Title Capsule Only</option>
              <option value="body">Card Body Text Only</option>
            </select>
          </div>
          <div class="ctx-row" style="margin-top:6px; gap:4px;">
            <button class="ctx-btn-action" style="flex:1; background:linear-gradient(135deg, #10B981, #059669);" onclick="window.ContextMenu.mergeSelectedSideBySide()">🔀 Merge Side-by-Side (2 Cols)</button>
            <button class="ctx-btn-action" style="flex:1; background:linear-gradient(135deg, #F59E0B, #D97706);" onclick="window.ContextMenu.unstackSelectedSplit()">🔓 Unstack (Full-Width)</button>
          </div>
        </div>

        <!-- ITEM 2: IMAGE HOLDER & MULTI-IMAGE GRID CONTROLS -->
        <div class="ctx-section" id="ctx-image-controls" style="display:none; background:rgba(0, 240, 255, 0.06); border-color:var(--accent-cyan);">
          <div class="ctx-label">🖼️ Image Controls & Grid Layout</div>
          
          <div class="ctx-label" style="font-size:0.68rem; color:#94A3B8;">Horizontal Multi-Image Grid (1 to 6 Inline Columns)</div>
          <div class="ctx-row" style="gap:4px;">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.transformToGrid(1)">1 Col</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.transformToGrid(2)">2 Cols</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.transformToGrid(3)">3 Cols</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.transformToGrid(4)">4 Cols</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.transformToGrid(5)">5 Cols</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.transformToGrid(6)">6 Cols</button>
          </div>

          <div class="ctx-label" style="font-size:0.68rem; color:#94A3B8; margin-top:8px;">Object Fit (Fill / Cover / Stretch)</div>
          <div class="ctx-row">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImageFit('cover')">Cover (Crop)</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImageFit('contain')">Contain (Fit)</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImageFit('fill')">Fill (Stretch)</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImageFit('scale-down')">Scale-Down</button>
          </div>

          <div class="ctx-label" style="font-size:0.68rem; color:#94A3B8; margin-top:6px;">Object Alignment (Position)</div>
          <div class="ctx-row">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImagePosition('center')">Center</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImagePosition('top')">Top</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImagePosition('bottom')">Bottom</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImagePosition('left')">Left</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImagePosition('right')">Right</button>
          </div>

          <div class="ctx-label" style="font-size:0.68rem; color:#94A3B8; margin-top:6px;">Upload or Change Image</div>
          <div class="ctx-row">
            <button class="ctx-btn-action" style="flex:1;" onclick="window.ContextMenu.uploadImageFile()">📁 Upload File</button>
            <button class="ctx-btn-action" style="flex:1; background:#2563EB;" onclick="window.ContextMenu.promptImageURL()">🔗 Paste URL</button>
          </div>
        </div>

        <!-- ITEM 3: TEXT COLOR & GRADIENTS -->
        <div class="ctx-section">
          <div class="ctx-label">1. Text Color & Gradients</div>
          <div class="ctx-row">
            <label style="font-size:0.75rem;">Color:</label>
            <input type="color" id="ctx-text-color-wheel" value="#0F172A">
            <input type="text" id="ctx-text-color-code" class="ctx-input-sm" value="#0F172A" placeholder="#Hex">
          </div>
          <div class="ctx-presets">
            <span class="color-dot" style="background:#2563EB;" onclick="window.ContextMenu.setTextColor('#2563EB')"></span>
            <span class="color-dot" style="background:#16A34A;" onclick="window.ContextMenu.setTextColor('#16A34A')"></span>
            <span class="color-dot" style="background:#EA580C;" onclick="window.ContextMenu.setTextColor('#EA580C')"></span>
            <span class="color-dot" style="background:#7C3AED;" onclick="window.ContextMenu.setTextColor('#7C3AED')"></span>
            <span class="color-dot" style="background:#DC2626;" onclick="window.ContextMenu.setTextColor('#DC2626')"></span>
            <span class="color-dot" style="background:#0F172A;" onclick="window.ContextMenu.setTextColor('#0F172A')"></span>
            <span class="color-dot" style="background:#FFFFFF; border:1px solid #CCC;" onclick="window.ContextMenu.setTextColor('#FFFFFF')"></span>
          </div>
          <div class="ctx-label" style="margin-top:8px;">Gradient Text</div>
          <div class="ctx-row">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setTextGradient('linear-gradient(135deg, #2563EB, #00F0FF)')">Ocean</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setTextGradient('linear-gradient(135deg, #EA580C, #F59E0B)')">Sunset</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setTextGradient('linear-gradient(135deg, #8B5CF6, #EC4899)')">Cyber</button>
            <button class="ctx-btn-sm" style="background:#475569;" onclick="window.ContextMenu.clearTextGradient()">Solid Text</button>
          </div>
        </div>

        <!-- ITEM 4: FONT & TYPOGRAPHY -->
        <div class="ctx-section">
          <div class="ctx-label">2. Font & Typography</div>
          <div class="ctx-row">
            <select id="ctx-font-family" class="ctx-select" onchange="window.ContextMenu.setFontFamily(this.value)">
              <option value="'Outfit', sans-serif">Outfit (Heading)</option>
              <option value="'Inter', sans-serif">Inter (Clean)</option>
              <option value="'Fira Code', monospace">Fira Code (Code)</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
              <option value="Poppins, sans-serif">Poppins</option>
            </select>
          </div>
          <div class="ctx-row" style="margin-top:6px;">
            <label style="font-size:0.75rem;">Size (px):</label>
            <input type="number" id="ctx-font-size-num" class="ctx-input-sm" value="16" min="8" max="72">
            <input type="range" id="ctx-font-size-range" min="8" max="72" value="16">
          </div>
          <div class="ctx-row" style="margin-top:6px;">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setTextAlign('left')">⬅️ Left</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setTextAlign('center')">↔️ Center</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setTextAlign('right')">➡️ Right</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.toggleFontWeight()"><b>B</b> Bold</button>
          </div>
        </div>

        <!-- ITEM 5: CARD TRANSFORM -->
        <div class="ctx-section">
          <div class="ctx-label">3. Card Transform & Stretch</div>
          <button class="ctx-btn-action" onclick="window.ContextMenu.toggleTransformHandles()">📐 Toggle 8-Point Resize Handles</button>
        </div>

        <!-- ITEM 6: CARD COLOR & CAPSULE GRADIENTS -->
        <div class="ctx-section">
          <div class="ctx-label">4. Card Background & Capsule Gradients</div>
          <div class="ctx-row">
            <label style="font-size:0.75rem;">Bg Color:</label>
            <input type="color" id="ctx-card-bg-wheel" value="#FFFFFF">
            <label style="font-size:0.75rem;">Bg Opacity:</label>
            <input type="range" id="ctx-card-opacity" min="0.05" max="1" step="0.05" value="1">
          </div>
          <div class="ctx-presets" style="margin-top:6px;">
            <span class="color-dot" style="background:#EFF6FF;" onclick="window.ContextMenu.setCardBg('#EFF6FF')"></span>
            <span class="color-dot" style="background:#F0FDF4;" onclick="window.ContextMenu.setCardBg('#F0FDF4')"></span>
            <span class="color-dot" style="background:#FEFCE8;" onclick="window.ContextMenu.setCardBg('#FEFCE8')"></span>
            <span class="color-dot" style="background:#F5F3FF;" onclick="window.ContextMenu.setCardBg('#F5F3FF')"></span>
            <span class="color-dot" style="background:#FEF2F2;" onclick="window.ContextMenu.setCardBg('#FEF2F2')"></span>
            <span class="color-dot" style="background:#0A0F1D;" onclick="window.ContextMenu.setCardBg('#0A0F1D')"></span>
            <span class="color-dot" style="background:#FFFFFF; border:1px solid #CCC;" onclick="window.ContextMenu.setCardBg('#FFFFFF')"></span>
          </div>

          <div class="ctx-label" style="margin-top:8px;">Capsule Gradients & Solid Colors</div>
          <div class="ctx-row">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #16A34A, #10B981)')">Emerald</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #2563EB, #00F0FF)')">Ocean</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #EA580C, #F59E0B)')">Sunset</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #7C3AED, #6366F1)')">Cyber</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #DC2626, #EF4444)')">Crimson</button>
          </div>
        </div>

        <!-- ITEM 7: 4-SIDE MARGIN CONTROLS -->
        <div class="ctx-section">
          <div class="ctx-label">5. 4-Side Margin Control</div>
          <div class="ctx-row">
            <label style="font-size:0.7rem;">Top:</label>
            <input type="number" class="ctx-input-sm" value="0" min="0" max="100" oninput="window.ContextMenu.set4SideMargin('Top', this.value)">
            <label style="font-size:0.7rem;">Right:</label>
            <input type="number" class="ctx-input-sm" value="0" min="0" max="100" oninput="window.ContextMenu.set4SideMargin('Right', this.value)">
          </div>
          <div class="ctx-row" style="margin-top:4px;">
            <label style="font-size:0.7rem;">Bottom:</label>
            <input type="number" class="ctx-input-sm" value="12" min="0" max="100" oninput="window.ContextMenu.set4SideMargin('Bottom', this.value)">
            <label style="font-size:0.7rem;">Left:</label>
            <input type="number" class="ctx-input-sm" value="0" min="0" max="100" oninput="window.ContextMenu.set4SideMargin('Left', this.value)">
          </div>
        </div>

        <!-- ITEM 8: ACTIONS -->
        <div class="ctx-section">
          <div class="ctx-label">6. Quick Actions</div>
          <div class="ctx-row">
            <button class="ctx-btn-action" style="flex:1;" onclick="window.ContextMenu.duplicateElement()">📋 Duplicate</button>
            <button class="ctx-btn-action" style="flex:1; background:#DC2626;" onclick="window.ContextMenu.deleteElement()">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(menu);
  },

  bindEvents() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    // Right-Click Context Menu Listener
    canvas.addEventListener('contextmenu', (e) => {
      const card = e.target.closest('.card-base, .concept-card, .code-snippet-card, .lab-step, .objective-card, .mission-header-banner, .space-filler-card, .image-holder-card, .incard-image-box');
      if (card) {
        e.preventDefault();
        this.showMenu(e, card);
      }
    });

    // Sync input controls
    document.getElementById('ctx-text-color-wheel')?.addEventListener('input', (e) => this.setTextColor(e.target.value));
    document.getElementById('ctx-text-color-code')?.addEventListener('input', (e) => this.setTextColor(e.target.value));
    document.getElementById('ctx-card-bg-wheel')?.addEventListener('input', (e) => this.setCardBg(e.target.value));
    document.getElementById('ctx-card-opacity')?.addEventListener('input', (e) => this.setCardOpacity(e.target.value));

    const fontNum = document.getElementById('ctx-font-size-num');
    const fontRange = document.getElementById('ctx-font-size-range');

    fontNum?.addEventListener('input', (e) => {
      if (fontRange) fontRange.value = e.target.value;
      this.setFontSize(e.target.value);
    });

    fontRange?.addEventListener('input', (e) => {
      if (fontNum) fontNum.value = e.target.value;
      this.setFontSize(e.target.value);
    });
  },

  showMenu(e, target) {
    this.activeTarget = target;
    window.CanvasEditor.selectElement(target);

    const menu = document.getElementById('ultraminds-context-menu');
    if (!menu) return;

    const imgControls = document.getElementById('ctx-image-controls');
    if (imgControls) {
      const isImgCard = target.classList.contains('image-holder-card') || target.classList.contains('incard-image-box') || target.querySelector('img.holder-img');
      imgControls.style.display = isImgCard ? 'block' : 'none';
    }

    menu.classList.add('show-ctx');
  },

  hideMenu() {
    const menu = document.getElementById('ultraminds-context-menu');
    if (menu) menu.classList.remove('show-ctx');
  },

  setTargetMode(mode) {
    this.targetMode = mode;
  },

  getTargetNode() {
    if (!this.activeTarget) return null;
    if (this.targetMode === 'title') {
      return this.activeTarget.querySelector('.capsule-header, .incard-bottom-capsule, .card-title-text, h1, .header-titles') || this.activeTarget;
    }
    if (this.targetMode === 'body') {
      return this.activeTarget.querySelector('.card-body-text, p, code, .step-instruction') || this.activeTarget;
    }
    return this.activeTarget;
  },

  mergeSelectedSideBySide() {
    if (!this.activeTarget) return;
    const nextSibling = this.activeTarget.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('draggable-element')) {
      window.LayoutEngine.mergeCardsSideBySide(this.activeTarget, nextSibling);
      this.hideMenu();
    } else {
      alert("Please select a card that has another card below it to merge them side-by-side!");
    }
  },

  unstackSelectedSplit() {
    if (!this.activeTarget) return;
    const splitEl = this.activeTarget.closest('.split-layout');
    if (splitEl) {
      window.LayoutEngine.unstackSplitLayout(splitEl);
      this.hideMenu();
    } else {
      alert("This card is already a full-width standalone card!");
    }
  },

  resetTargetNodeStyles() {
    const node = this.getTargetNode();
    if (!node) return;

    node.style.background = '';
    node.style.backgroundImage = '';
    node.style.backgroundColor = '';
    node.style.color = '';
    node.style.webkitBackgroundClip = '';
    node.style.webkitTextFillColor = '';
    node.style.backgroundClip = '';

    node.querySelectorAll('*').forEach(child => {
      child.style.background = '';
      child.style.backgroundImage = '';
      child.style.backgroundColor = '';
      child.style.color = '';
      child.style.webkitBackgroundClip = '';
      child.style.webkitTextFillColor = '';
      child.style.backgroundClip = '';
    });

    window.LayoutEngine.autoReflowPages();
  },

  transformToGrid(cols) {
    if (!this.activeTarget) return;

    const existingGrid = this.activeTarget.closest('.multi-image-grid-row');

    if (existingGrid) {
      existingGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      const currentItems = Array.from(existingGrid.children);
      const currentCount = currentItems.length;

      if (cols > currentCount) {
        const isIncard = currentItems[0]?.classList.contains('incard-image-box');
        for (let i = currentCount + 1; i <= cols; i++) {
          const newItem = window.LayoutEngine.renderSection({
            type: isIncard ? 'incard-image-holder' : 'image-holder',
            title: isIncard ? `Image ${i}` : `FIGURE 1.${i}`,
            icon: '🖼️',
            caption: `Image ${i}`,
            imgUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
          });
          existingGrid.appendChild(newItem);
        }
      } else if (cols < currentCount) {
        for (let i = currentCount - 1; i >= cols; i--) {
          currentItems[i].remove();
        }
      }
      window.CanvasEditor.selectElement(existingGrid.children[0] || existingGrid);
      window.LayoutEngine.autoReflowPages();
      return;
    }

    const isIncard = this.activeTarget.classList.contains('incard-image-box');
    const existingImgSrc = this.activeTarget.querySelector('img')?.src;
    const existingTitle = this.activeTarget.querySelector('.card-title-text, .incard-bottom-capsule')?.textContent?.trim();

    const newGrid = window.LayoutEngine.createMultiImageGrid(cols, isIncard);

    if (existingImgSrc && newGrid.children[0]) {
      const firstImg = newGrid.children[0].querySelector('img');
      if (firstImg) firstImg.src = existingImgSrc;
      const firstTitle = newGrid.children[0].querySelector('.card-title-text, .incard-bottom-capsule');
      if (firstTitle && existingTitle) firstTitle.textContent = existingTitle;
    }

    if (this.activeTarget.parentNode) {
      this.activeTarget.parentNode.insertBefore(newGrid, this.activeTarget);
      this.activeTarget.remove();
      window.CanvasEditor.selectElement(newGrid.children[0] || newGrid);
      window.LayoutEngine.autoReflowPages();
    }
  },

  setImageFit(fitMode) {
    if (!this.activeTarget) return;
    const imgs = this.activeTarget.querySelectorAll('img.holder-img, img');
    imgs.forEach(img => img.style.objectFit = fitMode);
    window.LayoutEngine.autoReflowPages();
  },

  setImagePosition(posMode) {
    if (!this.activeTarget) return;
    const imgs = this.activeTarget.querySelectorAll('img.holder-img, img');
    imgs.forEach(img => img.style.objectPosition = posMode);
  },

  uploadImageFile() {
    if (!this.activeTarget) return;
    const frame = this.activeTarget.querySelector('.image-frame-container') || this.activeTarget;
    window.CanvasEditor.triggerImageUpload(frame);
  },

  promptImageURL() {
    if (!this.activeTarget) return;
    const url = prompt("Enter Image URL (HTTP/HTTPS or Base64):");
    if (url) {
      const img = this.activeTarget.querySelector('img.holder-img') || this.activeTarget.querySelector('img');
      if (img) img.src = url;
    }
  },

  setTextColor(color) {
    const node = this.getTargetNode();
    if (!node) return;

    this.clearTextGradientOnNode(node);

    node.style.color = color;
    node.querySelectorAll('*').forEach(child => {
      this.clearTextGradientOnNode(child);
      child.style.color = color;
    });

    const wheel = document.getElementById('ctx-text-color-wheel');
    const code = document.getElementById('ctx-text-color-code');
    if (wheel) wheel.value = color;
    if (code) code.value = color;
  },

  setTextGradient(grad) {
    const node = this.getTargetNode();
    if (!node) return;

    node.style.background = grad;
    node.style.webkitBackgroundClip = 'text';
    node.style.webkitTextFillColor = 'transparent';
    node.style.backgroundClip = 'text';
  },

  clearTextGradient() {
    const node = this.getTargetNode();
    if (!node) return;
    this.clearTextGradientOnNode(node);
    node.querySelectorAll('*').forEach(c => this.clearTextGradientOnNode(c));
  },

  clearTextGradientOnNode(n) {
    n.style.webkitBackgroundClip = '';
    n.style.webkitTextFillColor = '';
    n.style.backgroundClip = '';
    n.style.background = '';
    n.style.backgroundImage = '';
  },

  setFontFamily(font) {
    const node = this.getTargetNode();
    if (!node) return;
    node.style.fontFamily = font;
    node.querySelectorAll('*').forEach(c => c.style.fontFamily = font);
  },

  setFontSize(sizePx) {
    const node = this.getTargetNode();
    if (!node) return;
    node.style.fontSize = `${sizePx}px`;
    node.querySelectorAll('*').forEach(c => c.style.fontSize = `${sizePx}px`);
    window.LayoutEngine.autoReflowPages();
  },

  setTextAlign(align) {
    const node = this.getTargetNode();
    if (!node) return;
    node.style.textAlign = align;
  },

  toggleFontWeight() {
    const node = this.getTargetNode();
    if (!node) return;
    const isBold = node.style.fontWeight === 'bold' || node.style.fontWeight === '700';
    node.style.fontWeight = isBold ? 'normal' : 'bold';
  },

  setCardBg(colorHex) {
    if (!this.activeTarget) return;

    let targetEl = this.activeTarget;
    if (this.targetMode === 'title') {
      targetEl = this.activeTarget.querySelector('.capsule-header, .incard-bottom-capsule') || this.activeTarget;
    } else if (this.targetMode === 'body') {
      targetEl = this.activeTarget.querySelector('.card-body-text') || this.activeTarget;
    }

    const currentAlpha = document.getElementById('ctx-card-opacity')?.value || 1;
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);

    targetEl.style.background = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
  },

  setCardOpacity(alphaVal) {
    if (!this.activeTarget) return;

    let targetEl = this.activeTarget;
    if (this.targetMode === 'title') {
      targetEl = this.activeTarget.querySelector('.capsule-header, .incard-bottom-capsule') || this.activeTarget;
    } else if (this.targetMode === 'body') {
      targetEl = this.activeTarget.querySelector('.card-body-text') || this.activeTarget;
    }

    const computedBg = window.getComputedStyle(targetEl).backgroundColor;
    const rgb = computedBg.match(/\d+/g);

    if (rgb && rgb.length >= 3) {
      targetEl.style.backgroundColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alphaVal})`;
    }
  },

  setCapsuleBg(colorHexOrGrad) {
    if (!this.activeTarget) return;
    const capsule = this.activeTarget.querySelector('.capsule-header, .incard-bottom-capsule') || this.activeTarget;
    if (capsule) {
      capsule.style.webkitBackgroundClip = '';
      capsule.style.webkitTextFillColor = '';
      capsule.style.backgroundClip = '';
      capsule.style.background = colorHexOrGrad;
      capsule.style.color = '#FFFFFF';
    }
  },

  set4SideMargin(side, pxVal) {
    if (!this.activeTarget) return;
    this.activeTarget.style[`margin${side}`] = `${pxVal}px`;
    window.LayoutEngine.autoReflowPages();
  },

  toggleTransformHandles() {
    if (!this.activeTarget) return;
    this.transformActive = !this.transformActive;

    if (this.transformActive) {
      this.activeTarget.classList.add('transform-handles-active');
      this.attachResizeHandles(this.activeTarget);
    } else {
      this.activeTarget.classList.remove('transform-handles-active');
      this.removeResizeHandles(this.activeTarget);
    }
  },

  attachResizeHandles(target) {
    this.removeResizeHandles(target);
    target.style.position = 'relative';

    const handlePositions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

    handlePositions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `transform-handle handle-${pos}`;
      handle.dataset.position = pos;
      target.appendChild(handle);
      this.bindHandleDrag(handle, target);
    });
  },

  removeResizeHandles(target) {
    target.querySelectorAll('.transform-handle').forEach(h => h.remove());
  },

  bindHandleDrag(handle, target) {
    const onPointerDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = target.offsetWidth;
      const startHeight = target.offsetHeight;
      const pos = handle.dataset.position;

      const onPointerMove = (moveEvt) => {
        const dx = moveEvt.clientX - startX;
        const dy = moveEvt.clientY - startY;

        if (pos.includes('e')) target.style.width = `${Math.max(80, startWidth + dx)}px`;
        if (pos.includes('w')) target.style.width = `${Math.max(80, startWidth - dx)}px`;
        if (pos.includes('s')) target.style.height = `${Math.max(60, startHeight + dy)}px`;

        const frame = target.querySelector('.image-frame-container');
        if (frame && pos.includes('s')) {
          frame.style.height = `${Math.max(50, startHeight + dy - 30)}px`;
        }

        window.LayoutEngine.autoReflowPages();
      };

      const onPointerUp = () => {
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    handle.addEventListener('mousedown', onPointerDown);
    handle.addEventListener('pointerdown', onPointerDown);
  },

  duplicateElement() {
    if (!this.activeTarget) return;
    const clone = this.activeTarget.cloneNode(true);
    this.activeTarget.parentNode.insertBefore(clone, this.activeTarget.nextSibling);
    window.CanvasEditor.selectElement(clone);
    window.LayoutEngine.autoReflowPages();
    this.hideMenu();
  },

  deleteElement() {
    if (!this.activeTarget) return;
    if (confirm("Are you sure you want to delete this element?")) {
      const parent = this.activeTarget.parentNode;
      this.activeTarget.remove();
      window.CanvasEditor.deselectElement();
      window.LayoutEngine.autoReflowPages();
      this.hideMenu();
    }
  }
};
