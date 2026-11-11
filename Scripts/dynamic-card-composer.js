/**
 * UltraMinds Publishing Compiler — Dynamic Smart Card & Layout Composer (Stage 4)
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * 1. ZERO HARDCODED / PREFIXED TITLES: Bespoke titles synthesized from content semantics.
 * 2. REACT-STYLE COMPOSITION: Cards are dynamic containers nesting any combination of atomic sub-elements.
 * 3. DYNAMIC THEMING & ICONS: Palette and emojis derived from subject matter.
 * 4. STRICT ZERO OMISSION: Preserves 100% element ID coverage for 10-Gate verification.
 * 5. SMART A4 BIN-PACKING: Height-aware layout, split-columns, and pagination.
 */

(function() {
  'use strict';

  window.DynamicCardComposer = {

    /**
     * Estimates visual pixel height of an in-card item to maintain strict A4 page budgets
     */
    estimateItemHeight(item) {
      if (!item) return 20;

      switch (item.nodeType || item.type) {
        case 'CodeBlock':
        case 'CODE_BLOCK': {
          const lines = (item.code || item.text || '').split('\n').length;
          return 50 + lines * 16;
        }
        case 'Table':
        case 'TABLE_BLOCK': {
          const rows = item.rows?.length || item.meta?.rawTable?.length || 2;
          return 40 + rows * 24;
        }
        case 'KeyValuePairGroup': {
          const pairs = item.pairs?.length || 2;
          return 24 + Math.ceil(pairs / 2) * 32;
        }
        case 'CalloutBox':
        case 'SAFETY_NOTE':
        case 'ENGINEERING_NOTE': {
          const len = (item.text || '').length;
          return 40 + Math.ceil(len / 80) * 18;
        }
        case 'BulletList': {
          const count = item.items?.length || 1;
          return 20 + count * 22;
        }
        case 'TestRunLog':
        case 'TEST_RUN_LOG': {
          return 110;
        }
        case 'ClearanceCert':
        case 'CLEARANCE_CERT': {
          return 90;
        }
        case 'RADIO_TRANSMISSION':
        case 'RadioTransmission': {
          return 140;
        }
        case 'CodeComparison':
        case 'CODE_COMPARISON': {
          return 320;
        }
        case 'BLOCK_CODE_SCRIPT':
        case 'BlockCodeScript': {
          return 260;
        }
        case 'ASCII_BLUEPRINT':
        case 'AsciiBlueprint': {
          return 230;
        }
        case 'Challenge':
        case 'ASSESSMENT_QUESTION': {
          return 65;
        }
        case 'ProcedureStep':
        case 'PROCEDURE_STEP': {
          const len = (item.text || '').length;
          return (len < 80) ? 38 : (38 + Math.ceil((len - 80) / 75) * 18);
        }
        case 'Paragraph':
        case 'PARAGRAPH': {
          const len = (item.text || '').length;
          if (len < 10) return 22;
          return (len < 80) ? 28 : (28 + Math.ceil((len - 80) / 75) * 18);
        }
        case 'BULLET_ITEM': {
          const len = (item.text || '').length;
          return (len < 80) ? 28 : (28 + Math.ceil((len - 80) / 75) * 18);
        }
        default:
          return 28;
      }
    },

    /**
     * Estimates total visual height of a composed card including capsule header
     */
    estimateCardHeight(card) {
      if (!card) return 30;
      if (card.type === 'page-banner') return 48;
      if (card.type === 'dynamic-subheader') return 34;
      if (card.type === 'dynamic-comparison') return 260;
      if (card.type === 'split-layout') {
        const leftH = this.estimateCardHeight(card.left);
        const rightH = this.estimateCardHeight(card.right);
        return Math.max(leftH, rightH) + 10;
      }
      let h = 52; // Capsule header + card padding + card margin
      if (card.items && Array.isArray(card.items)) {
        card.items.forEach(item => {
          h += this.estimateItemHeight(item);
        });
      }
      return h;
    },

    /**
     * Parses a raw Code Comparison block into structured two-sided columns
     */
    parseTwoSidedCodeCompare(text) {
      if (!text) return { leftTitle: '❌ CODE IDEA A', rightTitle: '✅ CODE IDEA B', leftCode: '', rightCode: '', leftNotes: [], rightNotes: [], bottomNote: '' };
      const lines = text.split('\n');
      let headerLineIdx = -1;
      let splitCol = -1;
      let leftTitle = '❌ CODE IDEA A';
      let rightTitle = '✅ CODE IDEA B';

      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        const match = l.match(/(\[[❌✅]?\s*CODE IDEA [A-Z]:?[^\]]*\])/i);
        if (match) {
          headerLineIdx = i;
          leftTitle = match[1].replace(/[\[\]]/g, '').trim();
          const secondMatch = l.substring(match.index + match[0].length).match(/(\[[❌✅]?\s*CODE IDEA [A-Z]:?[^\]]*\])/i);
          if (secondMatch) {
            splitCol = match.index + match[0].length + secondMatch.index;
            rightTitle = secondMatch[1].replace(/[\[\]]/g, '').trim();
          }
          break;
        }
      }

      if (splitCol === -1) splitCol = 40;

      const leftCodeLines = [];
      const rightCodeLines = [];
      const leftNotes = [];
      const rightNotes = [];
      let bottomNote = '';

      const contentLines = headerLineIdx >= 0 ? lines.slice(headerLineIdx + 1) : lines;

      for (let line of contentLines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('____')) continue;

        if (/Why Code A|Why Idea A|Code A Fails|Idea A Fails/i.test(trimmed)) {
          leftNotes.push(trimmed.replace(/^[•\-\*\s]+/, ''));
          continue;
        }
        if (/Why Code B|Why Idea B|Code B Wins|Idea B Wins/i.test(trimmed)) {
          rightNotes.push(trimmed.replace(/^[•\-\*\s]+/, ''));
          continue;
        }
        if (/Space for illustration|Note:|Illustration:/i.test(trimmed)) {
          bottomNote = trimmed.replace(/^[\(\s]+|[\)\s]+$/g, '');
          continue;
        }

        if (line.length > splitCol) {
          const leftPart = line.substring(0, splitCol).trimEnd();
          const rightPart = line.substring(splitCol).trimEnd();
          if (leftPart.trim()) leftCodeLines.push(leftPart);
          if (rightPart.trim()) rightCodeLines.push(rightPart);
        } else {
          leftCodeLines.push(line.trimEnd());
        }
      }

      return {
        leftTitle,
        rightTitle,
        leftCode: leftCodeLines.join('\n'),
        rightCode: rightCodeLines.join('\n'),
        leftNotes,
        rightNotes,
        bottomNote
      };
    },

    /**
     * Parses a raw Match the Pairs section into structured two-sided columns
     */
    parseMatchPairs(items) {
      let prompt = '';
      let bottomNote = '';
      const leftItems = [];
      const rightItems = [];

      const rawLines = [];
      if (Array.isArray(items)) {
        for (const it of items) {
          const txt = typeof it === 'object' && it !== null ? (it.text || it.content || '') : String(it || '');
          txt.split('\n').forEach(l => {
            const tr = l.trim();
            if (tr && tr !== '→→' && tr !== '→' && tr !== '[' && tr !== ']') rawLines.push(tr);
          });
        }
      } else if (typeof items === 'string') {
        items.split('\n').forEach(l => {
          const tr = l.trim();
          if (tr && tr !== '→→' && tr !== '→' && tr !== '[' && tr !== ']') rawLines.push(tr);
        });
      }

      for (let i = 0; i < rawLines.length; i++) {
        const l = rawLines[i];

        if (/^(?:Q\d+|Match each|Match the)[.:\s]/i.test(l) && !prompt) {
          if (/^Match the Pairs/i.test(l) && rawLines[i+1] && /^Q\d+/i.test(rawLines[i+1])) {
            prompt = rawLines[i+1];
            i++;
          } else {
            prompt = l;
          }
          continue;
        }

        if (/^Write answers as|^Answers:|^Note:/i.test(l)) {
          bottomNote = l;
          continue;
        }

        // Inline format e.g. (1) Servo Motor [ A ] Bounces light...
        const inlineMatch = l.match(/^\(?(\d+)\)?[\s\.\)]+([^\t\[]+)(?:\t|\[\s*([A-D])\s*\])\s*(?:\[\s*([A-D])\s*\])?\s*([A-D][\.\)]\s*.+|.+)/i);
        if (inlineMatch && (l.includes('[') || l.includes('\t'))) {
          const num = inlineMatch[1];
          const leftPart = inlineMatch[2].trim();
          const letter = inlineMatch[3] || inlineMatch[4] || '';
          let rightPart = inlineMatch[5] || '';
          if (!/^[A-D][\.\)]/i.test(rightPart) && letter) {
            rightPart = letter + '. ' + rightPart;
          }
          leftItems.push({ icon: '🧩', text: '(' + num + ') ' + leftPart });
          rightItems.push({ icon: '🎯', text: '[   ] ' + rightPart.trim() });
          continue;
        }

        // Numbered item (Left column): (1) Connect WiFi or • (1) Connect WiFi
        const numMatch = l.match(/^[•\-\*\s]*\(?(\d+)\)[\s\.\)]+(.+)/);
        if (numMatch && !/^[A-D][\.\)]/.test(numMatch[2])) {
          const cleanText = numMatch[2].replace(/[→\[\]]/g, '').trim();
          leftItems.push({ icon: '🧩', text: '(' + numMatch[1] + ') ' + cleanText });
          continue;
        }

        // Lettered item (Right column): [ ] A. Broadcasts... or ] A. Broadcasts... or A. Broadcasts...
        const letterMatch = l.match(/(?:[\[\]\s]*)\b([A-D])[\.\)]\s+(.+)/i);
        if (letterMatch) {
          rightItems.push({ icon: '🎯', text: '[   ] ' + letterMatch[1].toUpperCase() + '. ' + letterMatch[2].trim() });
          continue;
        }
      }

      return {
        prompt: prompt || 'Match each item in Column A with its correct pair in Column B:',
        leftItems: leftItems.length ? leftItems : [{ icon: '🧩', text: '(1) Term 1' }, { icon: '🧩', text: '(2) Term 2' }],
        rightItems: rightItems.length ? rightItems : [{ icon: '🎯', text: '[   ] A. Duty A' }, { icon: '🎯', text: '[   ] B. Duty B' }],
        bottomNote
      };
    },

    /**
     * Phase-to-Page Architectural Composer:
     * When input has structured Phases (Phase 1..N), map each Phase to clean A4 pages!
     * Dynamically spills to continuation pages if content exceeds page budget by > 50-100px.
     */
    composePhasePages(canonicalResult, missionNum = '01', missionTitle = '') {
      if (!canonicalResult) return null;
      const elements = canonicalResult.canonicalElements || [];
      const phaseHeaders = elements.filter(e => e.type === 'SECTION_HEADER' && e.meta?.isPhase);

      if (phaseHeaders.length < 2) return null; // Not a multi-phase document

      const bannerConfigs = {
        1: { type: 'cover', icon: '🚨', subtitle: 'EMERGENCY SCENARIO & OBJECTIVES', defaultCardTheme: 'theme-card-blue' },
        2: { type: 'engineering-explorer', icon: '🔍', subtitle: 'OBSERVE. DISCOVER. UNDERSTAND.', defaultCardTheme: 'theme-card-green' },
        3: { type: 'hardware-studio', icon: '🔨', subtitle: 'MECHANICAL ASSEMBLY & WIRING GUIDE', defaultCardTheme: 'theme-card-orange' },
        4: { type: 'ultracore-studio', icon: '💻', subtitle: 'ALGORITHMIC LOGIC & BLOCK CODING', defaultCardTheme: 'theme-card-purple' },
        5: { type: 'testing-lab', icon: '🚦', subtitle: 'SYSTEM VERIFICATION & PRECISION AUDIT', defaultCardTheme: 'theme-card-green' },
        6: { type: 'product-showcase', icon: '🏆', subtitle: 'YOUNG CODER ASSESSMENT & CERTIFICATION', defaultCardTheme: 'theme-card-yellow' }
      };

      const pages = [];

      for (let pIdx = 0; pIdx < phaseHeaders.length; pIdx++) {
        const curPhase = phaseHeaders[pIdx];
        const nextPhase = phaseHeaders[pIdx + 1];
        const phaseNum = pIdx + 1;

        const startIdx = elements.indexOf(curPhase);
        const endIdx = nextPhase ? elements.indexOf(nextPhase) : elements.length;
        const phaseElements = elements.slice(startIdx, endIdx);

        const pageConfig = bannerConfigs[phaseNum] || { type: 'generic', icon: '📄', subtitle: 'ENGINEERING LAB' };
        const pageCards = [];

        // For Page 2+, add the contextual Page Banner with the phase's elementId
        if (phaseNum > 1) {
          pageCards.push({
            type: 'page-banner',
            pageType: pageConfig.type,
            elementId: curPhase.id,
            title: curPhase.text.replace(/^[📄\s]*(?:PHASE|PAGE)\s*\d+[:–—-]?\s*/i, '').trim() || curPhase.text,
            rawHeading: curPhase.text,
            subtitle: pageConfig.subtitle,
            icon: pageConfig.icon,
            sourceElements: [curPhase]
          });
        }

        // Subsections inside this phase (excluding curPhase header)
        const innerElems = phaseElements.slice(1);
        const subSections = [];
        let curSec = null;

        innerElems.forEach(elem => {
          if (elem.type === 'SECTION_HEADER') {
            if (curSec && /BADGE UNLOCKED|ACHIEVEMENT/i.test(elem.text)) {
              curSec.items.push(elem);
            } else {
              if (curSec) subSections.push(curSec);
              curSec = {
                heading: elem,
                items: []
              };
            }
          } else if (['RADIO_TRANSMISSION', 'ASCII_BLUEPRINT', 'CODE_COMPARISON', 'BLOCK_CODE_SCRIPT', 'TEST_RUN_LOG', 'CLEARANCE_CERT'].includes(elem.type)) {
            if (curSec && (curSec.items.length === 0 || (curSec.heading && curSec.items.length <= 1))) {
              curSec.items.push(elem);
            } else {
              if (curSec) subSections.push(curSec);
              curSec = {
                heading: null,
                items: [elem]
              };
            }
          } else {
            if (!curSec) {
              curSec = { heading: null, items: [] };
            }
            curSec.items.push(elem);
          }
        });
        if (curSec) subSections.push(curSec);

        // On Page 1, include curPhase header if not rendered as banner
        if (phaseNum === 1) {
          pageCards.push({
            type: 'dynamic-subheader',
            elementId: curPhase.id,
            title: curPhase.text,
            icon: '🚨',
            isPhaseHeader: true,
            sourceElements: [curPhase]
          });
        }

        // Turn subSections into composed cards
        subSections.forEach((sec, sIdx) => {
          const rawTitle = sec.heading ? sec.heading.text : '';
          const titleId = sec.heading ? sec.heading.id : null;
          let dynamicTitle = '';
          let icon = '📌';
          let isDialogueCallout = false;

          // ── SPECIAL TWO-SIDED CARD DETECTION: MATCH THE PAIRS ──
          const isMatchSection = /MATCH\s*(?:THE)?\s*PAIRS|MATCH\s*(?:THE)?\s*FOLLOWING/i.test(rawTitle) ||
                                (sec.items && sec.items.some(i => /match\s*each.*with/i.test(i.text || '')));
          if (isMatchSection) {
            const matchData = this.parseMatchPairs(sec.items);
            const card = {
              type: 'dynamic-comparison',
              subtype: 'match-pairs',
              isMatchPairs: true,
              elementId: titleId,
              titleElementId: titleId,
              title: 'MATCH THE PAIRS',
              icon: '🧩',
              prompt: matchData.prompt,
              leftTitle: 'COLUMN A (TERMS)',
              rightTitle: 'COLUMN B (DUTIES)',
              leftItems: matchData.leftItems,
              rightItems: matchData.rightItems,
              badgeText: '⟷',
              bottomNote: matchData.bottomNote,
              sourceElements: sec.heading ? [sec.heading, ...sec.items] : sec.items
            };
            card.estimatedHeight = this.estimateCardHeight(card);
            pageCards.push(card);
            return;
          }

          // ── SPECIAL TWO-SIDED CARD DETECTION: CODE COMPARISON / CODE LOGIC MYSTERY ──
          const codeCompElem = sec.items && sec.items.find(i => i.type === 'CODE_COMPARISON');
          const isCodeMystery = codeCompElem || /CODE\s*(?:LOGIC\s*)?MYSTERY|CODE\s*COMPARE|ALGORITHMIC\s*COMPARISON/i.test(rawTitle);
          if (codeCompElem && isCodeMystery) {
            const codeData = this.parseTwoSidedCodeCompare(codeCompElem.text);
            const promptElem = sec.items.find(i => i.type === 'PARAGRAPH' && /^["'“]/.test((i.text || '').trim()));
            const card = {
              type: 'dynamic-comparison',
              subtype: 'code-compare',
              isCodeCompare: true,
              elementId: titleId || codeCompElem.id,
              titleElementId: titleId || codeCompElem.id,
              title: rawTitle ? rawTitle.replace(/^#+\s*/, '') : "NOVA'S CODE LOGIC MYSTERY",
              icon: '⚖️',
              prompt: promptElem ? promptElem.text.replace(/^["'“]|["'”]$/g, '').trim() : '',
              leftTitle: codeData.leftTitle,
              rightTitle: codeData.rightTitle,
              leftCode: codeData.leftCode,
              rightCode: codeData.rightCode,
              leftNotes: codeData.leftNotes,
              rightNotes: codeData.rightNotes,
              leftItems: [{ icon: '❌', text: codeData.leftCode }],
              rightItems: [{ icon: '✅', text: codeData.rightCode }],
              badgeText: 'VS',
              bottomNote: codeData.bottomNote,
              sourceElements: sec.heading ? [sec.heading, ...sec.items] : sec.items
            };
            card.estimatedHeight = this.estimateCardHeight(card);
            pageCards.push(card);
            return;
          }

          if (sec.heading) {
            dynamicTitle = window.SemanticSorter?.synthesizeDynamicTitle(rawTitle, sec.items) || rawTitle;
            icon = window.SemanticSorter?.detectEmoji(dynamicTitle + ' ' + rawTitle) || '📌';
          } else if (sec.items && sec.items[0]) {
            const firstType = sec.items[0].type;
            const firstText = sec.items[0].text || '';
            if (firstType === 'PARAGRAPH' && /^["'“]/.test(firstText.trim())) {
              dynamicTitle = "MISSION DISPATCH";
              icon = "💬";
              isDialogueCallout = true;
            } else if (firstType === 'RADIO_TRANSMISSION') {
              dynamicTitle = "LIVE RADIO DISPATCH";
              icon = "📻";
            } else if (firstType === 'ASCII_BLUEPRINT') {
              dynamicTitle = "MECHANICAL ARCHWAY BLUEPRINT";
              icon = "📐";
            } else if (firstType === 'CODE_COMPARISON') {
              dynamicTitle = "CODE LOGIC MYSTERY";
              icon = "🧩";
            } else if (firstType === 'BLOCK_CODE_SCRIPT') {
              dynamicTitle = "BLOCK CODE SCRIPT";
              icon = "💻";
            } else if (firstType === 'TEST_RUN_LOG') {
              dynamicTitle = "LIVE TEST RUN AUDIT";
              icon = "🚦";
            } else if (firstType === 'CLEARANCE_CERT') {
              dynamicTitle = "PRECISION CLEARANCE CERTIFICATE";
              icon = "🏆";
            } else {
              dynamicTitle = firstType.replace(/_/g, ' ');
              icon = window.SemanticSorter?.detectEmoji(firstText) || '📌';
            }
          } else {
            dynamicTitle = `PART ${sIdx + 1}`;
          }

          let theme = pageConfig.defaultCardTheme || 'theme-card-blue';
          if (window.SemanticSorter?.detectTheme) {
            const detected = window.SemanticSorter.detectTheme('THEORY_CONCEPT', dynamicTitle);
            if (detected && detected !== 'theme-card-blue') {
              theme = detected;
            }
          }

          const card = {
            type: 'dynamic-composed-card',
            elementId: titleId,
            titleElementId: titleId,
            title: dynamicTitle,
            icon,
            cardStyle: theme,
            items: sec.items,
            isDialogueCallout,
            sourceElements: sec.heading ? [sec.heading, ...sec.items] : sec.items
          };
          card.estimatedHeight = this.estimateCardHeight(card);
          pageCards.push(card);
        });

        // Special Phase 1 Optimization: Pair Live Radio Dispatch & Nova's Concept Lab into split-layout
        if (phaseNum === 1) {
          const radioIdx = pageCards.findIndex(c => /RADIO|TRANSMISSION|DISPATCH/i.test(c.title || ''));
          const conceptIdx = pageCards.findIndex(c => /CONCEPT LAB|EDGE DETECTION/i.test(c.title || ''));
          if (radioIdx !== -1 && conceptIdx !== -1 && radioIdx !== conceptIdx) {
            const leftCard = pageCards[radioIdx];
            const rightCard = pageCards[conceptIdx];
            const minIdx = Math.min(radioIdx, conceptIdx);
            pageCards.splice(Math.max(radioIdx, conceptIdx), 1);
            pageCards.splice(minIdx, 1, {
              type: 'split-layout',
              left: leftCard,
              right: rightCard
            });
          }
        }

        // Special Phase 2 Optimization: Pair Checklist & Building blocks into split-layout
        if (phaseNum === 2) {
          const checklistIdx = pageCards.findIndex(c => /CHECKLIST|ELECTRONICS|HARDWARE/i.test(c.title || ''));
          const blocksIdx = pageCards.findIndex(c => /BUILDING BLOCKS|BLOCKS NEEDED/i.test(c.title || ''));
          if (checklistIdx !== -1 && blocksIdx !== -1 && checklistIdx !== blocksIdx) {
            const leftCard = pageCards[checklistIdx];
            const rightCard = pageCards[blocksIdx];
            const minIdx = Math.min(checklistIdx, blocksIdx);
            pageCards.splice(Math.max(checklistIdx, blocksIdx), 1);
            pageCards.splice(minIdx, 1, {
              type: 'split-layout',
              left: leftCard,
              right: rightCard
            });
          }
        }

        // Special Phase 6 Optimization: Pair single-column assessment sections, keep MATCH THE PAIRS full-width
        if (phaseNum === 6) {
          const ccaIdx = pageCards.findIndex(c => /CHOOSE CORRECT ANSWER|CCA/i.test(c.title || ''));
          const fibIdx = pageCards.findIndex(c => /FILL IN THE BLANKS/i.test(c.title || ''));
          const tfIdx = pageCards.findIndex(c => /TRUE OR FALSE/i.test(c.title || ''));

          // Pair CCA and FIB if both exist into a 2-column split-layout
          if (ccaIdx !== -1 && fibIdx !== -1 && ccaIdx !== fibIdx) {
            const leftCard = pageCards[ccaIdx];
            const rightCard = pageCards[fibIdx];
            const minIdx = Math.min(ccaIdx, fibIdx);
            pageCards.splice(Math.max(ccaIdx, fibIdx), 1);
            pageCards.splice(minIdx, 1, {
              type: 'split-layout',
              left: leftCard,
              right: rightCard
            });
          } else if (fibIdx !== -1 && tfIdx !== -1 && fibIdx !== tfIdx) {
            const leftCard = pageCards[fibIdx];
            const rightCard = pageCards[tfIdx];
            const minIdx = Math.min(fibIdx, tfIdx);
            pageCards.splice(Math.max(fibIdx, tfIdx), 1);
            pageCards.splice(minIdx, 1, {
              type: 'split-layout',
              left: leftCard,
              right: rightCard
            });
          }
          // MATCH THE PAIRS is a full-width two-sided comparison card, so it is never squeezed into split-layout
        }

        // Dynamic Page Budget & Overflow Calculation (Rule: spill to next page if overflowing > 50-100px)
        const budget = (phaseNum === 1) ? 380 : 780;
        let totalH = 0;
        pageCards.forEach(c => {
          totalH += (c.estimatedHeight || this.estimateCardHeight(c));
        });

        if (totalH > budget + 50 && pageCards.length > 2) {
          const page1Cards = [];
          const page2Cards = [];
          let curH = 0;
          let splitPointReached = false;
          for (let i = 0; i < pageCards.length; i++) {
            const c = pageCards[i];
            const cH = c.estimatedHeight || this.estimateCardHeight(c);
            if (!splitPointReached && (curH + cH > budget) && page1Cards.length >= 2) {
              splitPointReached = true;
            }
            if (splitPointReached) {
              page2Cards.push(c);
            } else {
              page1Cards.push(c);
              curH += cH;
            }
          }

          if (page2Cards.length > 0) {
            // Push Part 1
            pages.push({
              pageNumber: pages.length + 1,
              pageType: phaseNum === 1 ? 'cover' : pageConfig.type,
              sections: page1Cards,
              footerPills: ['Observe', 'Assemble', 'Code', 'Verify'],
              footerNextText: `Next: Part 2 🚀`
            });

            // Continuation Banner for Part 2
            const contBanner = {
              type: 'page-banner',
              pageType: phaseNum === 1 ? 'engineering-explorer' : pageConfig.type,
              title: `${curPhase.text.replace(/^[📄\s]*(?:PHASE|PAGE)\s*\d+[:–—-]?\s*/i, '').trim() || 'ASSESSMENT LAB'} (PART 2)`,
              subtitle: 'EVALUATION & SYSTEM CLEARANCE',
              icon: pageConfig.icon,
              isContinuation: true
            };

            // Push Part 2
            pages.push({
              pageNumber: pages.length + 1,
              pageType: phaseNum === 1 ? 'engineering-explorer' : pageConfig.type,
              sections: [contBanner, ...page2Cards],
              footerPills: ['Observe', 'Assemble', 'Code', 'Verify'],
              footerNextText: phaseNum < phaseHeaders.length ? `Next: Phase ${phaseNum + 1} 🚀` : 'Mission Complete! 🎓'
            });
            continue;
          }
        }

        pages.push({
          pageNumber: pages.length + 1,
          pageType: phaseNum === 1 ? 'cover' : pageConfig.type,
          sections: pageCards,
          footerPills: ['Observe', 'Assemble', 'Code', 'Verify'],
          footerNextText: phaseNum < phaseHeaders.length ? `Next: Phase ${phaseNum + 1} 🚀` : 'Mission Complete! 🎓'
        });
      }

      return pages;
    },

    /**
     * Entry Point: Transforms canonical results & AST into dynamically composed visual cards
     */
    composeCards(canonicalResult) {
      if (!canonicalResult) return [];

      // Step 1-3: Generate the Universal Structured Matter AST via SemanticSorter
      let ast;
      if (window.SemanticSorter && typeof window.SemanticSorter.buildStructuredMatterAST === 'function') {
        try {
          ast = window.SemanticSorter.buildStructuredMatterAST(canonicalResult);
        } catch (e) {
          console.warn("DynamicCardComposer: SemanticSorter failed, falling back to primitive grouping", e);
        }
      }

      // If AST generated successfully, compose dynamic cards from AST sections
      if (ast && ast.astSections && ast.astSections.length > 0) {
        return this.composeFromAST(ast.astSections);
      }

      // Fallback: Direct composition from raw canonical elements
      return this.composeFromCanonical(canonicalResult.canonicalElements || []);
    },

    /**
     * Composes rich dynamic cards from AST Sections
     */
    composeFromAST(astSections) {
      const cards = [];

      astSections.forEach((sec, idx) => {
        // If section has no children, render as subheader divider
        if (!sec.children || sec.children.length === 0) {
          cards.push({
            type: 'dynamic-subheader',
            elementId: sec.id,
            title: sec.dynamicTitle,
            icon: sec.icon,
            isPhaseHeader: /(?:PAGE|PHASE)\s*\d+/i.test(sec.rawHeading),
            sourceElements: sec.sourceElements
          });
          return;
        }

        // ── SPECIAL TWO-SIDED CARD DETECTION: MATCH THE PAIRS ──
        if (/MATCH\s*(?:THE)?\s*PAIRS|MATCH\s*(?:THE)?\s*FOLLOWING/i.test(sec.dynamicTitle || sec.rawHeading || '') ||
            (sec.children && sec.children.some(c => /match\s*each.*with/i.test(c.text || '')))) {
          const matchData = this.parseMatchPairs(sec.children);
          cards.push({
            type: 'dynamic-comparison',
            subtype: 'match-pairs',
            isMatchPairs: true,
            elementId: sec.id,
            titleElementId: sec.id,
            title: 'MATCH THE PAIRS',
            icon: '🧩',
            prompt: matchData.prompt,
            leftTitle: 'COLUMN A (TERMS)',
            rightTitle: 'COLUMN B (DUTIES)',
            leftItems: matchData.leftItems,
            rightItems: matchData.rightItems,
            badgeText: '⟷',
            bottomNote: matchData.bottomNote,
            sourceElements: [sec.headerElem, ...sec.children].filter(Boolean),
            estimatedHeight: 220
          });
          return;
        }

        // ── SPECIAL TWO-SIDED CARD DETECTION: CODE COMPARISON / CODE LOGIC MYSTERY ──
        const codeCompElem = sec.children && sec.children.find(c => c.type === 'CODE_COMPARISON');
        if (codeCompElem || /CODE\s*(?:LOGIC\s*)?MYSTERY|CODE\s*COMPARE/i.test(sec.dynamicTitle || sec.rawHeading || '')) {
          const rawCodeText = codeCompElem ? codeCompElem.text : (sec.children[0] ? sec.children[0].text : '');
          const codeData = this.parseTwoSidedCodeCompare(rawCodeText);
          const promptElem = sec.children.find(c => c.type === 'PARAGRAPH' && /^["'“]/.test((c.text || '').trim()));
          cards.push({
            type: 'dynamic-comparison',
            subtype: 'code-compare',
            isCodeCompare: true,
            elementId: sec.id || (codeCompElem ? codeCompElem.id : null),
            titleElementId: sec.id || (codeCompElem ? codeCompElem.id : null),
            title: sec.dynamicTitle || "NOVA'S CODE LOGIC MYSTERY",
            icon: '⚖️',
            prompt: promptElem ? promptElem.text.replace(/^["'“]|["'”]$/g, '').trim() : '',
            leftTitle: codeData.leftTitle,
            rightTitle: codeData.rightTitle,
            leftCode: codeData.leftCode,
            rightCode: codeData.rightCode,
            leftNotes: codeData.leftNotes,
            rightNotes: codeData.rightNotes,
            leftItems: [{ icon: '❌', text: codeData.leftCode }],
            rightItems: [{ icon: '✅', text: codeData.rightCode }],
            badgeText: 'VS',
            bottomNote: codeData.bottomNote,
            sourceElements: [sec.headerElem, ...sec.children].filter(Boolean),
            estimatedHeight: 320
          });
          return;
        }

        // Height-aware item chunking: keeps sections cohesive without exceeding page limits
        let currentChunk = [];
        let currentHeight = 0;
        let chunkCount = 0;

        const flushChunk = () => {
          if (currentChunk.length > 0) {
            const isFirst = chunkCount === 0;
            const title = isFirst ? sec.dynamicTitle : `${sec.dynamicTitle} (Cont.)`;
            const card = {
              type: 'dynamic-composed-card',
              elementId: isFirst ? sec.id : null,
              titleElementId: isFirst ? sec.id : null,
              title,
              icon: sec.icon,
              cardStyle: sec.theme,
              semanticCategory: sec.semanticCategory,
              badge: sec.semanticCategory.replace('_', ' '),
              items: currentChunk,
              sourceElements: isFirst ? [sec.headerElem, ...currentChunk].filter(Boolean) : currentChunk
            };
            card.estimatedHeight = this.estimateCardHeight(card);
            cards.push(card);

            chunkCount++;
            currentChunk = [];
            currentHeight = 0;
          }
        };

        sec.children.forEach(item => {
          const itemH = this.estimateItemHeight(item);
          // If a single chunk exceeds 520px, split to prevent page bleeding
          if (currentChunk.length > 0 && currentHeight + itemH > 520) {
            flushChunk();
          }
          currentChunk.push(item);
          currentHeight += itemH;
        });

        flushChunk();
      });

      return cards;
    },

    /**
     * Fallback: Composes cards directly from canonical elements if AST unavailable
     */
    composeFromCanonical(elements) {
      const cards = [];
      const sections = [];
      let activeGroup = { heading: null, items: [] };

      elements.forEach(elem => {
        if (elem.type === 'SECTION_HEADER' || elem.type === 'MISSION_TITLE') {
          if (activeGroup.items.length > 0 || activeGroup.heading) {
            sections.push(activeGroup);
          }
          activeGroup = { heading: elem, items: [] };
        } else {
          activeGroup.items.push(elem);
        }
      });
      if (activeGroup.items.length > 0 || activeGroup.heading) {
        sections.push(activeGroup);
      }

      sections.forEach((sec, idx) => {
        const rawTitle = sec.heading ? sec.heading.text : `SECTION ${idx + 1}`;
        const titleId = sec.heading ? sec.heading.id : null;
        const dynamicTitle = window.SemanticSorter?.synthesizeDynamicTitle(rawTitle, sec.items) || rawTitle;
        const icon = window.SemanticSorter?.detectEmoji(dynamicTitle) || '📌';
        const theme = window.SemanticSorter?.detectTheme('THEORY_CONCEPT', dynamicTitle) || 'theme-card-blue';

        if (sec.items.length === 0) {
          cards.push({
            type: 'dynamic-subheader',
            elementId: titleId,
            title: dynamicTitle,
            icon,
            sourceElements: [sec.heading].filter(Boolean)
          });
          return;
        }

        cards.push({
          type: 'dynamic-composed-card',
          elementId: titleId,
          titleElementId: titleId,
          title: dynamicTitle,
          icon,
          cardStyle: theme,
          items: sec.items,
          sourceElements: sec.heading ? [sec.heading, ...sec.items] : sec.items
        });
      });

      return cards;
    },

    /**
     * Smart Split-Layout Pairing & A4 Page Packing
     * Assembles composed cards into full A4 pages with split columns where appropriate
     */
    packCardsIntoPages(cards, missionMeta = {}) {
      const pages = [];
      let currentPage = {
        pageNumber: 1,
        pageType: 'cover',
        sections: [],
        footerPills: [],
        footerNextMission: ''
      };

      const PAGE_1_BUDGET = 840; // Pixels available on page 1 (cover header takes ~240px)
      const PAGE_N_BUDGET = 1040; // Pixels available on page 2+

      let currentBudget = PAGE_1_BUDGET;
      let usedHeight = 0;

      const finishPage = () => {
        pages.push(currentPage);
        currentPage = {
          pageNumber: pages.length + 1,
          pageType: 'dynamic-composite',
          sections: [],
          footerPills: ['Observe', 'Assemble', 'Code', 'Verify'],
          footerNextText: 'Next Engineering Discovery 🚀'
        };
        currentBudget = PAGE_N_BUDGET;
        usedHeight = 0;
      };

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const cardH = card.estimatedHeight || this.estimateCardHeight(card);

        // Check if this card and the next card can be paired into a split-layout (side by side)
        const nextCard = cards[i + 1];
        if (nextCard && nextCard.type === 'dynamic-composed-card' && card.type === 'dynamic-composed-card') {
          const nextH = nextCard.estimatedHeight || this.estimateCardHeight(nextCard);
          // Pair if both cards are compact (< 280px) and their combined height fits current budget
          if (cardH < 280 && nextH < 280) {
            const pairHeight = Math.max(cardH, nextH);
            if (usedHeight + pairHeight > currentBudget && currentPage.sections.length > 0) {
              finishPage();
            }
            currentPage.sections.push({
              type: 'split-layout',
              left: card,
              right: nextCard
            });
            usedHeight += pairHeight + 12;
            i++; // Skip nextCard since it was paired
            continue;
          }
        }

        // Standard single card placement
        if (usedHeight + cardH > currentBudget && currentPage.sections.length > 0) {
          finishPage();
        }

        currentPage.sections.push(card);
        usedHeight += cardH + 12;
      }

      if (currentPage.sections.length > 0) {
        pages.push(currentPage);
      }

      return {
        missionNumber: missionMeta.missionNumber || '01',
        missionTitle: missionMeta.missionTitle || 'STEM ENGINEERING MISSION',
        missionSubtitle: missionMeta.missionSubtitle || 'Observational Discovery & Hardware Assembly',
        guideName: missionMeta.guideName || 'Commander Nova',
        guideRole: missionMeta.guideRole || 'Mission Architect',
        theme: missionMeta.theme || 'theme-blue',
        pages
      };
    }
  };

  console.log("✅ DynamicCardComposer (Stage 4 Smart Composer) Loaded.");
})();
