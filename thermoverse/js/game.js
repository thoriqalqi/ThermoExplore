// ====================================================
//  ANTI-GRAVITY AGENT — Game State Manager
//  Centralized localStorage state management
// ====================================================

const ThermoGame = (() => {
  const KEY = 'anti_gravity_agent_v1';

  const DEFAULT_STATE = {
    playerName: 'Agent',
    xp: 0,
    badges: {},
    zones: {
      zone1: { completed: false, score: 0, scores: {}, challengesDone: [] },
      zone2: { completed: false, score: 0, scores: {}, challengesDone: [] },
      zone3: { completed: false, score: 0, scores: {}, challengesDone: [] },
    }
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      // Ensure structure
      if (!parsed.zones) parsed.zones = DEFAULT_STATE.zones;
      ['zone1','zone2','zone3'].forEach(k => {
        if (!parsed.zones[k]) parsed.zones[k] = { completed: false, score: 0, scores: {}, challengesDone: [] };
        if (!parsed.zones[k].scores) parsed.zones[k].scores = {};
        if (!parsed.zones[k].challengesDone) parsed.zones[k].challengesDone = [];
      });
      return parsed;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { console.warn('Cannot save state:', e); }
  }

  function isZoneUnlocked(state, zoneKey) {
    if (zoneKey === 'zone1') return true;
    if (zoneKey === 'zone2') return state.zones.zone1.completed || (state.zones.zone1.score >= 60);
    if (zoneKey === 'zone3') return state.zones.zone2.completed || (state.zones.zone2.score >= 60);
    return false;
  }

  function addXP(state, amount) {
    state.xp = (state.xp || 0) + amount;
    return state;
  }

  function saveZoneChallenge(state, zoneKey, challengeKey, scores) {
    if (!state.zones[zoneKey]) state.zones[zoneKey] = DEFAULT_STATE.zones[zoneKey];
    state.zones[zoneKey].scores[challengeKey] = scores;
    if (!state.zones[zoneKey].challengesDone.includes(challengeKey)) {
      state.zones[zoneKey].challengesDone.push(challengeKey);
    }
    // Calculate zone score from all challenges
    const allScores = Object.values(state.zones[zoneKey].scores);
    if (allScores.length > 0) {
      const avg = allScores.reduce((a, b) => {
        const bVal = typeof b === 'object' ? Object.values(b).reduce((x, y) => x + y, 0) / Object.values(b).length : b;
        return a + bVal;
      }, 0) / allScores.length;
      state.zones[zoneKey].score = Math.round(avg);
    }
    if (state.zones[zoneKey].challengesDone.length >= 4) {
      state.zones[zoneKey].completed = true;
    }
    return state;
  }

  function resetState() {
    localStorage.removeItem(KEY);
  }

  return { loadState, saveState, isZoneUnlocked, addXP, saveZoneChallenge, resetState };
})();
