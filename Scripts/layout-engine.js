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

    if (window.NovaPoseEngine && typeof window.NovaPoseEngine.enrichMissionWithPoses === 'function') {
      missionObj = window.NovaPoseEngine.enrichMissionWithPoses(missionObj);
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
    const mNum = mission?.missionNumber || '';
    topBar.innerHTML = `
      <div class="page-ribbon" contenteditable="true" data-field="pageRibbon">PAGE ${pageNum}</div>
      ${mNum ? `<div class="top-mission-pill" contenteditable="true" data-field="missionPill">MISSION ${mNum}</div>` : ''}
      ${mNum ? `<div class="top-corner-badge">
        <span class="badge-text" contenteditable="true">MISSION</span>
        <span class="badge-num" contenteditable="true">${mNum}</span>
      </div>` : ''}
    `;
    page.appendChild(topBar);

    // Page 1 = Cover Header Banner (strictly only on physical Page 1)
    if (pageNum === 1) {
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
          if (sec.elementId && !secEl.querySelector('[data-element-id]') && !secEl.dataset.elementId) secEl.dataset.elementId = sec.elementId;
          if (sec.sourceElements && Array.isArray(sec.sourceElements)) {
            sec.sourceElements.forEach(se => {
              if (se && se.id) {
                const itemEl = secEl.querySelector(`[data-element-id="${se.id}"]`);
                if (itemEl) {
                  itemEl.dataset.elementId = se.id;
                  if (se.orderLocked) itemEl.dataset.orderLocked = "true";
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

    // Mascot: use real <img> tag with click-to-upload or Nova pose picker
    const fallbackMascot = window.NovaPoseEngine ? window.NovaPoseEngine.getPoseUrl('welcome') : 'Images/nova poses/welcome.png';
    const mascotSrc = (mission.mascotImg && !/[\u{1F300}-\u{1F9FF}]/u.test(mission.mascotImg) && mission.mascotImg.trim() !== '') ? mission.mascotImg : fallbackMascot;
    const mascotHtml = `<img src="${mascotSrc}" class="cover-mascot-img holder-img" style="width:72px;height:72px;object-fit:contain;border-radius:8px;cursor:pointer;" title="Commander Nova (Double-click to change pose or replace image)" />`;

    const guideNameHtml = mission.guideName ? `<span class="guide-name-badge" ${mission.guideElementId ? `data-element-id="${mission.guideElementId}"` : ''} contenteditable="true" data-field="guideName">${mission.guideName}</span>` : '';
    const guideRoleHtml = mission.guideRole ? `<span class="guide-role-label" ${mission.squadElementId ? `data-element-id="${mission.squadElementId}"` : ''} contenteditable="true" data-field="guideRole">${mission.guideRole}</span>` : '';
    const guideArea = (guideNameHtml || guideRoleHtml) ? `
      <div class="cover-guide-info">
        ${guideNameHtml}
        ${guideRoleHtml}
      </div>` : '';

    const canonicalResult = mission.canonicalResult || window.lastCanonicalResult;
    const titleElem = canonicalResult?.canonicalElements?.find(e => e.type === 'MISSION_TITLE');
    const titleElemId = mission.titleElementId || titleElem?.id || '';

    const metadataElems = canonicalResult?.metadata?.coverMetadataElements || [];
    const metaBadgesHtml = `
      <div class="cover-metadata-badges" style="display:flex; flex-wrap:wrap; justify-content:center; gap:6px; margin-top:8px;">
        ${metadataElems.map(elem => `
          <span class="cover-meta-badge" data-element-id="${elem.id}" style="position:relative; background:#F1F5F9; border:1px solid #CBD5E1; color:#334155; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:12px; display:inline-flex; align-items:center; gap:4px;">
            <span class="badge-text" contenteditable="true">${this.escapeHtml(elem.text)}</span>
            <button class="pill-del-btn" title="Delete Capsule" onclick="event.stopPropagation(); this.closest('.cover-meta-badge').remove(); window.LayoutEngine?.autoReflowPages();" style="width:14px; height:14px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:9px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; padding:0; line-height:1; margin-left:2px;">✕</button>
          </span>
        `).join('')}
        <button class="header-add-capsule-btn" onclick="event.stopPropagation(); window.LayoutEngine?.addCoverCapsule(this);" style="background:rgba(59,130,246,0.12); color:#2563EB; border:1px dashed #3B82F6; border-radius:12px; font-size:0.7rem; font-weight:700; padding:2px 8px; cursor:pointer; display:inline-flex; align-items:center; gap:3px;" title="Add Metadata Capsule">➕ Capsule</button>
        <button class="header-add-text-btn" onclick="event.stopPropagation(); window.LayoutEngine?.addCoverTextBox(this);" style="background:rgba(16,185,129,0.12); color:#059669; border:1px dashed #10B981; border-radius:12px; font-size:0.7rem; font-weight:700; padding:2px 8px; cursor:pointer; display:inline-flex; align-items:center; gap:3px;" title="Add Subtitle or Note Box">➕ Text Box</button>
      </div>
    `;

    const missionLabel = mission.missionNumber
      ? `MISSION ${mission.missionNumber}`
      : (mission.missionLabel || '');

    const titleText = mission.missionTitle || mission.title || '';
    const subtitleText = mission.missionSubtitle || '';
    const isDupSubtitle = metadataElems.some(m => (m.text && subtitleText && (m.text.includes(subtitleText) || subtitleText.includes(m.text))));
    const shouldRenderSubtitle = subtitleText && (mission.subtitleElementId || !isDupSubtitle);

    banner.innerHTML = `
      <div class="header-align-bar" style="position:absolute; top:8px; left:8px; display:flex; gap:3px; background:rgba(255,255,255,0.95); border:1px solid #CBD5E1; border-radius:6px; padding:2px; z-index:100; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
        <button class="header-align-btn" onclick="event.stopPropagation(); window.LayoutEngine?.setCoverHeaderAlign(this, 'left');" title="Align Left" style="padding:2px 6px; font-size:0.7rem; border:none; background:none; cursor:pointer; border-radius:4px;">⬅ Left</button>
        <button class="header-align-btn active" onclick="event.stopPropagation(); window.LayoutEngine?.setCoverHeaderAlign(this, 'center');" title="Align Center" style="padding:2px 6px; font-size:0.7rem; border:none; background:#E2E8F0; cursor:pointer; border-radius:4px;">⬌ Center</button>
        <button class="header-align-btn" onclick="event.stopPropagation(); window.LayoutEngine?.setCoverHeaderAlign(this, 'right');" title="Align Right" style="padding:2px 6px; font-size:0.7rem; border:none; background:none; cursor:pointer; border-radius:4px;">Right ➡</button>
      </div>
      <button class="header-del-btn" onclick="event.stopPropagation(); this.closest('.cover-header-banner, .mission-header-banner').remove(); window.LayoutEngine?.autoReflowPages();" style="position:absolute; top:8px; right:8px; background:#EF4444; color:#FFF; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:none; align-items:center; justify-content:center; z-index:999999; box-shadow:0 2px 8px rgba(0,0,0,0.5);" title="Delete Mission Header Banner">✕</button>
      <div class="cover-mascot-area" style="position:relative;">
        <button class="mascot-del-btn" onclick="event.stopPropagation(); this.closest('.cover-mascot-area').remove(); window.LayoutEngine?.autoReflowPages();" title="Remove Mascot & Guide Area" style="position:absolute; top:-6px; right:-6px; background:#EF4444; color:#FFF; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:99999; box-shadow:0 2px 6px rgba(0,0,0,0.4);">✕</button>
        <div class="cover-mascot-wrapper" style="position:relative; cursor:pointer; display:inline-block;" title="Double-click to upload/replace mascot image">
          ${mascotHtml}
        </div>
        ${guideArea}
      </div>
      <div class="cover-title-center">
        ${missionLabel ? `<div class="cover-mission-label" contenteditable="true" data-field="missionLabel">${missionLabel}</div>` : ''}
        <h1 class="cover-main-title" ${titleElemId ? `data-element-id="${titleElemId}"` : ''} contenteditable="true" data-field="missionTitle">${titleText}</h1>
        ${shouldRenderSubtitle ? `<p class="cover-subtitle" ${mission.subtitleElementId ? `data-element-id="${mission.subtitleElementId}"` : ''} contenteditable="true" data-field="missionSubtitle">${subtitleText}</p>` : ''}
        ${metaBadgesHtml}
      </div>
      <div class="cover-visual-area" style="position:relative;">
        <button class="mascot-del-btn" onclick="event.stopPropagation(); this.closest('.cover-visual-area').remove(); window.LayoutEngine?.autoReflowPages();" title="Remove Right Illustration" style="position:absolute; top:-6px; right:-6px; background:#EF4444; color:#FFF; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:99999; box-shadow:0 2px 6px rgba(0,0,0,0.4);">✕</button>
        <div class="cover-illustration-placeholder" style="cursor:pointer;" title="Double-click to upload cover illustration">
          <span class="cover-icon-big" title="Double-click to replace with image">🌦️</span>
        </div>
      </div>
    `;
    return banner;
  },

  setCoverHeaderAlign(btn, align = 'center') {
    const banner = btn.closest('.cover-header-banner, .mission-header-banner');
    if (!banner) return;
    const center = banner.querySelector('.cover-title-center');
    const badges = banner.querySelector('.cover-metadata-badges');
    if (center) {
      center.style.textAlign = align;
    }
    if (badges) {
      badges.style.justifyContent = align === 'left' ? 'flex-start' : (align === 'right' ? 'flex-end' : 'center');
    }
    banner.querySelectorAll('.header-align-btn').forEach(b => {
      b.classList.remove('active');
      b.style.background = 'none';
    });
    btn.classList.add('active');
    btn.style.background = '#E2E8F0';
    this.autoReflowPages();
  },

  addCoverCapsule(btn) {
    const container = btn.closest('.cover-metadata-badges') || btn.parentNode;
    const badge = document.createElement('span');
    badge.className = 'cover-meta-badge';
    badge.style.cssText = 'position:relative; background:#F1F5F9; border:1px solid #CBD5E1; color:#334155; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:12px; display:inline-flex; align-items:center; gap:4px;';
    badge.innerHTML = `
      <span class="badge-text" contenteditable="true">New Metadata</span>
      <button class="pill-del-btn" title="Delete Capsule" onclick="event.stopPropagation(); this.closest('.cover-meta-badge').remove(); window.LayoutEngine?.autoReflowPages();" style="width:14px; height:14px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:9px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; padding:0; line-height:1; margin-left:2px;">✕</button>
    `;
    container.insertBefore(badge, btn);
    const span = badge.querySelector('.badge-text');
    if (span) {
      span.focus();
      document.execCommand('selectAll', false, null);
    }
    this.autoReflowPages();
  },

  addCoverTextBox(btn) {
    const banner = btn.closest('.cover-header-banner, .mission-header-banner');
    const center = banner?.querySelector('.cover-title-center') || btn.parentNode;
    const p = document.createElement('p');
    p.className = 'cover-extra-text';
    p.contentEditable = "true";
    p.style.cssText = 'font-size:0.8rem; color:#475569; margin:4px 0; font-weight:500; line-height:1.45;';
    p.textContent = 'Type additional header notes or mission details...';
    const badges = center.querySelector('.cover-metadata-badges');
    if (badges) {
      center.insertBefore(p, badges);
    } else {
      center.appendChild(p);
    }
    p.focus();
    document.execCommand('selectAll', false, null);
    this.autoReflowPages();
  },

  renderIncardImageBoxHtml(promptText = '', imgUrl = '', idAttr = '') {
    const imgSrc = imgUrl || '';
    const cleanPrompt = promptText.replace(/^\(Space for illustration:?\s*/i, '').replace(/\)$/, '').trim() || 'Visual Illustration';
    return `
      <div class="incard-image-box draggable-element" draggable="true" style="position:relative; margin:8px 0; border:1.5px solid #CBD5E1; border-radius:8px; overflow:hidden; background:#FFFFFF; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div class="image-frame-container" style="width:100%; height:150px; min-height:80px; position:relative; overflow:hidden; background:#F8FAFC; cursor:pointer;" ondblclick="window.CanvasEditor?.triggerImageUpload(this)" title="Double-click to choose image">
          <img class="holder-img" src="${imgSrc}" style="width:100%; height:100%; object-fit:cover; display:${imgSrc ? 'block' : 'none'};" alt="${this.escapeHtml(cleanPrompt)}" />
          <div class="image-placeholder-prompt" onclick="window.CanvasEditor?.triggerImageUpload(this.parentElement)" style="display:${imgSrc ? 'none' : 'flex'}; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#64748B; font-size:0.8rem; gap:6px; cursor:pointer; padding:12px; text-align:center;">
            <span style="font-size:1.8rem; line-height:1;">🎨</span>
            <span style="font-weight:700; color:#2563EB;">Click or Double-Click to Choose Image</span>
            <p class="dynamic-paragraph image-slot-text"${idAttr} contenteditable="true" style="margin:0; font-size:0.72rem; color:#94A3B8; font-style:italic;">${this.escapeHtml(promptText)}</p>
          </div>
        </div>
        <div class="incard-bottom-capsule" contenteditable="true" style="padding:6px 12px; font-size:0.75rem; font-weight:700; color:#1E293B; text-align:center; background:rgba(37,99,235,0.06); border-top:1px solid #E2E8F0;">
          ${this.escapeHtml(cleanPrompt)}
        </div>
        <div class="incard-item-actions">
          <button class="incard-del-btn incard-dup-btn" title="Duplicate Image" onclick="event.stopPropagation(); const p = this.closest('.incard-image-box'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
          <button class="incard-del-btn" title="Delete Image" onclick="event.stopPropagation(); this.closest('.incard-image-box').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
        </div>
        <div class="um-resize-handle" title="Drag to resize height" style="position:absolute; bottom:0; right:0; width:14px; height:14px; cursor:se-resize; z-index:100; background:linear-gradient(135deg, transparent 50%, #94A3B8 50%); border-radius:0 0 6px 0;"></div>
      </div>
    `;
  },

  renderTableContentHtml(headers = [], rows = [], idAttr = '') {
    if (headers.length === 0 && rows.length > 0 && Array.isArray(rows[0])) {
      headers = rows[0].map((_, i) => `Col ${i + 1}`);
    } else if (headers.length === 0 && rows.length === 0) {
      headers = ['Header 1', 'Header 2', 'Header 3'];
      rows = [['Cell 1.1', 'Cell 1.2', 'Cell 1.3'], ['Cell 2.1', 'Cell 2.2', 'Cell 2.3']];
    }

    const headerThs = headers.map(h => `<th style="padding:6px 10px; text-align:left; background:rgba(37,99,235,0.08); font-size:0.75rem; color:#1E3A8A; font-weight:700; border:1px solid #CBD5E1;" contenteditable="true">${this.escapeHtml(h)}</th>`).join('');
    const thead = `<thead><tr>${headerThs}<th class="table-action-col" style="width:28px; padding:2px; text-align:center; background:rgba(0,0,0,0.03); border:1px solid #CBD5E1;"><button class="table-add-col-btn table-ctrl-btn" title="Add Column Right" onclick="event.stopPropagation(); window.LayoutEngine?.addTableColumn(this.closest('.dynamic-table-wrapper, .dynamic-table-card'))" style="border:none; background:#2563EB; color:#fff; border-radius:3px; cursor:pointer; font-size:10px; width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center;">+</button></th></tr></thead>`;

    const bodyRows = rows.map((r, rIdx) => {
      const tds = r.map(c => `<td style="padding:5px 10px; font-size:0.76rem; color:#1E293B; border:1px solid #CBD5E1;" contenteditable="true">${this.escapeHtml(c)}</td>`).join('');
      return `<tr>${tds}<td class="table-action-col" style="width:28px; padding:2px; text-align:center; border:1px solid #CBD5E1;"><button class="table-del-row-btn table-ctrl-btn" title="Delete Row" onclick="event.stopPropagation(); window.LayoutEngine?.deleteTableRow(this.closest('.dynamic-table-wrapper, .dynamic-table-card'), this.closest('tr'))" style="border:none; background:#EF4444; color:#fff; border-radius:3px; cursor:pointer; font-size:10px; width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center;">✕</button></td></tr>`;
    }).join('');

    return `
      <div class="table-control-bar" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; padding:3px 6px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px;">
        <span style="font-size:0.72rem; font-weight:700; color:#3B82F6; display:inline-flex; align-items:center; gap:4px;">
          📊 <span contenteditable="true">DATA TABLE</span>
        </span>
        <div class="table-btn-group" style="display:inline-flex; gap:4px; align-items:center;">
          <button class="table-ctrl-btn" onclick="event.stopPropagation(); window.LayoutEngine?.addTableRow(this.closest('.dynamic-table-wrapper, .dynamic-table-card'))" title="Add Row Below" style="padding:2px 7px; font-size:0.68rem; font-weight:600; background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; border-radius:4px; cursor:pointer;">➕ Row</button>
          <button class="table-ctrl-btn" onclick="event.stopPropagation(); window.LayoutEngine?.deleteTableRow(this.closest('.dynamic-table-wrapper, .dynamic-table-card'))" title="Delete Last Row" style="padding:2px 7px; font-size:0.68rem; font-weight:600; background:#FEF2F2; color:#B91C1C; border:1px solid #FECACA; border-radius:4px; cursor:pointer;">➖ Row</button>
          <button class="table-ctrl-btn" onclick="event.stopPropagation(); window.LayoutEngine?.addTableColumn(this.closest('.dynamic-table-wrapper, .dynamic-table-card'))" title="Add Column Right" style="padding:2px 7px; font-size:0.68rem; font-weight:600; background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; border-radius:4px; cursor:pointer;">➕ Col</button>
          <button class="table-ctrl-btn" onclick="event.stopPropagation(); window.LayoutEngine?.deleteTableColumn(this.closest('.dynamic-table-wrapper, .dynamic-table-card'))" title="Delete Last Column" style="padding:2px 7px; font-size:0.68rem; font-weight:600; background:#FEF2F2; color:#B91C1C; border:1px solid #FECACA; border-radius:4px; cursor:pointer;">➖ Col</button>
        </div>
      </div>
      <table class="dynamic-table"${idAttr} style="width:100%; border-collapse:collapse; border:1px solid #CBD5E1; border-radius:6px; overflow:hidden; background:#FFFFFF;">${thead}<tbody>${bodyRows}</tbody></table>
      <div class="incard-item-actions">
        <button class="incard-del-btn incard-dup-btn" title="Duplicate Table" onclick="event.stopPropagation(); const p = this.closest('.dynamic-table-wrapper'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
        <button class="incard-del-btn" title="Delete Table" onclick="event.stopPropagation(); this.closest('.dynamic-table-wrapper').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
      </div>
    `;
  },

  addTableRow(wrapper, targetTr = null) {
    if (!wrapper) return;
    const table = wrapper.querySelector('table');
    if (!table) return;
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody') || table;
    const headerThs = thead ? thead.querySelectorAll('th:not(.table-action-col)') : tbody.querySelector('tr')?.querySelectorAll('td:not(.table-action-col)');
    const colCount = Math.max(1, headerThs ? headerThs.length : 3);

    const tr = document.createElement('tr');
    let tds = '';
    for (let i = 0; i < colCount; i++) {
      tds += `<td style="padding:5px 10px; font-size:0.76rem; color:#1E293B; border:1px solid #CBD5E1;" contenteditable="true">New cell</td>`;
    }
    tds += `<td class="table-action-col" style="width:28px; padding:2px; text-align:center; border:1px solid #CBD5E1;"><button class="table-del-row-btn table-ctrl-btn" title="Delete Row" onclick="event.stopPropagation(); window.LayoutEngine?.deleteTableRow(this.closest('.dynamic-table-wrapper, .dynamic-table-card'), this.closest('tr'))" style="border:none; background:#EF4444; color:#fff; border-radius:3px; cursor:pointer; font-size:10px; width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center;">✕</button></td>`;
    tr.innerHTML = tds;

    if (targetTr && targetTr.parentNode === tbody) {
      tbody.insertBefore(tr, targetTr.nextSibling);
    } else {
      tbody.appendChild(tr);
    }
    const firstTd = tr.querySelector('td[contenteditable="true"]');
    if (firstTd) { firstTd.focus(); document.execCommand('selectAll', false, null); }
    this.autoReflowPages();
  },

  deleteTableRow(wrapper, targetTr = null) {
    if (!wrapper) return;
    const table = wrapper.querySelector('table');
    if (!table) return;
    const tbody = table.querySelector('tbody') || table;
    const rows = tbody.querySelectorAll('tr');
    if (rows.length === 0) return;
    if (targetTr && targetTr.parentNode === tbody) {
      targetTr.remove();
    } else {
      rows[rows.length - 1].remove();
    }
    this.autoReflowPages();
  },

  addTableColumn(wrapper) {
    if (!wrapper) return;
    const table = wrapper.querySelector('table');
    if (!table) return;
    const theadTr = table.querySelector('thead tr');
    if (theadTr) {
      const th = document.createElement('th');
      th.style.cssText = 'padding:6px 10px; text-align:left; background:rgba(37,99,235,0.08); font-size:0.75rem; color:#1E3A8A; font-weight:700; border:1px solid #CBD5E1;';
      th.contentEditable = "true";
      th.textContent = 'New Col';
      const actionTh = theadTr.querySelector('.table-action-col');
      if (actionTh) theadTr.insertBefore(th, actionTh);
      else theadTr.appendChild(th);
    }
    const tbody = table.querySelector('tbody') || table;
    tbody.querySelectorAll('tr').forEach((tr, idx) => {
      const td = document.createElement('td');
      td.style.cssText = 'padding:5px 10px; font-size:0.76rem; color:#1E293B; border:1px solid #CBD5E1;';
      td.contentEditable = "true";
      td.textContent = `Cell ${idx + 1}`;
      const actionTd = tr.querySelector('.table-action-col');
      if (actionTd) tr.insertBefore(td, actionTd);
      else tr.appendChild(td);
    });
    this.autoReflowPages();
  },

  deleteTableColumn(wrapper) {
    if (!wrapper) return;
    const table = wrapper.querySelector('table');
    if (!table) return;
    const theadTr = table.querySelector('thead tr');
    if (theadTr) {
      const ths = theadTr.querySelectorAll('th:not(.table-action-col)');
      if (ths.length > 1) {
        ths[ths.length - 1].remove();
      }
    }
    const tbody = table.querySelector('tbody') || table;
    tbody.querySelectorAll('tr').forEach(tr => {
      const tds = tr.querySelectorAll('td:not(.table-action-col)');
      if (tds.length > 1) {
        tds[tds.length - 1].remove();
      }
    });
    this.autoReflowPages();
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

    const pillsHtml = pills.map((p, idx) => `
      <span class="footer-code-pill-wrapper" style="position:relative; display:inline-flex; align-items:center;">
        <span class="footer-code-pill" contenteditable="true">${p}</span>
        <button class="incard-del-btn pill-del-btn" title="Delete Pill" onclick="event.stopPropagation(); this.closest('.footer-code-pill-wrapper').remove(); window.LayoutEngine?.autoReflowPages();" style="display:none; position:absolute; top:-6px; right:-6px; width:14px; height:14px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:9px; cursor:pointer; align-items:center; justify-content:center; padding:0; line-height:1; z-index:100;">✕</button>
      </span>
    `).join('<span class="footer-arrow">▶</span>');

    const nextMissionHtml = nextText ? `
      <div class="footer-next-zone" style="position:relative; display:inline-flex; align-items:center; gap:6px;">
        <span class="footer-next-label" contenteditable="true">NEXT MISSION</span>
        <span class="footer-next-text" contenteditable="true">${nextText}</span>
        <span class="footer-next-arrow">›</span>
        <button class="incard-del-btn footer-next-del-btn" title="Delete Next Mission Teaser" onclick="event.stopPropagation(); this.closest('.footer-next-zone').remove(); window.LayoutEngine?.autoReflowPages();" style="display:none; position:absolute; top:-6px; right:-6px; width:15px; height:15px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:9px; cursor:pointer; align-items:center; justify-content:center; padding:0; line-height:1; z-index:100;">✕</button>
      </div>
    ` : `
      <button class="footer-add-btn footer-add-next-btn" onclick="event.stopPropagation(); window.LayoutEngine?.addFooterNextMission(this);" title="Add Next Mission Teaser" style="background:rgba(37,99,235,0.15); color:#93C5FD; border:1px dashed rgba(59,130,246,0.5); border-radius:999px; padding:2px 8px; font-size:0.62rem; cursor:pointer; display:inline-flex; align-items:center; gap:3px;">+ Next Mission</button>
    `;

    footer.innerHTML = `
      <button class="footer-delete-btn" onclick="event.stopPropagation(); this.closest('.page-footer').remove(); window.LayoutEngine.autoReflowPages();" title="Delete Footer from Page">✕ Delete Footer</button>
      <div class="footer-pills-row">
        ${pillsHtml}
        <button class="footer-add-pill-btn" onclick="event.stopPropagation(); window.LayoutEngine?.addFooterPill(this);" title="Add New Pill" style="background:rgba(255,255,255,0.08); color:#94A3B8; border:1px dashed rgba(255,255,255,0.3); border-radius:999px; padding:2px 8px; font-size:0.62rem; cursor:pointer; display:inline-flex; align-items:center; gap:3px;">+ Pill</button>
        <button class="footer-add-tip-btn" onclick="event.stopPropagation(); window.LayoutEngine?.addFooterTip(this);" title="Add Footer Note or Tip" style="background:rgba(245,158,11,0.12); color:#FCD34D; border:1px dashed rgba(245,158,11,0.4); border-radius:999px; padding:2px 8px; font-size:0.62rem; cursor:pointer; display:inline-flex; align-items:center; gap:3px;">+ Tip</button>
      </div>
      <div class="footer-bottom-bar" style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top:4px;">
        <div class="footer-next-wrapper" style="display:inline-flex; align-items:center; gap:6px;">
          ${nextMissionHtml}
        </div>
        <div class="footer-brand-wrapper" style="position:relative; display:inline-flex; align-items:center; margin-left:auto;">
          <div class="footer-brand" contenteditable="true" style="font-size:0.7rem; color:#94A3B8; cursor:pointer;">${brand}</div>
          <button class="incard-del-btn footer-brand-del-btn" title="Delete Brand Tag" onclick="event.stopPropagation(); this.closest('.footer-brand-wrapper').remove(); window.LayoutEngine?.autoReflowPages();" style="display:none; position:absolute; top:-6px; right:-6px; width:15px; height:15px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:9px; cursor:pointer; align-items:center; justify-content:center; padding:0; line-height:1; z-index:100;">✕</button>
        </div>
      </div>
      <div class="um-resize-handle" title="Drag to resize footer height" style="position:absolute; top:0; right:0; width:14px; height:14px; cursor:ns-resize; z-index:100; background:linear-gradient(135deg, #00F0FF 50%, transparent 50%); border-radius:4px 0 0 0;"></div>
    `;

    return footer;
  },

  addFooterNextMission(btn) {
    const parent = btn.closest('.footer-next-wrapper') || btn.closest('.footer-bottom-bar') || btn.closest('.page-footer');
    if (!parent) return;
    const zone = document.createElement('div');
    zone.className = 'footer-next-zone';
    zone.style.cssText = 'position:relative; display:inline-flex; align-items:center; gap:6px;';
    zone.innerHTML = `
      <span class="footer-next-label" contenteditable="true">NEXT MISSION</span>
      <span class="footer-next-text" contenteditable="true">Phase 2: Assemble</span>
      <span class="footer-next-arrow">›</span>
      <button class="incard-del-btn footer-next-del-btn" title="Delete Next Mission Teaser" onclick="event.stopPropagation(); this.closest('.footer-next-zone').remove(); window.LayoutEngine?.autoReflowPages();" style="display:none; position:absolute; top:-6px; right:-6px; width:15px; height:15px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:9px; cursor:pointer; align-items:center; justify-content:center; padding:0; line-height:1; z-index:100;">✕</button>
    `;
    btn.replaceWith(zone);
    window.HistoryEngine?.pushState('Add Next Mission Teaser');
    window.LayoutEngine?.autoReflowPages();
  },

  addFooterTip(btn) {
    const row = btn.closest('.footer-pills-row') || btn.closest('.page-footer');
    if (!row) return;
    const tip = document.createElement('span');
    tip.className = 'footer-tip-zone';
    tip.style.cssText = 'position:relative; display:inline-flex; align-items:center; gap:4px; font-size:0.65rem; color:#CBD5E1; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:999px; margin-left:6px;';
    tip.innerHTML = `
      <span class="footer-tip-label" contenteditable="true" style="color:#F59E0B; font-weight:700;">PRO-TIP:</span>
      <span class="footer-tip-text" contenteditable="true">Always double check pin connections!</span>
      <button class="incard-del-btn" title="Delete Tip" onclick="event.stopPropagation(); this.closest('.footer-tip-zone').remove(); window.LayoutEngine?.autoReflowPages();" style="display:none; position:absolute; top:-6px; right:-6px; width:14px; height:14px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:9px; cursor:pointer; align-items:center; justify-content:center; padding:0; line-height:1; z-index:100;">✕</button>
    `;
    row.insertBefore(tip, btn);
    window.HistoryEngine?.pushState('Add Footer Tip');
  },

  addFooterPill(btn) {
    const row = btn.closest('.footer-pills-row');
    if (!row) return;
    const wrapper = document.createElement('span');
    wrapper.className = 'footer-code-pill-wrapper';
    wrapper.style.cssText = 'position:relative; display:inline-flex; align-items:center;';
    wrapper.innerHTML = `
      <span class="footer-code-pill" contenteditable="true">NEW_PILL</span>
      <button class="incard-del-btn pill-del-btn" title="Delete Pill" onclick="event.stopPropagation(); this.closest('.footer-code-pill-wrapper').remove(); window.LayoutEngine?.autoReflowPages();" style="display:none; position:absolute; top:-6px; right:-6px; width:14px; height:14px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:9px; cursor:pointer; align-items:center; justify-content:center; padding:0; line-height:1; z-index:100;">✕</button>
    `;
    const arrow = document.createElement('span');
    arrow.className = 'footer-arrow';
    arrow.textContent = '▶';
    arrow.style.cssText = 'color:#64748B; font-size:0.7rem; margin:0 2px;';

    row.insertBefore(arrow, btn);
    row.insertBefore(wrapper, btn);

    const pill = wrapper.querySelector('.footer-code-pill');
    if (pill) {
      pill.focus();
      document.execCommand('selectAll', false, null);
    }
  },

  addInCardItem(cardEl, type = 'paragraph') {
    if (!cardEl) return;
    const body = cardEl.querySelector('.card-body-text, .in-card-stack, .subcard-container, .in-card-content') || cardEl;
    const div = document.createElement('div');

    if (type === 'step') {
      div.className = 'procedure-step-item';
      div.style.cssText = 'display:flex; gap:8px; align-items:flex-start; margin:3px 0; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:6px; padding:4px 8px; position:relative;';
      div.innerHTML = `
        <span class="step-badge" style="color:#2563EB; font-weight:800; font-size:0.82rem; line-height:1.4;">▶</span>
        <div class="step-text" contenteditable="true" style="font-size:0.82rem; color:#1E293B; line-height:1.5; font-weight:500; flex:1;">New procedure step instruction...</div>
        <div class="incard-item-actions">
          <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
          <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
          <button class="incard-del-btn incard-style-btn" title="Toggle Box / Flat Style" onclick="event.stopPropagation(); window.LayoutEngine?.toggleItemBoxStyle(this)">📄</button>
          <button class="incard-del-btn incard-dup-btn" title="Duplicate Step" onclick="event.stopPropagation(); const p = this.closest('.procedure-step-item'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
          <button class="incard-del-btn" title="Delete Step" onclick="event.stopPropagation(); this.closest('.procedure-step-item').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
        </div>
      `;
    } else if (type === 'bullet') {
      div.className = 'dynamic-bullet-item';
      div.style.cssText = 'display:flex; align-items:flex-start; gap:8px; margin:4px 0; position:relative;';
      div.innerHTML = `
        <span class="bullet-dot" style="color:#2563EB; font-weight:bold; line-height:1.4;">✔</span>
        <span class="bullet-text" contenteditable="true" style="font-size:0.82rem; color:#1E293B; line-height:1.5; font-weight:500; flex:1;">New checklist item...</span>
        <div class="incard-item-actions" style="top:2px; right:4px;">
          <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
          <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
          <button class="incard-del-btn incard-dup-btn" title="Duplicate bullet" onclick="event.stopPropagation(); const p = this.closest('.dynamic-bullet-item'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
          <button class="bullet-del-btn incard-del-btn" title="Delete bullet" onclick="this.closest('.dynamic-bullet-item').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
        </div>
      `;
    } else if (type === 'callout') {
      div.className = 'um-callout-box';
      div.style.cssText = 'display:flex; gap:10px; align-items:flex-start; padding:8px 12px; background:#EFF6FF; border-left:3.5px solid #3B82F6; border-radius:6px; margin:6px 0; position:relative;';
      div.innerHTML = `
        <span style="font-size:1.1rem; line-height:1.2;">💡</span>
        <div style="flex:1;">
          <div style="font-weight:700; font-size:0.76rem; color:#3B82F6; text-transform:uppercase; margin-bottom:2px;" contenteditable="true">ENGINEERING TIP</div>
          <div class="callout-text" contenteditable="true" style="font-size:0.8rem; color:#1E3A8A; line-height:1.45; font-weight:500;">New insightful concept or pro tip...</div>
        </div>
        <div class="incard-item-actions">
          <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
          <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
          <button class="incard-del-btn incard-style-btn" title="Toggle Box / Flat Style" onclick="event.stopPropagation(); window.LayoutEngine?.toggleItemBoxStyle(this)">📄</button>
          <button class="incard-del-btn incard-dup-btn" title="Duplicate Callout" onclick="event.stopPropagation(); const p = this.closest('.um-callout-box'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
          <button class="incard-del-btn" title="Delete Callout" onclick="event.stopPropagation(); this.closest('.um-callout-box').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
        </div>
      `;
    } else if (type === 'code') {
      div.className = 'code-box';
      div.style.cssText = 'background:#05070E; border:1px solid #1E293B; border-radius:8px; padding:10px 12px; margin:8px 0; position:relative;';
      div.innerHTML = `
        <div class="code-header-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:4px;">
          <div style="display:flex; gap:5px;">
            <div class="code-dot code-dot-red" style="width:8px; height:8px; border-radius:50%; background:#EF4444;"></div>
            <div class="code-dot code-dot-yellow" style="width:8px; height:8px; border-radius:50%; background:#F59E0B;"></div>
            <div class="code-dot code-dot-green" style="width:8px; height:8px; border-radius:50%; background:#10B981;"></div>
          </div>
          <span style="font-size:0.65rem; color:#64748B; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;" contenteditable="true">PYTHON</span>
        </div>
        <pre class="code-content" style="margin:0; overflow-x:auto;"><code contenteditable="true" spellcheck="false" style="font-family:'Fira Code',monospace; font-size:0.76rem; color:#00F0FF; line-height:1.45; white-space:pre-wrap;"># Write your code here...</code></pre>
        <div class="incard-item-actions">
          <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
          <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
          <button class="incard-del-btn incard-dup-btn" title="Duplicate Code Box" onclick="event.stopPropagation(); const p = this.closest('.code-box'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
          <button class="incard-del-btn" title="Delete Code Box" onclick="event.stopPropagation(); this.closest('.code-box').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
        </div>
      `;
    } else if (type === 'image') {
      const boxHtml = this.renderIncardImageBoxHtml('Visual Illustration', '');
      const temp = document.createElement('div');
      temp.innerHTML = boxHtml;
      const box = temp.firstElementChild;
      body.appendChild(box);
      this.autoReflowPages();
      return;
    } else if (type === 'table') {
      const rInput = window.prompt ? window.prompt("Enter number of rows (e.g. 2):", "2") : "2";
      if (rInput === null) return;
      const cInput = window.prompt ? window.prompt("Enter number of columns (e.g. 3):", "3") : "3";
      if (cInput === null) return;

      const numRows = Math.max(1, parseInt(rInput, 10) || 2);
      const numCols = Math.max(1, parseInt(cInput, 10) || 3);

      const headers = [];
      for (let c = 1; c <= numCols; c++) headers.push(`Header ${c}`);
      const rows = [];
      for (let r = 1; r <= numRows; r++) {
        const row = [];
        for (let c = 1; c <= numCols; c++) row.push(`Cell ${r}.${c}`);
        rows.push(row);
      }

      div.className = 'dynamic-table-wrapper';
      div.style.cssText = 'position:relative; margin:8px 0;';
      div.innerHTML = this.renderTableContentHtml(headers, rows);
    } else if (type === 'line') {
      div.className = 'dynamic-paragraph-wrapper incard-text-line-wrapper';
      div.style.cssText = 'position:relative; margin:4px 0;';
      div.innerHTML = `
        <p class="dynamic-paragraph" contenteditable="true" style="margin:0; font-size:0.82rem; color:#1E293B; line-height:1.5; padding:2px 0;">New text line...</p>
        <div class="incard-item-actions">
          <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
          <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
          <button class="incard-del-btn incard-dup-btn" title="Duplicate line" onclick="event.stopPropagation(); const p = this.closest('.dynamic-paragraph-wrapper'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
          <button class="incard-del-btn" title="Delete line" onclick="event.stopPropagation(); this.closest('.dynamic-paragraph-wrapper').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
        </div>
      `;
    } else {
      div.className = 'dynamic-paragraph-wrapper';
      div.style.cssText = 'position:relative; margin:6px 0;';
      div.innerHTML = `
        <p class="dynamic-paragraph" contenteditable="true" style="margin:0; font-size:0.82rem; color:#1E293B; line-height:1.55;">New paragraph content...</p>
        <div class="incard-item-actions">
          <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
          <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
          <button class="incard-del-btn incard-dup-btn" title="Duplicate paragraph" onclick="event.stopPropagation(); const p = this.closest('.dynamic-paragraph-wrapper'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
          <button class="incard-del-btn" title="Delete paragraph" onclick="event.stopPropagation(); this.closest('.dynamic-paragraph-wrapper').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
        </div>
      `;
    }

    body.appendChild(div);
    const editable = div.querySelector('[contenteditable="true"]');
    if (editable) {
      editable.focus();
      document.execCommand('selectAll', false, null);
    }
    this.autoReflowPages();
    window.SaveEngine?._showToast(`Added new ${type} item!`);
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
      case 'dynamic-composed-card':  return this.renderDynamicComposedCard(sec, mission);
      case 'dynamic-content-card':   return this.renderDynamicComposedCard(sec, mission);
      case 'dynamic-procedure':      return this.renderDynamicProcedure(sec);
      case 'safety-card':            return this.renderSafetyCard(sec);
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
      case 'pure-image-holder':      return this.renderPureImageHolder(sec);
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
      <button class="um-qbtn um-qbtn-density" title="Card Density: Tight / Normal / Spacious" onclick="event.stopPropagation(); window.LayoutEngine?.toggleCardDensity(this)">⚡</button>
      <button class="um-qbtn um-qbtn-grid" title="Toggle 2-Column Grid Layout for Steps/Items" onclick="event.stopPropagation(); window.LayoutEngine?.toggleCardColumns(this)">▦</button>
      <button class="um-qbtn um-qbtn-flat" title="Toggle All In-Card Items Flat (Reclaim Page Space)" onclick="event.stopPropagation(); window.LayoutEngine?.toggleCardFlatSubitems(this)">📄</button>
      <button class="um-qbtn um-qbtn-font" title="Decrease Font Size (-1px)" onclick="event.stopPropagation(); window.LayoutEngine?.adjustCardFontSize(this, -1)">A−</button>
      <button class="um-qbtn um-qbtn-font" title="Increase Font Size (+1px)" onclick="event.stopPropagation(); window.LayoutEngine?.adjustCardFontSize(this, 1)">A+</button>
      <button class="um-qbtn um-qbtn-fit" title="Auto-Fit Height to Page Canvas" onclick="event.stopPropagation(); const c = this.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .draggable-element, section'); if (c) { c.style.height = 'auto'; c.style.minHeight = '100px'; window.LayoutEngine.autoReflowPages(); }">⬆️ Fit</button>
      <button class="um-qbtn um-qbtn-dup" title="Duplicate Card" onclick="event.stopPropagation(); window.ContextMenu?.duplicateElement(this.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .draggable-element, section'))">⧉</button>
      <button class="um-qbtn um-qbtn-del" title="Delete Card" onclick="event.stopPropagation(); window.ContextMenu?.deleteElement(this.closest('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, .draggable-element, section'))">✕</button>
    `;
    el.appendChild(qActions);
  },

  shiftItemLeft(btnOrEl) {
    const item = btnOrEl.closest ? btnOrEl.closest('.procedure-step-item, .dynamic-paragraph-wrapper, .cca-options-pill-box, .answer-key-ribbon-box, .incard-text-line-wrapper, .worksheet-q-item, .worksheet-a-item, .illustration-slot-box, .um-callout-box, .safety-box, .pro-tip-box, .assessment-q-card, .code-box, .dynamic-table-wrapper, .dynamic-bullet-item, .um-kv-badge') || btnOrEl : btnOrEl;
    if (!item) return;
    window.HistoryEngine?.pushState('Shift Item Left');
    const cur = parseFloat(item.style.marginLeft) || 0;
    const next = cur - 6;
    item.style.marginLeft = `${next}px`;
    window.SaveEngine?._showToast(`⬅ Shifted Left (${next}px)`);
    window.LayoutEngine?.autoReflowPages();
  },

  shiftItemRight(btnOrEl) {
    const item = btnOrEl.closest ? btnOrEl.closest('.procedure-step-item, .dynamic-paragraph-wrapper, .cca-options-pill-box, .answer-key-ribbon-box, .incard-text-line-wrapper, .worksheet-q-item, .worksheet-a-item, .illustration-slot-box, .um-callout-box, .safety-box, .pro-tip-box, .assessment-q-card, .code-box, .dynamic-table-wrapper, .dynamic-bullet-item, .um-kv-badge') || btnOrEl : btnOrEl;
    if (!item) return;
    window.HistoryEngine?.pushState('Shift Item Right');
    const cur = parseFloat(item.style.marginLeft) || 0;
    const next = cur + 6;
    item.style.marginLeft = `${next}px`;
    window.SaveEngine?._showToast(`➡ Shifted Right (${next}px)`);
    window.LayoutEngine?.autoReflowPages();
  },

  toggleItemBoxStyle(btnOrEl) {
    const item = btnOrEl.closest ? btnOrEl.closest('.procedure-step-item, .dynamic-paragraph-wrapper, .um-callout-box, .safety-box, .pro-tip-box, .assessment-q-card, .code-box, .dynamic-bullet-item') || btnOrEl : btnOrEl;
    if (!item) return;
    window.HistoryEngine?.pushState('Toggle Box / Flat Style');
    item.classList.toggle('flat-style');
    if (item.classList.contains('flat-style')) {
      item.dataset.prevBg = item.style.background || '';
      item.dataset.prevBorder = item.style.border || '';
      item.dataset.prevPadding = item.style.padding || '';
      item.style.background = 'transparent';
      item.style.border = 'none';
      item.style.padding = '2px 0';
      item.style.boxShadow = 'none';
      window.SaveEngine?._showToast('📄 Switched to Flat Compact Style');
    } else {
      item.style.background = item.dataset.prevBg || '#FFFFFF';
      item.style.border = item.dataset.prevBorder || '1px solid #E2E8F0';
      item.style.padding = item.dataset.prevPadding || '4px 8px';
      window.SaveEngine?._showToast('📦 Switched to Box Card Style');
    }
    window.LayoutEngine?.autoReflowPages();
  },

  toggleCardDensity(btnOrCard) {
    const card = btnOrCard.closest ? btnOrCard.closest('.card-base, .concept-card, .code-snippet-card, .draggable-element, section') : btnOrCard;
    if (!card) return;
    window.HistoryEngine?.pushState('Toggle Card Density');
    if (card.classList.contains('density-tight')) {
      card.classList.remove('density-tight');
      card.classList.add('density-spacious');
      window.SaveEngine?._showToast('📐 Density: Spacious');
    } else if (card.classList.contains('density-spacious')) {
      card.classList.remove('density-spacious');
      window.SaveEngine?._showToast('📐 Density: Normal');
    } else {
      card.classList.add('density-tight');
      window.SaveEngine?._showToast('⚡ Density: Tight (Space Saver)');
    }
    window.LayoutEngine?.autoReflowPages();
  },

  toggleCardColumns(btnOrCard) {
    const card = btnOrCard.closest ? btnOrCard.closest('.card-base, .concept-card, .code-snippet-card, .draggable-element, section') : btnOrCard;
    if (!card) return;
    window.HistoryEngine?.pushState('Toggle Card Columns');
    card.classList.toggle('grid-2col');
    const is2Col = card.classList.contains('grid-2col');
    window.SaveEngine?._showToast(is2Col ? '▦ 2-Column Grid Enabled' : '⬇ 1-Column Stack Restored');
    window.LayoutEngine?.autoReflowPages();
  },

  toggleCardFlatSubitems(btnOrCard) {
    const card = btnOrCard.closest ? btnOrCard.closest('.card-base, .concept-card, .code-snippet-card, .draggable-element, section') : btnOrCard;
    if (!card) return;
    window.HistoryEngine?.pushState('Toggle Card Subitems Flat');
    const items = card.querySelectorAll('.procedure-step-item, .um-callout-box, .pro-tip-box, .safety-box, .assessment-q-card');
    const anyFlat = Array.from(items).some(it => it.classList.contains('flat-style'));
    items.forEach(it => {
      if (anyFlat) {
        it.classList.remove('flat-style');
        it.style.background = it.dataset.prevBg || '#FFFFFF';
        it.style.border = it.dataset.prevBorder || '1px solid #E2E8F0';
        it.style.padding = it.dataset.prevPadding || '4px 8px';
      } else {
        it.classList.add('flat-style');
        it.dataset.prevBg = it.style.background || '';
        it.dataset.prevBorder = it.style.border || '';
        it.dataset.prevPadding = it.style.padding || '';
        it.style.background = 'transparent';
        it.style.border = 'none';
        it.style.padding = '2px 0';
        it.style.boxShadow = 'none';
      }
    });
    window.SaveEngine?._showToast(anyFlat ? '📦 All Items Restored to Boxes' : '📄 All Items Converted to Flat Style');
    window.LayoutEngine?.autoReflowPages();
  },

  adjustCardFontSize(btnOrCard, delta) {
    const card = btnOrCard.closest ? btnOrCard.closest('.card-base, .concept-card, .code-snippet-card, .draggable-element, section') : btnOrCard;
    if (!card) return;
    window.HistoryEngine?.pushState(`Adjust Font Size ${delta > 0 ? '+' : ''}${delta}`);
    const textNodes = card.querySelectorAll('.step-text, .bullet-text, .callout-text, .pro-tip-text, .dynamic-paragraph, .worksheet-question, p, span, li');
    textNodes.forEach(tn => {
      const curSize = parseFloat(window.getComputedStyle(tn).fontSize) || 13;
      const newSize = Math.max(9, Math.min(24, curSize + delta));
      tn.style.fontSize = `${newSize}px`;
    });
    window.SaveEngine?._showToast(`🔤 Font Size: ${delta > 0 ? '+' : ''}${delta}px`);
    window.LayoutEngine?.autoReflowPages();
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



  makeCapsuleHeader(icon, title, colorClass = '', titleElementId = null, mascotPoseUrl = null) {
    const mascotBadge = mascotPoseUrl
      ? `<span class="capsule-mascot-companion" style="margin-left:auto; display:inline-flex; align-items:center; position:relative; z-index:20; cursor:pointer;" title="Commander Nova Companion (Double-click to change pose)" ondblclick="event.stopPropagation(); window.NovaPoseEngine?.openPosePicker((p) => { const img = this.querySelector('img'); if (img) img.src = p; });">
          <img src="${mascotPoseUrl}" alt="Commander Nova" style="width:50px; height:50px; object-fit:contain; margin-top:-14px; margin-bottom:-14px; margin-right:-6px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35)); vertical-align:middle; transition:transform 0.15s ease;" onmouseover="this.style.transform='scale(1.12)'" onmouseout="this.style.transform='scale(1)'" />
          <button class="mascot-del-btn" onclick="event.stopPropagation(); this.closest('.capsule-mascot-companion').remove(); window.LayoutEngine?.autoReflowPages();" title="Remove Mascot" style="position:absolute; top:-10px; right:-6px; background:rgba(239,68,68,0.9); color:#fff; border:none; border-radius:50%; width:16px; height:16px; font-size:10px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; line-height:1; box-shadow:0 1px 4px rgba(0,0,0,0.3);">✕</button>
        </span>`
      : '';
    return `<div class="capsule-header ${colorClass}" style="display:flex; align-items:center; position:relative; overflow:visible !important;">
      <span class="round-icon-badge" style="position:relative; overflow:visible; flex-shrink:0;">
        ${icon || '📌'}
        <button class="mascot-del-btn" onclick="event.stopPropagation(); this.closest('.round-icon-badge').remove(); window.LayoutEngine?.autoReflowPages();" title="Remove Icon Badge">✕</button>
      </span>
      <span class="card-title-text"${titleElementId ? ` data-element-id="${titleElementId}"` : ''} contenteditable="true" style="flex:1;">${title || ''}</span>
      <span class="capsule-resize-handle" draggable="false" title="Drag to adjust capsule width/height, double-click to reset" onpointerdown="window.CanvasEditor?.startCapsuleResize(event, this)">⬌</span>
      ${mascotBadge}
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
    sticker.style.cssText = 'position:absolute;top:120px;right:30px;width:150px;height:150px;z-index:100;cursor:move;user-select:none;-webkit-user-drag:none;';
    const fallbackPose = window.NovaPoseEngine ? window.NovaPoseEngine.getPoseUrl('greeting') : 'Images/nova poses/greeting.png';
    const rawSrc = sec.imgUrl || sec.image || '';
    const imgSrc = (rawSrc && !/[\u{1F300}-\u{1F9FF}]/u.test(rawSrc) && rawSrc.trim() !== '') ? rawSrc : fallbackPose;
    sticker.innerHTML = `<img src="${imgSrc}" class="clipart-img" draggable="false" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.3));pointer-events:none;-webkit-user-drag:none;user-select:none;"/>`;
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
    const idAttr = sec.elementId ? ` data-element-id="${sec.elementId}"` : '';
    el.innerHTML = `
      <div class="page-banner-left">
        <span class="page-banner-icon" contenteditable="true">${sec.icon || '🔍'}</span>
      </div>
      <div class="page-banner-center">
        <div class="page-banner-title"${idAttr} contenteditable="true">${sec.title || ''}</div>
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
    const images = (sec.images || []).map(img => `
      <div class="story-img-sticker" style="position:relative; overflow:visible;" title="Double-click to replace image">
        <span class="sticker-icon-content">${this.getIconForKeyword(img)}</span>
        <button class="mascot-del-btn" onclick="event.stopPropagation(); window.CanvasEditor.deleteMascotOrIcon(this);" title="Delete Sticker">✕</button>
      </div>
    `).join('');
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
      ${this.makeCapsuleHeader(sec.icon || '💡', sec.title || 'CURIOSITY BOX', '', null, sec.mascotPoseUrl)}
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
      ${this.makeCapsuleHeader(sec.icon || '⚙️', sec.title || 'STEM FACT', '', null, sec.mascotPoseUrl)}
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
      ${this.makeCapsuleHeader(sec.icon || '🧠', sec.title || 'THINK LIKE AN ENGINEER', '', null, sec.mascotPoseUrl)}
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
      ${this.makeCapsuleHeader(sec.icon || '⚠️', sec.title || 'COMMON MISTAKES', '', null, sec.mascotPoseUrl)}
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
    if (sec.elementId) card.dataset.elementId = sec.elementId;
    const code = sec.code || sec.content || '// Code here';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '💻', sec.title || 'CODE SNIPPET', 'theme-card-dark', sec.titleElementId)}
      <div class="code-box">
        <div class="code-header-bar">
          <div class="code-dot code-dot-red"></div>
          <div class="code-dot code-dot-yellow"></div>
          <div class="code-dot code-dot-green"></div>
          <span class="lang-badge">${sec.language || 'python'}</span>
        </div>
        <pre class="code-content"><code${sec.elementId ? ` data-element-id="${sec.elementId}"` : ''} contenteditable="true" spellcheck="false">${this.escapeHtml(code)}</code></pre>
      </div>
      ${sec.annotations ? `<div class="code-annotations">${(sec.annotations || []).map(a => `<div class="code-annotation" contenteditable="true">${a}</div>`).join('')}</div>` : ''}
    `;
    this._attachCardControls(card);
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
      ${this.makeCapsuleHeader(sec.icon || '💡', sec.title || 'DID YOU KNOW?', '', null, sec.mascotPoseUrl)}
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
    const celebrationPose = (sec.mascotImg && !/[\u{1F300}-\u{1F9FF}]/u.test(sec.mascotImg)) ? sec.mascotImg : (window.NovaPoseEngine ? window.NovaPoseEngine.getPoseUrl('celebration') : 'Images/nova poses/celebration.png');
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
          <div class="badge-mascot" style="cursor:pointer;" title="Commander Nova (Double-click to change pose)" ondblclick="window.NovaPoseEngine?.openPosePicker((p) => { const img = this.querySelector('img'); if (img) img.src = p; });"><img src="${celebrationPose}" alt="Commander Nova Celebration" style="width:72px; height:72px; object-fit:contain;" /></div>
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
    const imgSrc = sec.imgUrl || sec.image || '';
    card.innerHTML = `
      <div class="image-frame-container" style="height:180px;overflow:hidden;border-radius:8px;background:transparent;border:1.5px dashed rgba(59,130,246,0.3);cursor:pointer;position:relative;">
        <img class="holder-img" src="${imgSrc}" style="width:100%;height:100%;object-fit:${sec.objectFit || 'cover'};object-position:${sec.objectPosition || 'center'};display:${imgSrc ? 'block' : 'none'};pointer-events:auto;" title="Double-click to replace image" />
        <div class="img-placeholder-label" style="display:${imgSrc ? 'none' : 'flex'};align-items:center;justify-content:center;height:100%;color:#475569;font-size:0.85rem;">📷 Click / Double-Click to Upload Image</div>
      </div>
      ${sec.caption ? `<div class="card-caption-text" contenteditable="true">${sec.caption}</div>` : ''}
    `;
    return card;
  },

  renderIncardImage(sec) {
    const html = this.renderIncardImageBoxHtml(sec.title || sec.caption || 'Image', sec.imgUrl || '', sec.elementId ? ` data-element-id="${sec.elementId}"` : '');
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.firstElementChild;
  },

  renderPureImageHolder(sec) {
    const card = document.createElement('div');
    card.className = 'pure-image-holder-card card-base draggable-element bezel-free-pure-image';
    card.setAttribute('draggable', 'true');
    if (sec.elementId) card.dataset.elementId = sec.elementId;
    card.dataset.bezelFree = 'true';

    const imgSrc = sec.imgUrl || sec.image || '';
    const bWidth = sec.borderWidth !== undefined ? parseInt(sec.borderWidth) : 0;
    const bStyle = sec.borderStyle || (bWidth > 0 ? 'solid' : 'none');
    const bColor = sec.borderColor || '#2563EB';
    const bRadius = sec.borderRadius !== undefined ? parseInt(sec.borderRadius) : 8;
    const borderCss = bWidth > 0 && bStyle !== 'none' ? `border:${bWidth}px ${bStyle} ${bColor};` : 'border:none;';

    card.style.cssText = `position:relative; margin:8px 0; padding:0; background:transparent; border:none; box-shadow:none; overflow:visible; border-radius:${bRadius}px;`;

    card.innerHTML = `
      <div class="image-frame-container" style="width:100%; height:180px; min-height:60px; position:relative; overflow:hidden; background:transparent; cursor:pointer; border-radius:${bRadius}px; ${borderCss}" ondblclick="window.CanvasEditor?.triggerImageUpload(this)" title="Double-click to choose image">
        <img class="holder-img" src="${imgSrc}" style="width:100%; height:100%; object-fit:${sec.objectFit || 'cover'}; object-position:${sec.objectPosition || 'center'}; display:${imgSrc ? 'block' : 'none'}; border-radius:inherit;" alt="Pure Image" />
        <div class="image-placeholder-prompt" onclick="window.CanvasEditor?.triggerImageUpload(this.parentElement)" style="display:${imgSrc ? 'none' : 'flex'}; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#64748B; font-size:0.85rem; gap:6px; cursor:pointer; padding:12px; text-align:center; background:rgba(0,240,255,0.04); border:1.5px dashed rgba(0,240,255,0.4); border-radius:inherit;">
          <span style="font-size:2rem; line-height:1;">🖼️</span>
          <span style="font-weight:700; color:#00F0FF;">Pure Image Box (Bezel-Free)</span>
          <span style="font-size:0.7rem; color:#94A3B8;">Double-click or click to choose image</span>
        </div>
      </div>
      <div class="incard-item-actions">
        <button class="incard-del-btn incard-dup-btn" title="Duplicate Image" onclick="event.stopPropagation(); window.ContextMenu?.duplicateImageBox();">⧉</button>
        <button class="incard-del-btn" title="Delete Image" onclick="event.stopPropagation(); this.closest('.pure-image-holder-card').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
      </div>
      <div class="um-resize-handle" title="Drag to resize height" style="position:absolute; bottom:0; right:0; width:14px; height:14px; cursor:se-resize; z-index:100; background:linear-gradient(135deg, transparent 50%, #94A3B8 50%); border-radius:0 0 6px 0;"></div>
    `;
    return card;
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
    if (sec.elementId) card.dataset.elementId = sec.elementId;

    let questionsHtml = '';
    if (sec.questions && Array.isArray(sec.questions) && sec.questions.length > 0) {
      questionsHtml = sec.questions.map((q, idx) => {
        const qId = typeof q === 'object' ? q.elementId : '';
        const qText = typeof q === 'object' ? q.text : q;
        return `
          <div class="worksheet-q-item" style="margin:8px 0;">
            <div class="worksheet-question"${qId ? ` data-element-id="${qId}"` : ''} contenteditable="true" style="font-weight:600; font-size:0.82rem; color:#93C5FD; margin-bottom:4px;">${this.escapeHtml(qText)}</div>
            <div class="worksheet-line" style="border-bottom:1px dashed rgba(148,163,184,0.3); height:20px; margin:4px 0;"></div>
          </div>
        `;
      }).join('');
    }

    let answersHtml = '';
    if (sec.answers && Array.isArray(sec.answers) && sec.answers.length > 0) {
      answersHtml = sec.answers.map(a => {
        const aId = typeof a === 'object' ? a.elementId : '';
        const aText = typeof a === 'object' ? a.text : a;
        return `
          <div class="worksheet-a-item" style="margin:4px 0;">
            <div class="worksheet-answer"${aId ? ` data-element-id="${aId}"` : ''} contenteditable="true" style="font-size:0.8rem; color:#A7F3D0;">${this.escapeHtml(aText)}</div>
          </div>
        `;
      }).join('');
    }

    const bodyText = sec.content ? `<div class="card-body-text" contenteditable="true">${this.escapeHtml(sec.content)}</div>` : '';
    const fallbackLines = (!questionsHtml && !answersHtml && !bodyText) ? Array(4).fill('<div class="worksheet-line"></div>').join('') : '';

    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📝', sec.title || 'WORKSHEET', 'theme-card-blue', sec.titleElementId)}
      ${bodyText}
      ${questionsHtml}
      ${answersHtml}
      ${fallbackLines}
    `;
    this._attachCardControls(card);
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

  renderDynamicComposedCard(sec, mission) {
    if (sec.type === 'dynamic-comparison' || sec.subtype === 'match-pairs' || sec.subtype === 'code-compare') {
      return this.renderDynamicComparison(sec);
    }

    // Auto-delegate Match the Pairs to two-sided comparison card
    if (/MATCH\s*(?:THE)?\s*PAIRS|MATCH\s*(?:THE)?\s*FOLLOWING/i.test(sec.title || '') ||
        (sec.items && sec.items.some(i => /match\s*each.*with/i.test(i.text || '')))) {
      const matchData = window.DynamicCardComposer?.parseMatchPairs
        ? window.DynamicCardComposer.parseMatchPairs(sec.items || [])
        : null;
      if (matchData) {
        sec.type = 'dynamic-comparison';
        sec.subtype = 'match-pairs';
        sec.isMatchPairs = true;
        sec.icon = sec.icon || '🧩';
        sec.title = sec.title || 'MATCH THE PAIRS';
        sec.prompt = matchData.prompt || sec.prompt;
        sec.leftTitle = 'COLUMN A (TERMS)';
        sec.rightTitle = 'COLUMN B (DUTIES)';
        sec.leftItems = matchData.leftItems;
        sec.rightItems = matchData.rightItems;
        sec.badgeText = '⟷';
        sec.bottomNote = matchData.bottomNote;
        return this.renderDynamicComparison(sec);
      }
    }

    // Auto-delegate Code Logic Mystery / Code Compare to two-sided comparison card
    const codeItem = sec.items && sec.items.find(i => i.type === 'CODE_COMPARISON');
    if (codeItem || /CODE\s*(?:LOGIC\s*)?MYSTERY|CODE\s*COMPARE|ALGORITHMIC\s*COMPARISON/i.test(sec.title || '')) {
      const rawText = codeItem ? codeItem.text : (sec.items && sec.items[0] ? sec.items[0].text : '');
      const codeData = window.DynamicCardComposer?.parseTwoSidedCodeCompare
        ? window.DynamicCardComposer.parseTwoSidedCodeCompare(rawText)
        : null;
      if (codeData && (codeData.leftCode || codeData.rightCode)) {
        const promptElem = sec.items && sec.items.find(i => i.type === 'PARAGRAPH' && /^["'“]/.test((i.text || '').trim()));
        sec.type = 'dynamic-comparison';
        sec.subtype = 'code-compare';
        sec.isCodeCompare = true;
        sec.icon = sec.icon || '⚖️';
        sec.title = sec.title || "NOVA'S CODE LOGIC MYSTERY";
        sec.prompt = promptElem ? promptElem.text.replace(/^["'“]|["'”]$/g, '').trim() : (sec.prompt || '');
        sec.leftTitle = codeData.leftTitle;
        sec.rightTitle = codeData.rightTitle;
        sec.leftCode = codeData.leftCode;
        sec.rightCode = codeData.rightCode;
        sec.leftNotes = codeData.leftNotes;
        sec.rightNotes = codeData.rightNotes;
        sec.leftItems = [{ icon: '❌', text: codeData.leftCode }];
        sec.rightItems = [{ icon: '✅', text: codeData.rightCode }];
        sec.badgeText = 'VS';
        sec.bottomNote = codeData.bottomNote;
        return this.renderDynamicComparison(sec);
      }
    }

    const cardTheme = sec.cardStyle || window.SemanticSorter?.detectTheme(sec.semanticCategory || '', sec.title || '') || 'theme-card-blue';
    const card = this.makeCard(`dynamic-composed-card dynamic-card ${cardTheme}`);

    let itemsHtml = '';
    if (sec.items && Array.isArray(sec.items)) {
      itemsHtml = sec.items.map(item => this.renderInCardItem(item)).join('');
    } else if (sec.content || sec.text) {
      itemsHtml = `<p class="dynamic-paragraph" contenteditable="true" style="margin:6px 0; font-size:0.82rem; color:#1E293B; line-height:1.55;">${this.escapeHtml(sec.content || sec.text)}</p>`;
    }

    if (sec.isDialogueCallout) {
      card.className = 'dynamic-composed-card dynamic-card dialogue-callout-card';
      card.style.cssText = 'background:transparent; border:none; box-shadow:none; padding:0; margin:3px 0; min-height:unset;';
      const novaPose = sec.mascotPoseUrl || (window.NovaPoseEngine ? window.NovaPoseEngine.getPoseUrl('greeting') : 'Images/nova poses/greeting.png');
      const rawText = (sec.content || sec.text || '').replace(/^["']|["']$/g, '').trim();
      const textLine = rawText ? `"${this.escapeHtml(rawText)}"` : itemsHtml;

      card.innerHTML = `
        <div class="mission-dialogue-callout" style="display:flex; align-items:center; gap:10px; background:linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%); border:1.5px solid #BFDBFE; border-radius:10px; padding:6px 12px; margin:0; box-shadow:0 1px 4px rgba(37,99,235,0.06);">
          <div style="flex-shrink:0; cursor:pointer;" title="Commander Nova (Double-click to change pose)" ondblclick="window.NovaPoseEngine?.openPosePicker((p) => { const img = this.querySelector('img'); if (img) img.src = p; });">
            <img src="${novaPose}" alt="Commander Nova" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;" />
          </div>
          <div style="flex:1; min-width:0; line-height:1.25;">
            <div style="font-size:0.65rem; font-weight:800; color:#2563EB; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:1px;">NOVA'S FIELD DISPATCH</div>
            <div class="dialogue-dispatch-text" contenteditable="true" style="font-size:0.8rem; color:#1E293B; font-weight:500; margin:0; white-space:normal;">${textLine}</div>
          </div>
        </div>
      `;
      this._attachCardControls(card);
      return card;
    }

    const isPhase = sec.isPhaseHeader || /(?:PAGE|PHASE)\s*\d+/i.test(sec.title || '');
    const headerHtml = this.makeCapsuleHeader(
      sec.icon || (isPhase ? '📘' : '📌'),
      sec.title || '',
      isPhase ? 'phase-header-glow' : cardTheme,
      sec.titleElementId || sec.elementId,
      sec.mascotPoseUrl
    );

    const badgeHtml = sec.badge
      ? `<div class="card-top-badge" style="position:absolute; top:10px; right:12px; font-size:0.65rem; font-weight:700; letter-spacing:0.05em; padding:2px 8px; border-radius:12px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#94A3B8; text-transform:uppercase;">${this.escapeHtml(sec.badge)}</div>`
      : '';

    card.innerHTML = `
      ${headerHtml}
      ${badgeHtml}
      <div class="card-body-items" style="margin-top:6px;">
        ${itemsHtml}
      </div>
      ${this.makeInCardToolbarHTML()}
    `;

    this._attachCardControls(card);
    return card;
  },

  renderDynamicContentCard(sec) {
    return this.renderDynamicComposedCard(sec);
  },

  renderInCardItem(item) {
    if (!item) return '';
    const idAttr = item.id ? ` data-element-id="${item.id}"` : (item.elementId ? ` data-element-id="${item.elementId}"` : '');
    const nodeType = item.nodeType || item.type;

    switch (nodeType) {
      case 'RadioTransmission':
      case 'RADIO_TRANSMISSION': {
        const text = item.text || item.content || '';
        return `
          <div class="radio-transmission-card"${idAttr} style="background:linear-gradient(135deg, #FFFDF5 0%, #FEF9C3 100%); border:1.5px solid #FCD34D; border-left:4px solid #F59E0B; border-radius:12px; padding:12px 14px; margin:6px 0; box-shadow:0 3px 10px rgba(245,158,11,0.08);">
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #FDE68A; padding-bottom:5px; margin-bottom:8px;">
              <span style="font-size:0.75rem; font-weight:900; color:#92400E; text-transform:uppercase; letter-spacing:0.05em; display:flex; align-items:center; gap:6px;">
                📻 LIVE RADIO DISPATCH | 142.8 MHz
              </span>
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.65rem; font-weight:800; color:#15803D; background:#DCFCE7; border:1px solid #86EFAC; padding:2px 8px; border-radius:12px;">
                <span style="width:6px; height:6px; border-radius:50%; background:#22C55E; display:inline-block; box-shadow:0 0 6px #22C55E;"></span> CONNECTED
              </span>
            </div>
            <div class="transmission-text" contenteditable="true" style="font-size:0.82rem; color:#78350F; line-height:1.55; white-space:pre-wrap; font-weight:500;">${this.escapeHtml(text)}</div>
          </div>`;
      }

      case 'AsciiBlueprint':
      case 'ASCII_BLUEPRINT': {
        const text = item.text || item.content || '';
        return `
          <div class="blueprint-box"${idAttr} style="background:#09192F; border:1.5px solid #00F0FF; border-radius:8px; padding:12px 14px; margin:8px 0; position:relative; overflow-x:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-bottom:1px solid rgba(0,240,255,0.2); padding-bottom:4px;">
              <span style="font-size:0.68rem; font-weight:800; color:#00F0FF; letter-spacing:0.06em; text-transform:uppercase;">📐 MECHANICAL ARCHWAY BLUEPRINT (SCALE 1:1)</span>
              <span style="font-size:0.62rem; color:#64748B; font-family:monospace;">DWG #M4-01</span>
            </div>
            <pre style="margin:0; font-family:'Fira Code',Consolas,monospace; font-size:0.75rem; color:#38BDF8; line-height:1.45; white-space:pre;">${this.escapeHtml(text)}</pre>
          </div>`;
      }

      case 'CodeComparison':
      case 'CODE_COMPARISON': {
        const text = item.text || item.content || '';
        const parsed = (typeof window.DynamicCardComposer?.parseTwoSidedCodeCompare === 'function')
          ? window.DynamicCardComposer.parseTwoSidedCodeCompare(text)
          : null;

        if (parsed && (parsed.leftCode || parsed.rightCode)) {
          const mysteryTitle = item.title || "CODE LOGIC MYSTERY";
          return `
            <div class="code-comparison-box dynamic-comparison-card"${idAttr} style="background:#0F172A; border:1.5px solid #1E3A8A; border-radius:12px; padding:12px 14px; margin:8px 0; box-shadow:0 6px 20px rgba(0,0,0,0.35); width:100%; box-sizing:border-box;">
              <div style="font-size:0.72rem; font-weight:800; color:#38BDF8; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.05em; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(56,189,248,0.2); padding-bottom:6px;">
                <span>⚖️ ${this.escapeHtml(mysteryTitle)}</span>
                <span style="font-size:0.63rem; color:#38BDF8; background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:4px; font-weight:700;">ALGORITHMIC COMPARISON</span>
              </div>
              <div class="dynamic-comparison-grid code-comparison-grid" style="display:grid; grid-template-columns:1fr auto 1fr; gap:10px; align-items:stretch;">
                <div class="dynamic-comp-col comp-left comp-code-col" style="display:flex; flex-direction:column; background:rgba(239,68,68,0.06); border:1.5px solid rgba(239,68,68,0.35); border-radius:8px; padding:8px;">
                  <div class="dynamic-comp-col-title comp-title-bad" style="background:rgba(239,68,68,0.18); color:#EF4444; border-left:3px solid #EF4444; font-size:0.72rem; font-weight:800; padding:4px 8px; border-radius:4px; margin-bottom:6px;" contenteditable="true">${this.escapeHtml(parsed.leftTitle)}</div>
                  <pre class="comp-code-box" contenteditable="true" style="flex:1; margin:0; font-family:'Fira Code',Consolas,monospace; font-size:0.68rem; color:#FCA5A5; line-height:1.45; white-space:pre-wrap; background:rgba(15,23,42,0.85); border:1px solid rgba(239,68,68,0.25); border-radius:6px; padding:8px;">${this.escapeHtml(parsed.leftCode)}</pre>
                  ${parsed.leftNotes.length ? `<div class="comp-fail-note" contenteditable="true" style="margin-top:6px; font-size:0.7rem; color:#FECACA; background:rgba(239,68,68,0.15); border-left:3px solid #EF4444; border-radius:4px; padding:6px 8px; line-height:1.4;">${this.escapeHtml(parsed.leftNotes.join('\n'))}</div>` : ''}
                </div>
                <div class="dynamic-vs-badge" style="width:34px; height:34px; font-size:0.72rem; align-self:center; background:linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#FFF; font-weight:900; box-shadow:0 4px 10px rgba(217,119,6,0.4); border:2px solid #FFF; flex-shrink:0;">VS</div>
                <div class="dynamic-comp-col comp-right comp-code-col" style="display:flex; flex-direction:column; background:rgba(16,185,129,0.06); border:1.5px solid rgba(16,185,129,0.35); border-radius:8px; padding:8px;">
                  <div class="dynamic-comp-col-title comp-title-good" style="background:rgba(16,185,129,0.18); color:#10B981; border-left:3px solid #10B981; font-size:0.72rem; font-weight:800; padding:4px 8px; border-radius:4px; margin-bottom:6px;" contenteditable="true">${this.escapeHtml(parsed.rightTitle)}</div>
                  <pre class="comp-code-box" contenteditable="true" style="flex:1; margin:0; font-family:'Fira Code',Consolas,monospace; font-size:0.68rem; color:#6EE7B7; line-height:1.45; white-space:pre-wrap; background:rgba(15,23,42,0.85); border:1px solid rgba(16,185,129,0.25); border-radius:6px; padding:8px;">${this.escapeHtml(parsed.rightCode)}</pre>
                  ${parsed.rightNotes.length ? `<div class="comp-win-note" contenteditable="true" style="margin-top:6px; font-size:0.7rem; color:#A7F3D0; background:rgba(16,185,129,0.15); border-left:3px solid #10B981; border-radius:4px; padding:6px 8px; line-height:1.4;">${this.escapeHtml(parsed.rightNotes.join('\n'))}</div>` : ''}
                </div>
              </div>
              ${parsed.bottomNote ? `<div class="dynamic-comp-bottom" contenteditable="true" style="margin-top:8px; font-size:0.72rem; color:#94A3B8; font-style:italic; text-align:center; background:rgba(255,255,255,0.04); border-radius:6px; padding:5px 8px;">🎨 (${this.escapeHtml(parsed.bottomNote)})</div>` : ''}
            </div>`;
        }
        return `
          <div class="code-comparison-box"${idAttr} style="background:#0F172A; border:1.5px solid #334155; border-radius:10px; padding:10px 12px; margin:6px 0; box-shadow:0 4px 14px rgba(0,0,0,0.25); width:100%; box-sizing:border-box;">
            <div style="font-size:0.72rem; font-weight:800; color:#38BDF8; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.04em; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1E293B; padding-bottom:4px;">
              <span>⚖️ ${this.escapeHtml(item.title || "CODE LOGIC MYSTERY")}</span>
              <span style="font-size:0.63rem; color:#94A3B8; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:4px;">ALGORITHMIC COMPARISON</span>
            </div>
            <pre style="margin:0; font-family:'Fira Code',Consolas,monospace; font-size:0.67rem; color:#38BDF8; line-height:1.45; white-space:pre-wrap; background:transparent; border:none; padding:0; overflow-x:auto;">${this.escapeHtml(text)}</pre>
          </div>`;
      }

      case 'BlockCodeScript':
      case 'BLOCK_CODE_SCRIPT': {
        const text = item.text || item.content || '';
        return `
          <div class="scratch-blocks-container"${idAttr} style="background:#FFFBEB; border:1.5px solid #FCD34D; border-radius:10px; padding:10px 14px; margin:8px 0; box-shadow:0 2px 8px rgba(245,158,11,0.08);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #FDE68A; padding-bottom:4px;">
              <span style="font-size:0.74rem; font-weight:800; color:#B45309; text-transform:uppercase; letter-spacing:0.04em;">🧩 ULTRA STUDIO BLOCK CODE SCRIPT</span>
              <span style="font-size:0.65rem; background:#FEF3C7; color:#B45309; padding:2px 8px; border-radius:6px; font-weight:700;">INTERLOCKING BLOCKS</span>
            </div>
            <pre style="margin:0; font-family:'Fira Code',Consolas,monospace; font-size:0.76rem; color:#92400E; font-weight:600; line-height:1.55; white-space:pre-wrap; background:#FFFFFF; border:1px solid #FDE68A; border-radius:6px; padding:10px 12px; border-left:4px solid #F59E0B;">${this.escapeHtml(text)}</pre>
          </div>`;
      }

      case 'TestRunLog':
      case 'TEST_RUN_LOG': {
        const text = item.text || item.content || '';
        return `
          <div class="test-run-card"${idAttr} style="background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:10px; padding:10px 14px; margin:8px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #BBF7D0; padding-bottom:4px;">
              <span style="font-size:0.74rem; font-weight:800; color:#166534; text-transform:uppercase; letter-spacing:0.04em;">🚦 LIVE TEST RUN TIMELINE</span>
              <span style="font-size:0.65rem; background:#DCFCE7; color:#15803D; padding:2px 8px; border-radius:6px; font-weight:700;">100% VERIFIED</span>
            </div>
            <pre style="margin:0; font-family:'Fira Code',Consolas,monospace; font-size:0.75rem; color:#14532D; line-height:1.5; white-space:pre-wrap; background:#FFFFFF; border:1px solid #BBF7D0; border-radius:6px; padding:10px 12px; border-left:4px solid #22C55E;">${this.escapeHtml(text)}</pre>
          </div>`;
      }

      case 'SectionHeader':
      case 'SECTION_HEADER': {
        const text = item.text || item.content || '';
        if (/badge unlocked/i.test(text)) {
          return `
            <div class="unlocked-badge-banner"${idAttr} style="background:linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border:2px solid #F59E0B; border-radius:10px; padding:10px 16px; margin:10px 0; display:flex; align-items:center; justify-content:center; gap:10px; box-shadow:0 4px 12px rgba(245,158,11,0.2);">
              <span style="font-size:1.6rem;">🎖️</span>
              <span style="font-size:0.85rem; font-weight:900; color:#92400E; text-transform:uppercase; letter-spacing:0.04em;">${this.escapeHtml(text.replace(/^[🎖️\s]*/, ''))}</span>
            </div>`;
        }
        return `
          <div class="incard-section-header"${idAttr} style="font-size:0.88rem; font-weight:800; color:#1E3A8A; margin:8px 0 4px 0; border-bottom:1.5px solid #BFDBFE; padding-bottom:3px;">
            ${this.escapeHtml(text)}
          </div>`;
      }

      case 'ClearanceCert':
      case 'CLEARANCE_CERT': {
        const text = item.text || item.content || '';
        return `
          <div class="clearance-cert-card"${idAttr} style="background:linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border:2px solid #F59E0B; border-radius:12px; padding:12px 16px; margin:8px 0; text-align:center; box-shadow:0 4px 14px rgba(245,158,11,0.15);">
            <div style="font-size:1.6rem; margin-bottom:4px;">🏆</div>
            <div style="font-size:0.95rem; font-weight:900; color:#B45309; letter-spacing:0.05em; text-transform:uppercase;">${this.escapeHtml(text)}</div>
          </div>`;
      }

      case 'IllustrationPrompt':
      case 'ILLUSTRATION_PROMPT': {
        const text = item.text || item.content || '';
        return this.renderIncardImageBoxHtml(text, '', idAttr);
      }

      case 'Paragraph':
      case 'PARAGRAPH': {
        const text = item.text || item.content || '';
        if (/space for illustration/i.test(text)) {
          return this.renderIncardImageBoxHtml(text, '', idAttr);
        }
        if (/^[A-D]\)\s+/i.test(text.trim())) {
          return `
            <div class="cca-options-pill-box" style="margin:4px 0; position:relative; display:flex; align-items:center; gap:6px;">
              <p class="dynamic-paragraph"${idAttr} contenteditable="true" style="margin:0; font-size:0.78rem; color:#1E293B; font-weight:600; line-height:1.5; background:#F8FAFC; border:1px solid #CBD5E1; border-radius:6px; padding:4px 10px; flex:1;">${this.escapeHtml(text)}</p>
              <div class="incard-item-actions">
                <button class="incard-del-btn incard-dup-btn" title="Duplicate Option" onclick="event.stopPropagation(); const p = this.closest('.cca-options-pill-box'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
                <button class="incard-del-btn" title="Delete Option" onclick="event.stopPropagation(); this.closest('.cca-options-pill-box').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
              </div>
            </div>`;
        }
        if (/^Q\d+:\s+/i.test(text.trim())) {
          return `
            <div class="answer-key-ribbon-box" style="margin:6px 0; position:relative;">
              <p class="dynamic-paragraph"${idAttr} contenteditable="true" style="margin:0; font-size:0.76rem; color:#15803D; font-weight:700; line-height:1.5; background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:8px; padding:8px 12px; display:block;">${this.escapeHtml(text)}</p>
              <div class="incard-item-actions">
                <button class="incard-del-btn incard-dup-btn" title="Duplicate Answer Key" onclick="event.stopPropagation(); const p = this.closest('.answer-key-ribbon-box'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
                <button class="incard-del-btn" title="Delete Answer Key" onclick="event.stopPropagation(); this.closest('.answer-key-ribbon-box').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
              </div>
            </div>`;
        }
        const leadStyle = item.lead ? 'font-size:0.86rem; font-weight:700; color:#0F172A;' : 'font-size:0.82rem; color:#1E293B;';
        return `
          <div class="dynamic-paragraph-wrapper" style="position:relative; margin:6px 0;">
            <p class="dynamic-paragraph"${idAttr} contenteditable="true" style="margin:0; ${leadStyle} line-height:1.55;">${this.escapeHtml(text)}</p>
            <div class="incard-item-actions">
              <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
              <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
              <button class="incard-del-btn incard-dup-btn" title="Duplicate paragraph" onclick="event.stopPropagation(); const p = this.closest('.dynamic-paragraph-wrapper'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="incard-del-btn" title="Delete paragraph" onclick="event.stopPropagation(); this.closest('.dynamic-paragraph-wrapper').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      }

      case 'BulletList': {
        const bStyle = item.bulletStyle === 'check' ? '✔' : item.bulletStyle === 'star' ? '⭐' : item.bulletStyle === 'arrow' ? '▶' : '•';
        const listItems = (item.items || []).map(li => {
          const liId = li.id ? ` data-element-id="${li.id}"` : '';
          const rawText = typeof li === 'string' ? li : (li.text || '');
          // Strip any leading bullet markers so duplicate bullets (e.g. "✔•") are never rendered
          const liText = rawText.replace(/^[\s•\-\*✔✓✔️🧩]+/, '').trim();
          return `
            <li class="dynamic-bullet-item"${liId} style="display:flex; align-items:flex-start; gap:8px; margin-bottom:5px; position:relative;">
              <span class="bullet-dot" style="color:#2563EB; font-weight:bold; line-height:1.4; cursor:pointer; user-select:none;" title="Click to cycle bullet style (✔, •, ⭐, ▶, 1., none)" onclick="window.LayoutEngine?.cycleBullet(this)">${bStyle}</span>
              <span class="bullet-text" contenteditable="true" style="font-size:0.82rem; color:#1E293B; line-height:1.5; font-weight:500; flex:1;">${this.escapeHtml(liText)}</span>
              <div class="incard-item-actions" style="top:0; right:0;">
                <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
                <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
                <button class="incard-del-btn incard-dup-btn" title="Duplicate bullet" onclick="event.stopPropagation(); const p = this.closest('.dynamic-bullet-item'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
                <button class="bullet-del-btn incard-del-btn" title="Delete bullet" onclick="this.closest('.dynamic-bullet-item').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
              </div>
            </li>`;
        }).join('');
        return `<ul class="dynamic-bullets-list" data-bullet-style="${bStyle}" style="list-style:none; padding:0; margin:6px 0;">${listItems}</ul>`;
      }

      case 'BULLET_ITEM': {
        const rawText = item.text || '';
        const isMatchPair = /→→\s*\[\s*\]/i.test(rawText) || /\(1\)|\(2\)|\(3\)/.test(rawText);
        // Strip any leading bullet markers so duplicate bullets (e.g. "✔•") are never rendered
        const text = rawText.replace(/^[\s•\-\*✔✓✔️🧩]+/, '').trim();
        const bulletIcon = isMatchPair ? '🧩' : (item.icon || '✔');
        return `
          <div class="dynamic-bullet-item"${idAttr} style="display:flex; align-items:flex-start; gap:8px; margin:4px 0; position:relative; ${isMatchPair ? 'background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; padding:4px 8px;' : ''}">
            <span class="bullet-dot" style="color:#2563EB; font-weight:bold; line-height:1.4; cursor:pointer; user-select:none;" title="Click to cycle bullet style (✔, •, ⭐, ▶, 1., none)" onclick="window.LayoutEngine?.cycleBullet(this)">${bulletIcon}</span>
            <span class="bullet-text" contenteditable="true" style="font-size:0.82rem; color:#1E293B; line-height:1.5; font-weight:500; flex:1;">${this.escapeHtml(text)}</span>
            <div class="incard-item-actions" style="top:2px; right:4px;">
              <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
              <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
              <button class="incard-del-btn incard-dup-btn" title="Duplicate bullet" onclick="event.stopPropagation(); const p = this.closest('.dynamic-bullet-item'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="bullet-del-btn incard-del-btn" title="Delete bullet" onclick="this.closest('.dynamic-bullet-item').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      }

      case 'KeyValuePairGroup': {
        const pairs = (item.pairs || []).map(p => {
          const pId = p.elementId ? ` data-element-id="${p.elementId}"` : '';
          const icon = p.icon || '🏷️';
          return `
            <div class="um-kv-badge"${pId} style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.04); border:1px solid rgba(148,163,184,0.15); border-radius:6px; padding:6px 10px; font-size:0.78rem; position:relative;">
              <span style="font-weight:700; color:var(--accent-cyan, #00F0FF); display:flex; align-items:center; gap:5px;"><span class="um-kv-icon" style="font-size:0.85rem;">${icon}</span><span contenteditable="true">${this.escapeHtml(p.key)}:</span></span>
              <span class="um-kv-val" contenteditable="true" style="color:#F1F5F9; font-weight:600; margin-left:8px;">${this.escapeHtml(p.value)}</span>
              <div class="incard-item-actions" style="top:2px; right:2px;">
                <button class="incard-del-btn" title="Delete Spec" onclick="event.stopPropagation(); this.closest('.um-kv-badge').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
              </div>
            </div>`;
        }).join('');
        return `<div class="um-kv-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:6px; margin:8px 0;">${pairs}</div>`;
      }

      case 'Table':
      case 'TABLE_BLOCK': {
        const headers = item.headers || (item.meta?.rawTable && item.meta.rawTable[0]) || [];
        const rows = item.rows || (item.meta?.rawTable ? item.meta.rawTable.slice(1) : []) || [];
        return `
          <div class="dynamic-table-wrapper" style="position:relative; margin:8px 0;">
            ${this.renderTableContentHtml(headers, rows, idAttr)}
            <div class="incard-item-actions">
              <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
              <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
              <button class="incard-del-btn incard-dup-btn" title="Duplicate Table" onclick="event.stopPropagation(); const p = this.closest('.dynamic-table-wrapper'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="incard-del-btn" title="Delete Table" onclick="event.stopPropagation(); this.closest('.dynamic-table-wrapper').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      }

      case 'CodeBlock':
      case 'CODE_BLOCK':
      case 'CodeSpace': {
        const codeText = item.code || item.text || '';
        const lang = item.language || 'python';
        return `
          <div class="code-box" style="background:#05070E; border:1px solid #1E293B; border-radius:8px; padding:10px 12px; margin:8px 0; position:relative;">
            <div class="code-header-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:4px;">
              <div style="display:flex; gap:5px;">
                <div class="code-dot code-dot-red" style="width:8px; height:8px; border-radius:50%; background:#EF4444;"></div>
                <div class="code-dot code-dot-yellow" style="width:8px; height:8px; border-radius:50%; background:#F59E0B;"></div>
                <div class="code-dot code-dot-green" style="width:8px; height:8px; border-radius:50%; background:#10B981;"></div>
              </div>
              <span style="font-size:0.65rem; color:#64748B; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">${this.escapeHtml(lang)}</span>
            </div>
            <pre class="code-content" style="margin:0; overflow-x:auto;"><code${idAttr} contenteditable="true" spellcheck="false" style="font-family:'Fira Code',monospace; font-size:0.76rem; color:#00F0FF; line-height:1.45; white-space:pre-wrap;">${this.escapeHtml(codeText)}</code></pre>
            <div class="incard-item-actions">
              <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
              <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
              <button class="incard-del-btn incard-dup-btn" title="Duplicate Code Box" onclick="event.stopPropagation(); const p = this.closest('.code-box'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="incard-del-btn" title="Delete Code Box" onclick="event.stopPropagation(); this.closest('.code-box').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      }

      case 'CalloutBox': {
        const variant = item.variant || 'tip';
        let bg = '#FFFBEB';
        let border = '#F59E0B';
        let textColor = '#78350F';
        let icon = item.icon || '💡';

        if (variant === 'danger' || variant === 'warning') {
          bg = '#FEF2F2';
          border = '#EF4444';
          textColor = '#991B1B';
          icon = item.icon || '🛑';
        } else if (variant === 'success') {
          bg = '#ECFDF5';
          border = '#10B981';
          textColor = '#065F46';
          icon = item.icon || '✅';
        } else if (variant === 'info') {
          bg = '#EFF6FF';
          border = '#3B82F6';
          textColor = '#1E3A8A';
          icon = item.icon || 'ℹ️';
        }

        return `
          <div class="um-callout-box" style="display:flex; gap:10px; align-items:flex-start; padding:8px 12px; background:${bg}; border-left:3.5px solid ${border}; border-radius:6px; margin:6px 0; position:relative;">
            <span style="font-size:1.1rem; line-height:1.2;">${icon}</span>
            <div style="flex:1;">
              ${item.title ? `<div style="font-weight:700; font-size:0.76rem; color:${border}; text-transform:uppercase; margin-bottom:2px;" contenteditable="true">${this.escapeHtml(item.title)}</div>` : ''}
              <div class="callout-text"${idAttr} contenteditable="true" style="font-size:0.8rem; color:${textColor}; line-height:1.45; font-weight:500;">${this.escapeHtml(item.text || '')}</div>
            </div>
            <div class="incard-item-actions">
              <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
              <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
              <button class="incard-del-btn incard-style-btn" title="Toggle Box / Flat Style" onclick="event.stopPropagation(); window.LayoutEngine?.toggleItemBoxStyle(this)">📄</button>
              <button class="incard-del-btn incard-dup-btn" title="Duplicate Callout" onclick="event.stopPropagation(); const p = this.closest('.um-callout-box'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="incard-del-btn" title="Delete Callout" onclick="event.stopPropagation(); this.closest('.um-callout-box').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      }

      case 'SAFETY_NOTE': {
        return `
          <div class="safety-box" style="background:#FEF2F2; border:1px solid #FECACA; border-left:4px solid #EF4444; border-radius:8px; padding:8px 12px; margin:6px 0; display:flex; gap:8px; position:relative;">
            <span style="font-size:1rem;">🛑</span>
            <div class="safety-text"${idAttr} contenteditable="true" style="font-size:0.82rem; color:#991B1B; font-weight:600; line-height:1.5; flex:1;">${this.escapeHtml(item.text)}</div>
            <div class="incard-item-actions">
              <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
              <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
              <button class="incard-del-btn incard-style-btn" title="Toggle Box / Flat Style" onclick="event.stopPropagation(); window.LayoutEngine?.toggleItemBoxStyle(this)">📄</button>
              <button class="incard-del-btn incard-dup-btn" title="Duplicate Safety Note" onclick="event.stopPropagation(); const p = this.closest('.safety-box'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="incard-del-btn" title="Delete Safety Note" onclick="event.stopPropagation(); this.closest('.safety-box').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      }

      case 'ENGINEERING_NOTE':
      case 'ProTip': {
        return `
          <div class="pro-tip-box" style="background:#FFFBEB; border:1px solid #FDE68A; border-left:4px solid #F59E0B; border-radius:8px; padding:8px 12px; margin:6px 0; display:flex; gap:8px; position:relative;">
            <span style="font-size:1rem;">⭐</span>
            <div class="pro-tip-text"${idAttr} contenteditable="true" style="font-size:0.82rem; color:#92400E; font-weight:600; line-height:1.5; flex:1;">${this.escapeHtml(item.text)}</div>
            <div class="incard-item-actions">
              <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
              <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
              <button class="incard-del-btn incard-style-btn" title="Toggle Box / Flat Style" onclick="event.stopPropagation(); window.LayoutEngine?.toggleItemBoxStyle(this)">📄</button>
              <button class="incard-del-btn incard-dup-btn" title="Duplicate Tip" onclick="event.stopPropagation(); const p = this.closest('.pro-tip-box'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="incard-del-btn" title="Delete Tip" onclick="event.stopPropagation(); this.closest('.pro-tip-box').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      }

      case 'ProcedureStep':
      case 'PROCEDURE_STEP': {
        return `
          <div class="procedure-step-item" style="display:flex; gap:8px; align-items:flex-start; margin:3px 0; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:6px; padding:4px 8px; position:relative;">
            <span class="step-badge" style="color:#2563EB; font-weight:800; font-size:0.82rem; line-height:1.4;">▶</span>
            <div class="step-text"${idAttr} data-order-locked="true" contenteditable="true" style="font-size:0.82rem; color:#1E293B; line-height:1.5; font-weight:500; flex:1;">${this.escapeHtml(item.text)}</div>
            <div class="incard-item-actions">
              <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
              <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
              <button class="incard-del-btn incard-style-btn" title="Toggle Box / Flat Style" onclick="event.stopPropagation(); window.LayoutEngine?.toggleItemBoxStyle(this)">📄</button>
              <button class="incard-del-btn incard-dup-btn" title="Duplicate Step" onclick="event.stopPropagation(); const p = this.closest('.procedure-step-item'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="incard-del-btn" title="Delete Step" onclick="event.stopPropagation(); this.closest('.procedure-step-item').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      }

      case 'Challenge':
      case 'ASSESSMENT_QUESTION': {
        const qText = item.question || item.text || '';
        return `
          <div class="assessment-q-card" style="background:#FFFFFF; border:1.5px solid #E2E8F0; border-left:4px solid #6366F1; border-radius:8px; padding:8px 12px; margin:6px 0; box-shadow:0 2px 6px rgba(15,23,42,0.03); position:relative;">
            <div class="worksheet-question"${idAttr} contenteditable="true" style="font-weight:700; font-size:0.82rem; color:#0F172A; line-height:1.5;">${this.escapeHtml(qText)}</div>
            <div class="incard-item-actions">
              <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
              <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
              <button class="incard-del-btn incard-style-btn" title="Toggle Box / Flat Style" onclick="event.stopPropagation(); window.LayoutEngine?.toggleItemBoxStyle(this)">📄</button>
              <button class="incard-del-btn incard-dup-btn" title="Duplicate Question" onclick="event.stopPropagation(); const p = this.closest('.assessment-q-card'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="incard-del-btn" title="Delete Question" onclick="event.stopPropagation(); this.closest('.assessment-q-card').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      }

      case 'Comparison': {
        const leftItems = (item.leftItems || []).map(li => `<div style="font-size:0.78rem; color:#1E293B; margin:4px 0;">• ${this.escapeHtml(li)}</div>`).join('');
        const rightItems = (item.rightItems || []).map(ri => `<div style="font-size:0.78rem; color:#1E293B; margin:4px 0;">• ${this.escapeHtml(ri)}</div>`).join('');
        return `
          <div class="um-comparison-grid" style="display:grid; grid-template-columns:1fr auto 1fr; gap:10px; align-items:center; background:#F8FAFC; border:1.5px solid #CBD5E1; border-radius:8px; padding:10px 14px; margin:8px 0;">
            <div class="comp-col-left">
              <div style="font-weight:700; font-size:0.75rem; color:#1E40AF; margin-bottom:6px;" contenteditable="true">${this.escapeHtml(item.leftTitle || 'A')}</div>
              ${leftItems}
            </div>
            <div class="comp-vs-badge" style="width:28px; height:28px; border-radius:50%; background:#EF4444; color:#FFF; font-weight:800; font-size:0.72rem; display:flex; align-items:center; justify-content:center;">VS</div>
            <div class="comp-col-right">
              <div style="font-weight:700; font-size:0.75rem; color:#6B21A8; margin-bottom:6px;" contenteditable="true">${this.escapeHtml(item.rightTitle || 'B')}</div>
              ${rightItems}
            </div>
          </div>`;
      }

      case 'Vocabulary': {
        return `
          <div class="um-vocab-chip" style="display:inline-flex; align-items:center; gap:6px; background:#F0FDF4; border:1px solid #BBF7D0; border-radius:16px; padding:4px 12px; margin:4px 2px;">
            <span style="font-size:0.85rem;">📚</span>
            <span class="vocab-term" style="font-weight:700; font-size:0.76rem; color:#166534;" contenteditable="true">${this.escapeHtml(item.term || 'TERM')}:</span>
            <span class="vocab-def"${idAttr} style="font-size:0.78rem; color:#1E293B;" contenteditable="true">${this.escapeHtml(item.definition || item.text || '')}</span>
          </div>`;
      }

      case 'ImageBox': {
        return `
          <div class="um-image-container" style="border:2px dashed #93C5FD; border-radius:10px; padding:12px; text-align:center; background:#EFF6FF; margin:8px 0; cursor:pointer;" title="Double-click to upload image">
            <div style="font-size:1.8rem; margin-bottom:4px;">🖼️</div>
            <div class="image-caption"${idAttr} contenteditable="true" style="font-size:0.78rem; color:#1E40AF; font-style:italic; font-weight:600;">${this.escapeHtml(item.caption || item.text || 'Schematic Diagram / Component Illustration')}</div>
          </div>`;
      }

      case 'SubCard':
      case 'sub-card': {
        return `
          <div class="in-card-subcard card-base draggable-element" style="background:#FFFFFF; border:1.5px solid #CBD5E1; border-radius:8px; padding:8px 12px; margin:6px 0; box-shadow:0 2px 6px rgba(15,23,42,0.04);">
            <div style="font-weight:700; font-size:0.75rem; color:#1E40AF; margin-bottom:4px;" contenteditable="true">${this.escapeHtml(item.title || 'SUB-CARD')}</div>
            <div class="subcard-body"${idAttr} style="font-size:0.78rem; color:#1E293B;" contenteditable="true">${this.escapeHtml(item.text || item.content || '')}</div>
          </div>`;
      }

      default:
        return `<div class="dynamic-item"${idAttr} contenteditable="true" style="margin:4px 0; font-size:0.82rem; color:#1E293B; line-height:1.55;">${this.escapeHtml(item.text || item.content || '')}</div>`;
    }
  },

  renderDynamicProcedure(sec) {
    const card = this.makeCard('dynamic-procedure-card dynamic-card');
    if (sec.elementId) card.dataset.elementId = sec.elementId;
    const steps = sec.steps || [];
    const stepsHtml = steps.map(s => {
      const sId = typeof s === 'object' ? s.elementId : '';
      const sText = typeof s === 'object' ? s.text : s;
      return `
        <div class="procedure-step-item" style="display:flex; gap:8px; align-items:flex-start; margin:6px 0;">
          <span class="step-badge" style="color:#2563EB; font-weight:800; font-size:0.85rem; line-height:1.4;">▶</span>
          <div class="step-text"${sId ? ` data-element-id="${sId}"` : ''} data-order-locked="true" contenteditable="true" style="font-size:0.82rem; color:#1E293B; line-height:1.5; font-weight:500; flex:1;">${this.escapeHtml(sText)}</div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🛠️', sec.title || 'PROCEDURE', '', sec.titleElementId)}
      <div class="card-body-items" style="margin-top:6px;">
        ${stepsHtml}
      </div>
      ${this.makeInCardToolbarHTML()}
    `;
    this._attachCardControls(card);
    return card;
  },

  renderSafetyCard(sec) {
    const card = this.makeCard('safety-card theme-card-red');
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '🛑', sec.title || 'LAB SAFETY WARNING', 'theme-card-red', sec.titleElementId)}
      <div class="safety-text"${sec.elementId ? ` data-element-id="${sec.elementId}"` : ''} contenteditable="true" style="font-size:0.82rem; color:#FECACA; padding:8px 10px; background:rgba(239,68,68,0.12); border-left:3px solid #EF4444; border-radius:6px; margin:6px 0;">${this.escapeHtml(sec.content || sec.text || '')}</div>
      ${this.makeInCardToolbarHTML()}
    `;
    this._attachCardControls(card);
    return card;
  },

  renderDynamicText(sec) {
    const card = this.makeCard('dynamic-text-card');
    let paragraphsHtml = '';
    if (sec.paragraphs && Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0) {
      paragraphsHtml = sec.paragraphs.map(p => {
        const pId = typeof p === 'object' ? p.elementId : '';
        const pText = typeof p === 'object' ? p.text : p;
        return `<p class="dynamic-paragraph"${pId ? ` data-element-id="${pId}"` : ''} contenteditable="true" style="margin:6px 0; font-size:0.82rem; color:#E2E8F0; line-height:1.5;">${this.escapeHtml(pText)}</p>`;
      }).join('');
    } else {
      paragraphsHtml = `<div class="card-body-text"${sec.elementId ? ` data-element-id="${sec.elementId}"` : ''} contenteditable="true">${this.escapeHtml(sec.content || sec.text || '')}</div>`;
    }

    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📄', sec.title || 'CONTENT', '', sec.titleElementId)}
      ${paragraphsHtml}
      ${this.makeInCardToolbarHTML()}
    `;
    this._attachCardControls(card);
    return card;
  },

  renderDynamicBullets(sec) {
    const card = this.makeCard('dynamic-bullets-card');
    const bullets = sec.bullets || sec.items || (sec.content ? window.DynamicCardFactory?._extractBullets(sec.content) : []) || [];
    const bulletHtml = bullets.map(b => {
      const bId = typeof b === 'object' && b !== null ? b.elementId : '';
      const rawText = typeof b === 'object' && b !== null ? b.text : b;
      const bText = (rawText || '').replace(/^[\s•\-\*✔✓✔️🧩]+/, '').trim();
      return `
        <div class="dynamic-bullet-item" style="display:flex; align-items:flex-start; gap:8px; margin-bottom:6px; position:relative;">
          <span class="bullet-dot" style="color:#2563EB; font-weight:bold; line-height:1.4; cursor:pointer; user-select:none;" title="Click to cycle bullet style (✔, •, ⭐, ▶, 1., none)" onclick="window.LayoutEngine?.cycleBullet(this)">✔</span>
          <span class="bullet-text"${bId ? ` data-element-id="${bId}"` : ''} contenteditable="true" style="font-size:0.82rem; color:#1E293B; line-height:1.45; flex:1;">${this.escapeHtml(bText)}</span>
          <div class="incard-item-actions" style="top:0; right:0;">
            <button class="incard-del-btn incard-dup-btn" title="Duplicate bullet" onclick="event.stopPropagation(); const p = this.closest('.dynamic-bullet-item'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
            <button class="bullet-del-btn incard-del-btn" onclick="this.closest('.dynamic-bullet-item').remove(); window.LayoutEngine.autoReflowPages();" style="background:none; border:none; color:#EF4444; cursor:pointer; font-size:0.7rem;">✕</button>
          </div>
        </div>`;
    }).join('');
    const fallbackText = (!bullets.length && sec.content) ? `<div class="card-body-text"${sec.elementId ? ` data-element-id="${sec.elementId}"` : ''} contenteditable="true">${this.escapeHtml(sec.content)}</div>` : '';
    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📋', sec.title || 'KEY POINTS', '', sec.titleElementId)}
      <div class="dynamic-bullets-list">${bulletHtml}</div>
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
    } else if (type === 'line' || type === 'text-line') {
      el.className = 'dynamic-paragraph-wrapper incard-text-line-wrapper draggable-element';
      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <p class="dynamic-paragraph" contenteditable="true" style="font-size:0.82rem; color:#1E293B; margin:0; flex:1; line-height:1.5;">New text line...</p>
          <div class="incard-item-actions">
            <button class="incard-del-btn incard-shift-btn" title="Shift Left (-6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemLeft(this)">⬅</button>
            <button class="incard-del-btn incard-shift-btn" title="Shift Right (+6px)" onclick="event.stopPropagation(); window.LayoutEngine?.shiftItemRight(this)">➡</button>
            <button class="incard-del-btn incard-dup-btn" title="Duplicate line" onclick="event.stopPropagation(); const p = this.closest('.dynamic-paragraph-wrapper'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
            <button class="incard-del-btn" title="Delete line" onclick="event.stopPropagation(); this.closest('.dynamic-paragraph-wrapper').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
          </div>
        </div>
      `;
    } else if (type === 'table') {
      const rInput = window.prompt ? window.prompt("Enter number of rows (e.g. 2):", "2") : "2";
      if (rInput === null) return;
      const cInput = window.prompt ? window.prompt("Enter number of columns (e.g. 3):", "3") : "3";
      if (cInput === null) return;

      const numRows = Math.max(1, parseInt(rInput, 10) || 2);
      const numCols = Math.max(1, parseInt(cInput, 10) || 3);

      const headers = [];
      for (let c = 1; c <= numCols; c++) headers.push(`Header ${c}`);
      const rows = [];
      for (let r = 1; r <= numRows; r++) {
        const row = [];
        for (let c = 1; c <= numCols; c++) row.push(`Cell ${r}.${c}`);
        rows.push(row);
      }

      el.className = 'dynamic-table-wrapper draggable-element';
      el.innerHTML = this.renderTableContentHtml(headers, rows);
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
    const idAttr = (sec.titleElementId || sec.elementId) ? ` data-element-id="${sec.titleElementId || sec.elementId}"` : '';
    el.innerHTML = `
      <div class="dynamic-subheader-title"${idAttr} contenteditable="true">${sec.title || ''}</div>
      ${sec.content ? `<div class="dynamic-subheader-body" contenteditable="true">${sec.content}</div>` : ''}
    `;
    this._attachCardControls(el);
    return el;
  },

  renderDynamicTable(sec) {
    const card = this.makeCard('dynamic-table-card');
    const headers = sec.tableHeaders || [];
    const rows = sec.tableRows || [];
    const idAttr = sec.elementId ? ` data-element-id="${sec.elementId}"` : '';
    const tableHtml = this.renderTableContentHtml(headers, rows, idAttr);

    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || '📊', sec.title || 'DATA TABLE', '', sec.titleElementId)}
      <div class="dynamic-table-wrapper" style="position:relative; margin:8px 0;">
        ${tableHtml}
      </div>
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
    const isCode = sec.subtype === 'code-compare' || sec.isCodeCompare || /code\s*compare|code\s*vs|code\s*mystery/i.test(sec.title || '');
    const isMatch = sec.subtype === 'match-pairs' || sec.isMatchPairs || /match.*pair|match.*following/i.test(sec.title || '');

    const cardTheme = sec.cardStyle || (isMatch ? 'theme-card-orange' : (isCode ? 'theme-card-red' : 'theme-card-green'));
    const card = this.makeCard(`dynamic-comparison-card dynamic-card ${cardTheme}` + (isCode ? ' code-comparison-card' : '') + (isMatch ? ' match-pairs-card' : ''));

    const defTitle = isMatch ? 'MATCH THE PAIRS' : (isCode ? "NOVA'S CODE LOGIC MYSTERY" : 'COMPARISON');
    const defIcon = isMatch ? '🧩' : (isCode ? '⚖️' : '⚖️');
    const defLeftTitle = isMatch ? 'COLUMN A (TERMS)' : (isCode ? '[❌ CODE IDEA A: BLOCKING DELAY TRAP]' : 'OPTION A');
    const defRightTitle = isMatch ? 'COLUMN B (DUTIES)' : (isCode ? '[✅ CODE IDEA B: EVENT-DRIVEN CLOUD]' : 'OPTION B');
    const badgeText = sec.badgeText || (isMatch ? '⟷' : 'VS');

    const promptHtml = sec.prompt ? `
      <div class="comp-card-prompt" contenteditable="true" style="margin:4px 0 10px 0; font-size:0.83rem; color:#1E293B; font-weight:700; line-height:1.5; background:rgba(37,99,235,0.06); border-left:3.5px solid #2563EB; border-radius:6px; padding:6px 10px;">${this.escapeHtml(sec.prompt)}</div>
    ` : '';

    let gridHtml = '';

    if (isCode) {
      const leftCodeText = sec.leftCode || (sec.leftItems && sec.leftItems[0] ? (sec.leftItems[0].text || sec.leftItems[0]) : '');
      const rightCodeText = sec.rightCode || (sec.rightItems && sec.rightItems[0] ? (sec.rightItems[0].text || sec.rightItems[0]) : '');
      const leftNotesArr = Array.isArray(sec.leftNotes) ? sec.leftNotes : (sec.leftNotes ? [sec.leftNotes] : []);
      const rightNotesArr = Array.isArray(sec.rightNotes) ? sec.rightNotes : (sec.rightNotes ? [sec.rightNotes] : []);

      gridHtml = `
        <div class="dynamic-comparison-grid code-comparison-grid" style="display:grid; grid-template-columns:1fr auto 1fr; gap:12px; align-items:stretch; position:relative;">
          <div class="dynamic-comp-col comp-left comp-code-col" style="display:flex; flex-direction:column; background:rgba(239,68,68,0.04); border:1.5px solid rgba(239,68,68,0.3); border-radius:8px; padding:8px;">
            <div class="dynamic-comp-col-title comp-title-bad" contenteditable="true" style="background:rgba(239,68,68,0.18); color:#EF4444; border-left:3px solid #EF4444; font-size:0.72rem; font-weight:800; padding:4px 8px; border-radius:4px; margin-bottom:6px;">${this.escapeHtml(sec.leftTitle || defLeftTitle)}</div>
            <pre class="comp-code-box code-bad" contenteditable="true" style="flex:1; margin:0; font-family:'Fira Code',Consolas,monospace; font-size:0.68rem; color:#FCA5A5; line-height:1.45; white-space:pre-wrap; background:rgba(15,23,42,0.92); border:1px solid rgba(239,68,68,0.25); border-radius:6px; padding:8px;">${this.escapeHtml(leftCodeText)}</pre>
            ${leftNotesArr.length ? `<div class="comp-fail-note" contenteditable="true" style="margin-top:6px; font-size:0.7rem; color:#991B1B; background:#FEF2F2; border:1px solid rgba(239,68,68,0.25); border-left:3px solid #EF4444; border-radius:4px; padding:6px 8px; line-height:1.4;">${this.escapeHtml(leftNotesArr.join('\n'))}</div>` : ''}
          </div>
          <div class="dynamic-vs-badge" contenteditable="true" title="Central Comparison Badge (e.g. VS, ⟷)">${badgeText}</div>
          <div class="dynamic-comp-col comp-right comp-code-col" style="display:flex; flex-direction:column; background:rgba(16,185,129,0.04); border:1.5px solid rgba(16,185,129,0.3); border-radius:8px; padding:8px;">
            <div class="dynamic-comp-col-title comp-title-good" contenteditable="true" style="background:rgba(16,185,129,0.18); color:#10B981; border-left:3px solid #10B981; font-size:0.72rem; font-weight:800; padding:4px 8px; border-radius:4px; margin-bottom:6px;">${this.escapeHtml(sec.rightTitle || defRightTitle)}</div>
            <pre class="comp-code-box code-good" contenteditable="true" style="flex:1; margin:0; font-family:'Fira Code',Consolas,monospace; font-size:0.68rem; color:#6EE7B7; line-height:1.45; white-space:pre-wrap; background:rgba(15,23,42,0.92); border:1px solid rgba(16,185,129,0.25); border-radius:6px; padding:8px;">${this.escapeHtml(rightCodeText)}</pre>
            ${rightNotesArr.length ? `<div class="comp-win-note" contenteditable="true" style="margin-top:6px; font-size:0.7rem; color:#065F46; background:#ECFDF5; border:1px solid rgba(16,185,129,0.25); border-left:3px solid #10B981; border-radius:4px; padding:6px 8px; line-height:1.4;">${this.escapeHtml(rightNotesArr.join('\n'))}</div>` : ''}
          </div>
        </div>
      `;
    } else {
      const renderCompItem = (i, side) => {
        const rawText = typeof i === 'object' && i !== null ? (i.text || '') : (i || '');
        const icon = (typeof i === 'object' && i !== null && i.icon)
          ? i.icon
          : (isMatch ? (side === 'left' ? '🧩' : '🎯') : '✅');

        return `
          <div class="dynamic-comp-item ${isMatch ? 'match-pair-item' : ''}" style="display:flex; align-items:flex-start; gap:8px; padding:5px 8px; margin:4px 0; border-radius:6px; position:relative; background:${isMatch ? (side === 'left' ? 'rgba(59,130,246,0.05)' : 'rgba(16,185,129,0.05)') : 'transparent'}; border:${isMatch ? (side === 'left' ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(16,185,129,0.2)') : 'none'};">
            <span class="ci-icon" style="flex-shrink:0; font-size:0.85rem; line-height:1.4;">${icon}</span>
            <span class="comp-item-text" contenteditable="true" style="flex:1; font-size:0.82rem; color:#1E293B; line-height:1.45; font-weight:${isMatch && side === 'left' ? '700' : '500'};">${this.escapeHtml(rawText)}</span>
            <div class="incard-item-actions" style="top:2px; right:2px;">
              <button class="incard-del-btn incard-dup-btn" title="Duplicate item" onclick="event.stopPropagation(); const p = this.closest('.dynamic-comp-item'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
              <button class="bullet-del-btn incard-del-btn" title="Delete item" onclick="this.closest('.dynamic-comp-item').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
            </div>
          </div>`;
      };

      const leftList = (sec.leftItems && sec.leftItems.length)
        ? sec.leftItems
        : [{ text: isMatch ? '(1) Connect WiFi' : 'Point one' }, { text: isMatch ? '(2) Subscribe Topic' : 'Point two' }];
      const rightList = (sec.rightItems && sec.rightItems.length)
        ? sec.rightItems
        : [{ text: isMatch ? '[   ] A. Broadcasts live sensor telemetry' : 'Point one' }, { text: isMatch ? '[   ] B. Links the UltraBoard to the router' : 'Point two' }];

      const leftHtml = leftList.map(i => renderCompItem(i, 'left')).join('');
      const rightHtml = rightList.map(i => renderCompItem(i, 'right')).join('');
      const fallback = (!leftList.length && !rightList.length && sec.content) ? `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content)}</div>` : '';

      gridHtml = (leftList.length || rightList.length) ? `
        <div class="dynamic-comparison-grid ${isMatch ? 'match-pairs-grid' : ''}" style="display:grid; grid-template-columns:1fr auto 1fr; gap:12px; align-items:center;">
          <div class="dynamic-comp-col comp-left ${isMatch ? 'match-pairs-col' : ''}">
            <div class="dynamic-comp-col-title" contenteditable="true">${sec.leftTitle || defLeftTitle}</div>
            <div class="dynamic-comp-items-wrap">${leftHtml}</div>
            <button class="add-comp-item-btn" onclick="window.LayoutEngine?.addCompItem(this, 'left');" style="margin-top:6px; background:rgba(37,99,235,0.08); border:1px dashed #3B82F6; color:#2563EB; border-radius:6px; font-size:0.72rem; padding:3px 8px; cursor:pointer; width:100%;">➕ ${isMatch ? 'Add Term' : 'Add Item'}</button>
          </div>
          <div class="dynamic-vs-badge ${isMatch ? 'match-badge' : ''}" contenteditable="true" title="Central Comparison Badge (e.g. VS, ⟷)">${badgeText}</div>
          <div class="dynamic-comp-col comp-right ${isMatch ? 'match-pairs-col' : ''}">
            <div class="dynamic-comp-col-title" contenteditable="true">${sec.rightTitle || defRightTitle}</div>
            <div class="dynamic-comp-items-wrap">${rightHtml}</div>
            <button class="add-comp-item-btn" onclick="window.LayoutEngine?.addCompItem(this, 'right');" style="margin-top:6px; background:rgba(16,185,129,0.08); border:1px dashed #10B981; color:#059669; border-radius:6px; font-size:0.72rem; padding:3px 8px; cursor:pointer; width:100%;">➕ ${isMatch ? 'Add Match Duty' : 'Add Item'}</button>
          </div>
        </div>
      ` : fallback;
    }

    const bottomHtml = sec.bottomNote ? `
      <div class="dynamic-comp-bottom" contenteditable="true" style="margin-top:10px; font-size:0.74rem; color:#64748B; font-style:italic; text-align:center; background:rgba(248,250,252,0.8); border:1px dashed #CBD5E1; border-radius:6px; padding:6px 12px;">${isCode ? '🎨 (' + this.escapeHtml(sec.bottomNote.replace(/^[🎨\s(]+|[)\s]+$/g, '')) + ')' : this.escapeHtml(sec.bottomNote)}</div>
    ` : '';

    card.innerHTML = `
      ${this.makeCapsuleHeader(sec.icon || defIcon, sec.title || defTitle, cardTheme, sec.titleElementId || sec.elementId, sec.mascotPoseUrl)}
      ${promptHtml}
      ${gridHtml}
      ${bottomHtml}
    `;
    this._attachCardControls(card);
    return card;
  },

  addCompItem(btnEl, side = 'left') {
    const col = btnEl.closest('.dynamic-comp-col');
    if (!col) return;
    const card = btnEl.closest('.dynamic-comparison-card');
    const isMatch = card && card.classList.contains('match-pairs-card');
    const wrap = col.querySelector('.dynamic-comp-items-wrap') || col;
    window.HistoryEngine?.pushState('Add Comparison Item');
    const isLeft = side === 'left';
    const item = document.createElement('div');
    item.className = `dynamic-comp-item ${isMatch ? 'match-pair-item' : ''}`;
    item.style.cssText = `display:flex; align-items:flex-start; gap:8px; padding:5px 8px; margin:4px 0; border-radius:6px; position:relative; background:${isMatch ? (isLeft ? 'rgba(59,130,246,0.05)' : 'rgba(16,185,129,0.05)') : 'transparent'}; border:${isMatch ? (isLeft ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(16,185,129,0.2)') : 'none'};`;

    const icon = isMatch ? (isLeft ? '🧩' : '🎯') : '✅';
    const count = wrap.querySelectorAll('.dynamic-comp-item').length + 1;
    const defaultText = isMatch
      ? (isLeft ? `(${count}) New Term` : `[   ] ${String.fromCharCode(64 + count)}. New Duty`)
      : 'New comparison point';

    item.innerHTML = `
      <span class="ci-icon" style="flex-shrink:0; font-size:0.85rem; line-height:1.4;">${icon}</span>
      <span class="comp-item-text" contenteditable="true" style="flex:1; font-size:0.82rem; color:#1E293B; line-height:1.45; font-weight:${isMatch && isLeft ? '700' : '500'};">${defaultText}</span>
      <div class="incard-item-actions" style="top:2px; right:2px;">
        <button class="incard-del-btn incard-dup-btn" title="Duplicate item" onclick="event.stopPropagation(); const p = this.closest('.dynamic-comp-item'); if(p) { const c = p.cloneNode(true); p.parentNode.insertBefore(c, p.nextSibling); window.LayoutEngine?.autoReflowPages(); }">⧉</button>
        <button class="bullet-del-btn incard-del-btn" title="Delete item" onclick="this.closest('.dynamic-comp-item').remove(); window.LayoutEngine?.autoReflowPages();">✕</button>
      </div>
    `;
    wrap.appendChild(item);
    const span = item.querySelector('.comp-item-text');
    if (span) span.focus();
    window.LayoutEngine?.autoReflowPages();
  },

  cycleBullet(dotEl) {
    if (!dotEl) return;
    const styles = ['✔', '•', '⭐', '▶', '1.', '☑', 'none'];
    const current = dotEl.textContent.trim();
    let idx = styles.indexOf(current);
    if (idx === -1) idx = 0;
    const next = styles[(idx + 1) % styles.length];
    window.HistoryEngine?.pushState('Cycle Bullet Style');
    if (next === 'none') {
      dotEl.style.display = 'none';
      dotEl.textContent = '';
    } else {
      dotEl.style.display = 'inline-block';
      dotEl.textContent = next;
    }
    window.LayoutEngine?.autoReflowPages();
  },

  toggleBullet(lineOrDot) {
    const item = (lineOrDot?.closest ? lineOrDot.closest('.dynamic-bullet-item, li, .incard-text-line-wrapper, p, div') : null) || lineOrDot;
    if (!item) return;
    window.HistoryEngine?.pushState('Toggle Bullet');
    const existingDot = item.querySelector('.bullet-dot');
    if (existingDot) {
      if (existingDot.style.display === 'none') {
        existingDot.style.display = 'inline-block';
        existingDot.textContent = '✔';
      } else {
        existingDot.style.display = 'none';
      }
    } else {
      const dot = document.createElement('span');
      dot.className = 'bullet-dot';
      dot.style.cssText = 'color:#2563EB; font-weight:bold; line-height:1.4; margin-right:8px; cursor:pointer; user-select:none;';
      dot.textContent = '✔';
      dot.onclick = () => window.LayoutEngine?.cycleBullet(dot);
      item.insertBefore(dot, item.firstChild);
    }
    window.LayoutEngine?.autoReflowPages();
  },

  addBulletsToAllLines(cardOrContainer) {
    const card = (cardOrContainer && cardOrContainer.closest ? cardOrContainer.closest('.card-base, .concept-card, section') : null) || cardOrContainer || window.CanvasEditor?.selectedElement;
    if (!card) return;
    window.HistoryEngine?.pushState('Add Bullets to All Lines');
    const lines = card.querySelectorAll ? card.querySelectorAll('.card-body-text p, .card-body-text div, .dynamic-paragraph-wrapper, .dynamic-bullet-item, li') : [];
    if (lines.length > 0) {
      lines.forEach((line) => {
        let dot = line.querySelector('.bullet-dot');
        if (!dot) {
          dot = document.createElement('span');
          dot.className = 'bullet-dot';
          dot.style.cssText = 'color:#2563EB; font-weight:bold; line-height:1.4; margin-right:8px; cursor:pointer; user-select:none;';
          dot.textContent = '✔';
          dot.onclick = () => window.LayoutEngine?.cycleBullet(dot);
          line.insertBefore(dot, line.firstChild);
        } else {
          dot.style.display = 'inline-block';
          dot.textContent = '✔';
        }
      });
    } else {
      const body = (card.querySelector ? card.querySelector('.card-body-text') : null) || card;
      const text = body.innerText || '';
      const splitLines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (splitLines.length > 0) {
        body.innerHTML = splitLines.map(l => `
          <div class="dynamic-bullet-item" style="display:flex; align-items:flex-start; gap:8px; margin:4px 0;">
            <span class="bullet-dot" style="color:#2563EB; font-weight:bold; line-height:1.4; cursor:pointer; user-select:none;" onclick="window.LayoutEngine?.cycleBullet(this)">✔</span>
            <span class="bullet-text" contenteditable="true" style="font-size:0.82rem; color:#1E293B; line-height:1.5; font-weight:500; flex:1;">${this.escapeHtml(l.replace(/^[\s•\-\*✔✓✔️🧩]+/, '').trim())}</span>
          </div>
        `).join('');
      }
    }
    window.SaveEngine?._showToast('✔ Added bullets to all lines');
    window.LayoutEngine?.autoReflowPages();
  },

  removeBulletsFromAllLines(cardOrContainer) {
    const card = (cardOrContainer && cardOrContainer.closest ? cardOrContainer.closest('.card-base, .concept-card, section') : null) || cardOrContainer || window.CanvasEditor?.selectedElement;
    if (!card) return;
    window.HistoryEngine?.pushState('Remove Bullets from All Lines');
    card.querySelectorAll?.('.bullet-dot').forEach(d => d.remove());
    window.SaveEngine?._showToast('🗑️ Removed bullets from all lines');
    window.LayoutEngine?.autoReflowPages();
  },

  setBulletStyle(cardOrContainer, style = '✔') {
    const card = (cardOrContainer && cardOrContainer.closest ? cardOrContainer.closest('.card-base, .concept-card, section') : null) || cardOrContainer || window.CanvasEditor?.selectedElement;
    if (!card) return;
    window.HistoryEngine?.pushState('Set Bullet Style');
    const dots = card.querySelectorAll ? card.querySelectorAll('.bullet-dot') : [];
    dots.forEach((d, i) => {
      d.style.display = 'inline-block';
      if (style === 'num') {
        d.textContent = `${i + 1}.`;
      } else {
        d.textContent = style;
      }
    });
    window.SaveEngine?._showToast(`Bullet style updated: ${style}`);
    window.LayoutEngine?.autoReflowPages();
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
    // ── CLEANUP ORPHANED EMPTY CARDS (skip AI spacers and cards with intentional body structures)
    document.querySelectorAll('.card-base, .concept-card, .code-snippet-card, .image-holder-card, .space-filler-card, section.draggable-element').forEach(c => {
      const text = (c.textContent || '').replace(/⬆️ Fit|✕|⧉|➕ Add to Card:|📦 Sub-Card|📋 List|📄 Text|💡 Callout|🏷️ Pair|💻 Code/g, '').trim();
      const hasMedia = c.querySelector('img, svg, iframe, canvas, table, ul, ol, input, [contenteditable="true"]');
      // Fix #10: Never delete AI-inserted spacers or cards with structured bodies
      if (!text && !hasMedia && !c.dataset.aiSpacer && !c.querySelector('.space-filler-inner') && !c.querySelector('.card-body-text') && !c.querySelector('.subcard-body')) {
        c.remove();
      }
    });

    const pages = document.querySelectorAll('.book-page');
    let hasReflowed = false;

    pages.forEach((page, pageIdx) => {
      const bodyContainer = page.querySelector('.page-body-container');
      if (!bodyContainer) return;

      const getCards = () => Array.from(bodyContainer.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > .split-layout, :scope > section, :scope > div:not(.page-background-overlay):not(.empty-page-placeholder)'));

      // ── OVERFLOW DETECTION ──────────────────────────────
      const checkCardOverflow = () => {
        const cards = getCards();
        if (cards.length <= 1) return false;

        const bodyH = bodyContainer.clientHeight || 950;
        const scrollH = bodyContainer.scrollHeight || 0;
        const isScrollOverflow = scrollH > (bodyH + 6);

        const lastCard = cards[cards.length - 1];
        const lastCardBottom = lastCard.offsetTop + lastCard.offsetHeight;
        const isCardPastBody = (lastCardBottom - bodyH) >= 12;

        return isScrollOverflow || isCardPastBody;
      };

      let isBodyOverflowing = checkCardOverflow();
      let safetyCounter = 0;

      // ── LOOP-PUSH OVERFLOWING CARDS TO NEXT PAGE ────────
      while (isBodyOverflowing && safetyCounter < 15) {
        safetyCounter++;
        const cards = getCards();
        if (cards.length <= 1) break;

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

      // ── SMART STACKING (PULL UP): ONLY PULL IF IT GUARANTEED FITS! ──
      if (!checkCardOverflow() && pageIdx < pages.length - 1) {
        const nextPage = pages[pageIdx + 1];
        if (nextPage && nextPage.classList.contains('book-page')) {
          const nextBody = nextPage.querySelector('.page-body-container');
          const thisBody = bodyContainer;
          if (nextBody && thisBody) {
            const nextCards = Array.from(nextBody.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > .split-layout, :scope > section'));
            if (nextCards.length > 0) {
              const cardToStack = nextCards[0];
              // Only pull if it's not a banner and not a placeholder
              if (!cardToStack.classList.contains('page-type-banner') && !cardToStack.classList.contains('empty-page-placeholder')) {
                const availableSpace = thisBody.clientHeight - thisBody.scrollHeight;
                const cardH = cardToStack.offsetHeight || cardToStack.getBoundingClientRect().height || 180;
                // CRITICAL FIX: Only pull if it fits with at least 15px safety margin!
                if (cardH + 15 <= availableSpace) {
                  thisBody.appendChild(cardToStack);
                  hasReflowed = true;
                }
              }
            }
          }
        }
      }

      // ── RE-EVALUATE AND RENDER OVERFLOW WARNING / ACTION TRAY ──
      const finalOverflow = checkCardOverflow();
      const currentCards = getCards();
      const bodyH = bodyContainer.clientHeight || 950;

      // Clean up previous overflowing card highlights & pills
      currentCards.forEach(c => {
        c.classList.remove('card-overflowing');
        c.querySelectorAll('.card-overflow-pill').forEach(p => p.remove());
      });

      let overflowBanner = page.querySelector('.page-overflow-banner');
      let overflowBadge = page.querySelector('.page-overflow-badge');

      if (finalOverflow) {
        page.classList.add('is-overflowing');
        const overPx = Math.max(10, Math.round(bodyContainer.scrollHeight - bodyH));

        // Mark individual cards that extend past bottom boundary
        let overflowCardCount = 0;
        currentCards.forEach((card, cIdx) => {
          const cardBottom = card.offsetTop + card.offsetHeight;
          if (cardBottom > (bodyH - 10) || cIdx === currentCards.length - 1) {
            card.classList.add('card-overflowing');
            overflowCardCount++;

            // Inject floating move pill on overflowing card
            let pill = card.querySelector('.card-overflow-pill');
            if (!pill) {
              pill = document.createElement('div');
              pill.className = 'card-overflow-pill';
              pill.innerHTML = `⚠️ Hidden / Past Margin → Move to Page ${pageIdx + 2} ⬇`;
              pill.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                window.PageManager.moveElementDown(card);
              };
              card.appendChild(pill);
            }
          }
        });

        // Top warning badge
        if (!overflowBadge) {
          overflowBadge = document.createElement('div');
          overflowBadge.className = 'page-overflow-badge';
          overflowBadge.title = 'Click to auto-reflow overflow items to next page';
          overflowBadge.style.cssText = 'position:absolute; top:8px; right:8px; background:#EF4444; color:#FFF; font-size:0.68rem; font-weight:800; padding:4px 10px; border-radius:12px; z-index:9999; cursor:pointer; box-shadow:0 4px 12px rgba(239,68,68,0.5); display:flex; align-items:center; gap:6px;';
          overflowBadge.onclick = (e) => { e.stopPropagation(); this.pushOverflowCardsToNextPage(pageIdx); };
          page.appendChild(overflowBadge);
        }
        overflowBadge.innerHTML = `⚠️ PAGE ${pageIdx + 1} OVERFLOWING (+${overPx}px) — Click to Move Down`;

        // Bottom interactive banner
        if (!overflowBanner) {
          overflowBanner = document.createElement('div');
          overflowBanner.className = 'page-overflow-banner';
          page.appendChild(overflowBanner);
        }
        overflowBanner.innerHTML = `
          <span>⚠️ <strong>${overflowCardCount} Card${overflowCardCount > 1 ? 's' : ''} Hidden / Past Margin (+${overPx}px)</strong></span>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="ctx-btn-sm" style="background:#EF4444; border:none; padding:3px 10px; font-weight:bold; cursor:pointer;" onclick="window.LayoutEngine.pushOverflowCardsToNextPage(${pageIdx})">⬇ Move Hidden to Page ${pageIdx + 2}</button>
            <button class="ctx-btn-sm" style="background:#2563EB; border:none; padding:3px 8px; cursor:pointer;" onclick="window.AILayoutTools.autoEqualizePages()">⚡ Auto-Equalize</button>
          </div>
        `;
      } else {
        page.classList.remove('is-overflowing');
        if (overflowBadge) overflowBadge.remove();
        if (overflowBanner) overflowBanner.remove();
      }
    });

    // Renumber pages
    document.querySelectorAll('.book-page').forEach((p, idx) => {
      p.dataset.pageNum = idx + 1;
      const ribbon = p.querySelector('.page-ribbon');
      if (ribbon && !ribbon.isContentEditable) ribbon.textContent = `PAGE ${idx + 1}`;
      else if (ribbon && ribbon.textContent.match(/^PAGE \d+$/)) ribbon.textContent = `PAGE ${idx + 1}`;
    });

    // Fix #1: Controlled single re-pass
    if (hasReflowed && !this._reflowPassRunning) {
      this._reflowPassRunning = true;
      setTimeout(() => {
        this._reflowPassRunning = false;
        this.autoReflowPages();
      }, 60);
    } else {
      this._reflowPassRunning = false;
    }
  },

  pushOverflowCardsToNextPage(pageIdx) {
    const pages = document.querySelectorAll('.book-page');
    const page = pages[pageIdx];
    if (!page) return;
    const body = page.querySelector('.page-body-container');
    if (!body) return;

    window.HistoryEngine?.pushState('Move Overflow Cards to Next Page');

    let nextPage = page.nextElementSibling;
    if (!nextPage || !nextPage.classList.contains('book-page')) {
      const mNum = page.dataset.missionNumber || '01';
      nextPage = this.createPageElement(
        { missionNumber: mNum, missionTitle: 'CONTINUED', missionSubtitle: '' },
        { sections: [], pageType: 'generic' },
        pageIdx + 2, pageIdx + 2
      );
      if (page.parentNode) page.parentNode.insertBefore(nextPage, page.nextSibling);
    }

    const nextBody = nextPage.querySelector('.page-body-container');
    if (!nextBody) return;

    const placeholder = nextBody.querySelector('.empty-page-placeholder');
    if (placeholder) placeholder.remove();

    const cards = Array.from(body.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > .split-layout, :scope > section'));
    const bodyH = body.clientHeight || 950;

    let movedCount = 0;
    for (let i = cards.length - 1; i >= 1; i--) {
      const c = cards[i];
      if ((c.offsetTop + c.offsetHeight > bodyH) || (body.scrollHeight > bodyH + 4)) {
        nextBody.insertBefore(c, nextBody.firstChild);
        movedCount++;
      }
    }

    if (movedCount === 0 && cards.length > 1) {
      nextBody.insertBefore(cards[cards.length - 1], nextBody.firstChild);
      movedCount++;
    }

    this.autoReflowPages();
    window.SaveEngine?._showToast(`⬇ Moved ${movedCount} hidden card(s) to Page ${pageIdx + 2}!`);
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
