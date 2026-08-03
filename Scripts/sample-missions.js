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
4. Program smooth motion smoothing loops in MicroPython.`
};
