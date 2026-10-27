/**
 * MindPlay: Focus Tools & Java Coding Corner
 * Implements:
 * 1. Customizable Pomodoro Timer with visual ring and audio chimes
 * 2. Interactive STOP Technique Guided Breathing Meditation
 * 3. Distraction Checklist Audit & Vulnerability Score
 * 4. Daily Focus Goals & Progress Manager
 * 5. Java Coding Simulator & Educational Code Viewer
 */

class MindPlayTools {
  constructor() {
    this.initPomodoro();
    this.initStopPractice();
    this.initDistractionAudit();
    this.initDailyGoals();
    this.initJavaCorner();
  }

  /* -------------------------------------------------------------
     1. POMODORO TIMER
  ------------------------------------------------------------- */
  initPomodoro() {
    this.pomo = {
      mode: 'work', // 'work' | 'shortBreak' | 'longBreak'
      workMins: 25,
      shortBreakMins: 5,
      longBreakMins: 15,
      secondsLeft: 25 * 60,
      totalSeconds: 25 * 60,
      isRunning: false,
      interval: null
    };

    this.bindPomodoroEvents();
  }

  bindPomodoroEvents() {
    const startBtn = document.getElementById('btn-pomo-start');
    const resetBtn = document.getElementById('btn-pomo-reset');
    const modeTabs = document.querySelectorAll('.pomo-mode-btn');
    const workSlider = document.getElementById('pomo-work-slider');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (this.pomo.isRunning) {
          this.pausePomodoro();
        } else {
          this.startPomodoro();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetPomodoro());
    }

    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.getAttribute('data-mode');
        this.setPomodoroMode(mode);
      });
    });

    if (workSlider) {
      workSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.pomo.workMins = val;
        const display = document.getElementById('pomo-slider-val');
        if (display) display.textContent = `${val} min`;
        if (this.pomo.mode === 'work' && !this.pomo.isRunning) {
          this.setPomodoroMode('work');
        }
      });
    }
  }

  setPomodoroMode(mode) {
    this.pausePomodoro();
    this.pomo.mode = mode;
    let mins = this.pomo.workMins;
    if (mode === 'shortBreak') mins = this.pomo.shortBreakMins;
    if (mode === 'longBreak') mins = this.pomo.longBreakMins;

    this.pomo.secondsLeft = mins * 60;
    this.pomo.totalSeconds = mins * 60;
    this.updatePomodoroDisplay();

    const banner = document.getElementById('pomo-mode-banner');
    if (banner) {
      if (mode === 'work') {
        banner.textContent = '🧠 Deep Focus Sprint';
        banner.className = 'pomo-status-tag tag-work';
      } else if (mode === 'shortBreak') {
        banner.textContent = '☕ Quick Refresh Break';
        banner.className = 'pomo-status-tag tag-break';
      } else {
        banner.textContent = '🍃 Restorative Long Break';
        banner.className = 'pomo-status-tag tag-long';
      }
    }
  }

  startPomodoro() {
    this.pomo.isRunning = true;
    const startBtn = document.getElementById('btn-pomo-start');
    if (startBtn) {
      startBtn.innerHTML = '⏸️ Pause';
      startBtn.className = 'btn btn-pink';
    }
    if (window.mindPlayAudio) window.mindPlayAudio.playTap();

    this.pomo.interval = setInterval(() => {
      this.pomo.secondsLeft--;
      this.updatePomodoroDisplay();

      if (this.pomo.secondsLeft <= 0) {
        clearInterval(this.pomo.interval);
        this.onPomodoroComplete();
      }
    }, 1000);
  }

  pausePomodoro() {
    this.pomo.isRunning = false;
    clearInterval(this.pomo.interval);
    const startBtn = document.getElementById('btn-pomo-start');
    if (startBtn) {
      startBtn.innerHTML = '▶️ Start Focus';
      startBtn.className = 'btn btn-mint';
    }
  }

  resetPomodoro() {
    this.pausePomodoro();
    this.setPomodoroMode(this.pomo.mode);
    if (window.mindPlayAudio) window.mindPlayAudio.playTap();
  }

  updatePomodoroDisplay() {
    const mins = Math.floor(this.pomo.secondsLeft / 60);
    const secs = this.pomo.secondsLeft % 60;
    const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const textEl = document.getElementById('pomo-timer-text');
    if (textEl) textEl.textContent = str;

    // Update circular SVG progress
    const circle = document.getElementById('pomo-progress-circle');
    if (circle) {
      const circumference = 2 * Math.PI * 88; // r = 88
      const fraction = (this.pomo.totalSeconds - this.pomo.secondsLeft) / this.pomo.totalSeconds;
      const offset = circumference * (1 - fraction);
      circle.style.strokeDashoffset = offset;
    }
  }

  onPomodoroComplete() {
    this.pomo.isRunning = false;
    if (window.mindPlayAudio) window.mindPlayAudio.playZenBowl();

    if (this.pomo.mode === 'work') {
      if (window.mindPlayStorage) {
        window.mindPlayStorage.recordPomodoroSession();
      }
      alert('🎉 Great focus sprint! Your working memory and attention deserve a refreshing break.');
      this.setPomodoroMode('shortBreak');
    } else {
      alert('🌱 Break complete! Ready for your next focus session?');
      this.setPomodoroMode('work');
    }

    if (window.app) window.app.updateProgressUI();
  }

  /* -------------------------------------------------------------
     2. STOP TECHNIQUE ACTIVITY
  ------------------------------------------------------------- */
  initStopPractice() {
    this.stopStep = 1;
    this.breathingTimer = null;

    const nextBtn = document.getElementById('btn-stop-next');
    const startBreatheBtn = document.getElementById('btn-breathe-start');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.advanceStopStep());
    }

    if (startBreatheBtn) {
      startBreatheBtn.addEventListener('click', () => this.startBreathingCycle());
    }
  }

  advanceStopStep() {
    this.stopStep++;
    if (window.mindPlayAudio) window.mindPlayAudio.playPop();

    document.querySelectorAll('.stop-step-card').forEach(c => c.classList.remove('active-step'));
    const nextCard = document.getElementById(`stop-step-${this.stopStep}`);

    if (nextCard) {
      nextCard.classList.add('active-step');
    } else {
      // Completed all 4 steps!
      if (window.mindPlayStorage) window.mindPlayStorage.recordStopPractice();
      if (window.mindPlayAudio) window.mindPlayAudio.playZenBowl();
      alert('🌸 Wonderful mindfulness check-in! Your attention has been gently brought back to the present moment.');
      this.resetStopPractice();
    }
  }

  resetStopPractice() {
    this.stopStep = 1;
    document.querySelectorAll('.stop-step-card').forEach(c => c.classList.remove('active-step'));
    const step1 = document.getElementById('stop-step-1');
    if (step1) step1.classList.add('active-step');
    if (window.app) window.app.updateProgressUI();
  }

  startBreathingCycle() {
    const circle = document.getElementById('breathing-circle');
    const label = document.getElementById('breathing-label');
    const btn = document.getElementById('btn-breathe-start');
    if (btn) btn.disabled = true;

    if (circle && label) {
      circle.className = 'breathing-orb orb-inhale';
      label.textContent = 'Breathe in slowly through your nose... (4s)';
      if (window.mindPlayAudio) window.mindPlayAudio.playTap();

      setTimeout(() => {
        circle.className = 'breathing-orb orb-hold';
        label.textContent = 'Gently hold your breath... (2s)';

        setTimeout(() => {
          circle.className = 'breathing-orb orb-exhale';
          label.textContent = 'Exhale softly through your mouth... (4s)';

          setTimeout(() => {
            circle.className = 'breathing-orb';
            label.textContent = 'Feel your shoulders relax. Ready to observe!';
            if (btn) btn.disabled = false;
            const nextBtn = document.getElementById('btn-stop-next');
            if (nextBtn) nextBtn.click();
          }, 4000);
        }, 2000);
      }, 4000);
    }
  }

  /* -------------------------------------------------------------
     3. DISTRACTION CHECKLIST AUDIT
  ------------------------------------------------------------- */
  initDistractionAudit() {
    const checkBoxes = document.querySelectorAll('.distraction-checkbox');
    const resetBtn = document.getElementById('btn-reset-audit');

    checkBoxes.forEach(cb => {
      cb.addEventListener('change', () => this.calculateDistractionScore());
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        checkBoxes.forEach(cb => cb.checked = false);
        this.calculateDistractionScore();
      });
    }
  }

  calculateDistractionScore() {
    const checkBoxes = document.querySelectorAll('.distraction-checkbox');
    const checked = Array.from(checkBoxes).filter(c => c.checked);
    const total = checkBoxes.length;

    // Vulnerability percentage
    const pct = Math.round((checked.length / total) * 100);

    const scoreDisplay = document.getElementById('audit-score-pct');
    const fillBar = document.getElementById('audit-bar-fill');
    const feedbackBox = document.getElementById('audit-feedback-text');

    if (scoreDisplay) scoreDisplay.textContent = `${pct}%`;
    if (fillBar) fillBar.style.width = `${pct}%`;

    if (feedbackBox) {
      if (pct <= 20) {
        feedbackBox.innerHTML = '🛡️ <strong>Focus Sanctuary:</strong> Your environment is exceptionally distraction-proof! You have built great boundaries for sustained attention.';
        feedbackBox.className = 'audit-feedback text-mint';
      } else if (pct <= 55) {
        feedbackBox.innerHTML = '⚡ <strong>Moderate Interference:</strong> A few subtle distractions (like phone pings or desk clutter) are draining your working memory reserves.';
        feedbackBox.className = 'audit-feedback text-blue';
      } else {
        feedbackBox.innerHTML = '⚠️ <strong>High Distraction Vulnerability:</strong> Multiple cognitive leaks detected! Put your phone in another room and clear your desk surface before studying.';
        feedbackBox.className = 'audit-feedback text-pink';
      }
    }

    if (window.mindPlayStorage) {
      window.mindPlayStorage.saveDistractionAudit(pct, checked.map(c => c.value));
    }
  }

  /* -------------------------------------------------------------
     4. DAILY FOCUS GOALS & PROGRESS
  ------------------------------------------------------------- */
  initDailyGoals() {
    this.updateDailyGoalsUI();
  }

  updateDailyGoalsUI() {
    if (!window.mindPlayStorage) return;
    const goals = window.mindPlayStorage.getDailyGoals();
    const streak = window.mindPlayStorage.getStreak();

    const streakEl = document.getElementById('streak-count-val');
    if (streakEl) streakEl.textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;

    const pomoProgressEl = document.getElementById('goal-pomo-progress');
    const pomoFillEl = document.getElementById('goal-pomo-fill');
    if (pomoProgressEl) {
      pomoProgressEl.textContent = `${goals.completedPomodoros} / ${goals.targetPomodoros}`;
    }
    if (pomoFillEl) {
      const pct = Math.min(100, (goals.completedPomodoros / goals.targetPomodoros) * 100);
      pomoFillEl.style.width = `${pct}%`;
    }

    const gameProgressEl = document.getElementById('goal-game-progress');
    const gameFillEl = document.getElementById('goal-game-fill');
    if (gameProgressEl) {
      gameProgressEl.textContent = `${goals.completedGames} / ${goals.targetGames}`;
    }
    if (gameFillEl) {
      const pct = Math.min(100, (goals.completedGames / goals.targetGames) * 100);
      gameFillEl.style.width = `${pct}%`;
    }

    const stopStatusEl = document.getElementById('goal-stop-status');
    if (stopStatusEl) {
      stopStatusEl.textContent = goals.stopPracticed ? 'Completed ✓' : 'Not yet today';
      stopStatusEl.className = goals.stopPracticed ? 'font-bold text-mint' : 'text-slate';
    }
  }

  /* -------------------------------------------------------------
     5. JAVA CODING CORNER (Interactive Simulator & Code Viewer)
  ------------------------------------------------------------- */
  initJavaCorner() {
    this.javaLessons = {
      variables: {
        title: '1. Variables & Data Types: Storing Focus Stats',
        desc: 'Variables hold game state values in memory: player scores (int), reaction time (double), and game status (boolean).',
        code: `public class FocusStats {
    public static void main(String[] args) {
        // Primitive variable types in Java
        int playerScore = 85;             // Whole numbers
        double reactionTimeMs = 342.8;     // Decimals (milliseconds)
        boolean isFocusActive = true;      // true or false
        char difficultyGrade = 'A';        // Single character
        String playerName = "Mindy";       // Text string

        System.out.println("Player: " + playerName);
        System.out.println("Score: " + playerScore + " pts");
        System.out.println("Speed: " + reactionTimeMs + " ms");
        System.out.println("Vigilance Active: " + isFocusActive);
    }
}`,
        simulateOutput: () => `Player: Mindy\nScore: 85 pts\nSpeed: 342.8 ms\nVigilance Active: true`
      },
      conditions: {
        title: '2. Conditional Statements: Inhibitory Brake Logic',
        desc: 'In the Stop or Go game, conditions check whether the user pressed on a green light (reward) or red light (penalty).',
        code: `public class ImpulseControl {
    public static void checkResponse(String signal, boolean userTapped) {
        if (signal.equals("GREEN") && userTapped) {
            System.out.println("🟢 Good reflex! +10 Points (Target Hit)");
        } else if (signal.equals("RED") && userTapped) {
            System.out.println("🔴 Impulsive error! -10 Points (Failed to Brake)");
        } else if (signal.equals("RED") && !userTapped) {
            System.out.println("🛡️ Great inhibitory control! Withheld successfully.");
        } else {
            System.out.println("⚠️ Omission error: Missed green signal.");
        }
    }
}`,
        simulateOutput: () => `Checking Trial 1 (Signal: GREEN, User: Tapped):\n🟢 Good reflex! +10 Points (Target Hit)\n\nChecking Trial 2 (Signal: RED, User: Tapped):\n🔴 Impulsive error! -10 Points (Failed to Brake)\n\nChecking Trial 3 (Signal: RED, User: Withheld):\n🛡️ Great inhibitory control! Withheld successfully.`
      },
      loops: {
        title: '3. Loops: Counting Down Focus Sprints',
        desc: 'For-loops and while-loops automate repetitive actions, such as generating distractor cards or counting down minutes.',
        code: `public class PomodoroLoop {
    public static void main(String[] args) {
        int focusMinutes = 5; // Mini sprint demo

        System.out.println("Starting 5-minute study sprint...");
        for (int min = focusMinutes; min > 0; min--) {
            System.out.println("⏳ Focus time remaining: " + min + " minute(s)");
        }
        System.out.println("🔔 Ring! Sprint complete. Take a 2-minute break!");
    }
}`,
        simulateOutput: () => `Starting 5-minute study sprint...\n⏳ Focus time remaining: 5 minute(s)\n⏳ Focus time remaining: 4 minute(s)\n⏳ Focus time remaining: 3 minute(s)\n⏳ Focus time remaining: 2 minute(s)\n⏳ Focus time remaining: 1 minute(s)\n🔔 Ring! Sprint complete. Take a 2-minute break!`
      },
      methods: {
        title: '4. Methods: Computing Attention Accuracy',
        desc: 'Methods in Java encapsulate mathematical calculations so you can reuse them across multiple games.',
        code: `public class AttentionCalculator {
    // Reusable method to calculate focus accuracy percentage
    public static double calculateAccuracy(int hits, int totalTargets, int falseAlarms) {
        if (totalTargets == 0) return 0.0;
        double hitRatio = ((double) hits / totalTargets) * 100.0;
        double penalty = falseAlarms * 5.0;
        double finalScore = Math.max(0.0, hitRatio - penalty);
        return Math.round(finalScore * 10.0) / 10.0;
    }

    public static void main(String[] args) {
        double acc = calculateAccuracy(9, 10, 1);
        System.out.println("Selective Attention Accuracy: " + acc + "%");
    }
}`,
        simulateOutput: () => `Inputs: hits = 9, totalTargets = 10, falseAlarms = 1\nHit Ratio = 90.0%\nPenalty = 5.0%\nSelective Attention Accuracy: 85.0%`
      },
      classes: {
        title: '5. Classes & Objects: Object-Oriented Player Profile',
        desc: 'Classes model real-world concepts by combining state (variables) and behaviors (methods) together.',
        code: `public class FocusPlayer {
    // Fields (Attributes)
    private String username;
    private int streakDays;
    private int totalGamesCompleted;

    // Constructor
    public FocusPlayer(String username) {
        this.username = username;
        this.streakDays = 1;
        this.totalGamesCompleted = 0;
    }

    // Methods (Behaviors)
    public void recordGameCompletion() {
        this.totalGamesCompleted++;
        System.out.println(username + " completed game #" + totalGamesCompleted);
    }

    public void displayProfile() {
        System.out.println("--- Focus Profile: " + username + " ---");
        System.out.println("Streak: " + streakDays + " days");
        System.out.println("Games Played: " + totalGamesCompleted);
    }
}`,
        simulateOutput: () => `Instantiating new FocusPlayer("Alex")...\nAlex completed game #1\nAlex completed game #2\n--- Focus Profile: Alex ---\nStreak: 1 days\nGames Played: 2`
      }
    };

    this.bindJavaLessonEvents();
  }

  bindJavaLessonEvents() {
    const tabs = document.querySelectorAll('.java-lesson-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const lessonKey = tab.getAttribute('data-lesson');
        this.renderJavaLesson(lessonKey);
      });
    });

    const runBtn = document.getElementById('btn-run-java');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        const activeTab = document.querySelector('.java-lesson-tab.active');
        const key = activeTab ? activeTab.getAttribute('data-lesson') : 'variables';
        const lesson = this.javaLessons[key];
        const term = document.getElementById('java-terminal-output');
        if (term && lesson) {
          term.textContent = lesson.simulateOutput();
          term.classList.add('flash-term');
          setTimeout(() => term.classList.remove('flash-term'), 300);
          if (window.mindPlayAudio) window.mindPlayAudio.playPop();
        }
      });
    }

    const copyBtn = document.getElementById('btn-copy-java');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const codeEl = document.getElementById('java-code-snippet');
        if (codeEl) {
          navigator.clipboard.writeText(codeEl.textContent).then(() => {
            copyBtn.textContent = 'Copied! ✓';
            setTimeout(() => copyBtn.textContent = '📋 Copy Java Code', 2000);
          });
        }
      });
    }
  }

  renderJavaLesson(key) {
    const lesson = this.javaLessons[key];
    if (!lesson) return;

    const titleEl = document.getElementById('java-lesson-title');
    const descEl = document.getElementById('java-lesson-desc');
    const codeEl = document.getElementById('java-code-snippet');
    const term = document.getElementById('java-terminal-output');

    if (titleEl) titleEl.textContent = lesson.title;
    if (descEl) descEl.textContent = lesson.desc;
    if (codeEl) codeEl.textContent = lesson.code;
    if (term) term.textContent = 'Click "Run Simulation" above to execute this Java code!';
  }
}

window.MindPlayTools = MindPlayTools;
