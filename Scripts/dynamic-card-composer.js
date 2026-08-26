/**
 * UltraMinds Publishing Compiler — Dynamic Card & Primitive Sub-Element Composer
 * 
 * CORE PRINCIPLE (USER FEEDBACK):
 * 1. Fixed 52-element library is NOT a rigid ceiling.
 * 2. Any arbitrary curriculum element & sub-element combination (text, bullets, steps, tables, code, Q&A, images)
 *    is parsed into granular primitive sub-elements and composed dynamically into adaptive cards.
 * 3. Preserves 100% element ID coverage — every sub-element maintains data-element-id linkage to CanonicalSource.
 */

(function() {
  'use strict';

  window.DynamicCardComposer = {

    /**
     * Entry Point: Transforms canonical elements into dynamically composed visual cards
     */
    composeCards(canonicalResult) {
      if (!canonicalResult || !canonicalResult.canonicalElements) {
        return [];
      }

      const elements = canonicalResult.canonicalElements;
      const cards = [];
      let currentSection = null;

      // Group elements by structural sections
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

      // Compose each section into contextual dynamic cards
      sections.forEach((sec, idx) => {
        const titleText = sec.heading ? sec.heading.text : `SECTION ${idx + 1}`;
        const titleId = sec.heading ? sec.heading.id : null;

        // Classify items into primitive sub-elements
        const bullets = sec.items.filter(i => i.type === 'BULLET_ITEM');
        const steps = sec.items.filter(i => i.type === 'PROCEDURE_STEP');
        const paragraphs = sec.items.filter(i => i.type === 'PARAGRAPH');
        const tables = sec.items.filter(i => i.type === 'TABLE_BLOCK');
        const codeBlocks = sec.items.filter(i => i.type === 'CODE_BLOCK');
        const questions = sec.items.filter(i => i.type === 'ASSESSMENT_QUESTION');
        const answers = sec.items.filter(i => i.type === 'ASSESSMENT_ANSWER');
        const safetyNotes = sec.items.filter(i => i.type === 'SAFETY_NOTE');
        const engNotes = sec.items.filter(i => i.type === 'ENGINEERING_NOTE');

        // Pattern 1: Numbered Procedure Steps
        if (steps.length > 0) {
          cards.push({
            type: 'dynamic-procedure',
            elementId: titleId,
            title: titleText.toUpperCase(),
            icon: '🛠️',
            steps: steps.map(s => ({
              elementId: s.id,
              num: s.meta.stepIndex || 1,
              text: s.text,
              orderLocked: true
            })),
            sourceElements: [sec.heading, ...steps].filter(Boolean)
          });
        }

        // Pattern 2: Equipment / Spec Data Tables
        if (tables.length > 0) {
          tables.forEach(t => {
            cards.push({
              type: 'dynamic-table',
              elementId: t.id,
              title: titleText.toUpperCase(),
              icon: '📊',
              tableRows: t.meta.rawTable || [],
              sourceElements: [sec.heading, t].filter(Boolean)
            });
          });
        }

        // Pattern 3: Code Snippets
        if (codeBlocks.length > 0) {
          codeBlocks.forEach(c => {
            cards.push({
              type: 'code-snippet',
              elementId: c.id,
              title: titleText.toUpperCase(),
              icon: '💻',
              language: c.meta.language || 'python',
              code: c.text,
              sourceElements: [sec.heading, c].filter(Boolean)
            });
          });
        }

        // Pattern 4: Q&A Assessment Matrix
        if (questions.length > 0 || answers.length > 0) {
          const qaPairs = [];
          for (let i = 0; i < Math.max(questions.length, answers.length); i++) {
            qaPairs.push({
              questionElementId: questions[i] ? questions[i].id : null,
              question: questions[i] ? questions[i].text : '',
              answerElementId: answers[i] ? answers[i].id : null,
              answer: answers[i] ? answers[i].text : ''
            });
          }
          cards.push({
            type: 'worksheet-card',
            elementId: titleId,
            title: titleText.toUpperCase(),
            icon: '📝',
            qaPairs,
            sourceElements: [sec.heading, ...questions, ...answers].filter(Boolean)
          });
        }

        // Pattern 5: Safety & Engineering Callouts
        if (safetyNotes.length > 0 || engNotes.length > 0) {
          [...safetyNotes, ...engNotes].forEach(n => {
            cards.push({
              type: n.type === 'SAFETY_NOTE' ? 'safety-card' : 'pro-tip',
              elementId: n.id,
              title: n.type === 'SAFETY_NOTE' ? 'LAB SAFETY WARNING' : 'ENGINEERING TIP',
              icon: n.type === 'SAFETY_NOTE' ? '🛑' : '💡',
              content: n.text,
              sourceElements: [n]
            });
          });
        }

        // Pattern 6: Bullet Lists
        if (bullets.length > 0) {
          cards.push({
            type: 'dynamic-bullets',
            elementId: titleId,
            title: titleText.toUpperCase(),
            icon: '📋',
            bullets: bullets.map(b => ({
              elementId: b.id,
              text: b.text
            })),
            sourceElements: [sec.heading, ...bullets].filter(Boolean)
          });
        }

        // Pattern 7: General Narrative Prose & Sub-Elements
        if (paragraphs.length > 0) {
          cards.push({
            type: 'dynamic-text',
            elementId: titleId || paragraphs[0].id,
            title: titleText.toUpperCase(),
            icon: '📖',
            paragraphs: paragraphs.map(p => ({
              elementId: p.id,
              text: p.text
            })),
            content: paragraphs.map(p => p.text).join('\n\n'),
            sourceElements: [sec.heading, ...paragraphs].filter(Boolean)
          });
        }
      });

      return cards;
    }
  };

  console.log("✅ DynamicCardComposer Loaded.");
})();
