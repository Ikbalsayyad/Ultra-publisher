/**
 * UltraMinds A4 Page Layout Engine V20
 * Complete rewrite — renders all 25+ rich card types matching sample pages 1-5 exactly.
 */

window.LayoutEngine = {

  renderMission(missionObj, containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    if (!missionObj || !missionObj.pages || !Array.isArray(missionObj.pages)) {
      if (window.AIService && typeof window.AIService.normalizeMissionObject === 'function') {
        missionObj = window.AIService.normalizeMissionObject(missionObj, "CHAPTER MISSION");
      }
    }

    const themeClass = missionObj.theme || 'theme-blue';
    const manualMode = document.body.classList.contains('manual-mode') ? 'manual-mode' : '';
    const twoPage = document.body.classList.contains('view-two-page') ? 'view-two-page' : '';
    document.body.className = `studio-app ${themeClass} ${manualMode} ${twoPage}`.trim();

    if (!missionObj.pages || !Array.isArray(missionObj.pages)) {
      containerEl.innerHTML = '<div style="padding:40px;text-align:center;color:#FF4D4D;font-weight:bold;">Unable to parse mission layout. Check input or API settings.</div>';
      return;
    }

    const pagesElements = missionObj.pages.map((pageData, index) =>
      this.createPageElement(missionObj, pageData, index + 1, missionObj.pages.length)
    );

    if (document.body.classList.contains('view-two-page')) {
      this.renderTwoPageSpreadSpreads(pagesElements, containerEl);
    } else {
      pagesElements.forEach(pageEl => containerEl.appendChild(pageEl));
    }

    setTimeout(() => this.autoReflowPages(), 80);
  },

  renderTwoPageSpreadSpreads(pagesElements, containerEl) {
    containerEl.innerHTML = '';
    for (let i = 0; i < pagesElements.length; i += 2) {
      const spread = document.createElement('div');
      spread.className = 'two-page-spread';
      spread.appendChild(pagesElements[i]);
      if (i + 1 < pagesElements.length) spread.appendChild(pagesElements[i + 1]);
      containerEl.appendChild(spread);
    }
  },

  applyTwoPageSpreadMode() {
    const containerEl = document.getElementById('a4-canvas-container');
    if (!containerEl) return;
    const pagesElements = Array.from(containerEl.querySelectorAll('.book-page'));
    if (document.body.classList.contains('view-two-page')) {
      this.renderTwoPageSpreadSpreads(pagesElements, containerEl);
    } else {
      containerEl.innerHTML = '';
      pagesElements.forEach(p => containerEl.appendChild(p));
    }
    setTimeout(() => this.autoReflowPages(), 80);
  },

  createPageElement(mission, pageData, pageNum, totalPages) {
    const page = document.createElement('div');
    page.className = 'book-page a4-page';
    page.dataset.pageNum = pageNum;
    page.dataset.pageType = pageData.pageType || 'generic';

    // Font override
    const savedFont = localStorage.getItem('ultraminds_global_font') || '';
    if (savedFont) page.style.setProperty('--page-global-font', savedFont);

    // Background overlay
    const bgOverlay = document.createElement('div');
    bgOverlay.className = 'page-background-overlay';
    const savedBgImg = localStorage.getItem('ultraminds_page_bg_img') || '';
    const savedBgOpacity = localStorage.getItem('ultraminds_page_bg_opacity') || '1.0';
    if (savedBgImg) bgOverlay.style.backgroundImage = `url("${savedBgImg}")`;
    bgOverlay.style.opacity = savedBgOpacity;
    page.appendChild(bgOverlay);

    // Top navigation bar (all labels are contenteditable per #3)
    const topBar = document.createElement('div');
    topBar.className = 'page-top-bar';
    const mNum = mission.missionNumber || '14';
    topBar.innerHTML = `
      <div class="page-ribbon" contenteditable="true" data-field="pageRibbon">PAGE ${pageNum}</div>
      <div class="top-mission-pill" contenteditable="true" data-field="missionPill">MISSION ${mNum}</div>
      <div class="top-corner-badge">
        <span class="badge-text" contenteditable="true">MISSION</span>
        <span class="badge-num" contenteditable="true">${mNum}</span>
      </div>
    `;
    page.appendChild(topBar);

    // Page 1 = Cover Header Banner
    if (pageNum === 1 || pageData.pageType === 'cover') {
      page.appendChild(this.renderCoverHeader(mission));
    }

    // Main body container
    const bodyContainer = document.createElement('main');
    bodyContainer.className = 'page-body-container';

    if (pageData.sections && Array.isArray(pageData.sections)) {
      pageData.sections.forEach(sec => {
        if (!sec || sec.type === 'header-banner' || sec.type === 'mission-header') return;
        const secEl = this.renderSection(sec, mission);
        if (secEl) {
          if (sec.elementId) secEl.dataset.elementId = sec.elementId;
          if (sec.sourceElements && Array.isArray(sec.sourceElements)) {
            sec.sourceElements.forEach(se => {
              if (se && se.id) {
                const itemEl = secEl.querySelector(`[data-element-id="${se.id}"]`);
                if (itemEl) {
                  itemEl.dataset.elementId = se.id;
                  if (se.orderLocked) itemEl.dataset.orderLocked = "true";
                } else if (!secEl.dataset.elementId) {
                  secEl.dataset.elementId = se.id;
                  if (se.orderLocked) secEl.dataset.orderLocked = "true";
                }
              }
            });
          }
          if (sec.type === 'floating-clipart') {
            page.appendChild(secEl);
          } else {
            bodyContainer.appendChild(secEl);
          }
        }
      });
    }

    page.appendChild(bodyContainer);

    // Footer
    page.appendChild(this.renderFooter(pageData, mNum));

    return page;
  },

  renderCoverHeader(mission) {
    const banner = document.createElement('header');
    banner.className = 'cover-header-banner draggable-element';
    banner.setAttribute('draggable', 'true');

    // Mascot: use real <img> tag with click-to-upload (#2, #3)
    const mascotSrc = mission.mascotImg || '';
    const mascotHtml = mascotSrc
      ? `<img src="${mascotSrc}" class="cover-mascot-img holder-img" style="width:72px;height:72px;object-fit:cover;border-radius:8px;cursor:pointer;" title="Double-click to replace image" />`
      : `<div class="cover-mascot-img" style="font-size:2.5rem;cursor:pointer;border-radius:8px;" title="Double-click to replace with image">🧑‍🚀</div>`;

    banner.innerHTML = `
      <button class="header-del-btn" onclick="event.stopPropagation(); this.closest('.cover-header-banner, .mission-header-banner').remove(); window.LayoutEngine?.autoReflowPages();" style="position:absolute; top:8px; right:8px; background:#EF4444; color:#FFF; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:none; align-items:center; justify-content:center; z-index:999999; box-shadow:0 2px 8px rgba(0,0,0,0.5);" title="Delete Mission Header Banner">✕</button>
      <div class="cover-mascot-area">
        <div class="cover-mascot-wrapper" style="position:relative; cursor:pointer; display:inline-block;" title="Double-click to upload/replace mascot image">
          ${mascotHtml}
          <button class="mascot-del-btn" onclick="event.stopPropagation(); this.closest('.cover-mascot-wrapper').style.display='none'; window.LayoutEngine?.autoReflowPages();" title="Remove Mascot" style="position:absolute; top:-6px; right:-6px; background:#EF4444; color:#FFF; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:99999; box-shadow:0 2px 6px rgba(0,0,0,0.4);">✕</button>
        </div>
        <div class="cover-guide-info">
          <span class="guide-name-badge" contenteditable="true" data-field="guideName">${mission.guideName || 'Commander Nova'}</span>
          <span class="guide-role-label" contenteditable="true" data-field="guideRole">${mission.guideRole || 'Your Mission Guide'}</span>
        </div>
      </div>
      <div class="cover-title-center">
        <div class="cover-mission-label" contenteditable="true" data-field="missionLabel">MISSION ${mission.missionNumber || '14'}</div>
        <h1 class="cover-main-title" contenteditable="true" data-field="missionTitle">${(mission.missionTitle || mission.title || 'MISSION TITLE').replace(/\s+/g, '<br>')}</h1>
        <p class="cover-subtitle" contenteditable="true" data-field="missionSubtitle">${mission.missionSubtitle || ''}</p>
      </div>
      <div class="cover-visual-area">
        <div class="cover-illustration-placeholder" style="cursor:pointer;" title="Double-click to upload cover illustration">
          <span class="cover-icon-big" title="Double-click to replace with image">🌦️</span>
        </div>
      </div>
    `;
    return banner;
  },

  renderFooter(pageData = {}, pageNum = 1) {
    return this.createPageFooter(pageData, pageNum);
  },

  createPageFooter(pageData = {}, pageNum = 1) {
    const footer = document.createElement('footer');
    footer.className = 'page-footer';

    const nextText = pageData.footerNextText || pageData.footerNextMission || pageData.nextMission || '';
    const pills = pageData.footerPills || [];
    const brand = pageData.brandTag || '🚀 UltraMinds AI';

    const pillsHtml = pills.length > 0
      ? pills.map(p => `<span class="footer-code-pill" contenteditable="true">${p}</span>`).join('<span class="footer-arrow">▶</span>')
      : `<span class="footer-code-pill" contenteditable="true" style="opacity:0.6;">when start ▶ read data ▶ show on OLED</span>`;

    const nextMissionHtml = `
      <div class="footer-next-zone">
        <span class="footer-next-label" contenteditable="true">NEXT MISSION</span>
        <span class="footer-next-text" contenteditable="true">${nextText || 'Click to edit next mission title & emojis...'}</span>
        <span class="footer-next-arrow">›</span>
      </div>
    `;

    footer.innerHTML = `
      <button class="footer-delete-btn" onclick="event.stopPropagation(); this.closest('.page-footer').remove(); window.LayoutEngine.autoReflowPages();" title="Delete Footer from Page">✕ Delete Footer</button>
      <div class="footer-pills-row">${pillsHtml}</div>
      <div class="footer-bottom-bar" style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top:4px;">
        ${nextMissionHtml}
        <div class="footer-brand" contenteditable="true" style="font-size:0.7rem; color:#94A3B8; cursor:pointer;">${brand}</div>
      </div>
    `;

    return footer;
  },

  autoReflowPages() {
    // Logic to ensure elements fit on the A4 canvas
  },

  // ─────────────────────────────────────────────────
  // MASTER SECTION RENDERER
  // ─────────────────────────────────────────────────
  renderSection(sec, mission) {
    if (!sec) return null;

    // Handle case where sec itself is a string
    if (typeof sec === 'string') {
      const trimmed = sec.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && parsed.type) return this.renderSection(parsed, mission);
        } catch (e) {}
      }
      return this.renderDynamicText({ type: 'dynamic-text', title: 'CONTENT', content: sec });
    }

    if (!sec.type) return null;

    // Handle case where sec.content or sec.text or sec.code is a JSON string
    if (!sec._parsedJSON) {
      const rawContent = sec.content || sec.text || sec.code || '';
      if (typeof rawContent === 'string') {
        const trimmed = rawContent.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === 'object' && parsed.type && parsed.type !== sec.type) {
              parsed._parsedJSON = true;
              if (!parsed.title && sec.title) parsed.title = sec.title;
              if (!parsed.icon && sec.icon) parsed.icon = sec.icon;
              return this.renderSection(parsed, mission);
            }
          } catch (e) {}
        }
      }
    }

    // Map aliases
    let cardType = sec.type;
    if (cardType === 'image-card') cardType = 'image-holder';
    if (cardType === 'testing-lab') cardType = 'knowledge-check';

    switch (cardType) {
      // ── Layout Structures
      case 'split-layout':           return this.renderSplitLayout(sec, mission);
      case 'floating-clipart':       return this.renderFloatingClipart(sec);
      case 'space-filler':           return this.renderSpaceFiller(sec);
      case 'page-banner':            return this.renderPageBanner(sec);

      // ── Dynamic Card Types (new — auto-routed from parser)
      case 'dynamic-text':           return this.renderDynamicText(sec);
      case 'dynamic-bullets':        return this.renderDynamicBullets(sec);
      case 'dynamic-subheader':      return this.renderDynamicSubheader(sec);
      case 'dynamic-table':          return this.renderDynamicTable(sec);
      case 'dynamic-mixed':          return this.renderDynamicMixed(sec);
      case 'dynamic-capsule':        return this.renderDynamicCapsule(sec);
      case 'dynamic-comparison':     return this.renderDynamicComparison(sec);
      case 'dynamic-image':          return this.renderDynamicImage(sec);

      // ── Cover Page Cards
      case 'mission-story':          return this.renderMissionStory(sec);
      case 'real-world':             return this.renderRealWorld(sec);
      case 'curiosity-box':          return this.renderCuriosityBox(sec);
      case 'stem-fact':              return this.renderStemFact(sec);
      case 'mission-objectives':     return this.renderMissionObjectives(sec);
      case 'think-engineer':         return this.renderThinkEngineer(sec);

      // ── Explorer Page Cards
      case 'observe-card':           return this.renderObserveCard(sec);
      case 'component-spotlight':    return this.renderComponentSpotlight(sec);
      case 'inside-sensor':          return this.renderInsideSensor(sec);
      case 'comparison-vs':          return this.renderComparisonVs(sec);
      case 'image-prompt':           return this.renderImagePrompt(sec);
      case 'heroes-grid':            return this.renderHeroesGrid(sec);
      case 'mission-challenge':      return this.renderMissionChallenge(sec);

      // ── Build Lab Cards
      case 'build-steps':            return this.renderBuildSteps(sec);
      case 'in-this-lab':            return this.renderInThisLab(sec);
      case 'pro-tip':                return this.renderProTip(sec);
      case 'device-ready':           return this.renderDeviceReady(sec);
      case 'common-mistakes':
      case 'debug-corner':           return this.renderCommonMistakes(sec);
      case 'engineer-tip':           return this.renderEngineerTip(sec);

      // ── Logic Builder Cards
      case 'flowchart-sequence':     return this.renderFlowchart(sec);
      case 'blocks-code':            return this.renderBlocksCode(sec);
      case 'code-snippet':
      case 'programming-studio':
      case 'syntax-box':             return this.renderCodeSnippet(sec);
      case 'variables-at-work':      return this.renderVariablesAtWork(sec);
      case 'oled-preview':           return this.renderOledPreview(sec);
      case 'predict-think':          return this.renderPredictThink(sec);
      case 'challenge-box':          return this.renderChallengeBox(sec);
      case 'mission-progress':       return this.renderMissionProgress(sec);

      // ── Innovation Studio Cards
      case 'mini-upgrade':           return this.renderMiniUpgrade(sec);
      case 'real-challenge':         return this.renderRealChallenge(sec);
      case 'engineers-everywhere':   return this.renderEngineersEverywhere(sec);
      case 'did-you-know':           return this.renderDidYouKnow(sec);
      case 'mission-review-table':   return this.renderMissionReviewTable(sec);
      case 'ultra-badge':            return this.renderUltraBadge(sec);
      case 'beyond-mission':         return this.renderBeyondMission(sec);

      // ── Image / Drawing Cards
      case 'image-holder':
      case 'image-card':             return this.renderImageHolder(sec);
      case 'incard-image-holder':    return this.renderIncardImage(sec);
      case 'drawing-canvas':         return this.renderDrawingCanvas(sec);
      case 'worksheet-card':         return this.renderWorksheetCard(sec);

      // ── Knowledge & Vocabulary
      case 'knowledge-check':
      case 'testing-lab':            return this.renderKnowledgeCheck(sec);
      case 'vocabulary-builder':     return this.renderVocabularyBuilder(sec);

      case 'dynamic-synthesized':    return this.renderSynthesizedCard(sec);

      // ── All other named types fall safely to Smart Synthesizer Engine
      default: {
        const synthesized = window.DynamicCardFactory?.synthesizeNovelCard(sec.title || sec.heading || sec.type, sec.content || sec.text || '') || sec;
        return this.renderSynthesizedCard(synthesized);
      }
    }
  },

  // ─────────────────────────────────────────────────
  // LAYOUT HELPERS
  // ─────────────────────────────────────────────────
  makeCard(extraClass = '', themeOverride = '') {
    const el = document.createElement('section');
    el.className = `card-base ${extraClass} ${themeOverride || ''} draggable-element`.trim();
    el.setAttribute('draggable', 'true');
    // Universal: resize handle + quick action buttons on every card
    this._attachCardControls(el);
    return el;
  },

  _attachCardControls(el) {
    // Resize handle (bottom-right corner)
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'um-resize-handle';
    resizeHandle.title = 'Drag to resize';
    el.appendChild(resizeHandle);

    // Quick action buttons (appear on hover)
    const qActions = document.createElement('div');
    qActions.className = 'um-card-quick-actions';
    qActions.innerHTML = `
      <button class="um-qbtn um-qbtn-fit" title="Auto-Fit Height to Page Canvas" onclick="event.stopPropagation(); const c = this.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .draggable-element, section'); if (c) { c.style.height = 'auto'; c.style.minHeight = '100px'; window.LayoutEngine.autoReflowPages(); }">⬆️ Fit</button>
      <button class="um-qbtn um-qbtn-del" title="Delete Card" onclick="event.stopPropagation(); window.ContextMenu?.deleteElement(this.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .draggable-element, section'))">✕</button>
      <button class="um-qbtn um-qbtn-dup" title="Duplicate Card" onclick="event.stopPropagation(); window.ContextMenu?.duplicateElement(this.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .draggable-element, section'))">⧉</button>
    `;
    el.appendChild(qActions);
  },

  renderBlocksCode(sec) {
    const card = this.makeCard('blocks-code-card theme-card-dark');
    const blocks = sec.blocks || [];
    const typeColors = { event: '#F59E0B', action: '#2563EB', logic: '#10B981', sensor: '#8B5CF6' };
    const typeIcons = { event: '⚡', action: '⚙️', logic: '🔀', sensor: '🌡️' };

    const blocksHtml = blocks.map(b => `
      <div class="mit-block-rendered draggable-element" draggable="true"
           style="display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:8px;
                  background:${b.bgColor || typeColors[b.type] || '#2563EB'};color:#FFF;
                  font-family:'Fira Code',monospace;font-size:0.8rem;font-weight:600;
                  box-shadow:0 3px 10px rgba(0,0,0,0.3);margin:4px;cursor:move;">
        <span>${typeIcons[b.type] || '📦'}</span>
        <span contenteditable="true">${b.label || b.type || 'block'}</span>
      </div>
    `).join('');

    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🧱', sec.title || 'MIT APP INVENTOR BLOCK LOGIC')}
      <div class="card-body-text" style="padding:8px;background:#05070E;border-radius:6px;display:flex;flex-wrap:wrap;gap:4px;min-height:60px;">
        ${blocksHtml || '<span style="color:#475569;font-size:0.8rem;">No blocks added yet</span>'}
      </div>
    `;
    return card;
  },



  makeCapsuleHeader(icon, title, colorClass = '') {
    return `<div class="capsule-header ${colorClass}">
      <span class="round-icon-badge" style="position:relative; overflow:visible;">
        ${icon || '📌'}
        <button class="mascot-del-btn" onclick="event.stopPropagation(); this.closest('.round-icon-badge').remove(); window.LayoutEngine?.autoReflowPages();" title="Remove Icon Badge">✕</button>
      </span>
      <span class="card-title-text" contenteditable="true">${title || ''}</span>
    </div>`;
  },

  renderSplitLayout(sec, mission) {
    let leftEl = sec.left ? this.renderSection(sec.left, mission) : null;
    let rightEl = sec.right ? this.renderSection(sec.right, mission) : null;

    const isRightEmpty = !rightEl || (rightEl.textContent && rightEl.textContent.includes('STACKED-CARDS') && !rightEl.querySelector('.card-body-text, .dynamic-bullets-list, .subcards-flex-grid'));
    const isLeftEmpty = !leftEl || (leftEl.textContent && leftEl.textContent.includes('STACKED-CARDS') && !leftEl.querySelector('.card-body-text, .dynamic-bullets-list, .subcards-flex-grid'));

    if (isRightEmpty && leftEl) return leftEl;
    if (isLeftEmpty && rightEl) return rightEl;
    if (!leftEl && !rightEl) return null;

    const el = document.createElement('div');
    el.className = 'split-layout draggable-element';
    el.setAttribute('draggable', 'true');
    if (leftEl) el.appendChild(leftEl);
    if (rightEl) el.appendChild(rightEl);
    return el;
  },

  renderFloatingClipart(sec) {
    const sticker = document.createElement('div');
    sticker.className = 'floating-clipart-sticker draggable-sticker';
    sticker.style.cssText = 'position:absolute;top:120px;right:30px;width:150px;height:150px;z-index:100;cursor:move;';
    sticker.innerHTML = sec.imgUrl
      ? `<img src="${sec.imgUrl}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.3));"/>`
      : `<div style="font-size:80px;text-align:center;line-height:150px;">🧑‍🚀</div>`;
    return sticker;
  },

  renderSpaceFiller(sec) {
    const el = document.createElement('div');
    el.className = 'space-filler-card draggable-element';
    el.setAttribute('draggable', 'true');
    el.innerHTML = `<div class="space-filler-inner" contenteditable="true" style="min-height:60px;padding:12px;border:1.5px dashed rgba(100,116,139,0.4);border-radius:8px;color:#94A3B8;text-align:center;font-size:0.8rem;">👻 Whitespace Spacer</div>`;
    return el;
  },

  // ─────────────────────────────────────────────────
  // PAGE BANNERS
  // ─────────────────────────────────────────────────
  renderPageBanner(sec) {
    const el = document.createElement('div');
    const pt = sec.pageType || 'engineering-explorer';
    el.className = `page-type-banner banner-${pt} card-base draggable-element`;
    el.setAttribute('draggable', 'true');
    el.innerHTML = `
      <div class="page-banner-left">
        <span class="page-banner-icon" contenteditable="true">${sec.icon || '🔍'}</span>
      </div>
      <div class="page-banner-center">
        <div class="page-banner-title" contenteditable="true">${sec.title || ''}</div>
        ${sec.subtitle ? `<div class="page-banner-subtitle" contenteditable="true">${sec.subtitle}</div>` : ''}
      </div>
    `;
    this._attachCardControls(el);
    return el;
  },

  // ─────────────────────────────────────────────────
  // COVER PAGE CARDS
  // ─────────────────────────────────────────────────
  renderMissionStory(sec) {
    const card = this.makeCard('mission-story-card theme-card-blue');
    const images = (sec.images || []).map(img => `<div class="story-img-sticker">${this.getIconForKeyword(img)}</div>`).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📖', sec.title || 'MISSION STORY')}
      <div class="story-layout">
        <div class="story-text" contenteditable="true">${this.formatText(sec.content || '')}</div>
        <div class="story-images">${images}</div>
      </div>
    `;
    return card;
  },

  renderRealWorld(sec) {
    const card = this.makeCard('real-world-card theme-card-green');
    const items = (sec.items || []).map(i => `<li class="rw-item"><span class="rw-dot">●</span><span contenteditable="true">${i}</span></li>`).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🌐', sec.title || 'REAL WORLD')}
      <div class="rw-content">
        <ul class="rw-list">${items}</ul>
        ${sec.bottomNote ? `<p class="rw-bottom-note" contenteditable="true">${sec.bottomNote}</p>` : ''}
        ${sec.content ? `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content)}</div>` : ''}
      </div>
    `;
    return card;
  },

  renderCuriosityBox(sec) {
    const card = this.makeCard('curiosity-box-card theme-card-yellow');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '💡', sec.title || 'CURIOSITY BOX')}
      <div class="card-body-text" contenteditable="true">${this.formatText(sec.content || '')}</div>
    `;
    return card;
  },

  renderStemFact(sec) {
    const card = this.makeCard('stem-fact-card theme-card-purple');
    const oledHtml = sec.oledPreview
      ? `<div class="oled-mini-screen"><pre>${sec.oledPreview}</pre></div>`
      : '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '⚙️', sec.title || 'STEM FACT')}
      <div class="stem-fact-layout">
        <div class="card-body-text" contenteditable="true">${this.formatText(sec.content || '')}</div>
        ${oledHtml}
      </div>
    `;
    return card;
  },

  renderMissionObjectives(sec) {
    const card = this.makeCard('mission-objectives-card full-width');
    const objs = (sec.objectives || []);
    const objHtml = objs.map((o, idx) => {
      const num = (typeof o === 'object' && o.num) ? o.num : (idx + 1);
      const txt = (typeof o === 'string') ? o : (o.text || o.title || '');
      const icon = (typeof o === 'object' && o.icon) ? o.icon : '';
      const sub = (typeof o === 'object' && o.subtext) ? o.subtext : '';
      return `
        <div class="objective-cell">
          <div class="obj-num-circle">${num}</div>
          ${icon ? `<div class="obj-icon">${icon}</div>` : ''}
          <div class="obj-text-block">
            <strong contenteditable="true">${txt}</strong>
            ${sub ? `<span class="obj-sub" contenteditable="true">${sub}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🎯', sec.title || 'MISSION OBJECTIVES')}
      <div class="objectives-row">${objHtml || this.formatText(sec.content || '')}</div>
    `;
    return card;
  },

  renderThinkEngineer(sec) {
    const card = this.makeCard('think-engineer-card full-width');
    let scenarioHtml = '';
    if (sec.scenario) {
      const L = sec.scenario.left || sec.scenario.a || {};
      const R = sec.scenario.right || sec.scenario.b || {};
      const ansLines = Array(sec.answerLines || 2).fill('<div class="answer-dotted-line"></div>').join('');
      scenarioHtml = `
        <div class="answer-lines">${ansLines}</div>
        <div class="scenario-comparison">
          <div class="scenario-box scenario-ok">
            <div class="scenario-room-label">${L.label || 'Room A'}</div>
            <div class="scenario-stats">
              <span>🌡️ ${L.temp || '30°C'}</span>
              <span>💧 ${L.hum || '40%'}</span>
            </div>
            <div class="scenario-feel-ok">${L.feel || 'Feels Comfortable'}</div>
            <span class="scenario-emoji">${L.status === 'ok' ? '😊' : '😟'}</span>
          </div>
          <div class="vs-circle">VS</div>
          <div class="scenario-box scenario-warn">
            <div class="scenario-room-label">${R.label || 'Room B'}</div>
            <div class="scenario-stats">
              <span>🌡️ ${R.temp || '30°C'}</span>
              <span>💧 ${R.hum || '80%'}</span>
            </div>
            <div class="scenario-feel-warn">${R.feel || 'Feels Hot & Sticky'}</div>
            <span class="scenario-emoji">${R.status === 'ok' ? '😊' : '😰'}</span>
          </div>
        </div>
      `;
    }
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🧠', sec.title || 'THINK LIKE AN ENGINEER')}
      <div class="question-prompt" contenteditable="true">${sec.question || ''}</div>
      ${scenarioHtml}
    `;
    return card;
  },

  // ─────────────────────────────────────────────────
  // PAGE 2 — ENGINEERING EXPLORER CARDS
  // ─────────────────────────────────────────────────
  renderObserveCard(sec) {
    const card = this.makeCard('observe-card theme-card-green');
    const qHtml = (sec.questions || []).map((q, i) => `
      <div class="observe-q-item">
        <div class="observe-q-num">${i + 1}</div>
        <div class="observe-q-text" contenteditable="true">${q}</div>
        <div class="observe-answer-line"></div>
      </div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '👁️', sec.title || 'OBSERVE & ANSWER')}
      <div class="observe-intro" contenteditable="true">${sec.introText || ''}</div>
      <div class="observe-image-placeholder">
        <div class="obs-img-box">🌬️ 🌡️ ☀️</div>
      </div>
      <div class="observe-questions">${qHtml}</div>
    `;
    return card;
  },

  renderComponentSpotlight(sec) {
    const card = this.makeCard('component-spotlight-card theme-card-green');
    const featHtml = (sec.features || []).map(f => `<li class="feature-item">✅ <span contenteditable="true">${f}</span></li>`).join('');
    const pinHtml = (sec.pinConfig || []).map(p => `
      <div class="pin-row">
        <span class="pin-num pin-${p.color || 'black'}">${p.num}</span>
        <span class="pin-label pin-label-${p.color || 'black'}" contenteditable="true">${p.label}</span>
        <span class="pin-desc" contenteditable="true">${p.desc}</span>
      </div>
    `).join('');
    const specHtml = (sec.specs || []).map(s => `
      <div class="spec-cell">
        <div class="spec-icon">${s.icon || ''}</div>
        <div class="spec-label">${s.label}</div>
        <div class="spec-value" contenteditable="true">${s.value}</div>
      </div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🔬', sec.title || 'MEET TODAY\'S COMPONENT')}
      <div class="component-layout">
        <div class="component-left">
          <div class="component-name" contenteditable="true">${sec.componentName || ''}</div>
          <div class="component-subtitle" contenteditable="true">${sec.componentSubtitle || ''}</div>
          <ul class="feature-list">${featHtml}</ul>
        </div>
        <div class="component-img-placeholder">
          <div class="component-img-box">🔵</div>
        </div>
      </div>
      ${pinHtml ? `
        <div class="pin-config-section">
          <div class="pin-config-title">PIN CONFIGURATION</div>
          <div class="pin-config-table">${pinHtml}</div>
        </div>` : ''}
      ${specHtml ? `
        <div class="specs-section">
          <div class="specs-title">SPECIFICATIONS</div>
          <div class="specs-grid">${specHtml}</div>
        </div>` : ''}
    `;
    return card;
  },

  renderInsideSensor(sec) {
    const card = this.makeCard('inside-sensor-card theme-card-blue');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🔬', sec.title || 'INSIDE THE SENSOR')}
      <p class="inside-intro" contenteditable="true">${sec.intro || ''}</p>
      <div class="inside-sensor-diagram">
        <div class="sensor-half sensor-left">
          <div class="sensor-half-title">${sec.leftTitle || 'TEMPERATURE SENSING ELEMENT'}</div>
          <div class="sensor-half-content" contenteditable="true">${sec.leftContent || ''}</div>
        </div>
        <div class="sensor-half sensor-right">
          <div class="sensor-half-title">${sec.rightTitle || 'HUMIDITY SENSING ELEMENT'}</div>
          <div class="sensor-half-content" contenteditable="true">${sec.rightContent || ''}</div>
        </div>
      </div>
      ${sec.bottomNote ? `<div class="inside-bottom-note"><span class="inside-note-icon">🧠</span><span contenteditable="true">${sec.bottomNote}</span></div>` : ''}
    `;
    return card;
  },

  renderComparisonVs(sec) {
    const card = this.makeCard('comparison-vs-card theme-card-yellow');
    const leftItems = (sec.leftItems || []).map(item => `
      <div class="cv-item"><span class="cv-item-icon">${item.icon || '•'}</span><span contenteditable="true">${item.text || ''}</span></div>
    `).join('');
    const rightItems = (sec.rightItems || []).map(item => `
      <div class="cv-item"><span class="cv-item-icon">${item.icon || '•'}</span><span contenteditable="true">${item.text || ''}</span></div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '⚖️', sec.title || 'COMPARE & UNDERSTAND')}
      <div class="cv-columns">
        <div class="cv-col cv-left">
          <div class="cv-col-title">${sec.leftTitle || 'OUR HUMAN SENSES'}</div>
          ${leftItems}
        </div>
        <div class="cv-vs-badge">VS</div>
        <div class="cv-col cv-right">
          <div class="cv-col-title">${sec.rightTitle || 'ELECTRONIC SENSORS'}</div>
          ${rightItems}
        </div>
      </div>
      ${sec.bottomNote ? `<div class="cv-bottom-note" contenteditable="true">${sec.bottomNote}</div>` : ''}
      ${sec.content ? `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content)}</div>` : ''}
    `;
    return card;
  },

  renderMissionChallenge(sec) {
    const card = this.makeCard('mission-challenge-card theme-card-green');
    const fields = (sec.answerFields || ['1. ............', '2. ............']).map(f => `<div class="challenge-answer-field" contenteditable="true">${f}</div>`).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🔍', sec.title || 'MISSION CHALLENGE')}
      <div class="challenge-question" contenteditable="true">${sec.question || sec.content || ''}</div>
      <div class="challenge-answer-fields">${fields}</div>
    `;
    return card;
  },

  // ─────────────────────────────────────────────────
  // PAGE 3 — BUILD LAB CARDS
  // ─────────────────────────────────────────────────
  renderBuildSteps(sec) {
    const card = this.makeCard('build-steps-card full-width');
    const stepsHtml = (sec.steps || []).map((s, i) => {
      const pinRows = (s.pinTable || []).map(p => `
        <tr>
          <td class="pin-td pin-${p.color || ''}">${p.label || p.from || ''}</td>
          <td class="pin-arrow">→</td>
          <td class="pin-td-val" contenteditable="true">${p.arrow || p.to || ''}</td>
        </tr>
      `).join('');
      return `
        <div class="build-step-col draggable-element" style="position:relative;">
          <button class="step-del-btn" onclick="event.stopPropagation(); this.closest('.build-step-col, .wiring-step-card, .step-card').remove(); window.LayoutEngine?.renumberSteps(this.closest('.build-steps-grid, .page-body-container')); window.LayoutEngine?.autoReflowPages();" style="position:absolute; top:4px; right:4px; background:#EF4444; color:#FFF; border:none; border-radius:50%; width:18px; height:18px; font-size:10px; cursor:pointer; display:none; align-items:center; justify-content:center; z-index:10;" title="Delete Step">✕</button>
          <div class="step-num-badge" contenteditable="true">${s.stepNum || i + 1}</div>
          <div class="step-title" contenteditable="true">${s.title || ''}</div>
          <div class="step-img-placeholder">
            <div class="step-img-box">🔌</div>
          </div>
          <p class="step-desc" contenteditable="true">${s.desc || ''}</p>
          ${pinRows ? `<table class="step-pin-table">${pinRows}</table>` : ''}
        </div>
      `;
    }).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🛠️', sec.title || 'BUILD STEPS')}
      <div class="build-steps-grid">${stepsHtml}</div>
      <button class="add-step-btn" onclick="window.LayoutEngine?._addBuildStepItem(this);" style="margin-top:8px; background:rgba(59,130,246,0.15); color:#93C5FD; border:1px dashed #3B82F6; border-radius:6px; font-size:0.72rem; padding:4px 10px; cursor:pointer;">➕ Add Step</button>
    `;
    return card;
  },

  renderInThisLab(sec) {
    const card = this.makeCard('in-this-lab-card theme-card-blue');
    const items = (sec.items || []).map(i => `<li class="lab-item">✅ <span contenteditable="true">${i}</span></li>`).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🧪', sec.title || 'IN THIS LAB YOU WILL')}
      <ul class="lab-list">${items}</ul>
    `;
    return card;
  },

  renderProTip(sec) {
    const card = this.makeCard('pro-tip-card theme-card-yellow');
    card.innerHTML = `
      <div class="pro-tip-header">
        <span class="pro-tip-icon">💡</span>
        <span class="pro-tip-label">${sec.title || 'PRO TIP'}</span>
      </div>
      <div class="pro-tip-content" contenteditable="true">${this.formatText(sec.content || '')}</div>
    `;
    return card;
  },

  renderDeviceReady(sec) {
    const card = this.makeCard('device-ready-card theme-card-blue');
    const callouts = (sec.callouts || []).map(c => `<div class="callout-label callout-${c.side || 'left'}" contenteditable="true">${c.text}</div>`).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '✅', sec.title || 'YOUR DEVICE IS READY!')}
      <div class="device-ready-layout">
        <div class="device-callouts">${callouts}</div>
        <div class="device-img-placeholder">
          <div class="device-img-box">⚡🔵</div>
        </div>
      </div>
    `;
    return card;
  },

  renderCommonMistakes(sec) {
    const card = this.makeCard('common-mistakes-card theme-card-red');
    const rows = (sec.mistakes || []).map(m => `
      <div class="mistake-row">
        <div class="mistake-icon-col">${m.icon || '⚠️'}</div>
        <div class="mistake-issue" contenteditable="true">${m.issue || ''}</div>
        <div class="mistake-arrow">▶</div>
        <div class="mistake-fix" contenteditable="true">${m.fix || ''}</div>
      </div>
    `).join('');
    const fallback = sec.content ? `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content)}</div>` : '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '⚠️', sec.title || 'COMMON MISTAKES')}
      <div class="mistakes-table">${rows || fallback}</div>
    `;
    return card;
  },

  renderEngineerTip(sec) {
    const card = this.makeCard('engineer-tip-card theme-card-teal');
    card.innerHTML = `
      <div class="eng-tip-layout">
        <span class="eng-tip-icon">🔧</span>
        <div>
          <div class="eng-tip-label">${sec.title || 'ENGINEER TIP'}</div>
          <div class="eng-tip-text" contenteditable="true">${sec.content || ''}</div>
        </div>
      </div>
    `;
    return card;
  },

  // ─────────────────────────────────────────────────
  // PAGE 4 — LOGIC BUILDER CARDS
  // ─────────────────────────────────────────────────
  renderFlowchart(sec) {
    const card = this.makeCard('flowchart-card theme-card-blue');
    const stepsHtml = (sec.steps || []).map((s, i) => {
      const isStart = s.type === 'start';
      const isLoop = s.type === 'loop';
      const isWait = s.type === 'wait';
      const boxClass = isStart ? 'fc-box-start' : isLoop ? 'fc-box-loop' : isWait ? 'fc-box-wait' : 'fc-box-process';
      const descHtml = s.desc ? `<p class="fc-step-desc" contenteditable="true">${s.desc}</p>` : '';
      const arrowHtml = i < (sec.steps.length - 1) ? '<div class="fc-arrow">▼</div>' : '';
      return `
        <div class="fc-step-group">
          <div class="${boxClass} fc-box draggable-element" contenteditable="true">${s.label || ''}</div>
          ${descHtml}
          ${arrowHtml}
        </div>
      `;
    }).join('');
    const loopNote = sec.loopNote ? `<div class="fc-loop-note" contenteditable="true">⭐ ${sec.loopNote}</div>` : '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🔄', sec.title || 'FLOW OF LOGIC')}
      <div class="flowchart-container">${stepsHtml}</div>
      ${loopNote}
    `;
    return card;
  },

  renderBlocksCode(sec) {
    const card = this.makeCard('blocks-code-card theme-card-blue');
    // Render a visual representation of MIT Blocks
    const blocksHtml = (sec.blocks && sec.blocks.length > 0)
      ? sec.blocks.map(b => `<div class="mit-block mit-block-${b.type || 'do'}" style="${b.bgColor ? `background:${b.bgColor} !important;` : ''} color:#FFFFFF; margin:6px 0; padding:8px 14px; border-radius:6px; font-family:'Fira Code',monospace; font-weight:600;" contenteditable="true">${b.label || ''}</div>`).join('')
      : `<div class="blocks-placeholder">
          <div class="mit-block mit-block-when">when Screen1.Initialize</div>
          <div class="mit-block-indent">
            <div class="mit-block mit-block-do">set global temp to 0</div>
            <div class="mit-block mit-block-do">set global humi to 0</div>
          </div>
          <div class="mit-block mit-block-when">when Clock1.Timer</div>
          <div class="mit-block-indent">
            <div class="mit-block mit-block-set">set global temp = DHT11.ReadTemperature</div>
            <div class="mit-block mit-block-set">set global humi = DHT11.ReadHumidity</div>
            <div class="mit-block mit-block-call">OLED1.ShowText</div>
          </div>
        </div>`;
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🧱', sec.title || 'BLOCKS LOGIC (MIT APP INVENTOR)')}
      <div class="blocks-code-container">${blocksHtml}</div>
      ${sec.note ? `<div class="blocks-note" contenteditable="true">${sec.note}</div>` : ''}
    `;
    return card;
  },

  renderCodeSnippet(sec) {
    const card = this.makeCard('code-snippet-card theme-card-dark');
    const code = sec.code || sec.content || '// Code here';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '💻', sec.title || 'CODE SNIPPET')}
      <div class="code-box">
        <div class="code-header-bar">
          <div class="code-dot code-dot-red"></div>
          <div class="code-dot code-dot-yellow"></div>
          <div class="code-dot code-dot-green"></div>
          <span class="lang-badge">${sec.language || 'python'}</span>
        </div>
        <pre class="code-content"><code contenteditable="true" spellcheck="false">${this.escapeHtml(code)}</code></pre>
      </div>
      ${sec.annotations ? `<div class="code-annotations">${(sec.annotations || []).map(a => `<div class="code-annotation" contenteditable="true">${a}</div>`).join('')}</div>` : ''}
    `;
    return card;
  },

  renderVariablesAtWork(sec) {
    const card = this.makeCard('variables-card theme-card-blue');
    const varHtml = (sec.variables || []).map(v => `
      <div class="var-item">
        <div class="var-chip"><code contenteditable="true">${v.name || ''}</code><span class="var-type">${v.label || ''}</span></div>
        <div class="var-icon">${v.icon || '📌'}</div>
        <div class="var-desc" contenteditable="true">${v.desc || ''}</div>
        ${v.example ? `<div class="var-example">Example: <strong contenteditable="true">${v.example}</strong></div>` : ''}
      </div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📌', sec.title || 'VARIABLES AT WORK')}
      ${sec.intro ? `<p class="var-intro" contenteditable="true">${sec.intro}</p>` : ''}
      <div class="variables-list">${varHtml || this.formatText(sec.content || '')}</div>
    `;
    return card;
  },

  renderOledPreview(sec) {
    const card = this.makeCard('oled-preview-card theme-card-dark');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🖥️', sec.title || 'ON OLED DISPLAY')}
      ${sec.intro ? `<p class="oled-intro" contenteditable="true">${sec.intro}</p>` : ''}
      <div class="oled-screen-large">
        <pre contenteditable="true">${sec.screenText || 'Temp: 26.8°C\nHumi: 65%'}</pre>
      </div>
    `;
    return card;
  },

  renderPredictThink(sec) {
    const card = this.makeCard('predict-think-card theme-card-green');
    const qHtml = (sec.questions || []).map((q, i) => `
      <div class="predict-q-item">
        <div class="predict-q-num">${i + 1}</div>
        <div class="predict-q-text" contenteditable="true">${q}</div>
        <div class="predict-answer-line"></div>
      </div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🤔', sec.title || 'PREDICT & THINK')}
      <div class="predict-questions">${qHtml}</div>
    `;
    return card;
  },

  renderChallengeBox(sec) {
    const card = this.makeCard('challenge-box-card theme-card-green');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🏆', sec.title || 'CHALLENGE')}
      <div class="challenge-content" contenteditable="true">${this.formatText(sec.content || '')}</div>
    `;
    return card;
  },

  renderMissionProgress(sec) {
    const card = this.makeCard('mission-progress-card theme-card-blue');
    const total = sec.totalSteps || 5;
    const done = sec.completedSteps || 0;
    const circles = Array.from({ length: total }, (_, i) => {
      const num = i + 1;
      const isDone = num <= done;
      return `<div class="progress-circle ${isDone ? 'progress-done' : ''}">${isDone ? '✓' : num}</div>`;
    }).join('<div class="progress-connector"></div>');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📈', sec.title || 'MISSION PROGRESS')}
      <div class="progress-track">${circles}</div>
    `;
    return card;
  },

  // ─────────────────────────────────────────────────
  // PAGE 5 — INNOVATION STUDIO CARDS
  // ─────────────────────────────────────────────────
  renderMiniUpgrade(sec) {
    const card = this.makeCard('mini-upgrade-card theme-card-purple');
    const rowsHtml = (sec.upgrades || []).map(u => `
      <div class="upgrade-row">
        <div class="upgrade-condition-box">
          <span class="upgrade-mood-icon">${u.moodIcon || '😊'}</span>
          <div class="upgrade-condition" contenteditable="true">${u.condition || ''}</div>
          <div class="upgrade-show" contenteditable="true">${u.show || `Show "${u.mood || ''}"`}</div>
        </div>
        <div class="upgrade-arrow">→ → →</div>
        <div class="oled-mini-preview oled-${u.color || 'blue'}">
          <pre>${u.oledText || ''}</pre>
        </div>
      </div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '⬆️', sec.title || 'MINI UPGRADE')}
      ${sec.intro ? `<p class="upgrade-intro" contenteditable="true">${sec.intro}</p>` : ''}
      <div class="upgrade-rows">${rowsHtml}</div>
    `;
    return card;
  },

  renderRealChallenge(sec) {
    const card = this.makeCard('real-challenge-card theme-card-green');
    const flowSteps = (sec.flowSteps || []).map((s, i) => `
      <div class="rc-flow-step">
        <div class="rc-flow-icon">${s.icon || '📌'}</div>
        <div class="rc-flow-label" contenteditable="true">${s.label || ''}</div>
      </div>
      ${i < (sec.flowSteps.length - 1) ? '<div class="rc-flow-arrow">→</div>' : ''}
    `).join('');
    const addMore = (sec.addMore || []).map(a => `
      <div class="rc-addon-cell">
        <div class="rc-addon-icon">${a.icon || '📌'}</div>
        <div class="rc-addon-label" contenteditable="true">${a.label || ''}</div>
      </div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🚀', sec.title || 'REAL CHALLENGE')}
      <div class="rc-challenge-title" contenteditable="true">${sec.challengeTitle || ''}</div>
      <div class="rc-challenge-desc" contenteditable="true">${sec.challengeDesc || ''}</div>
      ${flowSteps ? `<div class="rc-flow-diagram">${flowSteps}</div>` : ''}
      ${addMore ? `
        <div class="rc-add-more-title">YOU CAN ADD MORE</div>
        <div class="rc-addons-grid">${addMore}</div>` : ''}
      ${sec.bottomNote ? `<div class="rc-bottom-note" contenteditable="true">${sec.bottomNote}</div>` : ''}
    `;
    return card;
  },

  renderEngineersEverywhere(sec) {
    const card = this.makeCard('engineers-everywhere-card full-width');
    const industries = (sec.industries || []).map(ind => `
      <div class="industry-cell">
        <div class="industry-img-placeholder">
          <span class="industry-icon">${this.getIconForKeyword(ind.imgKeyword || ind.title)}</span>
        </div>
        <div class="industry-title" contenteditable="true">${ind.title || ''}</div>
        <div class="industry-desc" contenteditable="true">${ind.desc || ''}</div>
      </div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🏭', sec.title || 'ENGINEERS USE THIS EVERYWHERE!')}
      ${sec.intro ? `<p class="ee-intro" contenteditable="true">${sec.intro}</p>` : ''}
      <div class="industries-grid">${industries}</div>
    `;
    return card;
  },

  renderDidYouKnow(sec) {
    const card = this.makeCard('did-you-know-card theme-card-yellow');
    const items = sec.items || (sec.content ? [sec.content] : []);
    const itemsHtml = items.map(i => `<div class="dyk-fact"><span class="dyk-icon">🌍</span><span contenteditable="true">${i}</span></div>`).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '💡', sec.title || 'DID YOU KNOW?')}
      <div class="dyk-facts">${itemsHtml || this.formatText(sec.content || '')}</div>
    `;
    return card;
  },

  renderMissionReviewTable(sec) {
    const card = this.makeCard('mission-review-table-card theme-card-green');
    const rows = (sec.rows || []).map(r => `
      <div class="review-row">
        <div class="review-check">✅</div>
        <div class="review-question" contenteditable="true">${r.question || ''}</div>
        <div class="review-answer" contenteditable="true">${r.answer || ''}</div>
      </div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📝', sec.title || 'MISSION REVIEW')}
      <div class="review-table">${rows || this.formatText(sec.content || '')}</div>
    `;
    return card;
  },

  renderUltraBadge(sec) {
    const card = this.makeCard('ultra-badge-card theme-card-blue');
    card.innerHTML = `
      <div class="badge-layout">
        <div class="badge-left">
          <div class="badge-shield">
            <div class="badge-shield-icon">🛡️</div>
            <div class="badge-name" contenteditable="true">${sec.badgeName || 'ULTRA BADGE'}</div>
            <div class="badge-subtitle" contenteditable="true">${sec.badgeSubtitle || ''}</div>
          </div>
        </div>
        <div class="badge-right">
          <div class="badge-mascot">🧑‍🚀</div>
          <div class="badge-congrats" contenteditable="true">${sec.congrats || ''}</div>
          ${sec.mascotNote ? `<div class="badge-mascot-note" contenteditable="true">${sec.mascotNote}</div>` : ''}
        </div>
      </div>
    `;
    return card;
  },

  renderBeyondMission(sec) {
    const card = this.makeCard('beyond-mission-card full-width theme-card-dark');
    const stepsHtml = (sec.steps || []).map((s, i) => `
      <div class="beyond-step">
        <div class="beyond-step-icon">${s.icon || '🚀'}</div>
        <div class="beyond-step-label">${s.label || ''}</div>
        <div class="beyond-step-desc" contenteditable="true">${s.desc || ''}</div>
      </div>
      ${i < (sec.steps.length - 1) ? '<div class="beyond-arrow">→</div>' : ''}
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🚀', sec.title || 'BEYOND TODAY\'S MISSION')}
      <div class="beyond-steps-row">${stepsHtml}</div>
      ${sec.bottomNote ? `<div class="beyond-bottom-note" contenteditable="true">⭐ ${sec.bottomNote}</div>` : ''}
    `;
    return card;
  },

  renderImagePrompt(sec) {
    const card = this.makeCard('image-prompt-card');
    const kwIcon = this.getIconForKeyword(sec.imgKeyword || sec.title);
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🖼️', sec.title || 'ILLUSTRATION PLACEHOLDER')}
      <div class="image-prompt-holder">
        <span class="image-prompt-icon">${kwIcon}</span>
        <span class="image-prompt-label">STEM ILLUSTRATION PLACEHOLDER</span>
        <span class="image-prompt-caption" contenteditable="true">"${sec.caption || sec.content || 'Illustration placeholder'}"</span>
      </div>
    `;
    return card;
  },

  renderHeroesGrid(sec) {
    const card = this.makeCard('heroes-grid-card theme-card-green');
    const heroesHtml = (sec.heroes || []).map(h => `
      <div class="hero-item">
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="hero-icon">${h.icon || '🦸'}</span>
          <span class="hero-name" contenteditable="true">${h.name || ''}</span>
        </div>
        ${h.quote ? `<div class="hero-quote" contenteditable="true">"${h.quote}"</div>` : ''}
        ${h.uses && h.uses.length > 0 ? `<div class="hero-uses">Used in: ${h.uses.map(u => `<span contenteditable="true">${u}</span>`).join('')}</div>` : ''}
      </div>
    `).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🦸', sec.title || 'MEET TODAY\'S HEROES')}
      <div class="heroes-grid">${heroesHtml}</div>
    `;
    return card;
  },

  // ─────────────────────────────────────────────────
  // SHARED CARD RENDERERS
  // ─────────────────────────────────────────────────
  renderImageHolder(sec) {
    const card = this.makeCard('image-holder-card');
    const imgSrc = sec.imgUrl || '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🖼️', sec.title || 'IMAGE')}
      <div class="image-frame-container" style="height:180px;overflow:hidden;border-radius:8px;background:transparent;border:1.5px dashed rgba(59,130,246,0.3);cursor:pointer;position:relative;">
        <img class="holder-img" src="${imgSrc}" style="width:100%;height:100%;object-fit:${sec.objectFit || 'cover'};object-position:${sec.objectPosition || 'center'};display:${imgSrc ? 'block' : 'none'};pointer-events:auto;" title="Double-click to replace image" />
        <div class="img-placeholder-label" style="display:${imgSrc ? 'none' : 'flex'};align-items:center;justify-content:center;height:100%;color:#475569;font-size:0.85rem;">📷 Click / Double-Click to Upload Image</div>
      </div>
      ${sec.caption ? `<div class="card-caption-text" contenteditable="true">${sec.caption}</div>` : ''}
    `;
    return card;
  },

  renderIncardImage(sec) {
    const box = document.createElement('div');
    box.className = 'incard-image-box draggable-element';
    box.setAttribute('draggable', 'true');
    const imgSrc = sec.imgUrl || '';
    box.innerHTML = `
      <div class="image-frame-container" style="width:100%;height:140px;overflow:hidden;background:transparent;border:1.5px dashed rgba(59,130,246,0.3);cursor:pointer;position:relative;">
        <img class="holder-img" src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;display:${imgSrc ? 'block' : 'none'};pointer-events:auto;" title="Double-click to replace image" />
        <div class="img-placeholder-label" style="display:${imgSrc ? 'none' : 'flex'};align-items:center;justify-content:center;height:100%;color:#475569;font-size:0.8rem;">📷 Image</div>
      </div>
      <div class="incard-bottom-capsule" contenteditable="true">${sec.title || 'Image'}</div>
    `;
    return box;
  },

  renderDrawingCanvas(sec) {
    const card = this.makeCard('drawing-canvas-card');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '✏️', sec.title || 'DESIGN WORKSPACE')}
      <div class="drawing-canvas-grid">✏️ Drawing & Design Workspace</div>
    `;
    return card;
  },

  renderWorksheetCard(sec) {
    const card = this.makeCard('worksheet-card theme-card-blue');
    const lines = Array(4).fill('<div class="worksheet-line"></div>').join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📝', sec.title || 'WORKSHEET')}
      <div class="card-body-text" contenteditable="true">${this.formatText(sec.content || '')}</div>
      <div class="worksheet-lines">${lines}</div>
    `;
    return card;
  },

  renderGenericCard(sec) {
    const themeClass = this.getThemeClassForType(sec.type);
    const card = this.makeCard(`generic-card ${sec.type}`, themeClass);
    const bodyText = sec.content || sec.text || sec.desc || sec.body || sec.details || sec.question || sec.answer || sec.value || '';
    let arrayHtml = '';
    const arr = sec.items || sec.list || sec.bullets || sec.skills || sec.objectives || sec.steps || sec.questions;
    if (Array.isArray(arr) && arr.length > 0) {
      arrayHtml = '<ul class="custom-card-list">' + arr.map(item => {
        if (typeof item === 'string') return `<li contenteditable="true">${item}</li>`;
        if (typeof item === 'object') {
          const t = item.title || item.name || item.text || item.label || item.question || '';
          const d = item.desc || item.content || item.value || item.answer || '';
          return `<li contenteditable="true"><strong>${t}</strong>${d ? ': ' + d : ''}</li>`;
        }
        return '';
      }).filter(Boolean).join('') + '</ul>';
    }

    // Render rows if present (review table, etc.)
    let rowsHtml = '';
    if (Array.isArray(sec.rows) && sec.rows.length > 0) {
      rowsHtml = sec.rows.map(r => `<div class="review-row"><div class="review-check">✅</div><div class="review-question" contenteditable="true">${r.question || ''}</div><div class="review-answer" contenteditable="true">${r.answer || ''}</div></div>`).join('');
      if (rowsHtml) rowsHtml = `<div class="review-table">${rowsHtml}</div>`;
    }

    const answerLines = (sec.type === 'worksheet-card' || (sec.title && /Q[1-4]|ENGINEER|ASSESSMENT/i.test(sec.title)))
      ? '<div class="worksheet-line"></div><div class="worksheet-line"></div>'
      : '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📌', sec.title || '')}
      ${bodyText ? `<div class="card-body-text" contenteditable="true">${this.formatText(bodyText)}</div>` : ''}
      ${arrayHtml}
      ${rowsHtml}
      ${answerLines}
    `;
    // Reattach controls since innerHTML replaced them
    this._attachCardControls(card);
    return card;
  },

  // ─────────────────────────────────────────────────
  // DYNAMIC CARD RENDERERS (8 universal types)
  // ─────────────────────────────────────────────────

  renderDynamicText(sec) {
    const card = this.makeCard('dynamic-text-card');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📄', sec.title || 'CONTENT')}
      <div class="card-body-text" contenteditable="true">${this.formatText(sec.content || sec.text || '')}</div>
      ${this.makeInCardToolbarHTML()}
    `;
    this._attachCardControls(card);
    return card;
  },

  renderDynamicBullets(sec) {
    const card = this.makeCard('dynamic-bullets-card');
    const bullets = sec.bullets || sec.items || (sec.content ? window.DynamicCardFactory?._extractBullets(sec.content) : []) || [];
    const bulletHtml = bullets.map(b => `
      <li class="dynamic-bullet-item">
        <span class="bullet-dot">✔</span>
        <span class="bullet-text" contenteditable="true">${b}</span>
        <button class="bullet-del-btn" onclick="this.closest('.dynamic-bullet-item').remove(); window.LayoutEngine.autoReflowPages();">✕</button>
      </li>`).join('');
    const fallbackText = (!bullets.length && sec.content) ? `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content)}</div>` : '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📋', sec.title || 'KEY POINTS')}
      <ul class="dynamic-bullets-list" data-bullet-style="✔">${bulletHtml}</ul>
      ${fallbackText}
      <button class="add-bullet-btn" onclick="window.LayoutEngine._addBulletItem(this);">➕ Add Bullet Point</button>
      ${this.makeInCardToolbarHTML()}
    `;
    this._attachCardControls(card);
    return card;
  },

  _addBulletItem(btnEl) {
    const list = btnEl.closest('.dynamic-bullets-card, .card-base, .incard-bullets-wrapper').querySelector('.dynamic-bullets-list');
    if (!list) return;
    const bulletStyle = list.getAttribute('data-bullet-style') || '✔';
    const li = document.createElement('li');
    li.className = 'dynamic-bullet-item';
    li.style.cssText = 'display:flex; align-items:center; gap:6px; margin-bottom:3px;';
    li.innerHTML = `
      <span class="bullet-dot">${bulletStyle}</span>
      <span class="bullet-text" contenteditable="true" style="font-size:0.8rem; color:#CBD5E1;">New item...</span>
      <button class="bullet-del-btn" onclick="this.closest('.dynamic-bullet-item').remove(); window.LayoutEngine.autoReflowPages();" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:0.7rem;">✕</button>
    `;
    list.appendChild(li);
    const span = li.querySelector('.bullet-text');
    if (span) { span.focus(); span.textContent = ''; }
    this.autoReflowPages();
  },

  _addBuildStepItem(btnEl) {
    const card = btnEl ? btnEl.closest('.build-steps-card, .card-base, section') : null;
    const grid = card ? card.querySelector('.build-steps-grid, .build-steps-container') : null;
    if (!grid) return;

    window.HistoryEngine?.pushState('Add Build Step Item');

    const stepCols = grid.querySelectorAll('.build-step-col, .step-card, .wiring-step-card');
    const newNum = stepCols.length + 1;

    const col = document.createElement('div');
    col.className = 'build-step-col draggable-element';
    col.style.cssText = 'position:relative; margin:6px 0;';
    col.innerHTML = `
      <button class="step-del-btn" onclick="event.stopPropagation(); this.closest('.build-step-col, .wiring-step-card, .step-card').remove(); window.LayoutEngine?.renumberSteps(this.closest('.build-steps-grid, .page-body-container')); window.LayoutEngine?.autoReflowPages();" style="position:absolute; top:4px; right:4px; background:#EF4444; color:#FFF; border:none; border-radius:50%; width:18px; height:18px; font-size:10px; cursor:pointer; display:none; align-items:center; justify-content:center; z-index:10;" title="Delete Step">✕</button>
      <div class="step-num-badge" contenteditable="true">${newNum}</div>
      <div class="step-title" contenteditable="true">STEP ${newNum} TITLE</div>
      <div class="step-img-placeholder">
        <div class="step-img-box">🔌</div>
      </div>
      <p class="step-desc" contenteditable="true">Step description details...</p>
    `;

    grid.appendChild(col);
    this.renumberSteps(grid);
    this.autoReflowPages();
  },

  renumberSteps(container) {
    if (!container) return;
    const badges = container.querySelectorAll('.step-num-badge, .obj-num-circle, .step-number');
    badges.forEach((b, idx) => {
      if (!b.isContentEditable || /^\d+$/.test(b.textContent.trim())) {
        b.textContent = idx + 1;
      }
    });
  },

  // ─── IN-CARD ELEMENTS & SUBCARD BUILDER ────────────────────
  makeInCardToolbarHTML() {
    return `
      <div class="incard-element-bar" style="display:none;"></div>
    `;
  },

  _addInCardSubcard(btnEl) {
    let card = btnEl ? btnEl.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .dynamic-text-card, .dynamic-bullets-card, .dynamic-mixed-card, section') : null;
    if (!card && window.CanvasEditor?.selectedElement) {
      card = window.CanvasEditor.selectedElement.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, section') || window.CanvasEditor.selectedElement;
    }
    if (!card) return;

    window.HistoryEngine?.pushState('Add Plain Sub-Card');

    const subcard = document.createElement('div');
    subcard.className = 'in-card-subcard card-base draggable-element sub-card';
    subcard.setAttribute('draggable', 'true');
    subcard.style.cssText = 'margin:8px 0; padding:10px 12px; background:rgba(255,255,255,0.04); border:1.5px solid var(--accent-blue, #3B82F6); border-radius:8px; position:relative;';
    subcard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span class="subcard-title" contenteditable="true" style="font-weight:700; font-size:0.78rem; color:var(--accent-cyan, #00F0FF); text-transform:uppercase;">📦 PLAIN SUBCARD</span>
        <div class="subcard-actions" style="display:flex; gap:4px;">
          <button onclick="event.stopPropagation(); this.closest('.in-card-subcard').remove(); window.LayoutEngine.autoReflowPages();" style="background:#EF4444; color:#FFF; border:none; border-radius:4px; padding:2px 6px; font-size:0.65rem; cursor:pointer;" title="Delete Subcard">✕</button>
        </div>
      </div>
      <div class="subcard-body" contenteditable="true" style="font-size:0.8rem; color:#CBD5E1; min-height:30px;">
        Click to edit plain subcard text content...
      </div>
    `;

    const container = card.querySelector('.card-body-text, .build-lab, .mistakes-list, .subcards-container, .build-steps-grid') || card;
    if (btnEl && btnEl !== card && btnEl.parentNode === container) {
      container.insertBefore(subcard, btnEl);
    } else {
      container.appendChild(subcard);
    }

    const body = subcard.querySelector('.subcard-body');
    if (body) body.focus();
    this.autoReflowPages();
  },

  _addInCardElement(btnEl, type) {
    let card = btnEl ? btnEl.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .dynamic-text-card, .dynamic-bullets-card, .dynamic-mixed-card, section') : null;
    if (!card && window.CanvasEditor?.selectedElement) {
      card = window.CanvasEditor.selectedElement.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, section') || window.CanvasEditor.selectedElement;
    }
    if (!card) return;

    window.HistoryEngine?.pushState(`Add In-Card ${type}`);
    const el = document.createElement('div');
    el.className = `incard-${type}-wrapper draggable-element`;
    el.setAttribute('draggable', 'true');
    el.style.cssText = 'margin:6px 0; position:relative; width:100%; box-sizing:border-box;';

    if (type === 'bullets') {
      el.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <select class="bullet-style-select" onchange="this.nextElementSibling.setAttribute('data-bullet-style', this.value);" style="background:#1E293B; color:#00F0FF; border:1px solid #334155; border-radius:4px; font-size:0.65rem; padding:2px 4px; cursor:pointer;">
            <option value="✔">✔ Checkmark</option>
            <option value="•">• Disc</option>
            <option value="⭐">⭐ Star</option>
            <option value="▶">▶ Arrow</option>
            <option value="1.">1. Numbered</option>
            <option value="☐">☐ Checkbox</option>
          </select>
          <button class="incard-del-btn" onclick="this.closest('.incard-bullets-wrapper').remove(); window.LayoutEngine.autoReflowPages();" style="background:#EF4444; color:#FFF; border:none; border-radius:4px; padding:1px 5px; font-size:0.65rem; cursor:pointer;" title="Delete List">✕</button>
        </div>
        <ul class="dynamic-bullets-list" data-bullet-style="✔" style="list-style:none; padding:0; margin:0;">
          <li class="dynamic-bullet-item" style="display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <span class="bullet-dot">✔</span>
            <span class="bullet-text" contenteditable="true" style="font-size:0.8rem; color:#CBD5E1;">New list item...</span>
            <button class="bullet-del-btn" onclick="this.closest('.dynamic-bullet-item').remove(); window.LayoutEngine.autoReflowPages();" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:0.7rem;">✕</button>
          </li>
        </ul>
        <button class="add-bullet-btn" onclick="window.LayoutEngine._addBulletItem(this);" style="background:rgba(59,130,246,0.15); color:#93C5FD; border:1px dashed #3B82F6; border-radius:4px; font-size:0.68rem; padding:2px 8px; cursor:pointer; margin-top:4px;">➕ Add Item</button>
      `;
    } else if (type === 'text') {
      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <p contenteditable="true" style="font-size:0.8rem; color:#E2E8F0; margin:0; flex:1;">Type your plain text box content here...</p>
          <button class="incard-del-btn" onclick="this.closest('.incard-text-wrapper').remove(); window.LayoutEngine.autoReflowPages();" style="background:#EF4444; color:#FFF; border:none; border-radius:4px; padding:1px 5px; font-size:0.65rem; cursor:pointer; margin-left:6px;" title="Delete Text">✕</button>
        </div>
      `;
    } else if (type === 'callout') {
      el.innerHTML = `
        <div class="incard-callout-box" style="display:flex; gap:8px; align-items:flex-start; padding:8px 12px; background:rgba(245,158,11,0.12); border-left:3px solid #F59E0B; border-radius:6px; margin:4px 0;">
          <span contenteditable="true" style="font-size:0.9rem;">💡</span>
          <div contenteditable="true" style="font-size:0.78rem; color:#FDE68A; flex:1;">Important callout or key takeaway point...</div>
          <button class="incard-del-btn" onclick="this.closest('.incard-callout-wrapper').remove(); window.LayoutEngine.autoReflowPages();" style="background:#EF4444; color:#FFF; border:none; border-radius:4px; padding:1px 5px; font-size:0.65rem; cursor:pointer;" title="Delete Callout">✕</button>
        </div>
      `;
    } else if (type === 'pair') {
      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:rgba(255,255,255,0.03); border:1px solid rgba(148,163,184,0.12); border-radius:6px; font-size:0.78rem;">
          <span contenteditable="true" style="font-weight:700; color:#00F0FF;">KEY LABEL:</span>
          <span contenteditable="true" style="color:#CBD5E1; flex:1; margin-left:8px;">Value or specification detail...</span>
          <button class="incard-del-btn" onclick="this.closest('.incard-pair-wrapper').remove(); window.LayoutEngine.autoReflowPages();" style="background:#EF4444; color:#FFF; border:none; border-radius:4px; padding:1px 5px; font-size:0.65rem; cursor:pointer; margin-left:6px;" title="Delete Pair">✕</button>
        </div>
      `;
    } else if (type === 'code') {
      el.innerHTML = `
        <div style="background:#05070E; border:1px solid #1E293B; border-radius:6px; padding:8px 12px; font-family:'Fira Code',monospace; font-size:0.76rem; color:#00F0FF; position:relative;">
          <button class="incard-del-btn" onclick="this.closest('.incard-code-wrapper').remove(); window.LayoutEngine.autoReflowPages();" style="position:absolute; top:4px; right:4px; background:#EF4444; color:#FFF; border:none; border-radius:4px; padding:1px 5px; font-size:0.65rem; cursor:pointer;" title="Delete Code Block">✕</button>
          <pre contenteditable="true" style="margin:0; white-space:pre-wrap;">// Type code or syntax here...</pre>
        </div>
      `;
    }

    const container = card.querySelector('.card-body-text, .build-lab, .mistakes-list, .subcards-container, .build-steps-grid') || card;
    if (btnEl && btnEl !== card && btnEl.parentNode === container) {
      container.insertBefore(el, btnEl);
    } else {
      container.appendChild(el);
    }

    this.autoReflowPages();
  },

  renderSynthesizedCard(sec) {
    const card = this.makeCard('dynamic-synthesized-card');
    card.style.cssText += 'background:var(--bg-card, #0F172A); border:1.5px solid var(--accent-cyan, #00F0FF); border-radius:12px; padding:14px; margin:8px 0; position:relative; overflow:visible;';

    let subcardsHtml = '';
    if (sec.subcards && sec.subcards.length > 0) {
      subcardsHtml = `<div class="synthesized-subcards-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:8px; margin:8px 0;">` +
        sec.subcards.map((sc, idx) => `
          <div class="in-card-subcard card-base draggable-element" style="background:rgba(255,255,255,0.04); border:1.5px solid rgba(59,130,246,0.4); border-radius:8px; padding:8px 10px;">
            <div style="font-weight:700; font-size:0.75rem; color:#00F0FF; margin-bottom:4px;" contenteditable="true">${sc.title || `STEP ${idx + 1}`}</div>
            <div style="font-size:0.78rem; color:#CBD5E1;" contenteditable="true">${sc.body || ''}</div>
          </div>
        `).join('') + `</div>`;
    }

    let pairsHtml = '';
    if (sec.pairs && sec.pairs.length > 0) {
      pairsHtml = `<div class="synthesized-pairs-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:6px; margin:8px 0;">` +
        sec.pairs.map(p => `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(148,163,184,0.15); border-radius:6px; padding:6px 10px; font-size:0.76rem;">
            <span style="font-weight:700; color:#00F0FF;" contenteditable="true">${p.key}:</span>
            <span style="color:#CBD5E1; margin-left:6px;" contenteditable="true">${p.value}</span>
          </div>
        `).join('') + `</div>`;
    }

    let bulletsHtml = '';
    if (sec.bullets && sec.bullets.length > 0) {
      const bStyle = sec.bulletStyle || '✔';
      bulletsHtml = `<ul class="dynamic-bullets-list" data-bullet-style="${bStyle}" style="list-style:none; padding:0; margin:8px 0;">` +
        sec.bullets.map(b => `
          <li class="dynamic-bullet-item" style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
            <span class="bullet-dot">${bStyle}</span>
            <span class="bullet-text" contenteditable="true" style="font-size:0.8rem; color:#CBD5E1;">${b}</span>
            <button class="bullet-del-btn" onclick="this.closest('.dynamic-bullet-item').remove(); window.LayoutEngine.autoReflowPages();" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:0.7rem;">✕</button>
          </li>
        `).join('') + `</ul>`;
    }

    let calloutsHtml = '';
    if (sec.callouts && sec.callouts.length > 0) {
      calloutsHtml = sec.callouts.map(c => `
        <div class="incard-callout-box" style="display:flex; gap:8px; align-items:flex-start; padding:8px 12px; background:rgba(245,158,11,0.12); border-left:3px solid #F59E0B; border-radius:6px; margin:6px 0;">
          <span contenteditable="true" style="font-size:0.9rem;">${c.icon || '💡'}</span>
          <div contenteditable="true" style="font-size:0.78rem; color:#FDE68A; flex:1;">${c.text}</div>
        </div>
      `).join('');
    }

    let codeHtml = '';
    if (sec.codeText) {
      codeHtml = `
        <div style="background:#05070E; border:1px solid #1E293B; border-radius:6px; padding:8px 12px; font-family:'Fira Code',monospace; font-size:0.76rem; color:#00F0FF; margin:6px 0;">
          <pre contenteditable="true" style="margin:0; white-space:pre-wrap;">${this.escapeHtml(sec.codeText)}</pre>
        </div>
      `;
    }

    const bodyContent = sec.content || sec.text || '';
    const hasAnyContent = subcardsHtml || pairsHtml || bulletsHtml || calloutsHtml || codeHtml || bodyContent;

    // If completely empty section with no content or sub-elements, render a sleek subheader banner instead of a blank box
    if (!hasAnyContent) {
      return this.renderDynamicSubheader({ title: sec.title || 'SECTION', icon: sec.icon || '📌' });
    }

    const bodyHtml = (!subcardsHtml && !pairsHtml && !bulletsHtml && bodyContent)
      ? `<div class="card-body-text" contenteditable="true" style="font-size:0.82rem; color:#E2E8F0; margin:6px 0;">${this.formatText(bodyContent)}</div>`
      : '';

    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📌', sec.title || 'FEATURE CARD')}
      ${subcardsHtml}
      ${pairsHtml}
      ${bulletsHtml}
      ${calloutsHtml}
      ${codeHtml}
      ${bodyHtml}
      ${this.makeInCardToolbarHTML()}
    `;

    this._attachCardControls(card);
    return card;
  },

  renderDynamicSubheader(sec) {
    const titleUpper = (sec.title || sec.heading || '').trim().toUpperCase();
    if (titleUpper.includes('STACKED-CARDS') || titleUpper.includes('STACKED CARDS')) {
      return null;
    }
    const el = document.createElement('div');
    el.className = 'dynamic-subheader-card draggable-element';
    el.setAttribute('draggable', 'true');
    el.innerHTML = `
      <div class="dynamic-subheader-title" contenteditable="true">${sec.title || ''}</div>
      ${sec.content ? `<div class="dynamic-subheader-body" contenteditable="true">${sec.content}</div>` : ''}
    `;
    this._attachCardControls(el);
    return el;
  },

  renderDynamicTable(sec) {
    const card = this.makeCard('dynamic-table-card');
    const headers = sec.tableHeaders || [];
    const rows = sec.tableRows || [];
    let tableHtml = '';
    if (headers.length > 0) {
      const headerRow = `<tr>${headers.map(h => `<th contenteditable="true">${h}</th>`).join('')}</tr>`;
      const bodyRows = rows.map(r => `<tr>${r.map(c => `<td contenteditable="true">${c}</td>`).join('')}</tr>`).join('');
      tableHtml = `<table class="dynamic-table"><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
    } else if (sec.content) {
      tableHtml = `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content)}</div>`;
    }
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📊', sec.title || 'DATA TABLE')}
      ${tableHtml}
    `;
    this._attachCardControls(card);
    return card;
  },

  renderDynamicMixed(sec) {
    const card = this.makeCard('dynamic-mixed-card');
    const bullets = sec.bullets || [];
    const bulletHtml = bullets.length > 0
      ? `<ul class="dynamic-mixed-bullets">${bullets.map(b => `<li contenteditable="true">${b}</li>`).join('')}</ul>`
      : '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📦', sec.title || 'INFORMATION')}
      <div class="card-body-text" contenteditable="true">${this.formatText(sec.content || sec.text || '')}</div>
      ${bulletHtml}
    `;
    this._attachCardControls(card);
    return card;
  },

  renderDynamicCapsule(sec) {
    const card = this.makeCard('dynamic-capsule-card');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '💊', sec.title || 'HIGHLIGHT')}
      <div class="card-body-text" contenteditable="true" style="color:#E9D5FF;">${this.formatText(sec.content || sec.text || '')}</div>
    `;
    this._attachCardControls(card);
    return card;
  },

  renderDynamicComparison(sec) {
    const card = this.makeCard('dynamic-comparison-card');
    const leftItems = (sec.leftItems || []).map(i => `<div class="dynamic-comp-item"><span class="ci-icon">✅</span><span contenteditable="true">${i.text || i}</span></div>`).join('');
    const rightItems = (sec.rightItems || []).map(i => `<div class="dynamic-comp-item"><span class="ci-icon">✅</span><span contenteditable="true">${i.text || i}</span></div>`).join('');
    const fallback = (!leftItems && sec.content) ? `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content)}</div>` : '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '⚖️', sec.title || 'COMPARISON')}
      ${leftItems || rightItems ? `
        <div class="dynamic-comparison-grid">
          <div class="dynamic-comp-col comp-left">
            <div class="dynamic-comp-col-title" contenteditable="true">${sec.leftTitle || 'OPTION A'}</div>
            ${leftItems}
          </div>
          <div class="dynamic-vs-badge">VS</div>
          <div class="dynamic-comp-col comp-right">
            <div class="dynamic-comp-col-title" contenteditable="true">${sec.rightTitle || 'OPTION B'}</div>
            ${rightItems}
          </div>
        </div>` : fallback}
      ${sec.bottomNote ? `<div class="dynamic-comp-bottom" contenteditable="true">${sec.bottomNote}</div>` : ''}
    `;
    this._attachCardControls(card);
    return card;
  },

  renderDynamicImage(sec) {
    const card = this.makeCard('dynamic-image-card');
    const imgSrc = sec.imgUrl || '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🖼️', sec.title || 'IMAGE')}
      <div class="dynamic-image-frame image-frame-container" style="cursor:pointer;" title="Double-click to upload image">
        ${imgSrc ? `<img class="holder-img" src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;"/>` : `
          <div class="dynamic-image-placeholder">
            <span>🖼️</span>
            <p>Double-click to upload image</p>
          </div>`}
      </div>
      ${sec.caption ? `<div class="dynamic-image-caption" contenteditable="true">${sec.caption}</div>` : ''}
    `;
    this._attachCardControls(card);
    return card;
  },

  // ─── New: Knowledge Check ──────────────────────────────────
  renderKnowledgeCheck(sec) {
    const card = this.makeCard('knowledge-check-card theme-card-blue');
    const questions = sec.questions || (sec.content ? [sec.content] : []);
    const qHtml = questions.map((q, i) => `
      <div class="kc-question-item">
        <div class="kc-q-num">${i+1}</div>
        <div class="kc-q-text" contenteditable="true">${typeof q === 'string' ? q : (q.question || q.text || '')}</div>
        <div class="kc-answer-line"></div>
      </div>`).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '❓', sec.title || 'KNOWLEDGE CHECK')}
      <div class="kc-question-list">${qHtml || `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content || '')}</div>`}</div>
    `;
    this._attachCardControls(card);
    return card;
  },

  // ─── New: Vocabulary Builder ───────────────────────────────
  renderVocabularyBuilder(sec) {
    const card = this.makeCard('vocabulary-builder-card theme-card-purple');
    const bullets = sec.bullets || sec.items || [];
    const vocabHtml = bullets.map(b => {
      const parts = (typeof b === 'string' ? b : (b.text || '')).split(/[:–—]/,2);
      return `<div class="vocab-item">
        <span class="vocab-term" contenteditable="true">${parts[0]?.trim() || ''}</span>
        <span class="vocab-def" contenteditable="true">${parts[1]?.trim() || ''}</span>
      </div>`;
    }).join('');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📚', sec.title || 'VOCABULARY BUILDER')}
      <div class="vocab-list">${vocabHtml || `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content || '')}</div>`}</div>
    `;
    this._attachCardControls(card);
    return card;
  },

  // ─────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────
  getThemeClassForType(type) {
    if (!type) return 'theme-card-blue';
    const t = type.toLowerCase();
    if (/build|lab|test|habit|step|designer|action|device/.test(t)) return 'theme-card-green';
    if (/review|recap|badge|portfolio|progress|summary|beyond/.test(t)) return 'theme-card-orange';
    if (/innovation|ai|future|curiosity|know|think|challenge|predict/.test(t)) return 'theme-card-purple';
    if (/mistake|debug|error|safety|caution|warn/.test(t)) return 'theme-card-red';
    if (/note|vocab|career|parent|teacher|home|nova|fact|filler/.test(t)) return 'theme-card-slate';
    return 'theme-card-blue';
  },

  getIconForKeyword(keyword) {
    if (!keyword) return '📌';
    const k = (keyword || '').toLowerCase();
    if (/school|classroom/.test(k)) return '🏫';
    if (/lab|flask|beaker/.test(k)) return '🧪';
    if (/house|home/.test(k)) return '🏠';
    if (/weather|station|wind/.test(k)) return '🌬️';
    if (/plant|soil|farm|agri/.test(k)) return '🌱';
    if (/building|smart/.test(k)) return '🏢';
    if (/space|nasa|astronaut/.test(k)) return '🛸';
    if (/sensor|dht|temp/.test(k)) return '🌡️';
    if (/drop|water|humid/.test(k)) return '💧';
    if (/code|python|program/.test(k)) return '💻';
    if (/robot|arm|servo/.test(k)) return '🤖';
    if (/oled|screen|display/.test(k)) return '🖥️';
    return '📌';
  },

  formatText(txt) {
    if (!txt) return '';
    if (/<[a-z][\s\S]*>/i.test(txt)) return txt; // already HTML
    const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
    let html = '';
    let inList = false;
    let inChkList = false;

    lines.forEach(line => {
      // Checkbox lines (☐, □, ☑, [ ])
      if (/^[\u2610\u25A1\u2611\u2612]\s*/.test(line) || /^\[\s*\]\s*/.test(line)) {
        if (!inChkList) { if (inList) { html += '</ul>'; inList = false; } html += '<ul class="custom-chk-list">'; inChkList = true; }
        const clean = line.replace(/^[\u2610\u25A1\u2611\u2612]\s*/, '').replace(/^\[\s*\]\s*/, '');
        html += `<li class="custom-chk-item"><span class="chk-box">☐</span><span contenteditable="true" class="chk-label">${clean}</span></li>`;
      }
      // Standard bullet lines
      else if (/^[\u2022\u2714\u2705\u2B50\u2023\-\*•]\s*/.test(line)) {
        if (!inList) { if (inChkList) { html += '</ul>'; inChkList = false; } html += '<ul class="card-list">'; inList = true; }
        html += `<li contenteditable="true">${line.replace(/^[\u2022\u2714\u2705\u2B50\u2023\-\*•]\s*/, '')}</li>`;
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        if (inChkList) { html += '</ul>'; inChkList = false; }
        html += `<p contenteditable="true" style="margin:3px 0;">${line}</p>`;
      }
    });

    if (inList) html += '</ul>';
    if (inChkList) html += '</ul>';
    return html || `<p contenteditable="true">${txt}</p>`;
  },

  escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  // ─────────────────────────────────────────────────
  // AUTO-REFLOW + SMART STACKING
  // ─────────────────────────────────────────────────
  autoReflowPages() {
    // ── CLEANUP ORPHANED EMPTY CARDS ──────────────────────
    document.querySelectorAll('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, section.draggable-element').forEach(c => {
      const text = (c.textContent || '').replace(/⬆️ Fit|✕|⧉|➕ Add to Card:|📦 Sub-Card|📋 List|📄 Text|💡 Callout|🏷️ Pair|💻 Code/g, '').trim();
      const hasMedia = c.querySelector('img, svg, iframe, canvas, table, ul, ol, input, [contenteditable="true"]');
      if (!text && !hasMedia && !c.querySelector('.space-filler-inner') && !c.querySelector('.card-body-text') && !c.querySelector('.subcard-body')) {
        c.remove();
      }
    });

    const pages = document.querySelectorAll('.book-page');
    let hasReflowed = false;

    pages.forEach((page, pageIdx) => {
      const pageHeight = page.offsetHeight || 1123;
      const bodyContainer = page.querySelector('.page-body-container');
      if (!bodyContainer) return;

      // ── OVERFLOW: loop-push all overflowing cards (including cards overflowing 40-100px) to next page ──────────────
      const checkCardOverflow = () => {
        const cards = Array.from(bodyContainer.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > .split-layout, :scope > section, :scope > div:not(.page-background-overlay):not(.empty-page-placeholder)'));
        if (cards.length === 0) return false;

        const isScrollOverflow = bodyContainer.scrollHeight > (bodyContainer.clientHeight + 4);
        const lastCard = cards[cards.length - 1];
        const lastCardBottom = lastCard.offsetTop + lastCard.offsetHeight;
        const isCardPastBody = (lastCardBottom - bodyContainer.clientHeight) >= 20;

        return isScrollOverflow || isCardPastBody;
      };

      let isBodyOverflowing = checkCardOverflow();
      let safetyCounter = 0;

      while (isBodyOverflowing && safetyCounter < 15) {
        safetyCounter++;
        const cards = Array.from(bodyContainer.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > .split-layout, :scope > section, :scope > div:not(.page-background-overlay):not(.empty-page-placeholder)'));
        if (cards.length === 0) break;

        const cardToPush = cards[cards.length - 1];
        let nextPage = page.nextElementSibling;
        if (!nextPage || !nextPage.classList.contains('book-page')) {
          const mNum = page.dataset.missionNumber || '01';
          nextPage = this.createPageElement(
            { missionNumber: mNum, missionTitle: 'CONTINUED', missionSubtitle: '' },
            { sections: [], pageType: 'generic' },
            pageIdx + 2, pageIdx + 2
          );
          if (document.body.classList.contains('view-two-page')) {
            this.applyTwoPageSpreadMode();
          } else {
            if (page.parentNode) page.parentNode.insertBefore(nextPage, page.nextSibling);
          }
        }
        const nextBody = nextPage.querySelector('.page-body-container');
        if (nextBody) {
          const placeholder = nextBody.querySelector('.empty-page-placeholder');
          if (placeholder) placeholder.remove();
          nextBody.insertBefore(cardToPush, nextBody.firstChild);
          hasReflowed = true;
        } else {
          break;
        }

        isBodyOverflowing = checkCardOverflow();
      }

      // ── SMART STACKING: if page body has 15%+ space, pull cards from next page ──
      if (!isBodyOverflowing && bodyContainer.scrollHeight < bodyContainer.clientHeight * 0.85 && pageIdx < pages.length - 1) {
        const nextPage = pages[pageIdx + 1];
        if (nextPage && nextPage.classList.contains('book-page')) {
          const nextBody = nextPage.querySelector('.page-body-container');
          const thisBody = bodyContainer;
          if (nextBody && thisBody) {
            const nextCards = nextBody.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > .split-layout, :scope > section');
            if (nextCards.length > 0) {
              const cardToStack = nextCards[0];
              // Only pull if it's not a banner (don't pull page banners down)
              if (!cardToStack.classList.contains('page-type-banner')) {
                thisBody.appendChild(cardToStack);
                hasReflowed = true;
              }
            }
          }
        }
      }

      // ── PAGE OVERFLOW WARNING BADGE ────────────────────────
      let overflowBadge = page.querySelector('.page-overflow-badge');
      if (isBodyOverflowing) {
        page.classList.add('is-overflowing');
        if (!overflowBadge) {
          overflowBadge = document.createElement('div');
          overflowBadge.className = 'page-overflow-badge';
          overflowBadge.title = 'Click to auto-reflow overflow items to next page';
          overflowBadge.style.cssText = 'position:absolute; top:8px; right:8px; background:#EF4444; color:#FFF; font-size:0.68rem; font-weight:800; padding:4px 10px; border-radius:12px; z-index:9999; cursor:pointer; box-shadow:0 4px 12px rgba(239,68,68,0.5); display:flex; align-items:center; gap:6px;';
          overflowBadge.onclick = (e) => { e.stopPropagation(); this.autoReflowPages(); };
          page.appendChild(overflowBadge);
        }
        const overPx = Math.round(bodyContainer.scrollHeight - bodyContainer.clientHeight);
        overflowBadge.innerHTML = `⚠️ PAGE ${pageIdx + 1} OVERFLOWING (+${overPx}px) — Click to Reflow`;
      } else {
        page.classList.remove('is-overflowing');
        if (overflowBadge) overflowBadge.remove();
      }
    });

    // Renumber pages
    document.querySelectorAll('.book-page').forEach((p, idx) => {
      p.dataset.pageNum = idx + 1;
      const ribbon = p.querySelector('.page-ribbon');
      if (ribbon && !ribbon.isContentEditable) ribbon.textContent = `PAGE ${idx + 1}`;
      else if (ribbon && ribbon.textContent.match(/^PAGE \d+$/)) ribbon.textContent = `PAGE ${idx + 1}`;
    });

    if (hasReflowed) setTimeout(() => this.autoReflowPages(), 40);
  },

  checkOverflows() {
    this.autoReflowPages();
  },

  // ─────────────────────────────────────────────────
  // DRAG & MERGE HELPERS (for canvas editor)
  // ─────────────────────────────────────────────────
  mergeCardsSideBySide(card1, card2) {
    if (!card1 || !card2 || card1 === card2) return;
    const splitRow = document.createElement('div');
    splitRow.className = 'split-layout draggable-element';
    splitRow.setAttribute('draggable', 'true');
    const parent = card1.parentNode;
    parent.insertBefore(splitRow, card1);
    splitRow.appendChild(card1);
    splitRow.appendChild(card2);
    this.autoReflowPages();
    return splitRow;
  },

  unstackSplitLayout(splitEl) {
    if (!splitEl) return;
    const parent = splitEl.parentNode;
    if (!parent) return;
    const children = Array.from(splitEl.children);
    children.forEach(child => {
      child.style.flex = '';
      child.style.width = '';
      child.style.margin = '8px 0';
      parent.insertBefore(child, splitEl);
    });
    splitEl.remove();
    this.autoReflowPages();
  },

  createMultiImageGrid(cols, isIncard = false) {
    const grid = document.createElement('div');
    grid.className = 'multi-image-grid-row draggable-element';
    grid.setAttribute('draggable', 'true');
    grid.style.cssText = `display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;width:100%;margin:8px 0;`;
    for (let i = 1; i <= cols; i++) {
      const item = this.renderSection({ type: isIncard ? 'incard-image-holder' : 'image-holder', title: `Image ${i}`, icon: '🖼️', caption: `Image ${i}` });
      if (item) grid.appendChild(item);
    }
    return grid;
  }
};
