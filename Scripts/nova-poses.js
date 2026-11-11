/**
 * UltraMinds Nova Mascot Intelligence Engine (V1.0)
 * Manages 27 contextual poses for Commander Nova throughout STEM missions.
 * Replaces hardcoded emoji fallbacks with intelligent, pedagogical mascot interactions.
 */

window.NovaPoseEngine = {
  // Base path for pose assets relative to web root
  basePath: 'Images/nova poses/',

  // Registry of all 27 poses categorized by pedagogical intent
  poses: [
    // GREETINGS & INTRODUCTIONS (Cover, Story, Welcome)
    { id: 'welcome', file: 'welcome.png', label: 'Welcome (Open Arms)', category: 'greeting', weight: 10, keywords: ['welcome', 'begin', 'start', 'mission', 'explorer', 'intro'] },
    { id: 'greeting', file: 'greeting.png', label: 'Greeting (Friendly Wave)', category: 'greeting', weight: 9, keywords: ['hello', 'greeting', 'nova', 'meet', 'squad'] },

    // CURIOSITY & DISCOVERY (Hook questions, STEM facts, Did You Know)
    { id: 'do_you_know', file: 'do_you_know.png', label: 'Do You Know (Curious)', category: 'curiosity', weight: 10, keywords: ['curiosity', 'wonder', 'phenomenon', 'do you know', 'did you know', 'why'] },
    { id: 'do_you_know2', file: 'do_you_know2.png', label: 'Do You Know (Pondering)', category: 'curiosity', weight: 8, keywords: ['fact', 'science', 'stem fact', 'fascinating', 'discovery'] },
    { id: 'do_you_know3', file: 'do_you_know3.png', label: 'Do You Know (Observing)', category: 'curiosity', weight: 7, keywords: ['look', 'observe', 'nature', 'world', 'environment'] },
    { id: 'do_you_know4', file: 'do_you_know4.png', label: 'Do You Know (Inquiring)', category: 'curiosity', weight: 7, keywords: ['question', 'how', 'mystery', 'investigate'] },
    { id: 'find_out', file: 'find_out.png', label: 'Find Out (Searching)', category: 'curiosity', weight: 8, keywords: ['find out', 'explore', 'search', 'seek', 'detect', 'sensor'] },

    // EXPLANATION & CONCEPTS (Core Concepts, Sensor Breakdown)
    { id: 'explaination', file: 'explaination.png', label: 'Explanation (Teaching)', category: 'explanation', weight: 10, keywords: ['concept', 'how it works', 'theory', 'circuit', 'signal', 'microcontroller', 'voltage'] },
    { id: 'explaination2', file: 'explaination2.png', label: 'Explanation (Detailed)', category: 'explanation', weight: 9, keywords: ['inside', 'deep dive', 'architecture', 'anatomy', 'specs', 'mechanism'] },

    // THINKING & CHALLENGE (Engineer Scenarios, Logic Challenges)
    { id: 'thinking', file: 'thinking.png', label: 'Thinking (Deep Ponder)', category: 'thinking', weight: 10, keywords: ['think', 'engineer', 'predict', 'challenge', 'scenario', 'calculate', 'decide'] },
    { id: 'thinking2', file: 'thinking2.png', label: 'Thinking (Thoughtful)', category: 'thinking', weight: 8, keywords: ['brainstorm', 'analyze', 'consider', 'compare', 'logic'] },
    { id: 'idea', file: 'idea.png', label: 'Idea (Eureka Moment)', category: 'thinking', weight: 10, keywords: ['idea', 'eureka', 'lightbulb', 'upgrade', 'innovation', 'smart', 'solution', 'pro-tip'] },

    // INSTRUCTION & WIRING (Build Lab, Steps, Procedures)
    { id: 'pointing', file: 'pointing.png', label: 'Pointing (Key Step)', category: 'instruction', weight: 10, keywords: ['step', 'build', 'wire', 'connect', 'pin', 'breadboard', 'procedure', 'follow'] },
    { id: 'pointing2', file: 'pointing2.png', label: 'Pointing (Directing)', category: 'instruction', weight: 8, keywords: ['assemble', 'hardware', 'port', 'ground', 'vcc', 'signal'] },
    { id: 'you', file: 'you.png', label: 'You Can Do It (Encouraging)', category: 'instruction', weight: 8, keywords: ['your turn', 'try', 'practice', 'action', 'hands on'] },

    // WARNING & COMMON MISTAKES (Safety, Traps, Debugging)
    { id: 'stop', file: 'stop.png', label: 'Stop (Caution Hand)', category: 'warning', weight: 10, keywords: ['stop', 'warning', 'danger', 'caution', 'mistake', 'burn', 'short circuit', 'polarity'] },
    { id: 'shocked', file: 'shocked.png', label: 'Shocked (Oops Alert)', category: 'warning', weight: 9, keywords: ['common mistake', 'error', 'debug', 'troubleshoot', 'beware', 'oops'] },
    { id: 'quite', file: 'quite.png', label: 'Quiet / Secret Tip', category: 'warning', weight: 7, keywords: ['secret', 'whisper', 'note', 'silent', 'pro tip', 'remember'] },

    // VERIFICATION & DEVICE READY (Testing, Calibration OK)
    { id: 'thumbs_up', file: 'thumbs_up.png', label: 'Thumbs Up (Approved)', category: 'verification', weight: 10, keywords: ['ready', 'device ready', 'verified', 'working', 'test passed', 'checklist', 'success'] },
    { id: 'confident', file: 'confident.png', label: 'Confident (Ready)', category: 'verification', weight: 8, keywords: ['confident', 'calibrated', 'powered on', 'active', 'standby'] },

    // CELEBRATION & BADGE (Ultra Badge, Review, Final Success)
    { id: 'celebration', file: 'celebration.png', label: 'Celebration (Jubilant)', category: 'celebration', weight: 10, keywords: ['congratulations', 'badge', 'ultra badge', 'complete', 'victory', 'won', 'master'] },
    { id: 'celebration2', file: 'celebration2.png', label: 'Celebration (Cheering)', category: 'celebration', weight: 9, keywords: ['celebrate', 'achievement', 'hero', 'great job', 'finished'] },
    { id: 'perfect', file: 'perfect.png', label: 'Perfect (Top Score)', category: 'celebration', weight: 10, keywords: ['perfect', 'flawless', 'review', 'assessment', '100%'] },
    { id: 'perfect2', file: 'perfect2.png', label: 'Perfect (Star Student)', category: 'celebration', weight: 8, keywords: ['star', 'excellent', 'certified'] },
    { id: 'perfect3', file: 'perfect3.png', label: 'Perfect (Salute)', category: 'celebration', weight: 7, keywords: ['honor', 'mission accomplished', 'salute'] },
    { id: 'yesss', file: 'yesss.png', label: 'Yesss (Fist Pump)', category: 'celebration', weight: 9, keywords: ['yes', 'yesss', 'we did it', 'success', 'passed'] },
    { id: 'thankyou', file: 'thankyou.png', label: 'Thank You (Warm Salute)', category: 'celebration', weight: 8, keywords: ['thank you', 'thanks', 'farewell', 'see you', 'next mission'] }
  ],

  /**
   * Get direct URL to a pose by ID or category fallback
   */
  getPoseUrl(poseIdOrCategory = 'welcome') {
    const pose = this.poses.find(p => p.id === poseIdOrCategory || p.category === poseIdOrCategory) || this.poses[0];
    return `${this.basePath}${pose.file}`;
  },

  getAllPoses() {
    return this.poses.map(p => ({
      ...p,
      url: `${this.basePath}${p.file}`
    }));
  },

  /**
   * Smart Selector: Evaluates context, section type, keywords, and page position.
   * Avoids repeating the same pose across the mission when alternatives exist.
   */
  pickPoseForContext(context = {}, usedPoseIds = new Set()) {
    // 1. Cover Page Header Mascot always gets welcome / greeting
    if (context.isCover || (context.pageNum === 1 && context.isHeader)) {
      const g = ['welcome', 'greeting'].filter(id => !usedPoseIds.has(id));
      const chosen = g[0] || 'welcome';
      usedPoseIds.add(chosen);
      return this.getPoseUrl(chosen);
    }

    // 2. Section Type to Pedagogical Category Mapping
    const typeToCategory = {
      'mission-story': 'greeting',
      'curiosity-box': 'curiosity',
      'did-you-know': 'curiosity',
      'stem-fact': 'curiosity',
      'observe-card': 'curiosity',
      'inside-sensor': 'explanation',
      'concept-card': 'explanation',
      'component-spotlight': 'explanation',
      'think-engineer': 'thinking',
      'challenge-box': 'thinking',
      'predict-think': 'thinking',
      'mini-upgrade': 'thinking',
      'build-steps': 'instruction',
      'in-this-lab': 'instruction',
      'procedure': 'instruction',
      'common-mistakes': 'warning',
      'safety-card': 'warning',
      'debug-corner': 'warning',
      'device-ready': 'verification',
      'testing-lab': 'verification',
      'ultra-badge': 'celebration',
      'mission-review-table': 'celebration',
      'beyond-mission': 'celebration'
    };

    const targetCategory = typeToCategory[context.sectionType] || null;

    // 3. Keyword Scoring & Diversity Check
    let bestPose = null;
    let highestScore = -999;
    const textCorpus = `${context.title || ''} ${context.content || ''} ${context.heading || ''} ${context.text || ''}`.toLowerCase();

    const candidatePoses = targetCategory
      ? this.poses.filter(p => p.category === targetCategory)
      : this.poses;

    for (const pose of candidatePoses) {
      let score = 0;
      if (usedPoseIds.has(pose.id)) {
        score -= 25; // Strongly deprioritize previously used poses
      }
      if (targetCategory && pose.category === targetCategory) {
        score += 20;
      }
      for (const kw of pose.keywords) {
        if (textCorpus.includes(kw)) {
          score += 10;
        }
      }
      score += (pose.weight || 5);

      if (score > highestScore) {
        highestScore = score;
        bestPose = pose;
      }
    }

    if (!bestPose) {
      bestPose = this.poses[0];
    }

    usedPoseIds.add(bestPose.id);
    return `${this.basePath}${bestPose.file}`;
  },

  /**
   * Enriches a full mission object with 3 to 7 strategic mascot placements.
   * Ensures balanced pedagogical presence without visual clutter.
   */
  enrichMissionWithPoses(mission) {
    if (!mission || !mission.pages || !Array.isArray(mission.pages)) return mission;

    const usedPoses = new Set();
    const totalPages = mission.pages.length;

    // 1. Cover Header Mascot (Anchor 1: Always populated with welcome/greeting)
    if (!mission.mascotImg || /[\u{1F300}-\u{1F9FF}]/u.test(mission.mascotImg) || mission.mascotImg.trim() === '') {
      mission.mascotImg = this.pickPoseForContext({ isCover: true, pageNum: 1, isHeader: true }, usedPoses);
    }

    // Determine target mascot count for mission: strictly 3 to 7 based on page count
    const targetPoseCount = Math.max(3, Math.min(7, Math.ceil(totalPages * 0.65)));
    let currentPoseCount = 1; // cover mascot counts as 1

    // Priority sections where Nova mascot adds maximum pedagogical engagement
    const priorityTypes = [
      'ultra-badge',          // Celebration at the end (Critical)
      'common-mistakes',       // Warning / Oops (High)
      'safety-card',           // Stop / Caution (High)
      'curiosity-box',         // Do You Know (High)
      'did-you-know',          // Do You Know (High)
      'think-engineer',        // Thinking / Challenge (Medium-High)
      'device-ready',          // Thumbs Up (Medium-High)
      'mission-story',         // Welcome / Intro (Medium)
      'component-spotlight',   // Explanation (Medium)
      'stem-fact',             // Stem insight (Medium)
      'build-steps'            // Pointing / Instruction (Medium)
    ];

    // Scan pages to attach Nova poses to candidate cards
    for (let pIdx = 0; pIdx < totalPages && currentPoseCount < targetPoseCount; pIdx++) {
      const page = mission.pages[pIdx];
      const pageNum = page.pageNumber || (pIdx + 1);
      if (!page.sections || !Array.isArray(page.sections)) continue;

      let pageHasMascot = (pIdx === 0); // page 1 already has cover mascot

      // Flatten split layouts for evaluation
      const candidateSections = [];
      for (const sec of page.sections) {
        if (!sec) continue;
        if (sec.type === 'split-layout') {
          if (sec.left) candidateSections.push(sec.left);
          if (sec.right) candidateSections.push(sec.right);
        } else {
          candidateSections.push(sec);
        }
      }

      for (const sec of candidateSections) {
        if (!sec || currentPoseCount >= targetPoseCount) break;
        if (pageHasMascot && sec.type !== 'ultra-badge') continue;

        // Ultra badge: always equip with celebration Nova pose
        if (sec.type === 'ultra-badge') {
          sec.mascotImg = this.pickPoseForContext({ sectionType: 'ultra-badge', isLastPage: true }, usedPoses);
          currentPoseCount++;
          pageHasMascot = true;
          continue;
        }

        // Floating clipart: equip with contextual Nova pose
        if (sec.type === 'floating-clipart') {
          if (!sec.imgUrl || sec.imgUrl.trim() === '' || /[\u{1F300}-\u{1F9FF}]/u.test(sec.imgUrl)) {
            sec.imgUrl = this.pickPoseForContext({ sectionType: sec.type, pageNum }, usedPoses);
            currentPoseCount++;
            pageHasMascot = true;
          }
          continue;
        }

        // Check if section matches priority list
        if (priorityTypes.includes(sec.type) && !pageHasMascot) {
          sec.mascotPoseUrl = this.pickPoseForContext({ sectionType: sec.type, title: sec.title, content: sec.content, pageNum }, usedPoses);
          currentPoseCount++;
          pageHasMascot = true;
        }
      }
    }

    // Secondary pass: if still under minimum (3 poses), assign to any eligible text/info card
    if (currentPoseCount < 3) {
      for (let pIdx = 1; pIdx < totalPages && currentPoseCount < 3; pIdx++) {
        const page = mission.pages[pIdx];
        if (!page.sections) continue;
        for (const sec of page.sections) {
          const targetSec = sec.type === 'split-layout' ? (sec.left || sec.right) : sec;
          if (targetSec && !targetSec.mascotPoseUrl && targetSec.type !== 'ultra-badge' && targetSec.type !== 'floating-clipart') {
            targetSec.mascotPoseUrl = this.pickPoseForContext({ sectionType: targetSec.type, title: targetSec.title, content: targetSec.content, pageNum: pIdx + 1 }, usedPoses);
            currentPoseCount++;
            break;
          }
        }
      }
    }

    return mission;
  },

  /**
   * Opens the interactive Nova Pose Picker modal allowing creators to choose any pose.
   */
  openPosePicker(onSelect) {
    let modal = document.getElementById('nova-pose-picker-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'nova-pose-picker-modal';
      modal.style.cssText = 'position:fixed; inset:0; background:rgba(10,15,29,0.85); backdrop-filter:blur(8px); z-index:2000000; display:flex; align-items:center; justify-content:center; padding:20px;';
      document.body.appendChild(modal);
    }

    const poses = this.getAllPoses();
    const categories = ['greeting', 'curiosity', 'explanation', 'thinking', 'instruction', 'warning', 'verification', 'celebration'];

    modal.innerHTML = `
      <div style="background:#0F172A; border:1px solid #1E293B; border-radius:16px; width:92%; max-width:840px; max-height:88vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
        <div style="padding:16px 20px; border-bottom:1px solid #1E293B; display:flex; align-items:center; justify-content:space-between; background:#1E293B;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="Images/nova poses/welcome.png" style="width:34px; height:34px; object-fit:contain;" alt="Nova Mascot" />
            <div>
              <h3 style="margin:0; font-size:1.1rem; color:#F8FAFC; font-weight:800;">Choose Commander Nova Mascot Pose</h3>
              <p style="margin:2px 0 0 0; font-size:0.75rem; color:#94A3B8;">Select from 27 pedagogical poses to interact with students throughout the mission</p>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button onclick="window.NovaPoseEngine._triggerCustomUpload()" style="background:#0284C7; color:#fff; border:none; border-radius:8px; padding:6px 14px; font-size:0.8rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
              📁 Upload Custom
            </button>
            <button onclick="document.getElementById('nova-pose-picker-modal').remove()" style="background:none; border:none; color:#94A3B8; font-size:1.4rem; cursor:pointer; padding:4px 8px;">✕</button>
          </div>
        </div>
        <div style="flex:1; overflow-y:auto; padding:20px; display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:12px;">
          ${poses.map(p => `
            <div class="nova-pose-card" onclick="window.NovaPoseEngine._handlePickerSelect('${p.url}')" style="background:#1E293B; border:1.5px solid #334155; border-radius:12px; padding:10px; display:flex; flex-direction:column; align-items:center; cursor:pointer; transition:all 0.15s ease; text-align:center;">
              <div style="width:90px; height:90px; display:flex; align-items:center; justify-content:center; overflow:hidden; margin-bottom:8px;">
                <img src="${p.url}" alt="${p.label}" style="max-width:100%; max-height:100%; object-fit:contain;" />
              </div>
              <div style="font-size:0.75rem; font-weight:700; color:#F1F5F9; line-height:1.2;">${p.label}</div>
              <div style="font-size:0.65rem; color:#00F0FF; text-transform:uppercase; margin-top:4px; font-weight:600;">${p.category}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this._onSelectCallback = onSelect;
  },

  _triggerCustomUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        this._handlePickerSelect(evt.target.result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  _handlePickerSelect(url) {
    if (this._onSelectCallback) {
      this._onSelectCallback(url);
    }
    const modal = document.getElementById('nova-pose-picker-modal');
    if (modal) modal.remove();
  }
};
