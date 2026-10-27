/**
 * MindPlay: Train Your Focus!
 * Main Application Controller - Handles routing, game mounting,
 * facts of the day, badge achievements, and UI sync.
 */

document.addEventListener('DOMContentLoaded', () => {
  const GAMES_REGISTRY = [
    {
      id: 'focus-finder',
      name: 'Focus Finder',
      icon: '🔍',
      category: 'Selective Attention',
      badgeClass: 'badge-pink',
      desc: 'Scan the pastel grid to locate specific target symbols while filtering out visual distractors.',
      playtime: '1–2 min',
      classRef: 'FocusFinderGame'
    },
    {
      id: 'stay-focused',
      name: 'Stay Focused',
      icon: '🌟',
      category: 'Sustained Attention',
      badgeClass: 'badge-lavender',
      desc: 'A continuous vigilance task. Maintain alertness over a rapid visual stream and tap only for the golden star.',
      playtime: '2 min',
      classRef: 'StayFocusedGame'
    },
    {
      id: 'switch-it-up',
      name: 'Switch It Up',
      icon: '🔄',
      category: 'Task Switching',
      badgeClass: 'badge-blue',
      desc: 'Alternate between Color and Shape rules to explore task-set reconfiguration and the cognitive switch cost.',
      playtime: '2 min',
      classRef: 'SwitchItUpGame'
    },
    {
      id: 'stop-or-go',
      name: 'Stop or Go',
      icon: '🚦',
      category: 'Inhibitory Control',
      badgeClass: 'badge-mint',
      desc: 'Test your mental emergency brakes! Tap fast on green signals, but freeze immediately when red appears.',
      playtime: '1–2 min',
      classRef: 'StopOrGoGame'
    },
    {
      id: 'memory-challenge',
      name: 'Memory Challenge',
      icon: '🧠',
      category: 'Working Memory',
      badgeClass: 'badge-pink',
      desc: 'Memorize sequences of cute fruit symbols and recall them in forward or reverse order to test your memory span.',
      playtime: '2–3 min',
      classRef: 'MemoryChallengeGame'
    }
  ];

  const PSYCH_FACTS = [
    {
      fact: "The human brain consumes about 20% of your body's energy while making up only 2% of your total weight!",
      category: "Brain Energy"
    },
    {
      fact: "Multitasking is a myth! Cognitive neuroscience shows your brain actually switches back and forth between tasks rapidly, paying an attentional tax each time.",
      category: "Cognitive Switching"
    },
    {
      fact: "Taking just a 5-minute break every 25 minutes (the Pomodoro technique) prevents attentional vigilance decrement and keeps working memory fresh.",
      category: "Vigilance Reserve"
    },
    {
      fact: "George Miller's classic 7 ± 2 rule applied to simple repeating. When active looping is prevented, true working memory capacity is about 4 chunks!",
      category: "Working Memory"
    },
    {
      fact: "A single smartphone notification ping can derail your focus for up to 23 minutes before your mind fully resumes deep flow.",
      category: "Attentional Drift"
    },
    {
      fact: "The prefrontal cortex acts like your conductor: directing the attentional spotlight and braking impulsive motor urges.",
      category: "Inhibitory Control"
    }
  ];

  class MindPlayApp {
    constructor() {
      this.activeGame = null;
      this.currentDifficulty = 'medium';

      this.initElements();
      this.initEvents();
      this.initTools();
      this.initRouting();
      this.renderDailyFact();
      this.renderArcadeCards();
      this.updateProgressUI();
    }

    initElements() {
      this.navLinks = document.querySelectorAll('.nav-link');
      this.views = document.querySelectorAll('.view-section');
      this.audioToggleBtn = document.getElementById('btn-audio-toggle');
      this.audioIcon = document.getElementById('audio-icon');
    }

    initEvents() {
      // Audio toggle
      if (this.audioToggleBtn) {
        this.audioToggleBtn.addEventListener('click', () => {
          const isEnabled = window.mindPlayAudio.toggleSound();
          this.updateAudioIcon(isEnabled);
        });
      }

      // Fact of the day shuffle
      const shuffleFactBtn = document.getElementById('btn-shuffle-fact');
      if (shuffleFactBtn) {
        shuffleFactBtn.addEventListener('click', () => {
          this.renderDailyFact();
          if (window.mindPlayAudio) window.mindPlayAudio.playPop();
        });
      }

      // Reset data modal
      const resetBtn = document.getElementById('btn-clear-all-data');
      const modal = document.getElementById('reset-modal');
      const confirmBtn = document.getElementById('btn-confirm-reset');
      const cancelBtn = document.getElementById('btn-cancel-reset');

      if (resetBtn && modal) {
        resetBtn.addEventListener('click', () => modal.classList.add('visible'));
      }
      if (cancelBtn && modal) {
        cancelBtn.addEventListener('click', () => modal.classList.remove('visible'));
      }
      if (confirmBtn && modal) {
        confirmBtn.addEventListener('click', () => {
          window.mindPlayStorage.clearAllData();
          modal.classList.remove('visible');
          this.updateProgressUI();
          this.renderArcadeCards();
          if (window.mindPlayAudio) window.mindPlayAudio.playPop();
        });
      }

      // Global difficulty buttons in arcade
      document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentDifficulty = btn.getAttribute('data-diff');
          if (window.mindPlayAudio) window.mindPlayAudio.playTap();
        });
      });
    }

    initTools() {
      if (window.MindPlayTools) {
        this.tools = new window.MindPlayTools();
      }
    }

    updateAudioIcon(enabled) {
      if (!this.audioIcon) return;
      this.audioIcon.textContent = enabled ? '🔔' : '🔕';
      this.audioToggleBtn.setAttribute('title', enabled ? 'Mute audio' : 'Enable audio');
    }

    initRouting() {
      const handleHash = () => {
        const hash = window.location.hash || '#home';
        this.navigateTo(hash);
      };

      window.addEventListener('hashchange', handleHash);
      handleHash();
    }

    navigateTo(hash) {
      // Clean up running game if navigating away
      if (this.activeGame && !hash.startsWith('#game-')) {
        this.activeGame.destroy();
        this.activeGame = null;
      }

      // Update view visibility
      this.views.forEach(v => v.classList.remove('active-view'));

      // Update nav link active states
      this.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === hash || (hash.startsWith('#game-') && href === '#games')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Show target view
      if (hash.startsWith('#game-')) {
        const gameId = hash.replace('#game-', '');
        this.mountGame(gameId);
      } else if (hash === '#games') {
        const el = document.getElementById('view-games');
        if (el) el.classList.add('active-view');
        this.renderArcadeCards();
      } else if (hash === '#psychology') {
        const el = document.getElementById('view-psychology');
        if (el) el.classList.add('active-view');
      } else if (hash === '#tools') {
        const el = document.getElementById('view-tools');
        if (el) el.classList.add('active-view');
        if (this.tools) this.tools.updateDailyGoalsUI();
      } else if (hash === '#coding') {
        const el = document.getElementById('view-coding');
        if (el) el.classList.add('active-view');
      } else if (hash === '#progress') {
        const el = document.getElementById('view-progress');
        if (el) el.classList.add('active-view');
        this.updateProgressUI();
      } else {
        // #home
        const el = document.getElementById('view-home');
        if (el) el.classList.add('active-view');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    mountGame(gameId) {
      const gameMeta = GAMES_REGISTRY.find(g => g.id === gameId);
      if (!gameMeta) {
        window.location.hash = '#games';
        return;
      }

      const stageView = document.getElementById('view-game-stage');
      if (stageView) stageView.classList.add('active-view');

      const container = document.getElementById('game-mount');
      if (!container) return;
      container.innerHTML = '';

      if (this.activeGame) {
        this.activeGame.destroy();
        this.activeGame = null;
      }

      const GameClass = window[gameMeta.classRef];
      if (typeof GameClass === 'function') {
        this.activeGame = new GameClass('game-mount', {
          difficulty: this.currentDifficulty,
          onComplete: () => {
            this.updateProgressUI();
          },
          onExit: () => {
            window.location.hash = '#games';
          }
        });
      }
    }

    renderDailyFact() {
      const factBox = document.getElementById('fact-text');
      const catBox = document.getElementById('fact-category');
      if (!factBox) return;

      const randomFact = PSYCH_FACTS[Math.floor(Math.random() * PSYCH_FACTS.length)];
      factBox.textContent = randomFact.fact;
      if (catBox) catBox.textContent = randomFact.category;
    }

    renderArcadeCards() {
      const container = document.getElementById('arcade-cards-grid');
      if (!container) return;

      container.innerHTML = GAMES_REGISTRY.map(game => {
        const rec = window.mindPlayStorage ? window.mindPlayStorage.getGameRecord(game.id) : null;
        const best = rec && rec.bestScore > 0 ? `${rec.bestScore} pts` : 'Not played yet';

        return `
          <div class="arcade-card animate-fadeIn">
            <div class="arcade-card-top">
              <span class="badge ${game.badgeClass}">${game.category}</span>
              <span class="arcade-time">⏱️ ${game.playtime}</span>
            </div>
            <div class="arcade-icon-title">
              <span class="arcade-icon">${game.icon}</span>
              <h3 class="arcade-name">${game.name}</h3>
            </div>
            <p class="arcade-desc">${game.desc}</p>
            <div class="arcade-best">
              <span>Personal Best: <strong>${best}</strong></span>
            </div>
            <a href="#game-${game.id}" class="btn btn-mint btn-arcade-play">Play Mini-Game ➔</a>
          </div>
        `;
      }).join('');
    }

    updateProgressUI() {
      if (!window.mindPlayStorage) return;

      // Header streak & plays
      const totalPlays = window.mindPlayStorage.getTotalPlays();
      const streak = window.mindPlayStorage.getStreak();

      const headerPlaysEl = document.getElementById('header-plays-count');
      const headerStreakEl = document.getElementById('header-streak-count');
      if (headerPlaysEl) headerPlaysEl.textContent = totalPlays;
      if (headerStreakEl) headerStreakEl.textContent = `${streak} 🔥`;

      // Progress View elements
      const totalScoreEl = document.getElementById('prog-total-score');
      const totalPlaysEl = document.getElementById('prog-total-plays');
      if (totalPlaysEl) totalPlaysEl.textContent = totalPlays;

      // Badges
      const badges = window.mindPlayStorage.getBadges();
      const badgeKeys = Object.keys(badges);
      badgeKeys.forEach(k => {
        const badgeEl = document.getElementById(`badge-${k}`);
        if (badgeEl) {
          if (badges[k]) {
            badgeEl.classList.remove('locked');
            badgeEl.classList.add('unlocked');
          } else {
            badgeEl.classList.add('locked');
            badgeEl.classList.remove('unlocked');
          }
        }
      });

      // Render History Table
      this.renderHistoryTable();
    }

    renderHistoryTable() {
      const tbody = document.getElementById('history-table-body');
      if (!tbody) return;

      const allGames = window.mindPlayStorage.getAllGames();
      const rows = [];

      Object.keys(allGames).forEach(gameId => {
        const meta = GAMES_REGISTRY.find(g => g.id === gameId);
        const rec = allGames[gameId];
        rec.history.forEach(sess => {
          rows.push({
            gameName: meta ? meta.name : gameId,
            date: new Date(sess.date),
            score: sess.score,
            accuracy: sess.accuracy,
            difficulty: sess.difficulty
          });
        });
      });

      rows.sort((a, b) => b.date - a.date);

      if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate">No game records yet. Play your first mini-game above!</td></tr>`;
        return;
      }

      tbody.innerHTML = rows.slice(0, 10).map(r => `
        <tr>
          <td><strong>${r.gameName}</strong></td>
          <td><span class="badge badge-mint">${r.difficulty.toUpperCase()}</span></td>
          <td class="font-bold text-mint">${r.score} pts</td>
          <td>${r.accuracy}%</td>
          <td class="text-slate">${r.date.toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  }

  window.app = new MindPlayApp();
});
