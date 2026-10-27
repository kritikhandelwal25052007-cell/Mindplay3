/**
 * MindPlay: Game 5 - Memory Challenge
 * Working Memory Span & Sequential Recall.
 * Features adaptive sequence length and forward/backward recall modes.
 */

class MemoryChallengeGame {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.difficulty = options.difficulty || 'medium';
    this.onComplete = options.onComplete || (() => {});
    this.onExit = options.onExit || (() => {});

    this.palette = [
      { id: 'berry', icon: '🍓', label: 'Berry' },
      { id: 'avocado', icon: '🥑', label: 'Avocado' },
      { id: 'grapes', icon: '🍇', label: 'Grapes' },
      { id: 'lemon', icon: '🍋', label: 'Lemon' },
      { id: 'watermelon', icon: '🍉', label: 'Melon' },
      { id: 'peach', icon: '🍑', label: 'Peach' }
    ];

    this.state = {
      phase: 'intro',
      currentLength: 3,
      maxReached: 3,
      sequence: [],
      userEntries: [],
      lives: 2,
      score: 0,
      isReverseMode: this.difficulty === 'hard',
      presentationTimer: null
    };

    this.renderIntro();
  }

  getDifficultyConfig() {
    switch (this.difficulty) {
      case 'easy':
        return { startLength: 3, displayMs: 1100, isReverse: false };
      case 'hard':
        return { startLength: 4, displayMs: 800, isReverse: true }; // Reverse recall!
      case 'medium':
      default:
        return { startLength: 3, displayMs: 950, isReverse: false };
    }
  }

  destroy() {
    if (this.state.presentationTimer) clearTimeout(this.state.presentationTimer);
    this.container.innerHTML = '';
  }

  renderIntro() {
    const config = this.getDifficultyConfig();

    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="game-top-bar">
          <span class="badge badge-pink">Working Memory Span</span>
          <span class="badge badge-mint">Difficulty: ${this.difficulty.toUpperCase()}</span>
        </div>
        <h2 class="game-heading">Memory Challenge 🧠</h2>
        <p class="game-intro">
          Working memory is your mind's mental scratchpad: holding information active for a few seconds while you process or recall it.
        </p>

        <div class="friendly-guide-card">
          <h4>How to Play:</h4>
          <ul>
            <li>A sequence of cute fruit symbols will flash on screen one by one.</li>
            <li>${config.isReverse
              ? '<strong>Hard Mode (Reverse Recall):</strong> Click the symbols in <em>REVERSE</em> order (from last to first)!'
              : 'Memorize the exact order, then click the symbols in the <strong>SAME sequence</strong>.'}</li>
            <li>Each time you succeed, the sequence gets one step longer!</li>
          </ul>
        </div>

        <div class="btn-group">
          <button class="btn btn-pink" id="btn-start-mem">Start Memory Test</button>
          <button class="btn btn-ghost" id="btn-exit-game">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-mem').addEventListener('click', () => {
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
    this.state.currentLength = config.startLength;
    this.state.maxReached = config.startLength;
    this.state.lives = 2;
    this.state.score = 0;
    this.state.isReverseMode = config.isReverse;

    this.startRound();
  }

  startRound() {
    const config = this.getDifficultyConfig();
    this.state.userEntries = [];

    // Generate random sequence
    this.state.sequence = [];
    for (let i = 0; i < this.state.currentLength; i++) {
      const item = this.palette[Math.floor(Math.random() * this.palette.length)];
      this.state.sequence.push(item);
    }

    this.renderPresentationStage();

    // Flash items one by one
    let idx = 0;
    const showNext = () => {
      if (idx < this.state.sequence.length) {
        const item = this.state.sequence[idx];
        const displayEl = document.getElementById('flash-item-display');
        const counterEl = document.getElementById('flash-step');

        if (displayEl) {
          displayEl.textContent = item.icon;
          displayEl.classList.remove('animate-pop');
          void displayEl.offsetWidth;
          displayEl.classList.add('animate-pop');
        }
        if (counterEl) counterEl.textContent = `${idx + 1} / ${this.state.currentLength}`;
        if (window.mindPlayAudio) window.mindPlayAudio.playPop();

        idx++;
        this.state.presentationTimer = setTimeout(showNext, config.displayMs);
      } else {
        // Finished flashing sequence, go to recall
        this.renderRecallStage();
      }
    };

    this.state.presentationTimer = setTimeout(showNext, 600);
  }

  renderPresentationStage() {
    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="game-stats-header">
          <div class="target-callout-pill">
            <span class="target-label">WATCH SEQUENCE:</span>
            <span class="target-name">Length: ${this.state.currentLength} items</span>
          </div>

          <div class="score-pills">
            <div class="pill-stat">
              <span class="stat-small">Lives</span>
              <span class="stat-val font-bold text-pink">${'❤️'.repeat(this.state.lives)}</span>
            </div>
            <div class="pill-stat">
              <span class="stat-small">Item</span>
              <span class="stat-val font-bold text-mint" id="flash-step">1 / ${this.state.currentLength}</span>
            </div>
          </div>
        </div>

        <div class="memory-stage-box">
          <div class="memory-flash-card animate-pop" id="flash-item-display">👀</div>
          <div class="memory-hint font-mono">Hold the sequence in your mind...</div>
        </div>
      </div>
    `;
  }

  renderRecallStage() {
    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="game-stats-header">
          <div class="target-callout-pill">
            <span class="target-label">RECALL STAGE:</span>
            <span class="target-name">${this.state.isReverseMode ? 'Enter in REVERSE order' : 'Enter in FORWARD order'}</span>
          </div>

          <div class="score-pills">
            <div class="pill-stat">
              <span class="stat-small">Lives</span>
              <span class="stat-val font-bold text-pink">${'❤️'.repeat(this.state.lives)}</span>
            </div>
            <div class="pill-stat">
              <span class="stat-small">Progress</span>
              <span class="stat-val font-bold text-blue" id="entered-count">0 / ${this.state.currentLength}</span>
            </div>
          </div>
        </div>

        <!-- Slots row where chosen fruits appear -->
        <div class="slots-container" id="slots-holder">
          ${Array.from({ length: this.state.currentLength }).map((_, i) => `
            <div class="memory-slot-box" id="slot-${i}">
              <span class="slot-num">${i + 1}</span>
            </div>
          `).join('')}
        </div>

        <!-- Interactive keypad -->
        <div class="keypad-grid">
          ${this.palette.map(item => `
            <button class="keypad-btn btn-mint animate-pop" data-id="${item.id}" aria-label="${item.label}">
              <span class="key-icon">${item.icon}</span>
              <span class="key-label">${item.label}</span>
            </button>
          `).join('')}
        </div>

        <div class="keypad-actions">
          <button class="btn btn-ghost" id="btn-clear-entry">Clear Row</button>
        </div>
      </div>
    `;

    document.querySelectorAll('.keypad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.handleKeypadEntry(id);
      });
    });

    document.getElementById('btn-clear-entry').addEventListener('click', () => {
      this.state.userEntries = [];
      for (let i = 0; i < this.state.currentLength; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) slot.innerHTML = `<span class="slot-num">${i + 1}</span>`;
      }
      const countEl = document.getElementById('entered-count');
      if (countEl) countEl.textContent = `0 / ${this.state.currentLength}`;
      if (window.mindPlayAudio) window.mindPlayAudio.playTap();
    });
  }

  handleKeypadEntry(itemId) {
    if (this.state.userEntries.length >= this.state.currentLength) return;

    const chosen = this.palette.find(p => p.id === itemId);
    const currentIdx = this.state.userEntries.length;
    this.state.userEntries.push(chosen);

    const slot = document.getElementById(`slot-${currentIdx}`);
    if (slot) {
      slot.innerHTML = `<span class="entered-icon animate-pop">${chosen.icon}</span>`;
    }

    const countEl = document.getElementById('entered-count');
    if (countEl) countEl.textContent = `${this.state.userEntries.length} / ${this.state.currentLength}`;

    if (window.mindPlayAudio) window.mindPlayAudio.playPop();

    // Check when all slots filled
    if (this.state.userEntries.length === this.state.currentLength) {
      setTimeout(() => this.evaluateRecall(), 400);
    }
  }

  evaluateRecall() {
    const targetSeq = this.state.isReverseMode
      ? [...this.state.sequence].reverse()
      : this.state.sequence;

    const isCorrect = this.state.userEntries.every((entry, i) => entry.id === targetSeq[i].id);

    if (isCorrect) {
      // Success! Add score & increase sequence length
      this.state.score += this.state.currentLength * 20;
      this.state.currentLength++;
      if (this.state.currentLength > this.state.maxReached) {
        this.state.maxReached = this.state.currentLength;
      }
      if (window.mindPlayAudio) window.mindPlayAudio.playSuccess();
      this.startRound();
    } else {
      // Mistake! Lose a life
      this.state.lives--;
      if (window.mindPlayAudio) window.mindPlayAudio.playSoftError();

      if (this.state.lives > 0) {
        // Try same length again
        this.startRound();
      } else {
        // Game over
        this.finishGame();
      }
    }
  }

  finishGame() {
    const maxLen = this.state.maxReached;
    const finalScore = this.state.score;
    const accuracy = Math.min(100, Math.round((maxLen / 7) * 100));

    const results = {
      score: finalScore,
      accuracy,
      difficulty: this.difficulty,
      metrics: {
        maxSequenceLength: maxLen,
        isReverseMode: this.state.isReverseMode
      }
    };

    if (window.mindPlayStorage) {
      window.mindPlayStorage.recordGameSession('memory-challenge', results);
    }

    if (window.mindPlayAudio) {
      window.mindPlayAudio.playSuccess();
    }

    this.renderResults(results);
    this.onComplete(results);
  }

  renderResults(res) {
    const m = res.metrics;
    this.container.innerHTML = `
      <div class="game-wrapper animate-fadeIn">
        <div class="results-badge-card">
          <span class="results-emoji">🧠</span>
          <h3 class="results-title">Memory Span Reached!</h3>
          <p class="results-sub">Max Working Memory Span: <strong>${m.maxSequenceLength} items</strong> (${res.score} points)</p>
        </div>

        <div class="results-stats-row">
          <div class="result-box">
            <span class="r-label">Max Items Recalled</span>
            <span class="r-val text-mint font-bold">${m.maxSequenceLength} Chunks</span>
          </div>
          <div class="result-box">
            <span class="r-label">Recall Mode</span>
            <span class="r-val text-blue">${m.isReverseMode ? 'Reverse Order' : 'Forward Order'}</span>
          </div>
          <div class="result-box">
            <span class="r-label">Working Memory Score</span>
            <span class="r-val text-pink font-bold">${res.score} pts</span>
          </div>
        </div>

        <div class="psych-insight-card">
          <h4>🧠 Psychology Behind This Game:</h4>
          <p>
            <strong>Cowan's 4-Chunk Limit:</strong> While George Miller famously suggested 7 ± 2 for phone numbers, modern cognitive psychologist Nelson Cowan proved that pure, unchunked working memory holds about <strong>4 distinct items</strong> at once.
          </p>
          <div class="tip-pill">
            💡 <em>Daily Tip: To remember longer strings (like passwords or study terms), "chunk" them into groups of 3 or 4 meaningful clusters!</em>
          </div>
        </div>

        <div class="btn-group">
          <button class="btn btn-pink" id="btn-replay-mem">Play Again</button>
          <button class="btn btn-ghost" id="btn-back-arcade">Back to Arcade</button>
        </div>
      </div>
    `;

    document.getElementById('btn-replay-mem').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('btn-back-arcade').addEventListener('click', () => {
      this.onExit();
    });
  }
}

window.MemoryChallengeGame = MemoryChallengeGame;
