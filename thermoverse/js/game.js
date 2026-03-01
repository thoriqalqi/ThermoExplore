/* =============================================
   game.js — Core game state, XP, LocalStorage
   ============================================= */

const GAME_KEY = 'thermoverse_data';

const DEFAULT_STATE = {
  xp: 0,
  zones: {
    zone1: { completed: false, score: 0, xp: 0 },
    zone2: { completed: false, score: 0, xp: 0 },
    zone3: { completed: false, score: 0, xp: 0 }
  },
  badges: [],
  thinking: {
    critical: 0,
    systemic: 0,
    scientific: 0,
    innovative: 0
  },
  innovationScore: 0
};

/* ---- State Helpers ---- */
function loadState() {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState(state) {
  localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

function resetState() {
  localStorage.removeItem(GAME_KEY);
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function addXP(amount, state) {
  state.xp = (state.xp || 0) + amount;
  saveState(state);
  return state;
}

function getCompletionPct(state) {
  const zones = Object.values(state.zones);
  const done = zones.filter(z => z.completed).length;
  return Math.round((done / zones.length) * 100);
}

function getZoneProgress(state, zoneKey) {
  return state.zones[zoneKey]?.score || 0;
}

function isZoneUnlocked(state, zoneKey) {
  if (zoneKey === 'zone1') return true;
  if (zoneKey === 'zone2') return state.zones.zone1.completed;
  if (zoneKey === 'zone3') return state.zones.zone2.completed;
  return false;
}

function markZoneComplete(state, zoneKey, score, xpEarned, thinkingScores) {
  state.zones[zoneKey].completed = true;
  state.zones[zoneKey].score = score;
  state.zones[zoneKey].xp = xpEarned;
  state.xp = (state.xp || 0) + xpEarned;

  // Merge thinking scores
  if (thinkingScores) {
    for (const key in thinkingScores) {
      state.thinking[key] = Math.max(state.thinking[key] || 0, thinkingScores[key]);
    }
  }
  saveState(state);
  return state;
}

function getFinalCategory(completionPct) {
  if (completionPct >= 90) return { label: 'Penjelajah Lanjutan', color: 'var(--white)', emoji: '🚀' };
  if (completionPct >= 75) return { label: 'Pemikir Analitis', color: 'var(--orange)', emoji: '🔬' };
  if (completionPct >= 60) return { label: 'Pemikir Berkembang', color: 'var(--warning)', emoji: '📈' };
  return { label: 'Pemula', color: 'var(--text-muted)', emoji: '🌱' };
}

/* ---- XP Float Animation ---- */
function showXPFloat(amount, x, y) {
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = `+${amount} XP`;
  el.style.left = (x || window.innerWidth / 2) + 'px';
  el.style.top = (y || 80) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

/* ---- Nav XP Update ---- */
function updateNavXP() {
  const state = loadState();
  const el = document.getElementById('nav-xp-value');
  if (el) el.textContent = state.xp + ' XP';
}

/* ---- Page Transition ---- */
function navigateTo(url) {
  const overlay = document.getElementById('page-transition');
  if (overlay && window.gsap) {
    gsap.to(overlay, { opacity: 1, duration: 0.35, ease: 'power2.in', onComplete: () => { window.location.href = url; } });
  } else if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => { window.location.href = url; }, 400);
  } else {
    window.location.href = url;
  }
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  // Loading screen
  const ls = document.getElementById('loading-screen');
  if (ls) {
    setTimeout(() => ls.classList.add('hidden'), 800);
  }
  updateNavXP();
});

// Expose globally
window.ThermoGame = {
  loadState, saveState, resetState, addXP,
  getCompletionPct, getZoneProgress, isZoneUnlocked,
  markZoneComplete, getFinalCategory, showXPFloat, updateNavXP, navigateTo
};
