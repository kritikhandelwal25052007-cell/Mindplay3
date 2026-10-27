/**
 * MindPlay: Game 1 - Focus Finder
 * Explores Selective Attention and Visual Search Filtering.
 * Players locate specific target symbols among a sea of distracting pastel symbols.
 */

class FocusFinderGame {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.difficulty = options.difficulty || 'medium';
    this.onComplete = options.onComplete || (() => {});
    this.onExit = options.onExit || (() => {});

    this.symbols = [
      { id: 'star', icon: '⭐', name: 'Golden Star', color: '#f59e0b' },
      { id: 'heart', icon: '💖', name: 'Pink Heart', color: '#ec4899' },
      { id: 'clover', icon: '🍀', name: 'Four-Leaf Clover', color: '#10b981' },
      { id: 'flower', icon: '🌸', name: 'Sakura Blossom', color: '#f472b6' },
      { id: 'crystal', icon: '💎', name: 'Sky Gem', color: '#38bdf8' },
      { id: 'moon', icon: '🌙', name: 'Crescent Moon', color: '#818cf8' },
      { id: 'sun', icon: '☀️', name: 'Sunbeam', color: '#eab308' },
      { id: 'leaf', icon: '🍃', name: 'Mint Leaf', color: '#34d399' },
      { id: 'cloud', icon: '☁️', name: 'Fluffy Cloud', color: '#94a3b8' },
      { id: 'sparkle', icon: '✨', name: 'Sparkle Dust', color: '#fbbf24' }
    ];

    this.state = {
      phase: 'intro', // 'intro' | 'playing' | 'results'
      targetSymbol: null,
      targetCount: 0,
      foundCount: 0,
      falseAlarmCount: 0,
      gridItems: [],
      timeLeft: 25,
      totalTime: 25,
      startTime: null
    };

    this.timerInterval = null;
    this.renderIntro();
  }

  getDifficultyConfig() {
    switch (this.difficulty) {
      case 'easy':
        return { totalItems: 24, targetCount: 5, timeSecs: 30 };
      case 'hard':
        return { totalItems: 54, targetCount: 10, timeSecs: 20 };
      case 'medium':
      default:
        return { totalItems: 36, targetCount: 7, timeSecs: 25 };
    }
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.container.innerHTML = '';
  }

  renderIntro() {
    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="game-top-bar">
          <span class="badge badge-pink">Selective Attention</span>
          <span class="badge badge-mint">Difficulty: ${this.difficulty.toUpperCase()}</span>
        </div>
        <h2 class="game-heading">Focus Finder 🔍</h2>
        <p class="game-intro">
          Selective attention is your brain's ability to focus on one important visual feature while filtering out harmless distractions.
        </p>

        <div class="friendly-guide-card">
          <h4>How to Play:</h4>
          <ul>
            <li>You will be assigned a <strong>Target Symbol</strong>.</li>
            <li>Scan the pastel grid and click <strong>every matching target</strong> as quickly as possible.</li>
            <li>Avoid clicking the distracting symbols!</li>
          </ul>
        </div>

        <div class="btn-group">
          <button class="btn btn-mint" id="btn-start-finder">Start Finding!</button>
          <button class="btn btn-ghost" id="btn-exit-game">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-finder').addEventListener('click', () => {
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
    this.state.foundCount = 0;
    this.state.falseAlarmCount = 0;
    this.state.timeLeft = config.timeSecs;
    this.state.totalTime = config.timeSecs;
    this.state.startTime = performance.now();

    // Pick random target symbol
    const targetIdx = Math.floor(Math.random() * this.symbols.length);
    this.state.targetSymbol = this.symbols[targetIdx];
    this.state.targetCount = config.targetCount;

    // Distractor pool
    const otherSymbols = this.symbols.filter((_, i) => i !== targetIdx);

    // Build grid items
    const items = [];
    for (let i = 0; i < config.targetCount; i++) {
      items.push({ id: `target_${i}`, isTarget: true, symbol: this.state.targetSymbol, clicked: false });
    }
    const distractorCount = config.totalItems - config.targetCount;
    for (let i = 0; i < distractorCount; i++) {
      const sym = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
      items.push({ id: `dist_${i}`, isTarget: false, symbol: sym, clicked: false });
    }

    // Shuffle items thoroughly
    this.state.gridItems = items.sort(() => Math.random() - 0.5);

    this.renderGameUI();
    this.startTimer();
  }

  renderGameUI() {
    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="game-stats-header">
          <div class="target-callout-pill">
            <span class="target-label">FIND THIS:</span>
            <span class="target-icon">${this.state.targetSymbol.icon}</span>
            <span class="target-name">${this.state.targetSymbol.name}</span>
          </div>

          <div class="score-pills">
            <div class="pill-stat">
              <span class="stat-small">Found</span>
              <span class="stat-val font-bold text-mint" id="found-count">0 / ${this.state.targetCount}</span>
            </div>
            <div class="pill-stat">
              <span class="stat-small">Time</span>
              <span class="stat-val font-mono text-pink" id="time-left">${this.state.timeLeft}s</span>
            </div>
          </div>
        </div>

        <div class="symbols-grid grid-count-${this.state.gridItems.length}" id="symbols-grid">
          ${this.state.gridItems.map((item, idx) => `
            <button class="symbol-card animate-pop"
                    data-index="${idx}"
                    style="animation-delay: ${idx * 0.02}s"
                    aria-label="${item.symbol.name}">
              ${item.symbol.icon}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Click handler for symbols
    document.querySelectorAll('.symbol-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const item = this.state.gridItems[idx];
        if (item.clicked) return;

        item.clicked = true;
        if (item.isTarget) {
          this.state.foundCount++;
          btn.classList.add('card-correct');
          if (window.mindPlayAudio) window.mindPlayAudio.playPop();

          const foundEl = document.getElementById('found-count');
          if (foundEl) foundEl.textContent = `${this.state.foundCount} / ${this.state.targetCount}`;

          // If all targets found!
          if (this.state.foundCount >= this.state.targetCount) {
            clearInterval(this.timerInterval);
            this.finishGame(true);
          }
        } else {
          this.state.falseAlarmCount++;
          btn.classList.add('card-wrong');
          if (window.mindPlayAudio) window.mindPlayAudio.playSoftError();
        }
      });
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.state.timeLeft--;
      const timeEl = document.getElementById('time-left');
      if (timeEl) timeEl.textContent = `${this.state.timeLeft}s`;

      if (this.state.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.finishGame(false);
      }
    }, 1000);
  }

  finishGame(allFound) {
    const elapsedSecs = Math.round((performance.now() - this.state.startTime) / 1000);
    const targetCount = this.state.targetCount;
    const found = this.state.foundCount;
    const errors = this.state.falseAlarmCount;

    // Accuracy: proportion of targets found minus error penalty
    const hitRate = (found / targetCount) * 100;
    const penalty = errors * 10;
    const accuracy = Math.max(0, Math.min(100, Math.round(hitRate - penalty)));
    const score = Math.max(0, Math.round(accuracy * 10 + (allFound ? (this.state.timeLeft * 5) : 0)));

    const results = {
      score,
      accuracy,
      difficulty: this.difficulty,
      metrics: {
        targetsFound: found,
        totalTargets: targetCount,
        falseAlarms: errors,
        elapsedSecs,
        allFound
      }
    };

    if (window.mindPlayStorage) {
      window.mindPlayStorage.recordGameSession('focus-finder', results);
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
          <span class="results-emoji">${m.allFound ? '🌟' : '🎈'}</span>
          <h3 class="results-title">${m.allFound ? 'Target Acquired!' : 'Time Reached!'}</h3>
          <p class="results-sub">You scored <strong>${res.score} points</strong> (${res.accuracy}% focus accuracy)</p>
        </div>

        <div class="results-stats-row">
          <div class="result-box">
            <span class="r-label">Targets Found</span>
            <span class="r-val text-mint">${m.targetsFound} / ${m.totalTargets}</span>
          </div>
          <div class="result-box">
            <span class="r-label">Distractor Clicks</span>
            <span class="r-val text-pink">${m.falseAlarms}</span>
          </div>
          <div class="result-box">
            <span class="r-label">Search Speed</span>
            <span class="r-val text-blue">${m.elapsedSecs}s</span>
          </div>
        </div>

        <div class="psych-insight-card">
          <h4>🧠 Psychology Behind This Game:</h4>
          <p>
            <strong>Selective Attention & Feature Integration:</strong> When looking for the ${this.state.targetSymbol.name}, your brain creates a mental template of its shape and color. Your visual cortex rapidly filters out non-matching shapes. Distractions occur when your eyes drift or when items share similar colors!
          </p>
          <div class="tip-pill">
            💡 <em>Daily Tip: When reading a textbook, use a colored ruler or finger guide to direct your selective visual spotlight!</em>
          </div>
        </div>

        <div class="btn-group">
          <button class="btn btn-pink" id="btn-replay-finder">Play Again</button>
          <button class="btn btn-ghost" id="btn-back-arcade">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-replay-finder').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('btn-back-arcade').addEventListener('click', () => {
      this.onExit();
    });
  }
}

window.FocusFinderGame = FocusFinderGame;
