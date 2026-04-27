// ====================================================
//  THERMOEXPLORER — Game State Manager
//  Centralized localStorage state management
// ====================================================

const ThermoGame = (() => {
  const KEY = 'thermoexplorer_state_v2';

  const DEFAULT_STATE = {
    playerName: '',
    xp: 0,
    badges: {},
    zones: {
      zone1: { completed: false, score: 0, scores: {}, challengesDone: [], answers: {} },
      zone2: { completed: false, score: 0, scores: {}, challengesDone: [], answers: {} },
      zone3: { completed: false, score: 0, scores: {}, challengesDone: [], answers: {} },
    }
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      
      // Ensure structure
      if (!parsed.zones) parsed.zones = JSON.parse(JSON.stringify(DEFAULT_STATE.zones));
      ['zone1','zone2','zone3'].forEach(k => {
        if (!parsed.zones[k]) parsed.zones[k] = JSON.parse(JSON.stringify(DEFAULT_STATE.zones[k]));
        if (!parsed.zones[k].scores) parsed.zones[k].scores = {};
        if (!parsed.zones[k].challengesDone) parsed.zones[k].challengesDone = [];
        if (!parsed.zones[k].answers) parsed.zones[k].answers = {};
      });
      
      return parsed;
    } catch (e) {
      console.error('Error loading state:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) { 
      console.warn('Cannot save state:', e);
      return false;
    }
  }

  function setPlayerName(name) {
    const state = loadState();
    state.playerName = name.trim();
    saveState(state);
    return state;
  }

  function getPlayerName() {
    const state = loadState();
    return state.playerName || '';
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

  function saveZoneChallenge(state, zoneKey, challengeKey, scores, answers = {}) {
    if (!state.zones[zoneKey]) state.zones[zoneKey] = JSON.parse(JSON.stringify(DEFAULT_STATE.zones[zoneKey]));
    state.zones[zoneKey].scores[challengeKey] = scores;
    state.zones[zoneKey].answers[challengeKey] = answers;
    
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
    
    if (state.zones[zoneKey].challengesDone.length >= 5) { // Quiz + 4 challenges
      state.zones[zoneKey].completed = true;
    }
    
    return state;
  }

  function getZoneProgress(zoneKey) {
    const state = loadState();
    return state.zones[zoneKey] || {};
  }

  function resetState() {
    localStorage.removeItem(KEY);
  }

  return { 
    loadState, 
    saveState, 
    setPlayerName,
    getPlayerName,
    isZoneUnlocked, 
    addXP, 
    saveZoneChallenge, 
    getZoneProgress,
    resetState 
  };
})();
