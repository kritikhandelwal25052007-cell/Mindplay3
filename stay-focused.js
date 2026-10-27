/**
 * MindPlay: Game 2 - Stay Focused
 * Continuous Performance Test (CPT) for Sustained Attention & Vigilance.
 * Players maintain alertness over a rapid visual stream, pressing ONLY for target stimuli.
 */

class StayFocusedGame {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.difficulty = options.difficulty || 'medium';
    this.onComplete = options.onComplete || (() => {});
    this.onExit = options.onExit || (() => {});

    this.stimuli = [
      { id: 'target_star', icon: '🌟', isTarget: true, label: 'Golden Star' },
      { id: 'moon', icon: '🌙', isTarget: false, label: 'Crescent Moon' },
      { id: 'cloud', icon: '☁️', isTarget: false, label: 'Cloud' },
      { id: 'sun', icon: '☀️', isTarget: false, label: 'Sun' },
      { id: 'flower', icon: '🌸', isTarget: false, label: 'Flower' },
      { id: 'leaf', icon: '🍃', isTarget: false, label: 'Leaf' }
    ];

    this.state = {
      phase: 'intro',
      totalTrials: 20,
      currentTrial: 0,
      activeStimulus: null,
      stimulusStartTime: 0,
      hasRespondedThisTrial: false,
      hits: 0,
      misses: 0,
      falseAlarms: 0,
      reactionTimes: []
    };

    this.trialTimer = null;
    this.renderIntro();
  }

  getDifficultyConfig() {
    switch (this.difficulty) {
      case 'easy':
        return { totalTrials: 16, stimulusDurationMs: 1400, targetChance: 0.35 };
      case 'hard':
        return { totalTrials: 26, stimulusDurationMs: 850, targetChance: 0.25 };
      case 'medium':
      default:
        return { totalTrials: 20, stimulusDurationMs: 1100, targetChance: 0.30 };
    }
  }

  destroy() {
    if (this.trialTimer) clearTimeout(this.trialTimer);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.container.innerHTML = '';
  }

  renderIntro() {
    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="game-top-bar">
          <span class="badge badge-lavender">Sustained Attention</span>
          <span class="badge badge-mint">Difficulty: ${this.difficulty.toUpperCase()}</span>
        </div>
        <h2 class="game-heading">Stay Focused 🌟</h2>
        <p class="game-intro">
          Sustained attention is your mental endurance: keeping continuous focus on a task over time without letting your mind wander.
        </p>

        <div class="friendly-guide-card">
          <h4>How to Play:</h4>
          <ul>
            <li>Symbols will flash on the stage one after another.</li>
            <li>Press the <strong>SPACEBAR</strong> or tap the <strong>"TAP TARGET!"</strong> button <strong>ONLY when the 🌟 Golden Star appears</strong>.</li>
            <li>Stay vigilant! Do not tap for any other symbol.</li>
          </ul>
        </div>

        <div class="btn-group">
          <button class="btn btn-lavender" id="btn-start-stay">Start Vigilance Test</button>
          <button class="btn btn-ghost" id="btn-exit-game">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-stay').addEventListener('click', () => {
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
    this.state.hits = 0;
    this.state.misses = 0;
    this.state.falseAlarms = 0;
    this.state.reactionTimes = [];

    this.renderGameUI();

    this.handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.registerResponse();
      }
    };
    window.addEventListener('keydown', this.handleKeyDown);

    this.nextTrial();
  }

  renderGameUI() {
    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="game-stats-header">
          <div class="target-callout-pill">
            <span class="target-label">WATCH FOR:</span>
            <span class="target-icon">🌟</span>
            <span class="target-name">Golden Star</span>
          </div>

          <div class="score-pills">
            <div class="pill-stat">
              <span class="stat-small">Trial</span>
              <span class="stat-val font-bold text-lavender" id="trial-counter">1 / ${this.state.totalTrials}</span>
            </div>
            <div class="pill-stat">
              <span class="stat-small">Hits</span>
              <span class="stat-val font-bold text-mint" id="hits-count">0</span>
            </div>
          </div>
        </div>

        <div class="cpt-stage-box" id="cpt-stage">
          <div class="cpt-stimulus animate-pop" id="cpt-icon">⏳</div>
          <div class="cpt-hint font-mono">Press Space or Tap Button on 🌟</div>
        </div>

        <div class="cpt-action-area">
          <button class="btn btn-lavender btn-large" id="btn-tap-target">
            👆 TAP TARGET! (Space)
          </button>
        </div>
      </div>
    `;

    const btn = document.getElementById('btn-tap-target');
    btn.addEventListener('mousedown', () => this.registerResponse());
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.registerResponse();
    });
  }

  registerResponse() {
    if (this.state.phase !== 'playing' || this.state.hasRespondedThisTrial || !this.state.activeStimulus) return;
    this.state.hasRespondedThisTrial = true;

    const rt = performance.now() - this.state.stimulusStartTime;

    if (this.state.activeStimulus.isTarget) {
      // Hit!
      this.state.hits++;
      this.state.reactionTimes.push(rt);
      if (window.mindPlayAudio) window.mindPlayAudio.playPop();

      const stage = document.getElementById('cpt-stage');
      if (stage) stage.classList.add('flash-green');
      const hitsEl = document.getElementById('hits-count');
      if (hitsEl) hitsEl.textContent = this.state.hits;
    } else {
      // False alarm (commission error)
      this.state.falseAlarms++;
      if (window.mindPlayAudio) window.mindPlayAudio.playSoftError();

      const stage = document.getElementById('cpt-stage');
      if (stage) stage.classList.add('flash-red');
    }
  }

  nextTrial() {
    const config = this.getDifficultyConfig();

    if (this.state.currentTrial >= this.state.totalTrials) {
      this.finishGame();
      return;
    }

    this.state.currentTrial++;
    this.state.hasRespondedThisTrial = false;

    const counterEl = document.getElementById('trial-counter');
    if (counterEl) counterEl.textContent = `${this.state.currentTrial} / ${this.state.totalTrials}`;

    // Decide if this trial is target or distractor
    const isTarget = Math.random() < config.targetChance;
    if (isTarget) {
      this.state.activeStimulus = this.stimuli.find(s => s.isTarget);
    } else {
      const distractors = this.stimuli.filter(s => !s.isTarget);
      this.state.activeStimulus = distractors[Math.floor(Math.random() * distractors.length)];
    }

    const iconEl = document.getElementById('cpt-icon');
    const stage = document.getElementById('cpt-stage');
    if (stage) {
      stage.classList.remove('flash-green', 'flash-red');
    }

    if (iconEl) {
      iconEl.textContent = this.state.activeStimulus.icon;
      iconEl.classList.remove('animate-pop');
      void iconEl.offsetWidth;
      iconEl.classList.add('animate-pop');
    }

    this.state.stimulusStartTime = performance.now();

    this.trialTimer = setTimeout(() => {
      // Check if player missed a target
      if (this.state.activeStimulus.isTarget && !this.state.hasRespondedThisTrial) {
        this.state.misses++;
      }
      this.nextTrial();
    }, config.stimulusDurationMs);
  }

  finishGame() {
    window.removeEventListener('keydown', this.handleKeyDown);

    const totalTargets = this.state.hits + this.state.misses;
    const hitRate = totalTargets > 0 ? (this.state.hits / totalTargets) * 100 : 100;
    const penalty = this.state.falseAlarms * 12;
    const accuracy = Math.max(0, Math.min(100, Math.round(hitRate - penalty)));

    const sumRT = this.state.reactionTimes.reduce((a, b) => a + b, 0);
    const avgRT = this.state.reactionTimes.length > 0 ? Math.round(sumRT / this.state.reactionTimes.length) : 0;
    const score = Math.max(0, Math.round(accuracy * 10 - (avgRT > 600 ? 50 : 0)));

    const results = {
      score,
      accuracy,
      difficulty: this.difficulty,
      metrics: {
        hits: this.state.hits,
        misses: this.state.misses,
        falseAlarms: this.state.falseAlarms,
        totalTargets,
        avgReactionTimeMs: avgRT
      }
    };

    if (window.mindPlayStorage) {
      window.mindPlayStorage.recordGameSession('stay-focused', results);
    }

    if (window.mindPlayAudio) {
      if (accuracy >= 80) window.mindPlayAudio.playSuccess();
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
          <span class="results-emoji">🎯</span>
          <h3 class="results-title">Vigilance Test Complete!</h3>
          <p class="results-sub">You achieved <strong>${res.score} points</strong> (${res.accuracy}% vigilance accuracy)</p>
        </div>

        <div class="results-stats-row">
          <div class="result-box">
            <span class="r-label">Target Hits</span>
            <span class="r-val text-mint">${m.hits} / ${m.totalTargets}</span>
          </div>
          <div class="result-box">
            <span class="r-label">False Alarms (Mistaps)</span>
            <span class="r-val text-pink">${m.falseAlarms}</span>
          </div>
          <div class="result-box">
            <span class="r-label">Mean Reaction Time</span>
            <span class="r-val text-blue font-mono">${m.avgReactionTimeMs}ms</span>
          </div>
        </div>

        <div class="psych-insight-card">
          <h4>🧠 Psychology Behind This Game:</h4>
          <p>
            <strong>Continuous Performance & Attentional Lapses:</strong> In psychology laboratories, CPTs test the brain's <em>sustained attention network</em>. When vigilance drops, people make two kinds of errors: <em>omissions</em> (missing the target because attention drifted) and <em>commissions</em> (tapping impulsively when a distractor appears).
          </p>
          <div class="tip-pill">
            💡 <em>Daily Tip: Studies show human sustained focus naturally wanes after 25–40 minutes. Using scheduled focus sprints (like Pomodoro) resets your vigilance reserve!</em>
          </div>
        </div>

        <div class="btn-group">
          <button class="btn btn-lavender" id="btn-replay-stay">Play Again</button>
          <button class="btn btn-ghost" id="btn-back-arcade">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-replay-stay').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('btn-back-arcade').addEventListener('click', () => {
      this.onExit();
    });
  }
}

window.StayFocusedGame = StayFocusedGame;
