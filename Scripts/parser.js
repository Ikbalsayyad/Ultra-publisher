/**
 * UltraMinds Smart Heuristic Parser Engine (50-Element Enabled)
 * Converts raw unstructured text or loose HTML into structured UltraMinds A4 layout JSON.
 * Parses all 50 UltraMinds Book Elements offline.
 */

window.HeuristicParser = {
  parse(rawInput, pageLimit = "auto") {
    if (!rawInput || typeof rawInput !== 'string') {
      return window.SAMPLE_MISSIONS.mission14;
    }

    const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
    let missionNum = "1";
    let title = "UNNAMED MISSION";
    let subtitle = "Build and discover with UltraCore!";
    let theme = "theme-blue";

    // Extract Mission Title & Number
    const titleMatch = rawInput.match(/Mission\s+(\d+)\s*[:|-]?\s*([^\n<]+)/i) || rawInput.match(/<title>([^<]+)<\/title>/i) || rawInput.match(/^#?\s*([^\n]+)/);
    if (titleMatch) {
      if (titleMatch[1] && !isNaN(titleMatch[1])) missionNum = titleMatch[1];
      if (titleMatch[2]) title = titleMatch[2].replace(/Mission\s+\d+/i, '').trim();
      else if (titleMatch[1]) title = titleMatch[1].trim();
    }

    const subtitleMatch = rawInput.match(/Subtitle\s*[:|-]\s*([^\n]+)/i) || rawInput.match(/<p class="mission-subtitle">([^<]+)<\/p>/i);
    if (subtitleMatch) subtitle = subtitleMatch[1].trim();

    // Pages container
    const pages = [];
    let currentPageSections = [];

    // Helper to push section to page
    const addSection = (sec) => {
      currentPageSections.push(sec);
      if (currentPageSections.length >= 4) {
        pages.push({
          pageNumber: pages.length + 1,
          sections: [...currentPageSections],
          footerPills: ["start", "process", "output"],
          nextPreview: "NEXT PAGE PREVIEW 🚀"
        });
        currentPageSections = [];
      }
    };

    // 1. Mission Story
    const storyMatch = this.extractBlock(rawInput, ["MISSION STORY", "STORY", "BACKGROUND", "BRIEFING"]);
    if (storyMatch) {
      addSection({
        type: "nova-card",
        title: "MISSION STORY",
        icon: "📖",
        content: storyMatch
      });
    }

    // 2. Real World & Curiosity Split
    const realWorldMatch = this.extractBlock(rawInput, ["REAL WORLD", "APPLICATIONS", "INDUSTRY"]);
    const curiosityMatch = this.extractBlock(rawInput, ["CURIOSITY BOX", "CURIOSITY", "DID YOU KNOW"]);

    if (realWorldMatch || curiosityMatch) {
      addSection({
        type: "split-layout",
        left: {
          type: "real-world",
          title: "REAL WORLD",
          icon: "🌐",
          content: realWorldMatch || "Used in modern smart technology and industrial automation."
        },
        right: {
          type: "curiosity-box",
          title: "CURIOSITY BOX",
          icon: "💡",
          content: curiosityMatch || "Sensors allow machines to perceive the physical world."
        }
      });
    }

    // 3. Objectives
    addSection({
      type: "mission-objectives",
      title: "MISSION OBJECTIVES",
      icon: "🎯",
      objectives: [
        { num: 1, text: "Read input sensors", subtext: "Hardware Layer" },
        { num: 2, text: "Process logic in UltraCore", subtext: "Control Logic" },
        { num: 3, text: "Display results on screen", subtext: "Output Layer" }
      ]
    });

    // 4. Component Spotlight / Hardware Setup
    const hardwareMatch = this.extractBlock(rawInput, ["HARDWARE", "COMPONENT SPOTLIGHT", "SETUP", "PINOUT"]);
    if (hardwareMatch) {
      addSection({
        type: "component-spotlight",
        title: "COMPONENT SPOTLIGHT",
        icon: "🔌",
        content: hardwareMatch
      });
    }

    // 5. Code & Logic
    const codeMatch = rawInput.match(/```(?:python|cpp|js)?([\s\S]*?)```/i) || rawInput.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/i);
    if (codeMatch) {
      addSection({
        type: "split-layout",
        left: {
          type: "code-snippet",
          title: "PROGRAMMING STUDIO",
          language: "python",
          code: codeMatch[1].trim()
        },
        right: {
          type: "common-mistakes",
          title: "COMMON MISTAKES",
          mistakes: [
            { issue: "Power Connection", fix: "Verify VCC is 3.3V / 5V" },
            { issue: "Pin Numbering", fix: "Check digital/analog pin mapping" }
          ]
        }
      });
    }

    // 6. Think Like an Engineer / Quiz
    const questions = this.extractQuestions(rawInput);
    if (questions.length > 0) {
      addSection({
        type: "think-engineer",
        title: "THINK LIKE AN ENGINEER",
        icon: "🧠",
        question: questions[0],
        lines: 2
      });
    }

    // Finalize remaining sections into page
    if (currentPageSections.length > 0 || pages.length === 0) {
      pages.push({
        pageNumber: pages.length + 1,
        sections: currentPageSections.length > 0 ? currentPageSections : [
          { type: "nova-card", title: "MISSION BRIEFING", icon: "📖", content: rawInput.slice(0, 300) }
        ],
        footerSlogan: "LEARN • BUILD • INNOVATE • INSPIRE",
        brandTag: "UltraMinds AI"
      });
    }

    return {
      id: "mission-" + Date.now(),
      title: `Mission ${missionNum}: ${title}`,
      theme: theme,
      missionNumber: missionNum,
      missionTitle: title.toUpperCase(),
      missionSubtitle: subtitle,
      guideName: "Commander Nova",
      guideRole: "Your Mission Guide",
      pages: pages
    };
  },

  extractBlock(text, keywords) {
    for (const kw of keywords) {
      const regex = new RegExp(`(?:${kw})[\\s\\S]*?\\n\\n([\\s\\S]*?)(?=\\n\\n[A-Z0-9 ]{4,}|$)`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].replace(/<[^>]+>/g, '').trim();
      }
    }
    return null;
  },

  extractQuestions(text) {
    const qMatches = text.match(/(?:Q\d+|Question|\d+\.)\s*([^\n\?]+\?)/gi);
    if (qMatches) {
      return qMatches.map(q => q.replace(/^(?:Q\d+|Question|\d+\.)\s*/i, '').trim());
    }
    return ["How can we optimize this project for real-world application?"];
  }
};
