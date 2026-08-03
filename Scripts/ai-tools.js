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

    // Collect all cards across all pages
    const allCards = Array.from(canvas.querySelectorAll('.draggable-element'));
    if (allCards.length === 0) return alert("No cards found on canvas to equalize!");

    // Estimate page capacity (~750px height available per page container)
    const TARGET_PAGE_HEIGHT = 700;
    const pagesData = [[]];
    let currentHeight = 0;
    let pageIdx = 0;

    allCards.forEach(card => {
      const cardHeight = card.offsetHeight || 150;
      if (currentHeight + cardHeight > TARGET_PAGE_HEIGHT && pagesData[pageIdx].length > 0) {
        pageIdx++;
        pagesData[pageIdx] = [];
        currentHeight = 0;
      }
      pagesData[pageIdx].push(card);
      currentHeight += cardHeight + 12; // 12px margin
    });

    // Re-render pages cleanly
    const currentMission = window.currentMission || { missionNumber: '14', title: 'Smart Climate Monitor' };
    const structuredPages = pagesData.map((cards, idx) => ({
      pageNum: idx + 1,
      sections: []
    }));

    // Move DOM elements into balanced pages
    window.LayoutEngine.renderMission({
      ...currentMission,
      pages: structuredPages
    }, canvas);

    // Populate cards into new page containers
    const newPages = canvas.querySelectorAll('.book-page');
    pagesData.forEach((cards, idx) => {
      if (newPages[idx]) {
        const bodyContainer = newPages[idx].querySelector('.page-body-container');
        if (bodyContainer) {
          bodyContainer.innerHTML = '';
          cards.forEach(c => bodyContainer.appendChild(c));
        }
      }
    });

    // Refresh layout view mode & overflow checks
    window.LayoutEngine.checkOverflows();
    if (document.body.classList.contains('view-two-page')) {
      window.LayoutEngine.applyTwoPageSpreadMode();
    }
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
  }
};
