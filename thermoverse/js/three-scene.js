/* =============================================
   three-scene.js — Shared Three.js engine utils
   ============================================= */

window.TV3D = (function () {

    /* ---- Helpers ---- */
    function hexColor(cssVar) {
        // Parse CSS var to hex for Three.js
        const map = {
            '--neon-blue': 0x00d4ff,
            '--neon-orange': 0xff6a00,
            '--neon-cyan': 0x00ffcc,
            '--neon-purple': 0x9d4edd,
            '--success': 0x00ff88,
            '--danger': 0xff3355,
        };
        return map[cssVar] || 0x00d4ff;
    }

    /* ---- Create Renderer + Scene ---- */
    function createRenderer(canvas, options = {}) {
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = false;

        const scene = new THREE.Scene();

        const fov = options.fov || 60;
        const camera = new THREE.PerspectiveCamera(fov, (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight), 0.1, 1000);
        camera.position.set(options.camX || 0, options.camY || 0, options.camZ || 8);

        // Resize handler
        window.addEventListener('resize', () => {
            const w = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
            const h = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        });

        return { renderer, scene, camera };
    }

    /* ---- Energy Orb (glowing sphere) ---- */
    function createEnergyOrb(scene, color = 0x00d4ff, radius = 1.4) {
        const group = new THREE.Group();

        // Core sphere
        const geo = new THREE.SphereGeometry(radius, 64, 64);
        const mat = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.6,
            metalness: 0.2,
            roughness: 0.1,
            transparent: true,
            opacity: 0.85,
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);

        // Outer glow ring
        const ringGeo = new THREE.TorusGeometry(radius * 1.35, 0.04, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Second ring tilted
        const ring2 = ring.clone();
        ring2.rotation.x = Math.PI / 4;
        ring2.rotation.y = Math.PI / 4;
        group.add(ring2);

        // Point light at orb center
        const light = new THREE.PointLight(color, 2, 8);
        group.add(light);

        scene.add(group);
        return { group, mesh, ring, ring2, light };
    }

    /* ---- Orbiting Atom (electron paths) ---- */
    function createAtom(scene, color = 0x00ffcc, scale = 1, position = [0, 0, 0]) {
        const group = new THREE.Group();
        group.position.set(...position);

        // Nucleus
        const nucGeo = new THREE.SphereGeometry(0.12 * scale, 16, 16);
        const nucMat = new THREE.MeshBasicMaterial({ color });
        const nucleus = new THREE.Mesh(nucGeo, nucMat);
        group.add(nucleus);

        // Electron orbits
        const orbitData = [
            { rx: 0, ry: 0, rz: 0, r: 0.6 * scale },
            { rx: Math.PI / 2, ry: 0, rz: 0, r: 0.6 * scale },
            { rx: Math.PI / 3, ry: Math.PI / 4, rz: 0, r: 0.7 * scale },
        ];

        const orbits = [];
        orbitData.forEach((od, i) => {
            // Orbit ring
            const orbitGeo = new THREE.TorusGeometry(od.r, 0.015 * scale, 8, 60);
            const orbitMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
            const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
            orbitMesh.rotation.set(od.rx, od.ry, od.rz);
            group.add(orbitMesh);

            // Electron
            const eGeo = new THREE.SphereGeometry(0.05 * scale, 8, 8);
            const eMat = new THREE.MeshBasicMaterial({ color });
            const electron = new THREE.Mesh(eGeo, eMat);
            group.add(electron);

            orbits.push({ electron, r: od.r, rx: od.rx, ry: od.ry, rz: od.rz, phase: i * 2.1 });
        });

        scene.add(group);
        return { group, orbits };
    }

    /* ---- Animate atom electrons ---- */
    function animateAtomElectrons(atomObj, t, speed = 1) {
        atomObj.orbits.forEach((od, i) => {
            const angle = t * speed + od.phase;
            // Rotate the electron around the orbit axis
            const r = od.r;
            od.electron.position.x = atomObj.group.position.x + Math.cos(angle) * r;
            od.electron.position.y = atomObj.group.position.y + Math.sin(angle) * r * Math.cos(od.rx);
            od.electron.position.z = atomObj.group.position.z + Math.sin(angle) * r * Math.sin(od.rx);
        });
    }

    /* ---- Portal (torus) for map zones ---- */
    function createPortal(scene, color, geometry = 'torus', position = [0, 0, 0]) {
        const group = new THREE.Group();
        group.position.set(...position);

        let mesh;
        if (geometry === 'torus') {
            const geo = new THREE.TorusGeometry(1.1, 0.15, 20, 80);
            const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, metalness: 0.4, roughness: 0.1 });
            mesh = new THREE.Mesh(geo, mat);
        } else if (geometry === 'dodeca') {
            const geo = new THREE.DodecahedronGeometry(1.0, 0);
            const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, wireframe: true });
            mesh = new THREE.Mesh(geo, mat);
        } else if (geometry === 'icosa') {
            const geo = new THREE.IcosahedronGeometry(1.0, 1);
            const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, wireframe: true });
            mesh = new THREE.Mesh(geo, mat);
        }

        group.add(mesh);

        // Inner fill disc
        const discGeo = new THREE.CircleGeometry(0.9, 64);
        const discMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.07, side: THREE.DoubleSide });
        const disc = new THREE.Mesh(discGeo, discMat);
        group.add(disc);

        // Glow point light
        const light = new THREE.PointLight(color, 1.5, 4);
        group.add(light);

        scene.add(group);
        return { group, mesh, disc, light };
    }

    /* ---- Turbine blades ---- */
    function createTurbine(scene, position = [0, 0, 0]) {
        const group = new THREE.Group();
        group.position.set(...position);

        // Hub
        const hubGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16);
        const hubMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.3, metalness: 0.8, roughness: 0.2 });
        const hub = new THREE.Mesh(hubGeo, hubMat);
        group.add(hub);

        // Blades
        const bladeCount = 6;
        const blades = [];
        for (let i = 0; i < bladeCount; i++) {
            const bGeo = new THREE.BoxGeometry(0.08, 1.2, 0.05);
            const bMat = new THREE.MeshStandardMaterial({ color: 0x0090c4, metalness: 0.9, roughness: 0.1 });
            const blade = new THREE.Mesh(bGeo, bMat);
            const angle = (i / bladeCount) * Math.PI * 2;
            blade.position.x = Math.cos(angle) * 0.6;
            blade.position.z = Math.sin(angle) * 0.6;
            blade.rotation.y = angle;
            blades.push(blade);
            group.add(blade);
        }

        // Platform disc
        const platGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.06, 48);
        const platMat = new THREE.MeshStandardMaterial({ color: 0x0a1628, metalness: 0.6, roughness: 0.4 });
        const platform = new THREE.Mesh(platGeo, platMat);
        platform.position.y = -0.9;
        group.add(platform);

        // Energy ring
        const ringGeo = new THREE.TorusGeometry(1.5, 0.04, 12, 80);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.9;
        group.add(ring);

        scene.add(group);
        return { group, hub, blades, ring };
    }

    /* ---- Molecule (for quiz pages) ---- */
    function createMolecule(scene, position = [0, 0, 0]) {
        const group = new THREE.Group();
        group.position.set(...position);

        // Central atom
        const cGeo = new THREE.SphereGeometry(0.35, 32, 32);
        const cMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.2 });
        const center = new THREE.Mesh(cGeo, cMat);
        group.add(center);

        // Surrounding atoms + bonds
        const positions = [
            [0.9, 0, 0], [-0.9, 0, 0],
            [0, 0.9, 0], [0, -0.9, 0],
            [0, 0, 0.9], [0, 0, -0.9],
        ];
        const colors = [0xff6a00, 0x00ffcc, 0x9d4edd, 0xff6a00, 0x00ffcc, 0x9d4edd];

        const satellites = [];
        positions.forEach((pos, i) => {
            // Atom
            const sGeo = new THREE.SphereGeometry(0.18, 16, 16);
            const sMat = new THREE.MeshStandardMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.4 });
            const sat = new THREE.Mesh(sGeo, sMat);
            sat.position.set(...pos);
            group.add(sat);
            satellites.push(sat);

            // Bond (cylinder)
            const bondGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8);
            const bondMat = new THREE.MeshBasicMaterial({ color: 0x1a3a5c, transparent: true, opacity: 0.7 });
            const bond = new THREE.Mesh(bondGeo, bondMat);
            bond.position.set(pos[0] / 2, pos[1] / 2, pos[2] / 2);
            // Orient toward center
            if (pos[1] !== 0) bond.rotation.z = 0;
            if (pos[0] !== 0) bond.rotation.z = Math.PI / 2;
            if (pos[2] !== 0) bond.rotation.x = Math.PI / 2;
            group.add(bond);
        });

        // Orbiting electron path
        const elOrbitGeo = new THREE.TorusGeometry(1.2, 0.02, 8, 80);
        const elOrbitMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.2 });
        const elOrbit = new THREE.Mesh(elOrbitGeo, elOrbitMat);
        elOrbit.rotation.x = Math.PI / 4;
        group.add(elOrbit);

        // Electron
        const elGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const elMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
        const electron = new THREE.Mesh(elGeo, elMat);
        group.add(electron);

        const light = new THREE.PointLight(0x00d4ff, 1, 5);
        group.add(light);

        scene.add(group);
        return { group, center, satellites, electron, elOrbit };
    }

    /* ---- Trophy (Lathe) ---- */
    function createTrophy(scene, position = [0, 0, 0]) {
        const group = new THREE.Group();
        group.position.set(...position);

        // Cup profile
        const points = [];
        for (let i = 0; i <= 16; i++) {
            const t = i / 16;
            const x = 0.3 + 0.5 * Math.sin(t * Math.PI) * (1 - 0.3 * t);
            const y = t * 2.0 - 0.5;
            points.push(new THREE.Vector2(x, y));
        }
        const latheGeo = new THREE.LatheGeometry(points, 32);
        const latheMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00, emissive: 0xff6a00, emissiveIntensity: 0.3,
            metalness: 0.9, roughness: 0.1
        });
        const cup = new THREE.Mesh(latheGeo, latheMat);
        group.add(cup);

        // Star on top
        const starLight = new THREE.PointLight(0xffaa00, 2, 3);
        starLight.position.set(0, 1.8, 0);
        group.add(starLight);

        // Base
        const baseGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.15, 32);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x333355, metalness: 0.8 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -0.7;
        group.add(base);

        // Ambient glow
        const al = new THREE.AmbientLight(0xffaa00, 0.3);
        scene.add(al);

        scene.add(group);
        return { group, cup };
    }

    /* ---- Standard lighting rig ---- */
    function addLights(scene) {
        const ambient = new THREE.AmbientLight(0x0a1628, 0.8);
        scene.add(ambient);

        const dir1 = new THREE.DirectionalLight(0x00d4ff, 0.6);
        dir1.position.set(5, 5, 5);
        scene.add(dir1);

        const dir2 = new THREE.DirectionalLight(0xff6a00, 0.4);
        dir2.position.set(-5, -3, 2);
        scene.add(dir2);

        return { ambient, dir1, dir2 };
    }

    return {
        createRenderer, createEnergyOrb, createAtom, animateAtomElectrons,
        createPortal, createTurbine, createMolecule, createTrophy,
        addLights, hexColor
    };
})();
