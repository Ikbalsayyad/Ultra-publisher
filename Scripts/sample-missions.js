/**
 * UltraMinds Sample Missions Dataset (V2 - Clean Footers without Next Teasers)
 */

window.SAMPLE_MISSIONS = {
  mission14: {
    id: "mission14",
    title: "Mission 14: Smart Climate Monitor",
    theme: "theme-blue",
    missionNumber: "14",
    missionTitle: "SMART CLIMATE MONITOR",
    missionSubtitle: "Let's build a Smart Climate Monitor using DHT11 and OLED!",
    guideName: "Commander Nova",
    guideRole: "Your Mission Guide",
    pages: [
      {
        pageNumber: 1,
        sections: [
          {
            type: "nova-card",
            title: "MISSION STORY",
            icon: "📖",
            content: `Commander Nova has received a request from the UltraCity Environment Center.\n\nClassrooms, laboratories and homes are getting <span class="highlight-hot">too hot</span> some days and <span class="highlight-cold">too cold</span> on others.\n\nTo maintain comfort and save energy, engineers need real-time temperature and humidity data.\n\n<strong>Your mission is to build a Smart Climate Monitor using the DHT11 sensor and OLED display with the UltraCore board.</strong>`
          },
          {
            type: "split-layout",
            left: {
              type: "real-world",
              title: "REAL WORLD",
              icon: "🌐",
              content: `This data is used in:\n• Smart Classrooms\n• Greenhouses\n• Museums\n• Hospitals\n• Weather Stations\n\n<em>Engineers use sensors to make the environment better for everyone.</em>`
            },
            right: {
              type: "curiosity-box",
              title: "CURIOSITY BOX",
              icon: "💡",
              content: `Humidity affects how we feel, helps plants grow and protects electronic devices.\n\nToo much or too little can create problems!`
            }
          },
          {
            type: "stem-fact",
            title: "STEM FACT",
            icon: "⚙️",
            content: `Sensors like DHT11 collect data thousands of times a day. This data helps engineers make smart decisions.`,
            oledPreview: "Temp: 26.8°C\nHumi: 65%"
          },
          {
            type: "mission-objectives",
            title: "MISSION OBJECTIVES",
            icon: "🎯",
            objectives: [
              { num: 1, text: "Read live temperature", subtext: "Thermometer Sensor" },
              { num: 2, text: "Read live humidity", subtext: "% Humidity Sensor" },
              { num: 3, text: "Store two different variables", subtext: "Memory Storage" },
              { num: 4, text: "Display both values on the OLED display", subtext: "OLED Screen" }
            ]
          },
          {
            type: "think-engineer",
            title: "THINK LIKE AN ENGINEER",
            icon: "🧠",
            question: "If two classrooms have the same temperature but different humidity, will they feel the same? Explain your answer.",
            lines: 2,
            scenario: {
              left: { label: "Room A", temp: "30°C", hum: "40%", feel: "Feels Comfortable", status: "good" },
              right: { label: "Room B", temp: "30°C", hum: "80%", feel: "Feels Hot & Sticky", status: "warn" }
            }
          }
        ],
        footerPills: ["when start", "read temperature", "read humidity", "store data", "show on OLED"]
      },
      {
        pageNumber: 2,
        sections: [
          {
            type: "header-banner",
            title: "ENGINEERING EXPLORER",
            subtitle: "OBSERVE. DISCOVER. UNDERSTAND."
          },
          {
            type: "split-layout",
            left: {
              type: "observe-card",
              title: "OBSERVE THE WEATHER STATION",
              content: "Look carefully at this weather station. What do you notice?",
              components: ["Wind Speed", "Solar Panel Sensor", "Temperature & Humidity", "Solar Panel"],
              questions: [
                "1. What can you see in this station?",
                "2. Which part do you think measures temperature?",
                "3. Which part might measure humidity?",
                "4. Why do you think we need both temperature and humidity data?"
              ]
            },
            right: {
              type: "component-card",
              title: "MEET TODAY'S COMPONENT",
              componentName: "DHT11",
              componentType: "TEMPERATURE & HUMIDITY SENSOR",
              bullets: [
                "Measures Temperature and Humidity",
                "Easy to use",
                "Low power consumption",
                "High reliability",
                "Perfect for beginners"
              ],
              pinout: [
                { pin: 1, name: "VCC", desc: "Power Supply (3.3V - 5V)" },
                { pin: 2, name: "DATA", desc: "Digital Data Output" },
                { pin: 3, name: "GND", desc: "Ground" }
              ],
              specs: [
                { label: "Temp Range", val: "0°C to 50°C" },
                { label: "Humidity Range", val: "20% to 90% RH" },
                { label: "Accuracy", val: "±1°C / ±5% RH" },
                { label: "Voltage", val: "3.3V to 5V DC" }
              ]
            }
          },
          {
            type: "split-layout",
            left: {
              type: "how-it-works",
              title: "INSIDE THE SENSOR - HOW DOES IT WORK?",
              content: "DHT11 has two sensing parts inside:\n• Temperature Sensing Element (Thermometer measures surrounding temp)\n• Humidity Sensing Element (Capacitive sensor detects moisture in air)\n\n<em>The sensor converts these changes into electrical signals and sends them to the microcontroller.</em>"
            },
            right: {
              type: "compare-card",
              title: "COMPARE & UNDERSTAND",
              humanSenses: "We feel hot or cold using skin, but cannot measure exact numbers.",
              sensors: "Sensors measure temperature in °C and humidity in %RH accurately.",
              conclusion: "SENSORS HELP US MEASURE WHAT OUR SENSES CANNOT MEASURE ACCURATELY."
            }
          },
          {
            type: "challenge-box",
            title: "MISSION CHALLENGE",
            question: "Can one sensor measure everything in the environment? List two things that DHT11 cannot measure.",
            lines: 1,
            proTip: "Think like an engineer! Every sensor has a purpose. Choose the right tool for the right job."
          }
        ],
        footerFact: "Weather stations on Mount Everest use similar sensors to help climbers and scientists stay safe."
      },
      {
        pageNumber: 3,
        sections: [
          {
            type: "header-banner",
            title: "CIRCUIT LAB & WIRING",
            subtitle: "BUILD YOUR HARDWARE CONNECTION"
          },
          {
            type: "split-layout",
            left: {
              type: "build-steps",
              title: "CIRCUIT WIRING STEPS",
              steps: [
                { stepNum: 1, title: "Connect VCC & GND", desc: "Connect DHT11 VCC to 3.3V and GND to GND pin.", pinTable: [{ from: "DHT11 Pin 1", to: "UltraCore 3.3V" }, { from: "DHT11 Pin 4", to: "UltraCore GND" }] },
                { stepNum: 2, title: "Connect Signal Pin", desc: "Connect DHT11 Signal pin to Pin D4.", pinTable: [{ from: "DHT11 Pin 2", to: "UltraCore Pin D4" }] }
              ]
            },
            right: {
              type: "common-mistakes",
              title: "COMMON MISTAKES",
              mistakes: [
                { issue: "Wrong VCC connection", fix: "Check VCC ➔ 3.3V (NOT 5V)" },
                { issue: "Sensor timeout error", fix: "Ensure signal wire is tight on D4" }
              ]
            }
          }
        ],
        footerTip: "Good connections + careful work = Great inventions! Take your time and enjoy the build."
      },
      {
        pageNumber: 4,
        sections: [
          {
            type: "header-banner",
            title: "PROGRAMMING STUDIO",
            subtitle: "WRITE THE MICROPYTHON CODE"
          },
          {
            type: "code-snippet",
            title: "PYTHON LOGIC PREVIEW",
            language: "python",
            code: `import dht\nfrom machine import Pin\nimport time\n\nsensor = dht.DHT11(Pin(4))\n\nwhile True:\n    sensor.measure()\n    temp = sensor.temperature()\n    hum = sensor.humidity()\n    print("Temp:", temp, "C", "Humidity:", hum, "%")\n    time.sleep(2)`
          }
        ],
        footerTip: "Use meaningful variable names so anyone can understand your code."
      },
      {
        pageNumber: 5,
        sections: [
          {
            type: "header-banner",
            title: "MISSION COMPLETE & BADGE",
            subtitle: "CONGRATULATIONS ENGINEER!"
          },
          {
            type: "ultra-badge",
            title: "ACHIEVEMENT BADGE",
            badgeName: "CLIMATE MASTER BADGE",
            badgeStatus: "MISSION COMPLETE",
            congrats: "Congratulations! You successfully built a Smart Climate Monitor!"
          }
        ],
        brandTag: "UltraMinds AI Studio - STEM Curriculum V2.0"
      }
    ]
  },
  rawTextSample: `CHAPTER 12: ROBOTIC ARM CONTROLLER
In this mission, students build a 3-axis robotic arm using servo motors and potentiometer joysticks.
Objectives:
1. Connect 3 Servo Motors to pins D1, D2, D3.
2. Read analog joystick values from A0, A1, A2.
3. Map analog readings 0-1023 to servo angles 0-180 degrees.
4. Program smooth motion smoothing loops in MicroPython.`,
  mission03Text: `UltraMinds Intelligent Systems Program
Class 7 – Mission File 03
🚜 MISSION 03
Smart Farm Guardian
Build an IoT Smart Irrigation & Farm Monitoring System
________________________________________
🏅 Mission Badge
🌱 FarmTech Engineer
Unlock this badge after successfully completing the mission.
________________________________________
⏳ Mission Time
90 Minutes
________________________________________
🎯 Difficulty
⭐⭐⭐☆☆
________________________________________
🔓 Skills You'll Unlock
✔ Soil Moisture Sensing
✔ Smart Automation
✔ Wi-Fi Communication
✔ Cloud Monitoring
✔ Mobile App Design
✔ Product Thinking
________________________________________
👥 Today's Team
🔧 Hardware Engineer
👨💻 Logic Builder
📱 App Designer
🧪 Testing Engineer
🎤 Presenter
________________________________________
Required Components
• UltraCore Board 
• Soil Moisture Sensor 
• Water Pump Module 
• Relay Module 
• RGB LED 
• OLED Display 
• Wi-Fi 
• UltraCloud 
• UltraApp Builder 
________________________________________
(Illustration Prompt: A colorful smart farm with crops, soil moisture sensor, water pump, cloud connection and a smiling student holding a mobile phone showing farm status. Bright, cartoon-style STEM illustration.)
________________________________________
📖 Mission Brief
The summer has been extremely hot.
Farmer Ravi is worried because he has to travel to another city for three days.
Nobody will be available to water his crops.
If the soil becomes too dry...
the plants may die.
Can you build a system that automatically waters the plants and allows Farmer Ravi to monitor everything from his mobile phone?
Today,
YOU are the Smart Agriculture Engineer.
________________________________________
Mission Objectives
✅ Detect dry soil
✅ Automatically start the water pump
✅ Show status on OLED
✅ Upload data to UltraCloud
✅ Create a mobile monitoring app
________________________________________
(Illustration Prompt: Farmer Ravi looking worried while dry crops begin to wilt. Students arrive with a smart farming solution. Comic style with expressive characters.)
________________________________________
🤖 Commander Nova Says...
"Great engineers don't wait for problems—they design systems that prevent them."
________________________________________
🌍 Why Is This Important?
Every year,
millions of liters of water are wasted because irrigation is not controlled efficiently.
Smart farming helps:
🌱 Save Water
🌾 Improve Crop Health
📱 Monitor Farms Remotely
🚜 Reduce Human Effort
________________________________________
💡 Curiosity Box
🤔
If plants could talk...
what do you think they would tell the farmer first?
________________________________________
🌟 Did You Know?
NASA researches smart agriculture technologies for growing plants during future space missions.
________________________________________
🧠 Think Like an Engineer
Before building...
Q1
How can a machine know whether soil is wet or dry?
________________________________________
________________________________________
Q2
Should the pump always run automatically?
Why?
________________________________________
________________________________________
Q3
Where should the soil sensor be placed?
Draw it.
________________________________________
(Blank drawing area)
________________________________________
Q4
How could a farmer know the farm status while travelling?
________________________________________
________________________________________
🦸 Meet Today's Heroes
🌱 Soil Moisture Sensor
"My superpower is feeling how wet the soil is."
Used in
• Smart Farms 
• Greenhouses 
• Vertical Farming 
________________________________________
💧 Water Pump
"My job is to deliver water."
Used in
• Agriculture 
• Aquariums 
• Irrigation 
________________________________________
📡 Wi-Fi
"I connect your farm to the Internet."
________________________________________
📱 Mobile App
"I help the farmer monitor the crops from anywhere."
________________________________________
(Illustration Prompt: Four superhero-style characters—Soil Sensor, Water Pump, Wi-Fi, Smartphone—introducing themselves with speech bubbles.)
________________________________________
⚙ Engineering Concept
How does Smart Irrigation work?
Everyday Example
Imagine your body.
When you feel thirsty, your brain tells you to drink water.
Your project works in almost the same way.

Dry Soil 	       Sensor Detects        UltraCore Thinks       Pump Starts       Cloud Updates        Mobile App Updates

________________________________________
(Diagram Prompt: Flow diagram showing Soil → Sensor → UltraCore → Relay → Pump → Cloud → Mobile App.)
________________________________________
🧩 Logic Builder
Complete the sequence.
START 	      Connect Wi-fi        Read Soil Moisture               ???              YES         Update Cloud           Repeat
________________________________________
Now draw your own flowchart.
(One full page left blank with light grid.)
________________________________________
💻 Coding Builder
Today's mission:
Build the logic yourself.
________________________________________
Step 1
Connect UltraCore to Wi-Fi.
Why is this important?
________________________________________
________________________________________
Step 2
Read soil moisture.
What value tells us the soil is dry?
________________________________________
________________________________________
Step 3
If soil is dry...
What should happen first?
☐ Turn ON Pump
☐ Send Cloud Update
☐ Display Message
Arrange the correct sequence.
________________________________________
Step 4
Complete your own program.
________________________________________
Block Coding Area
(Reserved Full Page)
________________________________________
Python Coding Area
(Reserved Full Page)
________________________________________
🛠 Build Mission
Assemble the system.
Connect
✔ Soil Sensor
✔ Relay
✔ Pump
✔ OLED
✔ Wi-Fi
Test the complete setup.
________________________________________
(Assembly Prompt: UltraCore connected to soil sensor, relay, pump, OLED and Wi-Fi. Clean 3D educational diagram with labeled modules.)
________________________________________
📱 Build Your Mobile App
Now your product needs a user.
Design the mobile application.
________________________________________
Screen 1
🏡 Dashboard
🌱 Soil Moisture
💧 Pump Status
📶 Device Online
________________________________________
________________________________________
(UI Prompt: Modern green-themed mobile app showing soil moisture percentage, pump switch, online indicator and farm image. Child-friendly interface.)
________________________________________
App Design Space
(image.)
________________________________________
🧪 Experiment Zone
Experiment 1
Wet the soil.
Observe.
________________________________________
Experiment 2
Dry the soil.
Observe.
________________________________________
Experiment 3
Move the sensor.
Does the reading change?
________________________________________
Experiment 4
Change the moisture threshold.
How does the system behave?
________________________________________
⚠ Failure Scenario
Farmer Ravi calls you.
"The Internet is not working."
Your pump should still water the crops.
What should your system do?
Discuss with your team.
________________________________________
🚀 Upgrade Mission
Bronze
Add RGB Status
🟢 Healthy
🔴 Dry
________________________________________
Silver
Display live moisture on OLED.
________________________________________
Gold
Allow the farmer to manually control the pump from the mobile app.
________________________________________
💡 Innovation Challenge
Imagine this system is installed on a 100-acre farm.
What additional features would you add?
Ideas
☐ Weather Forecast
☐ AI Water Prediction
☐ Solar Power
☐ Drone Monitoring
☐ SMS Alerts
Or invent your own.
________________________________________
🌎 Real World Connections
Used in
🚜 Agriculture
🌿 Greenhouses
🌳 Parks
🏡 Gardens
🏭 Plant Nurseries
🌍 Smart Cities
________________________________________
🎖 Mission Debrief
Commander Nova speaks:
"Excellent work, Engineer!"
Your Smart Farm Guardian is protecting crops automatically.
Now answer.
What part of your system worked best?
________________________________________
What challenge did you face?
________________________________________
How did your team solve it?
________________________________________
If you built Version 2,
what would you improve?
________________________________________
________________________________________
📝 Mission Assessment
A. Multiple Choice
(5 Questions)
________________________________________
B. True / False
(5 Questions)
________________________________________
C. Match the Following
Components ↔ Functions
________________________________________
D. Fill in the Logic
Complete the missing blocks.
________________________________________
E. Debug Challenge
Why is the pump not starting?
Identify two possible reasons.
________________________________________
F. Mobile App Design
Draw one additional feature for the farmer.
________________________________________
G. Engineering Thinking
Should the pump run every time the soil is slightly dry?
Explain.
________________________________________
H. Team Reflection
What role did you perform today?
What did you learn from your teammates?
________________________________________
🎉 Mission Complete
🏅 Badge Unlocked
🌱 FarmTech Engineer
Congratulations!
You have successfully built your first IoT Smart Agriculture Product.`
};
