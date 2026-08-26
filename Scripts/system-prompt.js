/**
 * UltraMinds 52-Element Standard Library & Ultra-Precision Masterpiece Prompt System (V20)
 * Complete rewrite — matches sample pages 1-5 exactly with rich JSON schema
 */

window.ULTRAMINDS_50_ELEMENTS = {
  "floating-clipart": { name: "Floating Clipart Sticker (Mascot)", type: "floating-clipart", icon: "🧑‍🚀", desc: "Borderless floating PNG sticker/mascot (Commander Nova) that floats anywhere on page.", presetData: { type: "floating-clipart", title: "Commander Nova Clipart", imgUrl: "" } },
  "image-holder": { name: "Normal Image Holder Card", type: "image-holder", icon: "🖼️", desc: "Clean standalone image card with top title capsule, image box, and caption.", presetData: { type: "image-holder", title: "FIGURE 1.1", icon: "🖼️", imgUrl: "", caption: "Figure 1.1 Hardware Diagram", objectFit: "cover" } },
  "incard-image-holder": { name: "In-Card Image Holder", type: "incard-image-holder", icon: "🖼️", desc: "Compact in-card image box.", presetData: { type: "incard-image-holder", title: "Image 1", imgUrl: "" } },
  "page-banner": { name: "Page Type Banner", type: "page-banner", icon: "🏷️", desc: "Styled page-type header banner (Engineering Explorer, Build Lab, Logic Builder, Innovation Studio).", presetData: { type: "page-banner", pageType: "engineering-explorer", pageNum: 2, title: "ENGINEERING EXPLORER", subtitle: "OBSERVE. DISCOVER. UNDERSTAND.", icon: "🔍" } },
  "mission-story": { name: "Mission Story", type: "mission-story", icon: "📖", desc: "Narrative context setting the real-world engineering challenge.", presetData: { type: "mission-story", title: "MISSION STORY", icon: "📖", content: "Commander Nova has received a request..." } },
  "real-world": { name: "Real World Impact", type: "real-world", icon: "🌐", desc: "Industry application connecting concept to commercial tech.", presetData: { type: "real-world", title: "REAL WORLD", icon: "🌐", items: ["Smart Classrooms", "Greenhouses", "Museums"], bottomNote: "Engineers use sensors to make the environment better." } },
  "curiosity-box": { name: "Curiosity Box", type: "curiosity-box", icon: "💡", desc: "Hook question or intriguing STEM phenomenon.", presetData: { type: "curiosity-box", title: "CURIOSITY BOX", icon: "💡", content: "Humidity affects how we feel!" } },
  "stem-fact": { name: "STEM Fact + OLED", type: "stem-fact", icon: "⚙️", desc: "Fast scientific insight paired with live hardware preview.", presetData: { type: "stem-fact", title: "STEM FACT", icon: "⚙️", content: "Sensors like the DHT11 collect data thousands of times per day.", oledPreview: "Temp: 26.8°C\nHumi: 65%" } },
  "mission-objectives": { name: "Mission Objectives Grid", type: "mission-objectives", icon: "🎯", desc: "Structured 4-cell goal grid for the mission.", presetData: { type: "mission-objectives", title: "MISSION OBJECTIVES", icon: "🎯", objectives: [{ num: 1, text: "Read Live Temp", icon: "🌡️" }, { num: 2, text: "Read Live Humidity", icon: "💧" }, { num: 3, text: "Store Variables", icon: "📁" }, { num: 4, text: "Display on OLED", icon: "🖥️" }] } },
  "think-engineer": { name: "Think Like an Engineer", type: "think-engineer", icon: "🧠", desc: "Interactive scenario decision prompt.", presetData: { type: "think-engineer", title: "THINK LIKE AN ENGINEER", icon: "🧠", question: "If two classrooms have the same temperature but different humidity, will they feel the same?", answerLines: 2, scenario: { left: { label: "Room A", temp: "30°C", hum: "40%", feel: "Feels Comfortable", status: "ok" }, right: { label: "Room B", temp: "30°C", hum: "80%", feel: "Feels Hot & Sticky", status: "warn" } } } },
  "concept-card": { name: "Core Concept Card", type: "concept-card", icon: "📘", desc: "Theoretical explanation of the chapter's core topic.", presetData: { type: "concept-card", title: "HOW SENSORS READ DATA", icon: "📘", content: "Microcontrollers read electrical voltage signals from sensors." } },
  "component-spotlight": { name: "Component Spotlight", type: "component-spotlight", icon: "🔬", desc: "Detailed anatomical breakdown of a specific hardware piece with specs.", presetData: { type: "component-spotlight", title: "MEET THE DHT11 SENSOR", icon: "🔬", componentName: "DHT11", componentSubtitle: "TEMPERATURE & HUMIDITY SENSOR", features: ["Measures Temperature and Humidity", "Easy to use", "Low power consumption", "High reliability"], pinConfig: [{ num: 1, label: "VCC", color: "red", desc: "Power Supply (3.3V – 5V)" }, { num: 2, label: "DATA", color: "blue", desc: "Digital Data Output" }, { num: 3, label: "GND", color: "black", desc: "Ground" }], specs: [{ icon: "🌡️", label: "Temperature Range", value: "0°C to 50°C" }, { icon: "💧", label: "Humidity Range", value: "20% to 90% RH" }, { icon: "🎯", label: "Accuracy", value: "Temperature: ±1°C\nHumidity: ±5% RH" }, { icon: "⚡", label: "Operating Voltage", value: "3.3V to 5V DC" }] } },
  "observe-card": { name: "Observe & Answer Card", type: "observe-card", icon: "👁️", desc: "Observation image + numbered Q&A with dashed answer lines.", presetData: { type: "observe-card", title: "OBSERVE & ANSWER", icon: "👁️", questions: ["What can you see in this station?", "Which part do you think measures temperature?", "Which part might measure humidity?", "Why do you think we need both temperature and humidity data?"] } },
  "inside-sensor": { name: "Inside the Sensor Diagram", type: "inside-sensor", icon: "🔬", desc: "Split diagram showing internal sensor components (temperature side + humidity side).", presetData: { type: "inside-sensor", title: "INSIDE THE SENSOR – HOW DOES IT WORK?", icon: "🔬", intro: "DHT11 has two sensing parts inside:", leftTitle: "TEMPERATURE SENSING ELEMENT", leftContent: "A thermistor measures the surrounding temperature.", rightTitle: "HUMIDITY SENSING ELEMENT", rightContent: "A capacitive humidity sensor detects the moisture in the air.", bottomNote: "The sensor converts these changes into electrical signals and sends them to the microcontroller." } },
  "comparison-vs": { name: "Compare & Understand VS Box", type: "comparison-vs", icon: "⚖️", desc: "Two-column side-by-side comparison with VS badge in center.", presetData: { type: "comparison-vs", title: "COMPARE & UNDERSTAND", icon: "⚖️", leftTitle: "OUR HUMAN SENSES", leftItems: [{ icon: "👁️", text: "We feel hot or cold using our skin." }, { icon: "💧", text: "We feel humidity but cannot measure it exactly." }], rightTitle: "ELECTRONIC SENSORS", rightItems: [{ icon: "🌡️", text: "Sensors measure temperature in °C very accurately." }, { icon: "💧", text: "Sensors measure humidity in %RH accurately." }], bottomNote: "SENSORS HELP US MEASURE WHAT OUR SENSES CANNOT MEASURE ACCURATELY." } },
  "build-steps": { name: "Build Steps / Wiring Lab", type: "build-steps", icon: "🛠️", desc: "Step-by-step numbered build guide with 4 columns, each with image + pin table.", presetData: { type: "build-steps", title: "BUILD LAB", icon: "🛠️", steps: [{ stepNum: 1, title: "CONNECT DHT11 SENSOR", desc: "Connect the DHT11 sensor to the DHT11 port.", pinTable: [{ label: "VCC", arrow: "3.3V" }, { label: "DATA", arrow: "DHT11 (Signal)" }, { label: "GND", arrow: "GND" }] }, { stepNum: 2, title: "CONNECT OLED DISPLAY (I2C)", desc: "Connect the OLED display using the I2C port.", pinTable: [{ label: "VCC", arrow: "3.3V" }, { label: "GND", arrow: "GND" }, { label: "SDA", arrow: "I2C SDA (D21)" }, { label: "SCL", arrow: "I2C SCL (D22)" }] }] } },
  "code-snippet": { name: "Code Snippet Box", type: "code-snippet", icon: "💻", desc: "Syntax-highlighted code container.", presetData: { type: "code-snippet", title: "PYTHON LOGIC PREVIEW", icon: "💻", language: "python", code: "import dht\nfrom machine import Pin\n\nsensor = dht.DHT11(Pin(4))\nsensor.measure()\nprint('Temp:', sensor.temperature())" } },
  "common-mistakes": { name: "Common Mistakes / Debug", type: "common-mistakes", icon: "⚠️", desc: "Alert-styled troubleshooting table.", presetData: { type: "common-mistakes", title: "COMMON MISTAKES", icon: "⚠️", mistakes: [{ issue: "Wrong VCC connection", icon: "🔌", fix: "Check: VCC → 3.3V (NOT 5V)" }, { issue: "Loose or jumper wires", icon: "🔧", fix: "Make sure wires are firmly connected." }] } },
  "flowchart-sequence": { name: "Flow of Logic Diagram", type: "flowchart-sequence", icon: "🔄", desc: "Linear box-arrow flowchart showing program logic steps.", presetData: { type: "flowchart-sequence", title: "FLOW OF LOGIC", icon: "🔄", steps: [{ label: "Start", type: "start" }, { label: "Read Temperature from DHT11", type: "process", desc: "We read temperature and store it in the variable temp." }, { label: "Read Humidity from DHT11", type: "process", desc: "We read humidity and store it in the variable humi." }, { label: "Store in Variables (temp, humi)", type: "process", desc: "Variables help us remember data." }, { label: "Display both values on OLED", type: "process", desc: "We show the values on the OLED screen." }, { label: "Wait 2 Seconds", type: "wait" }, { label: "Repeat Forever", type: "end" }] } },
  "blocks-code": { name: "MIT Blocks Logic Display", type: "blocks-code", icon: "🧱", desc: "Visual MIT App Inventor / Blocks-style code display with colored blocks.", presetData: { type: "blocks-code", title: "BLOCKS LOGIC (MIT APP INVENTOR)", icon: "🧱", blocks: [] } },
  "variables-at-work": { name: "Variables at Work Panel", type: "variables-at-work", icon: "📌", desc: "Variable definition cards with icon + name + example value.", presetData: { type: "variables-at-work", title: "VARIABLES AT WORK", icon: "📌", intro: "We store values in variables so we can use them again.", variables: [{ name: "temp", label: "Temperature", icon: "🌡️", desc: "Stores temperature value in °C", example: "26.8" }, { name: "humi", label: "Humidity", icon: "💧", desc: "Stores humidity value in %RH", example: "65" }] } },
  "predict-think": { name: "Predict & Think Questions", type: "predict-think", icon: "🤔", desc: "Numbered prediction questions with answer lines.", presetData: { type: "predict-think", title: "PREDICT & THINK", icon: "🤔", questions: ["What will happen if the sensor is removed?", "What if humidity is 100%?", "What if temperature suddenly changes?", "What if the OLED display is not connected?"] } },
  "challenge-box": { name: "Challenge Box", type: "challenge-box", icon: "🏆", desc: "Colored challenge card with target icon.", presetData: { type: "challenge-box", title: "CHALLENGE", icon: "🏆", content: "Modify the logic to show a 'Comfort' message when temperature is between 20°C and 28°C and humidity between 40% and 70%." } },
  "oled-preview": { name: "OLED Screen Preview", type: "oled-preview", icon: "🖥️", desc: "Realistic OLED screen mockup card.", presetData: { type: "oled-preview", title: "ON OLED DISPLAY", icon: "🖥️", intro: "This is what we see on the OLED screen.", screenText: "Temp: 26.8°C\nHumi: 65%" } },
  "mission-progress": { name: "Mission Progress Tracker", type: "mission-progress", icon: "📈", desc: "Numbered circle progress tracker (1-5 with checkmarks).", presetData: { type: "mission-progress", title: "MISSION PROGRESS", icon: "📈", totalSteps: 5, completedSteps: 2 } },
  "mini-upgrade": { name: "Mini Upgrade Card", type: "mini-upgrade", icon: "⬆️", desc: "Temperature/mood upgrade grid with OLED screen examples.", presetData: { type: "mini-upgrade", title: "MINI UPGRADE", icon: "⬆️", intro: "Let's add mood icons on OLED based on temperature!", upgrades: [{ condition: "Temp < 18°C", mood: "COLD", moodIcon: "🥶", color: "blue", oledText: "16.5°C 55%\n❄️ COLD" }, { condition: "18°C ≤ Temp ≤ 28°C", mood: "COMFORTABLE", moodIcon: "😊", color: "green", oledText: "24.6°C 58%\n😊 COMFORTABLE" }, { condition: "28°C < Temp ≤ 35°C", mood: "WARM", moodIcon: "😟", color: "orange", oledText: "31.7°C 62%\n😟 WARM" }, { condition: "Temp > 35°C", mood: "HOT", moodIcon: "😡", color: "red", oledText: "37.2°C 70%\n😡 HOT" }] } },
  "real-challenge": { name: "Real Challenge Flow", type: "real-challenge", icon: "🚀", desc: "Process flow diagram for the real-world challenge with steps and icons.", presetData: { type: "real-challenge", title: "REAL CHALLENGE", icon: "🚀", challengeTitle: "Design a Smart Classroom Comfort System", challengeDesc: "Build a system that helps maintain a comfortable environment automatically.", flowSteps: [{ label: "Read Temp &\nHumidity", icon: "🌡️" }, { label: "Check Conditions", icon: "🔍" }, { label: "Take Action\nTurn ON Fan\n(If Temp > 30°C)", icon: "💨" }, { label: "Alert on OLED\nToo Hot!\nFan ON", icon: "🖥️" }], addMore: [{ icon: "📢", label: "Buzzer Alert" }, { icon: "💡", label: "LED Indicator" }, { icon: "🪟", label: "Window Reminder" }, { icon: "☁️", label: "Data Log (Future)" }], bottomNote: "Think like an innovator. Create solutions for real-world problems!" } },
  "engineers-everywhere": { name: "Engineers Use This Everywhere!", type: "engineers-everywhere", icon: "🏭", desc: "4-cell industry application grid showing real-world use cases.", presetData: { type: "engineers-everywhere", title: "ENGINEERS USE THIS EVERYWHERE!", icon: "🏭", industries: [{ title: "SMART AGRICULTURE", desc: "Sensors help farmers decide irrigation and protect crops.", imgKeyword: "agriculture" }, { title: "SMART BUILDINGS", desc: "HVAC systems use sensor data to save energy and keep spaces comfortable.", imgKeyword: "building" }, { title: "WEATHER STATIONS", desc: "Collects data to predict weather and warn about extreme conditions.", imgKeyword: "weather" }, { title: "SPACE EXPLORATION", desc: "Astronauts live in controlled environments using these same sensors.", imgKeyword: "space" }] } },
  "mission-review-table": { name: "Mission Review Table", type: "mission-review-table", icon: "📝", desc: "Checkmark Q&A summary table.", presetData: { type: "mission-review-table", title: "MISSION REVIEW", icon: "📝", rows: [{ question: "What did we build?", answer: "A Smart Climate Monitor" }, { question: "Which sensor did we use?", answer: "DHT11 (Temperature & Humidity)" }, { question: "Which values did we read?", answer: "Temperature (°C), Humidity (%RH)" }, { question: "Where did we display?", answer: "OLED Display" }, { question: "What did we learn?", answer: "Reading sensors, storing variables, displaying values and using logic" }, { question: "Where is this used?", answer: "Weather stations, smart homes, greenhouses, industries & more!" }] } },
  "ultra-badge": { name: "Achievement Badge", type: "ultra-badge", icon: "🎖️", desc: "Badge reward for mission completion.", presetData: { type: "ultra-badge", title: "ULTRA BADGE", icon: "🎖️", badgeName: "CLIMATE ENGINEER", badgeSubtitle: "MISSION 14 COMPLETE!", congrats: "You have successfully built your Smart Climate Monitor and understood how to read and display real-world data!", mascotNote: "Great work, Commander Nova!" } },
  "beyond-mission": { name: "Beyond Today's Mission", type: "beyond-mission", icon: "🚀", desc: "Today → Next → Future three-step progression card.", presetData: { type: "beyond-mission", title: "BEYOND TODAY'S MISSION", icon: "🚀", steps: [{ label: "Today", icon: "📡", desc: "You read and displayed temperature & humidity." }, { label: "Next", icon: "☁️", desc: "You will send this data to the cloud!" }, { label: "Future", icon: "📱", desc: "You will view it on a mobile app & analyze it with AI!" }], bottomNote: "Every great engineer starts with one simple mission, and then builds something that changes the world!" } },
  "next-preview": { name: "Next Chapter Teaser", type: "next-preview", icon: "⏩", desc: "Teaser card for upcoming mission.", presetData: { type: "next-preview", title: "NEXT MISSION PREVIEW", icon: "⏩", content: "In Mission 15, we will build a Smart Automated Plant Irrigation System!" } },
  "space-filler": { name: "Space Filler Spacer", type: "space-filler", icon: "👻", desc: "Invisible whitespace card to balance page layout.", presetData: { type: "space-filler", title: "SPACE FILLER", icon: "👻", content: "Custom Whitespace Spacer" } },
  "did-you-know": { name: "Did You Know?", type: "did-you-know", icon: "💡", desc: "Fascinating science trivia card.", presetData: { type: "did-you-know", title: "DID YOU KNOW?", icon: "💡", content: "Weather stations on Mount Everest use similar sensors to help climbers and scientists stay safe." } },
  "mission-challenge": { name: "Mission Challenge", type: "mission-challenge", icon: "🔍", desc: "End-of-page critical thinking challenge.", presetData: { type: "mission-challenge", title: "MISSION CHALLENGE", icon: "🔍", question: "Can one sensor measure everything in the environment? List two things that DHT11 cannot measure.", answerFields: ["1. ............", "2. ............"] } },
  "engineer-tip": { name: "Engineer Tip", type: "engineer-tip", icon: "💡", desc: "Professional engineering tip card.", presetData: { type: "engineer-tip", title: "ENGINEER TIP", icon: "💡", content: "Good connections + careful work = Great inventions! Take your time and enjoy the build." } },
  "nova-card": { name: "Commander Nova Guidance", type: "nova-card", icon: "🧑‍🚀", desc: "Character guide tip box.", presetData: { type: "nova-card", title: "COMMANDER NOVA TIP", icon: "🧑‍🚀", content: "Careful work leads to great inventions!" } },
  "programming-studio": { name: "Programming Studio Lab", type: "programming-studio", icon: "💻", desc: "Full code editor studio block.", presetData: { type: "programming-studio", title: "PROGRAMMING STUDIO", icon: "💻", language: "python", code: "while True:\n    sensor.measure()\n    print('T:', sensor.temperature())\n    time.sleep(2)" } },
  "pro-tip": { name: "Pro Tip Card", type: "pro-tip", icon: "⭐", desc: "Highlighted professional tip box.", presetData: { type: "pro-tip", title: "PRO TIP", icon: "⭐", content: "Always power OFF the board while making connections. Double check everything before uploading code!" } },
  "in-this-lab": { name: "In This Lab You Will", type: "in-this-lab", icon: "🧪", desc: "Lab checklist card.", presetData: { type: "in-this-lab", title: "IN THIS LAB YOU WILL", icon: "🧪", items: ["Connect DHT11 sensor", "Connect OLED display", "Upload program", "Read temperature & humidity on the OLED!"] } },
  "device-ready": { name: "Your Device Is Ready!", type: "device-ready", icon: "✅", desc: "Device callout image with labeled arrows.", presetData: { type: "device-ready", title: "YOUR DEVICE IS READY!", icon: "✅", callouts: [{ side: "left-top", text: "Reads live Temperature in °C" }, { side: "left-bottom", text: "Reads live Humidity in %RH" }, { side: "right-top", text: "Shows both values on OLED display" }, { side: "right-bottom", text: "Powered by USB-C 5V (Power Bank or Adapter)" }] } },
  "worksheet-card": { name: "Worksheet / Assessment Card", type: "worksheet-card", icon: "📝", desc: "Q&A worksheet with response lines.", presetData: { type: "worksheet-card", title: "MISSION ASSESSMENT", icon: "📝", content: "Q1: What is the purpose of the DHT11 sensor?\nQ2: Name two pins on the DHT11." } },
  "drawing-canvas": { name: "Drawing Canvas / Design Space", type: "drawing-canvas", icon: "✏️", desc: "Blank dot-grid drawing area.", presetData: { type: "drawing-canvas", title: "DESIGN WORKSPACE", icon: "✏️", content: "Draw your flowchart or design here." } },
  "vocabulary-builder": { name: "STEM Vocabulary Builder", type: "vocabulary-builder", icon: "📚", desc: "Key terminology definitions.", presetData: { type: "vocabulary-builder", title: "STEM VOCABULARY", icon: "📚", content: "Thermistor: A resistor whose resistance changes with temperature." } },
  "quick-recap": { name: "Quick Chapter Recap", type: "quick-recap", icon: "⚡", desc: "Bullet summary of key takeaways.", presetData: { type: "quick-recap", title: "QUICK RECAP", icon: "⚡", content: "• VCC ➔ 3.3V Power\n• Signal ➔ Pin D4\n• MicroPython dht library measures temp & humidity." } },
  "career-spotlight": { name: "STEM Career Spotlight", type: "career-spotlight", icon: "🎓", desc: "Career pathways in engineering & tech.", presetData: { type: "career-spotlight", title: "CAREER SPOTLIGHT", icon: "🎓", content: "Environmental Engineers design technologies to control climate and manage air quality." } },
  "safety-card": { name: "Lab Safety Card", type: "safety-card", icon: "🛑", desc: "Important safety warnings.", presetData: { type: "safety-card", title: "LAB SAFETY WARNING", icon: "🛑", content: "Never expose electronic sensors to direct water or liquids unless sealed in a waterproof probe!" } },
  "knowledge-check": { name: "Knowledge Check Quiz", type: "knowledge-check", icon: "❓", desc: "Quick self-assessment quiz.", presetData: { type: "knowledge-check", title: "KNOWLEDGE CHECK", icon: "❓", content: "Q: Which pin on the DHT11 outputs sensor data?" } },
  "qr-resources": { name: "QR Code & Resource Links", type: "qr-resources", icon: "🔗", desc: "Links to video tutorials & datasheets.", presetData: { type: "qr-resources", title: "ONLINE RESOURCES", icon: "🔗", content: "Scan QR code or visit ultraminds.io/m14 for video tutorials." } }
};

/**
 * ULTRAMINDS PUBLISHER V20 — MASTERPIECE AI GENERATION PROMPT
 * Strict 100% content fidelity. Exact page templates. Premium $20 book quality output.
 */
window.ULTRAMINDS_MASTER_PROMPT = `
You are the Executive Art Director and Chief Architect for UltraMinds Engineering Magazine — the #1 premium STEM learning book for kids aged 10-16.

YOUR MANDATE: Convert raw educational content into a perfect, ultra-detailed UltraMinds Mission JSON object.

== GOLDEN RULES (NEVER VIOLATE) ==
RULE 1 - ZERO OMISSION: Every single word, question, code line, bullet, table row, and step from the raw input MUST appear in the output. Never summarize, skip, shorten, or paraphrase any content. Pin-to-pin fidelity is non-negotiable.
RULE 2 - PRESENTATION ONLY: You arrange and style content. You do not change, rewrite, or invent curriculum content.
RULE 3 - PREMIUM QUALITY: Every page must look like a $20 published engineering textbook. Use Apple, National Geographic Kids, DK Encyclopedias, LEGO Education as inspiration.
RULE 4 - RICH STRUCTURES: Always use the richest possible JSON structure. Never use generic "content" strings when a richer array/object structure is available for the card type.
RULE 5 - FULL PAGES: Each page must be completely filled. Use split-layout (side-by-side columns) wherever possible. Never waste space.
RULE 6 - PAGE TEMPLATES: Match the correct page template type for each section of content.

== THE 5 ULTRAMINDS PAGE TEMPLATES ==

PAGE TYPE 1 — "cover" (Page 1 of every mission)
  - Mission number pill + Mission title + subtitle (large header)
  - Commander Nova mascot image (left side of header)
  - RIGHT side: mission-specific illustration
  - MAIN CONTENT: 2-column layout:
    LEFT: mission-story card (tall, with inline image stickers)
    RIGHT: stacked cards: real-world + curiosity-box + stem-fact
  - FULL WIDTH: mission-objectives (4-column numbered grid)
  - FULL WIDTH: think-engineer (scenario comparison A vs B)
  - FOOTER: code pill sequence + NEXT MISSION label

PAGE TYPE 2 — "engineering-explorer" (Observation & Components page)
  - Page banner: "ENGINEERING EXPLORER" with "OBSERVE. DISCOVER. UNDERSTAND." subtitle
  - 2-column layout:
    LEFT: observe-card (image + numbered questions with answer lines)
    RIGHT: component-spotlight (component name, features list, pin-config table, specs 4-cell grid)
  - 2-column layout:
    LEFT: inside-sensor card (red/blue split diagram)
    RIGHT: comparison-vs card (human senses vs electronic sensors)
  - FULL WIDTH: mission-challenge card
  - FOOTER: did-you-know + next-page-preview

PAGE TYPE 3 — "build-lab" (Hardware Assembly page)
  - Page banner: "BUILD LAB" with subtitle
  - 2-column layout:
    LEFT: in-this-lab checklist + pro-tip card
    RIGHT: Large image of the board/hardware with callout arrows
  - FULL WIDTH: build-steps (4-column numbered steps: connect sensor, connect display, upload, observe)
    Each step: step number + orange title + description + image placeholder + pin table
  - 2-column layout:
    LEFT: device-ready card (assembled device image with callouts)
    RIGHT: common-mistakes alert table (icon + issue + fix)
  - FOOTER: engineer-tip + mascot + next-page-preview

PAGE TYPE 4 — "logic-builder" (Programming Logic page)
  - Page banner: "LOGIC BUILDER" with subtitle
  - 3-column layout:
    LEFT (narrow): flowchart-sequence (boxes with arrows, plus explanation text for each step)
    CENTER (wide): blocks-code (MIT App Inventor / Blockly visual code display) + variables-at-work sidebar
    RIGHT (narrow): variables-at-work card + oled-preview
  - 2-column layout:
    LEFT: code-snippet (Python code, full syntax)
    RIGHT: predict-think (numbered questions) + challenge-box
  - FOOTER: engineer-tip + next-you-will-learn + mission-progress (1-2-3-4-5 tracker)

PAGE TYPE 5 — "innovation-studio" (Expansion & Review page)
  - Page banner: "INNOVATION STUDIO" with subtitle
  - 2-column layout:
    LEFT: mini-upgrade card (temperature mood icon grid with OLED examples)
    RIGHT: real-challenge (process flow + add-more components grid)
  - 2-column layout:
    LEFT: did-you-know (multi-fact list) + engineers-everywhere (4-industry grid)
    RIGHT column actually merged into engineers-everywhere full row
  - FULL WIDTH: engineers-everywhere (4-industry cards: Smart Agriculture, Smart Buildings, Weather Stations, Space)
  - 2-column layout:
    LEFT: mission-review-table (checkmark Q&A)
    RIGHT: ultra-badge + mascot
  - FULL WIDTH: beyond-mission (Today → Next → Future progression)
  - FOOTER: next-mission-preview + brand slogan

== RICH JSON CARD SCHEMAS ==

For "mission-story":
{ "type": "mission-story", "title": "MISSION STORY", "icon": "📖", "content": "Full narrative text here word for word", "images": ["keyword1", "keyword2"] }

For "real-world":
{ "type": "real-world", "title": "REAL WORLD", "icon": "🌐", "items": ["Item 1", "Item 2", "Item 3"], "bottomNote": "Closing statement." }

For "mission-objectives":
{ "type": "mission-objectives", "title": "MISSION OBJECTIVES", "icon": "🎯", "objectives": [{ "num": 1, "text": "Exact text from source", "icon": "🌡️" }, ...] }

For "think-engineer":
{ "type": "think-engineer", "title": "THINK LIKE AN ENGINEER", "icon": "🧠", "question": "Exact question text", "answerLines": 2, "scenario": { "left": { "label": "Room A", "temp": "30°C", "hum": "40%", "feel": "Feels Comfortable", "status": "ok" }, "right": { "label": "Room B", "temp": "30°C", "hum": "80%", "feel": "Feels Hot & Sticky", "status": "warn" } } }

For "component-spotlight":
{ "type": "component-spotlight", "title": "MEET TODAY'S COMPONENT", "icon": "🔬", "componentName": "DHT11", "componentSubtitle": "TEMPERATURE & HUMIDITY SENSOR", "features": ["Feature 1 exact text", "Feature 2"], "pinConfig": [{ "num": 1, "label": "VCC", "color": "red", "desc": "Power Supply (3.3V – 5V)" }, { "num": 2, "label": "DATA", "color": "blue", "desc": "Digital Data Output" }, { "num": 3, "label": "GND", "color": "black", "desc": "Ground" }], "specs": [{ "icon": "🌡️", "label": "Temperature Range", "value": "0°C to 50°C" }, { "icon": "💧", "label": "Humidity Range", "value": "20% to 90% RH" }, { "icon": "🎯", "label": "Accuracy", "value": "Temperature: ±1°C\\nHumidity: ±5% RH" }, { "icon": "⚡", "label": "Operating Voltage", "value": "3.3V to 5V DC" }] }

For "inside-sensor":
{ "type": "inside-sensor", "title": "INSIDE THE SENSOR – HOW DOES IT WORK?", "icon": "🔬", "intro": "DHT11 has two sensing parts inside:", "leftTitle": "TEMPERATURE SENSING ELEMENT", "leftContent": "Exact text from source", "rightTitle": "HUMIDITY SENSING ELEMENT", "rightContent": "Exact text from source", "bottomNote": "Exact text from source" }

For "comparison-vs":
{ "type": "comparison-vs", "title": "COMPARE & UNDERSTAND", "icon": "⚖️", "leftTitle": "OUR HUMAN SENSES", "leftItems": [{ "icon": "👁️", "text": "Exact text" }, { "icon": "💧", "text": "Exact text" }], "rightTitle": "ELECTRONIC SENSORS", "rightItems": [{ "icon": "🌡️", "text": "Exact text" }, { "icon": "💧", "text": "Exact text" }], "bottomNote": "EXACT CONCLUDING STATEMENT IN CAPS." }

For "build-steps":
{ "type": "build-steps", "title": "BUILD LAB", "icon": "🛠️", "steps": [{ "stepNum": 1, "title": "CONNECT DHT11 SENSOR", "desc": "Exact instruction", "pinTable": [{ "label": "VCC", "color": "red", "arrow": "3.3V" }, { "label": "DATA", "color": "blue", "arrow": "DHT11 (Signal)" }, { "label": "GND", "color": "black", "arrow": "GND" }] }] }

For "common-mistakes":
{ "type": "common-mistakes", "title": "COMMON MISTAKES", "icon": "⚠️", "mistakes": [{ "icon": "🔌", "issue": "Wrong VCC connection", "fix": "Check: VCC → 3.3V (NOT 5V)" }] }

For "flowchart-sequence":
{ "type": "flowchart-sequence", "title": "FLOW OF LOGIC", "icon": "🔄", "steps": [{ "label": "Start", "type": "start" }, { "label": "Read Temperature from DHT11", "type": "process", "desc": "Exact explanation text" }, { "label": "Repeat Forever", "type": "loop" }] }

For "code-snippet":
{ "type": "code-snippet", "title": "PYTHON LOGIC PREVIEW", "icon": "💻", "language": "python", "code": "Exact code from source, preserving all indentation" }

For "variables-at-work":
{ "type": "variables-at-work", "title": "VARIABLES AT WORK", "icon": "📌", "intro": "We store values in variables so we can use them again.", "variables": [{ "name": "temp", "label": "Temperature", "icon": "🌡️", "desc": "Stores temperature value in °C", "example": "26.8" }] }

For "predict-think":
{ "type": "predict-think", "title": "PREDICT & THINK", "icon": "🤔", "questions": ["Exact question 1", "Exact question 2"] }

For "challenge-box":
{ "type": "challenge-box", "title": "CHALLENGE", "icon": "🏆", "content": "Exact challenge text from source." }

For "mini-upgrade":
{ "type": "mini-upgrade", "title": "MINI UPGRADE", "icon": "⬆️", "intro": "Let's add mood icons on OLED based on temperature!", "upgrades": [{ "condition": "Temp < 18°C", "show": "Show 'COLD'", "mood": "COLD", "moodIcon": "🥶", "color": "blue", "oledText": "16.5°C 55%\\n❄️ COLD" }] }

For "real-challenge":
{ "type": "real-challenge", "title": "REAL CHALLENGE", "icon": "🚀", "challengeTitle": "Design a Smart Classroom Comfort System", "challengeDesc": "Exact description", "flowSteps": [{ "label": "Exact step label", "icon": "🌡️" }], "addMore": [{ "icon": "📢", "label": "Buzzer Alert" }], "bottomNote": "Exact note." }

For "engineers-everywhere":
{ "type": "engineers-everywhere", "title": "ENGINEERS USE THIS EVERYWHERE!", "icon": "🏭", "industries": [{ "title": "SMART AGRICULTURE", "desc": "Exact text", "imgKeyword": "agriculture" }] }

For "mission-review-table":
{ "type": "mission-review-table", "title": "MISSION REVIEW", "icon": "📝", "rows": [{ "question": "What did we build?", "answer": "Exact answer" }] }

For "ultra-badge":
{ "type": "ultra-badge", "title": "ULTRA BADGE", "icon": "🎖️", "badgeName": "CLIMATE ENGINEER", "badgeSubtitle": "MISSION 14 COMPLETE!", "congrats": "Exact congratulations text from source.", "mascotNote": "Exact mascot speech from source." }

For "beyond-mission":
{ "type": "beyond-mission", "title": "BEYOND TODAY'S MISSION", "icon": "🚀", "steps": [{ "label": "Today", "icon": "📡", "desc": "Exact text" }, { "label": "Next", "icon": "☁️", "desc": "Exact text" }, { "label": "Future", "icon": "📱", "desc": "Exact text" }], "bottomNote": "Exact motivational note from source." }

For "split-layout" (two columns side by side):
{ "type": "split-layout", "left": { /* any card object */ }, "right": { /* any card object */ } }

For "observe-card":
{ "type": "observe-card", "title": "OBSERVE & ANSWER", "icon": "👁️", "introText": "Look carefully at this weather station. What do you notice?", "questions": ["Exact Q1?", "Exact Q2?", "Exact Q3?", "Exact Q4?"] }

For "mission-challenge":
{ "type": "mission-challenge", "title": "MISSION CHALLENGE", "icon": "🔍", "question": "Exact question text.", "answerFields": ["1. ...", "2. ..."] }

For "page-banner":
{ "type": "page-banner", "pageType": "engineering-explorer", "pageNum": 2, "title": "ENGINEERING EXPLORER", "subtitle": "OBSERVE. DISCOVER. UNDERSTAND.", "icon": "🔍" }
pageType options: "engineering-explorer" | "build-lab" | "logic-builder" | "innovation-studio"

For "in-this-lab":
{ "type": "in-this-lab", "title": "IN THIS LAB YOU WILL", "icon": "🧪", "items": ["Exact item 1", "Exact item 2"] }

For "pro-tip":
{ "type": "pro-tip", "title": "PRO TIP", "icon": "⭐", "content": "Exact tip text from source." }

For "did-you-know":
{ "type": "did-you-know", "title": "DID YOU KNOW?", "icon": "💡", "items": ["Fact 1 exact text", "Fact 2 exact text", "Fact 3 exact text"] }

For footer objects, add to each page:
{ "footerPills": ["when start", "read temperature", "read humidity", "store data", "show on OLED"], "footerTip": "Exact engineer tip text", "footerFact": "Exact fact text", "footerNextMission": "Smart Climate Controller 🚀", "footerNextLabel": "NEXT PAGE PREVIEW", "footerNextText": "Exact next page teaser", "brandTag": "🚀 UltraMinds AI" }

== OUTPUT RULES ==
- Return ONLY valid JSON. No markdown, no explanation text outside JSON.
- Produce 5-14 pages as needed to fit ALL content at comfortable reading size.
- Every page object must have: pageNumber, pageType, sections[], footerPills or footerTip, footerNextMission or footerNextText.
- sections[] must contain ONLY the card objects as specified above.
- Use split-layout to place two cards side by side whenever the page has multiple cards.
- Produce maxOutputTokens worth of JSON (do not cut short).

== OUTPUT FORMAT ==
{
  "missionNumber": "14",
  "missionTitle": "SMART CLIMATE MONITOR",
  "missionSubtitle": "Let's build a Smart Climate Monitor using DHT11 and OLED!",
  "guideName": "Commander Nova",
  "guideRole": "Your Mission Guide",
  "theme": "theme-blue",
  "pages": [
    {
      "pageNumber": 1,
      "pageType": "cover",
      "sections": [ ... ],
      "footerPills": ["when start", "read temperature", "read humidity", "store data", "show on OLED"],
      "footerNextMission": "Smart Climate Controller 🚀"
    }
  ]
}
`;
