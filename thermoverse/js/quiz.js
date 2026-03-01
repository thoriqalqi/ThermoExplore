/* =============================================
   quiz.js — Bahasa Indonesia + Red/Orange theme
   ============================================= */

(function () {
    let state, config;
    let currentQ = 0, score = 0, totalXP = 0;
    let timerInterval, timeLeft, questionStartTime;
    const TOTAL_TIME = 15 * 60;

    let scene3, renderer3, camera3, moleculeObj;

    function init() {
        config = window.QUIZ_CONFIG;
        state = ThermoGame.loadState();
        timeLeft = TOTAL_TIME;
        // MUST render questions first — 3D is optional
        renderQuestion();
        startTimer();
        // Init 3D after quiz is rendered (errors won't block gameplay)
        try {
            if (window.THREE && window.TV3D) initMolecule3D();
        } catch (e) {
            console.warn('3D molecule init failed (non-critical):', e);
        }
    }

    /* ---- 3D Molecule ---- */
    function initMolecule3D() {
        const canvas = document.getElementById('molecule-canvas');
        if (!canvas) return;
        renderer3 = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer3.setSize(220, 220);
        renderer3.setClearColor(0x000000, 0);
        scene3 = new THREE.Scene();
        camera3 = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
        camera3.position.z = 4;
        TV3D.addLights(scene3);
        moleculeObj = TV3D.createMolecule(scene3, [0, 0, 0]);
        // Recolor center to red
        moleculeObj.center.material.color.setHex(0xff3c00);
        moleculeObj.center.material.emissive.setHex(0xff3c00);
        // Note: molecule has no .light property; add our own point light
        const molLight = new THREE.PointLight(0xff3c00, 1.5, 6);
        scene3.add(molLight);
        const ptLight = new THREE.PointLight(0xff3c00, 1.5, 6);
        ptLight.position.set(0, 0, 3);
        scene3.add(ptLight);
        let t = 0;
        function loopMol() {
            requestAnimationFrame(loopMol);
            t += 0.012;
            moleculeObj.group.rotation.y += 0.008;
            moleculeObj.group.rotation.x += 0.003;
            const r = 1.2, angle = t * 1.8;
            moleculeObj.electron.position.x = Math.cos(angle) * r;
            moleculeObj.electron.position.y = Math.sin(angle) * r * Math.cos(Math.PI / 4);
            moleculeObj.electron.position.z = Math.sin(angle) * r * Math.sin(Math.PI / 4);
            moleculeObj.elOrbit.rotation.z += 0.003;
            renderer3.render(scene3, camera3);
        }
        loopMol();
    }

    function pulseCorrect() {
        if (!moleculeObj || !window.gsap) return;
        moleculeObj.center.material.color.setHex(0x22c55e);
        moleculeObj.center.material.emissive.setHex(0x22c55e);
        gsap.to(moleculeObj.group.scale, {
            x: 1.25, y: 1.25, z: 1.25, duration: 0.2, yoyo: true, repeat: 3, ease: 'power2.inOut', onComplete: () => {
                moleculeObj.center.material.color.setHex(0xff3c00);
                moleculeObj.center.material.emissive.setHex(0xff3c00);
            }
        });
        gsap.to(moleculeObj.group.rotation, { y: moleculeObj.group.rotation.y + Math.PI * 2, duration: 1, ease: 'power2.inOut' });
        const reEl = document.getElementById('mol-reaction');
        if (reEl) { reEl.textContent = '✔ Benar!'; reEl.style.color = '#22c55e'; }
    }

    function pulseWrong() {
        if (!moleculeObj || !window.gsap) return;
        moleculeObj.center.material.color.setHex(0xff3355);
        moleculeObj.center.material.emissive.setHex(0xff3355);
        gsap.to(moleculeObj.group.position, {
            x: -0.18, duration: 0.05, yoyo: true, repeat: 7, ease: 'power1.inOut', onComplete: () => {
                moleculeObj.group.position.x = 0;
                moleculeObj.center.material.color.setHex(0xff3c00);
                moleculeObj.center.material.emissive.setHex(0xff3c00);
            }
        });
        const reEl = document.getElementById('mol-reaction');
        if (reEl) { reEl.textContent = '✘ Salah!'; reEl.style.color = '#ef4444'; }
    }

    /* ---- Timer ---- */
    function startTimer() {
        const disp = document.getElementById('timer-display');
        timerInterval = setInterval(() => {
            timeLeft--;
            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            if (disp) {
                disp.textContent = `⏱ ${m}:${s}`;
                disp.className = 'timer-display';
                if (timeLeft <= 60) disp.classList.add('danger');
                else if (timeLeft <= 180) disp.classList.add('warning');
            }
            if (timeLeft <= 0) { clearInterval(timerInterval); endQuiz(); }
        }, 1000);
    }

    /* ---- Render Question ---- */
    function renderQuestion() {
        const q = config.questions[currentQ];
        const total = config.questions.length;
        const pct = Math.round((currentQ / total) * 100);

        setEl('progress-bar-q', 'style', `width:${pct}%`);
        setEl('question-current', 'textContent', currentQ + 1);
        setEl('question-total', 'textContent', total);
        setEl('question-category', 'textContent', q.category || 'Termodinamika');
        setEl('question-text', 'textContent', q.text);

        const optContainer = document.getElementById('options-container');
        if (optContainer) {
            const letters = ['A', 'B', 'C', 'D'];
            optContainer.innerHTML = q.options.map((opt, i) => `
        <button class="option-btn" data-index="${i}" onclick="Quiz.answer(${i})">
          <span class="option-letter">${letters[i]}</span>
          <span>${opt}</span>
        </button>`).join('');
        }

        const fb = document.getElementById('feedback-pill');
        if (fb) { fb.className = 'feedback-pill'; fb.textContent = ''; }
        const nb = document.getElementById('next-btn');
        if (nb) nb.style.display = 'none';
        const reEl = document.getElementById('mol-reaction');
        if (reEl) { reEl.textContent = 'Jawab untuk berinteraksi'; reEl.style.color = ''; }

        questionStartTime = Date.now();

        if (window.gsap) {
            const card = document.querySelector('.question-card');
            if (card) gsap.fromTo(card, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
            const opts = document.querySelectorAll('.option-btn');
            gsap.from(opts, { opacity: 0, y: 12, stagger: 0.07, duration: 0.3, ease: 'power2.out', delay: 0.15 });
        }
    }

    /* ---- Answer ---- */
    function answer(selectedIndex) {
        const q = config.questions[currentQ];
        const elapsed = (Date.now() - questionStartTime) / 1000;
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(b => b.disabled = true);

        const isCorrect = selectedIndex === q.correct;
        buttons[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) buttons[q.correct].classList.add('correct');

        const fb = document.getElementById('feedback-pill');
        if (isCorrect) {
            let xpEarned = 10;
            if (elapsed < 5) xpEarned += 20;
            score++;
            totalXP += xpEarned;
            ThermoGame.showXPFloat(xpEarned);
            if (fb) { fb.className = 'feedback-pill correct-fb show'; fb.innerHTML = `✔ Benar! +${xpEarned} XP${elapsed < 5 ? ' ⚡ Bonus Kecepatan!' : ''}`; }
            pulseCorrect();
        } else {
            if (fb) { fb.className = 'feedback-pill wrong-fb show'; fb.innerHTML = `✘ Salah. Jawaban: ${q.options[q.correct]}`; }
            pulseWrong();
        }

        const nb = document.getElementById('next-btn');
        if (nb) {
            nb.style.display = 'inline-flex';
            if (window.gsap) gsap.from(nb, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.out' });
        }
    }

    function nextQuestion() {
        currentQ++;
        if (currentQ >= config.questions.length) endQuiz();
        else renderQuestion();
    }

    function endQuiz() {
        clearInterval(timerInterval);
        const total = config.questions.length;
        const pct = Math.round((score / total) * 100);
        const passed = pct >= 70;

        const thinkingScores = {};
        const keys = config.thinkingKeys || ['critical', 'systemic', 'scientific', 'innovative'];
        keys.forEach(k => { thinkingScores[k] = pct; });

        state = ThermoGame.markZoneComplete(state, config.zoneKey, pct, totalXP, thinkingScores);
        state = BadgeSystem.checkAndAwardBadges(state);
        showResult(pct, totalXP, passed);
    }

    function showResult(pct, xp, passed) {
        const qContainer = document.getElementById('quiz-container');
        const mol3dWrap = document.getElementById('mol3d-wrap');
        const rScreen = document.getElementById('result-screen');

        if (qContainer) {
            if (window.gsap) gsap.to(qContainer, { opacity: 0, y: -20, duration: 0.4, onComplete: () => qContainer.style.display = 'none' });
            else qContainer.style.display = 'none';
        }
        if (mol3dWrap) {
            if (window.gsap) gsap.to(mol3dWrap, { opacity: 0, duration: 0.3, onComplete: () => mol3dWrap.style.display = 'none' });
            else mol3dWrap.style.display = 'none';
        }
        if (!rScreen) return;
        rScreen.classList.add('show');
        if (window.gsap) gsap.from(rScreen, { opacity: 0, scale: 0.95, duration: 0.5, ease: 'back.out(1.5)' });

        setEl('result-score-value', 'textContent', pct + '%');
        setEl('result-xp-earned', 'textContent', `+${xp} XP Diperoleh`);

        const msg = document.getElementById('result-message');
        if (msg) {
            msg.innerHTML = passed
                ? `✅ Zona Terbuka! Skor ≥ 70% — <span style="color:var(--orange)">Hebat!</span>`
                : `⚠️ Skor di bawah 70%. <span style="color:var(--warning)">Coba lagi untuk membuka zona berikutnya.</span>`;
        }
        ThermoGame.updateNavXP();
    }

    function setEl(id, prop, val) {
        const el = document.getElementById(id);
        if (!el) return;
        if (prop === 'textContent') el.textContent = val;
        else if (prop === 'style') el.setAttribute('style', val);
    }

    document.addEventListener('DOMContentLoaded', init);
    window.Quiz = { answer, nextQuestion };
})();
