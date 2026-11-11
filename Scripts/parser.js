/**
 * UltraMinds Smart Heuristic Parser V4 — Zero-Omission Content-Driven Engine
 *
 * CORE PRINCIPLES:
 * 1. ZERO OMISSION — every word of input is preserved and rendered
 * 2. ZERO GENERATION — never adds words or rewrites content
 * 3. Content-driven — number of pages and card types come from data, not templates
 * 4. DynamicCardFactory is used for all unknown/unmapped content blocks
 * 5. Smart A4 bin-packing — pages fill properly with no large gaps
 */

window.HeuristicParser = {

  // ─── A4 height budget (px) for content area ─────────────
  A4_CONTENT_HEIGHT: 1040,   // px (approximate usable per page)
  CARD_MIN_HEIGHT:    80,   // px minimum per card
  CARD_HEIGHTS: {           // estimated px heights per card type
    'page-banner':            55,
    'split-layout':           200,
    'mission-story':          110,
    'real-world':             120,
    'curiosity-box':          100,
    'did-you-know':            90,
    'stem-fact':               90,
    'mission-objectives':     140,
    'think-engineer':         130,
    'observe-card':           120,
    'component-spotlight':    140,
    'inside-sensor':          140,
    'comparison-vs':          130,
    'heroes-grid':            140,
    'build-steps':            150,
    'in-this-lab':             90,
    'pro-tip':                 80,
    'common-mistakes':        120,
    'flowchart-sequence':     160,
    'code-snippet':           130,
    'variables-at-work':      120,
    'predict-think':          110,
    'challenge-box':           90,
    'mission-progress':        50,
    'mini-upgrade':           130,
    'real-challenge':         140,
    'engineers-everywhere':   140,
    'mission-review-table':   130,
    'ultra-badge':            120,
    'beyond-mission':         110,
    'image-holder':           140,
    'dynamic-text':            90,
    'dynamic-bullets':        100,
    'dynamic-subheader':       40,
    'dynamic-table':          120,
    'dynamic-mixed':          100,
    'dynamic-capsule':         80,
    'dynamic-comparison':     120,
    'dynamic-image':          140,
    'knowledge-check':        110,
    'vocabulary-builder':     110,
    'default':                 90,
  },

  parse(rawInput, pageLimit = 'auto') {
    if (!rawInput || typeof rawInput !== 'string' || rawInput.trim().length < 20) {
      return window.SAMPLE_MISSIONS?.mission14 || this.getDefaultMission();
    }

    // ── If already valid JSON mission, use it directly ──
    if (rawInput.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawInput.trim());
        if (parsed && parsed.pages) return parsed;
      } catch(e) {}
    }

    const missionNumMatch = rawInput.match(/Mission\s*#?\s*(\d+)/i) || rawInput.match(/Level\s*[:\s#]*(\d+)/i);
    const missionNum = missionNumMatch ? missionNumMatch[1] : '';

    const levelMatch = rawInput.match(/^(?:LEVEL\s*\d*[:\s]*[^\n\r]+)/im);
    const levelText = levelMatch ? levelMatch[0].trim() : '';

    const titleMatch = rawInput.match(/^(?:Sample\s+)?MISSION:\s*([^\n\r]+)/im)
                    || rawInput.match(/^#\s*([^\n\r]+)/m)
                    || rawInput.match(/^(?:Sample\s+)?Mission\s*\d*\s*[-:]\s*([^\n<]+)/im)
                    || rawInput.match(/^([A-Z0-9\s:🚂⚡🤖🚀💡—–-]{5,80})/m);
    const title = titleMatch ? titleMatch[1].trim() : 'MISSION PROJECT';

    const subtitleMatch = rawInput.match(/^(?:Grade\s*\/\s*Class):\s*([^\n\r]+)/im)
                       || rawInput.match(/^(?:Grade\s*\/\s*Class|Level):\s*([^\n\r]+)/im)
                       || rawInput.match(/^Level:\s*([^\n\r]+)/im)
                       || rawInput.match(/(?:Build|Create|Design|Learn|Monitor)[^\n.]+/i);
    const subtitle = subtitleMatch ? (subtitleMatch[1] || subtitleMatch[0]).trim() : '';

    const guideMatch = rawInput.match(/^(?:Mission\s+)?Guide:\s*([^\n\r]+)/im)
                    || rawInput.match(/(?:Commander\s+[A-Za-z0-9]+|Nova\s+[A-Za-z0-9\s🤖]+)/i);
    const guideName = guideMatch ? (guideMatch[1] || guideMatch[0]).trim() : '';

    const squadMatch = rawInput.match(/^Squad:\s*([^\n\r]+)/im)
                    || rawInput.match(/^Team:\s*([^\n\r]+)/im);
    const guideRole = squadMatch ? squadMatch[1].trim() : (guideName ? 'Mission Guide' : '');
    const theme = this.detectTheme(rawInput);

    // Run Canonical Compiler
    let canonicalResult = null;
    let composedCards = null;
    if (window.CanonicalCompiler) {
      canonicalResult = window.CanonicalCompiler.compile(rawInput, missionNum ? ('M' + missionNum) : 'M01');
      window.lastCanonicalResult = canonicalResult;
      if (window.DynamicCardComposer) {
        if (typeof window.DynamicCardComposer.composePhasePages === 'function') {
          phasePages = window.DynamicCardComposer.composePhasePages(canonicalResult, missionNum, title);
        }
        if (!phasePages) {
          composedCards = window.DynamicCardComposer.composeCards(canonicalResult);
        }
      }
    }

    // Check if input contains explicit PAGE or PHASE markers near the start
    const pageMarkerRegex = /(?:^|\n)(?:[^\n\w\d]*\s*(?:PAGE|PHASE)\s*\d+[\s\─\—\–\:]*([^\n]+)?)/gi;
    const pageMatches = [...rawInput.matchAll(pageMarkerRegex)];

    let pages = [];

    if (phasePages && phasePages.length > 0) {
      pages = phasePages;
    } else if (composedCards && composedCards.length > 0) {
      // Use dynamic cards generated by DynamicCardComposer with Phase-aware packing
      pages = this.packIntoPages(composedCards, missionNum, title);
    } else if (pageMatches.length >= 2 && pageMatches[0].index < 2000) {
      for (let i = 0; i < pageMatches.length; i++) {
        const match = pageMatches[i];
        const pageTitle = (match[1] || '').trim();
        const startIdx = match.index + match[0].length;
        const endIdx = (i < pageMatches.length - 1) ? pageMatches[i + 1].index : rawInput.length;
        const pageRawChunk = rawInput.substring(startIdx, endIdx);

        const pageBlocks = this.tokenizeAllBlocks(pageRawChunk);
        const pageCards = this.blocksToCards(pageBlocks);

        if (pageTitle && pageTitle.length > 0) {
          pageCards.unshift({
            type: 'page-banner',
            pageType: this.getBannerTypeForTitle(pageTitle),
            title: pageTitle.toUpperCase(),
            subtitle: '',
            icon: '🟦'
          });
        }

        pages.push(this.buildPage(i + 1, pageCards, missionNum));
      }
    } else {
      const blocks = this.tokenizeAllBlocks(rawInput);
      const allCards = this.blocksToCards(blocks);
      pages = this.packIntoPages(allCards, missionNum, title);
    }

    return {
      id: 'mission-' + Date.now(),
      missionNumber: missionNum,
      levelText: levelText,
      title: missionNum ? `Mission ${missionNum}: ${title}` : title,
      missionTitle: title.replace(/^MISSION\s*\d*[-:]\s*/i, '').trim(),
      missionSubtitle: subtitle,
      guideName,
      guideRole,
      theme,
      canonicalResult,
      pages
    };
  },

  getBannerTypeForTitle(title) {
    const t = title.toUpperCase();
    if (t.includes('BLUEPRINT')) return 'product-blueprint';
    if (t.includes('COMMANDER') || t.includes('CRISIS') || t.includes('BOTANIST') || t.includes('VACATION')) return 'commander-mission';
    if (t.includes('EXPLORER') || t.includes('TOOLKIT') || t.includes('PUZZLE')) return 'engineering-explorer';
    if (t.includes('HARDWARE') || t.includes('ASSEMBLY') || t.includes('BUILDER') || t.includes('MECHANICAL') || t.includes('PLUMBING')) return 'hardware-studio';
    if (t.includes('ULTRACORE') || t.includes('LOGIC') || t.includes('CODE STUDIO')) return 'ultracore-studio';
    if (t.includes('MIT') || t.includes('APP')) return 'mit-app-studio';
    if (t.includes('TESTING') || t.includes('TEST RUN') || t.includes('CLEARANCE')) return 'testing-lab';
    if (t.includes('DEBUG')) return 'debug-lab';
    if (t.includes('WORLD') || t.includes('REAL')) return 'engineering-world';
    if (t.includes('UPGRADE')) return 'product-upgrade';
    if (t.includes('SHOWCASE') || t.includes('ASSESSMENT')) return 'product-showcase';
    if (t.includes('NEXT')) return 'next-mission';
    return 'generic';
  },

  // ─── PHASE 1: METADATA EXTRACTION ────────────────────────
  extractMeta(text, regex, fallback) {
    const m = text.match(regex);
    return m ? (m[1] || m[0]).trim() : fallback;
  },

  detectTheme(text) {
    const lower = text.toLowerCase();
    if (/plant|farm|soil|water|green|irrigation/.test(lower)) return 'theme-green';
    if (/robot|servo|motor|arm/.test(lower))                   return 'theme-orange';
    if (/ai|machine learning|neural/.test(lower))              return 'theme-purple';
    return 'theme-blue';
  },

  preprocessRawText(rawText) {
    if (!rawText) return '';
    // Zero-mutation normalization: standardize line endings only
    return rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  },

  // ─── PHASE 2: ZERO-OMISSION TOKENIZER ────────────────────
  /**
   * Splits raw text into semantic blocks. Every character of the input
   * ends up in exactly one block. NOTHING is discarded.
   */
  tokenizeAllBlocks(rawInput) {
    const blocks = [];

    // Preprocess raw input to normalize emojis, line breaks, and formatting
    const text = this.preprocessRawText(rawInput);
    const lines = text.split('\n');

    let currentBlock = null;
    let lineIdx = 0;

    const flushBlock = () => {
      if (currentBlock) {
        const bodyText = currentBlock.lines.join('\n').trim();
        const fullText = bodyText ? (currentBlock.heading ? currentBlock.heading + '\n' + bodyText : bodyText) : currentBlock.heading;
        if (fullText && fullText.trim().length > 0) {
          blocks.push({
            heading: currentBlock.heading || 'SECTION',
            text: fullText.trim(),
            rawLines: currentBlock.lines.length > 0 ? currentBlock.lines : [currentBlock.heading],
          });
        }
      }
      currentBlock = null;
    };

    while (lineIdx < lines.length) {
      const line = lines[lineIdx];
      const trimmed = line.trim();

      // Skip blank lines or separator rules at block start
      if (!currentBlock && (trimmed.length === 0 || /^[_─—–=]{3,}$/.test(trimmed))) {
        lineIdx++;
        continue;
      }
      if (/^[_─—–=]{3,}$/.test(trimmed)) {
        lineIdx++;
        continue;
      }

      // ── Never treat flow arrows or single flow words as headings ──
      const isFlowArrow = /^[\u2193\u2191\u2192\u2190\u25BC\u25B2\u25BA\u25C4\-\>\|]+$/.test(trimmed);
      const isBulletOrCheck = /^[•\-\*✔✅☑☐□⭐\d+\.]/.test(trimmed);

      // ── Universal Emoji Heading Detection (ES2018+ Unicode Property) ──
      const isEmojiHeading = /^\p{Extended_Pictographic}\s*[A-Za-z0-9]/u.test(trimmed);

      // ── Heading Detection ────────────────────────────────────
      const isMarkdownH1 = /^#\s+/.test(trimmed);
      const isMarkdownH2 = /^##\s+/.test(trimmed);
      const isMarkdownH3 = /^###\s+/.test(trimmed);
      const isSectionPrefix = /^🟦\s*PAGE\s*\d+/i.test(trimmed)
                           || isEmojiHeading
                           || /^(PRODUCT BLUEPRINT|PRODUCT PREVIEW|CUSTOMER|PROBLEM|FINAL PRODUCT|ENGINEERING CAPABILITIES|ULTRABOARD PORTS USED|MIT FEATURES|IoT FEATURES|COMMANDER NOVA'S MISSION|REAL WORLD CONNECTION|CURIOSITY BOX|ENGINEERING EXPLORER|ENGINEERING FLOW|AUTOMATION LOGIC|THINK LIKE AN ENGINEER|ENGINEERING CONCEPT|HARDWARE STUDIO|HARDWARE ASSEMBLY|HARDWARE CHECKLIST|HARDWARE VERIFICATION|ENGINEERING TIP|ULTRACORE STUDIO|PROGRAM LOGIC|STUDENT ACTIVITY|ENGINEERING HABIT|MIT APP STUDIO|DESIGNER STUDIO|PROPERTIES|BLOCKS STUDIO|MANUAL PUMP SWITCH|EMERGENCY STOP|CHALLENGE|TESTING LAB|TEST 01|TEST 02|TEST 03|TEST 04|TEST 05|DEBUG LAB|PROBLEM|ENGINEERING WORLD|WHERE IS THIS TECHNOLOGY USED|BEHIND THE SCENES|DID YOU KNOW|PRODUCT UPGRADE|MINI DESIGN CHALLENGE|PRODUCT SHOWCASE|ENGINEERING SKILLS EARNED|BADGE EARNED|NEXT MISSION)/i.test(trimmed);

      const isNumberedStepHeader = /^Step\s+\d+/i.test(trimmed) || /^Test\s+\d+/i.test(trimmed);
      const isHtmlHeading = /<h[1-3]/i.test(trimmed);

      const isHeading = (isMarkdownH1 || isMarkdownH2 || isMarkdownH3 || isSectionPrefix || isNumberedStepHeader || isHtmlHeading)
                        && !isFlowArrow && !isBulletOrCheck;

      // ── Code Block Detection ─────────────────────────────────
      if (trimmed.startsWith('```')) {
        flushBlock();
        const codeLines = [line];
        lineIdx++;
        while (lineIdx < lines.length && !lines[lineIdx].trim().startsWith('```')) {
          codeLines.push(lines[lineIdx]);
          lineIdx++;
        }
        if (lineIdx < lines.length) codeLines.push(lines[lineIdx]); // closing ```
        blocks.push({
          heading: 'CODE',
          text: codeLines.join('\n'),
          rawLines: codeLines,
          isCode: true,
        });
        lineIdx++;
        continue;
      }

      // ── HTML/XHTML tag lines pass straight through ────────────
      if (/^<[a-z]/i.test(trimmed) && !isHtmlHeading) {
        if (!currentBlock) currentBlock = { heading: '', lines: [] };
        currentBlock.lines.push(line);
        lineIdx++;
        continue;
      }

      if (isHeading) {
        // Flush existing block before starting a new one
        flushBlock();
        const headingText = trimmed
          .replace(/^#+\s*/, '')
          .replace(/<[^>]+>/g, '')
          .replace(/:\s*$/, '')
          .trim();

        currentBlock = { heading: headingText, lines: [] };
        lineIdx++;
        continue;
      }

      // ── Regular content line ─────────────────────────────────
      if (!currentBlock) {
        currentBlock = { heading: '', lines: [] };
      }
      currentBlock.lines.push(line);
      lineIdx++;
    }

    flushBlock(); // Final flush

    return blocks.filter(b => {
      const h = (b.heading || '').trim().toUpperCase();
      const t = (b.text || '').trim().toUpperCase();
      if (h === 'STACKED-CARDS' || h === 'STACKED CARDS' || h === 'STACKED-CARD') {
        if (!t || t === 'STACKED-CARDS' || t === 'STACKED CARDS' || t === 'STACKED-CARD') return false;
      }
      return b.text.trim().length > 0;
    });
  },

  // ─── PHASE 3: BLOCKS → SECTION CARDS ────────────────────
  blocksToCards(blocks) {
    const cards = [];

    for (const block of blocks) {
      // ── Zero Omission: ALL text blocks pass through ──────────

      // ── Auto-Parse JSON String Blocks ──────────────────────
      const trimmedText = block.text.trim();
      if ((trimmedText.startsWith('{') && trimmedText.endsWith('}')) || (trimmedText.startsWith('[') && trimmedText.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmedText);
          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed)) {
              parsed.forEach(item => { if (item && item.type) cards.push(item); });
              continue;
            } else if (parsed.type) {
              cards.push(parsed);
              continue;
            }
          }
        } catch (e) {
          // Not valid JSON, proceed as standard block
        }
      }

      // Use DynamicCardFactory to detect & build the right card type
      const factory = window.DynamicCardFactory;
      if (!factory) {
        cards.push({ type: 'dynamic-text', title: block.heading || '', icon: '📄', content: block.text });
        continue;
      }

      // Build section data — preserves ALL text, zero generation
      const secData = factory.build({
        heading: block.heading,
        text: block.text,
      });

      cards.push(secData);
    }

    return cards;
  },

  // ─── PHASE 4: BIN-PACKING INTO A4 PAGES ──────────────────
  /**
   * Groups cards into pages ensuring no page overflows.
   * If a page still has budget, next cards stack below (requirement #6).
   */
  packIntoPages(cards, missionNum, title) {
    if (!cards.length) return [this.makeEmptyPage(1, missionNum)];

    const pages = [];
    let pageNum = 1;
    let currentPageSections = [];
    let currentHeight = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardH = this.estimateCardHeight(card);
      const pageBudget = (pageNum === 1) ? (this.A4_CONTENT_HEIGHT - 180) : this.A4_CONTENT_HEIGHT;

      // Check if this card represents a new Phase or Page boundary
      const isPhaseBoundary = card.isPhaseHeader || (
        /(?:PAGE|PHASE)\s*\d+/i.test(card.title || '') && !((card.title || '').includes('(Cont.)'))
      );

      if (isPhaseBoundary && currentPageSections.length > 0) {
        // If current page only has metadata subheaders, keep them on Page 1 with Phase 1!
        const isPhase1 = /(?:PAGE|PHASE)\s*1\b/i.test(card.title || '');
        const onlyMeta = currentPageSections.every(s => s.type === 'dynamic-subheader' || /LEVEL/i.test(s.title || ''));
        if (!onlyMeta && !(pageNum === 1 && isPhase1)) {
          pages.push(this.buildPage(pageNum, currentPageSections, missionNum));
          pageNum++;
          currentPageSections = [];
          currentHeight = 0;
        }
      }

      // Check if we should try to merge the next card into a split-layout
      const nextCard = cards[i + 1];
      const canMerge = nextCard
        && !this.isFullWidthCard(card)
        && !this.isFullWidthCard(nextCard)
        && cardH < 180 && this.estimateCardHeight(nextCard) < 180
        && (currentHeight + cardH * 0.6 + this.estimateCardHeight(nextCard) * 0.6) <= pageBudget;

      if (canMerge) {
        const splitH = Math.max(cardH, this.estimateCardHeight(nextCard));
        if (currentHeight + splitH <= pageBudget) {
          currentPageSections.push({ type: 'split-layout', left: card, right: nextCard });
          currentHeight += splitH;
          i++; // skip next card as it's consumed
          continue;
        }
      }

      // Check if card fits on current page
      if (currentHeight + cardH > pageBudget && currentPageSections.length > 0) {
        // Push current page and start a new one
        pages.push(this.buildPage(pageNum, currentPageSections, missionNum));
        pageNum++;
        currentPageSections = [];
        currentHeight = 0;
      }

      currentPageSections.push(card);
      currentHeight += cardH;
    }

    // Final page
    if (currentPageSections.length > 0) {
      pages.push(this.buildPage(pageNum, currentPageSections, missionNum));
    }

    return pages.length > 0 ? pages : [this.makeEmptyPage(1, missionNum)];
  },

  isFullWidthCard(card) {
    if (!card) return true;
    if (card.type === 'dynamic-composed-card') {
      if (card.items && card.items.some(it => {
        const t = it.nodeType || it.type;
        return t === 'CodeBlock' || t === 'CODE_BLOCK' || t === 'Table' || t === 'TABLE_BLOCK' || t === 'Comparison';
      })) {
        return true;
      }
      return false; // Can be paired into split-layout if compact!
    }
    return ['page-banner', 'build-steps', 'mission-objectives', 'engineers-everywhere',
            'beyond-mission', 'mission-progress', 'code-snippet', 'dynamic-table',
            'dynamic-subheader', 'flowchart-sequence',
            'dynamic-procedure', 'worksheet-card', 'safety-card'].includes(card.type);
  },

  estimateCardHeight(card) {
    if (!card) return this.CARD_HEIGHTS['default'];
    if (card.type === 'dynamic-subheader') return 38;
    if (card.type === 'page-banner') return 55;
    if (card.type === 'dynamic-composed-card' || card.type === 'dynamic-content-card') {
      if (window.DynamicCardComposer?.estimateCardHeight) {
        return window.DynamicCardComposer.estimateCardHeight(card);
      }
      let extra = 0;
      (card.items || []).forEach(it => {
        const len = (it.text || it.content || '').length;
        const itType = it.nodeType || it.type;
        if (itType === 'CODE_BLOCK' || itType === 'CodeBlock') {
          const lines = (it.text || it.code || '').split('\n').length;
          extra += 40 + lines * 14;
        } else if (itType === 'TABLE_BLOCK' || itType === 'Table') {
          extra += 50 + (it.rows?.length || 2) * 20;
        } else if (itType === 'ASSESSMENT_QUESTION' || itType === 'Challenge') {
          extra += 60;
        } else if (itType === 'KeyValuePairGroup') {
          extra += 25 + (it.pairs?.length || 2) * 16;
        } else if (itType === 'CalloutBox' || itType === 'SAFETY_NOTE') {
          extra += 35 + Math.ceil(len / 80) * 16;
        } else {
          extra += 18 + Math.ceil(len / 80) * 14;
        }
      });
      return 45 + extra;
    }
    const base = this.CARD_HEIGHTS[card.type] || this.CARD_HEIGHTS['default'];

    // Adjust height for content length
    const contentLength = (card.content || card.text || '').length;
    const extraLines = Math.floor(contentLength / 120);
    const bulletCount = (card.bullets || card.items || card.objectives || card.steps || card.questions || []).length;
    const extra = extraLines * 16 + bulletCount * 22;

    return base + Math.min(extra, 250);
  },

  buildPage(pageNum, sections, missionNum) {
    // Determine page type from content
    let pageType = 'content';
    if (pageNum === 1) pageType = 'cover';
    // If a section has a phase/page banner or title, determine pageType
    const banner = sections.find(s => s.type === 'page-banner' || s.isPhaseHeader || /(?:PAGE|PHASE)\s*\d+/i.test(s.title || ''));
    if (banner) {
      pageType = this.getBannerTypeForTitle(banner.title || banner.pageType || '');
      if (pageNum === 1) pageType = 'cover';
    }
    return {
      pageNumber: pageNum,
      pageType: pageType,
      sections: sections,
      footerPills: [],
      footerNextText: `Page ${pageNum + 1} →`
    };
  },

  makeEmptyPage(pageNum, missionNum) {
    return {
      pageNumber: pageNum,
      pageType: 'content',
      sections: [{
        type: 'dynamic-text',
        title: 'CONTENT',
        icon: '📄',
        content: 'Paste your content in the left panel and click Parse!'
      }],
      footerPills: [],
    };
  },

  // ─── LEGACY HELPERS (kept for backward compatibility) ────
  extract(str, regex, fallback = '') {
    const m = str.match(regex);
    return m ? (m[1] || m[0]).trim() : fallback;
  },

  getSection(text, keywords) {
    if (!text) return null;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (keywords.some(kw => lines[i].toUpperCase().includes(kw.toUpperCase()))) {
        const sectionLines = [];
        for (let j = i; j < Math.min(i + 30, lines.length); j++) {
          if (j > i && /^[A-Z\s]{5,}:?\s*$/.test(lines[j]) && j > i + 1) break;
          sectionLines.push(lines[j]);
        }
        return sectionLines.join('\n');
      }
    }
    return null;
  },

  extractBullets(text) {
    if (!text) return [];
    return text.split('\n')
      .map(l => l.replace(/^[\s•\-\*\d\.]+/, '').trim())
      .filter(l => l.length > 4 && l.length < 200);
  },

  extractQuestions(text) {
    return (text || '').split('\n')
      .map(l => l.replace(/^[\s\dQ\.\)\:\-]+/, '').trim())
      .filter(l => l.endsWith('?') && l.length > 10);
  },

  extractBuildSteps(text) {
    const stepMatches = [...(text || '').matchAll(/(?:Step\s*)?(\d+)[:\.\)]\s*([^\n]{5,80})/gi)];
    if (stepMatches.length >= 2) {
      return stepMatches.slice(0, 6).map(m => ({
        stepNum: parseInt(m[1]),
        title: m[2].trim().toUpperCase(),
        desc: m[2].trim(),
        pinTable: []
      }));
    }
    return [];
  },

  extractCode(text) {
    if (!text) return null;
    const codeBlock = text.match(/```[\s\S]*?```/);
    if (codeBlock) return codeBlock[0].replace(/```\w*\n?/g, '').trim();
    const indented = text.split('\n').filter(l => l.startsWith('    ') || l.startsWith('\t'));
    if (indented.length > 2) return indented.join('\n').trim();
    return null;
  },

  extractMistakes(text) {
    const mistakes = [];
    if (!text) return mistakes;
    const lines = text.split('\n').filter(l => l.trim().length > 4);
    for (let i = 0; i < lines.length - 1; i++) {
      if (/wrong|loose|incorrect|not|missing|issue|problem/i.test(lines[i])) {
        mistakes.push({
          icon: '⚠️',
          issue: lines[i].replace(/^[\s•\-\*\d\.\)]+/, '').trim(),
          fix: lines[i+1] ? lines[i+1].replace(/^[\s•\-\*\d\.\)]+/, '').trim() : ''
        });
      }
    }
    return mistakes;
  },

  extractFlowSteps(text) {
    if (!text) return [];
    const lines = text.split('\n').filter(l => l.trim().length > 3).slice(0, 8);
    return lines.map((l, i) => ({
      label: l.replace(/^[\s\d\.\)\-•→]+/, '').trim(),
      type: i === 0 ? 'start' : i === lines.length - 1 ? 'loop' : 'process',
      desc: ''
    }));
  },

  extractVariables(text) {
    const varPatterns = [...(text || '').matchAll(/(?:var|let|const|global|dim)\s+(\w+)\s*[=:]/gi)];
    if (varPatterns.length > 0) {
      return varPatterns.slice(0, 4).map(m => ({
        name: m[1], label: m[1].charAt(0).toUpperCase() + m[1].slice(1),
        icon: '📌', desc: `Stores ${m[1]} value`, example: '0'
      }));
    }
    return [
      { name: 'value', label: 'Sensor Value', icon: '📊', desc: 'Stores the main reading', example: '0' },
      { name: 'status', label: 'Device Status', icon: '💡', desc: 'Stores device status', example: 'OK' }
    ];
  },

  extractHeroes(text) {
    if (!text) return [];
    const heroes = [];
    const lines = text.split('\n');
    let current = null;
    for (const line of lines) {
      const t = line.trim();
      if (t.length > 2 && t.length < 50 && /^[A-Z]/.test(t) && !/^[•\-\*]/.test(t)) {
        if (current) heroes.push(current);
        current = { name: t, icon: '🦸', quote: '', uses: [] };
      } else if (current) {
        if (t.startsWith('"')) current.quote = t.replace(/^"|"$/g, '');
        else if (/^[•\-\*]/.test(t)) current.uses.push(t.replace(/^[•\-\*]\s*/, ''));
      }
    }
    if (current) heroes.push(current);
    return heroes.slice(0, 6);
  },

  extractObjectives(text) {
    if (!text) return [];
    const icons = ['💡','🔧','💻','🧪','📊','🌐','⚡','📡'];
    const objectives = [];
    const patterns = [
      /(?:Objective|Goal|You\s+will)\s*\d*\s*[:\-]?\s*([^\n]+)/gi,
      /(?:\d+[\.\)])\s*([A-Z][^\n]{5,80})/g,
      /(?:•|\-|\*)\s*([A-Z][^\n]{5,80})/g
    ];
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(text)) !== null && objectives.length < 6) {
        const t = m[1].trim();
        if (t.length > 5) objectives.push({ num: objectives.length + 1, text: t, icon: icons[objectives.length] || '📌' });
      }
      if (objectives.length >= 6) break;
    }
    return objectives;
  },

  extractIllustrationPrompts(text) {
    return [...(text || '').matchAll(/\((?:Illustration|Diagram|Assembly|UI)\s+Prompt:\s*([^\)]+)\)/gi)]
      .map(m => m[1].trim());
  },

  extractCodePills(text) {
    const pillPatterns = [/when\s+start/i, /read\s+\w+/i, /store\s+data/i, /show\s+on/i, /repeat\s+forever/i];
    const pills = [];
    for (const p of pillPatterns) {
      const m = text.match(p);
      if (m) pills.push(m[0].trim().toLowerCase());
      if (pills.length >= 5) break;
    }
    return pills.length > 0 ? pills : ['when start', 'read data', 'store value', 'display result', 'repeat'];
  },

  extractBadgeName(title) {
    const name = title.replace(/MISSION \d+[-:]\s*/i, '').replace(/\s+/g, ' ').trim();
    return name.split(' ').slice(0, 2).join(' ').toUpperCase() + ' ENGINEER';
  },

  extractComponentName(text) {
    const patterns = [/\b(DHT\d+)\b/, /\b(HC-SR\d+)\b/, /\b(MQ-\d+)\b/, /\b(BMP\d+)\b/];
    for (const p of patterns) { const m = text.match(p); if (m) return m[1]; }
    const cw = text.match(/(?:using|with|the)\s+([A-Z][a-zA-Z\d\-]{3,20})\s+(?:sensor|module|board|display)/i);
    return cw ? cw[1] : 'SENSOR MODULE';
  },

  extractSpecs(text) {
    return [
      { icon: '🌡️', label: 'Primary Range',    value: this.extract(text, /Range:\s*([^\n,]+)/, '0 to 100') },
      { icon: '💧', label: 'Secondary Range',   value: this.extract(text, /Humidity:\s*([^\n,]+)/, '20% to 90%') },
      { icon: '🎯', label: 'Accuracy',          value: this.extract(text, /[Aa]ccuracy:\s*([^\n]+)/, '±2%') },
      { icon: '⚡', label: 'Operating Voltage', value: this.extract(text, /[Vv]oltage:\s*([^\n]+)/, '3.3V to 5V') }
    ];
  },

  extractPinConfig(text) {
    return [
      { num: 1, label: 'VCC',  color: 'red',   desc: 'Power Supply (3.3V – 5V)' },
      { num: 2, label: 'DATA', color: 'blue',  desc: 'Digital Data Output' },
      { num: 3, label: 'GND',  color: 'black', desc: 'Ground' }
    ];
  },

  cleanText(text) {
    if (!text) return '';
    return text.replace(/\((?:Illustration|Diagram|Assembly|UI)\s+Prompt:[^)]+\)/gi, '').trim();
  },

  getDefaultMission() {
    return {
      id: 'default-mission',
      missionNumber: '01',
      title: 'Mission 01: Welcome to UltraMinds',
      missionTitle: 'WELCOME TO ULTRAMINDS',
      missionSubtitle: 'Paste your curriculum content to get started!',
      guideName: 'Commander Nova',
      guideRole: 'Your Mission Guide',
      theme: 'theme-blue',
      pages: [{
        pageNumber: 1,
        pageType: 'content',
        sections: [{
          type: 'dynamic-text',
          title: 'GETTING STARTED',
          icon: '🚀',
          content: 'Paste your raw chapter content, curriculum text, or XHTML in the left panel and click "Parse & Smart Arrange" to generate a beautiful book layout automatically!'
        }]
      }]
    };
  }
};
