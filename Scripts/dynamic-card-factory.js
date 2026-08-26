/**
 * UltraMinds DynamicCardFactory V1
 * Auto-creates best-fit card types for ANY content block.
 * Never drops, rewrites, or modifies input text — only arranges.
 */

window.DynamicCardFactory = {

  // ─── 8 Universal Dynamic Card Types ─────────────────────
  DYNAMIC_TYPES: [
    'dynamic-text',
    'dynamic-bullets',
    'dynamic-image',
    'dynamic-subheader',
    'dynamic-table',
    'dynamic-mixed',
    'dynamic-capsule',
    'dynamic-comparison',
    'dynamic-synthesized'
  ],

  // ─── Keyword Scoring Matrix ───────────────────────────────
  TYPE_KEYWORDS: {
    'mission-story':      ['story', 'brief', 'background', 'context', 'mission', 'scenario', 'narrative', 'introduction', 'intro', 'overview', 'product preview', 'commander nova', 'emergency request'],
    'real-world':         ['real world', 'application', 'used in', 'industry', 'why important', 'importance', 'benefit', 'impact', 'use case', 'real world connection', 'designer studio'],
    'curiosity-box':      ['curiosity', 'fun fact', 'did you know', 'interesting', 'amazing', 'wow', 'surprise', 'cool fact', 'curiosity box'],
    'did-you-know':       ['did you know', 'fact', 'science fact', 'trivia', 'knowledge', 'behind the scenes'],
    'stem-fact':          ['stem fact', 'tech fact', 'fact box', 'engineering fact', 'science', 'engineering concept'],
    'mission-objectives': ['objective', 'goal', 'you will', 'learn to', 'target', 'aim', 'purpose', 'mission goal', 'final product', 'engineering capabilities'],
    'think-engineer':     ['think like', 'engineering thinking', 'critical thinking', 'problem solving', 'scenario', 'design thinking', 'think like an engineer'],
    'observe-card':       ['observe', 'look', 'notice', 'identify', 'explore', 'examine', 'inspect', 'see', 'student activity', 'understanding smart'],
    'component-spotlight':['component', 'sensor', 'module', 'device', 'hardware', 'dht', 'bmp', 'mpu', 'hc-sr', 'ultraboard ports used', 'components required'],
    'inside-sensor':      ['inside', 'how it works', 'mechanism', 'internal', 'technical detail', 'working principle', 'inside the sensor'],
    'comparison-vs':      ['compare', 'versus', ' vs ', 'difference', 'human vs', 'traditional vs', 'old vs', 'before vs'],
    'heroes-grid':        ['hero', 'meet', 'today\'s heroes', 'components', 'team', 'players', 'key parts'],
    'build-steps':        ['step 1', 'step 2', 'step 3', 'step 4', 'connect', 'wire', 'assembly', 'build', 'setup', 'hardware assembly'],
    'in-this-lab':        ['in this lab', 'lab objective', 'you will build', 'we will'],
    'pro-tip':            ['pro tip', 'tip', 'hint', 'remember', 'important', 'note', 'warning', 'caution', 'engineering tip', 'engineering habit'],
    'common-mistakes':    ['common mistakes', 'debug lab', 'possible reasons', 'wrong threshold', 'pump never', 'wrong moisture', 'problem pump'],
    'flowchart-sequence': ['flow', 'flowchart', 'process', 'algorithm', 'sequence', 'step by step', 'procedure', 'engineering flow', 'automation logic', 'program logic', 'blocks studio'],
    'code-snippet':       ['code', 'python', 'arduino', 'script', 'program', 'function', 'variable', 'import', 'def ', 'void ', '#include'],
    'variables-at-work':  ['variable', 'data', 'store', 'memory', 'value', 'assign', 'global', 'local'],
    'predict-think':      ['predict', 'what if', 'what will happen', 'guess', 'think', 'hypothesis'],
    'challenge-box':      ['challenge', 'try this', 'extension', 'advanced', 'bonus', 'extra', 'mini design challenge'],
    'mini-upgrade':       ['upgrade', 'enhance', 'add feature', 'improve', 'expand', 'next level', 'product upgrade'],
    'engineers-everywhere':['engineers use', 'used everywhere', 'industry application', 'real use', 'where is this', 'engineering world'],
    'mission-review-table':['review', 'recap', 'summary', 'what did', 'conclusion', 'what we learned', 'test 01', 'test 02', 'test 03', 'testing lab', 'product showcase'],
    'ultra-badge':        ['badge', 'reward', 'congratulation', 'complete', 'achievement', 'well done', 'great job', 'badge earned'],
    'beyond-mission':     ['next mission', 'future', 'coming next', 'what\'s next', 'beyond', 'continuation'],
    'vocabulary-builder': ['vocabulary', 'glossary', 'terms', 'definition', 'meaning', 'dictionary', 'word'],
    'knowledge-check':    ['question', 'quiz', 'test', 'answer', 'check', 'assessment', 'hardware checklist'],
    'image-holder':       ['image', 'photo', 'picture', 'diagram', 'illustration', 'figure', 'chart', 'schematic', 'hero image', 'final hero image'],
    'dynamic-subheader':  [], // fallback for h2/h3 headings
    'dynamic-table':      ['table', 'row', 'column', 'comparison table', '| '],
    'dynamic-comparison': ['vs', 'compare', 'pros', 'cons', 'advantages', 'disadvantages'],
    'dynamic-bullets':    ['•', '-', '*', 'list', 'points', 'items', 'mit features', 'iot features'],
    'dynamic-mixed':      [],  // ultimate fallback
    'dynamic-text':       [],  // for long plain text paragraphs
    'dynamic-capsule':    ['key point', 'highlight', 'important note', 'takeaway', 'summary point', 'customer'],
  },

  /**
   * Score a text block against all card types.
   * Returns the best-matching card type name.
   */
  detect(text, context = '') {
    if (!text) return 'dynamic-text';
    const lower = (text + ' ' + context).toLowerCase();

    let bestType = 'dynamic-text';
    let bestScore = 0;

    for (const [type, keywords] of Object.entries(this.TYPE_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) {
          // Weight longer keyword matches higher
          score += kw.length > 10 ? 3 : kw.length > 5 ? 2 : 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    }

    // Override detection for structural cues
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // Detect flowchart sequences (contains ↓ or → or flow title)
    if (text.includes('↓') || text.includes('→') || /engineering flow|information flow|program logic|water now button|auto mode switch|flow of/i.test(context + ' ' + text)) {
      return 'flowchart-sequence';
    }

    // Detect checkbox list blocks (☐ or □ or [ ])
    if (/[\u2610\u25A1\u2611\u2612]|\[\s*\]/i.test(text)) {
      return 'knowledge-check';
    }

    // Detect test results (Test 01, Test 02, Expected Result)
    if (/test\s*\d+|expected\s+result|insert sensor|press water/i.test(text)) {
      return 'mission-review-table';
    }

    // Detect heading-only blocks → subheader
    if (lines.length === 1 && lines[0].length < 80 && /^#+\s/.test(lines[0])) {
      return 'dynamic-subheader';
    }

    // Detect bullet-heavy blocks
    const bulletCount = lines.filter(l => /^[•\-\*\d\.]\s/.test(l)).length;
    if (bulletCount >= 3 && bulletCount / lines.length > 0.5) {
      return 'dynamic-bullets';
    }

    // Detect table-like blocks (markdown tables)
    const tableRows = lines.filter(l => l.includes('|')).length;
    if (tableRows >= 2) {
      return 'dynamic-table';
    }

    // Detect code blocks
    if (/```|def |import |void |#include|print\(/.test(text)) {
      return 'code-snippet';
    }

    // Detect comparison pairs (Left/Right, A/B, pros/cons)
    if (/\|\s*[\w\s]+\s*\|\s*[\w\s]+\s*\|/.test(text) ||
        (lower.includes('pros') && lower.includes('cons')) ||
        (lower.includes('advantage') && lower.includes('disadvantage'))) {
      return 'dynamic-comparison';
    }

    // If best score is 0 and it's a long paragraph → dynamic-text
    if (bestScore === 0) {
      if (lines.length > 4) return 'dynamic-text';
      return 'dynamic-mixed';
    }

    return bestType;
  },

  /**
   * Smart Universal Synthesizer:
   * Accepts ANY novel/unseen card heading and matter, analyzes internal structure,
   * selects an appropriate semantic icon, constructs all sub-elements (subcards,
   * lists, key-value rows, callouts), and guarantees ZERO content omission.
   */
  synthesizeNovelCard(heading = '', text = '') {
    const rawHeading = (heading || '').replace(/^#+\s*/, '').replace(/^🟦\s*PAGE\s*\d+\s*[-—–]*\s*/i, '').trim() || 'FEATURE CARD';
    const rawText = (text || '').trim();

    // 1. Semantic Emoji Icon Auto-Detection
    const lowerHead = (rawHeading + ' ' + rawText).toLowerCase();
    let icon = '📌';
    if (/circuit|wire|power|volt|current|pin/.test(lowerHead)) icon = '⚡';
    else if (/sensor|detect|measure|read|dht|temperature|humidity/.test(lowerHead)) icon = '🌡️';
    else if (/code|script|program|block|python|arduino/.test(lowerHead)) icon = '💻';
    else if (/logic|think|decision|algorithm|reason/.test(lowerHead)) icon = '🧠';
    else if (/lab|test|experiment|safety|protocol/.test(lowerHead)) icon = '🧪';
    else if (/build|assemble|step|hardware|setup|connect/.test(lowerHead)) icon = '🛠️';
    else if (/data|cloud|table|matrix|network|wifi|m2m/.test(lowerHead)) icon = '📊';
    else if (/robot|motor|actuator|machine|automation/.test(lowerHead)) icon = '🤖';
    else if (/world|farm|factory|hospital|industry|real/.test(lowerHead)) icon = '🌍';
    else if (/goal|target|objective|aim/.test(lowerHead)) icon = '🎯';
    else if (/warning|mistake|error|issue|problem|debug/.test(lowerHead)) icon = '⚠️';
    else if (/tip|note|remember|curiosity|fact/.test(lowerHead)) icon = '💡';
    else if (/upgrade|next|future|beyond|challenge/.test(lowerHead)) icon = '🚀';

    // 2. Extract Structural Sub-Elements from Matter
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const subcards = [];
    const bullets = [];
    const pairs = [];
    const callouts = [];
    let codeText = '';
    let bulletStyle = '✔';

    if (rawText.includes('☐') || rawText.includes('□') || rawText.includes('[ ]')) bulletStyle = '☐';
    else if (rawText.includes('⭐')) bulletStyle = '⭐';
    else if (rawText.includes('▶')) bulletStyle = '▶';
    else if (rawText.includes('•')) bulletStyle = '•';

    let currentStep = null;

    for (const line of lines) {
      const pairMatch = line.match(/^([A-Z0-9\s\&\'\-\_\.]{2,30})\s*[:=]\s*(.+)$/i);
      if (pairMatch && !/^(note|tip|warning|step|http)/i.test(pairMatch[1])) {
        pairs.push({ key: pairMatch[1].trim(), value: pairMatch[2].trim() });
        continue;
      }

      const stepMatch = line.match(/^(?:Step|Phase|Part|Section)\s*\d+[:\.\)]?\s*(.*)$/i);
      if (stepMatch) {
        if (currentStep) subcards.push(currentStep);
        currentStep = { title: line.toUpperCase(), body: stepMatch[1] || 'Details...' };
        continue;
      }

      const calloutMatch = line.match(/^(Note|Warning|Tip|Caution|Important|Remember)[:\s]\s*(.+)$/i);
      if (calloutMatch) {
        callouts.push({
          icon: /warning|caution/i.test(calloutMatch[1]) ? '⚠️' : '💡',
          text: calloutMatch[2].trim()
        });
        continue;
      }

      if (/^[•\-\*✔✅☑☐□⭐▶\d+\.]\s*/.test(line)) {
        bullets.push(line.replace(/^[•\-\*✔✅☑☐□⭐▶\d+\.]\s*/, '').trim());
        continue;
      }

      if (currentStep) {
        currentStep.body += (currentStep.body ? ' ' : '') + line;
      }
    }

    if (currentStep) subcards.push(currentStep);

    const codeMatch = rawText.match(/```[\s\S]*?```/);
    if (codeMatch) codeText = codeMatch[0].replace(/```\w*\n?/g, '').trim();

    return {
      type: 'dynamic-synthesized',
      title: rawHeading,
      icon,
      content: rawText,
      bullets: bullets.length > 0 ? bullets : undefined,
      bulletStyle,
      subcards: subcards.length > 0 ? subcards : undefined,
      pairs: pairs.length > 0 ? pairs : undefined,
      callouts: callouts.length > 0 ? callouts : undefined,
      codeText: codeText || undefined,
    };
  },

  /**
   * Build a complete section object for LayoutEngine.renderSection()
   * from a raw text block. Never generates content — only structures it.
   */
  build(block) {
    const { text, heading, type: forcedType } = block;

    // Check if text is a raw JSON string
    if (typeof text === 'string') {
      const trimmed = text.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.type) {
            if (!parsed.title && heading) parsed.title = heading;
            return parsed;
          }
        } catch (e) {}
      }
    }

    const type = forcedType || this.detect(text, heading);

    // Shared base
    const base = {
      type,
      title: (heading || '').replace(/^#+\s*/, '').trim() || this._guessTitle(type),
      icon: this._iconForType(type),
    };

    // Type-specific building
    switch (type) {
      case 'dynamic-bullets':
      case 'real-world':
      case 'mission-objectives':
      case 'in-this-lab':
      case 'predict-think': {
        const bullets = this._extractBullets(text);
        const nonBullet = this._extractNonBulletText(text);
        return {
          ...base,
          items: type === 'predict-think' ? bullets : undefined,
          questions: type === 'predict-think' ? bullets : undefined,
          objectives: type === 'mission-objectives' ? bullets.map((b, i) => ({ num: i+1, text: b, icon: this._numIcon(i) })) : undefined,
          bullets: ['dynamic-bullets', 'real-world', 'in-this-lab'].includes(type) ? bullets : undefined,
          content: nonBullet || undefined,
          bottomNote: undefined,
        };
      }

      case 'dynamic-text':
      case 'mission-story':
      case 'curiosity-box':
      case 'did-you-know':
      case 'pro-tip':
      case 'challenge-box':
      case 'dynamic-capsule':
      case 'vocabulary-builder':
      case 'engineer-tip':
      case 'reflection-card':
      case 'my-notes':
      case 'home-challenge':
      case 'parent-connect':
      case 'teacher-notes':
      case 'next-preview':
      case 'mini-challenge':
      case 'portfolio-task':
      case 'career-spotlight':
      case 'future-tech':
      case 'safety-card':
        return { ...base, content: text };

      case 'dynamic-subheader':
        return {
          ...base,
          type: 'dynamic-subheader',
          title: (heading || text).replace(/^#+\s*/, '').trim(),
          content: text.replace(/^#+\s*[^\n]*\n?/, '').trim() || '',
        };

      case 'dynamic-comparison':
      case 'comparison-vs': {
        const sides = this._extractComparison(text);
        return {
          ...base,
          leftTitle: sides.leftTitle,
          rightTitle: sides.rightTitle,
          leftItems: sides.leftItems.map(i => ({ icon: '✅', text: i })),
          rightItems: sides.rightItems.map(i => ({ icon: '✅', text: i })),
          bottomNote: sides.bottomNote,
          content: !sides.leftItems.length ? text : undefined,
        };
      }

      case 'dynamic-table': {
        const table = this._parseMarkdownTable(text);
        return {
          ...base,
          tableHeaders: table.headers,
          tableRows: table.rows,
          content: !table.rows.length ? text : undefined,
        };
      }

      case 'code-snippet':
      case 'programming-studio':
        return { ...base, code: this._extractCode(text), language: this._detectLanguage(text) };

      case 'common-mistakes':
      case 'debug-corner': {
        const mistakes = this._extractMistakePairs(text);
        return { ...base, mistakes, content: !mistakes.length ? text : undefined };
      }

      case 'heroes-grid': {
        const heroes = this._extractHeroItems(text);
        return { ...base, heroes, content: text };
      }

      case 'build-steps': {
        const steps = this._extractSteps(text);
        return { ...base, steps, content: text };
      }

      case 'flowchart-sequence': {
        const steps = this._extractFlowSteps(text);
        return { ...base, steps, loopNote: '', content: text };
      }

      case 'mission-review-table': {
        const rows = this._extractReviewRows(text);
        return { ...base, rows, content: text };
      }

      case 'engineers-everywhere': {
        const industries = this._extractIndustries(text);
        return { ...base, industries, content: text };
      }

      case 'knowledge-check': {
        const questions = this._extractQuestions(text);
        return { ...base, questions, content: text };
      }

      case 'image-holder':
        return { ...base, imgUrl: '', caption: text || heading, content: text };

      case 'dynamic-mixed':
      default: {
        const bullets = this._extractBullets(text);
        return {
          ...base,
          type: 'dynamic-mixed',
          content: text,
          bullets: bullets.length >= 1 ? bullets : undefined,
        };
      }
    }
  },

  // ─── Private Helpers ─────────────────────────────────────

  _extractBullets(text) {
    if (!text) return [];
    return text.split('\n')
      .map(l => l.replace(/^[\s•\-\*\d\.]+\s*/, '').trim())
      .filter(l => l.length >= 1 && !/^[🖼📸📷🎨🚀🟦🎯🧠🔧📱🌐⭐]/.test(l));
  },

  _extractNonBulletText(text) {
    if (!text) return '';
    return text.split('\n')
      .filter(l => !/^[\s•\-\*\d\.]/.test(l))
      .join(' ').trim();
  },

  _extractQuestions(text) {
    return (text || '').split('\n')
      .map(l => l.replace(/^[\s\dQ\.\)\:\-]+/, '').trim())
      .filter(l => l.endsWith('?') && l.length > 8);
  },

  _extractCode(text) {
    const codeBlock = text.match(/```[\s\S]*?```/);
    if (codeBlock) return codeBlock[0].replace(/```\w*\n?/g, '').trim();
    const indented = text.split('\n').filter(l => l.startsWith('    ') || l.startsWith('\t'));
    if (indented.length > 2) return indented.join('\n').trim();
    return text;
  },

  _detectLanguage(text) {
    if (/import |def |print\(/.test(text)) return 'python';
    if (/void |#include|Serial\./.test(text)) return 'arduino';
    if (/function |const |let |var /.test(text)) return 'javascript';
    return 'code';
  },

  _extractComparison(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let leftTitle = 'OPTION A', rightTitle = 'OPTION B';
    const leftItems = [], rightItems = [];
    let bottomNote = '';
    let side = 'left';

    for (const line of lines) {
      if (/^#+\s/.test(line) || /:\s*$/.test(line)) {
        if (leftItems.length === 0) leftTitle = line.replace(/^#+\s*|:\s*$/g, '').trim();
        else rightTitle = line.replace(/^#+\s*|:\s*$/g, '').trim();
        side = leftItems.length === 0 ? 'left' : 'right';
        continue;
      }
      if (/^[•\-\*]\s/.test(line)) {
        const item = line.replace(/^[•\-\*]\s*/, '').trim();
        if (side === 'left') leftItems.push(item);
        else rightItems.push(item);
      } else if (line.toLowerCase().startsWith('note:') || line.toLowerCase().startsWith('conclusion:')) {
        bottomNote = line;
      }
    }

    return { leftTitle, rightTitle, leftItems, rightItems, bottomNote };
  },

  _parseMarkdownTable(text) {
    const lines = text.split('\n').filter(l => l.includes('|'));
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const dataLines = lines.filter((l, i) => i > 0 && !l.replace(/[\|\-\s]/g, ''));
    const rows = lines.slice(2).map(l => l.split('|').map(c => c.trim()).filter(Boolean));

    return { headers, rows: rows.filter(r => r.length > 0) };
  },

  _extractMistakePairs(text) {
    const mistakes = [];
    const lines = text.split('\n').filter(l => l.trim().length > 4);
    for (let i = 0; i < lines.length - 1; i++) {
      if (/wrong|loose|incorrect|not|missing|issue|problem|avoid|error/i.test(lines[i])) {
        mistakes.push({
          icon: '⚠️',
          issue: lines[i].replace(/^[\s•\-\*\d\.\)]+/, '').trim(),
          fix: lines[i+1] ? lines[i+1].replace(/^[\s•\-\*\d\.\)]+/, '').trim() : 'Check carefully.'
        });
        i++; // skip the fix line
      }
    }
    // If no pairs found, try treating pairs of lines
    if (!mistakes.length) {
      for (let i = 0; i < lines.length; i += 2) {
        if (lines[i] && lines[i+1]) {
          mistakes.push({ icon: '⚠️', issue: lines[i].replace(/^[\s•\-\*\d\.\)]+/, '').trim(), fix: lines[i+1].replace(/^[\s•\-\*\d\.\)]+/, '').trim() });
        }
      }
    }
    return mistakes.slice(0, 6);
  },

  _extractHeroItems(text) {
    const heroes = [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let current = null;
    for (const line of lines) {
      if (line.length < 50 && !/^[•\-\*]/.test(line) && /^[A-Z]/.test(line)) {
        if (current) heroes.push(current);
        current = { name: line, icon: '🦸', quote: '', uses: [] };
      } else if (current) {
        if (line.startsWith('"') || line.startsWith('"')) current.quote = line.replace(/^[""]+|[""]+$/g, '');
        else if (/used in|use:/i.test(line)) current.uses.push(line.replace(/used in:|use:/i, '').trim());
        else if (/^[•\-\*]/.test(line)) current.uses.push(line.replace(/^[•\-\*]\s*/, '').trim());
      }
    }
    if (current) heroes.push(current);
    return heroes.slice(0, 6);
  },

  _extractSteps(text) {
    const steps = [];
    const lines = text.split('\n');
    const stepMatches = [...text.matchAll(/(?:Step\s*)?(\d+)[:\.\)]\s*([^\n]{5,80})/gi)];
    if (stepMatches.length >= 2) {
      return stepMatches.slice(0, 6).map(m => ({
        stepNum: parseInt(m[1]),
        title: m[2].trim().toUpperCase(),
        desc: m[2].trim(),
        pinTable: []
      }));
    }
    // Fallback: treat each non-empty line as a step
    return lines.filter(l => l.trim().length > 5).slice(0, 6).map((l, i) => ({
      stepNum: i + 1,
      title: l.replace(/^[\s\-•\*\d\.\)]+/, '').trim().toUpperCase(),
      desc: l.replace(/^[\s\-•\*\d\.\)]+/, '').trim(),
      pinTable: []
    }));
  },

  _extractFlowSteps(text) {
    if (!text) return [];

    // Split text by newlines, ↓, →, or ->
    const rawItems = text.split(/[\n↓→]|->/)
      .map(l => l.replace(/^[\s\d\.\)\-•→↓▶]+/, '').trim())
      .filter(l => l.length >= 1 && !/^(flow|sequence|logic|diagram|program logic|engineering flow|another information flow|water now button|auto mode switch)$/i.test(l));

    return rawItems.map((label, i) => {
      let type = 'process';
      if (i === 0) type = 'start';
      else if (i === rawItems.length - 1) type = 'loop';
      else if (/^(yes|no|if|is\s)/i.test(label)) type = 'wait';
      else if (/stop|end|finish/i.test(label)) type = 'loop';

      return {
        label: label.toUpperCase(),
        type,
        desc: ''
      };
    });
  },

  _extractReviewRows(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 4);
    const rows = [];
    for (let i = 0; i < lines.length; i += 2) {
      if (lines[i] && lines[i+1]) {
        rows.push({
          question: lines[i].replace(/^[\s•\-\*\d\.\)QA:]+/, '').trim(),
          answer: lines[i+1].replace(/^[\s•\-\*\d\.\)QA:]+/, '').trim()
        });
      } else if (lines[i]) {
        const parts = lines[i].split(/[:–—\|]/);
        if (parts.length >= 2) rows.push({ question: parts[0].trim(), answer: parts.slice(1).join(':').trim() });
      }
    }
    return rows.slice(0, 8);
  },

  _extractIndustries(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 4);
    const industries = [];
    let current = null;
    for (const line of lines) {
      if (line.length < 60 && /^[A-Z]/.test(line) && !/^[•\-\*]/.test(line)) {
        if (current) industries.push(current);
        current = { title: line.trim(), desc: '', imgKeyword: line.toLowerCase().split(' ')[0] };
      } else if (current) {
        current.desc += (current.desc ? ' ' : '') + line.replace(/^[\s•\-\*]+/, '').trim();
      }
    }
    if (current) industries.push(current);
    return industries.slice(0, 6);
  },

  _guessTitle(type) {
    const titles = {
      'dynamic-text': 'CONTENT',
      'dynamic-bullets': 'KEY POINTS',
      'dynamic-subheader': 'SECTION',
      'dynamic-table': 'DATA TABLE',
      'dynamic-mixed': 'INFORMATION',
      'dynamic-capsule': 'HIGHLIGHT',
      'dynamic-comparison': 'COMPARISON',
      'dynamic-image': 'IMAGE',
    };
    return titles[type] || type.replace(/-/g, ' ').toUpperCase();
  },

  _iconForType(type) {
    const icons = {
      'dynamic-text': '📄', 'dynamic-bullets': '📋', 'dynamic-subheader': '🏷️',
      'dynamic-table': '📊', 'dynamic-mixed': '📦', 'dynamic-capsule': '💊',
      'dynamic-comparison': '⚖️', 'dynamic-image': '🖼️',
      'mission-story': '📖', 'real-world': '🌍', 'curiosity-box': '💡',
      'did-you-know': '🌟', 'stem-fact': '⚙️', 'mission-objectives': '🎯',
      'think-engineer': '🧠', 'observe-card': '👁️', 'component-spotlight': '🔬',
      'inside-sensor': '🔬', 'comparison-vs': '⚖️', 'heroes-grid': '🦸',
      'build-steps': '🛠️', 'in-this-lab': '🧪', 'pro-tip': '💡',
      'common-mistakes': '⚠️', 'flowchart-sequence': '🔄', 'code-snippet': '💻',
      'variables-at-work': '📌', 'predict-think': '🤔', 'challenge-box': '🏆',
      'mini-upgrade': '⬆️', 'engineers-everywhere': '🏭', 'mission-review-table': '📝',
      'ultra-badge': '🎖️', 'beyond-mission': '🚀', 'vocabulary-builder': '📚',
      'knowledge-check': '❓', 'image-holder': '🖼️', 'career-spotlight': '👔',
      'future-tech': '🔮', 'safety-card': '🛡️', 'reflection-card': '🪞',
      'my-notes': '📓', 'home-challenge': '🏠', 'parent-connect': '👨‍👩‍👧',
      'teacher-notes': '📋', 'next-preview': '▶️', 'mini-challenge': '⚡',
      'portfolio-task': '🗂️', 'debug-corner': '🐛',
    };
    return icons[type] || '📌';
  },

  _numIcon(idx) {
    return ['💡','🔧','💻','🧪','📊','🌐','⚡','📡'][idx] || '📌';
  }
};
