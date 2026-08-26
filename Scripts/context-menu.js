/**
 * UltraMinds Custom Context Menu & Inspector Engine (V7.2)
 * Features:
 *  - 4-Side Margin Inspector (Top, Bottom, Right, Left) with Steppers, Sliders, Linking & Presets
 *  - Subcard Alignment & Distribution Engine (Justify Main-Axis, Cross-Axis Align, Flex/Grid Columns, Width Balance & Gap)
 *  - Format & Style Inspector, Color Gradients, Capsule Theme Editor, Typography & Image Grid Controls
 *  - Split Layout Merge / Unstack Engine & 8-Point Card Resizer
 */

window.ContextMenu = {
  activeTarget: null,
  targetMode: 'whole',
  transformActive: false,
  marginsLinked: false,

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
        <span class="ctx-title">🎨 Format &amp; Style Inspector</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="ctx-btn-sm" style="background:#475569;" onclick="window.ContextMenu.resetTargetNodeStyles()" title="Reset Selected Styles">↺ Reset</button>
          <button class="ctx-btn-danger-sm" onclick="window.ContextMenu.deleteElement()" title="Delete Card">🗑️ Delete</button>
          <button class="ctx-close-btn" onclick="window.ContextMenu.hideMenu()">✕</button>
        </div>
      </div>

      <div class="ctx-body">
        <!-- ITEM 1: TARGET SELECTOR & MERGE/UNSTACK -->
        <div class="ctx-section">
          <div class="ctx-label">Target Selection &amp; Page Layout</div>
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

        <!-- ITEM 2: 4-SIDE MARGIN CONTROLLER (TOP, BOTTOM, RIGHT, LEFT) -->
        <div class="ctx-section" id="ctx-margin-controls" style="border-color:var(--accent-blue);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div class="ctx-label" style="margin-bottom:0;">📐 4-Side Margin Controller</div>
            <button id="ctx-margin-link-btn" class="ctx-pill-btn" onclick="window.ContextMenu.toggleMarginLink()" title="Link all 4 margins together">⛓️ Unlinked</button>
          </div>

          <!-- Visual Margin Stepper Box -->
          <div class="ctx-margin-box">
            <!-- TOP MARGIN -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.68rem; color:#94A3B8; font-weight:700; width:28px;">TOP</span>
              <div class="ctx-margin-stepper">
                <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Top', -2)">−</button>
                <input type="number" id="ctx-margin-top" value="0" min="0" max="200" oninput="window.ContextMenu.set4SideMargin('Top', this.value, true)" />
                <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Top', 2)">+</button>
              </div>
              <span style="font-size:0.65rem; color:#64748B;">px</span>
            </div>

            <!-- LEFT & RIGHT MARGINS -->
            <div class="ctx-margin-row-center">
              <div style="display:flex; align-items:center; gap:2px;">
                <span style="font-size:0.68rem; color:#94A3B8; font-weight:700;">L</span>
                <div class="ctx-margin-stepper">
                  <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Left', -2)">−</button>
                  <input type="number" id="ctx-margin-left" value="0" min="0" max="200" oninput="window.ContextMenu.set4SideMargin('Left', this.value, true)" />
                  <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Left', 2)">+</button>
                </div>
              </div>

              <div class="ctx-margin-core-label">CARD</div>

              <div style="display:flex; align-items:center; gap:2px;">
                <span style="font-size:0.68rem; color:#94A3B8; font-weight:700;">R</span>
                <div class="ctx-margin-stepper">
                  <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Right', -2)">−</button>
                  <input type="number" id="ctx-margin-right" value="0" min="0" max="200" oninput="window.ContextMenu.set4SideMargin('Right', this.value, true)" />
                  <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Right', 2)">+</button>
                </div>
              </div>
            </div>

            <!-- BOTTOM MARGIN -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.68rem; color:#94A3B8; font-weight:700; width:28px;">BOT</span>
              <div class="ctx-margin-stepper">
                <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Bottom', -2)">−</button>
                <input type="number" id="ctx-margin-bottom" value="12" min="0" max="200" oninput="window.ContextMenu.set4SideMargin('Bottom', this.value, true)" />
                <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Bottom', 2)">+</button>
              </div>
              <span style="font-size:0.65rem; color:#64748B;">px</span>
            </div>
          </div>

          <!-- Quick Margin Presets -->
          <div style="font-size:0.66rem; color:#94A3B8; margin-top:6px; margin-bottom:3px; font-weight:700;">Margin Presets:</div>
          <div class="ctx-row" style="gap:4px; flex-wrap:wrap;">
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('reset')" title="0px margins on all sides">0px (Reset)</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('compact')" title="4px margins">4px Compact</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('normal')" title="8px margins">8px Standard</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('default')" title="Top/Left/Right: 0px, Bottom: 12px">12px Card Def</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('spacious')" title="16px margins">16px Spacious</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('center')" title="Center horizontally (0 auto)">0 Auto (Center)</button>
          </div>
        </div>

        <!-- ITEM 3: SUBCARD ALIGNMENT & DISTRIBUTION (JUSTIFY SUBCARDS INSIDE) -->
        <div class="ctx-section" id="ctx-align-dist-controls" style="background:rgba(16, 185, 129, 0.06); border-color:#10B981;">
          <div class="ctx-label" style="color:#10B981; display:flex; justify-content:space-between; align-items:center;">
            <span>🔀 Subcard Alignment &amp; Distribution</span>
          </div>

          <!-- MAIN-AXIS DISTRIBUTION (JUSTIFY CONTENT) -->
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:2px; font-weight:700;">1. Distribute / Justify Subcards (Main Axis)</div>
          <div class="ctx-btn-grid" style="grid-template-columns: repeat(3, 1fr); margin-top:3px;">
            <button class="ctx-btn-sm ctx-justify-btn" data-justify="flex-start" onclick="window.ContextMenu.setSubcardJustify('flex-start')" title="Align Left / Start">⬅️ Left</button>
            <button class="ctx-btn-sm ctx-justify-btn" data-justify="center" onclick="window.ContextMenu.setSubcardJustify('center')" title="Align Center">↔️ Center</button>
            <button class="ctx-btn-sm ctx-justify-btn" data-justify="flex-end" onclick="window.ContextMenu.setSubcardJustify('flex-end')" title="Align Right / End">➡️ Right</button>
            <button class="ctx-btn-sm ctx-justify-btn" data-justify="space-between" onclick="window.ContextMenu.setSubcardJustify('space-between')" title="Space Between: Distribute subcards evenly to edges">🔀 Between</button>
            <button class="ctx-btn-sm ctx-justify-btn" data-justify="space-around" onclick="window.ContextMenu.setSubcardJustify('space-around')" title="Space Around: Equal padding around each subcard">⚖️ Around</button>
            <button class="ctx-btn-sm ctx-justify-btn" data-justify="space-evenly" onclick="window.ContextMenu.setSubcardJustify('space-evenly')" title="Space Evenly: Equal gap between cards & edges">🔲 Evenly</button>
          </div>

          <!-- CROSS-AXIS ALIGNMENT (ALIGN ITEMS) -->
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:8px; font-weight:700;">2. Cross-Axis Alignment (Vertical / Height)</div>
          <div class="ctx-row" style="gap:4px; margin-top:3px;">
            <button class="ctx-btn-sm ctx-align-btn" data-align="stretch" style="flex:1;" onclick="window.ContextMenu.setSubcardAlign('stretch')" title="Stretch: All subcards equal height">↕️ Stretch</button>
            <button class="ctx-btn-sm ctx-align-btn" data-align="flex-start" style="flex:1;" onclick="window.ContextMenu.setSubcardAlign('flex-start')" title="Top align subcards">⬆️ Top</button>
            <button class="ctx-btn-sm ctx-align-btn" data-align="center" style="flex:1;" onclick="window.ContextMenu.setSubcardAlign('center')" title="Center vertically">↕️ Middle</button>
            <button class="ctx-btn-sm ctx-align-btn" data-align="flex-end" style="flex:1;" onclick="window.ContextMenu.setSubcardAlign('flex-end')" title="Bottom align subcards">⬇️ Bottom</button>
          </div>

          <!-- SUBCARD FLOW & GRID COLUMNS -->
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:8px; font-weight:700;">3. Layout Flow &amp; Columns</div>
          <div class="ctx-row" style="gap:4px; margin-top:3px;">
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.setSubcardFlow('row')" title="Row Flow: Horizontal flex-wrap">➡️ Row</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.setSubcardFlow('column')" title="Column Flow: Vertical flex stack">⬇️ Stack</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setSubcardGridCols(1)">1 Col</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setSubcardGridCols(2)">2 Cols</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setSubcardGridCols(3)">3 Cols</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setSubcardGridCols(4)">4 Cols</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setSubcardGridCols('auto')" title="Auto-Fit Grid columns">Auto</button>
          </div>

          <!-- SUBCARD WIDTH SIZING / EQUALIZER -->
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:8px; font-weight:700;">4. Subcard Sizing &amp; Balance</div>
          <div class="ctx-row" style="gap:4px; margin-top:3px;">
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.setSubcardWidthSizing('equal')" title="Make all subcards fill available width equally">🟰 Equal Width</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.setSubcardWidthSizing('auto')" title="Subcards size naturally to content">📐 Fit Content</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.setSubcardWidthSizing('full')" title="Each subcard full 100% width">📜 Full Width</button>
          </div>

          <!-- SUBCARD GAP / SPACING CONTROLLER -->
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:8px; font-weight:700;">5. Subcard Gap Spacing (px)</div>
          <div class="ctx-row" style="margin-top:3px; gap:6px;">
            <input type="range" id="ctx-subcard-gap-range" min="0" max="40" value="8" style="flex:1;" oninput="window.ContextMenu.setSubcardGap(this.value)" />
            <input type="number" id="ctx-subcard-gap-num" class="ctx-input-sm" value="8" min="0" max="60" style="width:46px;" oninput="window.ContextMenu.setSubcardGap(this.value)" />
          </div>
          <div class="ctx-row" style="gap:4px; margin-top:3px;">
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setSubcardGap(0)">0px</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setSubcardGap(4)">4px</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setSubcardGap(8)">8px</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setSubcardGap(12)">12px</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setSubcardGap(16)">16px</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setSubcardGap(24)">24px</button>
          </div>

          <!-- SUBCARD REORDER & ADD -->
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:8px; font-weight:700;">6. Subcard Reorder &amp; Step Actions</div>
          <div class="ctx-row" style="gap:4px; margin-top:3px;">
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.moveSubcard('left')" title="Move Subcard Left">◀ Left</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.moveSubcard('right')" title="Move Subcard Right">▶ Right</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.moveSubcard('up')" title="Move Subcard Up">▲ Up</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.moveSubcard('down')" title="Move Subcard Down">▼ Down</button>
          </div>
          <div class="ctx-row" style="margin-top:4px;">
            <button class="ctx-btn-action" style="background:#059669; padding:5px 8px; font-size:0.75rem;" onclick="window.ContextMenu.addSubcard()">➕ Add Subcard Step</button>
          </div>
        </div>

        <!-- ITEM 4: IMAGE HOLDER & MULTI-IMAGE GRID CONTROLS -->
        <div class="ctx-section" id="ctx-image-controls" style="display:none; background:rgba(0, 240, 255, 0.06); border-color:var(--accent-cyan);">
          <div class="ctx-label">🖼️ Image Controls &amp; Grid Layout</div>
          
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

        <!-- ITEM 5: CARD BACKGROUND & CAPSULE GRADIENTS -->
        <div class="ctx-section">
          <div class="ctx-label">🎨 Card Background &amp; Capsule Gradients</div>
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

          <div class="ctx-label" style="margin-top:8px;">Capsule Gradients &amp; Solid Colors</div>
          <div class="ctx-row">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #16A34A, #10B981)')">Emerald</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #2563EB, #00F0FF)')">Ocean</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #EA580C, #F59E0B)')">Sunset</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #7C3AED, #6366F1)')">Cyber</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setCapsuleBg('linear-gradient(135deg, #DC2626, #EF4444)')">Crimson</button>
          </div>
        </div>

        <!-- ITEM 6: TITLE CAPSULE ICON / IMAGE EDITING -->
        <div class="ctx-section" style="background:rgba(245,158,11,0.07); border-color:#F59E0B;">
          <div class="ctx-label">🏷️ Title Capsule — Icon &amp; Image</div>
          <div class="ctx-row" style="gap:6px; align-items:center;">
            <label style="font-size:0.72rem; color:#94A3B8; white-space:nowrap;">Icon/Emoji:</label>
            <input type="text" id="ctx-title-icon-input" class="ctx-input-sm" value="📌" maxlength="4" style="width:48px; text-align:center; font-size:1.2rem;"
              oninput="window.ContextMenu.setTitleIcon(this.value)" placeholder="🔥" />
            <button class="ctx-btn-sm" onclick="window.ContextMenu.replaceTitleIconWithImage()" style="background:#8B5CF6; flex:1;">🖼️ Replace with Image</button>
          </div>
          <div class="ctx-row" style="margin-top:6px; gap:4px;">
            <button class="ctx-btn-action" style="flex:1;" onclick="window.ContextMenu.uploadTitleBgImage()">📷 Capsule BG Image</button>
            <button class="ctx-btn-danger-sm" style="flex:1; background:#DC2626;" onclick="window.ContextMenu.removeActiveIcon()">🗑️ Remove Emoji</button>
          </div>
        </div>

        <!-- ITEM 7: TEXT COLOR & GRADIENTS -->
        <div class="ctx-section">
          <div class="ctx-label">🔤 Text Color &amp; Gradients</div>
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

        <!-- ITEM 8: FONT & TYPOGRAPHY -->
        <div class="ctx-section">
          <div class="ctx-label">🔠 Font &amp; Typography</div>
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

        <!-- ITEM 9: CARD TRANSFORM & ACTIONS -->
        <div class="ctx-section">
          <div class="ctx-label">📐 Card Transform &amp; Quick Actions</div>
          <div class="ctx-row" style="gap:4px;">
            <button class="ctx-btn-action" style="flex:1;" onclick="window.ContextMenu.toggleTransformHandles()">📐 8-Point Resize</button>
            <button class="ctx-btn-action" style="flex:1; background:#0284C7;" onclick="window.ContextMenu.duplicateElement()">📋 Duplicate</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(menu);
  },

  bindEvents() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    // Comprehensive Right-Click Context Menu Listener
    const SUBCARD_SELECTOR = '.build-step-col, .wiring-step-card, .step-card, .mistake-item, .mistake-row, .hero-item, .hero-card, .hero-card-item, .objective-cell, .objective-item, .objective-card, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .sub-card, .in-card-subcard, .component-card, .circuit-card, .dynamic-subcard, .step-col';
    const CARD_SELECTOR = '.card-base, .concept-card, .code-snippet-card, .lab-step, .objective-card, .mission-header-banner, .space-filler-card, .image-holder-card, .incard-image-box, .cover-header-banner, .mission-story-card, .real-world-card, .curiosity-box-card, .stem-fact-card, .mission-objectives-card, .think-engineer-card, .draggable-element, section';

    canvas.addEventListener('contextmenu', (e) => {
      const subcard = e.target.closest(SUBCARD_SELECTOR);
      const card = e.target.closest(CARD_SELECTOR);
      if (subcard) {
        e.preventDefault();
        this.showMenu(e, subcard);
      } else if (card) {
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
    if (!target) return;
    this.activeTarget = target;
    window.CanvasEditor?.selectElement(target);

    const menu = document.getElementById('ultraminds-context-menu');
    if (!menu) return;

    this.syncFormValues(target);
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

  syncFormValues(target) {
    if (!target) return;

    // 1. Sync 4-Side Margins
    const computed = window.getComputedStyle(target);
    const top = parseInt(target.style.marginTop) || parseInt(computed.marginTop) || 0;
    const right = parseInt(target.style.marginRight) || parseInt(computed.marginRight) || 0;
    const bottom = parseInt(target.style.marginBottom) || parseInt(computed.marginBottom) || 0;
    const left = parseInt(target.style.marginLeft) || parseInt(computed.marginLeft) || 0;

    const elTop = document.getElementById('ctx-margin-top');
    const elRight = document.getElementById('ctx-margin-right');
    const elBottom = document.getElementById('ctx-margin-bottom');
    const elLeft = document.getElementById('ctx-margin-left');

    if (elTop) elTop.value = top;
    if (elRight) elRight.value = right;
    if (elBottom) elBottom.value = bottom;
    if (elLeft) elLeft.value = left;

    // 2. Sync Subcard Alignment & Distribution
    const subcardContainer = this.getSubcardContainer(target);
    const alignSection = document.getElementById('ctx-align-dist-controls');
    if (alignSection) {
      // Keep section always visible for convenient card/subcard layout control
      alignSection.style.display = 'block';

      if (subcardContainer) {
        const scComputed = window.getComputedStyle(subcardContainer);
        const currentJustify = subcardContainer.style.justifyContent || scComputed.justifyContent || 'flex-start';
        const currentAlign = subcardContainer.style.alignItems || scComputed.alignItems || 'stretch';
        const currentGap = parseInt(subcardContainer.style.gap) || parseInt(scComputed.gap) || 8;

        const gapNum = document.getElementById('ctx-subcard-gap-num');
        const gapRange = document.getElementById('ctx-subcard-gap-range');
        if (gapNum) gapNum.value = currentGap;
        if (gapRange) gapRange.value = currentGap;

        // Highlight active justify button
        document.querySelectorAll('.ctx-justify-btn').forEach(btn => {
          btn.classList.toggle('ctx-btn-active', btn.dataset.justify === currentJustify);
        });

        // Highlight active align button
        document.querySelectorAll('.ctx-align-btn').forEach(btn => {
          btn.classList.toggle('ctx-btn-active', btn.dataset.align === currentAlign);
        });
      }
    }

    // 3. Image Controls Visibility
    const imgControls = document.getElementById('ctx-image-controls');
    if (imgControls) {
      const isImgCard = target.classList.contains('image-holder-card') ||
                        target.classList.contains('incard-image-box') ||
                        target.querySelector('img.holder-img, .image-frame-container');
      imgControls.style.display = isImgCard ? 'block' : 'none';
    }

    // 4. Title Icon Emoji Input
    const badge = target.querySelector('.round-icon-badge, .capsule-icon, .card-icon-badge');
    const iconInput = document.getElementById('ctx-title-icon-input');
    if (badge && iconInput && !badge.querySelector('img')) {
      iconInput.value = badge.textContent.trim();
    }

    // 5. Colors & Typography
    const node = this.getTargetNode();
    if (node) {
      const nodeComputed = window.getComputedStyle(node);
      const fontSize = parseInt(nodeComputed.fontSize) || 16;
      const fontNum = document.getElementById('ctx-font-size-num');
      const fontRange = document.getElementById('ctx-font-size-range');
      if (fontNum) fontNum.value = fontSize;
      if (fontRange) fontRange.value = fontSize;
    }
  },

  // ─────────────────────────────────────────────────
  // 4-SIDE MARGIN CONTROLLER (TOP, BOTTOM, RIGHT, LEFT)
  // ─────────────────────────────────────────────────
  set4SideMargin(side, pxVal, fromUser = false) {
    if (!this.activeTarget) return;
    const num = Math.max(0, parseFloat(pxVal) || 0);

    if (this.marginsLinked) {
      ['Top', 'Right', 'Bottom', 'Left'].forEach(s => {
        this.activeTarget.style[`margin${s}`] = `${num}px`;
        const input = document.getElementById(`ctx-margin-${s.toLowerCase()}`);
        if (input) input.value = num;
      });
    } else {
      this.activeTarget.style[`margin${side}`] = `${num}px`;
      const input = document.getElementById(`ctx-margin-${side.toLowerCase()}`);
      if (input) input.value = num;
    }

    window.LayoutEngine?.autoReflowPages();
    if (fromUser) {
      window.HistoryEngine?.pushState(`Set ${side} Margin to ${num}px`);
    }
  },

  stepMargin(side, delta) {
    if (!this.activeTarget) return;
    const input = document.getElementById(`ctx-margin-${side.toLowerCase()}`);
    const current = parseFloat(input?.value) || 0;
    const nextVal = Math.max(0, current + delta);
    this.set4SideMargin(side, nextVal, true);
  },

  toggleMarginLink() {
    this.marginsLinked = !this.marginsLinked;
    const btn = document.getElementById('ctx-margin-link-btn');
    if (btn) {
      if (this.marginsLinked) {
        btn.textContent = '🔗 Linked';
        btn.classList.add('ctx-btn-active');
        window.SaveEngine?._showToast('🔗 4 Margins Linked together');
      } else {
        btn.textContent = '⛓️ Unlinked';
        btn.classList.remove('ctx-btn-active');
        window.SaveEngine?._showToast('⛓️ 4 Margins Unlinked (Individual control)');
      }
    }
  },

  applyMarginPreset(preset) {
    if (!this.activeTarget) return;
    window.HistoryEngine?.pushState(`Apply Margin Preset: ${preset}`);

    if (preset === 'reset') {
      ['Top', 'Right', 'Bottom', 'Left'].forEach(s => this.set4SideMargin(s, 0));
    } else if (preset === 'compact') {
      ['Top', 'Right', 'Bottom', 'Left'].forEach(s => this.set4SideMargin(s, 4));
    } else if (preset === 'normal') {
      ['Top', 'Right', 'Bottom', 'Left'].forEach(s => this.set4SideMargin(s, 8));
    } else if (preset === 'default') {
      this.set4SideMargin('Top', 0);
      this.set4SideMargin('Right', 0);
      this.set4SideMargin('Bottom', 12);
      this.set4SideMargin('Left', 0);
    } else if (preset === 'spacious') {
      ['Top', 'Right', 'Bottom', 'Left'].forEach(s => this.set4SideMargin(s, 16));
    } else if (preset === 'center') {
      this.activeTarget.style.marginLeft = 'auto';
      this.activeTarget.style.marginRight = 'auto';
      this.activeTarget.style.marginTop = '0px';
      this.activeTarget.style.marginBottom = '12px';
      const elTop = document.getElementById('ctx-margin-top');
      const elBottom = document.getElementById('ctx-margin-bottom');
      if (elTop) elTop.value = 0;
      if (elBottom) elBottom.value = 12;
      window.SaveEngine?._showToast('📐 Card centered horizontally!');
    }

    window.LayoutEngine?.autoReflowPages();
  },

  // ─────────────────────────────────────────────────
  // SUBCARD ALIGNMENT & DISTRIBUTION ENGINE
  // ─────────────────────────────────────────────────
  getSubcardContainer(target) {
    if (!target) target = this.activeTarget || window.CanvasEditor?.selectedElement;
    if (!target) return null;

    const SUBCARD_SELECTOR = '.build-step-col, .wiring-step-card, .step-card, .mistake-item, .mistake-row, .hero-item, .hero-card, .hero-card-item, .objective-cell, .objective-item, .objective-card, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .sub-card, .in-card-subcard, .component-card, .circuit-card, .dynamic-subcard, .step-col';

    // If target itself is a subcard, find its parent container
    if (target.matches(SUBCARD_SELECTOR)) {
      const parentContainer = target.closest('.subcards-flex-grid, .build-steps-grid, .objectives-row, .mistakes-grid, .hero-showcase-grid, .components-grid, .circuit-blocks-grid, .multi-image-grid-row, .flow-steps-container, .beyond-steps-grid, .story-layout, .scenario-comparison, .rw-list, .subcards-container, .incard-grid');
      if (parentContainer) return parentContainer;
      if (target.parentElement && target.parentElement !== document.body && !target.parentElement.classList.contains('page-body-container')) {
        return target.parentElement;
      }
    }

    // If target is a card, find existing subcard container inside it
    const existingGrid = target.querySelector('.subcards-flex-grid, .build-steps-grid, .objectives-row, .mistakes-grid, .hero-showcase-grid, .components-grid, .circuit-blocks-grid, .multi-image-grid-row, .flow-steps-container, .beyond-steps-grid, .story-layout, .scenario-comparison, .rw-list, .subcards-container, .incard-grid');
    if (existingGrid) return existingGrid;

    // Look for multiple subcards inside target
    const subcards = target.querySelectorAll(SUBCARD_SELECTOR);
    if (subcards.length > 0 && subcards[0].parentElement) {
      return subcards[0].parentElement;
    }

    // Fallback: look for card body or card itself
    const body = target.querySelector('.card-body-text') || target;
    return body;
  },

  setSubcardJustify(justifyVal) {
    const container = this.getSubcardContainer();
    if (!container) return;

    window.HistoryEngine?.pushState(`Set Subcard Justification: ${justifyVal}`);

    const computedDisplay = window.getComputedStyle(container).display;
    if (computedDisplay !== 'flex' && computedDisplay !== 'grid') {
      container.style.display = 'flex';
      container.style.flexWrap = 'wrap';
    }

    container.style.justifyContent = justifyVal;

    // Highlight active button
    document.querySelectorAll('.ctx-justify-btn').forEach(btn => {
      btn.classList.toggle('ctx-btn-active', btn.dataset.justify === justifyVal);
    });

    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast(`🔀 Justified subcards: ${justifyVal}`);
  },

  setSubcardAlign(alignVal) {
    const container = this.getSubcardContainer();
    if (!container) return;

    window.HistoryEngine?.pushState(`Set Subcard Alignment: ${alignVal}`);

    const computedDisplay = window.getComputedStyle(container).display;
    if (computedDisplay !== 'flex' && computedDisplay !== 'grid') {
      container.style.display = 'flex';
      container.style.flexWrap = 'wrap';
    }

    container.style.alignItems = alignVal;

    // Highlight active button
    document.querySelectorAll('.ctx-align-btn').forEach(btn => {
      btn.classList.toggle('ctx-btn-active', btn.dataset.align === alignVal);
    });

    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast(`↕️ Aligned subcards: ${alignVal}`);
  },

  setSubcardFlow(flowMode) {
    const container = this.getSubcardContainer();
    if (!container) return;

    window.HistoryEngine?.pushState(`Set Subcard Flow: ${flowMode}`);

    container.style.display = 'flex';
    container.style.flexDirection = flowMode;
    container.style.flexWrap = flowMode === 'row' ? 'wrap' : 'nowrap';
    container.style.gridTemplateColumns = '';

    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast(`➡️ Flow set to: ${flowMode}`);
  },

  setSubcardGridCols(cols) {
    const container = this.getSubcardContainer();
    if (!container) return;

    window.HistoryEngine?.pushState(`Set Subcard Columns: ${cols}`);

    container.style.display = 'grid';
    container.style.flexDirection = '';

    if (typeof cols === 'number') {
      container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      window.SaveEngine?._showToast(`🔲 Grid layout: ${cols} Equal Columns`);
    } else if (cols === 'auto') {
      container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
      window.SaveEngine?._showToast('🔲 Grid layout: Auto-Fit Responsive Columns');
    }

    window.LayoutEngine?.autoReflowPages();
  },

  setSubcardWidthSizing(mode) {
    const container = this.getSubcardContainer();
    if (!container) return;

    window.HistoryEngine?.pushState(`Set Subcard Sizing: ${mode}`);

    const SUBCARD_SELECTOR = '.build-step-col, .wiring-step-card, .step-card, .mistake-item, .mistake-row, .hero-item, .hero-card, .hero-card-item, .objective-cell, .objective-item, .objective-card, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .sub-card, .in-card-subcard, .component-card, .circuit-card, .dynamic-subcard, .step-col';
    let subcards = Array.from(container.querySelectorAll(SUBCARD_SELECTOR));
    if (subcards.length === 0) {
      subcards = Array.from(container.children);
    }

    subcards.forEach(sub => {
      if (mode === 'equal') {
        sub.style.flex = '1 1 0px';
        sub.style.minWidth = '0';
        sub.style.width = 'auto';
      } else if (mode === 'auto') {
        sub.style.flex = '0 1 auto';
        sub.style.minWidth = 'auto';
        sub.style.width = 'auto';
      } else if (mode === 'full') {
        sub.style.flex = '1 1 100%';
        sub.style.width = '100%';
      }
    });

    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast(`🟰 Subcard sizing set to: ${mode}`);
  },

  setSubcardGap(gapPx) {
    const container = this.getSubcardContainer();
    if (!container) return;

    const num = Math.max(0, parseInt(gapPx) || 0);
    container.style.gap = `${num}px`;

    const gapNum = document.getElementById('ctx-subcard-gap-num');
    const gapRange = document.getElementById('ctx-subcard-gap-range');
    if (gapNum) gapNum.value = num;
    if (gapRange) gapRange.value = num;

    window.LayoutEngine?.autoReflowPages();
  },

  setSubcardSelfAlign(alignVal) {
    if (!this.activeTarget) return;
    this.activeTarget.style.alignSelf = alignVal;
    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast(`Self-alignment set to: ${alignVal}`);
  },

  // ─────────────────────────────────────────────────
  // LAYOUT MERGE & UNSTACK
  // ─────────────────────────────────────────────────
  mergeSelectedSideBySide() {
    if (!this.activeTarget) return;
    const nextSibling = this.activeTarget.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('draggable-element')) {
      window.LayoutEngine?.mergeCardsSideBySide(this.activeTarget, nextSibling);
      this.hideMenu();
    } else {
      alert("Please select a card that has another card below it to merge them side-by-side!");
    }
  },

  unstackSelectedSplit() {
    if (!this.activeTarget) return;
    const splitEl = this.activeTarget.closest('.split-layout');
    if (splitEl) {
      window.LayoutEngine?.unstackSplitLayout(splitEl);
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

    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast('↺ Styles reset to default');
  },

  // ─────────────────────────────────────────────────
  // MULTI-IMAGE GRID CONTROLS
  // ─────────────────────────────────────────────────
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
          const newItem = window.LayoutEngine?.renderSection({
            type: isIncard ? 'incard-image-holder' : 'image-holder',
            title: isIncard ? `Image ${i}` : `FIGURE 1.${i}`,
            icon: '🖼️',
            caption: `Image ${i}`,
            imgUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
          });
          if (newItem) existingGrid.appendChild(newItem);
        }
      } else if (cols < currentCount) {
        for (let i = currentCount - 1; i >= cols; i--) {
          currentItems[i].remove();
        }
      }
      window.CanvasEditor?.selectElement(existingGrid.children[0] || existingGrid);
      window.LayoutEngine?.autoReflowPages();
      return;
    }

    const isIncard = this.activeTarget.classList.contains('incard-image-box');
    const existingImgSrc = this.activeTarget.querySelector('img')?.src;
    const existingTitle = this.activeTarget.querySelector('.card-title-text, .incard-bottom-capsule')?.textContent?.trim();

    const newGrid = window.LayoutEngine?.createMultiImageGrid(cols, isIncard);
    if (!newGrid) return;

    if (existingImgSrc && newGrid.children[0]) {
      const firstImg = newGrid.children[0].querySelector('img');
      if (firstImg) firstImg.src = existingImgSrc;
      const firstTitle = newGrid.children[0].querySelector('.card-title-text, .incard-bottom-capsule');
      if (firstTitle && existingTitle) firstTitle.textContent = existingTitle;
    }

    if (this.activeTarget.parentNode) {
      this.activeTarget.parentNode.insertBefore(newGrid, this.activeTarget);
      this.activeTarget.remove();
      window.CanvasEditor?.selectElement(newGrid.children[0] || newGrid);
      window.LayoutEngine?.autoReflowPages();
    }
  },

  setImageFit(fitMode) {
    if (!this.activeTarget) return;
    const imgs = this.activeTarget.querySelectorAll('img.holder-img, img');
    imgs.forEach(img => img.style.objectFit = fitMode);
    window.LayoutEngine?.autoReflowPages();
  },

  setImagePosition(posMode) {
    if (!this.activeTarget) return;
    const imgs = this.activeTarget.querySelectorAll('img.holder-img, img');
    imgs.forEach(img => img.style.objectPosition = posMode);
  },

  uploadImageFile() {
    if (!this.activeTarget) return;
    const frame = this.activeTarget.querySelector('.image-frame-container') || this.activeTarget;
    window.CanvasEditor?.triggerImageUpload(frame);
  },

  promptImageURL() {
    if (!this.activeTarget) return;
    const url = prompt("Enter Image URL (HTTP/HTTPS or Base64):");
    if (url) {
      const img = this.activeTarget.querySelector('img.holder-img') || this.activeTarget.querySelector('img');
      if (img) img.src = url;
    }
  },

  // ─────────────────────────────────────────────────
  // TEXT & FONT CONTROLS
  // ─────────────────────────────────────────────────
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
    window.LayoutEngine?.autoReflowPages();
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

  removeActiveIcon() {
    if (this.activeTarget) {
      const icon = this.activeTarget.closest('.round-icon-badge, .card-icon-badge, .industry-img-placeholder, .step-img-box, .component-img-placeholder, .obs-img-box, .rw-icon, .capsule-icon')
                || this.activeTarget.querySelector('.round-icon-badge, .industry-img-placeholder, .step-img-box, .component-img-placeholder, .obs-img-box');
      if (icon) {
        icon.remove();
        window.SaveEngine?._showToast('🗑️ Icon/Emoji removed!');
        window.LayoutEngine?.autoReflowPages();
      }
    }
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

  // ─────────────────────────────────────────────────
  // 8-POINT TRANSFORM HANDLES
  // ─────────────────────────────────────────────────
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
    if (getComputedStyle(target).position === 'static') {
      target.style.position = 'relative';
    }
    target.style.overflow = 'visible';

    let p = target.parentElement;
    while (p && p !== document.body && !p.classList.contains('right-canvas-viewport') && p.id !== 'a4-canvas-container') {
      p.style.overflow = 'visible';
      p = p.parentElement;
    }

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
    if (!target) return;
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
        const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-zoom')) || 0.75;
        const dx = (moveEvt.clientX - startX) / zoom;
        const dy = (moveEvt.clientY - startY) / zoom;

        if (pos.includes('e')) {
          target.style.width = `${Math.max(100, startWidth + dx)}px`;
        }
        if (pos.includes('w')) {
          target.style.width = `${Math.max(100, startWidth - dx)}px`;
        }
        if (pos.includes('s')) {
          const newH = Math.max(60, startHeight + dy);
          target.style.height = `${newH}px`;
          target.style.minHeight = `${newH}px`;
        }
        if (pos.includes('n')) {
          const newH = Math.max(60, startHeight - dy);
          target.style.height = `${newH}px`;
          target.style.minHeight = `${newH}px`;
        }

        const frame = target.querySelector('.image-frame-container');
        if (frame && (pos.includes('s') || pos.includes('n'))) {
          frame.style.height = `${Math.max(50, startHeight + dy - 30)}px`;
        }

        window.LayoutEngine?.autoReflowPages();
      };

      const onPointerUp = () => {
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.HistoryEngine?.pushState('Resize Card');
      };

      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    handle.addEventListener('mousedown', onPointerDown);
    handle.addEventListener('pointerdown', onPointerDown);
  },

  duplicateElement(explicitEl) {
    const el = explicitEl || window.CanvasEditor?.selectedElement || this.activeTarget;
    if (!el) return;

    window.HistoryEngine?.pushState('Duplicate Element');

    const clone = el.cloneNode(true);
    clone.querySelectorAll('.card-move-arrows-overlay, .transform-handle').forEach(o => o.remove());

    el.insertAdjacentElement('afterend', clone);
    window.CanvasEditor?.selectElement(clone);
    window.LayoutEngine?.autoReflowPages();
    this.hideMenu();
  },

  addSubcard() {
    const el = window.CanvasEditor?.selectedElement || this.activeTarget;
    if (!el) return;

    window.HistoryEngine?.pushState('Add Subcard');

    const subcardSelector = '.build-step-col, .mistake-row, .hero-item, .objective-cell, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .mistake-item, .objective-card, .step-card, .wiring-step-card, .sub-card, .in-card-subcard';
    if (!el.matches(subcardSelector)) {
      const btn = el.querySelector('.incard-add-btn') || el.querySelector('.incard-element-bar') || el;
      if (window.LayoutEngine?._addInCardSubcard) {
        window.LayoutEngine._addInCardSubcard(btn);
      }
      this.hideMenu();
      return;
    }

    const clone = el.cloneNode(true);
    clone.querySelectorAll('.card-move-arrows-overlay, .transform-handle').forEach(o => o.remove());

    clone.querySelectorAll('[contenteditable="true"]').forEach(txt => {
      if (txt.classList.contains('step-num-badge') || txt.classList.contains('obj-num-circle') || txt.classList.contains('step-number')) {
        const num = parseInt(txt.textContent) || 1;
        txt.textContent = num + 1;
      } else if (txt.classList.contains('step-title') || txt.classList.contains('hero-name')) {
        txt.textContent = 'New Step / Item';
      } else if (txt.classList.contains('step-desc') || txt.classList.contains('hero-quote')) {
        txt.textContent = 'Enter description...';
      }
    });

    el.insertAdjacentElement('afterend', clone);
    window.CanvasEditor?.selectElement(clone);
    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast('➕ New subcard step added!');
    this.hideMenu();
  },

  toggle8PointResize(explicitTarget) {
    const target = explicitTarget || window.CanvasEditor?.selectedElement || this.activeTarget;
    if (!target) return;

    window.HistoryEngine?.pushState('Toggle 8-Point Resize');

    const existingHandles = target.querySelectorAll('.transform-handle');
    if (existingHandles.length > 0) {
      existingHandles.forEach(h => h.remove());
      window.SaveEngine?._showToast('📐 8-Point Resize handles removed');
    } else {
      this.attachResizeHandles(target);
      window.SaveEngine?._showToast('📐 8-Point Resize handles active!');
    }
  },

  deleteElement(explicitEl) {
    let el = explicitEl || window.CanvasEditor?.selectedElement || this.activeTarget;
    if (!el) return;

    const SUBCARD_SELECTOR = '.build-step-col, .wiring-step-card, .step-card, .mistake-item, .mistake-row, .hero-item, .objective-cell, .objective-card, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .sub-card, .in-card-subcard, .incard-bullets-wrapper, .incard-text-wrapper, .incard-callout-wrapper, .incard-pair-wrapper, .incard-code-wrapper, .image-caption-capsule, .cover-mascot-wrapper, .badge-mascot, .badge-mascot-wrapper, .card-icon-badge, .cover-illustration-placeholder, .cover-header-banner, .mission-header-banner, .page-footer, .dynamic-bullet-item, .card-icon-img, .real-world-icon, .step-img-box, .industry-img-placeholder, .component-img-placeholder, .component-img-box, .obs-img-box, .observe-image-placeholder, .sensor-half, .beyond-step-icon, .hero-icon, .obj-icon, .mistake-icon-col, .capsule-icon, .card-icon, .footer-tip-label, .var-icon, .block-icon, .badge-icon, .incard-icon-box, .pin-sticker, .round-icon-badge';

    if (el.nodeType === 1) {
      const subTarget = el.closest(SUBCARD_SELECTOR);
      if (subTarget) {
        el = subTarget;
      } else {
        const parentCard = el.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .draggable-element, section');
        if (parentCard) el = parentCard;
      }
    }

    window.HistoryEngine?.pushState('Delete Element');
    if (el === window.CanvasEditor?.selectedElement) {
      window.CanvasEditor.deselectElement();
    }
    if (this.activeTarget === el) {
      this.activeTarget = null;
    }

    document.querySelectorAll('.card-move-arrows-overlay, .transform-handle').forEach(o => o.remove());

    el.remove();
    window.LayoutEngine?.autoReflowPages();
    this.hideMenu?.();
    window.SaveEngine?._showToast('🗑️ Element deleted!');
  },

  setTitleIcon(newIcon) {
    if (!this.activeTarget || !newIcon) return;
    const badge = this.activeTarget.querySelector('.round-icon-badge, .capsule-icon, .card-icon-badge');
    if (badge) {
      if (!badge.querySelector('img')) {
        badge.textContent = newIcon;
        window.SaveEngine?._showToast('🏷️ Icon updated!');
      }
    }
  },

  moveSubcard(dir) {
    const el = this.activeTarget || window.CanvasEditor?.selectedElement;
    if (!el) return;

    if (dir === 'left' || dir === 'up') {
      const prev = el.previousElementSibling;
      if (prev && !prev.classList.contains('card-move-arrows-overlay')) {
        prev.before(el);
        window.LayoutEngine?.autoReflowPages();
      }
    } else if (dir === 'right' || dir === 'down') {
      const next = el.nextElementSibling;
      if (next && !next.classList.contains('card-move-arrows-overlay')) {
        next.after(el);
        window.LayoutEngine?.autoReflowPages();
      }
    }
    window.CanvasEditor?.renderMoveArrows?.(el);
  },

  replaceTitleIconWithImage() {
    if (!this.activeTarget) return;
    const badge = this.activeTarget.querySelector('.round-icon-badge, .capsule-icon, .card-icon-badge');
    if (!badge) { alert('No title icon found on this card.'); return; }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        badge.innerHTML = `<img src="${evt.target.result}" class="card-icon-img"
          style="max-width:100%; max-height:160px; min-width:28px; min-height:28px; width:48px; height:48px; object-fit:contain; border-radius:8px; vertical-align:middle; display:inline-block; resize:both; overflow:auto; cursor:pointer;" title="Double-click to replace or resize" />`;
        window.SaveEngine?._showToast('🖼️ Title icon replaced with resizable card-fit image!');
        window.LayoutEngine?.autoReflowPages();
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  },

  uploadTitleBgImage() {
    if (!this.activeTarget) return;
    const capsule = this.activeTarget.querySelector('.capsule-header, .incard-bottom-capsule');
    if (!capsule) { alert('No title capsule found on this card.'); return; }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        capsule.style.backgroundImage = `url("${evt.target.result}")`;
        capsule.style.backgroundSize = 'cover';
        capsule.style.backgroundPosition = 'center';
        window.SaveEngine?._showToast('📷 Title capsule background image set!');
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  }
};
