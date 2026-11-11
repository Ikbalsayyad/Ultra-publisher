/**
 * UltraMinds Publishing Compiler — Semantic Sorter & Universal Structured Matter AST Engine
 * 
 * CORE PIPELINE STAGES IMPLEMENTED:
 * Stage 1: Smart Content Reading & Ingestion (Zero Omission Tokenizer)
 * Stage 2: Semantic Understanding & Category Sorting
 * Stage 3: Universal Structured Matter AST Generator (Typed Tag / JSON Schema)
 */

(function() {
  'use strict';

  // Fast string hash utility
  function hashString(str) {
    if (!str) return '00000000';
    let hash = 0;
    const cleanStr = String(str).replace(/\s+/g, ' ').trim();
    for (let i = 0; i < cleanStr.length; i++) {
      const char = cleanStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16).padStart(8, '0');
  }

  function cleanText(text) {
    if (!text) return '';
    return String(text)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  window.SemanticSorter = {

    /**
     * Contextual Icon Selector: Derives the most accurate Unicode emoji from text semantics
     */
    detectEmoji(text, category = '') {
      if (!text) return '📌';
      // First check if an emoji is already present at the start of text
      const emojiMatch = text.match(/^\p{Extended_Pictographic}/u) || text.match(/[\u{1F300}-\u{1F9FF}]/u);
      if (emojiMatch) return emojiMatch[0];

      const lower = (text + ' ' + category).toLowerCase();
      if (/botan|plant|garden|fern|green|leaf|soil|moist|irriga|water|pump|drip/.test(lower)) return '🌿';
      if (/train|railway|track|locomotive|station/.test(lower)) return '🚂';
      if (/danger|warning|caution|emergency|crisis|hazard|alert/.test(lower)) return '🚨';
      if (/brain|logic|algorithm|flowchart|think|predict|puzzle/.test(lower)) return '🧠';
      if (/tool|toolkit|toolbox|sensor|probe|switch|module/.test(lower)) return '🧰';
      if (/build|assembly|construct|bracket|chassis|mechanical|wire|wiring|connect/.test(lower)) return '🔨';
      if (/circuit|voltage|vcc|gnd|power|electric|current|battery|pin|gpio/.test(lower)) return '⚡';
      if (/code|program|script|micropython|python|loop|function|variable|syntax/.test(lower)) return '💻';
      if (/table|data|matrix|spec|benchmark|reading|adc/.test(lower)) return '📊';
      if (/compare|versus|\bvs\b|difference|contrast/.test(lower)) return '⚖️';
      if (/test|clearance|ready|upload|complete|verify|pass/.test(lower)) return '✅';
      if (/question|quiz|assessment|lab|challenge|worksheet/.test(lower)) return '📝';
      if (/trophy|badge|achievement|unlock|award|hero/.test(lower)) return '🏆';
      if (/pro-tip|tip|note|hint|best practice|advice/.test(lower)) return '⭐';
      if (/vocab|definition|terminology|keyword/.test(lower)) return '📚';
      if (/microscope|observe|anatomy|dht11|component|hardware/.test(lower)) return '🔬';
      return '📌';
    },

    /**
     * Contextual Card Theme Selector: Derives visual styling palette from semantic category
     */
    detectTheme(category, text = '') {
      const lower = (category + ' ' + text).toLowerCase();
      if (/alert|safety|warning|danger|hazard|mistake/.test(lower)) return 'theme-card-red';
      if (/code|logic|program|syntax|terminal|loop/.test(lower)) return 'theme-card-dark';
      if (/hardware|wiring|build|assembly|pinout|port|step/.test(lower)) return 'theme-card-orange';
      if (/challenge|quiz|worksheet|trophy|innovation|future/.test(lower)) return 'theme-card-purple';
      if (/review|recap|badge|ready|success|clearance/.test(lower)) return 'theme-card-green';
      if (/data|table|matrix|spec|comparison/.test(lower)) return 'theme-card-teal';
      return 'theme-card-blue'; // Discovery, Narrative, Concept default
    },

    /**
     * Dynamic Title Synthesizer: Generates punchy, contextual titles from raw content
     * Strips static boilerplate prefixes and synthesizes meaningful headings.
     */
    synthesizeDynamicTitle(rawHeading, items = []) {
      if (rawHeading && typeof rawHeading === 'string') {
        let cleanHeading = rawHeading
          .replace(/^[📄\s]*\d+[:.–—-]\s*/, '')
          .replace(/^SECTION\s*\d+[:.–—-]?\s*/i, '')
          .replace(/^PHASE\s*\d+[:.–—-]?\s*/i, '')
          .replace(/^PAGE\s*\d+[:.–—-]?\s*/i, '')
          .replace(/^MISSION:\s*/i, '')
          .replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, '')
          .trim();

        if (cleanHeading.length > 3 && !/^SECTION\s*\d+$/i.test(cleanHeading)) {
          return cleanHeading.toUpperCase();
        }
      }

      // If no valid heading, synthesize from the first few items
      for (const item of items) {
        const text = item.text || item.normalizedText || '';
        if (item.type === 'CODE_BLOCK' || item.nodeType === 'CodeBlock') {
          return 'PROGRAMMING LOGIC & BLUEPRINT';
        }
        if (item.type === 'TABLE_BLOCK' || item.nodeType === 'Table') {
          return 'SYSTEM SPECIFICATIONS & MATRIX';
        }
        if (item.type === 'SAFETY_NOTE' || item.nodeType === 'CalloutBox') {
          return 'CRITICAL ENGINEERING CLEARANCE';
        }
        if (text.length > 10 && text.length < 80) {
          // Extract a 4-7 word summary phrase
          const words = text.split(/\s+/).slice(0, 6).join(' ');
          return words.toUpperCase().replace(/[.,;:]$/, '');
        }
      }

      return 'ENGINEERING INVESTIGATION';
    },

    /**
     * Stage 2: Analyzes Semantic Intent of Content Blocks
     */
    classifyBlockSemantics(headingText = '', items = []) {
      const combined = (headingText + ' ' + items.map(i => i.text || '').join(' ')).toLowerCase();

      if (/danger|warning|caution|hazard|common mistake|safety|debug/i.test(combined)) {
        return 'CALLOUT_ALERT';
      }
      if (/def |while |for |import |from machine|pin\(|print\(|```|logic|flowchart|pseudocode|blocks code/i.test(combined)) {
        return 'CODE_LOGIC';
      }
      if (/pin |vcc|gnd|gpio|sda|scl|port |volt|3\.3v|5v|wiring|connect |assembly|bracket|chassis/i.test(combined)) {
        return 'HARDWARE_SPEC';
      }
      if (/step \d+|connect sensor|plug in|power up|turn on|mount/i.test(combined)) {
        return 'PROCEDURE_STEP';
      }
      if (/question|quiz|predict|think like|challenge|worksheet|test your/i.test(combined)) {
        return 'CHALLENGE_ASSESSMENT';
      }
      if (/versus|\bvs\b|compare|contrast|difference between/i.test(combined)) {
        return 'COMPARISON';
      }
      if (/table|matrix|readings|benchmark|calibration|specifications/i.test(combined)) {
        return 'DATA_MATRIX';
      }
      if (/badge|award|completed|recap|summary|review table|beyond today/i.test(combined)) {
        return 'MILESTONE_RECAP';
      }
      if (/story|crisis|investigation|scenario|dispatch|commander nova|botanist/i.test(combined)) {
        return 'STORY_CONTEXT';
      }
      return 'THEORY_CONCEPT';
    },

    /**
     * Stage 3: Universal Structured Matter AST Generator
     * Converts canonical elements or raw text into a fully-typed hierarchical AST
     */
    buildStructuredMatterAST(canonicalResult) {
      if (!canonicalResult || !canonicalResult.canonicalElements) {
        throw new Error("SemanticSorter Error: Canonical elements are required to build AST.");
      }

      const elements = canonicalResult.canonicalElements;
      const sections = [];
      let activeSection = null;

      // Group into structural sections based on headers
      elements.forEach(elem => {
        if (elem.type === 'COVER_METADATA' || elem.type === 'MISSION_TITLE') {
          // Handled exclusively by the cover header banner, skip body AST
          return;
        }

        if (elem.type === 'SECTION_HEADER') {
          if (activeSection) {
            sections.push(activeSection);
          }
          activeSection = {
            headerElem: elem,
            rawHeading: elem.text,
            isPhase: elem.meta?.isPhase || false,
            phaseNum: elem.meta?.phaseNum || null,
            items: []
          };
        } else {
          if (!activeSection) {
            activeSection = {
              headerElem: null,
              rawHeading: 'OVERVIEW & DISCOVERY',
              isPhase: false,
              phaseNum: null,
              items: []
            };
          }
          activeSection.items.push(elem);
        }
      });
      if (activeSection) {
        sections.push(activeSection);
      }

      // Transform each section into a rich AST node with typed child tags
      const astSections = sections.map((sec, secIdx) => {
        const secId = sec.headerElem?.id || `M01.SEC.${String(secIdx + 1).padStart(3, '0')}`;
        const semanticCategory = this.classifyBlockSemantics(sec.rawHeading, sec.items);
        const dynamicTitle = this.synthesizeDynamicTitle(sec.rawHeading, sec.items);
        const icon = this.detectEmoji(dynamicTitle + ' ' + sec.rawHeading, semanticCategory);
        const theme = this.detectTheme(semanticCategory, dynamicTitle);

        // Convert child canonical elements into typed AST nodes
        const children = [];
        let activeBulletGroup = null;
        let activeKVGroup = null;

        const flushBulletGroup = () => {
          if (activeBulletGroup && activeBulletGroup.items.length > 0) {
            children.push(activeBulletGroup);
            activeBulletGroup = null;
          }
        };

        const flushKVGroup = () => {
          if (activeKVGroup && activeKVGroup.pairs.length > 0) {
            children.push(activeKVGroup);
            activeKVGroup = null;
          }
        };

        sec.items.forEach(item => {
          const text = item.text || '';

          // Special Structured Blocks
          if (item.type === 'RADIO_TRANSMISSION') {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'RadioTransmission',
              id: item.id,
              text: item.text,
              icon: '📻',
              title: 'RADIO TRANSMISSION'
            });
            return;
          }

          if (item.type === 'ASCII_BLUEPRINT') {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'AsciiBlueprint',
              id: item.id,
              text: item.text,
              icon: '📐',
              title: 'MECHANICAL ARCHWAY BLUEPRINT'
            });
            return;
          }

          if (item.type === 'CODE_COMPARISON') {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'CodeComparison',
              id: item.id,
              text: item.text,
              icon: '⚖️',
              title: 'LOGIC MYSTERY: NAIVE VS DEBOUNCED'
            });
            return;
          }

          if (item.type === 'BLOCK_CODE_SCRIPT') {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'BlockCodeScript',
              id: item.id,
              text: item.text,
              icon: '🧩',
              title: 'BLOCK CODE SCRIPT'
            });
            return;
          }

          if (item.type === 'TEST_RUN_LOG') {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'TestRunLog',
              id: item.id,
              text: item.text,
              icon: '🚦',
              title: 'COMMENCING ENTRY LANE TEST RUN'
            });
            return;
          }

          if (item.type === 'CLEARANCE_CERT') {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'ClearanceCert',
              id: item.id,
              text: item.text,
              icon: '🎖️',
              title: 'GREENFIELD GARAGE: 100% TRAFFIC PRECISION!'
            });
            return;
          }

          if (item.type === 'ILLUSTRATION_PROMPT') {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'IllustrationPrompt',
              id: item.id,
              text: item.text,
              icon: '🎨',
              prompt: item.text.replace(/^\s*\(\s*(?:Space for illustration|Illustration|Figure|Photo|Diagram|Screenshot)[:\s]+|\)\s*$/gi, '')
            });
            return;
          }

          // 1. Code Blocks
          if (item.type === 'CODE_BLOCK' || (sec.semanticCategory === 'CODE_LOGIC' && /^(?:from|import|def|while|for|if|class)\b/i.test(text))) {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'CodeBlock',
              id: item.id,
              language: item.meta?.language || 'python',
              code: text,
              lineNumbers: true
            });
            return;
          }

          // 2. Tables
          if (item.type === 'TABLE_BLOCK') {
            flushBulletGroup();
            flushKVGroup();
            const rawTable = item.meta?.rawTable || [];
            const headers = rawTable.length > 1 ? rawTable[0] : [];
            const rows = rawTable.length > 1 ? rawTable.slice(1) : rawTable;
            children.push({
              nodeType: 'Table',
              id: item.id,
              headers,
              rows,
              rawTable
            });
            return;
          }

          // 3. Safety & Warnings
          if (item.type === 'SAFETY_NOTE' || /^(?:WARNING|CAUTION|DANGER|SAFETY ALERT|HAZARD):/i.test(text)) {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'CalloutBox',
              id: item.id,
              variant: 'danger',
              icon: '🛑',
              title: 'LAB SAFETY WARNING',
              text: text.replace(/^(?:WARNING|CAUTION|DANGER|SAFETY ALERT|HAZARD):\s*/i, '')
            });
            return;
          }

          // 4. Pro-Tips & Engineering Notes
          if (item.type === 'ENGINEERING_NOTE' || /^(?:PRO TIP|ENGINEER TIP|NOTE|HINT|PRO-TIP):/i.test(text)) {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'CalloutBox',
              id: item.id,
              variant: 'tip',
              icon: '⭐',
              title: 'ENGINEER PRO-TIP',
              text: text.replace(/^(?:PRO TIP|ENGINEER TIP|NOTE|HINT|PRO-TIP):\s*/i, '')
            });
            return;
          }

          // 5. Assessment Questions & Challenges
          if (item.type === 'ASSESSMENT_QUESTION' || /^(?:Q\d+|Question\s*\d*|Challenge|Quiz|Predict|Think Like)[.:]/i.test(text)) {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'Challenge',
              id: item.id,
              icon: '🏆',
              question: text,
              answerLines: 2
            });
            return;
          }

          // 6. Procedure Steps
          if (item.type === 'PROCEDURE_STEP') {
            flushBulletGroup();
            flushKVGroup();
            children.push({
              nodeType: 'ProcedureStep',
              id: item.id,
              text,
              orderLocked: true
            });
            return;
          }

          // 7. Bullet Items (MUST have whitespace after bullet decorator)
          if (item.type === 'BULLET_ITEM' || /^[•\-\*✔✅☑☐□⭐▶\u2022\u25AA\u25CF]\s+/.test(text)) {
            flushKVGroup();
            if (!activeBulletGroup) {
              const bStyle = text.startsWith('✔') ? 'check' : text.startsWith('⭐') ? 'star' : text.startsWith('▶') ? 'arrow' : 'dot';
              activeBulletGroup = {
                nodeType: 'BulletList',
                id: item.id,
                bulletStyle: bStyle,
                items: []
              };
            }
            activeBulletGroup.items.push({
              id: item.id,
              text: text.replace(/^[•\-\*✔✅☑☐□⭐▶\u2022\u25AA\u25CF]\s+/, '').trim()
            });
            return;
          }
          flushBulletGroup();

          // 8. Key-Value specification patterns (strictly colon-separated specs, NOT code or notes)
          const isNonKV = /^(?:Note|Step|Challenge|Warning|Caution|Danger|Safety|Alert|Tip|Hint|Question|Activity|Task|Mission|Q\d+|http)/i.test(text);
          const isCodeSec = sec.semanticCategory === 'CODE_LOGIC' || /code|script|python|micropython/i.test(sec.dynamicTitle);
          const kvMatch = !isNonKV && !isCodeSec && text.match(/^([A-Za-z0-9\s/_\-]{2,25})\s*:\s*(.+)$/);

          if (kvMatch && kvMatch[2].length < 100 && !/^[•\-\*]/.test(text)) {
            if (!activeKVGroup) {
              activeKVGroup = {
                nodeType: 'KeyValuePairGroup',
                id: item.id,
                pairs: []
              };
            }
            activeKVGroup.pairs.push({
              key: kvMatch[1].trim(),
              value: kvMatch[2].trim(),
              icon: this.detectEmoji(kvMatch[1]),
              elementId: item.id
            });
            return;
          }
          flushKVGroup();

          // 9. Default Paragraph
          children.push({
            nodeType: 'Paragraph',
            id: item.id,
            text,
            lead: children.length === 0 && text.length > 80
          });
        });

        flushBulletGroup();
        flushKVGroup();

        return {
          nodeType: 'Section',
          id: secId,
          semanticCategory,
          dynamicTitle,
          icon,
          theme,
          rawHeading: sec.rawHeading,
          isPhase: sec.isPhase,
          phaseNum: sec.phaseNum,
          headerElem: sec.headerElem,
          children,
          sourceElements: sec.items
        };
      });

      return {
        missionId: canonicalResult.missionId || 'M01',
        sourceContentHash: canonicalResult.sourceContentHash,
        astSections
      };
    }
  };

  console.log("✅ SemanticSorter (Stage 1-3 Engine) Loaded.");
})();
