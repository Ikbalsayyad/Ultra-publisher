/**
 * UltraMinds A4 Page Layout & Real-Time Auto-Reflow Page Flow Engine (V14 - Includes Floating Clipart Mascot Layer)
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
    document.body.className = `${themeClass} ${document.body.classList.contains('manual-mode') ? 'manual-mode' : ''} ${document.body.classList.contains('view-two-page') ? 'view-two-page' : ''}`;

    if (!missionObj.pages || !Array.isArray(missionObj.pages)) {
      containerEl.innerHTML = '<div class="error-msg" style="padding:40px; text-align:center; color:#FF4D4D; font-weight:bold;">Unable to parse mission layout. Please check input text or API settings.</div>';
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

    setTimeout(() => this.autoReflowPages(), 50);
  },

  renderTwoPageSpreadSpreads(pagesElements, containerEl) {
    containerEl.innerHTML = '';

    for (let i = 0; i < pagesElements.length; i += 2) {
      const spread = document.createElement('div');
      spread.className = 'two-page-spread';

      spread.appendChild(pagesElements[i]);

      if (i + 1 < pagesElements.length) {
        spread.appendChild(pagesElements[i + 1]);
      }

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

    setTimeout(() => this.autoReflowPages(), 50);
  },

  createPageElement(mission, pageData, pageNum, totalPages) {
    const page = document.createElement('div');
    page.className = 'book-page a4-page';
    page.dataset.pageNum = pageNum;

    // Apply Global Font Override if set
    const savedFont = localStorage.getItem('ultraminds_global_font') || '';
    if (savedFont) {
      page.style.setProperty('--page-global-font', savedFont);
    }

    // Page Background Overlay Layer
    const bgOverlay = document.createElement('div');
    bgOverlay.className = 'page-background-overlay';
    const savedBgImg = localStorage.getItem('ultraminds_page_bg_img') || '';
    const savedBgOpacity = localStorage.getItem('ultraminds_page_bg_opacity') || '1.0';
    if (savedBgImg) bgOverlay.style.backgroundImage = `url("${savedBgImg}")`;
    bgOverlay.style.opacity = savedBgOpacity;
    page.appendChild(bgOverlay);

    // Top Header Bar
    const topBar = document.createElement('div');
    topBar.className = 'page-top-bar';
    const mNum = mission.missionNumber || '11';
    topBar.innerHTML = `
      <div class="page-ribbon">PAGE ${pageNum}</div>
      <div class="top-mission-pill">MISSION ${mNum}</div>
      <div class="top-corner-badge">
        <span class="badge-text">MISSION</span>
        <span class="badge-num">${mNum}</span>
      </div>
    `;
    page.appendChild(topBar);

    // Main Header Title Banner ONLY ON PAGE 1!
    if (pageNum === 1) {
      const headerBanner = document.createElement('header');
      headerBanner.className = 'mission-header-banner draggable-element';
      headerBanner.setAttribute('draggable', 'true');
      headerBanner.innerHTML = `
        <div class="header-guide">
          <div class="guide-avatar">
            <span class="avatar-icon">🧑‍🚀</span>
          </div>
          <div class="guide-meta">
            <span class="guide-name">${mission.guideName || 'Commander Nova'}</span>
            <span class="guide-role">${mission.guideRole || 'Your Mission Guide'}</span>
          </div>
        </div>
        <div class="header-titles">
          <h1 class="mission-title" contenteditable="true">${mission.missionTitle || mission.title}</h1>
          <p class="mission-subtitle" contenteditable="true">${mission.missionSubtitle || ''}</p>
        </div>
      `;
      page.appendChild(headerBanner);
    }

    // Sections Container
    const bodyContainer = document.createElement('main');
    bodyContainer.className = 'page-body-container';

    if (pageData.sections && Array.isArray(pageData.sections)) {
      pageData.sections.forEach(sec => {
        if (sec.type === 'header-banner' || sec.type === 'mission-header' || sec.type === 'next-preview') return;
        const secEl = this.renderSection(sec);
        if (secEl) {
          if (sec.type === 'floating-clipart') {
            page.appendChild(secEl);
          } else {
            bodyContainer.appendChild(secEl);
          }
        }
      });
    }

    page.appendChild(bodyContainer);

    // CLEAN PAGE FOOTER BAR
    const footer = document.createElement('footer');
    footer.className = 'page-footer';

    let footerContent = '';
    if (pageData.footerPills && pageData.footerPills.length > 0) {
      const pillsHtml = pageData.footerPills.map(p => `<span class="footer-code-pill">${p}</span>`).join('');
      footerContent += `<div class="footer-pills">${pillsHtml}</div>`;
    } else if (pageData.footerTip) {
      footerContent += `<div class="footer-tip"><strong>💡 ENGINEER TIP:</strong> ${pageData.footerTip}</div>`;
    } else if (pageData.footerFact) {
      footerContent += `<div class="footer-fact"><strong>💡 DID YOU KNOW?</strong> ${pageData.footerFact}</div>`;
    } else if (pageData.footerSlogan) {
      footerContent += `<div class="footer-slogan"><span>${pageData.footerSlogan}</span></div>`;
    }

    if (pageData.brandTag) {
      footerContent += `<div class="footer-brand">${pageData.brandTag}</div>`;
    }

    footer.innerHTML = footerContent;
    page.appendChild(footer);

    return page;
  },

  getThemeClassForType(type) {
    if (!type || typeof type !== 'string') return 'theme-card-blue';
    const t = type.toLowerCase();

    if (t.includes('build') || t.includes('test') || t.includes('lab') || t.includes('habit') || t.includes('real') || t.includes('action') || t.includes('designer') || t.includes('step')) {
      return 'theme-card-green';
    }
    if (t.includes('review') || t.includes('recap') || t.includes('reflection') || t.includes('badge') || t.includes('portfolio') || t.includes('progress') || t.includes('summary')) {
      return 'theme-card-orange';
    }
    if (t.includes('innovation') || t.includes('ai') || t.includes('future') || t.includes('curiosity') || t.includes('know') || t.includes('think') || t.includes('question') || t.includes('challenge')) {
      return 'theme-card-purple';
    }
    if (t.includes('mistake') || t.includes('debug') || t.includes('error') || t.includes('safety') || t.includes('caution') || t.includes('warn')) {
      return 'theme-card-red';
    }
    if (t.includes('note') || t.includes('vocab') || t.includes('career') || t.includes('parent') || t.includes('teacher') || t.includes('home') || t.includes('nova') || t.includes('fact') || t.includes('space') || t.includes('filler')) {
      return 'theme-card-slate';
    }
    return 'theme-card-blue';
  },

  renderSection(sec) {
    if (sec.type === 'floating-clipart') {
      const clipartUrl = sec.imgUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
      const sticker = document.createElement('div');
      sticker.className = 'floating-clipart-sticker draggable-sticker';
      sticker.style.cssText = 'position: absolute; top: 120px; right: 30px; width: 140px; height: 140px; z-index: 100; cursor: move; pointer-events: auto;';
      sticker.innerHTML = `
        <img src="${clipartUrl}" class="clipart-img" style="width: 100%; height: 100%; object-fit: contain; background: transparent; display: block; border: none; outline: none; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.35)); pointer-events: none;" />
      `;
      return sticker;
    }

    if (sec.type === 'split-layout') {
      const splitEl = document.createElement('div');
      splitEl.className = 'split-layout draggable-element';
      splitEl.setAttribute('draggable', 'true');

      if (sec.left) {
        const leftCol = this.renderSection(sec.left);
        if (leftCol) splitEl.appendChild(leftCol);
      }
      if (sec.right) {
        const rightCol = this.renderSection(sec.right);
        if (rightCol) splitEl.appendChild(rightCol);
      }
      return splitEl;
    }

    if (sec.type === 'space-filler') {
      const spacer = document.createElement('div');
      spacer.className = 'space-filler-card draggable-element theme-card-slate';
      spacer.setAttribute('draggable', 'true');
      spacer.innerHTML = `<div class="space-filler-inner" contenteditable="true" style="min-height: 80px; padding: 12px; border: 1.5px dashed rgba(0, 240, 255, 0.4); border-radius: 8px; color: #94A3B8; text-align: center; font-size: 0.8rem; background: rgba(0,0,0,0.1);">👻 Custom Space Filler (Empty Gap Spacer)</div>`;
      return spacer;
    }

    const themeClass = this.getThemeClassForType(sec.type);
    const card = document.createElement('section');
    card.className = `card-base ${sec.type} ${themeClass} draggable-element`;
    card.setAttribute('draggable', 'true');

    let icon = sec.icon || '📌';
    let titleHtml = sec.title ? `
      <div class="capsule-header">
        <span class="round-icon-badge">${icon}</span>
        <span contenteditable="true" class="card-title-text">${sec.title}</span>
      </div>
    ` : '';

    switch (sec.type) {
      case 'image-holder':
        const imgSrcA = (sec.imgUrl && !sec.imgUrl.includes('placeholder')) ? sec.imgUrl : (window.AIService ? window.AIService.getHardwareImageForTopic(sec.title || sec.caption || '') : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80');
        const fitStyleA = sec.objectFit || 'cover';
        const posStyleA = sec.objectPosition || 'center';

        card.className = `card-base image-holder-card ${themeClass} draggable-element`;
        card.innerHTML = `
          ${titleHtml}
          <div class="image-frame-container" style="position:relative; width:100%; min-height:160px; height:200px; overflow:hidden; border-radius:8px; background:#0F172A; margin:8px 0; border:1px solid rgba(255,255,255,0.15); cursor:pointer;">
            <img src="${imgSrcA}" class="holder-img" style="width:100%; height:100%; object-fit:${fitStyleA}; object-position:${posStyleA}; display:block; pointer-events:none;" />
          </div>
          <div class="card-caption-text" contenteditable="true" style="font-size:0.78rem; color:#64748B; font-style:italic; text-align:center; margin-top:4px;">${sec.caption || sec.title || 'Hardware Schematic Diagram'}</div>
        `;
        break;

      case 'incard-image-holder':
        const imgSrcB = sec.imgUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
        const fitStyleB = sec.objectFit || 'cover';
        const posStyleB = sec.objectPosition || 'center';

        const incardBox = document.createElement('div');
        incardBox.className = `incard-image-box ${themeClass} draggable-element`;
        incardBox.setAttribute('draggable', 'true');
        incardBox.style.cssText = 'display:flex; flex-direction:column; border:1.5px solid rgba(255,255,255,0.2); border-radius:8px; overflow:hidden; background:rgba(15,23,42,0.6); margin:8px 0; width:100%; box-sizing:border-box;';
        
        incardBox.innerHTML = `
          <div class="image-frame-container" style="position:relative; width:100%; height:160px; overflow:hidden; background:#0B0F19; cursor:pointer;">
            <img src="${imgSrcB}" class="holder-img" style="width:100%; height:100%; object-fit:${fitStyleB}; object-position:${posStyleB}; display:block; pointer-events:none;" />
          </div>
          <div class="incard-bottom-capsule" contenteditable="true" style="padding:6px 10px; border-top:1.5px solid rgba(255,255,255,0.2); font-size:0.8rem; font-weight:700; color:#F8FAFC; text-align:center; background:rgba(0,0,0,0.3); border-radius:0;">
            ${sec.title || 'Image 1'}
          </div>
        `;
        return incardBox;

      case 'nova-card':
      case 'real-world':
      case 'curiosity-box':
      case 'did-you-know':
      case 'concept-card':
      case 'component-spotlight':
      case 'tool-explorer':
      case 'ui-blueprint':
      case 'component-properties':
      case 'variable-tracker':
      case 'data-flow':
      case 'mini-challenge':
      case 'engineering-habit':
      case 'testing-lab':
      case 'innovation-studio':
      case 'upgrade-card':
      case 'mission-extension':
      case 'team-challenge':
      case 'build-yourself':
      case 'innovation-challenge':
      case 'ai-thinking':
      case 'real-world-eng':
      case 'career-spotlight':
      case 'future-tech':
      case 'safety-card':
      case 'mission-review':
      case 'knowledge-check':
      case 'reflection-card':
      case 'my-notes':
      case 'vocabulary-builder':
      case 'quick-recap':
      case 'progress-tracker':
      case 'portfolio-task':
      case 'home-challenge':
      case 'parent-connect':
      case 'teacher-notes':
      case 'qr-resources':
        card.innerHTML = `${titleHtml}<div class="card-body-text" contenteditable="true">${this.formatText(sec.content || '')}</div>`;
        break;

      case 'stem-fact':
        let oledHtml = sec.oledPreview ? `<div class="oled-mini-screen"><pre>${sec.oledPreview}</pre></div>` : '';
        card.innerHTML = `${titleHtml}<div class="card-body-text" contenteditable="true">${this.formatText(sec.content || '')}</div>${oledHtml}`;
        break;

      case 'mission-objectives':
        let objsHtml = '';
        if (sec.objectives && Array.isArray(sec.objectives)) {
          objsHtml = sec.objectives.map((o, idx) => {
            const objText = (typeof o === 'string') ? o : (o?.text || o?.title || o?.content || `Objective ${idx + 1}`);
            const objSub = (typeof o === 'object') ? (o?.subtext || '') : '';
            const objNum = (typeof o === 'object' && o?.num) ? o.num : (idx + 1);

            return `
              <div class="objective-card">
                <div class="obj-num">${objNum}</div>
                <div class="obj-text">
                  <strong contenteditable="true">${objText}</strong>
                  ${objSub ? `<span class="obj-sub" contenteditable="true">${objSub}</span>` : ''}
                </div>
              </div>
            `;
          }).join('');
        }
        card.innerHTML = `${titleHtml}<div class="objectives-grid">${objsHtml}</div>`;
        break;

      case 'think-engineer':
        let scenarioHtml = '';
        if (sec.scenario) {
          const leftBox = sec.scenario?.left || sec.scenario?.a || { label: 'SCENARIO A', temp: '30°C', hum: '40%', feel: 'Comfortable', status: 'ok' };
          const rightBox = sec.scenario?.right || sec.scenario?.b || { label: 'SCENARIO B', temp: '30°C', hum: '80%', feel: 'Hot & Sticky', status: 'warn' };

          scenarioHtml = `
            <div class="scenario-comparison">
              <div class="scenario-box scenario-a">
                <div class="scenario-tag">${leftBox?.label || 'SCENARIO A'}</div>
                <div class="scenario-stats">
                  <span>🌡️ ${leftBox?.temp || ''}</span>
                  <span>💧 ${leftBox?.hum || ''}</span>
                </div>
                <div class="scenario-feel status-${leftBox?.status || 'ok'}">${leftBox?.feel || ''}</div>
              </div>
              <div class="vs-badge">VS</div>
              <div class="scenario-box scenario-b">
                <div class="scenario-tag">${rightBox?.label || 'SCENARIO B'}</div>
                <div class="scenario-stats">
                  <span>🌡️ ${rightBox?.temp || ''}</span>
                  <span>💧 ${rightBox?.hum || ''}</span>
                </div>
                <div class="scenario-feel status-${rightBox?.status || 'warn'}">${rightBox?.feel || ''}</div>
              </div>
            </div>
          `;
        }
        card.innerHTML = `
          ${titleHtml}
          <div class="question-prompt" contenteditable="true">${sec.question || sec.content || ''}</div>
          <div class="answer-dotted-lines">
            <div class="dotted-line"></div>
            <div class="dotted-line"></div>
          </div>
          ${scenarioHtml}
        `;
        break;

      case 'build-steps':
      case 'designer-studio':
        card.className = `concept-card ${themeClass} draggable-element`;
        let stepsHtml = '';
        if (sec.steps && Array.isArray(sec.steps)) {
          stepsHtml = sec.steps.map(s => {
            let tableRows = (s?.pinTable && Array.isArray(s.pinTable)) ? s.pinTable.map(r => `<tr><th>${r?.from || ''}</th><td>${r?.to || ''}</td></tr>`).join('') : '';
            let tableHtml = tableRows ? `<table class="data-table">${tableRows}</table>` : '';
            return `
              <div class="lab-step draggable-element in-card-step" draggable="true" style="cursor:grab;">
                <div class="step-number">${s?.stepNum || ''} ${s?.title || ''}</div>
                <p class="step-instruction" contenteditable="true">${s?.desc || ''}</p>
                ${tableHtml}
              </div>
            `;
          }).join('');
        }
        let buildFallback = sec.content ? `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content)}</div>` : '';
        card.innerHTML = `${titleHtml}<div class="build-lab">${stepsHtml || buildFallback}</div>`;
        break;

      case 'code-snippet':
      case 'programming-studio':
      case 'syntax-box':
        card.className = `code-snippet-card ${themeClass} draggable-element`;
        const codeText = sec.code || sec.content || sec.text || '// Code logic here';
        card.innerHTML = `
          ${titleHtml}
          <div class="code-box">
            <div class="code-header">
              <span class="lang-badge">${sec.language || 'blocks'}</span>
            </div>
            <pre class="code-content"><code contenteditable="true">${codeText}</code></pre>
          </div>
        `;
        break;

      case 'common-mistakes':
      case 'debug-corner':
        card.className = `card-base mistakes-card ${themeClass} draggable-element`;
        let mistakesList = (sec.mistakes && Array.isArray(sec.mistakes)) ? sec.mistakes.map(m => `
          <div class="mistake-item">
            <div class="mistake-issue">⚠️ <span contenteditable="true">${m.issue || ''}</span></div>
            <div class="mistake-fix">➔ <span contenteditable="true">${m.fix || ''}</span></div>
          </div>
        `).join('') : '';
        let mistakesFallback = sec.content ? `<div class="card-body-text" contenteditable="true">${this.formatText(sec.content)}</div>` : '';
        card.innerHTML = `${titleHtml}<div class="mistakes-list">${mistakesList || mistakesFallback}</div>`;
        break;

      case 'ultra-badge':
        card.className = `card-base badge-card ${themeClass} draggable-element`;
        card.innerHTML = `
          <div class="badge-icon">🎖️</div>
          <div class="badge-title" contenteditable="true" style="color: #1E40AF; font-weight: 800; font-size: 1.1rem; text-transform: uppercase;">${sec.badgeName || sec.title || 'PRODUCTIVITY ENGINEER BADGE'}</div>
          <div class="badge-text" contenteditable="true" style="color: #2563EB; font-weight: 700; font-size: 0.85rem; margin-top: 4px;">${sec.badgeStatus || 'MISSION COMPLETE'}</div>
          <p contenteditable="true" style="color: #334155; margin-top: 6px; font-size: 0.85rem;">${sec.congrats || sec.content || 'Congratulations! Today you built software that improves daily life.'}</p>
        `;
        break;

      default:
        card.innerHTML = `${titleHtml}<div class="card-body-text" contenteditable="true">${this.formatText(sec.content || '')}</div>`;
        break;
    }

    return card;
  },

  createMultiImageGrid(cols, isIncard = false) {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'multi-image-grid-row draggable-element';
    gridContainer.setAttribute('draggable', 'true');
    gridContainer.style.cssText = `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 10px; width: 100%; margin: 8px 0; box-sizing: border-box;`;

    for (let i = 1; i <= cols; i++) {
      let item;
      if (isIncard) {
        item = this.renderSection({
          type: 'incard-image-holder',
          title: `Image ${i}`,
          imgUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
        });
      } else {
        item = this.renderSection({
          type: 'image-holder',
          title: `FIGURE 1.${i}`,
          icon: '🖼️',
          caption: `Image ${i}`,
          imgUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
        });
      }
      gridContainer.appendChild(item);
    }

    return gridContainer;
  },

  mergeCardsSideBySide(card1, card2) {
    if (!card1 || !card2 || card1 === card2) return;
    const splitRow = document.createElement('div');
    splitRow.className = 'split-layout draggable-element';
    splitRow.setAttribute('draggable', 'true');

    const parent = card1.parentNode;
    parent.insertBefore(splitRow, card1);

    splitRow.appendChild(card1);
    splitRow.appendChild(card2);

    window.LayoutEngine.autoReflowPages();
    return splitRow;
  },

  unstackSplitLayout(splitEl) {
    if (!splitEl) return;
    const parent = splitEl.parentNode;
    if (!parent) return;

    const children = Array.from(splitEl.children);
    children.forEach(child => {
      child.style.flex = '';
      child.style.width = '100%';
      child.style.margin = '8px 0';
      parent.insertBefore(child, splitEl);
    });

    splitEl.remove();
    window.LayoutEngine.autoReflowPages();
  },

  formatText(txt) {
    if (!txt) return '';
    return txt.replace(/\n/g, '<br>');
  },

  autoReflowPages() {
    const pages = document.querySelectorAll('.book-page');
    let hasReflowed = false;

    pages.forEach((page, pageIdx) => {
      const pageHeight = page.offsetHeight || 1050;
      const bodyContainer = page.querySelector('.page-body-container');
      if (!bodyContainer) return;

      const scrollHeight = page.scrollHeight;

      if (scrollHeight > pageHeight + 5) {
        const cards = bodyContainer.querySelectorAll('.draggable-element');
        if (cards.length > 1) {
          const cardToPush = cards[cards.length - 1];

          let nextPage = page.nextElementSibling;
          if (!nextPage || !nextPage.classList.contains('book-page')) {
            const currentNum = pageIdx + 1;
            nextPage = this.createPageElement({ missionNumber: '15', title: 'CONTINUATION' }, { sections: [] }, currentNum + 1, currentNum + 1);

            if (document.body.classList.contains('view-two-page')) {
              this.applyTwoPageSpreadMode();
            } else {
              page.parentNode.appendChild(nextPage);
            }
          }

          const nextBody = nextPage.querySelector('.page-body-container');
          if (nextBody) {
            nextBody.insertBefore(cardToPush, nextBody.firstChild);
            hasReflowed = true;
          }
        }
      }
    });

    document.querySelectorAll('.book-page').forEach((p, idx) => {
      p.dataset.pageNum = idx + 1;
      const ribbon = p.querySelector('.page-ribbon');
      if (ribbon) ribbon.textContent = `PAGE ${idx + 1}`;
    });

    if (hasReflowed) {
      setTimeout(() => this.autoReflowPages(), 30);
    }
  },

  checkOverflows() {
    this.autoReflowPages();
  }
};
