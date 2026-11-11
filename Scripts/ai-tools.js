/**
 * UltraMinds Next-Level AI Layout & Page Orchestrator Engine (ai-tools.js) — V2
 * Truly intelligent algorithms for:
 * 1.  AI Smart Page Equalizer        — Bin-packing with live getBoundingClientRect heights
 * 2.  AI Autofill Empty Page         — Precision fill-level measurement + smart neighbor pull
 * 3.  AI Pedagogical Flow Re-Order   — Grouped theory→build→review with cover-page protection
 * 4.  AI Whitespace Auto-Aligner     — Gap-size aware: stretch / spacer / neighbor pull
 * 5.  AI Visual Hierarchy Enhancer   — Role-based card color system with smooth animation
 * 6.  AI Domain Theme Generator      — Content-scan keyword detection across 6 domains
 * 7.  AI Common Mistakes & Debug     — Context-read code cards → 3 structured ❌→✅ mistakes
 * 8.  Layer Adjustment               — Bring to Front / Back / Forward / Backward
 */

window.AILayoutTools = {

  // ─────────────────────────────────────────────────────────────────────────
  // SHARED HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /** Returns live pixel height of an element including margins */
  _cardHeight(el) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.height + parseFloat(style.marginTop || 0) + parseFloat(style.marginBottom || 0);
  },

  /** Returns the usable inner height of a page body (clientHeight minus footer height if present) */
  _bodyCapacity(page) {
    const body = page.querySelector('.page-body-container');
    if (!body) return 700;
    const footer = page.querySelector('.page-footer');
    const footerH = footer ? footer.offsetHeight : 0;
    return (body.clientHeight || 700) - footerH - 12;
  },

  /** Measures how many px of content is actually used in a body */
  _usedHeight(body) {
    const cards = Array.from(body.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > section, :scope > .split-layout'))
      .filter(c => !c.classList.contains('empty-page-placeholder'));
    return cards.reduce((sum, c) => sum + this._cardHeight(c) + 6, 0);
  },

  /** Collect all moveable cards across all pages */
  _getAllCards(canvas) {
    return Array.from(canvas.querySelectorAll(
      '.page-body-container > .draggable-element, .page-body-container > .card-base, .page-body-container > section, .page-body-container > .split-layout'
    )).filter(c => !c.classList.contains('empty-page-placeholder'));
  },

  _showToast(msg) {
    window.SaveEngine?._showToast(msg);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1. AI SMART PAGE EQUALIZER
  // Real bin-packing using live getBoundingClientRect heights
  // ─────────────────────────────────────────────────────────────────────────
  autoEqualizePages() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    window.HistoryEngine?.pushState('AI Smart Page Equalizer');

    const allCards = this._getAllCards(canvas);
    if (allCards.length === 0) {
      this._showToast('⚡ No cards found to equalize!');
      return;
    }

    let pages = Array.from(canvas.querySelectorAll('.book-page'));
    if (pages.length === 0) return;

    const refCapacity = this._bodyCapacity(pages[0]);
    const TARGET_H = refCapacity * 0.90;

    // Bin-pack cards
    const bins = [[]];
    const binHeights = [0];
    let binIdx = 0;

    allCards.forEach(card => {
      const h = this._cardHeight(card) + 6;
      if (binHeights[binIdx] + h > TARGET_H && bins[binIdx].length > 0) {
        binIdx++;
        bins[binIdx] = [];
        binHeights[binIdx] = 0;
      }
      bins[binIdx].push(card);
      binHeights[binIdx] += h;
    });

    // Ensure enough pages exist
    while (pages.length < bins.length) {
      window.PageManager.addPage();
      pages = Array.from(canvas.querySelectorAll('.book-page'));
    }

    // Distribute cards into pages
    bins.forEach((cards, idx) => {
      const page = pages[idx];
      if (!page) return;
      const body = page.querySelector('.page-body-container');
      if (!body) return;
      body.innerHTML = '';
      cards.forEach(c => body.appendChild(c));
    });

    // Remove truly empty trailing pages
    const allPages = Array.from(canvas.querySelectorAll('.book-page'));
    for (let i = allPages.length - 1; i >= bins.length; i--) {
      const p = allPages[i];
      if (!p || i === 0) continue;
      const body = p.querySelector('.page-body-container');
      const hasCards = body && Array.from(body.children).some(c => !c.classList.contains('empty-page-placeholder'));
      if (!hasCards) p.remove();
    }

    window.PageManager?.syncPageNumbers();

    const pageCount = bins.length;
    const avgFill = Math.round(binHeights.reduce((a, b) => a + b, 0) / pageCount / refCapacity * 100);
    this._showToast(`⚡ Balanced ${allCards.length} cards across ${pageCount} pages (~${avgFill}% avg fill)`);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. AI AUTOFILL EMPTY PAGE
  // Precise fill measurement; pulls from neighbors only when they'll fit
  // ─────────────────────────────────────────────────────────────────────────
  autoFillEmptyPage() {
    const activePage = window.PageManager?.getActivePage() || document.querySelector('.book-page');
    if (!activePage) return;

    const body = activePage.querySelector('.page-body-container');
    if (!body) return;

    const capacity = this._bodyCapacity(activePage);
    const used = this._usedHeight(body);
    const fillPct = Math.round((used / capacity) * 100);

    if (fillPct >= 80) {
      this._showToast(`✨ Page is already ${fillPct}% full — no autofill needed`);
      return;
    }

    const available = capacity - used;
    let movedCount = 0;

    const nextPage = activePage.nextElementSibling?.closest?.('.book-page') || activePage.nextElementSibling;
    if (nextPage && nextPage.classList.contains('book-page')) {
      const nextBody = nextPage.querySelector('.page-body-container');
      const candidates = Array.from(nextBody?.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > section') || [])
        .filter(c => !c.classList.contains('empty-page-placeholder'));

      let spaceLeft = available;
      for (const card of candidates) {
        const h = this._cardHeight(card) + 6;
        if (spaceLeft - h < 30) break;
        body.appendChild(card);
        spaceLeft -= h;
        movedCount++;
      }
    }

    if (movedCount > 0) {
      window.LayoutEngine?.autoReflowPages();
      const newFill = Math.round((this._usedHeight(body) / capacity) * 100);
      this._showToast(`✨ Pulled ${movedCount} card${movedCount > 1 ? 's' : ''} from next page — page now ${newFill}% filled`);
      return;
    }

    // Fallback: insert contextually relevant card
    const existingTypes = Array.from(body.querySelectorAll('[class]')).map(el => el.className);
    let cardType = 'concept-card';
    let cardTitle = 'EXPLORATION ZONE';
    let cardIcon = '🚀';
    let cardContent = 'This page was auto-generated by AI. Edit or replace this card with your content!';

    if (existingTypes.some(c => c.includes('code-snippet') || c.includes('programming'))) {
      cardType = 'debug-corner'; cardTitle = 'DEBUG CORNER'; cardIcon = '🐛';
      cardContent = 'Common mistakes and debugging tips for this section.';
    } else if (existingTypes.some(c => c.includes('build-steps'))) {
      cardType = 'pro-tip'; cardTitle = 'PRO TIP'; cardIcon = '💡';
      cardContent = 'Always test each step before moving to the next one!';
    }

    const cardEl = window.LayoutEngine?.renderSection({ type: cardType, title: cardTitle, icon: cardIcon, content: cardContent });
    if (cardEl) {
      body.appendChild(cardEl);
      window.LayoutEngine?.autoReflowPages();
      this._showToast(`✨ Inserted contextual ${cardTitle} card`);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. AI PEDAGOGICAL FLOW RE-ORDER
  // Grouped theory→build→review; protects cover/header on page 1
  // ─────────────────────────────────────────────────────────────────────────
  autoReorderPedagogicalFlow() {
    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    window.HistoryEngine?.pushState('AI Pedagogical Flow Re-Order');

    const typePriority = {
      'mission-header': 1, 'cover-header-banner': 1, 'nova-card': 2,
      'mission-outcome': 3, 'mission-objectives': 4,
      'real-world': 10, 'curiosity-box': 11, 'stem-fact': 12,
      'concept-card': 20, 'component-spotlight': 21, 'observe-card': 22,
      'inside-sensor': 23, 'comparison-vs': 24, 'ui-blueprint': 25,
      'did-you-know': 26, 'heroes-grid': 27,
      'build-steps': 30, 'in-this-lab': 31, 'programming-studio': 32,
      'code-snippet': 33, 'blockly-blueprint': 34, 'oled-preview': 35,
      'designer-studio': 36, 'variables-at-work': 37,
      'think-engineer': 40, 'mini-challenge': 41, 'challenge-box': 42,
      'predict-think': 43, 'mission-challenge': 44,
      'testing-lab': 50, 'debug-corner': 51, 'common-mistakes': 52,
      'engineer-tip': 53, 'pro-tip': 54,
      'mission-review': 60, 'mission-review-table': 61, 'knowledge-check': 62,
      'vocabulary-builder': 63, 'reflection-card': 64, 'ultra-badge': 65,
      'beyond-mission': 66,
    };

    const getTypePriority = (el) => {
      const match = Array.from(el.classList).find(c => typePriority[c] !== undefined);
      return match ? typePriority[match] : 99;
    };

    const pages = Array.from(canvas.querySelectorAll('.book-page'));
    const page1Body = pages[0]?.querySelector('.page-body-container');
    const protectedEls = page1Body ? Array.from(page1Body.querySelectorAll(
      ':scope > .mission-header-banner, :scope > .cover-header-banner'
    )) : [];

    const allCards = this._getAllCards(canvas).filter(c =>
      !c.classList.contains('mission-header-banner') && !c.classList.contains('cover-header-banner')
    );

    allCards.sort((a, b) => getTypePriority(a) - getTypePriority(b));

    const targetBody = page1Body || pages[0]?.querySelector('.page-body-container');
    if (!targetBody) return;

    targetBody.innerHTML = '';
    protectedEls.forEach(el => targetBody.appendChild(el));
    allCards.forEach(c => targetBody.appendChild(c));

    setTimeout(() => {
      this.autoEqualizePages();
      this._showToast(`📐 Reordered ${allCards.length} cards: Theory → Build → Review`);
    }, 80);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. AI WHITESPACE AUTO-ALIGNER
  // Gap-size aware: stretch last card / insert exact spacer / pull from neighbor
  // Idempotent: removes previously inserted AI spacers first
  // ─────────────────────────────────────────────────────────────────────────
  autoAlignPageFooters() {
    const pages = document.querySelectorAll('.book-page');
    let spacersInserted = 0;
    let cardsStretched = 0;

    pages.forEach(page => {
      const body = page.querySelector('.page-body-container');
      if (!body) return;

      // Remove previously AI-inserted spacers (idempotent)
      body.querySelectorAll('[data-ai-spacer="true"]').forEach(s => s.remove());

      const capacity = this._bodyCapacity(page);
      const used = this._usedHeight(body);
      const gap = capacity - used;
      const fillPct = Math.round((used / capacity) * 100);

      if (fillPct >= 88) return;

      const cards = Array.from(body.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > section'))
        .filter(c => !c.classList.contains('empty-page-placeholder') && !c.dataset.aiSpacer);

      if (cards.length === 0) return;

      if (gap < 80) {
        // Small gap: stretch the last card
        const lastCard = cards[cards.length - 1];
        lastCard.style.minHeight = `${lastCard.offsetHeight + gap - 6}px`;
        cardsStretched++;

      } else if (gap <= 220) {
        // Medium gap: insert styled spacer
        const spacer = document.createElement('div');
        spacer.className = 'space-filler-card draggable-element';
        spacer.setAttribute('draggable', 'true');
        spacer.setAttribute('data-ai-spacer', 'true');
        const spacerH = Math.max(40, gap - 16);
        spacer.innerHTML = `<div style="height:${spacerH}px;border:2px dashed rgba(0,240,255,0.25);border-radius:10px;background:rgba(37,99,235,0.03);display:flex;align-items:center;justify-content:center;color:rgba(148,163,184,0.6);font-size:0.72rem;font-weight:600;letter-spacing:0.05em;gap:8px;">
          <span>✨</span><span>AI Whitespace Filler — ${Math.round(gap)}px</span>
        </div>`;
        spacer.addEventListener('click', () => spacer.remove());
        body.appendChild(spacer);
        spacersInserted++;

      } else {
        // Large gap: try pulling 1 card from next page
        const nextPage = page.nextElementSibling;
        if (nextPage && nextPage.classList.contains('book-page')) {
          const nextBody = nextPage.querySelector('.page-body-container');
          const nextCards = Array.from(nextBody?.querySelectorAll(':scope > .draggable-element, :scope > .card-base, :scope > section') || [])
            .filter(c => !c.classList.contains('empty-page-placeholder'));
          if (nextCards.length > 0 && this._cardHeight(nextCards[0]) <= gap - 30) {
            body.appendChild(nextCards[0]);
            cardsStretched++;
            return;
          }
        }
        // Fallback: large spacer
        const spacer = document.createElement('div');
        spacer.className = 'space-filler-card draggable-element';
        spacer.setAttribute('draggable', 'true');
        spacer.setAttribute('data-ai-spacer', 'true');
        const spacerH = Math.min(gap - 20, 220);
        spacer.innerHTML = `<div style="height:${spacerH}px;border:2px dashed rgba(0,240,255,0.2);border-radius:12px;background:linear-gradient(135deg,rgba(37,99,235,0.04),rgba(124,58,237,0.04));display:flex;align-items:center;justify-content:center;color:rgba(148,163,184,0.5);font-size:0.75rem;">✨ AI Page Spacer (${Math.round(gap)}px gap)</div>`;
        spacer.addEventListener('click', () => spacer.remove());
        body.appendChild(spacer);
        spacersInserted++;
      }
    });

    window.LayoutEngine?.checkOverflows?.();
    const total = spacersInserted + cardsStretched;
    this._showToast(`🪄 Aligned ${total} page${total !== 1 ? 's' : ''} — ${spacersInserted} spacer${spacersInserted !== 1 ? 's' : ''} inserted, ${cardsStretched} stretched/pulled`);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. AI VISUAL HIERARCHY ENHANCER
  // Role-based color system — different card types get semantically appropriate colors
  // ─────────────────────────────────────────────────────────────────────────
  autoEnhanceVisualHierarchy() {
    window.HistoryEngine?.pushState('AI Visual Hierarchy Enhancer');

    const roleMap = [
      { classes: ['concept-card', 'component-spotlight', 'inside-sensor', 'observe-card', 'ui-blueprint'], themeClass: 'theme-card-blue' },
      { classes: ['build-steps', 'programming-studio', 'code-snippet', 'blockly-blueprint', 'in-this-lab', 'oled-preview'], themeClass: 'theme-card-green' },
      { classes: ['debug-corner', 'common-mistakes', 'testing-lab'], themeClass: 'theme-card-red' },
      { classes: ['knowledge-check', 'mission-review', 'mission-review-table', 'reflection-card', 'vocabulary-builder'], themeClass: 'theme-card-purple' },
      { classes: ['pro-tip', 'curiosity-box', 'stem-fact', 'did-you-know', 'engineer-tip', 'predict-think'], themeClass: 'theme-card-blue' },
      { classes: ['real-world', 'mission-challenge', 'mini-challenge', 'challenge-box', 'beyond-mission'], themeClass: 'theme-card-orange' },
      { classes: ['ultra-badge', 'mission-objectives', 'mission-outcome'], themeClass: 'theme-card-orange' },
    ];

    const allThemeClasses = ['theme-card-blue', 'theme-card-green', 'theme-card-red', 'theme-card-purple', 'theme-card-orange', 'theme-card-slate'];
    let enhanced = 0;

    document.querySelectorAll('.card-base, .concept-card, .code-snippet-card, .draggable-element').forEach(card => {
      if (card.classList.contains('mission-header-banner') || card.classList.contains('cover-header-banner')) return;
      const cardClasses = Array.from(card.classList);
      const assigned = roleMap.find(r => r.classes.some(rc => cardClasses.includes(rc)));
      if (!assigned) return;
      allThemeClasses.forEach(tc => card.classList.remove(tc));
      card.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      card.classList.add(assigned.themeClass);
      enhanced++;
    });

    this._showToast(`🎨 Enhanced ${enhanced} cards with role-based visual hierarchy`);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. AI DOMAIN THEME GENERATOR
  // Scans actual canvas text → keyword-matches → applies correct domain theme
  // ─────────────────────────────────────────────────────────────────────────
  autoApplyDomainTheme() {
    window.HistoryEngine?.pushState('AI Domain Theme Generator');

    const canvas = document.getElementById('a4-canvas-container');
    if (!canvas) return;

    const rawText = (canvas.innerText || canvas.textContent || '').toLowerCase();

    const domains = [
      { name: 'Electronics & IoT', theme: 'theme-blue', keywords: ['arduino', 'sensor', 'circuit', 'led', 'wire', 'resistor', 'voltage', 'iot', 'microcontroller', 'breadboard', 'servo', 'motor', 'bluetooth', 'electronics'] },
      { name: 'Biology & Nature', theme: 'theme-green', keywords: ['biology', 'plant', 'cell', 'organism', 'ecosystem', 'photosynthesis', 'dna', 'protein', 'gene', 'bacteria', 'virus', 'animal', 'habitat', 'ecology'] },
      { name: 'Math & Physics', theme: 'theme-purple', keywords: ['math', 'physics', 'equation', 'algebra', 'geometry', 'calculus', 'force', 'velocity', 'acceleration', 'gravity', 'frequency', 'wavelength', 'theorem'] },
      { name: 'Chemistry & Energy', theme: 'theme-orange', keywords: ['chemistry', 'chemical', 'reaction', 'molecule', 'atom', 'element', 'compound', 'acid', 'base', 'hydrogen', 'oxygen', 'carbon', 'fuel', 'combustion'] },
      { name: 'Coding & Programming', theme: 'theme-blue', keywords: ['python', 'javascript', 'code', 'programming', 'variable', 'loop', 'function', 'algorithm', 'class', 'object', 'debug', 'syntax', 'compiler', 'software'] },
      { name: 'Space & Astronomy', theme: 'theme-purple', keywords: ['space', 'planet', 'star', 'galaxy', 'universe', 'solar system', 'asteroid', 'rocket', 'orbit', 'telescope', 'mars', 'moon', 'satellite', 'astronaut'] },
    ];

    const scores = domains.map(d => ({ ...d, score: d.keywords.filter(kw => rawText.includes(kw)).length }));
    scores.sort((a, b) => b.score - a.score);
    const winner = scores[0];

    if (winner.score === 0) {
      this._showToast('🎨 No domain keywords detected — add content first!');
      return;
    }

    const themeClasses = ['theme-blue', 'theme-green', 'theme-orange', 'theme-purple'];
    themeClasses.forEach(t => document.body.classList.remove(t));
    document.body.classList.add(winner.theme);

    if (window.currentMission) window.currentMission.theme = winner.theme;
    const themePicker = document.getElementById('theme-picker');
    if (themePicker) themePicker.value = winner.theme;

    this._showToast(`🎨 Detected: ${winner.name} (${winner.score} matches) → Applied ${winner.theme.replace('theme-', '')} theme`);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. AI COMMON MISTAKES & DEBUG GENERATOR
  // Reads code cards on canvas → builds rich structured debug card
  // ─────────────────────────────────────────────────────────────────────────
  autoGenerateDebugContent() {
    window.HistoryEngine?.pushState('AI Debug Generator');

    const activePage = window.PageManager?.getActivePage() || document.querySelector('.book-page');
    if (!activePage) return;

    const codeCards = document.querySelectorAll('.code-snippet-card, .programming-studio, [class*="code-snippet"], [class*="programming-studio"]');
    const conceptCards = document.querySelectorAll('.concept-card, .component-spotlight');

    const firstCodeTitle = codeCards[0]?.querySelector('.capsule-header, .card-title, .code-header, h2, h3')?.textContent?.trim();
    const firstConceptTitle = conceptCards[0]?.querySelector('.capsule-header, .card-title, h2, h3')?.textContent?.trim();
    const topic = firstCodeTitle || firstConceptTitle || 'STEM Concepts';

    const allText = (Array.from(codeCards).map(c => c.innerText || '').join(' ') + ' ' + Array.from(conceptCards).map(c => c.innerText || '').join(' ')).toLowerCase();

    let contextMistakes;
    if (allText.includes('loop') || allText.includes('for') || allText.includes('while')) {
      contextMistakes = [
        { wrong: 'Using `while True` without a break condition', correct: 'Always include a `break` or exit condition to prevent infinite loops' },
        { wrong: 'Off-by-one errors (starting loop at 1 instead of 0)', correct: 'Remember: most loops start at index 0, e.g. `for i in range(0, 10)`' },
        { wrong: 'Modifying a list while iterating over it', correct: 'Create a copy of the list first, then iterate over the copy' },
      ];
    } else if (allText.includes('arduino') || allText.includes('sensor') || allText.includes('pin')) {
      contextMistakes = [
        { wrong: 'Connecting sensor directly to 5V without a resistor', correct: 'Always use the correct resistor value to protect your sensor and Arduino' },
        { wrong: 'Forgetting `pinMode()` setup for digital pins', correct: 'Always declare `pinMode(pin, INPUT/OUTPUT)` in `setup()`' },
        { wrong: 'Reading analog values without calibration', correct: 'Use `map()` to convert raw analog values (0-1023) to meaningful ranges' },
      ];
    } else if (allText.includes('variable') || allText.includes('function') || allText.includes('class')) {
      contextMistakes = [
        { wrong: 'Using a variable before declaring it', correct: 'Always declare variables at the top of their scope before using them' },
        { wrong: 'Confusing `=` (assignment) with `==` (comparison)', correct: 'Use `=` to assign values, `==` to compare values in conditions' },
        { wrong: 'Not returning a value from a function that should return one', correct: 'Use `return value` at the end of functions that compute a result' },
      ];
    } else {
      contextMistakes = [
        { wrong: 'Skipping the planning/design step and jumping straight to building', correct: 'Always sketch your design and plan your steps before starting to build' },
        { wrong: 'Not testing each component individually before assembly', correct: 'Test each part separately to isolate problems early' },
        { wrong: 'Ignoring error messages and continuing anyway', correct: 'Read every error message carefully — it tells you exactly what went wrong and where' },
      ];
    }

    const mistakeRows = contextMistakes.map(m => `
      <div style="background:rgba(220,38,38,0.04);border:1.5px solid rgba(220,38,38,0.2);border-radius:8px;padding:10px 12px;margin-bottom:8px;">
        <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
          <span style="font-size:1rem;flex-shrink:0;">❌</span>
          <div style="font-size:0.75rem;color:#B91C1C;font-weight:600;line-height:1.4;">${m.wrong}</div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <span style="font-size:1rem;flex-shrink:0;">✅</span>
          <div style="font-size:0.75rem;color:#15803D;font-weight:600;line-height:1.4;">${m.correct}</div>
        </div>
      </div>
    `).join('');

    const debugCard = document.createElement('section');
    debugCard.className = 'card-base debug-corner draggable-element theme-card-red';
    debugCard.setAttribute('draggable', 'true');
    debugCard.innerHTML = `
      <div class="capsule-header" style="background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff;padding:6px 12px;border-radius:8px 8px 0 0;font-weight:800;font-size:0.8rem;display:flex;align-items:center;gap:6px;">
        <span>🐛</span> AI DEBUG CORNER — ${topic.toUpperCase().slice(0, 40)}
      </div>
      <div class="card-body-text" style="padding:10px 12px;">
        ${mistakeRows}
        <div style="margin-top:10px;background:rgba(245,158,11,0.08);border:1.5px solid rgba(245,158,11,0.3);border-radius:8px;padding:8px 12px;display:flex;gap:8px;align-items:flex-start;">
          <span style="font-size:1rem;">💡</span>
          <div style="font-size:0.73rem;color:#92400E;font-weight:600;">
            <strong style="color:#B45309;">PRO TIP:</strong> When stuck, explain your code out loud step-by-step. This "rubber duck debugging" technique often reveals the bug instantly!
          </div>
        </div>
      </div>
    `;

    window.LayoutEngine?._attachCardControls?.(debugCard);

    const body = activePage.querySelector('.page-body-container');
    if (body) {
      const lastCodeCard = Array.from(body.querySelectorAll('.code-snippet-card, .programming-studio')).pop();
      if (lastCodeCard && lastCodeCard.nextSibling) {
        body.insertBefore(debugCard, lastCodeCard.nextSibling);
      } else {
        body.appendChild(debugCard);
      }
    }

    window.LayoutEngine?.autoReflowPages?.();
    this._showToast(`🐛 Generated Debug Corner for: "${topic.slice(0, 30)}"`);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. LAYER ADJUSTMENT
  // Bring to Front / Send to Back / Bring Forward / Send Backward
  // ─────────────────────────────────────────────────────────────────────────
  adjustLayer(direction) {
    const selected = window.CanvasEditor?.selectedElement;
    if (!selected) {
      this._showToast('🔲 Select a card first to adjust its layer');
      return;
    }

    const parent = selected.parentElement;
    if (!parent) return;

    const siblings = Array.from(parent.children).filter(c => c !== selected);
    const currentZ = parseInt(selected.style.zIndex) || 10;
    const maxZ = siblings.reduce((max, s) => Math.max(max, parseInt(s.style.zIndex) || 10), 10);

    switch (direction) {
      case 'front':
        selected.style.zIndex = String(maxZ + 1);
        parent.appendChild(selected);
        this._showToast('⬆ Brought to Front');
        break;
      case 'back':
        selected.style.zIndex = '1';
        parent.insertBefore(selected, parent.firstChild);
        this._showToast('⬇ Sent to Back');
        break;
      case 'forward':
        selected.style.zIndex = String(currentZ + 1);
        if (selected.nextElementSibling) parent.insertBefore(selected.nextElementSibling, selected);
        this._showToast('↑ Brought Forward');
        break;
      case 'backward':
        selected.style.zIndex = String(Math.max(1, currentZ - 1));
        if (selected.previousElementSibling) parent.insertBefore(selected, selected.previousElementSibling);
        this._showToast('↓ Sent Backward');
        break;
    }

    window.HistoryEngine?.pushState(`Layer: ${direction}`);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEGACY: AI PAGE INSPECTOR (kept for panel compatibility)
  // ─────────────────────────────────────────────────────────────────────────
  runPageInspector() {
    const inspector = document.getElementById('element-inspector');
    if (!inspector) return;

    const activePage = window.PageManager?.getActivePage() || document.querySelector('.book-page');
    if (!activePage) return;

    const pageNum = activePage.dataset.pageNum || '1';
    const body = activePage.querySelector('.page-body-container');
    const cards = Array.from(activePage.querySelectorAll('.draggable-element, .card-base, .concept-card'));
    const capacity = this._bodyCapacity(activePage);
    const used = body ? this._usedHeight(body) : 0;
    const fillPercent = capacity > 0 ? Math.min(Math.round((used / capacity) * 100), 200) : 0;

    const suggestions = [];
    if (cards.length === 0) suggestions.push({ title: '✨ Autofill Empty Page', desc: 'Page is empty — slide up cards or insert content.', action: () => this.autoFillEmptyPage() });
    if (fillPercent < 60 && cards.length > 0) suggestions.push({ title: '🪄 Align Whitespace', desc: `Page is only ${fillPercent}% full. Stretch or fill the gap.`, action: () => this.autoAlignPageFooters() });
    if (cards.length > 5) suggestions.push({ title: '⚡ Equalize Pages', desc: `${cards.length} cards on one page — redistribute evenly.`, action: () => this.autoEqualizePages() });
    suggestions.push({ title: '🎨 Enhance Hierarchy', desc: 'Apply role-based colors to card types.', action: () => this.autoEnhanceVisualHierarchy() });
    suggestions.push({ title: '📐 Pedagogical Flow', desc: 'Sort cards into theory → build → review order.', action: () => this.autoReorderPedagogicalFlow() });

    const suggestionsHtml = suggestions.map((s, i) => `
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(0,240,255,0.2);border-radius:6px;padding:8px;margin-bottom:6px;">
        <div style="font-weight:bold;font-size:0.78rem;color:var(--accent-cyan);margin-bottom:2px;">${s.title}</div>
        <div style="font-size:0.72rem;color:#94A3B8;margin-bottom:6px;">${s.desc}</div>
        <button class="ctx-btn-sm" style="background:#2563EB;width:100%;" onclick="window.AILayoutTools._execSuggestion(${i})">⚡ Apply</button>
      </div>
    `).join('');

    this._inspectorSuggestions = suggestions;

    const fillColor = fillPercent > 90 ? '#EF4444' : fillPercent > 70 ? '#F59E0B' : '#10B981';
    inspector.innerHTML = `
      <div class="inspector-section">
        <div class="ctx-label">🔍 AI Page Inspector (Page ${pageNum})</div>
        <div style="font-size:0.75rem;color:#94A3B8;margin-bottom:8px;">
          Fill Level: <strong style="color:${fillColor};">${fillPercent}%</strong> (${cards.length} cards, ${Math.round(used)}/${Math.round(capacity)}px)
        </div>
        <div class="ctx-label" style="margin-top:6px;font-size:0.7rem;">Suggestions (Click to Apply):</div>
        ${suggestionsHtml}
      </div>
    `;
  },

  _execSuggestion(idx) {
    if (this._inspectorSuggestions && this._inspectorSuggestions[idx]) {
      this._inspectorSuggestions[idx].action();
      setTimeout(() => this.runPageInspector(), 500);
    }
  },
};
