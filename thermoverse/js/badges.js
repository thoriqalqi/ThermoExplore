/* =============================================
   badges.js — Sistem Lencana (Bahasa Indonesia)
   ============================================= */

const BADGE_DEFS = [
    {
        id: 'critical_master',
        icon: '🧠',
        name: 'Master Berpikir Kritis',
        desc: 'Raih skor ≥ 80 pada dimensi berpikir kritis',
        check: (state) => (state.thinking?.critical || 0) >= 80
    },
    {
        id: 'system_analyst',
        icon: '🔗',
        name: 'Analis Sistem',
        desc: 'Raih skor ≥ 80 pada dimensi berpikir sistemik',
        check: (state) => (state.thinking?.systemic || 0) >= 80
    },
    {
        id: 'scientific_thinker',
        icon: '🔬',
        name: 'Pemikir Ilmiah',
        desc: 'Raih skor ≥ 80 pada dimensi berpikir ilmiah',
        check: (state) => (state.thinking?.scientific || 0) >= 80
    },
    {
        id: 'innovation_architect',
        icon: '💡',
        name: 'Arsitek Inovasi',
        desc: 'Capai efisiensi ≥ 70% di Laboratorium Inovasi',
        check: (state) => (state.innovationScore || 0) >= 70
    },
    {
        id: 'thermo_conqueror',
        icon: '🏆',
        name: 'Penakluk Thermo',
        desc: 'Selesaikan semua tiga zona petualangan',
        check: (state) =>
            state.zones?.zone1?.completed &&
            state.zones?.zone2?.completed &&
            state.zones?.zone3?.completed
    }
];

const BadgeSystem = {
    checkAndAwardBadges(state) {
        if (!state.badges) state.badges = [];
        BADGE_DEFS.forEach(badge => {
            if (!state.badges.includes(badge.id) && badge.check(state)) {
                state.badges.push(badge.id);
                BadgeSystem.showBadgePopup(badge);
            }
        });
        ThermoGame.saveState(state);
        return state;
    },

    showBadgePopup(badge) {
        const popup = document.getElementById('badge-popup');
        const iconEl = popup?.querySelector('.badge-popup-icon');
        const nameEl = popup?.querySelector('.badge-popup-name');
        if (!popup) return;
        if (iconEl) iconEl.textContent = badge.icon;
        if (nameEl) nameEl.textContent = badge.name;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 4000);
    },

    renderBadges(containerId, state) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const earned = state.badges || [];
        container.innerHTML = BADGE_DEFS.map(b => {
            const isEarned = earned.includes(b.id);
            return `
        <div class="badge-card ${isEarned ? 'unlocked' : ''}">
          <div class="badge-icon">${isEarned ? b.icon : '🔒'}</div>
          <div class="badge-name">${b.name}</div>
          <div class="badge-status ${isEarned ? 'earned' : ''}">${isEarned ? '✅ Diraih' : 'Belum terbuka'}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px">${b.desc}</div>
        </div>`;
        }).join('');
    }
};

window.BadgeSystem = BadgeSystem;
