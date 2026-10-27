/**
 * MindPlay: Train Your Focus!
 * Storage Manager - Handles local storage persistence for game scores,
 * focus goals, pomodoro sessions, unlocked badges, and distraction audits.
 */

const STORAGE_KEY = 'mindplay_focus_data_v1';

class MindPlayStorage {
  constructor() {
    this.data = this.loadData();
  }

  getDefaultData() {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      soundEnabled: true,
      streak: 1,
      lastStreakDate: new Date().toDateString(),
      dailyGoals: {
        targetPomodoros: 3,
        completedPomodoros: 0,
        targetGames: 2,
        completedGames: 0,
        stopPracticed: false,
        lastDate: new Date().toDateString()
      },
      games: {
        'focus-finder': { plays: 0, bestScore: 0, history: [] },
        'stay-focused': { plays: 0, bestScore: 0, avgReactionTimeMs: 0, history: [] },
        'switch-it-up': { plays: 0, bestScore: 0, avgSwitchCostMs: 0, history: [] },
        'stop-or-go': { plays: 0, bestScore: 0, bestInhibitionRate: 0, history: [] },
        'memory-challenge': { plays: 0, bestScore: 0, maxSequenceLength: 0, history: [] }
      },
      badges: {
        firstPlay: false,          // Played first focus game
        eagleEye: false,           // Scored 80+ in Focus Finder
        laserFocus: false,         // Scored 85+ in Stay Focused
        switchWizard: false,       // Scored 80+ in Switch It Up
        brakeMaster: false,        // Achieved 90%+ inhibition in Stop or Go
        memoryChampion: false,     // Recalled 6+ items in Memory Challenge
        zenBreathe: false,         // Completed STOP breathing practice
        pomodoroStar: false,       // Completed 2+ Pomodoro sessions
        mindfulAllRounder: false   // Played all 5 games at least once
      },
      distractionAudit: {
        lastCompleted: null,
        score: null,
        itemsChecked: []
      }
    };
  }

  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefaultData();
      const parsed = JSON.parse(raw);
      const defaults = this.getDefaultData();

      // Check daily reset
      const today = new Date().toDateString();
      if (parsed.dailyGoals && parsed.dailyGoals.lastDate !== today) {
        // Reset daily goals
        parsed.dailyGoals.completedPomodoros = 0;
        parsed.dailyGoals.completedGames = 0;
        parsed.dailyGoals.stopPracticed = false;
        parsed.dailyGoals.lastDate = today;

        // Check streak
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (parsed.lastStreakDate === yesterday) {
          parsed.streak = (parsed.streak || 0) + 1;
        } else if (parsed.lastStreakDate !== today) {
          parsed.streak = 1;
        }
        parsed.lastStreakDate = today;
      }

      return {
        ...defaults,
        ...parsed,
        dailyGoals: { ...defaults.dailyGoals, ...(parsed.dailyGoals || {}) },
        games: { ...defaults.games, ...(parsed.games || {}) },
        badges: { ...defaults.badges, ...(parsed.badges || {}) }
      };
    } catch (e) {
      console.warn('Failed to parse localStorage, resetting to defaults', e);
      return this.getDefaultData();
    }
  }

  save() {
    try {
      this.data.lastActive = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }

  recordGameSession(gameId, session) {
    if (!this.data.games[gameId]) {
      this.data.games[gameId] = { plays: 0, bestScore: 0, history: [] };
    }

    const rec = this.data.games[gameId];
    rec.plays += 1;
    const score = Math.round(session.score || 0);
    if (score > rec.bestScore) {
      rec.bestScore = score;
    }

    const entry = {
      date: new Date().toISOString(),
      score,
      accuracy: session.accuracy || 100,
      difficulty: session.difficulty || 'medium',
      metrics: session.metrics || {}
    };

    rec.history.push(entry);
    if (rec.history.length > 25) rec.history.shift();

    // Game-specific aggregations
    if (gameId === 'stay-focused' && session.metrics?.avgReactionTimeMs) {
      rec.avgReactionTimeMs = Math.round(session.metrics.avgReactionTimeMs);
    }
    if (gameId === 'switch-it-up' && session.metrics?.switchCostMs) {
      rec.avgSwitchCostMs = Math.round(session.metrics.switchCostMs);
    }
    if (gameId === 'stop-or-go' && session.metrics?.inhibitionRate) {
      if (session.metrics.inhibitionRate > rec.bestInhibitionRate) {
        rec.bestInhibitionRate = session.metrics.inhibitionRate;
      }
    }
    if (gameId === 'memory-challenge' && session.metrics?.maxSequenceLength) {
      if (session.metrics.maxSequenceLength > rec.maxSequenceLength) {
        rec.maxSequenceLength = session.metrics.maxSequenceLength;
      }
    }

    // Daily goals update
    this.data.dailyGoals.completedGames += 1;

    // Check Badges
    this.checkBadges(gameId, session);

    this.save();
    return entry;
  }

  checkBadges(gameId, session) {
    const b = this.data.badges;
    b.firstPlay = true;

    if (gameId === 'focus-finder' && session.score >= 80) b.eagleEye = true;
    if (gameId === 'stay-focused' && session.score >= 85) b.laserFocus = true;
    if (gameId === 'switch-it-up' && session.score >= 80) b.switchWizard = true;
    if (gameId === 'stop-or-go' && session.metrics?.inhibitionRate >= 90) b.brakeMaster = true;
    if (gameId === 'memory-challenge' && (session.metrics?.maxSequenceLength >= 6 || session.score >= 85)) {
      b.memoryChampion = true;
    }

    const allPlayed = Object.values(this.data.games).every(g => g.plays > 0);
    if (allPlayed) b.mindfulAllRounder = true;
  }

  recordPomodoroSession() {
    this.data.dailyGoals.completedPomodoros += 1;
    if (this.data.dailyGoals.completedPomodoros >= 2) {
      this.data.badges.pomodoroStar = true;
    }
    this.save();
  }

  recordStopPractice() {
    this.data.dailyGoals.stopPracticed = true;
    this.data.badges.zenBreathe = true;
    this.save();
  }

  saveDistractionAudit(score, items) {
    this.data.distractionAudit = {
      lastCompleted: new Date().toISOString(),
      score,
      itemsChecked: items
    };
    this.save();
  }

  getDailyGoals() {
    return this.data.dailyGoals;
  }

  getStreak() {
    return this.data.streak || 1;
  }

  getGameRecord(gameId) {
    return this.data.games[gameId] || { plays: 0, bestScore: 0, history: [] };
  }

  getAllGames() {
    return this.data.games;
  }

  getBadges() {
    return this.data.badges;
  }

  getTotalPlays() {
    return Object.values(this.data.games).reduce((sum, g) => sum + g.plays, 0);
  }

  isSoundEnabled() {
    return this.data.soundEnabled !== false;
  }

  setSoundEnabled(enabled) {
    this.data.soundEnabled = enabled;
    this.save();
  }

  clearAllData() {
    this.data = this.getDefaultData();
    localStorage.removeItem(STORAGE_KEY);
  }
}

window.mindPlayStorage = new MindPlayStorage();
