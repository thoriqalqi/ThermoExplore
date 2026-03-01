/* =============================================
   innovation.js — Bahasa Indonesia
   ============================================= */

(function () {
    const MAX_SELECTIONS = 3;
    const OPTIMAL_THRESHOLD = 70;

    const UPGRADES = [
        { id: 'insulation', icon: '🧱', name: 'Insulasi Termal Canggih', desc: 'Kurangi kehilangan panas melalui penghalang termal yang ditingkatkan.', efficiency: 25, thinkingBonus: 'systemic' },
        { id: 'heatex', icon: '🔄', name: 'Upgrade Penukar Panas', desc: 'Pulihkan panas buang untuk input energi tambahan.', efficiency: 30, thinkingBonus: 'scientific' },
        { id: 'smartctrl', icon: '🤖', name: 'Sistem Kontrol Cerdas', desc: 'Optimasi berbasis AI untuk siklus termodinamika.', efficiency: 20, thinkingBonus: 'innovative' },
        { id: 'turbine', icon: '⚙️', name: 'Turbin Efisiensi Tinggi', desc: 'Maksimalkan ekstraksi kerja mekanis dari siklus uap.', efficiency: 35, thinkingBonus: 'critical' },
        { id: 'renewable', icon: '☀️', name: 'Sumber Energi Terbarukan', desc: 'Suplemen dengan input solar termal untuk mengurangi ketergantungan bahan bakar.', efficiency: 20, thinkingBonus: 'innovative' }
    ];

    let selected = [];
    let state;

    function init() {
        state = ThermoGame.loadState();
        renderUpgrades();
        updateSlotsUI();
    }

    function renderUpgrades() {
        const container = document.getElementById('upgrades-grid');
        if (!container) return;
        container.innerHTML = UPGRADES.map(u => `
      <div class="upgrade-card" id="upg-${u.id}" onclick="Innovation.toggle('${u.id}')">
        <div class="upgrade-icon">${u.icon}</div>
        <div class="upgrade-name">${u.name}</div>
        <div class="upgrade-desc">${u.desc}</div>
      </div>`).join('');
        if (window.gsap) gsap.from('.upgrade-card', { opacity: 0, y: 20, stagger: 0.08, duration: 0.4, ease: 'power2.out', delay: 0.4 });
    }

    function toggle(id) {
        const card = document.getElementById('upg-' + id);
        const result = document.getElementById('efficiency-result');
        if (result) result.classList.remove('show');

        if (selected.includes(id)) {
            selected = selected.filter(s => s !== id);
            if (card) card.classList.remove('selected');
        } else {
            if (selected.length >= MAX_SELECTIONS) {
                if (window.gsap && card) gsap.to(card, { x: -8, duration: 0.05, yoyo: true, repeat: 6, ease: 'power1.inOut' });
                return;
            }
            selected.push(id);
            if (card) {
                card.classList.add('selected');
                if (window.gsap) gsap.from(card, { scale: 0.96, duration: 0.25, ease: 'back.out(2)' });
            }
        }

        updateSlotsUI();
        if (window.updateTurbineSpeed) updateTurbineSpeed(selected.length);
    }

    function updateSlotsUI() {
        const el = document.getElementById('slots-remaining');
        if (el) el.textContent = `${MAX_SELECTIONS - selected.length} slot tersisa`;
    }

    function calculateResult() {
        if (selected.length === 0) { alert('Pilih minimal satu upgrade!'); return; }

        const selectedUpgrades = UPGRADES.filter(u => selected.includes(u.id));
        const totalEfficiency = selectedUpgrades.reduce((s, u) => s + u.efficiency, 0);
        const efficiencyPct = Math.min(100, Math.round((totalEfficiency / 90) * 100));
        const passed = efficiencyPct >= OPTIMAL_THRESHOLD;

        const thinkingBoosts = {};
        selectedUpgrades.forEach(u => { thinkingBoosts[u.thinkingBonus] = (thinkingBoosts[u.thinkingBonus] || 0) + 30; });
        Object.keys(thinkingBoosts).forEach(k => thinkingBoosts[k] = Math.min(100, (state.thinking[k] || 0) + thinkingBoosts[k]));

        const xpBonus = passed ? 80 : 30;
        const explanation = buildExplanation(selectedUpgrades, efficiencyPct, passed);

        state.innovationScore = efficiencyPct;
        Object.keys(thinkingBoosts).forEach(k => state.thinking[k] = thinkingBoosts[k]);
        state = ThermoGame.markZoneComplete(state, 'zone2', efficiencyPct, xpBonus, thinkingBoosts);
        state = BadgeSystem.checkAndAwardBadges(state);
        ThermoGame.updateNavXP();

        const resultEl = document.getElementById('efficiency-result');
        if (resultEl) {
            resultEl.classList.add('show');
            if (window.gsap) gsap.from(resultEl, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
        }

        const fillEl = document.getElementById('efficiency-bar-fill');
        if (fillEl) {
            if (window.gsap) gsap.to(fillEl, { width: efficiencyPct + '%', duration: 1.5, ease: 'power2.inOut' });
            else setTimeout(() => { fillEl.style.width = efficiencyPct + '%'; }, 100);
        }

        const valEl = document.getElementById('efficiency-value');
        if (valEl) {
            valEl.style.color = passed ? 'var(--success)' : 'var(--warning)';
            if (window.gsap) {
                gsap.to({ val: 0 }, {
                    val: efficiencyPct, duration: 1.5, ease: 'power2.inOut',
                    onUpdate: function () { valEl.textContent = Math.round(this.targets()[0].val) + '% Efisiensi'; }
                });
            } else { valEl.textContent = efficiencyPct + '% Efisiensi'; }
        }

        setEl('efficiency-explanation', 'innerHTML', explanation);
        setEl('efficiency-xp-bonus', 'textContent', passed ? `🎉 Ambang optimal tercapai! +${xpBonus} XP` : `+${xpBonus} XP Diperoleh`);

        if (window.updateTurbineSpeed) {
            updateTurbineSpeed(3);
            setTimeout(() => updateTurbineSpeed(selected.length), 2000);
        }

        const nextBtn = document.getElementById('innovation-next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'inline-flex';
            if (window.gsap) gsap.from(nextBtn, { opacity: 0, scale: 0.9, duration: 0.4, ease: 'back.out(2)', delay: 1.5 });
        }
    }

    function buildExplanation(ups, pct, passed) {
        const names = ups.map(u => `<strong>${u.icon} ${u.name}</strong>`).join(', ');
        if (passed) {
            return `Kombinasimu dari ${names} mencapai peningkatan efisiensi relatif <strong>${pct}%</strong>. 
              Rekayasa yang luar biasa! Sinergi antara upgrademu memaksimalkan output termodinamika 
              sambil meminimalkan pemborosan energi, sesuai dengan Hukum Kedua Termodinamika.`;
        }
        return `Kombinasimu dari ${names} mencapai efisiensi ${pct}%. 
            Untuk mencapai ambang optimal (≥${OPTIMAL_THRESHOLD}%), pertimbangkan memadukan 
            <strong>Penukar Panas</strong> dengan <strong>Turbin Efisiensi Tinggi</strong> — 
            kombinasi itu saja sudah menghasilkan sinergi 65 poin.`;
    }

    function setEl(id, prop, val) {
        const el = document.getElementById(id);
        if (!el) return;
        el[prop] = val;
    }

    document.addEventListener('DOMContentLoaded', init);
    window.Innovation = { toggle, calculateResult };
})();
