/**
 * UltraMinds 52-Element Standard Library Specification & Masterpiece Prompt System (V11 - Strict User Input Fidelity)
 */

window.ULTRAMINDS_50_ELEMENTS = {
  "floating-clipart": {
    name: "Floating Clipart Sticker (Mascot)",
    type: "floating-clipart",
    icon: "🧑‍🚀",
    desc: "Borderless floating PNG sticker/mascot (e.g. Commander Nova) that can be moved anywhere on page without disturbing cards.",
    presetData: {
      type: "floating-clipart",
      title: "Commander Nova Clipart",
      imgUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"
    }
  },
  "image-holder": {
    name: "Normal Image Holder Card",
    type: "image-holder",
    icon: "🖼️",
    desc: "Clean standalone image card with top title capsule, image box, and caption.",
    presetData: {
      type: "image-holder",
      title: "FIGURE 1.1 - HARDWARE SCHEMATIC",
      icon: "🖼️",
      imgUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      caption: "Figure 1.1 Hardware Diagram Schematic",
      objectFit: "cover",
      objectPosition: "center"
    }
  },
  "incard-image-holder": {
    name: "In-Card Image Holder (Bottom Capsule)",
    type: "incard-image-holder",
    icon: "🖼️",
    desc: "Compact in-card image box with clean bottom bordered caption capsule (No emoji).",
    presetData: {
      type: "incard-image-holder",
      title: "Image 1",
      imgUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      objectFit: "cover",
      objectPosition: "center"
    }
  },
  "mission-story": {
    name: "Mission Story",
    type: "mission-story",
    icon: "📖",
    desc: "Narrative context setting the real-world engineering challenge.",
    presetData: { type: "mission-story", title: "MISSION STORY", icon: "📖", content: "Commander Nova needs your help! Classrooms and laboratories are experiencing sudden temperature spikes. Your mission is to build a Smart Climate Monitor using the DHT11 sensor and OLED screen." }
  },
  "real-world": {
    name: "Real World Impact",
    type: "real-world",
    icon: "🌐",
    desc: "Industry application connecting concept to commercial tech.",
    presetData: { type: "real-world", title: "REAL WORLD IMPACT", icon: "🌐", content: "Environmental sensing technology is used in Smart Classrooms, Commercial Greenhouses, Museums, Hospitals, and Weather Forecast Stations." }
  },
  "curiosity-box": {
    name: "Curiosity Box",
    type: "curiosity-box",
    icon: "💡",
    desc: "Hook question or intriguing STEM phenomenon.",
    presetData: { type: "curiosity-box", title: "CURIOSITY BOX", icon: "💡", content: "Humidity affects how we feel! High humidity prevents sweat from evaporating, making hot days feel even hotter. Electronic sensors help us measure this accurately!" }
  },
  "stem-fact": {
    name: "STEM Fact + OLED",
    type: "stem-fact",
    icon: "⚙️",
    desc: "Fast scientific insight paired with live hardware preview.",
    presetData: { type: "stem-fact", title: "STEM FACT", icon: "⚙️", content: "Sensors like the DHT11 collect data thousands of times per day, assisting engineers in automated climate control.", oledPreview: "Temp: 26.8°C\nHumi: 65%" }
  },
  "mission-objectives": {
    name: "Mission Objectives Grid",
    type: "mission-objectives",
    icon: "🎯",
    desc: "Structured bullet goals for the mission.",
    presetData: { type: "mission-objectives", title: "MISSION OBJECTIVES", icon: "🎯", objectives: [{ num: 1, text: "Read Live Temp", subtext: "Thermometer Sensor" }, { num: 2, text: "Read Live Humidity", subtext: "% Humidity Sensor" }, { num: 3, text: "Store Variables", subtext: "Memory Storage" }, { num: 4, text: "Display on OLED", subtext: "OLED Screen" }] }
  },
  "think-engineer": {
    name: "Think Like an Engineer",
    type: "think-engineer",
    icon: "🧠",
    desc: "Interactive scenario decision prompt.",
    presetData: { type: "think-engineer", title: "THINK LIKE AN ENGINEER", icon: "🧠", question: "Would you rather see tasks by subject, priority, or date? How could your planner become more useful?", scenario: { left: { label: "OPTION A: BY PRIORITY", temp: "High/Med/Low", hum: "Sorted", feel: "Urgent Tasks First", status: "ok" }, right: { label: "OPTION B: BY DATE", temp: "Calendar View", hum: "Scheduled", feel: "Timetable Order", status: "ok" } } }
  },
  "concept-card": {
    name: "Core Concept Card",
    type: "concept-card",
    icon: "📘",
    desc: "Theoretical explanation of the chapter's core topic.",
    presetData: { type: "concept-card", title: "HOW SENSORS READ DATA", icon: "📘", content: "Microcontrollers read electrical voltage signals from sensors and convert them into digital numbers using Analog-to-Digital Converters (ADC)." }
  },
  "component-spotlight": {
    name: "Component Spotlight",
    type: "component-spotlight",
    icon: "🔬",
    desc: "Detailed anatomical breakdown of a specific hardware piece.",
    presetData: { type: "component-spotlight", title: "MEET THE DHT11 SENSOR", icon: "🔬", content: "The DHT11 contains a capacitive humidity sensing element, a thermistor for measuring temperature, and an 8-bit microcontroller inside." }
  },
  "build-steps": {
    name: "Build Steps / Wiring Lab",
    type: "build-steps",
    icon: "🛠️",
    desc: "Step-by-step schematic and breadboard wiring guide.",
    presetData: { type: "build-steps", title: "CIRCUIT WIRING STEPS", icon: "🛠️", steps: [{ stepNum: 1, title: "Connect VCC & GND", desc: "Connect DHT11 VCC to 3.3V and GND to GND pin.", pinTable: [{ from: "DHT11 Pin 1", to: "UltraCore 3.3V" }, { from: "DHT11 Pin 4", to: "UltraCore GND" }] }, { stepNum: 2, title: "Connect Signal Pin", desc: "Connect DHT11 Signal pin to Pin D4.", pinTable: [{ from: "DHT11 Pin 2", to: "UltraCore Pin D4" }] }] }
  },
  "code-snippet": {
    name: "Code Snippet Box",
    type: "code-snippet",
    icon: "💻",
    desc: "Syntax-highlighted code container for MicroPython/C++.",
    presetData: { type: "code-snippet", title: "PYTHON LOGIC PREVIEW", icon: "💻", language: "python", code: "import dht\nfrom machine import Pin\n\nsensor = dht.DHT11(Pin(4))\nsensor.measure()\nprint('Temp:', sensor.temperature())" }
  },
  "common-mistakes": {
    name: "Common Mistakes / Debug",
    type: "common-mistakes",
    icon: "⚠️",
    desc: "Troubleshooting guide for typical pitfalls.",
    presetData: { type: "common-mistakes", title: "COMMON MISTAKES", icon: "⚠️", mistakes: [{ issue: "Wrong VCC connection", fix: "Check VCC ➔ 3.3V (NOT 5V)" }, { issue: "Sensor timeout error", fix: "Ensure signal wire is tight on D4" }] }
  },
  "space-filler": {
    name: "Space Filler Spacer",
    type: "space-filler",
    icon: "👻",
    desc: "Invisible whitespace card to balance page layout footers.",
    presetData: { type: "space-filler", title: "SPACE FILLER", icon: "👻", content: "Custom Whitespace Spacer" }
  },
  "did-you-know": {
    name: "Did You Know?",
    type: "did-you-know",
    icon: "💡",
    desc: "Fascinating science trivia card.",
    presetData: { type: "did-you-know", title: "DID YOU KNOW?", icon: "💡", content: "Weather stations on Mount Everest use heated humidity sensors so moisture doesn't freeze inside!" }
  },
  "tool-explorer": {
    name: "Tool & Hardware Explorer",
    type: "tool-explorer",
    icon: "🧰",
    desc: "Overview of physical tools and hardware modules.",
    presetData: { type: "tool-explorer", title: "HARDWARE TOOLS REQUIRED", icon: "🧰", content: "For this lab you will need an UltraCore Microcontroller, DHT11 Sensor, 0.96 OLED Screen, and 4 Jumper Wires." }
  },
  "ui-blueprint": {
    name: "UI Blueprint & Wireframe",
    type: "ui-blueprint",
    icon: "🎨",
    desc: "Display interface layout wireframe.",
    presetData: { type: "ui-blueprint", title: "OLED SCREEN BLUEPRINT", icon: "🎨", content: "The top row displays temperature in °C, while the bottom row displays humidity percentage." }
  },
  "component-properties": {
    name: "Component Properties",
    type: "component-properties",
    icon: "📊",
    desc: "Pinout and electrical specifications.",
    presetData: { type: "component-properties", title: "ELECTRICAL SPECS", icon: "📊", content: "Operating Voltage: 3.3V - 5.5V | Temp Range: 0°C to 50°C (±2°C) | Humidity Range: 20% to 90% (±5%)" }
  },
  "variable-tracker": {
    name: "Variable Tracker",
    type: "variable-tracker",
    icon: "📌",
    desc: "Code variable state and data types table.",
    presetData: { type: "variable-tracker", title: "VARIABLE TRACKER", icon: "📌", content: "temp_c (float) - Stores live temperature | hum_pct (int) - Stores live humidity percentage." }
  },
  "data-flow": {
    name: "Data Flow Diagram",
    type: "data-flow",
    icon: "🔄",
    desc: "Step-by-step signal processing flow.",
    presetData: { type: "data-flow", title: "SIGNAL DATA FLOW", icon: "🔄", content: "Environment ➔ DHT11 Sensor ➔ Digital Pulse ➔ GPIO Pin D4 ➔ MicroPython Calculation ➔ OLED Display" }
  },
  "mini-challenge": {
    name: "Mini Coding Challenge",
    type: "mini-challenge",
    icon: "⚡",
    desc: "Quick coding exercise for students.",
    presetData: { type: "mini-challenge", title: "MINI CHALLENGE", icon: "⚡", content: "Modify the code to display temperature in Fahrenheit (°F) instead of Celsius!" }
  },
  "engineering-habit": {
    name: "Engineering Habit",
    type: "engineering-habit",
    icon: "🌟",
    desc: "Best practices in hardware & software design.",
    presetData: { type: "engineering-habit", title: "ENGINEERING HABIT", icon: "🌟", content: "Always disconnect power before rewiring breadboard pins to prevent short circuits." }
  },
  "testing-lab": {
    name: "Testing & Validation Lab",
    type: "testing-lab",
    icon: "🧪",
    desc: "Verification procedure for hardware build.",
    presetData: { type: "testing-lab", title: "TESTING YOUR CIRCUIT", icon: "🧪", content: "Breathe gently near the DHT11 sensor — you should see humidity increase instantly on screen!" }
  },
  "innovation-studio": {
    name: "Innovation Studio",
    type: "innovation-studio",
    icon: "🚀",
    desc: "Advanced creative project expansion.",
    presetData: { type: "innovation-studio", title: "INNOVATION STUDIO", icon: "🚀", content: "Add a buzzer alarm that triggers if room temperature exceeds 32°C!" }
  },
  "upgrade-card": {
    name: "Hardware Upgrade Card",
    type: "upgrade-card",
    icon: "⚡",
    desc: "Hardware component enhancement guide.",
    presetData: { type: "upgrade-card", title: "HARDWARE UPGRADE", icon: "⚡", content: "Upgrade to the DHT22 sensor for higher precision and wider temperature range (-40°C to 80°C)." }
  },
  "mission-extension": {
    name: "Mission Extension",
    type: "mission-extension",
    icon: "📡",
    desc: "IoT & Cloud extension activity.",
    presetData: { type: "mission-extension", title: "MISSION EXTENSION", icon: "📡", content: "Connect your ESP32 Wi-Fi module to send climate data to a cloud dashboard!" }
  },
  "team-challenge": {
    name: "Team Challenge",
    type: "team-challenge",
    icon: "👥",
    desc: "Collaborative group lab activity.",
    presetData: { type: "team-challenge", title: "TEAM CHALLENGE", icon: "👥", content: "Work in pairs: Engineer A handles sensor wiring while Engineer B writes the OLED display code." }
  },
  "build-yourself": {
    name: "Build It Yourself Lab",
    type: "build-yourself",
    icon: "🧰",
    desc: "Independent student laboratory project.",
    presetData: { type: "build-yourself", title: "BUILD IT YOURSELF", icon: "🧰", content: "Assemble the complete circuit on your breadboard following the schematic diagram." }
  },
  "innovation-challenge": {
    name: "Innovation Challenge",
    type: "innovation-challenge",
    icon: "💡",
    desc: "Problem-solving design challenge.",
    presetData: { type: "innovation-challenge", title: "CREATIVE CHALLENGE", icon: "💡", content: "Design a 3D-printable protective enclosure for your climate monitor." }
  },
  "ai-thinking": {
    name: "AI & Algorithmic Thinking",
    type: "ai-thinking",
    icon: "🤖",
    desc: "Computational thinking concept.",
    presetData: { type: "ai-thinking", title: "ALGORITHMIC THINKING", icon: "🤖", content: "How can an AI model predict tomorrow's temperature based on historical humidity readings?" }
  },
  "real-world-eng": {
    name: "Real-World Engineering Case",
    type: "real-world-eng",
    icon: "🏭",
    desc: "Industrial case study.",
    presetData: { type: "real-world-eng", title: "INDUSTRIAL CASE STUDY", icon: "🏭", content: "Automated HVAC systems in modern data centers save millions of dollars in electricity using smart sensor feedback." }
  },
  "career-spotlight": {
    name: "STEM Career Spotlight",
    type: "career-spotlight",
    icon: "🎓",
    desc: "Career pathways in engineering & tech.",
    presetData: { type: "career-spotlight", title: "CAREER SPOTLIGHT", icon: "🎓", content: "Environmental Engineers design technologies to control climate, manage air quality, and protect natural ecosystems." }
  },
  "future-tech": {
    name: "Future Tech Preview",
    type: "future-tech",
    icon: "🔮",
    desc: "Emerging technological innovations.",
    presetData: { type: "future-tech", title: "FUTURE TECH PREVIEW", icon: "🔮", content: "Microscopic MEMS climate sensors will soon be integrated directly into smart clothing!" }
  },
  "safety-card": {
    name: "Lab Safety Card",
    type: "safety-card",
    icon: "🛑",
    desc: "Important safety warnings.",
    presetData: { type: "safety-card", title: "LAB SAFETY WARNING", icon: "🛑", content: "Never expose electronic sensors to direct water or liquids unless sealed in a waterproof probe!" }
  },
  "mission-review": {
    name: "Mission Review",
    type: "mission-review",
    icon: "📝",
    desc: "End-of-chapter review summary.",
    presetData: { type: "mission-review", title: "MISSION REVIEW", icon: "📝", content: "You learned how to connect the DHT11 sensor, parse digital data, and render live readings on OLED!" }
  },
  "knowledge-check": {
    name: "Knowledge Check Quiz",
    type: "knowledge-check",
    icon: "❓",
    desc: "Quick self-assessment quiz.",
    presetData: { type: "knowledge-check", title: "KNOWLEDGE CHECK", icon: "❓", content: "Q: Which pin on the DHT11 outputs sensor data? (A) VCC (B) Signal (C) GND" }
  },
  "reflection-card": {
    name: "Self-Reflection Card",
    type: "reflection-card",
    icon: "💭",
    desc: "Student learning reflection prompt.",
    presetData: { type: "reflection-card", title: "STUDENT REFLECTION", icon: "💭", content: "What was the most challenging part of today's build, and how did you debug it?" }
  },
  "my-notes": {
    name: "Personal Engineer Notes",
    type: "my-notes",
    icon: "📔",
    desc: "Blank lined space for notes.",
    presetData: { type: "my-notes", title: "ENGINEER NOTES", icon: "📔", content: "Write your custom observations, pin connections, or ideas here..." }
  },
  "vocabulary-builder": {
    name: "STEM Vocabulary Builder",
    type: "vocabulary-builder",
    icon: "📚",
    desc: "Key terminology definitions.",
    presetData: { type: "vocabulary-builder", title: "STEM VOCABULARY", icon: "📚", content: "Thermistor: A resistor whose resistance changes significantly with temperature." }
  },
  "quick-recap": {
    name: "Quick Chapter Recap",
    type: "quick-recap",
    icon: "⚡",
    desc: "Bullet summary of key takeaways.",
    presetData: { type: "quick-recap", title: "QUICK RECAP", icon: "⚡", content: "• VCC ➔ 3.3V Power\n• Signal ➔ Pin D4\n• MicroPython dht library measures temp & humidity." }
  },
  "progress-tracker": {
    name: "Progress Tracker",
    type: "progress-tracker",
    icon: "📈",
    desc: "Skill mastery progress indicator.",
    presetData: { type: "progress-tracker", title: "SKILL PROGRESS", icon: "📈", content: "Circuit Wiring: 100% | Python Code: 100% | Debugging: 90%" }
  },
  "portfolio-task": {
    name: "Portfolio Milestone Task",
    type: "portfolio-task",
    icon: "📂",
    desc: "Documentation task for student portfolio.",
    presetData: { type: "portfolio-task", title: "PORTFOLIO TASK", icon: "📂", content: "Take a photo of your working circuit and upload your code snippet to your engineering portfolio." }
  },
  "home-challenge": {
    name: "At-Home STEM Challenge",
    type: "home-challenge",
    icon: "🏠",
    desc: "Extended activity for home.",
    presetData: { type: "home-challenge", title: "AT-HOME CHALLENGE", icon: "🏠", content: "Measure temperature in different rooms of your house and record your findings in a chart!" }
  },
  "parent-connect": {
    name: "Parent & Mentor Connect",
    type: "parent-connect",
    icon: "🤝",
    desc: "Discussion prompt for parents.",
    presetData: { type: "parent-connect", title: "PARENT CONNECT", icon: "🤝", content: "Show your family how your sensor measures humidity when you breathe near it!" }
  },
  "teacher-notes": {
    name: "Teacher Guidance Notes",
    type: "teacher-notes",
    icon: "👩‍🏫",
    desc: "Instructional notes for educators.",
    presetData: { type: "teacher-notes", title: "TEACHER NOTES", icon: "👩‍🏫", content: "Ensure students use 3.3V pin to avoid damaging the sensor microcontroller." }
  },
  "next-preview": {
    name: "Next Chapter Teaser",
    type: "next-preview",
    icon: "⏩",
    desc: "Teaser card for upcoming mission.",
    presetData: { type: "next-preview", title: "NEXT MISSION PREVIEW", icon: "⏩", content: "In Mission 15, we will build a Smart Automated Plant Irrigation System using soil moisture sensors!" }
  },
  "qr-resources": {
    name: "QR Code & Resource Links",
    type: "qr-resources",
    icon: "🔗",
    desc: "Links to video tutorials & datasheets.",
    presetData: { type: "qr-resources", title: "ONLINE RESOURCES", icon: "🔗", content: "Scan QR code or visit ultraminds.io/m14 for video tutorials and library downloads." }
  },
  "nova-card": {
    name: "Commander Nova Guidance",
    type: "nova-card",
    icon: "🧑‍🚀",
    desc: "Character guide tip box.",
    presetData: { type: "nova-card", title: "COMMANDER NOVA TIP", icon: "🧑‍🚀", content: "Careful work leads to great inventions! Take your time testing each wire connection." }
  },
  "ultra-badge": {
    name: "Achievement Badge",
    type: "ultra-badge",
    icon: "🎖️",
    desc: "Badge reward for mission completion.",
    presetData: { type: "ultra-badge", title: "ACHIEVEMENT BADGE", icon: "🎖️", badgeName: "CLIMATE MASTER BADGE", badgeStatus: "MISSION COMPLETE", congrats: "Congratulations! You successfully built a climate monitor!" }
  },
  "programming-studio": {
    name: "Programming Studio Lab",
    type: "programming-studio",
    icon: "💻",
    desc: "Full code editor studio block.",
    presetData: { type: "programming-studio", title: "PROGRAMMING STUDIO", icon: "💻", language: "python", code: "while True:\n    sensor.measure()\n    print('T:', sensor.temperature())\n    time.sleep(2)" }
  },
  "syntax-box": {
    name: "Syntax & API Quick Ref",
    type: "syntax-box",
    icon: "📖",
    desc: "API method reference card.",
    presetData: { type: "syntax-box", title: "SYNTAX QUICK REF", icon: "📖", content: "dht.DHT11(pin) - Initialize sensor | sensor.measure() - Read data | sensor.temperature() - Get °C" }
  },
  "designer-studio": {
    name: "Hardware Designer Studio",
    type: "designer-studio",
    icon: "📐",
    desc: "CAD and breadboard design lab.",
    presetData: { type: "designer-studio", title: "HARDWARE DESIGNER STUDIO", icon: "📐", steps: [{ stepNum: 1, title: "Place Microcontroller", desc: "Align UltraCore on center breadboard rail." }] }
  }
};

/**
 * MASTERPIECE AI GENERATION PROMPT SPECIFICATION (STRICT USER CONTENT FIDELITY)
 */
window.ULTRAMINDS_MASTER_PROMPT = `
You are the Lead STEM Book Author, DK/National Geographic Publishing Editor, and Senior Robotics & AI Curriculum Architect for UltraMinds Publisher.

YOUR TASK:
Transform raw input text, notes, or chapter outline into a MIND-BLOWING, ULTRA-CREATIVE 5-8 PAGE PRINT-READY STEM TEXTBOOK CHAPTER JSON.

STRICT ACCURACY RULES:
1. Preserve 100% of the raw input domain topics, component lists, code blocks, testing steps, and next mission teasers. NEVER inject unrelated climate/DHT11 data into non-climate missions!
2. Map raw input sections into structured UltraMinds cards:
   - 'build-steps' / 'designer-studio': Include ALL steps, component lists, and properties tables ('steps': [{ 'stepNum': 1, 'title': 'Main Layout', 'desc': '...', 'pinTable': [{ 'from': '...', 'to': '...' }] }]).
   - 'code-snippet' / 'programming-studio': Put all code logic into 'code' string.
   - 'syntax-box': Put quick ref into 'content'.
   - 'testing-lab': Put test cases into 'content' or 'steps'.
   - 'common-mistakes': Put troubleshooting items into 'mistakes': [{ 'issue': '...', 'fix': '...' }].
   - 'think-engineer': Put decision prompt question into 'question' and comparison options into 'scenario': { 'left': { 'label': '...', 'feel': '...', 'status': 'ok' }, 'right': { 'label': '...', 'feel': '...', 'status': 'ok' } }.
   - 'ultra-badge': Put achievement title into 'badgeName', status into 'badgeStatus', and congrats text into 'congrats'.
   - 'next-preview': Put upcoming mission teaser into 'content'.

3. Structure the chapter across 5 to 8 A4 pages cleanly.

OUTPUT FORMAT: Return strictly valid JSON (No conversational markdown text outside JSON):
{
  "missionNumber": "11",
  "title": "SMART STUDENT PLANNER",
  "missionTitle": "SMART STUDENT PLANNER",
  "missionSubtitle": "Organize Today. Achieve Tomorrow.",
  "guideName": "Commander Nova",
  "guideRole": "Lead STEM Astronaut Guide",
  "theme": "theme-blue",
  "pages": [
    {
      "pageNumber": 1,
      "sections": [
        { "type": "nova-card", "title": "MISSION BRIEF", "icon": "📖", "content": "..." },
        { "type": "real-world", "title": "REAL WORLD CONNECTION", "icon": "🌐", "content": "..." }
      ]
    }
  ]
}
`;
