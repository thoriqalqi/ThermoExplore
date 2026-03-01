/* =============================================
   particles.js — Background particle effect
   ============================================= */

(function () {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    const COLORS = ['rgba(0,212,255,', 'rgba(255,106,0,', 'rgba(0,255,204,', 'rgba(157,78,221,'];
    const COUNT = window.innerWidth < 600 ? 40 : 80;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function createParticle() {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
            x: rand(0, W),
            y: rand(0, H),
            r: rand(0.5, 2.5),
            vx: rand(-0.25, 0.25),
            vy: rand(-0.4, -0.1),
            alpha: rand(0.1, 0.6),
            da: rand(-0.002, 0.002),
            color
        };
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < COUNT; i++) particles.push(createParticle());
    }

    function drawLine(p1, p2, dist, maxDist) {
        const alpha = (1 - dist / maxDist) * 0.08;
        ctx.beginPath();
        ctx.strokeStyle = p1.color + alpha + ')';
        ctx.lineWidth = 0.5;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Connect nearby
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) drawLine(particles[i], particles[j], dist, 150);
            }
        }

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha += p.da;

            if (p.alpha <= 0.05 || p.alpha >= 0.7) p.da *= -1;
            if (p.y < -10) p.y = H + 10;
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();

            // Occasional glow
            if (p.r > 1.5) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = p.color + (p.alpha * 0.1) + ')';
                ctx.fill();
            }
        });

        animId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); });
    init();
    draw();
})();
