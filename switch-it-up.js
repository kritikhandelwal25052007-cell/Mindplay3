/**
 * MindPlay: Game 3 - Switch It Up
 * Explores Task Switching, Cognitive Flexibility, and Task-Set Reconfiguration.
 * Demonstrates the psychological "Switch Cost" when alternating rules.
 */

class SwitchItUpGame {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.difficulty = options.difficulty || 'medium';
    this.onComplete = options.onComplete || (() => {});
    this.onExit = options.onExit || (() => {});

    this.shapes = ['circle', 'square'];
    this.colors = ['pink', 'blue'];

    this.state = {
      phase: 'intro',
      totalTrials: 16,
      currentTrial: 0,
      activeRule: 'color', // 'color' | 'shape'
      previousRule: null,
      activeStimulus: null,
      trialStartTime: 0,
      repeatRTs: [],
      switchRTs: [],
      correctCount: 0,
      errorCount: 0
    };

    this.renderIntro();
  }

  getDifficultyConfig() {
    switch (this.difficulty) {
      case 'easy':
        return { totalTrials: 12, timeoutMs: 4000 };
      case 'hard':
        return { totalTrials: 20, timeoutMs: 2200 };
      case 'medium':
      default:
        return { totalTrials: 16, timeoutMs: 3000 };
    }
  }

  destroy() {
    if (this.trialTimeout) clearTimeout(this.trialTimeout);
    this.container.innerHTML = '';
  }

  renderIntro() {
    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="game-top-bar">
          <span class="badge badge-blue">Attentional Task Switching</span>
          <span class="badge badge-mint">Difficulty: ${this.difficulty.toUpperCase()}</span>
        </div>
        <h2 class="game-heading">Switch It Up 🔄</h2>
        <p class="game-intro">
          Task switching measures your brain's cognitive flexibility: how quickly your executive network can discard one rule and activate another.
        </p>

        <div class="friendly-guide-card">
          <h4>How to Play:</h4>
          <ul>
            <li>Watch the top rule cue carefully on every turn!</li>
            <li>If the rule is <strong>COLOR</strong>: Tap whether the shape is <strong class="text-pink">PINK</strong> or <strong class="text-blue">BLUE</strong>.</li>
            <li>If the rule is <strong>SHAPE</strong>: Tap whether the shape is <strong>CIRCLE</strong> or <strong>SQUARE</strong>.</li>
            <li>Notice how your brain feels an extra split-second hesitation whenever the rule switches!</li>
          </ul>
        </div>

        <div class="btn-group">
          <button class="btn btn-blue" id="btn-start-switch">Start Switching</button>
          <button class="btn btn-ghost" id="btn-exit-game">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-switch').addEventListener('click', () => {
      if (window.mindPlayAudio) window.mindPlayAudio.playTap();
      this.startGame();
    });

    document.getElementById('btn-exit-game').addEventListener('click', () => {
      this.onExit();
    });
  }

  startGame() {
    const config = this.getDifficultyConfig();
    this.state.phase = 'playing';
    this.state.totalTrials = config.totalTrials;
    this.state.currentTrial = 0;
    this.state.repeatRTs = [];
    this.state.switchRTs = [];
    this.state.correctCount = 0;
    this.state.errorCount = 0;
    this.state.previousRule = null;

    this.nextTrial();
  }

  nextTrial() {
    if (this.state.currentTrial >= this.state.totalTrials) {
      this.finishGame();
      return;
    }

    this.state.currentTrial++;

    // Alternating pseudo-random schedule (mix of repeat and switch trials)
    const isSwitch = this.state.previousRule !== null && Math.random() < 0.55;
    if (isSwitch) {
      this.state.activeRule = this.state.previousRule === 'color' ? 'shape' : 'color';
    } else {
      this.state.activeRule = this.state.previousRule || (Math.random() < 0.5 ? 'color' : 'shape');
    }

    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    this.state.activeStimulus = { color, shape, isSwitchTrial: isSwitch };

    this.renderTrialUI();
    this.state.trialStartTime = performance.now();
  }

  renderTrialUI() {
    const rule = this.state.activeRule;
    const stim = this.state.activeStimulus;

    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="game-stats-header">
          <div class="rule-indicator-pill ${rule === 'color' ? 'pill-rule-color' : 'pill-rule-shape'}">
            <span class="rule-tag">ACTIVE RULE:</span>
            <span class="rule-text">${rule.toUpperCase()}</span>
          </div>

          <div class="score-pills">
            <div class="pill-stat">
              <span class="stat-small">Trial</span>
              <span class="stat-val font-bold text-blue">${this.state.currentTrial} / ${this.state.totalTrials}</span>
            </div>
            <div class="pill-stat">
              <span class="stat-small">Score</span>
              <span class="stat-val font-bold text-mint">${this.state.correctCount * 10}</span>
            </div>
          </div>
        </div>

        <!-- Stimulus Display Card -->
        <div class="switch-stage-box">
          <div class="stimulus-shape shape-${stim.shape} color-${stim.color} animate-pop"></div>
        </div>

        <!-- Dynamic Response Buttons -->
        <div class="switch-choices-row" id="choices-row">
          ${rule === 'color' ? `
            <button class="btn btn-choice btn-pink" data-choice="pink">🌸 PINK</button>
            <button class="btn btn-choice btn-blue" data-choice="blue">💎 BLUE</button>
          ` : `
            <button class="btn btn-choice btn-mint" data-choice="circle">⚪ CIRCLE</button>
            <button class="btn btn-choice btn-lavender" data-choice="square">⏹️ SQUARE</button>
          `}
        </div>

        <div class="switch-hint font-mono">
          ${rule === 'color' ? 'Judge COLOR: Is it Pink or Blue?' : 'Judge SHAPE: Is it Circle or Square?'}
        </div>
      </div>
    `;

    document.querySelectorAll('.btn-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-choice');
        this.handleChoice(choice);
      });
    });
  }

  handleChoice(choice) {
    const rt = performance.now() - this.state.trialStartTime;
    const rule = this.state.activeRule;
    const stim = this.state.activeStimulus;

    const isCorrect = (rule === 'color' && choice === stim.color) ||
                      (rule === 'shape' && choice === stim.shape);

    if (isCorrect) {
      this.state.correctCount++;
      if (window.mindPlayAudio) window.mindPlayAudio.playPop();

      if (stim.isSwitchTrial) {
        this.state.switchRTs.push(rt);
      } else {
        this.state.repeatRTs.push(rt);
      }
    } else {
      this.state.errorCount++;
      if (window.mindPlayAudio) window.mindPlayAudio.playSoftError();
    }

    this.state.previousRule = this.state.activeRule;
    this.nextTrial();
  }

  finishGame() {
    const total = this.state.totalTrials;
    const accuracy = Math.round((this.state.correctCount / total) * 100);

    const avgRepeat = this.state.repeatRTs.length > 0
      ? Math.round(this.state.repeatRTs.reduce((a, b) => a + b, 0) / this.state.repeatRTs.length)
      : 550;

    const avgSwitch = this.state.switchRTs.length > 0
      ? Math.round(this.state.switchRTs.reduce((a, b) => a + b, 0) / this.state.switchRTs.length)
      : 720;

    // Switch cost in ms
    const switchCost = Math.max(0, avgSwitch - avgRepeat);
    const score = Math.max(0, Math.round(accuracy * 10 - switchCost * 0.1));

    const results = {
      score,
      accuracy,
      difficulty: this.difficulty,
      metrics: {
        correctCount: this.state.correctCount,
        errorCount: this.state.errorCount,
        avgRepeatMs: avgRepeat,
        avgSwitchMs: avgSwitch,
        switchCostMs: switchCost
      }
    };

    if (window.mindPlayStorage) {
      window.mindPlayStorage.recordGameSession('switch-it-up', results);
    }

    if (window.mindPlayAudio) {
      if (accuracy >= 75) window.mindPlayAudio.playSuccess();
      else window.mindPlayAudio.playTap();
    }

    this.renderResults(results);
    this.onComplete(results);
  }

  renderResults(res) {
    const m = res.metrics;
    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="results-badge-card">
          <span class="results-emoji">🔄</span>
          <h3 class="results-title">Switching Trial Complete!</h3>
          <p class="results-sub">You scored <strong>${res.score} points</strong> (${res.accuracy}% rule accuracy)</p>
        </div>

        <div class="results-stats-row">
          <div class="result-box">
            <span class="r-label">Rule Repeat RT</span>
            <span class="r-val text-mint font-mono">${m.avgRepeatMs}ms</span>
          </div>
          <div class="result-box">
            <span class="r-label">Rule Switch RT</span>
            <span class="r-val text-pink font-mono">${m.avgSwitchMs}ms</span>
          </div>
          <div class="result-box">
            <span class="r-label">Switch Cost Penalty</span>
            <span class="r-val text-blue font-mono">+${m.switchCostMs}ms</span>
          </div>
        </div>

        <div class="psych-insight-card">
          <h4>🧠 Psychology Behind This Game:</h4>
          <p>
            <strong>The Cognitive "Switch Cost":</strong> Notice that your reaction time was roughly <strong>+${m.switchCostMs}ms slower</strong> when the rule changed compared to when it stayed the same! In cognitive science, this is known as the <em>switch cost</em>. Your prefrontal cortex had to inhibit the old rule set and load the new one into working memory.
          </p>
          <div class="tip-pill">
            💡 <em>Daily Tip: Multitasking is actually rapid task switching! Every time you glance from homework to a text notification, your brain pays this ${m.switchCostMs}ms cognitive tax.</em>
          </div>
        </div>

        <div class="btn-group">
          <button class="btn btn-blue" id="btn-replay-switch">Play Again</button>
          <button class="btn btn-ghost" id="btn-back-arcade">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-replay-switch').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('btn-back-arcade').addEventListener('click', () => {
      this.onExit();
    });
  }
}

window.SwitchItUpGame = SwitchItUpGame;
