import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

let scene, camera, renderer, controls;
let swordModel, tsubaModel, orbLight, statsDiv, lanternSphere, lampLight;
let landedSnowGeo, landedSnowMat;
let lastTime = 0;
let frameCount = 0;
let fpsLastTime = 0;
const dragonGuardians = [];

// High-Detail Sakura Texture (Cluster of petals)
function createSakuraTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = 64 + Math.cos(angle) * 22;
        const y = 64 + Math.sin(angle) * 22;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 42);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.2, 'rgba(255, 185, 215, 0.9)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 42, 0, Math.PI * 2);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}
const sakuraTex = createSakuraTexture();

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.0035);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 110, 320);

    camera.layers.enable(1);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    statsDiv = document.getElementById('stats');

    scene.add(new THREE.AmbientLight(0x444477, 0.8));
    scene.add(new THREE.HemisphereLight(0x4444ff, 0x112211, 0.6));

    const moon = new THREE.DirectionalLight(0xffffff, 2.5);
    moon.position.set(100, 150, 100);
    moon.castShadow = true;
    moon.layers.set(1);
    moon.shadow.bias = -0.0005;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.left = -300;
    moon.shadow.camera.right = 300;
    moon.shadow.camera.top = 300;
    moon.shadow.camera.bottom = -300;
    scene.add(moon);

    const skyLoader = new THREE.CubeTextureLoader();
    const spacePath = 'https://threejs.org/examples/textures/cube/MilkyWay/';
    scene.background = skyLoader.load([
        spacePath + 'dark-s_px.jpg', spacePath + 'dark-s_nx.jpg', spacePath + 'dark-s_py.jpg',
        spacePath + 'dark-s_ny.jpg', spacePath + 'dark-s_pz.jpg', spacePath + 'dark-s_nz.jpg'
    ]);

    const texLoader = new THREE.TextureLoader();
    const grassTex = texLoader.load('grass.png');
    const dirtTex = texLoader.load('dirt.png');

    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x333333
    });
    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 1.0
    });
    const roofMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 1.0,
        metalness: 0.1
    });
    const jadeMat = new THREE.MeshPhysicalMaterial({
        color: 0x004422,
        emissive: 0x00ffcc,
        emissiveIntensity: 0.08,
        roughness: 0.2,
        metalness: 0.2,
        clearcoat: 0.5
    });
    const shojiMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfff4e5,
        emissiveIntensity: 0.02,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
    });

    const templeGroup = new THREE.Group();
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(56, 12, 34), stoneMat);
    foundation.position.y = 6;
    foundation.receiveShadow = true;
    foundation.castShadow = true;
    templeGroup.add(foundation);

    for (let i = 0; i < 8; i++) {
        const stepDepth = 5;
        const topY = Math.max(0.4, 12 - (i * 1.7));
        const step = new THREE.Mesh(new THREE.BoxGeometry(32, topY, stepDepth), stoneMat);
        step.position.set(0, topY / 2, 17 + (i * stepDepth) + (stepDepth / 2));
        step.receiveShadow = true;
        step.castShadow = true;
        templeGroup.add(step);
    }

    for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 40, 12), woodMat);
        p.position.set(i < 2 ? 24 : -24, 32, i % 2 === 0 ? 13 : -13);
        p.castShadow = true;
        templeGroup.add(p);
    }

    const shojiGroup = new THREE.Group();
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(50, 40), shojiMat);
    paper.receiveShadow = true;
    shojiGroup.add(paper);

    const gridParts = [];
    const frameLeft = new THREE.BoxGeometry(1.5, 40, 0.8);
    frameLeft.translate(-25, 0, 0.2);
    const frameRight = new THREE.BoxGeometry(1.5, 40, 0.8);
    frameRight.translate(25, 0, 0.2);
    const frameTop = new THREE.BoxGeometry(50, 1.5, 0.8);
    frameTop.translate(0, 20, 0.2);
    const frameBot = new THREE.BoxGeometry(50, 1.5, 0.8);
    frameBot.translate(0, -20, 0.2);
    gridParts.push(frameLeft, frameRight, frameTop, frameBot);

    for (let i = 1; i < 6; i++) {
        const vBar = new THREE.BoxGeometry(0.4, 40, 0.6);
        vBar.translate(-25 + (i * 8.33), 0, 0.1);
        gridParts.push(vBar);
    }
    for (let i = 1; i < 6; i++) {
        const hBar = new THREE.BoxGeometry(50, 0.4, 0.6);
        hBar.translate(0, -20 + (i * 6.6), 0.1);
        gridParts.push(hBar);
    }
    const mergedKumiko = BufferGeometryUtils.mergeGeometries(gridParts);
    const kumikoMesh = new THREE.Mesh(mergedKumiko, woodMat);
    kumikoMesh.receiveShadow = true;
    shojiGroup.add(kumikoMesh);
    shojiGroup.position.set(0, 32, -12.5);
    templeGroup.add(shojiGroup);

    for (let i = 0; i < 3; i++) {
        const tierH = 6;
        const tier = new THREE.Mesh(new THREE.BoxGeometry(64 - (i * 12), tierH, 42 - (i * 12)), roofMat);
        tier.position.y = 52 + (tierH / 2) + (i * tierH);
        tier.castShadow = true;
        tier.receiveShadow = true;
        templeGroup.add(tier);
    }

    // LANTERN: Final composition (y: 49, z: 12)
    lanternSphere = new THREE.Mesh(
        new THREE.SphereGeometry(2.4, 32, 32),
        new THREE.MeshStandardMaterial({
            color: 0xffaa44,
            emissive: 0xffaa44,
            emissiveIntensity: 2.5
        })
    );
    lanternSphere.position.set(0, 49, 12);
    templeGroup.add(lanternSphere);

    const lanternTop = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.6, 16), woodMat);
    lanternTop.position.set(0, 51.7, 12);
    templeGroup.add(lanternTop);

    const lanternBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.6, 16), woodMat);
    lanternBottom.position.set(0, 46.3, 12);
    templeGroup.add(lanternBottom);

    templeGroup.scale.set(1.5, 1.5, 1.5);

    // TRAVERSAL: Shadow management
    templeGroup.traverse((node) => {
        if (node.isMesh) {
            node.layers.enable(1);
            if (node === lanternSphere || node === lanternBottom) {
                node.castShadow = false;
            } else {
                node.castShadow = true;
            }
            node.receiveShadow = true;
        }
    });
    scene.add(templeGroup);

    lampLight = new THREE.PointLight(0xffaa44, 8000, 200);
    lampLight.position.set(0, 49 * 1.5, 12 * 1.5); // Following lantern z: 12
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.set(2048, 2048);
    lampLight.shadow.radius = 4;
    lampLight.shadow.bias = -0.001;
    lampLight.shadow.normalBias = 0.02;
    lampLight.shadow.camera.near = 0.1;
    lampLight.shadow.camera.far = 300;
    scene.add(lampLight);

    orbLight = new THREE.PointLight(0xffaa44, 3500, 120);
    orbLight.castShadow = false;
    scene.add(orbLight);

    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(250, 64),
        new THREE.MeshStandardMaterial({
            map: grassTex,
            color: 0x223322,
            roughness: 1.0
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.layers.enable(1);
    scene.add(ground);

    for (let i = 0; i < 26; i++) {
        let taper = 0;
        if (i > 5) {
            taper = Math.min(1.0, (i - 5) / 12);
        }
        const curve = Math.sin((i - 5) * 0.4) * 14 * taper;
        const zPos = 85 + (i * 8);
        const dist = Math.sqrt(curve * curve + zPos * zPos);
        if (dist < 249) {
            const segment = new THREE.Mesh(
                new THREE.CircleGeometry(12, 16),
                new THREE.MeshStandardMaterial({
                    map: dirtTex,
                    roughness: 1
                })
            );
            segment.position.set(curve, 0.1 + (i * 0.005), zPos);
            segment.rotation.x = -Math.PI / 2;
            segment.rotation.z = Math.random() * Math.PI * 2;
            const sVar = 0.85 + Math.random() * 0.3;
            segment.scale.set(sVar, sVar, 1);
            segment.receiveShadow = true;
            segment.layers.enable(1);
            scene.add(segment);
        }
    }

    const blossomMat = new THREE.MeshStandardMaterial({
        map: sakuraTex,
        vertexColors: true,
        emissive: 0xffaacc,
        emissiveIntensity: 0.1,
        roughness: 0.9,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        alphaTest: 0.1
    });

    function createForest() {
        const allWoodGeos = [];
        const allLeafGeos = [];

        function generateTreeData(x, z, s, depthLimit) {
            function spawnBranch(start, direction, length, thickness, depth) {
                const newStart = direction.clone().multiplyScalar(length).add(start);
                const branchGeo = new THREE.CylinderGeometry(thickness * 0.6, thickness, length, 4);
                const axis = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.clone().normalize());
                branchGeo.applyQuaternion(quaternion);
                const midPoint = direction.clone().multiplyScalar(length / 2).add(start);
                branchGeo.translate(midPoint.x, midPoint.y, midPoint.z);
                branchGeo.scale(s, s, s);
                branchGeo.translate(x, 0, z);
                allWoodGeos.push(branchGeo);

                if (depth <= 1) {
                    const planes = [];
                    const leafCount = (depth === 0) ? 14 : 7;
                    const tuftCenter = newStart.clone();
                    const clusterRadius = thickness * 4.0;
                    for (let i = 0; i < leafCount; i++) {
                        const lS = thickness * (depth === 0 ? 8.0 : 6.0) * (0.8 + Math.random() * 0.4);
                        const p = new THREE.PlaneGeometry(lS, lS);
                        const r = Math.pow(Math.random(), 0.5) * clusterRadius;
                        const phi = Math.random() * Math.PI * 2;
                        const theta = Math.random() * Math.PI;
                        const ox = r * Math.sin(theta) * Math.cos(phi);
                        const oy = r * Math.sin(theta) * Math.sin(phi);
                        const oz = r * Math.cos(theta);
                        p.rotateX(Math.random() * Math.PI);
                        p.rotateY(Math.random() * Math.PI);
                        p.translate(tuftCenter.x + ox, tuftCenter.y + oy, tuftCenter.z + oz);
                        const colors = [];
                        const baseColor = new THREE.Color();
                        const tone = Math.random();
                        if (tone > 0.6) {
                            baseColor.setRGB(1, 0.95, 0.98);
                        } else if (tone > 0.2) {
                            baseColor.setRGB(1, 0.85, 0.92);
                        } else {
                            baseColor.setRGB(1, 0.6, 0.8);
                        }
                        for (let j = 0; j < 4; j++) {
                            colors.push(baseColor.r, baseColor.g, baseColor.b);
                        }
                        p.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                        p.scale(s, s, s);
                        p.translate(x, 0, z);
                        planes.push(p);
                    }
                    allLeafGeos.push(BufferGeometryUtils.mergeGeometries(planes));
                    if (depth <= 0) {
                        return;
                    }
                }
                const children = 3;
                for (let i = 0; i < children; i++) {
                    const newDir = direction.clone().lerp(new THREE.Vector3(0, 1, 0), 0.15).normalize();
                    const radialAngle = (i / children) * Math.PI * 2;
                    let tangent = new THREE.Vector3(0, 1, 0).cross(newDir);
                    if (tangent.length() < 0.1) {
                        tangent = new THREE.Vector3(1, 0, 0).cross(newDir);
                    }
                    tangent.normalize();
                    newDir.applyAxisAngle(tangent, 0.6);
                    newDir.applyAxisAngle(direction.clone().normalize(), radialAngle);
                    spawnBranch(newStart, newDir, length * 0.76, thickness * 0.58, depth - 1);
                }
            }
            spawnBranch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 14, 2.2, depthLimit);
        }

        const treeLocs = [
            [160, 30, 4.5, 4],
            [-180, 40, 4.2, 4],
            [0, -150, 5.0, 4],
            [160, -140, 3.8, 3],
            [-180, -120, 3.5, 3],
            [80, -90, 4.0, 4],
            [-100, -80, 3.8, 4],
            [-190, 120, 3.5, 3],
            [180, 100, 3.2, 3]
        ];
        treeLocs.forEach((t) => {
            generateTreeData(t[0], t[1], t[2], t[3]);
        });

        const forestWood = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(allWoodGeos), woodMat);
        const forestLeaves = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(allLeafGeos), blossomMat);
        forestWood.castShadow = true;
        forestWood.receiveShadow = true;
        forestLeaves.castShadow = true;
        forestWood.layers.enable(1);
        forestLeaves.layers.enable(1);
        scene.add(forestWood, forestLeaves);
    }
    createForest();

    const objLoader = new OBJLoader();
    objLoader.load('dragon.obj', (obj) => {
        const left = obj.clone();
        left.scale.set(15, 15, 15);
        left.position.set(-85, 20, 15);
        left.rotation.y = Math.PI * 1.05;
        const right = obj.clone();
        right.scale.set(-15, 15, 15);
        right.position.set(85, 20, 15);
        right.rotation.y = -Math.PI * 1.05;
        [left, right].forEach((d) => {
            d.traverse((c) => {
                if (c.isMesh) {
                    c.material = jadeMat;
                    c.castShadow = true;
                }
            });
            scene.add(d);
            dragonGuardians.push(d);
        });
    });

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('sword_of_hattori_hanzo_kill_bill.glb', (gltf) => {
        const sword = gltf.scene;
        sword.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        sword.scale.set(24, 24, 24);
        sword.position.set(0, 42, 0);
        sword.rotation.y = Math.PI / 2;
        scene.add(sword);
    });

    gltfLoader.load('tsuba.glb', (gltf) => {
        tsubaModel = gltf.scene;
        tsubaModel.scale.set(0.05, 0.05, 0.05);
        tsubaModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.material = new THREE.MeshPhysicalMaterial({
                    color: 0x887755,
                    metalness: 1.0,
                    roughness: 0.2,
                    clearcoat: 1.0
                });
            }
        });
        scene.add(tsubaModel);
    });

    createCottonParticles();
    createLandedSnow();
}

function createCottonParticles() {
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 15000; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 250;
        vertices.push(Math.cos(angle) * radius, Math.random() * 400, Math.sin(angle) * radius);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const mat = new THREE.PointsMaterial({
        size: 0.6,
        color: 0xffffff,
        transparent: true,
        opacity: 0.4
    });
    const points = new THREE.Points(geo, mat);
    points.layers.enable(1);
    scene.add(points);
    window.cotton = geo;
}

function createLandedSnow() {
    landedSnowGeo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 25000; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 250;
        const lx = Math.cos(angle) * radius;
        const lz = Math.sin(angle) * radius;
        if (Math.abs(lx) > 22 || Math.abs(lz) > 22) {
            vertices.push(lx, 0.2, lz);
        }
    }
    landedSnowGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    landedSnowMat = new THREE.PointsMaterial({
        size: 1.0,
        color: 0xffffff,
        transparent: true,
        opacity: 0.0
    });
    const points = new THREE.Points(landedSnowGeo, landedSnowMat);
    points.layers.enable(1);
    scene.add(points);
}

function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    const duration = currentTime - lastTime;
    lastTime = currentTime;
    frameCount++;
    if (currentTime > fpsLastTime + 1000) {
        statsDiv.innerText = `ms: ${duration.toFixed(1)} | FPS: ${Math.round((frameCount * 1000) / (currentTime - fpsLastTime))}`;
        fpsLastTime = currentTime;
        frameCount = 0;
    }
    const time = currentTime * 0.0015;
    if (lampLight && lanternSphere) {
        const flicker = Math.random() * 0.15;
        lampLight.intensity = 7000 + (Math.sin(currentTime * 0.01) * 500) + (flicker * 4000);
        lanternSphere.material.emissiveIntensity = 2.0 + (flicker * 3.0);
        lanternSphere.rotation.y += 0.01;
    }
    if (tsubaModel) {
        const den = 1 + Math.pow(Math.sin(time), 2);
        const x = (20 * Math.cos(time)) / den;
        const y = (18 * Math.sin(time) * Math.cos(time)) / den;
        tsubaModel.position.set(x, 30 + y, 9);
        tsubaModel.rotation.x += 0.01;
        tsubaModel.rotation.y += 0.015;
        tsubaModel.rotation.z += 0.005;
        orbLight.position.copy(tsubaModel.position);
    }
    dragonGuardians.forEach((d, i) => {
        d.position.y = 38 + Math.sin(time + i) * 0.5;
    });
    if (window.cotton) {
        const pos = window.cotton.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            pos[i + 1] -= 0.05;
            const inRoof = Math.abs(pos[i]) < 40 && Math.abs(pos[i + 2]) < 40;
            if (pos[i + 1] < 0 || (inRoof && pos[i + 1] < 85)) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 250;
                pos[i] = Math.cos(angle) * radius;
                pos[i + 1] = 400;
                pos[i + 2] = Math.sin(angle) * radius;
            }
        }
        window.cotton.attributes.position.needsUpdate = true;
    }
    if (landedSnowMat) {
        const pulse = (Math.sin(currentTime * 0.0005) + 1) / 2;
        landedSnowMat.opacity = 0.15 + (pulse * 0.5);
    }
    controls.update();
    renderer.render(scene, camera);
}
