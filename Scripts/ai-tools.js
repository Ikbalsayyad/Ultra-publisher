/**
 * UltraMinds Next-Level AI Layout & Page Orchestrator Engine (ai-tools.js)
 * Provides automated AI algorithms for:
 * 1. AI Smart Page Equalizer (Redistributes cards to balance page fill levels)
 * 2. AI Pedagogical Flow Re-Order (Header -> Story -> Objectives -> Concept -> Code -> Debug -> Review)
 * 3. AI Whitespace Auto-Aligner (Inserts space-fillers to align bottom footers)
 * 4. AI Visual Hierarchy Enhancer (Applies hero capsule styles to key cards)
 */

window.AILayoutTools = {

  /**
   * 1. AI SMART PAGE EQUALIZER
   * Automatically balances cards across pages so every A4 page has ~85% fill rate.
   */
  autoEqualizePages() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    window.HistoryEngine?.pushState('AI Smart Page Equalizer');

    // Collect all top-level cards across all page body containers
    const allCards = Array.from(canvas.querySelectorAll('.page-body-container > .draggable-element, .page-body-container > .card-base, .page-body-container > section, .page-body-container > .split-layout'));
    if (allCards.length === 0) return alert("No cards found on canvas to equalize!");

    let pages = Array.from(canvas.querySelectorAll('.book-page'));
    if (pages.length === 0) return;

    // Target fill height per page body (~720px)
    const TARGET_PAGE_HEIGHT = 720;
    const pagesCards = [[]];
    let currentHeight = 0;
    let pageIdx = 0;

    allCards.forEach(card => {
      const cardHeight = card.offsetHeight || 160;
      if (currentHeight + cardHeight > TARGET_PAGE_HEIGHT && pagesCards[pageIdx].length > 0) {
        pageIdx++;
        pagesCards[pageIdx] = [];
        currentHeight = 0;
      }
      pagesCards[pageIdx].push(card);
      currentHeight += cardHeight + 12;
    });

    // Ensure enough page DOM elements exist
    while (pages.length < pagesCards.length) {
      window.PageManager.addPage();
      pages = Array.from(canvas.querySelectorAll('.book-page'));
    }

    // Populate cards into respective page body containers
    pagesCards.forEach((cards, idx) => {
      if (pages[idx]) {
        const bodyContainer = pages[idx].querySelector('.page-body-container');
        if (bodyContainer) {
          bodyContainer.innerHTML = '';
          cards.forEach(c => bodyContainer.appendChild(c));
        }
      }
    });

    // Remove any extra trailing pages that have 0 cards
    for (let i = pages.length - 1; i >= pagesCards.length; i--) {
      if (pages[i] && i > 0) {
        const body = pages[i].querySelector('.page-body-container');
        if (!body || body.children.length === 0 || body.querySelector('.empty-page-placeholder')) {
          pages[i].remove();
        }
      }
    }

    if (window.LayoutEngine) window.LayoutEngine.autoReflowPages();
    window.SaveEngine?._showToast('⚡ AI Smart Page Equalizer balanced cards cleanly!');
  },

  /**
   * 2. AI PEDAGOGICAL FLOW RE-ORDER
   * Sorts cards into ideal textbook learning order.
   */
  autoReorderPedagogicalFlow() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    const typePriority = {
      'mission-header': 1,
      'nova-card': 2,
      'mission-outcome': 3,
      'mission-objectives': 4,
      'real-world': 5,
      'curiosity-box': 6,
      'concept-card': 7,
      'component-spotlight': 8,
      'ui-blueprint': 9,
      'build-steps': 10,
      'designer-studio': 11,
      'programming-studio': 12,
      'code-snippet': 13,
      'blockly-blueprint': 14,
      'think-engineer': 15,
      'mini-challenge': 16,
      'testing-lab': 17,
      'debug-corner': 18,
      'common-mistakes': 19,
      'mission-review': 20,
      'knowledge-check': 21,
      'reflection-card': 22,
      'ultra-badge': 23
    };

    const allCards = Array.from(canvas.querySelectorAll('.draggable-element'));
    allCards.sort((a, b) => {
      const typeA = Array.from(a.classList).find(c => typePriority[c]) || '';
      const typeB = Array.from(b.classList).find(c => typePriority[c]) || '';
      const prioA = typePriority[typeA] || 99;
      const prioB = typePriority[typeB] || 99;
      return prioA - prioB;
    });

    // Re-insert cards in sorted order
    const pageBody = canvas.querySelector('.page-body-container');
    if (pageBody) {
      allCards.forEach(c => pageBody.appendChild(c));
    }

    this.autoEqualizePages();
  },

  /**
   * 3. AI WHITESPACE AUTO-ALIGNER
   * Inserts space-filler cards at page bottoms to align footers.
   */
  autoAlignPageFooters() {
    const pages = document.querySelectorAll('.book-page');
    pages.forEach(page => {
      const pageHeight = page.offsetHeight;
      const scrollHeight = page.scrollHeight;
      const gap = pageHeight - scrollHeight;

      if (gap > 80) {
        const bodyContainer = page.querySelector('.page-body-container');
        if (bodyContainer) {
          const spacer = document.createElement('div');
          spacer.className = 'space-filler-card draggable-element';
          spacer.setAttribute('draggable', 'true');
          spacer.innerHTML = `<div class="space-filler-inner" contenteditable="true" style="height: ${Math.min(gap - 20, 150)}px; border: 1.5px dashed rgba(0, 240, 255, 0.4); border-radius: 8px; color: #94A3B8; text-align: center; font-size: 0.8rem; display:flex; align-items:center; justify-content:center;">✨ AI Auto Spacer (${Math.round(gap)}px Gap Filled)</div>`;
          bodyContainer.appendChild(spacer);
        }
      }
    });

    window.LayoutEngine.checkOverflows();
  },

  /**
   * 4. AI VISUAL HIERARCHY ENHANCER
   * Applies hero capsule styling and contrast to key elements.
   */
  autoEnhanceVisualHierarchy() {
    const cards = document.querySelectorAll('.card-base, .concept-card, .code-snippet-card');
    const colors = ['#2563EB', '#16A34A', '#EA580C', '#7C3AED', '#0284C7'];

    cards.forEach((card, idx) => {
      const capsule = card.querySelector('.capsule-header');
      if (capsule) {
        const chosenColor = colors[idx % colors.length];
        capsule.style.background = chosenColor;
        capsule.style.color = '#FFFFFF';
        card.style.borderColor = chosenColor;
      }
    });
  },

  /**
   * 5. AI PAGE INSPECTOR (#10)
   * Analyzes selected page layout and renders working suggestion chips with 1-click execution.
   */
  runPageInspector() {
    const inspector = document.getElementById('element-inspector');
    if (!inspector) return;

    const activePage = window.PageManager?.getActivePage() || document.querySelector('.book-page');
    if (!activePage) {
      alert("No page available to inspect.");
      return;
    }

    const pageNum = activePage.dataset.pageNum || '1';
    const bodyContainer = activePage.querySelector('.page-body-container');
    const cards = Array.from(activePage.querySelectorAll('.draggable-element, .card-base, .concept-card'));

    // Accurate fill: sum of all card heights vs available body height
    const availHeight = bodyContainer ? (bodyContainer.clientHeight || 900) : 900;
    const usedHeight = cards.reduce((sum, c) => sum + (c.offsetHeight || 0) + 12, 0);
    const fillPercent = availHeight > 0 ? Math.min(Math.round((usedHeight / availHeight) * 100), 200) : 0;

    const suggestions = [];


    if (cards.length === 0) {
      suggestions.push({
        title: "✨ Autofill Empty Page",
        desc: "Page is empty. Slide up cards from next page or insert sample content.",
        action: () => this.autoFillEmptyPage()
      });
    }

    if (fillPercent < 60 && cards.length > 0) {
      suggestions.push({
        title: "🪄 Balance Page Whitespace",
        desc: "Page has over 40% unused space. Insert auto-spacer or stretch cards.",
        action: () => this.autoAlignPageFooters()
      });
    }

    if (cards.length > 5) {
      suggestions.push({
        title: "⚡ Equalize Page Cards",
        desc: `Page has ${cards.length} cards. Redistribute evenly across pages.`,
        action: () => this.autoEqualizePages()
      });
    }

    suggestions.push({
      title: "🎨 Enhance Color Contrast",
      desc: "Apply vibrant hero colors to card capsule headers.",
      action: () => this.autoEnhanceVisualHierarchy()
    });

    suggestions.push({
      title: "📐 Sort Pedagogical Order",
      desc: "Sort cards into standard STEM textbook learning order.",
      action: () => this.autoReorderPedagogicalFlow()
    });

    const suggestionsHtml = suggestions.map((s, i) => `
      <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(0,240,255,0.2); border-radius:6px; padding:8px; margin-bottom:6px;">
        <div style="font-weight:bold; font-size:0.78rem; color:var(--accent-cyan); margin-bottom:2px;">${s.title}</div>
        <div style="font-size:0.72rem; color:#94A3B8; margin-bottom:6px;">${s.desc}</div>
        <button class="ctx-btn-sm" style="background:#2563EB; width:100%;" onclick="window.AILayoutTools._execSuggestion(${i})">⚡ Apply Suggestion</button>
      </div>
    `).join('');

    this._inspectorSuggestions = suggestions;

    inspector.innerHTML = `
      <div class="inspector-section">
        <div class="ctx-label">🔍 AI Page Inspector (Page ${pageNum})</div>
        <div style="font-size:0.75rem; color:#94A3B8; margin-bottom:8px;">
          Fill Level: <strong style="color:${fillPercent > 90 ? '#EF4444' : '#10B981'};">${fillPercent}%</strong> (${cards.length} cards)
        </div>
        <div class="ctx-label" style="margin-top:6px; font-size:0.7rem;">Working Suggestions (Click to Apply):</div>
        ${suggestionsHtml}
      </div>
    `;
  },

  _execSuggestion(idx) {
    if (this._inspectorSuggestions && this._inspectorSuggestions[idx]) {
      this._inspectorSuggestions[idx].action();
      window.SaveEngine?._showToast('✨ Suggestion applied!');
      setTimeout(() => this.runPageInspector(), 400);
    }
  },

  /**
   * 6. AI AUTOFILL EMPTY PAGE (#19)
   * Autofills empty page using components from next page or generates new cards.
   */
  autoFillEmptyPage() {
    const activePage = window.PageManager?.getActivePage() || document.querySelector('.book-page');
    if (!activePage) return;

    const body = activePage.querySelector('.page-body-container');
    if (!body) return;

    // Check if next page has cards to slide up
    const nextPage = activePage.nextElementSibling;
    if (nextPage && nextPage.classList.contains('book-page')) {
      const nextBody = nextPage.querySelector('.page-body-container');
      const cardsToMove = Array.from(nextBody?.querySelectorAll('.draggable-element') || []).slice(0, 2);
      if (cardsToMove.length > 0) {
        cardsToMove.forEach(c => body.appendChild(c));
        window.LayoutEngine?.autoReflowPages();
        window.SaveEngine?._showToast('✨ Cards slid up from next page!');
        return;
      }
    }

    // Fallback: insert quick STEM objective card
    const cardEl = window.LayoutEngine?.renderSection({
      type: 'concept-card',
      title: 'PAGE AUTO-GENERATED EXPLORATION',
      icon: '🚀',
      content: 'This page was autofilled by AI. Edit this text or add custom cards from the palette!'
    });
    if (cardEl) {
      body.appendChild(cardEl);
      window.LayoutEngine?.autoReflowPages();
      window.SaveEngine?._showToast('✨ Generated exploration card!');
    }
  }
};
