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
,
  railwayGateText: "MISSION: THE SMART RAILWAY GATE 🚂⚡\nLevel: 1 (Class 4) | Duration: 1 Day Project\nMission Guide: Nova the AI Explorer 🤖\nSquad: Young Automation Engineers\n________________________________________\n1: MISSION DISPATCH & FIELD INVESTIGATION\ncodeCode\n[RADIO LINK ACTIVE: GREENFIELD JUNCTION]\nSTATION MASTER SHARMA CALLING!\n\"Young Engineers, help! Yesterday it rained heavily, and thick fog covered the tracks. When the high-speed express train whistled, I ran outside to lower the heavy iron barrier, but I slipped on a wet banana peel! 🍌\nBy the time I stood up, a school bus was inches away from the rushing train! My legs are old, and on rainy or foggy days, humans just can't react fast enough. Can you build an Automatic Smart Railway Gate to save our town?\"\n________________________________________\n🤖 Nova’s Brain-Buster: Think Before You Build!\n\"Beep-boop, Young Engineers! Nova here. Before opening our kits, let's solve this mystery using our brains:\n1.\tHow does the system 'see'?\nIf Sharma-ji isn't watching, what device can shoot out invisible light beams to spot a train coming down the track?\n2.\tHow does it 'hold'?\nA train has an engine and lots of long coaches! If our sensor spots the engine and looks away, how do we keep the barrier closed until the last coach crosses?\n3.\tHow does it 'warn'?\nDrivers inside cars have windows rolled up. How can we make sure they see the barrier close AND hear a loud siren at the exact same second?\"*\n💡 Squad Realization:\nWe need an Obstacle Sensor to spot the train \n→→\n a Timer to hold the barrier closed \n→→\n and a Signal Splitter to close the gate and ring a buzzer together!\n________________________________________\n📄2: THE ENGINEER’S TOOLBOX\nHere are the modular plug-and-play electronics blocks we will use. No coding required—they snap together directly!\ncodeCode\n[ 🔋 POWER + SWITCH ] ➔ [ 👁️ SENSOR BASE ] ➔ [ ⏱️ TIMER ] ➔ [ 🔀 COPY ] ➔ OUTPUTS\n1. Power Module + Switch Module\n•\tPower Module: Supplies electric energy from a 9V battery to all blocks.\n•\tSwitch Module: Master safety button. Turns the entire machine ON or OFF.\n2. Sensor Base & 3-Pin Connector Wire\n•\tSensor Base: The input brain! It has a socket to plug in different sensors using a flexible 3-pin connector wire.\n•\tObstacle (IR) Sensor: Emits invisible infrared light. When a train rolls in front, the light bounces back!\n•\tKnob (0 to 99): The threshold dial. Set a number (like 40). When the sensor detects a signal equal to or higher than 40, the Sensor Base fires a trigger forward!\n3. Timer Module (The Digital Stopwatch)\n•\tPulse Mode: Once triggered, it holds power ON for your chosen time (e.g., 5 seconds), even if the sensor stops seeing the train!\n•\tDelay Mode: Waits for the set time before passing power.\n4. Copy Block (The Signal Splitter)\n•\tTakes one input signal and duplicates it into two identical outputs at the exact same instant!\n5. Outputs: Servo Motor & Buzzer\n•\tServo Motor Base + Servo: Turns from \n0∘0∘\n (Gate Down) to \n90∘90∘\n (Gate Up).\n•\tBuzzer / Red LED Module: Sounds a loud alert and flashes bright red for road safety.\n🌟 NOVA’S DID YOU KNOW?\nHigh-speed bullet trains use track sensors that spot trains moving at 320 km/h from miles away—closing crossing gates long before human eyes can even spot the train! 🚄\n________________________________________\n3: THE GREAT LOGIC PUZZLE\nNova: \"Hold on, Engineers! Where should the Copy Block go?\"\nWe want the Gate closed for 5 seconds AND the Buzzer beeping for 5 seconds.\ncodeCode\nIDEA A: COPY BEFORE TIMER\n[Sensor Base] ➔ [Copy Block] ┬➔ [Timer] ➔ [Servo Motor] (Closes for 5s)\n                             └➔ [Buzzer] (Beeps for only 1s!) ❌\n\nIDEA B: COPY AFTER TIMER\n[Sensor Base] ➔ [Timer (5s Pulse)] ➔ [Copy Block] ┬➔ [Servo Motor] (Closed for 5s)\n                                                  └➔ [Buzzer] (Beeps for 5s!)   ✅\n•\tIf we pick Idea A: The sensor only sees the train engine for 1 second as it zooms past. The buzzer rings for only 1 second and then goes dead silent, while the gate stays down for 5 seconds! Drivers will get confused.\n•\tIf we pick Idea B: The sensor triggers the Timer. The Timer holds a steady 5-second pulse. The Copy Block splits that 5-second pulse so the Gate stays down AND the Buzzer rings together for all 5 seconds!\nNova's Verdict: \"Idea B is a true Fail-Safe Design! Let's build it!\"\n________________________________________\n📄 4: MASTER BUILDER LAB (MECHANICAL ASSEMBLY)\nBefore wiring, we must build the physical railway station using our plastic building bricks, beams, and connector pins!\ncodeCode\n[BOOM BARRIER ARM]\n                      (Red & White Beam)\n                               \\\n                                \\\n                     [SERVO MOTOR BASE] \n                             ||\n                      [TOWER PILLAR]\n                      (Stacked Bricks)\n                             ||\n                    ====================  <--- [MAIN BASEPLATE]\n🧱 Building Checklist:\n•\t1×1×\n Main Large Baseplate (The ground).\n•\t8×8×\n Standard \n2×42×4\n Building Bricks (The Tower Pillar).\n•\t1×1×\n Servo Motor Brick Bracket (Locks the servo firmly).\n•\t1×1×\n Long Red-and-White Striped Beam (The Barrier Arm).\n•\t1×1×\n Cross-Axle & Bushing (Connects the barrier arm to the servo shaft).\n•\t2×2×\n Trackside Sensor Bricks (To hold the IR sensor at train height).\n________________________________________\n🔨 Step-by-Step Construction Guide\nStep 1: The Foundation\nSnap your large building baseplate onto your work table. This keeps the whole junction from wobbling when the barrier swings!\nStep 2: The Gate Tower\nStack your \n2×42×4\n bricks vertically to build a Tower Pillar 4 bricks high right next to where your toy road crosses the train track.\nStep 3: Mount the Servo Muscle\nSnap the Servo Motor Base into the special brick bracket at the top of your tower pillar. Make sure the rotating gear shaft points outward toward the road.\nStep 4: Build the Barrier Arm\n1.\tTake the long red-and-white beam.\n2.\tPush the cross-axle pin through the first hole of the beam and snap it into the servo motor shaft.\n3.\tTest with your fingers: Does it swing smoothly from straight up (\n90∘90∘\n) to flat down (\n0∘0∘\n) across the road? Yes!\n5: The Trackside Sensor Stand\nBuild a small 2-brick stand along the railway track (about 15 cm before the crossing). Mount your Obstacle Sensor here pointing straight at the side of the train tracks.\n🤖 NOVA'S BUILDER TIP:\n\"Always press your bricks firmly until you hear a solid 'CLICK'! A loose brick tower will shake and jam your barrier arm when the servo moves!\"\n________________________________________\n📄 5: CIRCUIT WIRING & CALIBRATION LAB\nNow, snap the electronic blocks onto the baseplate next to your brick tower!\nThe Circuit Blueprint\n[Power]→[Switch]→[Sensor Base]→[Timer Module]→[Copy Block][Power]→[Switch]→[Sensor Base]→[Timer Module]→[Copy Block]\n•\tConnect Output 1 of the Copy Block \n→→\n Servo Motor Base.\n•\tConnect Output 2 of the Copy Block \n→→\n Buzzer / Red LED Module.\n•\tPlug the Obstacle Sensor into the Sensor Base using the 3-pin connector wire.\ncodeCode\n[ 3-Pin Wire ]\n                         |\n                  [Obstacle Sensor]\n                         |\n[POWER] ➔ [SWITCH] ➔ [SENSOR BASE] ➔ [TIMER (Pulse)] ➔ [COPY BLOCK]\n                                                           |\n                                      +--------------------+--------------------+\n                                      |                                         |\n                                      v                                         v\n                                [SERVO MOTOR]                           [BUZZER / RED LED]\n                                (Gate Lowers)                             (Siren Rings)\n________________________________________\n🎛️ The 2-Step Calibration Lab\nStep 1: Tune the Sensor Base Knob (0 to 99)\n1.\tTurn the Switch ON.\n2.\tRoll your toy train on the tracks right in front of the Obstacle Sensor.\n3.\tTurn the knob on the Sensor Base until its red indicator LED lights up.\n4.\tMove the train away. The indicator light should turn OFF.\n5.\tA setting around 40 to 50 is ideal—it spots the train body but ignores room shadows!\nStep 2: Set the Timer Module\n1.\tFlip the small switch to PULSE.\n2.\tTurn the dial to 5 Seconds (giving the toy train time to cross fully).\n⚡ NOVA’S BRAIN TRICK:\n\"What if an engineer sets the Timer to DELAY instead of PULSE?\"\nThe gate will do nothing while the train passes, wait 5 seconds, and then close after the train has already left!\nRule: Pulse acts immediately and holds; Delay waits before acting!\n________________________________________\n📄 6: LIVE TEST RUN & MISSION CLEARANCE!\ncodeCode\n[COMMENCING FINAL SYSTEM TEST]\ncodeCode\n1. Train rolls down the track.\n2. Invisible light bounces off the engine into the Obstacle Sensor.\n3. Sensor Base value hits our knob setting (40) and fires a signal!\n4. Timer Module starts its 5-second countdown in PULSE mode.\n5. Copy Block splits the 5-second signal:\n   ├── Branch 1: Buzzer rings: \"BEEP-BEEP-BEEP!\"\n   └── Branch 2: Servo swings the brick barrier arm down: \"CLACK!\"\n6. All train coaches roll safely past the crossing.\n7. 5 seconds complete: Timer turns off.\n   The buzzer silences and the barrier lifts smoothly back up. Road clear!\ncodeCode\n====================================================================\n               GREENFIELD JUNCTION: OFFICIALLY SAFE!\n====================================================================\nStation Master Sharma: \"Hooray! No more running in the rain! \nCars are safe, passengers are safe, and Greenfield Junction is now \nthe smartest crossing in the state!\"\n====================================================================\n🎖️ Mission Accomplished! You have earned your Level-1 Automation Badge!\n________________________________________\n 7: YOUNG ENGINEER ASSESSMENT LAB\nNova’s Challenge: Complete all 12 questions in your lab notebook!\n________________________________________\nSECTION 1: Choose the Correct Answer (CCA)\nQ1. How is the Obstacle Sensor linked to the Sensor Base?\nA) With sticky glue\nB) Using a 3-pin connector wire\nC) With a rubber band\nD) It doesn't need any connection\nQ2. Why is the Copy Block placed AFTER the Timer Module?\nA) To save battery power\nB) So both the gate and the buzzer stay active together for the full 5 seconds\nC) Because the sensor is too loud\nD) To make the toy train move faster\nQ3. What is the job of the knob (0 to 99) on the Sensor Base?\nA) It controls the volume of the buzzer\nB) It sets the speed of the servo motor\nC) It sets the threshold value required to send an output signal\nD) It turns the battery on and off\n________________________________________\nSECTION 2: Fill in the Blanks\nQ4. The Sensor Base sends a signal forward only when the sensor reading reaches or crosses the number set by the __________.\nQ5. To make sure the gate closes immediately and stays closed for 5 seconds, the Timer Module must be set to __________ Mode.\nQ6. The __________ Block takes a single input signal and duplicates it into two identical outputs at the same time.\n________________________________________\nSECTION 3: Match the Pairs\nQ7. Match each part with its correct job:\nPart\tDuty\n(1) Servo Motor\t[ A ] Bounces light off the train to detect it\n(2) Obstacle Sensor\t[ B ] Rotates between \n0∘0∘\n and \n90∘90∘\n to move the barrier arm\n(3) Building Bricks\t[ C ] Forms the sturdy tower pillar that holds the gate above the road\n(Write answers as: 1 - __ , 2 - __ , 3 - __)\n________________________________________\nSECTION 4: True or False\nQ8. You can connect different sensors (like light, sound, or obstacle sensors) into the Sensor Base using the same 3-pin connector wire.\n•\t[ True / False ]\nQ9. If the Timer Module is set to Delay Mode, it immediately closes the barrier and keeps it closed for 5 seconds.\n•\t[ True / False ]\nQ10. Building a solid baseplate foundation prevents the servo motor from wobbling when the barrier arm swings down.\n•\t[ True / False ]\n________________________________________\n🔑 NOVA’S LAB ANSWER KEY (FOR EVALUATION)\n•\tCCA: Q1 \n→→\n B | Q2 \n→→\n B | Q3 \n→→\n C\n•\tFill in the Blanks: Q4 \n→→\n knob (or threshold knob) | Q5 \n→→\n Pulse | Q6 \n→→\n Copy\n•\tMatch the Pairs: 1 - B | 2 - A | 3 - C\n•\tTrue or False: Q8 \n→→\n True | Q9 \n→→\n False (Delay waits before acting; Pulse acts right away and holds!) | Q10 \n→→\n True\n\n\n\n\n📋 MASTER CURRICULUM BLUEPRINT (LEVEL 1: CLASS 4)\nPacing: 1 Mission / 1 Day Lab Session\nFormat: 7-Page High-Engagement Modular Chapter\nCore Guide: Nova the AI Explorer 🤖 (Solo Mentor & Co-Pilot)\nHardware Ecosystem: Plug-and-Play Electronics + LEGO-Compatible Construction\n________________________________________\nThe Standard 7-Page Chapter Architecture\ncodeCode\nPAGE 1 ➔ MISSION DISPATCH & FIELD INVESTIGATION\n         • Relatable Real-World Crisis / SOS Character Hook (e.g., Station Master Sharma)\n         • Nova’s Brain-Buster: 3 Guided Questions (Critical Thinking / Problem Decomposition)\n         • Squad Problem Statement (No immediate spoilers; kids deduce the need)\n\nPAGE 2 ➔ THE ENGINEER’S TOOLBOX\n         • Visual Block Train Schematic\n         • Modular Electronics Checklist (Power, Switch, Sensor Base + 3-Pin Wire Sensors, \n           Knob Threshold 0–99, Timer Pulse/Delay, Copy Block, Actuators)\n         • \"Nova’s Did You Know?\" (Real-world technological marvel connection)\n\nPAGE 3 ➔ THE GREAT LOGIC PUZZLE\n         • Architectural Thinking Challenge (e.g., \"Where does the Copy Block go?\", \n           \"Pulse vs. Delay\", \"Trigger Order\")\n         • Idea A vs. Idea B Comparison (Evaluating failures vs. Fail-Safe designs)\n\nPAGE 4 ➔ MASTER BUILDER LAB (MECHANICAL LEGO-TYPE ASSEMBLY)\n         • Brick & Beam Checklist (Baseplates, vertical pillars, brackets, axles, linkages)\n         • 5-Step Physical Construction Guide (Stable base, tower, actuator mount, moving arm)\n         • Nova’s Builder Tip (Structural stability, gear friction, balance)\n\nPAGE 5 ➔ CIRCUIT WIRING & CALIBRATION LAB\n         • Clear Plug-and-Play Signal Chain Diagram\n         • 2-Step Calibration Lab (Knob tuning 0–99 & Mode selection)\n         • Nova’s Brain Trick / Memory Rule\n\nPAGE 6 ➔ LIVE TEST RUN & MISSION CLEARANCE\n         • Step-by-Step System Simulation Run (Input ➔ Process ➔ Action ➔ Reset)\n         • Mission Accomplished & Character Celebration\n         • Level-1 Skill Badge Unlocked 🏅\n\nPAGE 7 ➔ YOUNG ENGINEER ASSESSMENT LAB (12 QUESTIONS)\n         • Section 1: Choose the Correct Answer (CCA) — 3 Questions\n         • Section 2: Fill in the Blanks — 3 Questions\n         • Section 3: Match the Pairs — 3 Pairs\n         • Section 4: True or False — 3 Questions\n         • Answer Key for quick evaluation\n________________________________________\n",
  mission3: null,
  mission13: null
};

window.SAMPLE_MISSIONS.mission3 = window.SAMPLE_MISSIONS.mission03Text;
window.SAMPLE_MISSIONS.mission13 = window.SAMPLE_MISSIONS.mission03Text;
window.SAMPLE_MISSIONS.railwayGate = window.SAMPLE_MISSIONS.railwayGateText;
