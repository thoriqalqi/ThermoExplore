/* =============================================
   map.js — Zone unlock logic & rendering
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    const state = ThermoGame.loadState();
    renderMap(state);
});

function renderMap(state) {
    const zones = [
        {
            key: 'zone1',
            num: '01',
            name: 'Core Thermodynamics',
            desc: 'Master the laws of energy, heat transfer, and thermal equilibrium.',
            icon: '🔥',
            href: 'level1.html',
            colorClass: 'unlocked-blue'
        },
        {
            key: 'zone2',
            num: '02',
            name: 'Innovation Lab',
            desc: 'Design and optimize a thermodynamic system through strategic decisions.',
            icon: '⚡',
            href: 'level2.html',
            colorClass: 'unlocked-orange'
        },
        {
            key: 'zone3',
            num: '03',
            name: 'Advanced Systems',
            desc: 'Apply complex thermodynamic principles to real-world engineering.',
            icon: '🌌',
            href: 'level3.html',
            colorClass: 'unlocked-cyan'
        }
    ];

    const container = document.getElementById('zones-container');
    if (!container) return;

    container.innerHTML = '';

    zones.forEach((zone, idx) => {
        const zData = state.zones[zone.key];
        const unlocked = ThermoGame.isZoneUnlocked(state, zone.key);
        const score = zData?.score || 0;
        const complete = zData?.completed || false;

        const card = document.createElement('div');
        card.className = `zone-card ${unlocked ? '' : 'locked'}`;
        card.dataset.zone = zone.key;

        card.innerHTML = `
      <div class="zone-circle ${unlocked ? zone.colorClass : 'locked-state'}">
        ${unlocked
                ? `<div class="zone-number">${zone.num}</div><div class="zone-icon">${zone.icon}</div>`
                : `<div class="zone-lock">🔒</div>`
            }
        ${complete ? '<div style="position:absolute;bottom:12px;font-size:0.7rem;color:var(--success);font-family:var(--font-heading)">✓ DONE</div>' : ''}
      </div>
      <div class="zone-info">
        <div class="zone-name">${zone.name}</div>
        <div class="zone-description">${zone.desc}</div>
        <div class="zone-progress-label">
          <span>${unlocked ? (complete ? 'Completed' : 'Start') : 'Locked'}</span>
          <span>${score}%</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar" style="width:${score}%"></div>
        </div>
        <div class="status-banner" style="margin-top:10px">
          ${unlocked ? (complete ? '⭐ ' + (zData?.xp || 0) + ' XP Earned' : 'Click to begin') : 'Complete previous zone to unlock'}
        </div>
      </div>
    `;

        if (unlocked) {
            card.addEventListener('click', () => ThermoGame.navigateTo(zone.href));
            card.style.cursor = 'pointer';
        }

        container.appendChild(card);

        // Add connector between zones (not after last)
        if (idx < zones.length - 1) {
            const conn = document.createElement('div');
            conn.className = 'zone-connector';
            conn.innerHTML = `<div class="connector-line"></div>`;
            container.appendChild(conn);
        }
    });

    // Badges
    BadgeSystem.renderBadges('badges-container', state);
}
