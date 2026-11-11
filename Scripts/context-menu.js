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
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
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
        <span class="ctx-title">🎨 Style Inspector</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="ctx-btn-sm" style="background:#475569;" onclick="window.ContextMenu.resetTargetNodeStyles()" title="Reset Selected Styles">↺ Reset</button>
          <button class="ctx-btn-danger-sm" onclick="window.ContextMenu.deleteElement()" title="Delete Card">🗑️ Delete</button>
          <button class="ctx-close-btn" onclick="window.ContextMenu.hideMenu()">✕</button>
        </div>
      </div>

      <div class="ctx-category-tabs">
        <button type="button" class="ctx-cat-btn active" onclick="window.ContextMenu.filterCategory('all', this)">✨ All</button>
        <button type="button" class="ctx-cat-btn" onclick="window.ContextMenu.filterCategory('layout', this)">📐 Layout</button>
        <button type="button" class="ctx-cat-btn" onclick="window.ContextMenu.filterCategory('content', this)">📝 Text</button>
        <button type="button" class="ctx-cat-btn" onclick="window.ContextMenu.filterCategory('style', this)">🎨 Style</button>
        <button type="button" class="ctx-cat-btn" onclick="window.ContextMenu.filterCategory('media', this)">🖼️ Media</button>
      </div>

      <div class="ctx-body">
        <!-- ITEM 1: TARGET SELECTOR & MERGE/UNSTACK -->
        <div class="ctx-section" data-ctx-cat="layout">
          <div class="ctx-label">Target Selection &amp; Page Layout</div>
          <div class="ctx-row">
            <select id="ctx-target-mode" class="ctx-select" onchange="window.ContextMenu.setTargetMode(this.value)">
              <option id="ctx-opt-element" value="element">🎯 Clicked Sub-Element</option>
              <option value="whole">📦 Whole Card Container</option>
              <option value="title">🏷️ Card Title Capsule Only</option>
              <option value="body">📝 Card Body Text Only</option>
            </select>
          </div>
          <div class="ctx-row" style="margin-top:6px; gap:4px;">
            <button class="ctx-btn-action" style="flex:1; background:linear-gradient(135deg, #10B981, #059669);" onclick="window.ContextMenu.mergeSelectedSideBySide()">🔀 Merge Side-by-Side (2 Cols)</button>
            <button class="ctx-btn-action" style="flex:1; background:linear-gradient(135deg, #F59E0B, #D97706);" onclick="window.ContextMenu.unstackSelectedSplit()">🔓 Unstack (Full-Width)</button>
          </div>
        </div>

        <!-- ITEM 1A: IN-CARD SUB-ITEMS ADDER -->
        <div class="ctx-section" data-ctx-cat="content" style="background:rgba(37,99,235,0.06); border-color:#2563EB;">
          <div class="ctx-label" style="color:#60A5FA;">➕ Add In-Card Content</div>
          <div class="ctx-btn-grid" style="grid-template-columns: repeat(2, 1fr); gap:4px; margin-top:4px;">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.addInCardSubItem('step')" title="Add Procedure Step">▶ Add Step</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.addInCardSubItem('bullet')" title="Add Bullet Item">✔ Add Bullet</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.addInCardSubItem('paragraph')" title="Add Text Paragraph">📝 Add Text</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.addInCardSubItem('line')" title="Add Single Text Line">➖ Add Line</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.addInCardSubItem('table')" title="Add Interactive Table">📊 Add Table</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.addInCardSubItem('callout')" title="Add Engineering Tip">💡 Add Tip</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.addInCardSubItem('code')" title="Add Code Box">💻 Add Code</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.addInCardSubItem('image')" title="Add In-Card Image">🖼️ Add Image</button>
          </div>
        </div>

        <!-- ITEM 1D: BULLET LIST CONTROLS -->
        <div class="ctx-section" data-ctx-cat="content" id="ctx-bullet-controls-section" style="border-color:#3B82F6; background:rgba(59,130,246,0.05);">
          <div class="ctx-label" style="color:#60A5FA; display:flex; justify-content:space-between; align-items:center;">
            <span>📋 Bullet &amp; List Management</span>
          </div>
          <div class="ctx-row" style="gap:4px; margin-top:4px;">
            <button class="ctx-btn-sm" style="flex:1; background:#2563EB;" onclick="window.ContextMenu.toggleActiveBullet()" title="Add or remove bullet on selected line">✔ Toggle Line Bullet</button>
            <button class="ctx-btn-sm" style="flex:1; background:#059669;" onclick="window.ContextMenu.addBulletsToAll()" title="Convert all lines in card to bullets">➕ Add All</button>
            <button class="ctx-btn-sm" style="flex:1; background:#DC2626;" onclick="window.ContextMenu.removeBulletsFromAll()" title="Remove all bullets from card">✕ Remove All</button>
          </div>
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:6px; font-weight:700;">Bullet Icon Style:</div>
          <div class="ctx-row" style="gap:4px; margin-top:3px; flex-wrap:wrap;">
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setBulletStyle('✔')">✔ Check</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setBulletStyle('•')">• Dot</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setBulletStyle('⭐')">⭐ Star</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setBulletStyle('▶')">▶ Arrow</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setBulletStyle('num')">1. Num</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setBulletStyle('☑')">☑ Box</button>
          </div>
        </div>

        <!-- ITEM 1C: COMMANDER NOVA MASCOT POSE SELECTOR -->
        <div class="ctx-section" data-ctx-cat="media" style="border-color:#38BDF8; background:rgba(56, 189, 248, 0.05);">
          <div class="ctx-label" style="color:#38BDF8; display:flex; justify-content:space-between; align-items:center;">
            <span>🚀 Commander Nova Mascot</span>
            <span style="font-size:0.65rem; color:#94A3B8;">27 Poses</span>
          </div>
          <div class="ctx-row" style="margin-top:4px;">
            <button class="ctx-btn-action" style="flex:1; background:linear-gradient(135deg, #0284C7, #0369A1);" onclick="window.ContextMenu.changeNovaPose()">✨ Choose Nova Pose</button>
          </div>
        </div>

        <!-- ITEM 1B: LAYER ORDER & STACKING (BRING TO FRONT / BACK) -->
        <div class="ctx-section" data-ctx-cat="layout" style="border-color:rgba(0, 240, 255, 0.35); background:rgba(0, 240, 255, 0.03);">
          <div class="ctx-label" style="color:var(--accent-cyan); display:flex; justify-content:space-between;">
            <span>🔲 Layer Order &amp; Stacking</span>
          </div>
          <div class="ctx-row" style="gap:4px;">
            <button class="ctx-btn-sm" style="flex:1; background:#1E293B; border:1px solid rgba(0,240,255,0.3);" onclick="window.AILayoutTools?.adjustLayer('front');" title="Bring to Front (Highest Layer)">⬆⬆ Front</button>
            <button class="ctx-btn-sm" style="flex:1; background:#1E293B;" onclick="window.AILayoutTools?.adjustLayer('forward');" title="Bring Forward One Step">⬆ Forward</button>
            <button class="ctx-btn-sm" style="flex:1; background:#1E293B;" onclick="window.AILayoutTools?.adjustLayer('backward');" title="Send Backward One Step">⬇ Backward</button>
            <button class="ctx-btn-sm" style="flex:1; background:#1E293B; border:1px solid rgba(255,255,255,0.1);" onclick="window.AILayoutTools?.adjustLayer('back');" title="Send to Back (Lowest Layer)">⬇⬇ Back</button>
          </div>
        </div>

        <!-- ITEM 2: 4-SIDE MARGIN CONTROLLER (TOP, BOTTOM, RIGHT, LEFT) -->
        <div class="ctx-section" data-ctx-cat="layout" id="ctx-margin-controls" style="border-color:var(--accent-blue);">
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
                <input type="number" id="ctx-margin-top" value="0" min="-100" max="200" oninput="window.ContextMenu.set4SideMargin('Top', this.value, true)" />
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
                  <input type="number" id="ctx-margin-left" value="0" min="-100" max="200" oninput="window.ContextMenu.set4SideMargin('Left', this.value, true)" />
                  <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Left', 2)">+</button>
                </div>
              </div>

              <div class="ctx-margin-core-label">CARD</div>

              <div style="display:flex; align-items:center; gap:2px;">
                <span style="font-size:0.68rem; color:#94A3B8; font-weight:700;">R</span>
                <div class="ctx-margin-stepper">
                  <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Right', -2)">−</button>
                  <input type="number" id="ctx-margin-right" value="0" min="-100" max="200" oninput="window.ContextMenu.set4SideMargin('Right', this.value, true)" />
                  <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Right', 2)">+</button>
                </div>
              </div>
            </div>

            <!-- BOTTOM MARGIN -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.68rem; color:#94A3B8; font-weight:700; width:28px;">BOT</span>
              <div class="ctx-margin-stepper">
                <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Bottom', -2)">−</button>
                <input type="number" id="ctx-margin-bottom" value="12" min="-100" max="200" oninput="window.ContextMenu.set4SideMargin('Bottom', this.value, true)" />
                <button class="ctx-btn-step" onclick="window.ContextMenu.stepMargin('Bottom', 2)">+</button>
              </div>
              <span style="font-size:0.65rem; color:#64748B;">px</span>
            </div>
          </div>

          <!-- Quick Margin Presets -->
          <div style="font-size:0.66rem; color:#94A3B8; margin-top:6px; margin-bottom:3px; font-weight:700;">Margin Presets:</div>
          <div class="ctx-row" style="gap:4px; flex-wrap:wrap;">
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('shift-left-8')" title="Shift Left by -8px">⬅ -8px Left</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('shift-left-16')" title="Shift Left by -16px">⬅ -16px Left</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('reset')" title="0px margins on all sides">0px (Reset)</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('compact')" title="4px margins">4px Compact</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('normal')" title="8px margins">8px Standard</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('default')" title="Top/Left/Right: 0px, Bottom: 12px">12px Card Def</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('spacious')" title="16px margins">16px Spacious</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.applyMarginPreset('center')" title="Center horizontally (0 auto)">0 Auto (Center)</button>
          </div>
        </div>

        <!-- ITEM 2B: SPACE & LAYOUT OPTIMIZER (TRANSFORM, SHIFT, FLAT, DENSITY) -->
        <div class="ctx-section" data-ctx-cat="layout" id="ctx-space-optimizer" style="background:rgba(99, 102, 241, 0.06); border-color:#6366F1;">
          <div class="ctx-label" style="color:#818CF8; display:flex; justify-content:space-between; align-items:center;">
            <span>⚡ Space &amp; Layout Optimizer</span>
          </div>
          
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:2px; font-weight:700;">1. Shift Element Horizontally (Reclaim Left Space)</div>
          <div class="ctx-row" style="gap:4px; margin-top:3px;">
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.shiftActiveLeft(12)" title="Shift Left by 12px">⬅⬅ -12px</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.shiftActiveLeft(4)" title="Shift Left by 4px">⬅ -4px</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.resetActiveShift()" title="Reset horizontal shift">0 Reset</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.shiftActiveRight(4)" title="Shift Right by 4px">+4px ➡</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.shiftActiveRight(12)" title="Shift Right by 12px">+12px ➡➡</button>
          </div>

          <div style="font-size:0.68rem; color:#94A3B8; margin-top:8px; font-weight:700;">2. Box Density &amp; Style (Save Page Height)</div>
          <div class="ctx-row" style="gap:4px; margin-top:3px;">
            <button class="ctx-btn-sm" style="flex:1; background:#10B981;" onclick="window.ContextMenu.toggleActiveBoxStyle()" title="Remove box border, background, and padding">📄 Flat Style</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.setActiveDensity('tight')" title="Tight 4px padding">⚡ Tight</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.setActiveDensity('normal')" title="Standard padding">Normal</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.setActiveDensity('spacious')" title="Spacious padding">Spacious</button>
          </div>

          <div style="font-size:0.68rem; color:#94A3B8; margin-top:8px; font-weight:700;">3. Multi-Column Grid (Side-by-Side Flow)</div>
          <div class="ctx-row" style="gap:4px; margin-top:3px;">
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.toggleActiveColumns(1)">1 Col (Stack)</button>
            <button class="ctx-btn-sm" style="flex:1; background:#6366F1;" onclick="window.ContextMenu.toggleActiveColumns(2)">▦ 2 Columns</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.toggleActiveColumns(3)">▦ 3 Columns</button>
          </div>

          <div style="font-size:0.68rem; color:#94A3B8; margin-top:8px; font-weight:700;">4. Quick Font Size Scaling</div>
          <div class="ctx-row" style="gap:4px; margin-top:3px;">
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.adjustActiveFontSize(-1)">A− Smaller</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.adjustActiveFontSize(1)">A+ Larger</button>
          </div>
        </div>

        <!-- ITEM 3: SUBCARD ALIGNMENT & DISTRIBUTION (JUSTIFY SUBCARDS INSIDE) -->
        <div class="ctx-section" data-ctx-cat="layout" id="ctx-align-dist-controls" style="background:rgba(16, 185, 129, 0.06); border-color:#10B981;">
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
        <div class="ctx-section" data-ctx-cat="media" id="ctx-image-controls" style="display:none; background:rgba(0, 240, 255, 0.06); border-color:var(--accent-cyan);">
          <div class="ctx-label">🖼️ Image Controls &amp; Grid Layout</div>
          
          <!-- QUICK IMAGE ACTIONS -->
          <div class="ctx-row" style="gap:4px; margin-bottom:8px;">
            <button class="ctx-btn-action" style="flex:1; background:#00F0FF; color:#0F172A; font-weight:800;" onclick="window.ContextMenu.toggleBezelFreeMode()">🔳 Toggle Bezel-Free Pure Image</button>
            <button class="ctx-btn-action" style="flex:1; background:#0284C7;" onclick="window.ContextMenu.duplicateImageBox()">📋 Duplicate Image</button>
          </div>

          <!-- BORDER STYLE, SIZE & COLOR -->
          <div class="ctx-label" style="font-size:0.68rem; color:#94A3B8;">Custom Border (Pattern, Size &amp; Color)</div>
          <div class="ctx-row" style="gap:4px;">
            <select id="ctx-img-border-style" class="ctx-select" style="flex:1; font-size:0.75rem;" onchange="window.ContextMenu.setImageBorderStyle(this.value)">
              <option value="none">Pattern: None</option>
              <option value="solid">Pattern: Solid ───</option>
              <option value="dashed">Pattern: Dashed ---</option>
              <option value="dotted">Pattern: Dotted •••</option>
              <option value="double">Pattern: Double ═══</option>
              <option value="groove">Pattern: Groove</option>
              <option value="glow-dashed">✨ Cyber Glow (Dashed)</option>
              <option value="glow-dotted">✨ Cyber Glow (Dotted)</option>
              <option value="glow-solid">✨ Cyber Glow (Solid)</option>
            </select>
            <input type="color" id="ctx-img-border-color" value="#2563EB" style="width:34px; height:26px; border:none; cursor:pointer;" oninput="window.ContextMenu.setImageBorderColor(this.value)" title="Border Color" />
          </div>
          <div class="ctx-row" style="margin-top:4px;">
            <button class="ctx-btn-action" style="flex:1; background:linear-gradient(135deg, #0284C7, #00F0FF); color:#0F172A; font-weight:800; font-size:0.72rem; padding:5px 8px;" onclick="window.ContextMenu.applyCyberGlowBorder()">✨ Apply Cyan Neon Glow Border</button>
          </div>
          <div class="ctx-row" style="margin-top:4px; gap:6px; align-items:center;">
            <label style="font-size:0.72rem; color:#94A3B8;">Width:</label>
            <input type="range" id="ctx-img-border-width-range" min="0" max="20" value="0" style="flex:1;" oninput="window.ContextMenu.setImageBorderWidth(this.value)" />
            <input type="number" id="ctx-img-border-width-num" class="ctx-input-sm" min="0" max="20" value="0" style="width:44px;" oninput="window.ContextMenu.setImageBorderWidth(this.value)" />
          </div>

          <!-- ROUNDED CORNERS (BORDER RADIUS) -->
          <div class="ctx-label" style="font-size:0.68rem; color:#94A3B8; margin-top:8px;">Corner Roundness (Border Radius)</div>
          <div class="ctx-row" style="gap:4px;">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImageBorderRadius(0)">0px (Sharp)</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImageBorderRadius(6)">6px</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImageBorderRadius(12)">12px</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImageBorderRadius(20)">20px</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setImageBorderRadius(999)">Pill/Circle</button>
          </div>
          <div class="ctx-row" style="margin-top:4px; gap:6px; align-items:center;">
            <label style="font-size:0.72rem; color:#94A3B8;">Radius:</label>
            <input type="range" id="ctx-img-radius-slider" min="0" max="60" value="8" style="flex:1;" oninput="window.ContextMenu.setImageBorderRadius(this.value)" />
            <input type="number" id="ctx-img-radius-num" class="ctx-input-sm" min="0" max="200" value="8" style="width:44px;" oninput="window.ContextMenu.setImageBorderRadius(this.value)" />
          </div>

          <div class="ctx-label" style="font-size:0.68rem; color:#94A3B8; margin-top:8px;">Horizontal Multi-Image Grid (1 to 6 Inline Columns)</div>
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
        <div class="ctx-section" data-ctx-cat="style">
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
        <div class="ctx-section" data-ctx-cat="style" style="background:rgba(245,158,11,0.07); border-color:#F59E0B;">
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

        <!-- ITEM 6B: CAPSULE DIMENSIONS & ADJUSTMENTS (WIDTH & HEIGHT) -->
        <div class="ctx-section" data-ctx-cat="style" id="ctx-capsule-dimensions-section" style="border-color:#10B981; background:rgba(16,185,129,0.05);">
          <div class="ctx-label" style="color:#10B981; display:flex; justify-content:space-between; align-items:center;">
            <span>🏷️ Capsule Header Dimensions</span>
            <span style="font-size:0.65rem; color:#64748B;">No font scale</span>
          </div>
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:2px;">Width (px):</div>
          <div class="ctx-row" style="gap:4px; margin-top:2px; align-items:center;">
            <button class="ctx-btn-step" onclick="window.ContextMenu.stepCapsuleWidth(-10)">−</button>
            <input type="number" id="ctx-capsule-width-num" class="ctx-input-sm" style="flex:1;" value="180" min="60" max="800" oninput="window.ContextMenu.setCapsuleWidth(this.value)" />
            <button class="ctx-btn-step" onclick="window.ContextMenu.stepCapsuleWidth(10)">+</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setCapsuleWidth('auto')">Auto</button>
          </div>
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:6px;">Height (px):</div>
          <div class="ctx-row" style="gap:4px; margin-top:2px; align-items:center;">
            <button class="ctx-btn-step" onclick="window.ContextMenu.stepCapsuleHeight(-2)">−</button>
            <input type="number" id="ctx-capsule-height-num" class="ctx-input-sm" style="flex:1;" value="32" min="20" max="100" oninput="window.ContextMenu.setCapsuleHeight(this.value)" />
            <button class="ctx-btn-step" onclick="window.ContextMenu.stepCapsuleHeight(2)">+</button>
            <button class="ctx-pill-btn" onclick="window.ContextMenu.setCapsuleHeight('auto')">Auto</button>
          </div>
          <div class="ctx-row" style="margin-top:6px;">
            <button class="ctx-btn-action" style="flex:1; background:#475569;" onclick="window.ContextMenu.resetCapsuleDimensions()">↺ Reset Dimensions</button>
          </div>
        </div>

        <!-- ITEM 7: TEXT COLOR & GRADIENTS -->
        <div class="ctx-section" data-ctx-cat="content">
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
        <div class="ctx-section" data-ctx-cat="content">
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

        <!-- ITEM 9: ROTATION & ORIENTATION -->
        <div class="ctx-section" data-ctx-cat="style" id="ctx-rotation-section">
          <div class="ctx-label">🔄 360° Free Rotation &amp; Flip</div>
          <div class="ctx-row" style="gap:4px;">
            <button class="ctx-btn-sm" onclick="window.ContextMenu.rotateElementBy(-90)">⟲ -90°</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.rotateElementBy(-15)">↺ -15°</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.setElementRotation(0)">0° Reset</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.rotateElementBy(15)">↻ +15°</button>
            <button class="ctx-btn-sm" onclick="window.ContextMenu.rotateElementBy(90)">⟳ +90°</button>
          </div>
          <div class="ctx-row" style="margin-top:4px; gap:6px; align-items:center;">
            <label style="font-size:0.72rem; color:#94A3B8;">Angle:</label>
            <input type="range" id="ctx-rotate-slider" min="-180" max="180" value="0" style="flex:1;" oninput="window.ContextMenu.setElementRotation(this.value)" />
            <span id="ctx-rotate-label" style="font-size:0.75rem; color:#64748B; width:38px; text-align:right;">0°</span>
          </div>
          <div class="ctx-row" style="margin-top:4px; gap:4px;">
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.flipElement('h')">↔️ Flip Horizontal</button>
            <button class="ctx-btn-sm" style="flex:1;" onclick="window.ContextMenu.flipElement('v')">↕️ Flip Vertical</button>
          </div>
        </div>

        <!-- ITEM 10: CARD TRANSFORM & ACTIONS -->
        <div class="ctx-section" data-ctx-cat="layout">
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

  filterCategory(cat, btnEl) {
    const menu = document.getElementById('ultraminds-context-menu');
    if (!menu) return;
    menu.querySelectorAll('.ctx-cat-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    menu.querySelectorAll('.ctx-section').forEach(sec => {
      if (cat === 'all' || sec.dataset.ctxCat === cat) {
        sec.classList.remove('ctx-section-hidden-tab');
      } else {
        sec.classList.add('ctx-section-hidden-tab');
      }
    });
  },

  toggleTopFormatBar() {
    const dock = document.getElementById('floating-studio-dock');
    if (dock) {
      dock.classList.toggle('dock-hidden');
      const hidden = dock.classList.contains('dock-hidden');
      window.SaveEngine?._showToast(hidden ? '🎛️ Bottom dock hidden' : '🎛️ Bottom dock visible');
    }
  },

  bindEvents() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    // Comprehensive Right-Click Context Menu Listener
    const SUBCARD_SELECTOR = '.procedure-step-item, .dynamic-paragraph-wrapper, .illustration-slot-box, .um-callout-box, .safety-box, .pro-tip-box, .assessment-q-card, .code-box, .dynamic-table-wrapper, .um-kv-badge, .footer-code-pill-wrapper, .footer-next-zone, .footer-brand-wrapper, .footer-tip-zone, .footer-fact-zone, .build-step-col, .wiring-step-card, .step-card, .mistake-item, .mistake-row, .hero-item, .objective-cell, .objective-card, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .sub-card, .in-card-subcard, .incard-bullets-wrapper, .incard-text-wrapper, .incard-callout-wrapper, .incard-pair-wrapper, .incard-code-wrapper, .image-caption-capsule, .cover-mascot-wrapper, .badge-mascot, .badge-mascot-wrapper, .card-icon-badge, .cover-illustration-placeholder, .cover-header-banner, .mission-header-banner, .dynamic-bullet-item, .card-icon-img, .real-world-icon, .step-img-box, .industry-img-placeholder, .component-img-placeholder, .component-img-box, .obs-img-box, .observe-image-placeholder, .sensor-half, .beyond-step-icon, .hero-icon, .obj-icon, .mistake-icon-col, .capsule-icon, .card-icon, .footer-tip-label, .var-icon, .block-icon, .badge-icon, .incard-icon-box, .pin-sticker, .round-icon-badge, .cca-options-pill-box, .answer-key-ribbon-box, .incard-text-line-wrapper';
    const CARD_SELECTOR = '.page-footer, .pure-image-holder-card, .floating-clipart-sticker, .card-base, .concept-card, .code-snippet-card, .lab-step, .objective-card, .mission-header-banner, .space-filler-card, .image-holder-card, .incard-image-box, .cover-header-banner, .mission-story-card, .real-world-card, .curiosity-box-card, .stem-fact-card, .mission-objectives-card, .think-engineer-card, .draggable-element, section';

    canvas.addEventListener('contextmenu', (e) => {
      const subcard = e.target.closest(SUBCARD_SELECTOR);
      const card = e.target.closest(CARD_SELECTOR);
      const textEl = e.target.closest('p, h1, h2, h3, h4, h5, h6, span, li, code, a, b, strong, em, td, th, .step-text, .bullet-text, .callout-text, .dynamic-paragraph, .worksheet-question, .footer-code-pill');

      if (subcard) {
        e.preventDefault();
        this.showMenu(e, subcard, textEl || e.target);
      } else if (card) {
        e.preventDefault();
        this.showMenu(e, card, textEl || e.target);
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideMenu();
      }
    });
  },

  showMenu(e, target, subTarget = null) {
    if (!target) return;
    this.activeTarget = target;
    this.activeSubTarget = subTarget || (e ? e.target : null);
    window.CanvasEditor?.selectElement(target);

    const menu = document.getElementById('ultraminds-context-menu');
    if (!menu) return;

    // Default target mode to 'element' if a specific sub-element was clicked!
    const targetSelect = document.getElementById('ctx-target-mode');
    if (this.activeSubTarget && this.activeSubTarget !== target) {
      const tag = this.activeSubTarget.tagName ? this.activeSubTarget.tagName.toLowerCase() : 'element';
      const elOption = document.getElementById('ctx-opt-element');
      if (elOption) {
        elOption.textContent = `🎯 Clicked Element (<${tag}>)`;
      }
      this.targetMode = 'element';
      if (targetSelect) targetSelect.value = 'element';
    } else {
      this.targetMode = 'whole';
      if (targetSelect) targetSelect.value = 'whole';
    }

    this.syncFormValues(target);
    menu.classList.add('show-ctx');
    const ctxBody = menu.querySelector('.ctx-body');
    if (ctxBody) ctxBody.scrollTop = 0;
  },

  hideMenu() {
    const menu = document.getElementById('ultraminds-context-menu');
    if (menu) menu.classList.remove('show-ctx');
  },

  setTargetMode(mode) {
    this.targetMode = mode;
    this.syncFormValues(this.activeTarget);
  },

  getTargetNode() {
    if (this.targetMode === 'element' && this.activeSubTarget) {
      return this.activeSubTarget;
    }
    if (!this.activeTarget) return this.activeSubTarget || null;
    if (this.targetMode === 'title') {
      return this.activeTarget.querySelector('.capsule-header, .incard-bottom-capsule, .card-title-text, h1, h2, h3, h4, .header-titles') || this.activeTarget;
    }
    if (this.targetMode === 'body') {
      return this.activeTarget.querySelector('.card-body-text, p, code, .step-instruction, .step-text') || this.activeTarget;
    }
    return this.activeTarget;
  },

  rgbToHex(rgbStr) {
    if (!rgbStr) return null;
    if (rgbStr.startsWith('#')) return rgbStr;
    const match = rgbStr.match(/\d+/g);
    if (!match || match.length < 3) return null;
    const [r, g, b] = match.map(Number);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  addInCardSubItem(type) {
    if (!this.activeTarget) return;
    window.LayoutEngine?.addInCardItem(this.activeTarget, type);
  },

  syncFormValues(target) {
    if (!target) return;

    // 1. Sync 4-Side Margins (Exempt footer: footer goes full page width)
    const marginSection = document.getElementById('ctx-margin-controls');
    const isFooter = target.classList?.contains('page-footer') || target.closest?.('.page-footer');
    if (marginSection) {
      marginSection.style.display = isFooter ? 'none' : 'block';
    }

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
                        target.classList.contains('pure-image-holder-card') ||
                        target.classList.contains('floating-clipart-sticker') ||
                        target.querySelector('img.holder-img, img.clipart-img, .image-frame-container');
      imgControls.style.display = isImgCard ? 'block' : 'none';

      if (isImgCard) {
        const frame = target.querySelector('.image-frame-container') || target;
        const comp = window.getComputedStyle(frame);
        
        const bStyle = frame.style.borderStyle || comp.borderStyle || 'none';
        const bWidth = parseInt(frame.style.borderWidth) || parseInt(comp.borderWidth) || 0;
        const bRadius = parseInt(frame.style.borderRadius) || parseInt(comp.borderRadius) || 0;
        const bColor = this.rgbToHex(frame.style.borderColor || comp.borderColor) || '#2563EB';

        const selStyle = document.getElementById('ctx-img-border-style');
        const rangeWidth = document.getElementById('ctx-img-border-width-range');
        const numWidth = document.getElementById('ctx-img-border-width-num');
        const colorPicker = document.getElementById('ctx-img-border-color');
        const sliderRadius = document.getElementById('ctx-img-radius-slider');
        const numRadius = document.getElementById('ctx-img-radius-num');

        if (selStyle) selStyle.value = bStyle.includes('none') ? 'none' : bStyle;
        if (rangeWidth) rangeWidth.value = bWidth;
        if (numWidth) numWidth.value = bWidth;
        if (colorPicker) colorPicker.value = bColor;
        if (sliderRadius) sliderRadius.value = bRadius;
        if (numRadius) numRadius.value = bRadius;
      }
    }

    // 3b. Sync Rotation Values
    const rot = parseInt(target.dataset.rotation) || 0;
    const rotSlider = document.getElementById('ctx-rotate-slider');
    const rotLabel = document.getElementById('ctx-rotate-label');
    if (rotSlider) rotSlider.value = rot;
    if (rotLabel) rotLabel.textContent = `${rot}°`;

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

      const color = node.style.color || nodeComputed.color;
      const hexColor = this.rgbToHex(color);
      if (hexColor) {
        const wheel = document.getElementById('ctx-text-color-wheel');
        const code = document.getElementById('ctx-text-color-code');
        if (wheel) wheel.value = hexColor;
        if (code) code.value = hexColor;
      }
    }

    // 6. Sync Capsule Dimensions (if targeting capsule or card with capsule)
    const capsule = target.closest?.('.capsule-header') || target.querySelector?.('.capsule-header');
    const capWidthInput = document.getElementById('ctx-capsule-width-num');
    const capHeightInput = document.getElementById('ctx-capsule-height-num');
    if (capsule) {
      if (capWidthInput) capWidthInput.value = capsule.offsetWidth || 180;
      if (capHeightInput) capHeightInput.value = capsule.offsetHeight || 32;
    }
  },

  // ─────────────────────────────────────────────────
  // 4-SIDE MARGIN CONTROLLER (TOP, BOTTOM, RIGHT, LEFT)
  // ─────────────────────────────────────────────────
  set4SideMargin(side, pxVal, fromUser = false) {
    const target = this.getTargetNode() || this.activeTarget;
    if (!target) return;
    if (target.classList?.contains('page-footer') || target.closest?.('.page-footer')) {
      window.SaveEngine?._showToast('ℹ️ Footer is edge-to-edge full width. Use 8-point handles to resize.');
      return;
    }
    const num = Math.max(-100, Math.min(300, parseFloat(pxVal) || 0));

    if (this.marginsLinked) {
      ['Top', 'Right', 'Bottom', 'Left'].forEach(s => {
        target.style[`margin${s}`] = `${num}px`;
        const input = document.getElementById(`ctx-margin-${s.toLowerCase()}`);
        if (input) input.value = num;
      });
    } else {
      target.style[`margin${side}`] = `${num}px`;
      const input = document.getElementById(`ctx-margin-${side.toLowerCase()}`);
      if (input) input.value = num;
    }

    window.LayoutEngine?.autoReflowPages();
    if (fromUser) {
      window.HistoryEngine?.pushState(`Set ${side} Margin to ${num}px`);
    }
  },

  stepMargin(side, delta) {
    const target = this.getTargetNode() || this.activeTarget;
    if (!target) return;
    const input = document.getElementById(`ctx-margin-${side.toLowerCase()}`);
    const current = parseFloat(input?.value) || 0;
    const nextVal = Math.max(-100, Math.min(300, current + delta));
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
    const target = this.getTargetNode() || this.activeTarget;
    if (!target) return;
    window.HistoryEngine?.pushState(`Apply Margin Preset: ${preset}`);

    if (preset === 'reset') {
      ['Top', 'Right', 'Bottom', 'Left'].forEach(s => this.set4SideMargin(s, 0));
    } else if (preset === 'shift-left-8') {
      this.set4SideMargin('Left', -8);
    } else if (preset === 'shift-left-16') {
      this.set4SideMargin('Left', -16);
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
      target.style.marginLeft = 'auto';
      target.style.marginRight = 'auto';
      target.style.marginTop = '0px';
      target.style.marginBottom = '12px';
      const elTop = document.getElementById('ctx-margin-top');
      const elBottom = document.getElementById('ctx-margin-bottom');
      if (elTop) elTop.value = 0;
      if (elBottom) elBottom.value = 12;
      window.SaveEngine?._showToast('📐 Element centered horizontally!');
    }

    window.LayoutEngine?.autoReflowPages();
  },

  // ─────────────────────────────────────────────────
  // SPACE & LAYOUT OPTIMIZER ACTIONS
  // ─────────────────────────────────────────────────
  shiftActiveLeft(px = 6) {
    const target = this.getTargetNode() || this.activeTarget;
    if (!target) return;
    window.HistoryEngine?.pushState(`Shift Left -${px}px`);
    const cur = parseFloat(target.style.marginLeft) || 0;
    const next = cur - px;
    target.style.marginLeft = `${next}px`;
    const input = document.getElementById('ctx-margin-left');
    if (input) input.value = next;
    window.SaveEngine?._showToast(`⬅ Shifted Left (${next}px)`);
    window.LayoutEngine?.autoReflowPages();
  },

  shiftActiveRight(px = 6) {
    const target = this.getTargetNode() || this.activeTarget;
    if (!target) return;
    window.HistoryEngine?.pushState(`Shift Right +${px}px`);
    const cur = parseFloat(target.style.marginLeft) || 0;
    const next = cur + px;
    target.style.marginLeft = `${next}px`;
    const input = document.getElementById('ctx-margin-left');
    if (input) input.value = next;
    window.SaveEngine?._showToast(`➡ Shifted Right (${next}px)`);
    window.LayoutEngine?.autoReflowPages();
  },

  resetActiveShift() {
    const target = this.getTargetNode() || this.activeTarget;
    if (!target) return;
    window.HistoryEngine?.pushState('Reset Shift');
    target.style.marginLeft = '0px';
    const input = document.getElementById('ctx-margin-left');
    if (input) input.value = 0;
    window.SaveEngine?._showToast('↺ Horizontal Shift Reset');
    window.LayoutEngine?.autoReflowPages();
  },

  toggleActiveBoxStyle() {
    const target = this.getTargetNode() || this.activeTarget;
    if (!target) return;
    window.LayoutEngine?.toggleItemBoxStyle(target);
  },

  setActiveDensity(mode) {
    const card = (this.activeTarget && this.activeTarget.closest ? this.activeTarget.closest('.card-base, .concept-card, .code-snippet-card, .draggable-element, section') : null) || this.activeTarget;
    if (!card) return;
    window.HistoryEngine?.pushState(`Set Density: ${mode}`);
    card.classList.remove('density-tight', 'density-spacious');
    if (mode === 'tight') card.classList.add('density-tight');
    else if (mode === 'spacious') card.classList.add('density-spacious');
    window.SaveEngine?._showToast(`📐 Density set to ${mode.toUpperCase()}`);
    window.LayoutEngine?.autoReflowPages();
  },

  toggleActiveColumns(numCols) {
    const card = (this.activeTarget && this.activeTarget.closest ? this.activeTarget.closest('.card-base, .concept-card, .code-snippet-card, .draggable-element, section') : null) || this.activeTarget;
    if (!card) return;
    window.HistoryEngine?.pushState(`Set Columns: ${numCols}`);
    const body = card.querySelector('.card-body-text, .in-card-stack, .subcard-container') || card;
    if (numCols === 1) {
      card.classList.remove('grid-2col');
      body.style.display = '';
      body.style.gridTemplateColumns = '';
      window.SaveEngine?._showToast('⬇ Stack (1 Col) set');
    } else {
      card.classList.add('grid-2col');
      body.style.display = 'grid';
      body.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
      body.style.gap = '8px 12px';
      window.SaveEngine?._showToast(`▦ ${numCols} Columns Grid set`);
    }
    window.LayoutEngine?.autoReflowPages();
  },

  adjustActiveFontSize(delta) {
    const target = this.getTargetNode() || this.activeTarget;
    if (!target) return;
    window.HistoryEngine?.pushState(`Adjust Font Size: ${delta}`);
    const textNodes = target.querySelectorAll ? target.querySelectorAll('.step-text, .bullet-text, .callout-text, .pro-tip-text, .dynamic-paragraph, p, span, li') : [];
    if (textNodes.length > 0) {
      textNodes.forEach(tn => {
        const cur = parseFloat(window.getComputedStyle(tn).fontSize) || 13;
        tn.style.fontSize = `${Math.max(9, Math.min(24, cur + delta))}px`;
      });
    } else {
      const cur = parseFloat(window.getComputedStyle(target).fontSize) || 13;
      target.style.fontSize = `${Math.max(9, Math.min(24, cur + delta))}px`;
    }
    window.SaveEngine?._showToast(`🔤 Font Size: ${delta > 0 ? '+' : ''}${delta}px`);
    window.LayoutEngine?.autoReflowPages();
  },

  // ─────────────────────────────────────────────────
  // SUBCARD ALIGNMENT & DISTRIBUTION ENGINE
  // ─────────────────────────────────────────────────
  getSubcardContainer(target) {
    if (!target) target = this.activeTarget || window.CanvasEditor?.selectedElement;
    if (!target) return null;

    const SUBCARD_SELECTOR = '.procedure-step-item, .dynamic-paragraph-wrapper, .illustration-slot-box, .um-callout-box, .safety-box, .pro-tip-box, .assessment-q-card, .code-box, .dynamic-table-wrapper, .um-kv-badge, .footer-code-pill-wrapper, .footer-next-zone, .footer-brand-wrapper, .build-step-col, .wiring-step-card, .step-card, .mistake-item, .mistake-row, .hero-item, .objective-cell, .objective-card, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .sub-card, .in-card-subcard, .incard-bullets-wrapper, .incard-text-wrapper, .incard-callout-wrapper, .incard-pair-wrapper, .incard-code-wrapper, .image-caption-capsule, .cover-mascot-wrapper, .badge-mascot, .badge-mascot-wrapper, .card-icon-badge, .cover-illustration-placeholder, .cover-header-banner, .mission-header-banner, .dynamic-bullet-item, .card-icon-img, .real-world-icon, .step-img-box, .industry-img-placeholder, .component-img-placeholder, .component-img-box, .obs-img-box, .observe-image-placeholder, .sensor-half, .beyond-step-icon, .hero-icon, .obj-icon, .mistake-icon-col, .capsule-icon, .card-icon, .footer-tip-label, .var-icon, .block-icon, .badge-icon, .incard-icon-box, .pin-sticker, .round-icon-badge, .cca-options-pill-box, .answer-key-ribbon-box, .incard-text-line-wrapper';

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

    const SUBCARD_SELECTOR = '.procedure-step-item, .dynamic-paragraph-wrapper, .illustration-slot-box, .um-callout-box, .safety-box, .pro-tip-box, .assessment-q-card, .code-box, .dynamic-table-wrapper, .um-kv-badge, .footer-code-pill-wrapper, .footer-next-zone, .footer-brand-wrapper, .build-step-col, .wiring-step-card, .step-card, .mistake-item, .mistake-row, .hero-item, .objective-cell, .objective-card, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .sub-card, .in-card-subcard, .incard-bullets-wrapper, .incard-text-wrapper, .incard-callout-wrapper, .incard-pair-wrapper, .incard-code-wrapper, .image-caption-capsule, .cover-mascot-wrapper, .badge-mascot, .badge-mascot-wrapper, .card-icon-badge, .cover-illustration-placeholder, .cover-header-banner, .mission-header-banner, .dynamic-bullet-item, .card-icon-img, .real-world-icon, .step-img-box, .industry-img-placeholder, .component-img-placeholder, .component-img-box, .obs-img-box, .observe-image-placeholder, .sensor-half, .beyond-step-icon, .hero-icon, .obj-icon, .mistake-icon-col, .capsule-icon, .card-icon, .footer-tip-label, .var-icon, .block-icon, .badge-icon, .incard-icon-box, .pin-sticker, .round-icon-badge, .cca-options-pill-box, .answer-key-ribbon-box, .incard-text-line-wrapper';
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
      window.SaveEngine?._showToast("ℹ️ Please select a card that has another card below it to merge side-by-side!");
    }
  },

  unstackSelectedSplit() {
    if (!this.activeTarget) return;
    const splitEl = this.activeTarget.closest('.split-layout');
    if (splitEl) {
      window.LayoutEngine?.unstackSplitLayout(splitEl);
      this.hideMenu();
    } else {
      window.SaveEngine?._showToast("ℹ️ This card is already a full-width standalone card!");
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

  changeNovaPose() {
    if (!window.NovaPoseEngine) return;
    const target = this.getTargetNode() || this.activeTarget;
    if (!target) return;

    window.NovaPoseEngine.openPosePicker((poseUrl) => {
      window.HistoryEngine?.pushState('Change Nova Mascot Pose');
      let img = target.tagName === 'IMG' ? target : target.querySelector('img');
      if (img) {
        img.src = poseUrl;
      } else if (target.classList?.contains('cover-mascot-wrapper') || target.classList?.contains('badge-mascot') || target.classList?.contains('floating-clipart-sticker')) {
        target.innerHTML = `<img src="${poseUrl}" style="width:100%; height:100%; object-fit:contain;" />`;
      } else {
        let header = target.querySelector('.capsule-header') || target;
        let existing = header.querySelector('.capsule-mascot-companion');
        if (existing) {
          const companionImg = existing.querySelector('img');
          if (companionImg) companionImg.src = poseUrl;
        } else {
          const comp = document.createElement('span');
          comp.className = 'capsule-mascot-companion';
          comp.style.cssText = 'margin-left:auto; display:inline-flex; align-items:center; gap:4px; cursor:pointer;';
          comp.title = 'Commander Nova Companion (Double-click to change)';
          comp.ondblclick = (e) => { e.stopPropagation(); window.NovaPoseEngine.openPosePicker((p) => { comp.querySelector('img').src = p; }); };
          comp.innerHTML = `<img src="${poseUrl}" style="width:30px; height:30px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25)); vertical-align:middle;" /><button class="mascot-del-btn" onclick="event.stopPropagation(); this.closest('.capsule-mascot-companion').remove(); window.LayoutEngine?.autoReflowPages();" title="Remove Mascot" style="background:rgba(239,68,68,0.85);color:#fff;border:none;border-radius:50%;width:16px;height:16px;font-size:10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;line-height:1;">✕</button>`;
          header.appendChild(comp);
        }
      }
      window.SaveEngine?._showToast('✨ Commander Nova pose updated!');
      window.LayoutEngine?.autoReflowPages();
    });
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

    // If there is an active selection in the editor, also style the selected text!
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim()) {
      window.InCardDesigner?.applyTextColor(color);
    }

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
  },

  clearTextGradientOnNode(n) {
    if (!n) return;
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
  },

  setFontSize(sizePx) {
    const node = this.getTargetNode();
    if (!node) return;
    node.style.fontSize = `${sizePx}px`;
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
      handle.setAttribute('draggable', 'false');
      target.appendChild(handle);
      this.bindHandleDrag(handle, target);
    });

    // Add visual rotation handle for free 360 degree rotation
    const rotateHandle = document.createElement('div');
    rotateHandle.className = 'transform-handle handle-rotate';
    rotateHandle.title = 'Drag to rotate element';
    rotateHandle.innerHTML = '⟳';
    rotateHandle.setAttribute('draggable', 'false');
    target.appendChild(rotateHandle);
    this.bindRotateHandleDrag(rotateHandle, target);
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

      let hasResized = false;
      document.body.style.cursor = getComputedStyle(handle).cursor || 'nwse-resize';
      document.body.style.userSelect = 'none';

      const onPointerMove = (moveEvt) => {
        if (moveEvt.buttons === 0) {
          onPointerUp();
          return;
        }
        const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-zoom')) || 0.75;
        const dx = (moveEvt.clientX - startX) / zoom;
        const dy = (moveEvt.clientY - startY) / zoom;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) hasResized = true;

        // Specific handling for footer pinned to bottom: 0
        if (target.classList.contains('page-footer')) {
          if (pos.includes('n')) {
            const newH = Math.max(32, startHeight - dy);
            target.style.height = `${newH}px`;
            target.style.minHeight = `${newH}px`;
          }
          if (pos.includes('s')) {
            const newH = Math.max(32, startHeight + dy);
            target.style.height = `${newH}px`;
            target.style.minHeight = `${newH}px`;
          }
          if (pos.includes('e')) {
            target.style.width = `${Math.max(200, startWidth + dx)}px`;
          }
          if (pos.includes('w')) {
            target.style.width = `${Math.max(200, startWidth - dx)}px`;
          }
          return;
        }

        if (pos.includes('e')) {
          target.style.width = `${Math.max(50, startWidth + dx)}px`;
        }
        if (pos.includes('w')) {
          target.style.width = `${Math.max(50, startWidth - dx)}px`;
        }
        if (pos.includes('s')) {
          const newH = Math.max(40, startHeight + dy);
          target.style.height = `${newH}px`;
          target.style.minHeight = `${newH}px`;
        }
        if (pos.includes('n')) {
          const newH = Math.max(40, startHeight - dy);
          target.style.height = `${newH}px`;
          target.style.minHeight = `${newH}px`;
        }

        const frame = target.querySelector('.image-frame-container');
        if (frame && (pos.includes('s') || pos.includes('n'))) {
          const subH = target.classList.contains('bezel-free-pure-image') || target.classList.contains('pure-image-holder-card') ? 0 : 30;
          frame.style.height = `${Math.max(40, target.offsetHeight - subH)}px`;
        }
      };

      const onPointerUp = () => {
        window.removeEventListener('mousemove', onPointerMove, { capture: true });
        window.removeEventListener('mouseup', onPointerUp, { capture: true });
        window.removeEventListener('pointermove', onPointerMove, { capture: true });
        window.removeEventListener('pointerup', onPointerUp, { capture: true });
        window.removeEventListener('pointercancel', onPointerUp, { capture: true });
        window.removeEventListener('blur', onPointerUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        if (hasResized) {
          try {
            window.HistoryEngine?.pushState('Resize Card');
            window.LayoutEngine?.autoReflowPages();
          } catch (err) {
            console.warn('Handle resize reflow error:', err);
          }
        }
      };

      window.addEventListener('mousemove', onPointerMove, { capture: true });
      window.addEventListener('mouseup', onPointerUp, { capture: true });
      window.addEventListener('pointermove', onPointerMove, { capture: true });
      window.addEventListener('pointerup', onPointerUp, { capture: true });
      window.addEventListener('pointercancel', onPointerUp, { capture: true });
      window.addEventListener('blur', onPointerUp);
    };

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

  duplicateImageBox() {
    const target = this.activeTarget?.closest('.pure-image-holder-card, .incard-image-box, .image-holder-card, .floating-clipart-sticker') || this.activeTarget;
    if (!target) {
      window.SaveEngine?._showToast("ℹ️ Please select an image box to duplicate!");
      return;
    }
    window.HistoryEngine?.pushState('Duplicate Image Box');
    const clone = target.cloneNode(true);
    clone.querySelectorAll('.transform-handle, .card-move-arrows-overlay').forEach(el => el.remove());
    clone.classList.remove('selected-card', 'transform-handles-active');

    if (target.classList.contains('floating-clipart-sticker')) {
      const curL = parseFloat(target.style.left) || 50;
      const curT = parseFloat(target.style.top) || 50;
      clone.style.left = `${curL + 20}px`;
      clone.style.top = `${curT + 20}px`;
      target.parentElement.appendChild(clone);
    } else {
      target.insertAdjacentElement('afterend', clone);
    }
    window.CanvasEditor?.selectElement(clone);
    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast("📋 Image box duplicated!");
  },

  toggleBezelFreeMode() {
    const box = this.activeTarget?.closest('.pure-image-holder-card, .incard-image-box, .image-holder-card') || this.activeTarget;
    if (!box) return;
    window.HistoryEngine?.pushState('Toggle Bezel-Free Mode');
    const isBezelFree = box.classList.toggle('bezel-free-pure-image');
    box.dataset.bezelFree = isBezelFree ? 'true' : 'false';

    const bottomCapsule = box.querySelector('.incard-bottom-capsule, .card-caption-text');
    if (bottomCapsule) {
      bottomCapsule.style.display = isBezelFree ? 'none' : 'block';
    }

    if (isBezelFree) {
      box.style.border = 'none';
      box.style.background = 'transparent';
      box.style.boxShadow = 'none';
      box.style.padding = '0';
    } else {
      box.style.border = '1.5px solid #CBD5E1';
      box.style.background = '#FFFFFF';
      box.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    }

    window.LayoutEngine?.autoReflowPages();
    window.SaveEngine?._showToast(isBezelFree ? '🖼️ Bezel-Free Pure Image Enabled' : '🖼️ Standard Bordered Card Restored');
  },

  setImageBorderStyle(style) {
    const target = (this.activeTarget?.closest ? this.activeTarget.closest('.pure-image-holder-card, .incard-image-box, .image-holder-card, .floating-clipart-sticker, .cover-mascot-wrapper, .card-base, section') : null) || this.activeTarget;
    if (!target) return;
    const frame = target.querySelector('.image-frame-container') || target;

    if (style === 'glow-dotted' || style === 'glow-dashed' || style === 'glow-solid') {
      const bPattern = style === 'glow-dotted' ? 'dotted' : (style === 'glow-dashed' ? 'dashed' : 'solid');
      frame.style.border = `2.5px ${bPattern} #00F0FF`;
      frame.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.55)';
      frame.dataset.borderStyle = style;
      window.SaveEngine?._showToast('✨ Cyan Neon Glow Border Applied!');
      window.HistoryEngine?.pushState(`Set Cyber Glow Border: ${style}`);
      return;
    }

    frame.style.borderStyle = style;
    frame.style.boxShadow = '';
    delete frame.dataset.borderStyle;
    if (style !== 'none' && (!frame.style.borderWidth || parseInt(frame.style.borderWidth) === 0)) {
      frame.style.borderWidth = '2px';
      const range = document.getElementById('ctx-img-border-width-range');
      const num = document.getElementById('ctx-img-border-width-num');
      if (range) range.value = 2;
      if (num) num.value = 2;
    }
    window.HistoryEngine?.pushState(`Set Border Style: ${style}`);
  },

  applyCyberGlowBorder() {
    this.setImageBorderStyle('glow-dashed');
  },

  setImageBorderWidth(widthPx) {
    const target = this.activeTarget?.closest('.pure-image-holder-card, .incard-image-box, .image-holder-card, .floating-clipart-sticker') || this.activeTarget;
    if (!target) return;
    const w = Math.max(0, parseInt(widthPx) || 0);
    const frame = target.querySelector('.image-frame-container') || target;
    frame.style.borderWidth = `${w}px`;
    if (w > 0 && (!frame.style.borderStyle || frame.style.borderStyle === 'none')) {
      frame.style.borderStyle = 'solid';
      const sel = document.getElementById('ctx-img-border-style');
      if (sel) sel.value = 'solid';
    } else if (w === 0) {
      frame.style.borderStyle = 'none';
      const sel = document.getElementById('ctx-img-border-style');
      if (sel) sel.value = 'none';
    }
    const range = document.getElementById('ctx-img-border-width-range');
    const num = document.getElementById('ctx-img-border-width-num');
    if (range) range.value = w;
    if (num) num.value = w;
    window.HistoryEngine?.pushState(`Set Border Width: ${w}px`);
  },

  setImageBorderColor(colorHex) {
    const target = this.activeTarget?.closest('.pure-image-holder-card, .incard-image-box, .image-holder-card, .floating-clipart-sticker') || this.activeTarget;
    if (!target) return;
    const frame = target.querySelector('.image-frame-container') || target;
    frame.style.borderColor = colorHex;
    window.HistoryEngine?.pushState(`Set Border Color: ${colorHex}`);
  },

  setImageBorderRadius(radiusPx) {
    const target = this.activeTarget?.closest('.pure-image-holder-card, .incard-image-box, .image-holder-card, .floating-clipart-sticker') || this.activeTarget;
    if (!target) return;
    const rVal = radiusPx === 999 || radiusPx === '999' ? '999px' : `${parseInt(radiusPx) || 0}px`;
    const frame = target.querySelector('.image-frame-container') || target;
    target.style.borderRadius = rVal;
    frame.style.borderRadius = rVal;
    target.querySelectorAll('img.holder-img, img.clipart-img, .image-placeholder-prompt').forEach(el => {
      el.style.borderRadius = rVal;
    });

    const slider = document.getElementById('ctx-img-radius-slider');
    const num = document.getElementById('ctx-img-radius-num');
    if (slider && radiusPx !== 999) slider.value = parseInt(radiusPx) || 0;
    if (num && radiusPx !== 999) num.value = parseInt(radiusPx) || 0;
    window.HistoryEngine?.pushState(`Set Border Radius: ${rVal}`);
  },

  setElementRotation(deg) {
    const target = this.activeTarget || window.CanvasEditor?.selectedElement;
    if (!target) return;
    const d = parseInt(deg) || 0;
    target.dataset.rotation = d;
    const flipX = target.dataset.flipH === 'true' ? -1 : 1;
    const flipY = target.dataset.flipV === 'true' ? -1 : 1;
    target.style.transform = `rotate(${d}deg) scale(${flipX}, ${flipY})`;

    const slider = document.getElementById('ctx-rotate-slider');
    const label = document.getElementById('ctx-rotate-label');
    if (slider) slider.value = d;
    if (label) label.textContent = `${d}°`;
    window.HistoryEngine?.pushState(`Rotate element to ${d}deg`);
  },

  rotateElementBy(delta) {
    const target = this.activeTarget || window.CanvasEditor?.selectedElement;
    if (!target) return;
    const cur = parseInt(target.dataset.rotation) || 0;
    let next = (cur + delta) % 360;
    if (next > 180) next -= 360;
    if (next < -180) next += 360;
    this.setElementRotation(next);
  },

  flipElement(dir) {
    const target = this.activeTarget || window.CanvasEditor?.selectedElement;
    if (!target) return;
    if (dir === 'h') {
      const cur = target.dataset.flipH === 'true';
      target.dataset.flipH = (!cur).toString();
    } else {
      const cur = target.dataset.flipV === 'true';
      target.dataset.flipV = (!cur).toString();
    }
    const d = parseInt(target.dataset.rotation) || 0;
    const flipX = target.dataset.flipH === 'true' ? -1 : 1;
    const flipY = target.dataset.flipV === 'true' ? -1 : 1;
    target.style.transform = `rotate(${d}deg) scale(${flipX}, ${flipY})`;
    window.HistoryEngine?.pushState(`Flip element`);
  },

  bindRotateHandleDrag(rotateHandle, target) {
    const onPointerDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      const onPointerMove = (moveEvt) => {
        if (moveEvt.buttons === 0) {
          onPointerUp();
          return;
        }
        const rad = Math.atan2(moveEvt.clientY - centerY, moveEvt.clientX - centerX);
        let deg = Math.round(rad * (180 / Math.PI)) + 90; // offset because handle is at top (at -90 deg)
        while (deg > 180) deg -= 360;
        while (deg < -180) deg += 360;
        this.setElementRotation(deg);
      };

      const onPointerUp = () => {
        window.removeEventListener('mousemove', onPointerMove, { capture: true });
        window.removeEventListener('mouseup', onPointerUp, { capture: true });
        window.removeEventListener('pointermove', onPointerMove, { capture: true });
        window.removeEventListener('pointerup', onPointerUp, { capture: true });
        window.removeEventListener('pointercancel', onPointerUp, { capture: true });
        window.removeEventListener('blur', onPointerUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.HistoryEngine?.pushState('Rotate Element Handle');
      };

      window.addEventListener('mousemove', onPointerMove, { capture: true });
      window.addEventListener('mouseup', onPointerUp, { capture: true });
      window.addEventListener('pointermove', onPointerMove, { capture: true });
      window.addEventListener('pointerup', onPointerUp, { capture: true });
      window.addEventListener('pointercancel', onPointerUp, { capture: true });
      window.addEventListener('blur', onPointerUp);
    };

    rotateHandle.addEventListener('pointerdown', onPointerDown);
  },

  // ─────────────────────────────────────────────────
  // CAPSULE HEADER DIMENSIONS (WIDTH & HEIGHT - POINT 1)
  // ─────────────────────────────────────────────────
  setCapsuleWidth(widthPx) {
    const target = this.activeTarget;
    if (!target) return;
    const capsule = target.closest?.('.capsule-header') || target.querySelector?.('.capsule-header');
    if (!capsule) return;
    window.HistoryEngine?.pushState('Set Capsule Width');
    if (!widthPx || widthPx === 'auto') {
      capsule.style.width = '';
      capsule.style.minWidth = '';
    } else {
      capsule.style.width = `${widthPx}px`;
      capsule.style.minWidth = `${widthPx}px`;
    }
    const input = document.getElementById('ctx-capsule-width-num');
    if (input) input.value = capsule.offsetWidth;
    window.LayoutEngine?.autoReflowPages();
  },

  stepCapsuleWidth(delta) {
    const target = this.activeTarget;
    if (!target) return;
    const capsule = target.closest?.('.capsule-header') || target.querySelector?.('.capsule-header');
    if (!capsule) return;
    const current = capsule.offsetWidth || 180;
    this.setCapsuleWidth(Math.max(60, current + delta));
  },

  setCapsuleHeight(heightPx) {
    const target = this.activeTarget;
    if (!target) return;
    const capsule = target.closest?.('.capsule-header') || target.querySelector?.('.capsule-header');
    if (!capsule) return;
    window.HistoryEngine?.pushState('Set Capsule Height');
    if (!heightPx || heightPx === 'auto') {
      capsule.style.height = '';
      capsule.style.minHeight = '';
      capsule.style.paddingTop = '';
      capsule.style.paddingBottom = '';
    } else {
      capsule.style.height = `${heightPx}px`;
      capsule.style.minHeight = `${heightPx}px`;
    }
    const input = document.getElementById('ctx-capsule-height-num');
    if (input) input.value = capsule.offsetHeight;
    window.LayoutEngine?.autoReflowPages();
  },

  stepCapsuleHeight(delta) {
    const target = this.activeTarget;
    if (!target) return;
    const capsule = target.closest?.('.capsule-header') || target.querySelector?.('.capsule-header');
    if (!capsule) return;
    const current = capsule.offsetHeight || 32;
    this.setCapsuleHeight(Math.max(20, current + delta));
  },

  resetCapsuleDimensions() {
    const target = this.activeTarget;
    if (!target) return;
    const capsule = target.closest?.('.capsule-header') || target.querySelector?.('.capsule-header');
    if (!capsule) return;
    window.HistoryEngine?.pushState('Reset Capsule Dimensions');
    capsule.style.width = '';
    capsule.style.minWidth = '';
    capsule.style.height = '';
    capsule.style.minHeight = '';
    capsule.style.paddingTop = '';
    capsule.style.paddingBottom = '';
    capsule.style.paddingRight = '';
    capsule.style.paddingLeft = '';
    const wInput = document.getElementById('ctx-capsule-width-num');
    const hInput = document.getElementById('ctx-capsule-height-num');
    if (wInput) wInput.value = capsule.offsetWidth;
    if (hInput) hInput.value = capsule.offsetHeight;
    window.SaveEngine?._showToast('↺ Capsule dimensions reset to auto');
    window.LayoutEngine?.autoReflowPages();
  },

  // ─────────────────────────────────────────────────
  // BULLET MANAGEMENT CONTROLS (SINGLE & MULTIPLE - POINT 3)
  // ─────────────────────────────────────────────────
  toggleActiveBullet() {
    const target = this.activeSubTarget || this.activeTarget;
    if (!target) return;
    window.LayoutEngine?.toggleBullet(target);
  },

  addBulletsToAll() {
    const target = this.activeTarget;
    if (!target) return;
    window.LayoutEngine?.addBulletsToAllLines(target);
  },

  removeBulletsFromAll() {
    const target = this.activeTarget;
    if (!target) return;
    window.LayoutEngine?.removeBulletsFromAllLines(target);
  },

  setBulletStyle(style) {
    const target = this.activeTarget;
    if (!target) return;
    window.LayoutEngine?.setBulletStyle(target, style);
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
    const SUBCARD_SELECTOR = '.procedure-step-item, .dynamic-paragraph-wrapper, .illustration-slot-box, .um-callout-box, .safety-box, .pro-tip-box, .assessment-q-card, .code-box, .dynamic-table-wrapper, .um-kv-badge, .footer-code-pill-wrapper, .footer-next-zone, .footer-brand-wrapper, .footer-tip-zone, .footer-fact-zone, .pure-image-holder-card, .build-step-col, .wiring-step-card, .step-card, .mistake-item, .mistake-row, .hero-item, .objective-cell, .objective-card, .rc-flow-step, .beyond-step, .fc-step-group, .in-card-step, .lab-step, .incard-image-box, .inline-sub-capsule, .sub-card, .in-card-subcard, .incard-bullets-wrapper, .incard-text-wrapper, .incard-callout-wrapper, .incard-pair-wrapper, .incard-code-wrapper, .image-caption-capsule, .cover-mascot-wrapper, .badge-mascot, .badge-mascot-wrapper, .card-icon-badge, .cover-illustration-placeholder, .cover-header-banner, .mission-header-banner, .page-footer, .dynamic-bullet-item, .card-icon-img, .real-world-icon, .step-img-box, .industry-img-placeholder, .component-img-placeholder, .component-img-box, .obs-img-box, .observe-image-placeholder, .sensor-half, .beyond-step-icon, .hero-icon, .obj-icon, .mistake-icon-col, .capsule-icon, .card-icon, .footer-tip-label, .var-icon, .block-icon, .badge-icon, .incard-icon-box, .pin-sticker, .round-icon-badge';

    let el = explicitEl;
    if (!el) {
      if (this.targetMode === 'element' && this.activeSubTarget) {
        el = this.activeSubTarget.closest(SUBCARD_SELECTOR) || this.activeSubTarget;
      } else {
        el = window.CanvasEditor?.selectedElement || this.activeTarget;
      }
    }
    if (!el) return;

    if (el.nodeType === 1) {
      const subTarget = el.closest(SUBCARD_SELECTOR);
      if (subTarget && (explicitEl || this.targetMode === 'element')) {
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
    if (!badge) { window.SaveEngine?._showToast('ℹ️ No title icon found on this card.'); return; }

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
    if (!capsule) { window.SaveEngine?._showToast('ℹ️ No title capsule found on this card.'); return; }

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
