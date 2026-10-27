# MindPlay: Train Your Focus! 🧠✨
### An Interactive Psychology & Concentration Playground

**MindPlay** is an educational, pastel-themed website that teaches students and learners basic cognitive psychology concepts related to concentration, attention, working memory, and self-regulation through interactive mini-games and practical daily focus tools.

---

## 🎨 Theme & Visual Design

- **Soft Pastel Color Palette:** Baby Pink (`#ffd5dc`), Lavender (`#e8ddfc`), Mint Green (`#cbf4e1`), Light Blue (`#d4ebfc`), and Warm Cream (`#fff8e7`).
- **Playful & Friendly Aesthetics:** Rounded pill-style cards (`border-radius: 24px`), gentle drop shadows, smooth pop animations, and "Mindy" the Brain mascot.
- **Synthesized Laboratory Audio:** Custom Web Audio API synthesizer providing gentle acoustic feedback (wooden marimba taps, bubble pops, singing-bowl meditation chimes, and mute toggle) without any external audio asset files.
- **Responsive Layout:** Works smoothly on desktop laptops, tablets, and smartphones.

---

## 🕹️ Five Interactive Mini-Games

1. **Focus Finder 🔍 (Selective Attention)**
   - *Concept:* Feature Integration Theory & Visual Search.
   - *Gameplay:* Locate and tap specific target symbols hidden inside an expanding field of colorful distractors before the timer runs out.
   - *Metrics:* Targets Found, False Alarms (distractor clicks), and Elapsed Search Latency.

2. **Stay Focused 🌟 (Sustained Attention)**
   - *Concept:* Continuous Performance Test (CPT) & Vigilance Decrement.
   - *Gameplay:* Maintain continuous concentration over a rapid stream of visual stimuli. Press the Spacebar or tap the button **ONLY** when the Golden Star appears.
   - *Metrics:* Target Hits, Omission Errors (missed targets), Commission Errors (false alarms), and Average Reaction Time in milliseconds.

3. **Switch It Up 🔄 (Attentional Task Switching)**
   - *Concept:* Task-Set Reconfiguration & The Cognitive "Switch Cost".
   - *Gameplay:* Alternate rapidly between two rules: **COLOR** (Pink vs. Blue) and **SHAPE** (Circle vs. Square).
   - *Metrics:* Switch Cost Penalty (difference in reaction time between rule-switch trials and rule-repeat trials).

4. **Stop or Go 🚦 (Inhibitory Control)**
   - *Concept:* Go / No-Go Paradigm & Motor Inhibition Gating.
   - *Gameplay:* Tap fast on Green Rabbit signals to build motor momentum, but brake your impulse completely when the Red Bear (Stop) appears!
   - *Metrics:* Go Reflex Latency, Go Hit Rate, and Inhibition Success Rate (% of Stop signals successfully withheld).

5. **Memory Challenge 🧠 (Working Memory Span)**
   - *Concept:* Working Memory Capacity (Nelson Cowan's 4-chunk limit).
   - *Gameplay:* Memorize sequences of cute fruit symbols that flash one by one, then recall them on an interactive keypad. Features forward recall and hard-mode **Reverse Order Recall**.
   - *Metrics:* Maximum Sequence Span Chunks, Accuracy %, and Working Memory Score.

---

## 📚 Psychological Foundations & Practical Techniques

### Six Core Cognitive Concepts Explained:
1. **Selective Attention:** Focusing the attentional spotlight on one relevant sensory input (the *Cocktail Party Effect*).
2. **Sustained Attention:** Maintaining vigilance over prolonged tasks without mental drift.
3. **Attentional Switching:** Flexible executive task switching and understanding why multitasking is a myth.
4. **Inhibitory Control:** Prefrontal mental brakes resisting impulsive habits and smartphone triggers.
5. **Working Memory:** The active mental workspace holding ~4 chunks of information during problem-solving.
6. **Situational Awareness:** Environmental scanning, comprehension, and projection.

### Five Focus Techniques Toolkit:
1. **The One-Task Rule:** Monotasking over multitasking to eliminate the 40% cognitive switching penalty.
2. **The STOP Technique:** Mindful 4-step reset (Stop, Take a breath, Observe, Proceed).
3. **Timeboxing & Focus Intervals:** Structured 25-minute work sprints and 5-minute restorative breaks.
4. **Scheduled Worry Time:** Postponing intrusive rumination to a dedicated afternoon window.
5. **The Distraction-Proof Environment:** Removing phone line-of-sight and physical clutter.

---

## ⏱️ Interactive Focus Tools

- **Customizable Pomodoro Timer:** SVG animated progress ring, adjustable work sprint slider (15–50 min), short break (5 min), long break (15 min), and soothing completion chime.
- **Guided STOP Breathing Meditation:** Real-time animated breathing orb (4s inhale, 2s hold, 4s exhale) followed by observation and intention-setting.
- **Distraction Checklist Audit:** Interactive survey of digital, environmental, and mental interruptions with an instant **Focus Vulnerability Score** and tailored action plan.
- **Daily Focus Goals Tracker:** Set daily Pomodoro and game targets, check off habits, and keep your focus streak alive.

---

## 💻 Java Coding Corner: Programming Focus Games

MindPlay includes a dedicated educational module showing beginners how each game mechanic is written in Java:
- **Lesson 1: Variables & Data Types** (`int`, `double`, `boolean`, `String`) for player stats and reaction times.
- **Lesson 2: Conditional Statements** (`if / else if / else`) for signal checking and inhibitory control.
- **Lesson 3: Loops** (`for` and `while`) for countdown timers and stimulus spawning.
- **Lesson 4: Methods** for reusable accuracy calculations.
- **Lesson 5: Object-Oriented Classes** (`FocusPlayer` profile object with encapsulation).
- **Interactive Simulation:** Click "Run Simulation" in the browser to view the simulated Java terminal output!

---

## 🚀 How to Run Locally

Because the project is built with standard Web APIs (HTML5, CSS3, Vanilla ES6 JavaScript, and `localStorage`), **no build tools, Node.js packages, or web servers are required**.

### Direct File Launch:
Open [`index.html`](file:///C:/Users/admin/.gemini/antigravity/scratch/mindplay-focus-lab/index.html) directly in any modern browser:
```
file:///C:/Users/admin/.gemini/antigravity/scratch/mindplay-focus-lab/index.html
```

---

## 📁 File Structure

```
mindplay-focus-lab/
├── index.html                   # Semantic markup, navigation, views & modals
├── README.md                    # Documentation & educational guide
├── css/
│   ├── styles.css               # Pastel design system, layout, hero, tools, Java terminal
│   └── games.css                # Mini-game interfaces, symbol grids, results cards
└── js/
    ├── storage.js               # Local storage manager, daily goals, streaks & badges
    ├── audio.js                 # Web Audio API marimba, chime & bell synthesizer
    ├── tools.js                 # Pomodoro timer, STOP breathing, distraction audit & Java simulator
    ├── app.js                   # Navigation router, daily facts & progress synchronization
    └── games/
        ├── focus-finder.js      # Game 1: Selective Attention
        ├── stay-focused.js      # Game 2: Sustained Attention (CPT)
        ├── switch-it-up.js      # Game 3: Attentional Task Switching
        ├── stop-or-go.js        # Game 4: Inhibitory Control (Go/No-Go)
        └── memory-challenge.js  # Game 5: Working Memory Span
```

---

## ℹ️ Educational & Scientific Notice

All games, scores, and activities on **MindPlay** are informal educational tools designed for curiosity, reflection, and self-awareness. They are **not** clinical neuropsychological tests, diagnostic tools for ADHD, or cognitive treatments.
