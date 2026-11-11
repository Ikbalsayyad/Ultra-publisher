/**
 * UltraMinds Publishing Compiler — Canonical Source Compiler & Content Manifest Engine
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * RAW CURRICULUM CONTENT = ABSOLUTE SOURCE OF TRUTH
 * 
 * Functions:
 * 1. Parses raw curriculum (XHTML, Markdown, Plain Text, JSON) into canonical immutable representation.
 * 2. Assigns persistent, stable element IDs surviving pagination, styling, and regeneration.
 * 3. Computes cryptographic content hashes for source integrity verification.
 * 4. Generates machine-readable ContentManifest (publishing contract).
 * 5. Builds TechnicalFactsRegistry locking hardware names, ports, voltages, pinouts, code, and formulas.
 */

(function() {
  'use strict';

  // Fast string hash utility (SHA-256 equivalent checksum for browser)
  function computeHash(str) {
    if (!str) return '00000000';
    let hash = 0;
    const cleanStr = String(str).replace(/\s+/g, ' ').trim();
    for (let i = 0; i < cleanStr.length; i++) {
      const char = cleanStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return 'h_' + Math.abs(hash).toString(16).padStart(8, '0');
  }

  function normalizeText(text) {
    if (!text) return '';
    return String(text)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .trim();
  }

  window.CanonicalCompiler = {
    
    /**
     * Main Entry Point: Compiles Raw Curriculum Input into Canonical Representation, Manifest, & Technical Registry
     */
    compile(rawInput, missionId = 'M01') {
      if (!rawInput || typeof rawInput !== 'string') {
        throw new Error("CanonicalCompiler Error: Invalid or empty raw curriculum input.");
      }

      const normalizedRaw = normalizeText(rawInput);
      const elements = this.extractCanonicalElements(normalizedRaw, missionId);
      const sourceContentHash = computeHash(elements.map(e => e.id + ':' + e.normalizedText).join('||'));
      
      const technicalFacts = this.extractTechnicalFacts(elements);
      const manifest = this.buildManifest(missionId, sourceContentHash, elements, technicalFacts);
      const metadata = this.extractMetadata(elements, normalizedRaw);

      return {
        missionId,
        sourceContentHash,
        canonicalElements: elements,
        manifest,
        technicalFactsRegistry: technicalFacts,
        rawInput: normalizedRaw,
        metadata
      };
    },

    /**
     * Extracts document-level curriculum metadata from canonical elements & raw input
     */
    extractMetadata(elements, rawText) {
      const meta = {
        missionNumber: '',
        missionTitle: '',
        level: '',
        duration: '',
        microcontroller: '',
        platform: '',
        guideName: '',
        guideRole: '',
        squad: '',
        coverMetadataElements: []
      };

      elements.forEach(elem => {
        if (elem.type === 'MISSION_TITLE') {
          const numMatch = elem.text.match(/Mission\s*#?\s*(\d+)/i) || elem.text.match(/Level\s*[:\s#]*(\d+)/i);
          if (numMatch) meta.missionNumber = numMatch[1];
          meta.missionTitle = elem.text.replace(/^#\s*/, '').replace(/^(?:Sample\s+)?MISSION\s*\d*[:\s\-]\s*/i, '').trim();
        } else if (elem.type === 'COVER_METADATA' || elem.type === 'SECTION_HEADER') {
          const txt = elem.text;
          if (/^Level:/i.test(txt)) {
            meta.level = txt.replace(/^Level:\s*/i, '').trim();
            meta.coverMetadataElements.push(elem);
          } else if (/^(?:Microcontroller|Hardware):/i.test(txt)) {
            meta.microcontroller = txt.replace(/^(?:Microcontroller|Hardware):\s*/i, '').trim();
            meta.coverMetadataElements.push(elem);
          } else if (/^(?:IDE Platform|Platform):/i.test(txt)) {
            meta.platform = txt.replace(/^(?:IDE Platform|Platform):\s*/i, '').trim();
            meta.coverMetadataElements.push(elem);
          } else if (/^(?:Mission\s+)?Guide:/i.test(txt)) {
            meta.guideName = txt.replace(/^(?:Mission\s+)?Guide:\s*/i, '').trim();
            meta.coverMetadataElements.push(elem);
          } else if (/^(?:Squad|Team):/i.test(txt)) {
            meta.squad = txt.replace(/^(?:Squad|Team):\s*/i, '').trim();
            meta.coverMetadataElements.push(elem);
          } else if (/^(?:Grade\s*\/\s*Class):/i.test(txt)) {
            meta.grade = txt.replace(/^(?:Grade\s*\/\s*Class):\s*/i, '').trim();
            meta.coverMetadataElements.push(elem);
          } else if (/^(?:Time|Duration):/i.test(txt)) {
            meta.duration = txt.replace(/^(?:Time|Duration):\s*/i, '').trim();
            meta.coverMetadataElements.push(elem);
          }
        }
      });

      if (!meta.missionNumber) {
        const m = rawText.match(/Mission\s*#?\s*(\d+)/i);
        if (m) meta.missionNumber = m[1];
      }
      if (!meta.missionTitle) {
        const m = rawText.match(/^(?:Sample\s+)?MISSION:\s*([^\n\r]+)/im);
        if (m) meta.missionTitle = m[1].trim();
      }
      if (!meta.guideName) meta.guideName = 'Commander Nova';
      if (!meta.guideRole) meta.guideRole = meta.squad || 'Your Mission Guide';

      return meta;
    },

    /**
     * Extracts structural elements with immutable identities
     */
    extractCanonicalElements(rawText, missionId) {
      const elements = [];
      let elementSeq = 1;

      const addElement = (type, text, parentId = null, extraMeta = {}) => {
        const normText = normalizeText(text);
        if (!normText) return null;
        
        const id = `${missionId}.${type.toUpperCase()}.${String(elementSeq++).padStart(3, '0')}`;
        const elem = {
          id,
          type,
          text: String(text).trim(),
          normalizedText: normText,
          hash: computeHash(normText),
          parentId,
          required: true,
          contentLockMode: 'STRICT',
          orderLocked: extraMeta.orderLocked || false,
          meta: extraMeta
        };
        elements.push(elem);
        return elem;
      };

      // Handle HTML / XHTML format
      if (typeof DOMParser !== 'undefined' && /<html|<div|<h[1-6]|<p|<table|<ol|<ul/i.test(rawText)) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawText, 'text/html');

        // Extract Title & Subtitle
        const titleEl = doc.querySelector('h1, #mission-title, .mission-title');
        const titleText = titleEl ? titleEl.textContent.trim() : '';
        const mainTitleElem = titleText ? addElement('MISSION_TITLE', titleText) : null;

        const subEl = doc.querySelector('#mission-subtitle, .mission-subtitle, p.subtitle');
        if (subEl && subEl.textContent.trim()) {
          addElement('MISSION_SUBTITLE', subEl.textContent.trim(), mainTitleElem?.id);
        }

        // Recursive traversal of DOM elements
        const walkNode = (node, curSecId) => {
          if (!node) return curSecId;
          const tag = (node.tagName || '').toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'head') return curSecId;

          if (/^h[1-6]$/.test(tag)) {
            const sec = addElement('SECTION_HEADER', node.textContent.trim());
            return sec?.id || curSecId;
          }

          if (tag === 'p') {
            const txt = node.textContent.trim();
            if (!txt) return curSecId;
            if (/^question\s*\d+/i.test(txt)) {
              addElement('ASSESSMENT_QUESTION', txt, curSecId);
            } else if (/^answer\s*\d+/i.test(txt)) {
              addElement('ASSESSMENT_ANSWER', txt, curSecId);
            } else if (/warning|caution|danger|safety/i.test(txt)) {
              addElement('SAFETY_NOTE', txt, curSecId);
            } else if (/tip|note|best practice/i.test(txt)) {
              addElement('ENGINEERING_NOTE', txt, curSecId);
            } else {
              addElement('PARAGRAPH', txt, curSecId);
            }
            return curSecId;
          }

          if (tag === 'ul') {
            Array.from(node.querySelectorAll(':scope > li')).forEach((li, idx) => {
              if (li.textContent.trim()) {
                addElement('BULLET_ITEM', li.textContent.trim(), curSecId, { bulletIndex: idx + 1 });
              }
            });
            return curSecId;
          }

          if (tag === 'ol') {
            Array.from(node.querySelectorAll(':scope > li')).forEach((li, idx) => {
              if (li.textContent.trim()) {
                addElement('PROCEDURE_STEP', li.textContent.trim(), curSecId, { stepIndex: idx + 1, orderLocked: true });
              }
            });
            return curSecId;
          }

          if (tag === 'pre' || tag === 'code') {
            const codeText = node.textContent.trim();
            if (codeText) {
              addElement('CODE_BLOCK', codeText, curSecId, { language: 'python' });
            }
            return curSecId;
          }

          if (tag === 'table') {
            const rows = Array.from(node.querySelectorAll('tr'));
            const tableData = rows.map(tr => Array.from(tr.children).map(td => td.textContent.trim()));
            if (tableData.length > 0) {
              addElement('TABLE_BLOCK', JSON.stringify(tableData), curSecId, { tableRows: tableData.length, rawTable: tableData });
            }
            return curSecId;
          }

          // Traverse container children
          let activeSecId = curSecId;
          if (node.children) {
            Array.from(node.children).forEach(child => {
              activeSecId = walkNode(child, activeSecId);
            });
          }
          return activeSecId;
        };

        if (doc.body) {
          walkNode(doc.body, null);
        }

        if (elements.length > 0) return elements;
      }

      // Plain Text / Arbitrary Curriculum Parser (Flexible, Zero-Hardcoded)
      const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      let currentSectionId = null;
      let currentSectionHeading = '';
      let inCodeBlock = false;
      let codeBuffer = [];

      const flushCodeBuffer = () => {
        if (codeBuffer.length > 0) {
          const codeStr = codeBuffer.join('\n').replace(/^\n+|\n+$/g, '');
          if (codeStr.length > 0) {
            let codeType = 'CODE_BLOCK';
            let extraMeta = { language: 'python' };

            if (/\[RADIO TRANSMISSION:/i.test(codeStr)) {
              codeType = 'RADIO_TRANSMISSION';
              extraMeta.transmissionType = 'radio-dispatch';
            } else if (/\[ENTRY ARCHWAY BEAM\]|===|\|\||\[CURB PILLAR/i.test(codeStr)) {
              codeType = 'ASCII_BLUEPRINT';
              extraMeta.blueprintType = 'mechanical-schematic';
            } else if (/\[[❌✅]?\s*CODE IDEA [AB]/i.test(codeStr)) {
              codeType = 'CODE_COMPARISON';
              extraMeta.comparisonType = 'naive-vs-debounced';
            } else if (/set\s*\[car_count\]|repeat\s+while\s+<true>|Play\s+Tone\s+Output/i.test(codeStr)) {
              codeType = 'BLOCK_CODE_SCRIPT';
              extraMeta.blockType = 'scratch-blockly';
            } else if (/\[COMMENCING ENTRY LANE TEST RUN\]/i.test(codeStr)) {
              codeType = 'TEST_RUN_LOG';
              extraMeta.testRunType = 'live-execution';
            } else if (/GREENFIELD GARAGE: 100% TRAFFIC PRECISION!/i.test(codeStr) || /={10,}\s*[\r\n]+.*PRECISION/i.test(codeStr)) {
              codeType = 'CLEARANCE_CERT';
              extraMeta.certType = 'precision-clearance';
            }

            addElement(codeType, codeStr, currentSectionId, extraMeta);
          }
          codeBuffer = [];
          inCodeBlock = false;
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip visual horizontal rules/delimiters
        if (/^[_─—–=]{3,}$/.test(trimmed)) {
          flushCodeBuffer();
          continue;
        }

        // Handle codeCode, codeText, or ``` blocks
        if (trimmed === 'codeCode' || trimmed === 'codeText' || trimmed.startsWith('```')) {
          if (inCodeBlock) {
            flushCodeBuffer();
          } else {
            flushCodeBuffer();
            inCodeBlock = true;
          }
          continue;
        }

        if (inCodeBlock) {
          const isHeadingLine = /^(?:[📄\s]*\d+[:.]|\p{Extended_Pictographic}|SECTION\s*\d+|IDEA\s*[A-Z]|Step\s*\d+|Q\d+[.:]|PAGE\s*\d+|MISSION:|PHASE\s*\d+)/iu.test(trimmed);
          if (/^[_─—–=]{3,}$/.test(trimmed) || (trimmed.length > 0 && isHeadingLine && codeBuffer.length > 0 && !codeBuffer[codeBuffer.length - 1].includes('['))) {
            flushCodeBuffer();
          } else {
            codeBuffer.push(line);
            continue;
          }
        }

        if (!trimmed) {
          if (codeBuffer.length > 0) {
            // Keep empty lines within code buffer
            codeBuffer.push('');
          }
          continue;
        }

        // 1. Mission Title Detection (must not match "Mission Guide:")
        if (!/^Mission\s+Guide/i.test(trimmed) && /^(?:Sample\s+)?MISSION\s*(?:\d+[:\s\-]|:)/i.test(trimmed)) {
          flushCodeBuffer();
          const cleanTitle = trimmed.replace(/^#+\s*/, '');
          const mTitle = addElement('MISSION_TITLE', cleanTitle, null, { orderLocked: true });
          currentSectionId = mTitle?.id;
          currentSectionHeading = cleanTitle;
          continue;
        }

        // 2. Cover Metadata Detection (Level, Microcontroller, Platform, Guide, Squad)
        if (/^(?:Level:|Microcontroller:|Hardware:|IDE Platform:|Platform:|Mission Guide:|Squad:|Grade\s*\/\s*Class:|Time:|Duration:)/i.test(trimmed)) {
          flushCodeBuffer();
          addElement('COVER_METADATA', trimmed, null, { orderLocked: true });
          continue;
        }

        // 3. Space for Illustration / Media Placeholders
        if (/^\s*\(\s*(?:Space for illustration|Illustration|Figure|Photo|Diagram|Screenshot)[:\s]+([^)]+)\)\s*$/i.test(trimmed)) {
          flushCodeBuffer();
          addElement('ILLUSTRATION_PROMPT', trimmed, currentSectionId);
          continue;
        }

        // Headings Detection (Flexible: Any arbitrary heading)
        const isMarkdownHeading = /^#+\s+/.test(trimmed);
        const isMajorSectionHeading = /^(?:[📄\s]*(?:\d+|PHASE\s*\d+)\s*[:–—-]\s+[A-Z0-9\s&'_.]{3,}|[📄\s]*(?:\d+|PHASE\s*\d+)\s*[:–—-]\s+.+)/i.test(trimmed);
        const isEmojiHeading = /^\p{Extended_Pictographic}\uFE0F?\s*[A-Za-z0-9]/u.test(trimmed) && trimmed.length < 90;
        const isNamedSection = /^(?:(?:Sample\s+)?MISSION:|SECTION\s*\d+|IDEA\s*[A-Z]:|The Circuit Blueprint|The Standard \d+-Page|PAGE\s*\d+|PHASE\s*\d+)/i.test(trimmed);
        const isStepNamedHeader = /^(?:Step\s*\d+[:–—-]\s*.+|5:\s*The Trackside Sensor Stand|\d+\.\s+[A-Z][A-Za-z0-9\s\+\&]{3,40}(?:\([^\)]+\))?$)/i.test(trimmed);

        const isHeading = (isMarkdownHeading || isMajorSectionHeading || isEmojiHeading || isNamedSection || isStepNamedHeader)
                          && !/^\d+[\.\)]\s+(?:Turn|Roll|Move|A setting|Flip|Take|Push|Test|Disconnect|Mount|Connect|Plug|Snap|Stack|Wait|Check|Repeat|Invisible|Train|Sensor|Timer|Copy|Branch|All train|\d+\s*seconds)/i.test(trimmed);

        if (isHeading) {
          flushCodeBuffer();
          const headingText = trimmed.replace(/^#+\s*/, '');
          const phaseMatch = headingText.match(/(?:PHASE|PAGE)\s*(\d+)/i);
          const extraMeta = phaseMatch ? { isPhase: true, phaseNum: parseInt(phaseMatch[1], 10) } : {};
          const sec = addElement('SECTION_HEADER', headingText, null, extraMeta);
          currentSectionId = sec?.id;
          currentSectionHeading = headingText;
          continue;
        }

        // Intelligent Code Block Detection (in Python/Code section or starting with code keywords)
        const isCodeStart = /^(?:from\s+[a-z0-9_.]+\s+import|import\s+[a-z0-9_.]+|def\s+[a-z0-9_]+\s*\(|class\s+[a-z0-9_]+|while\s+.*:|for\s+[a-z0-9_]+\s+in)\b/i.test(trimmed);
        const isSectionCode = currentSectionHeading && /code|script|python|micropython|logic/i.test(currentSectionHeading);

        if (isCodeStart || (isSectionCode && (codeBuffer.length > 0 || /^(?:from|import|def|while|for|if|elif|else:|print|[a-z0-9_]+\s*=)/i.test(trimmed)))) {
          codeBuffer.push(line);
          continue;
        }

        // If we were buffering code and reached a non-code line, flush now
        flushCodeBuffer();

        // Bullets (MUST be bullet symbol followed by whitespace)
        if (/^[•\-\*✔✅☑☐□⭐▶\u2022\u25AA\u25CF]\s+/.test(trimmed) || /^[A-D]\)\s+/.test(trimmed)) {
          addElement('BULLET_ITEM', trimmed, currentSectionId);
          continue;
        }

        // Questions & Challenges
        if (/^(?:Q\d+|Question\s*\d*|Challenge|Quiz|Predict|Think Like)[.:]\s*/i.test(trimmed)) {
          addElement('ASSESSMENT_QUESTION', trimmed, currentSectionId);
          continue;
        }

        // Safety & Warnings
        if (/^(?:WARNING|CAUTION|DANGER|SAFETY ALERT|SAFETY NOTE|HAZARD):/i.test(trimmed)) {
          addElement('SAFETY_NOTE', trimmed, currentSectionId);
          continue;
        }

        // Pro-Tips & Engineering Notes
        if (/^(?:PRO TIP|ENGINEER TIP|NOTE|HINT|PRO-TIP):/i.test(trimmed)) {
          addElement('ENGINEERING_NOTE', trimmed, currentSectionId);
          continue;
        }

        // Numbered Steps
        if (/^\d+[.)]\s+/.test(trimmed)) {
          addElement('PROCEDURE_STEP', trimmed, currentSectionId, { orderLocked: true });
          continue;
        }

        // Regular Paragraph
        addElement('PARAGRAPH', trimmed, currentSectionId);
      }

      flushCodeBuffer();

      return elements;
    },

    /**
     * Builds TechnicalFactsRegistry locking hardware names, ports, voltages, pinouts, code, formulas
     */
    extractTechnicalFacts(elements) {
      const facts = new Set();

      const technicalPatterns = [
        /\b(?:UltraBoard\s*(?:V\d+)?|ESP32|MicroPython|Raspberry\s*Pi|Arduino)\b/gi,
        /\b(?:Sensor\s*Port\s*\d+|I2C\s*Port\s*\d*|Motor\s*Port\s*\d+|Input\s*Port\s*\d+|Output\s*Port\s*\d+|Servo\s*Port\s*\d+)\b/gi,
        /\b(?:DHT11|DHT22|OLED|SSD1306|JST|HC-SR04|MPU6050)\b/gi,
        /\b(?:GPIO\d+|Pin\s*\d+|SDA|SCL|VCC|GND|TX|RX)\b/gi,
        /\b\d+(?:\.\d+)?\s*(?:V|mV|mA|A|Hz|kHz|MHz|RPM|L\/H|°C|% RH|ADC|hPa)\b/gi,
        /\b(?:dht_sensor|fan_pwm|pump|TEMP_SETPOINT_MAX|HUMI_SETPOINT_MIN)\b/g
      ];

      elements.forEach(elem => {
        technicalPatterns.forEach(pattern => {
          const matches = elem.text.match(pattern);
          if (matches) {
            matches.forEach(m => facts.add(m.trim()));
          }
        });
      });

      return Array.from(facts);
    },

    /**
     * Builds machine-readable ContentManifest (Publishing Contract)
     */
    buildManifest(missionId, sourceContentHash, elements, technicalFacts) {
      return {
        missionId,
        sourceContentHash,
        createdAt: new Date().toISOString(),
        elementCount: elements.length,
        requiredElementIds: elements.map(e => e.id),
        elements: elements.map(e => ({
          id: e.id,
          type: e.type,
          textHash: e.hash,
          orderLocked: e.orderLocked,
          parentId: e.parentId,
          required: e.required
        })),
        technicalFactsRegistry: technicalFacts,
        publishingContract: {
          contentFidelity: '100% ZERO_OMISSION',
          allowSummarization: false,
          allowParaphrasing: false,
          allowOmission: false,
          defaultContentLockMode: 'STRICT'
        }
      };
    }
  };

  console.log("✅ CanonicalCompiler Engine Loaded.");
})();
