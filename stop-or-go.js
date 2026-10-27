/**
 * MindPlay: Game 4 - Stop or Go
 * Classic Go / No-Go Paradigm for Inhibitory Control & Impulse Regulation.
 * Tests how quickly you can brake automatic behavioral responses when a stop signal flashes.
 */

class StopOrGoGame {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.difficulty = options.difficulty || 'medium';
    this.onComplete = options.onComplete || (() => {});
    this.onExit = options.onExit || (() => {});

    this.state = {
      phase: 'intro',
      totalTrials: 18,
      currentTrial: 0,
      activeSignal: null, // 'go' | 'stop'
      signalStartTime: 0,
      hasResponded: false,
      goHits: 0,
      goMisses: 0,
      goReactionTimes: [],
      stopSuccesses: 0,
      stopFailures: 0
    };

    this.trialTimer = null;
    this.renderIntro();
  }

  getDifficultyConfig() {
    switch (this.difficulty) {
      case 'easy':
        return { totalTrials: 15, signalDurationMs: 1300, stopRatio: 0.25 };
      case 'hard':
        return { totalTrials: 24, signalDurationMs: 800, stopRatio: 0.30 };
      case 'medium':
      default:
        return { totalTrials: 18, signalDurationMs: 1000, stopRatio: 0.25 };
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
          <span class="badge badge-mint">Inhibitory Control</span>
          <span class="badge badge-pink">Difficulty: ${this.difficulty.toUpperCase()}</span>
        </div>
        <h2 class="game-heading">Stop or Go 🚦</h2>
        <p class="game-intro">
          Inhibitory control is your brain's emergency brake. It allows you to resist habitual impulses, hold your tongue, and stop automatic reactions.
        </p>

        <div class="friendly-guide-card">
          <h4>How to Play:</h4>
          <ul>
            <li>When you see the <strong class="text-mint">🟢 GREEN RABBIT (GO)</strong>: Tap Space or Click as fast as you can!</li>
            <li>When you see the <strong class="text-pink">🔴 RED BEAR (STOP)</strong>: <strong>FREEZE! Do NOT tap!</strong></li>
            <li>Because Green signals appear frequently, your finger will want to tap automatically. Use your willpower to brake!</li>
          </ul>
        </div>

        <div class="btn-group">
          <button class="btn btn-mint" id="btn-start-stopgo">Test My Mental Brakes</button>
          <button class="btn btn-ghost" id="btn-exit-game">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-stopgo').addEventListener('click', () => {
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
    this.state.goHits = 0;
    this.state.goMisses = 0;
    this.state.goReactionTimes = [];
    this.state.stopSuccesses = 0;
    this.state.stopFailures = 0;

    this.renderGameUI();

    this.handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.registerAction();
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
            <span class="target-label">RULE:</span>
            <span class="target-name">🟢 Tap on Green / 🔴 Freeze on Red</span>
          </div>

          <div class="score-pills">
            <div class="pill-stat">
              <span class="stat-small">Signal</span>
              <span class="stat-val font-bold text-mint" id="signal-counter">1 / ${this.state.totalTrials}</span>
            </div>
            <div class="pill-stat">
              <span class="stat-small">Brake Rate</span>
              <span class="stat-val font-bold text-pink" id="brake-rate">100%</span>
            </div>
          </div>
        </div>

        <div class="stopgo-stage-box" id="stopgo-stage">
          <div class="signal-display animate-pop" id="signal-icon">READY</div>
          <div class="signal-instruction" id="signal-text">Prepare your reflexes...</div>
        </div>

        <div class="cpt-action-area">
          <button class="btn btn-mint btn-large" id="btn-tap-go">
            ⚡ TAP ON GREEN! (Spacebar)
          </button>
        </div>
      </div>
    `;

    const btn = document.getElementById('btn-tap-go');
    btn.addEventListener('mousedown', () => this.registerAction());
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.registerAction();
    });
  }

  registerAction() {
    if (this.state.phase !== 'playing' || this.state.hasResponded || !this.state.activeSignal) return;
    this.state.hasResponded = true;

    const rt = performance.now() - this.state.signalStartTime;
    const stage = document.getElementById('stopgo-stage');

    if (this.state.activeSignal === 'go') {
      // Good hit on Go signal!
      this.state.goHits++;
      this.state.goReactionTimes.push(rt);
      if (window.mindPlayAudio) window.mindPlayAudio.playPop();

      if (stage) stage.classList.add('flash-green');
    } else {
      // Failed to inhibit on Stop signal!
      this.state.stopFailures++;
      if (window.mindPlayAudio) window.mindPlayAudio.playSoftError();

      if (stage) stage.classList.add('flash-red');
    }

    this.updateBrakeRateUI();
  }

  updateBrakeRateUI() {
    const totalStops = this.state.stopSuccesses + this.state.stopFailures;
    const rate = totalStops > 0 ? Math.round((this.state.stopSuccesses / totalStops) * 100) : 100;
    const el = document.getElementById('brake-rate');
    if (el) el.textContent = `${rate}%`;
  }

  nextTrial() {
    const config = this.getDifficultyConfig();

    if (this.state.currentTrial >= this.state.totalTrials) {
      this.finishGame();
      return;
    }

    this.state.currentTrial++;
    this.state.hasResponded = false;

    const counterEl = document.getElementById('signal-counter');
    if (counterEl) counterEl.textContent = `${this.state.currentTrial} / ${this.state.totalTrials}`;

    // Randomize whether this trial is Stop or Go
    const isStop = Math.random() < config.stopRatio;
    this.state.activeSignal = isStop ? 'stop' : 'go';

    const stage = document.getElementById('stopgo-stage');
    if (stage) stage.classList.remove('flash-green', 'flash-red');

    const iconEl = document.getElementById('signal-icon');
    const textEl = document.getElementById('signal-text');

    if (iconEl && textEl) {
      if (isStop) {
        iconEl.textContent = '🛑';
        textEl.textContent = 'STOP! DO NOT TAP!';
        textEl.className = 'signal-instruction text-pink font-bold';
      } else {
        iconEl.textContent = '🟢';
        textEl.textContent = 'GO! TAP QUICKLY!';
        textEl.className = 'signal-instruction text-mint font-bold';
      }
      iconEl.classList.remove('animate-pop');
      void iconEl.offsetWidth;
      iconEl.classList.add('animate-pop');
    }

    this.state.signalStartTime = performance.now();

    this.trialTimer = setTimeout(() => {
      // Evaluate if player correctly withheld on Stop, or missed a Go
      if (this.state.activeSignal === 'stop' && !this.state.hasResponded) {
        this.state.stopSuccesses++;
        this.updateBrakeRateUI();
      } else if (this.state.activeSignal === 'go' && !this.state.hasResponded) {
        this.state.goMisses++;
      }
      this.nextTrial();
    }, config.signalDurationMs);
  }

  finishGame() {
    window.removeEventListener('keydown', this.handleKeyDown);

    const totalStops = this.state.stopSuccesses + this.state.stopFailures;
    const totalGos = this.state.goHits + this.state.goMisses;

    const inhibitionRate = totalStops > 0 ? Math.round((this.state.stopSuccesses / totalStops) * 100) : 100;
    const goHitRate = totalGos > 0 ? Math.round((this.state.goHits / totalGos) * 100) : 100;

    const avgRT = this.state.goReactionTimes.length > 0
      ? Math.round(this.state.goReactionTimes.reduce((a, b) => a + b, 0) / this.state.goReactionTimes.length)
      : 400;

    // Combined score: heavily weights inhibition control + reflex speed
    const score = Math.max(0, Math.round((inhibitionRate * 0.6 + goHitRate * 0.4) * 10));

    const results = {
      score,
      accuracy: inhibitionRate,
      difficulty: this.difficulty,
      metrics: {
        inhibitionRate,
        stopSuccesses: this.state.stopSuccesses,
        stopFailures: this.state.stopFailures,
        totalStops,
        goHits: this.state.goHits,
        goMisses: this.state.goMisses,
        avgReactionTimeMs: avgRT
      }
    };

    if (window.mindPlayStorage) {
      window.mindPlayStorage.recordGameSession('stop-or-go', results);
    }

    if (window.mindPlayAudio) {
      if (inhibitionRate >= 80) window.mindPlayAudio.playSuccess();
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
          <span class="results-emoji">🚦</span>
          <h3 class="results-title">Braking Test Complete!</h3>
          <p class="results-sub">Inhibition Success: <strong>${m.inhibitionRate}%</strong> (${res.score} points)</p>
        </div>

        <div class="results-stats-row">
          <div class="result-box">
            <span class="r-label">Stop Withholds</span>
            <span class="r-val text-mint">${m.stopSuccesses} / ${m.totalStops}</span>
          </div>
          <div class="result-box">
            <span class="r-label">Impulse Slips</span>
            <span class="r-val text-pink">${m.stopFailures}</span>
          </div>
          <div class="result-box">
            <span class="r-label">Go Speed (Reflex)</span>
            <span class="r-val text-blue font-mono">${m.avgReactionTimeMs}ms</span>
          </div>
        </div>

        <div class="psych-insight-card">
          <h4>🧠 Psychology Behind This Game:</h4>
          <p>
            <strong>Prepotent Responses & Motor Gating:</strong> When repeated "Go" signals occur, your motor cortex builds a strong behavioral momentum (a <em>prepotent response</em>). Withholding a response requires your right inferior frontal gyrus and subthalamic nucleus to send a rapid "cancel" command down your spinal cord in less than 200 milliseconds!
          </p>
          <div class="tip-pill">
            💡 <em>Daily Tip: When feeling the urge to send a spicy text message or eat another snack, use the 3-Second Rule: pause and let your prefrontal brake kick in!</em>
          </div>
        </div>

        <div class="btn-group">
          <button class="btn btn-mint" id="btn-replay-stopgo">Play Again</button>
          <button class="btn btn-ghost" id="btn-back-arcade">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-replay-stopgo').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('btn-back-arcade').addEventListener('click', () => {
      this.onExit();
    });
  }
}

window.StopOrGoGame = StopOrGoGame;
