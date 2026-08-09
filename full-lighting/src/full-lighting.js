/**
 * Assignment 4: Virtual World with Full Lighting, Textures, and Models
 */

const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_WorldPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_NormalMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
        v_WorldPos = u_ModelMatrix * a_Position;
    }`;

const FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_WorldPos;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    uniform vec3 u_lightColor;
    uniform bool u_lightOn;
    uniform vec3 u_spotlightPos;
    uniform vec3 u_spotlightDir;
    uniform bool u_spotlightOn;
    uniform bool u_normalOn;

    void main() {
        if (u_normalOn) {
            gl_FragColor = vec4(v_Normal * 0.5 + 0.5, 1.0);
            return;
        }
        vec4 baseColor;
        if (u_whichTexture == -2) {
            baseColor = u_FragColor;
        } else if (u_whichTexture == 0) {
            baseColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 1) {
            baseColor = texture2D(u_Sampler1, v_UV);
        } else {
            baseColor = vec4(1, 0, 1, 1);
        }

        vec3 normal = normalize(v_Normal);
        vec3 viewDir = normalize(u_cameraPos - vec3(v_WorldPos));
        vec3 combinedLight = vec3(0.0);

        if (u_lightOn) {
            vec3 lightDir = normalize(u_lightPos - vec3(v_WorldPos));
            float nDotL = max(dot(normal, lightDir), 0.0);
            vec3 diffuse = nDotL * baseColor.rgb * u_lightColor;
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
            vec3 specular = spec * u_lightColor;
            combinedLight += (diffuse + specular);
        }

        if (u_spotlightOn) {
            vec3 sDir = normalize(u_spotlightPos - vec3(v_WorldPos));
            float theta = dot(sDir, normalize(-u_spotlightDir));
            if (theta > 0.94) {
                float nDotL = max(dot(normal, sDir), 0.0);
                combinedLight += nDotL * baseColor.rgb * 0.7;
            }
        }

        vec3 ambient = 0.2 * baseColor.rgb;
        gl_FragColor = vec4(ambient + combinedLight, baseColor.a);
    }`;

// --- GLOBALS ---
let canvas, gl;
let a_Position, a_UV, a_Normal;
let u_FragColor, u_ModelMatrix, u_ViewMatrix, u_ProjectionMatrix, u_NormalMatrix;
let u_Sampler0, u_Sampler1, u_whichTexture;
let u_lightPos, u_cameraPos, u_lightOn, u_lightColor, u_normalOn;
let u_spotlightPos, u_spotlightDir, u_spotlightOn;

let g_camera = new Camera();
let g_shapes = { cube: null, pyramid: null, sphere: null };
let g_map = [];
let g_objModels = [];
let g_objFiles = ["bunny.obj", "teapot.obj", "benchy.obj", "trumpet.obj", "dragon.obj"];

let g_lightOn = true, g_spotlightOn = false, g_normalOn = false, g_lightAnimation = true;
let g_seconds = 0, g_startTime = performance.now() / 1000;
let g_fps = 0, g_frameCount = 0, g_lastFpsTime = performance.now();

let g_bodyLunge = 0, g_bodySway = 0, g_tail1Osc = 0, g_tail2Osc = 0, g_pincerOsc = 0, g_armOsc = 0, g_elbowOsc = 0;
let g_strikeAnimation = false, g_strikeTime = 0, g_animation = true, g_gameWon = false, g_gemPos = { x: 22, z: 22 };

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    g_shapes.cube = new Cube();
    g_shapes.pyramid = new Pyramid();
    g_shapes.sphere = new Sphere();

    for (let file of g_objFiles) {
        g_objModels.push(new Model(gl, file));
    }

    initMap();
    initTextures();
    addActions();
    gl.clearColor(0, 0, 0, 1);
    requestAnimationFrame(tick);
}

function toggleLight() {
    g_lightOn = !g_lightOn;
    let btn = document.getElementById("btnLight");
    btn.innerText = "Point Light: " + (g_lightOn ? "ON" : "OFF");
    btn.classList.toggle("active-btn", g_lightOn);
}

function toggleSpot() {
    g_spotlightOn = !g_spotlightOn;
    let btn = document.getElementById("btnSpot");
    btn.innerText = "Spotlight: " + (g_spotlightOn ? "ON" : "OFF");
    btn.classList.toggle("active-btn", g_spotlightOn);
}

function toggleNormals() {
    g_normalOn = !g_normalOn;
    let btn = document.getElementById("btnNorm");
    btn.innerText = "Normal Viz: " + (g_normalOn ? "ON" : "OFF");
    btn.classList.toggle("active-btn", g_normalOn);
}

function toggleAnim() {
    g_lightAnimation = !g_lightAnimation;
    let btn = document.getElementById("btnAnim");
    btn.innerText = "Animate Light: " + (g_lightAnimation ? "ON" : "OFF");
    btn.classList.toggle("active-btn", g_lightAnimation);
}

function setupWebGL() {
    canvas = document.getElementById("webgl");
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) return;
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) return;
    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    a_UV = gl.getAttribLocation(gl.program, "a_UV");
    a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
    u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
    u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
    u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
    u_lightColor = gl.getUniformLocation(gl.program, "u_lightColor");
    u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
    u_normalOn = gl.getUniformLocation(gl.program, "u_normalOn");
    u_spotlightPos = gl.getUniformLocation(gl.program, "u_spotlightPos");
    u_spotlightDir = gl.getUniformLocation(gl.program, "u_spotlightDir");
    u_spotlightOn = gl.getUniformLocation(gl.program, "u_spotlightOn");
}

function initMap() {
    for (let x = 0; x < 32; x++) {
        g_map[x] = [];
        for (let z = 0; z < 32; z++) {
            if (x === 0 || x === 31 || z === 0 || z === 31) {
                g_map[x][z] = 2;
            } else {
                g_map[x][z] = 0;
            }
        }
    }
}

function initTextures() {
    let img0 = new Image();
    img0.onload = function() { sendTextureToGPU(img0, u_Sampler0, 0); };
    img0.src = "dirt.png";
    let img1 = new Image();
    img1.onload = function() { sendTextureToGPU(img1, u_Sampler1, 1); };
    img1.src = "grass.png";
}

function sendTextureToGPU(image, sampler, unit) {
    let texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(sampler, unit);
}

function addActions() {
    document.onkeydown = function(ev) {
        if (ev.keyCode == 87) g_camera.moveForward(); // W
        if (ev.keyCode == 83) g_camera.moveBackwards(); // S
        if (ev.keyCode == 65) g_camera.moveLeft(); // A
        if (ev.keyCode == 68) g_camera.moveRight(); // D
        if (ev.keyCode == 38) g_camera.moveForward(); // Up Arrow
        if (ev.keyCode == 40) g_camera.moveBackwards(); // Down Arrow
        if (ev.keyCode == 81 || ev.keyCode == 37) g_camera.panLeft(); // Q or Left Arrow
        if (ev.keyCode == 69 || ev.keyCode == 39) g_camera.panRight(); // E or Right Arrow
        if (ev.keyCode == 32) g_camera.moveUp(); // Space
        if (ev.keyCode == 90) g_camera.moveDown(); // Z
        if (ev.keyCode == 88) { g_strikeAnimation = true; g_strikeTime = g_seconds; }
    };
    canvas.onmousemove = function(ev) {
        if (ev.buttons == 1) {
            g_camera.panRight(ev.movementX * 0.2);
            g_camera.panUp(ev.movementY * -0.2);
        }
    };
}

function updateAnimation() {
    if (g_animation) {
        g_bodySway = 5 * Math.sin(g_seconds * 1.5);
        g_tail1Osc = 10 * Math.sin(g_seconds * 2);
        g_tail2Osc = 5 * Math.sin(g_seconds * 2);
        g_pincerOsc = 15 * Math.sin(g_seconds * 4);
        g_armOsc = 10 * Math.sin(g_seconds * 1.5);
        g_elbowOsc = 10 * Math.sin(g_seconds * 1.5 + 0.5);
    }
    if (g_strikeAnimation) {
        let t = g_seconds - g_strikeTime;
        if (t < 0.7) {
            let p = Math.sin((t / 0.7) * Math.PI);
            g_bodyLunge = -0.15 * p;
            g_tail1Osc = -110 * p;
            g_tail2Osc = -5 * p;
            g_pincerOsc = 35 * p;
            g_armOsc = 45 * p;
        } else {
            g_strikeAnimation = false;
            g_bodyLunge = 0;
        }
    }
}

function drawScorpion(x, z) {
    let baseM = new Matrix4();
    baseM.setTranslate(x - 16, -0.65, z - 16 + g_bodyLunge);
    baseM.rotate(g_bodySway, 0, 1, 0);
    baseM.scale(0.4, 0.4, 0.4);

    for (let i = 0; i < 4; i++) {
        let seg = g_shapes.cube;
        seg.textureNum = -2;
        seg.color = [0.0, 0.3 + (i * 0.05), 0.25 + (i * 0.05), 1.0];
        seg.matrix.set(baseM);
        let s = 1.0 - (i * 0.1);
        seg.matrix.translate(-0.15 * s, 0, i * 0.12 - 0.2);
        seg.matrix.scale(0.3 * s, 0.18 * s, 0.15);
        seg.render();
    }

    let head = g_shapes.cube;
    head.textureNum = -2;
    head.color = [0.0, 0.4, 0.35, 1.0];
    head.matrix.set(baseM);
    head.matrix.translate(-0.2, -0.02, -0.38);
    head.matrix.scale(0.4, 0.22, 0.25);
    head.render();

    let tailM = new Matrix4(baseM);
    tailM.translate(0, 0.04, 0.3);
    for (let i = 0; i < 5; i++) {
        let ts = g_shapes.cube;
        ts.textureNum = -2;
        ts.color = [0.0, 0.3 + (i * 0.05), 0.3, 1.0];
        let ang = (i === 0) ? (g_tail1Osc) : (-15 + g_tail2Osc);
        tailM.rotate(ang, 1, 0, 0);
        ts.matrix.set(tailM);
        ts.matrix.translate(-0.04, 0, 0);
        ts.matrix.scale(0.08, 0.08, 0.18);
        ts.render();
        tailM.translate(0, 0, 0.18);
    }

    let bulb = g_shapes.cube;
    bulb.color = [0.0, 0.6, 0.5, 1.0];
    bulb.matrix.set(tailM);
    bulb.matrix.translate(-0.05, -0.02, 0);
    bulb.matrix.scale(0.1, 0.12, 0.12);
    bulb.render();

    let needle = g_shapes.pyramid;
    needle.color = [0.8, 0.1, 0.1, 1.0];
    needle.matrix.set(tailM);
    needle.matrix.translate(-0.02, 0.1, 0);
    needle.matrix.scale(0.04, 0.25, 0.04);
    needle.render();

    function drawArm(isLeft) {
        let side = isLeft ? -1 : 1;
        let m = new Matrix4(baseM);
        m.scale(side, 1, 1);
        m.translate(0.15, 0.05, -0.3);
        m.rotate(-5 + g_armOsc, 0, 1, 0);
        let arm = g_shapes.cube;
        arm.textureNum = -2;
        arm.color = [0.0, 0.3, 0.25, 1.0];
        arm.matrix.set(m);
        arm.matrix.scale(0.3, 0.08, 0.08);
        arm.render();

        m.translate(0.3, 0, 0);
        m.rotate(110 + g_elbowOsc, 0, 1, 0);
        arm.matrix.set(m);
        arm.matrix.scale(0.25, 0.08, 0.08);
        arm.render();

        m.translate(0.25, -0.06, 0.0);
        let b = g_shapes.cube;
        b.textureNum = -2;
        b.color = [0.0, 0.5, 0.4, 1.0];
        b.matrix.set(m);
        b.matrix.scale(0.3, 0.2, 0.1);
        b.render();

        let topP = g_shapes.pyramid;
        topP.color = [0.0, 0.35, 0.3, 1.0];
        let tpm = new Matrix4(m);
        tpm.translate(0.3, 0.15, 0.05);
        tpm.rotate(-90, 0, 0, 1);
        topP.matrix.set(tpm);
        topP.matrix.scale(0.08, 0.32, 0.08);
        topP.matrix.translate(-0.5, 0, -0.5);
        topP.render();

        let botP = g_shapes.pyramid;
        botP.color = [0.0, 0.45, 0.4, 1.0];
        let bpm = new Matrix4(m);
        bpm.translate(0.3, 0.05, 0.05);
        bpm.rotate(g_pincerOsc, 0, 0, 1);
        bpm.rotate(-90, 0, 0, 1);
        botP.matrix.set(bpm);
        botP.matrix.scale(0.08, 0.32, 0.08);
        botP.matrix.translate(-0.5, 0, -0.5);
        botP.render();
    }
    drawArm(true);
    drawArm(false);

    function drawLeg(index, isLeft) {
        let side = isLeft ? -1 : 1;
        let walk = 15 * Math.sin(g_seconds * 5 + index);
        let m = new Matrix4(baseM);
        m.translate(side * 0.15, 0.05, index * 0.12 - 0.12);
        m.rotate(side * index * -20 + walk, 0, 1, 0);
        m.rotate(side * 45, 0, 0, 1);
        let leg = g_shapes.cube;
        leg.textureNum = -2;
        leg.color = [0.0, 0.2 + (index * 0.02), 0.15, 1.0];
        leg.matrix.set(m);
        leg.matrix.scale(side * 0.2, 0.03, 0.03);
        leg.render();

        m.translate(side * 0.2, 0, 0);
        m.rotate(side * -105, 0, 0, 1);
        leg.matrix.set(m);
        leg.matrix.scale(side * 0.25, 0.03, 0.03);
        leg.render();
    }
    for (let i = 0; i < 4; i++) {
        drawLeg(i, true);
        drawLeg(i, false);
    }
}

function renderScene() {
    let start = performance.now();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let lX = parseFloat(document.getElementById("lightX").value);
    let lY = parseFloat(document.getElementById("lightY").value);
    let lZ = parseFloat(document.getElementById("lightZ").value);
    if (g_lightAnimation) {
        lX += 7 * Math.cos(g_seconds);
        lZ += 7 * Math.sin(g_seconds);
    }
    gl.uniform3f(u_lightPos, lX, lY, lZ);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform1i(u_normalOn, g_normalOn);

    let hex = document.getElementById("lightColor").value;
    gl.uniform3f(u_lightColor, parseInt(hex.slice(1,3),16)/255, parseInt(hex.slice(3,5),16)/255, parseInt(hex.slice(5,7),16)/255);

    gl.uniform3f(u_spotlightPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    let sDir = new Vector3(); sDir.set(g_camera.at); sDir.sub(g_camera.eye); sDir.normalize();
    gl.uniform3f(u_spotlightDir, sDir.elements[0], sDir.elements[1], sDir.elements[2]);
    gl.uniform1i(u_spotlightOn, g_spotlightOn);

    let proj = new Matrix4(); proj.setPerspective(60, canvas.width/canvas.height, 0.1, 500);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, proj.elements);
    let view = new Matrix4(); view.setLookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, view.elements);

    // DRAW SKYBOX (Corrected Logic)
    let sky = g_shapes.cube;
    sky.textureNum = -2;
    sky.color = [0.55, 0.75, 1.0, 1.0];
    sky.matrix.setTranslate(0, 0, 0);
    sky.matrix.scale(-500, -500, -500); // Massive negative scale centers it and flips faces
    sky.matrix.translate(-0.5, -0.5, -0.5); // Center the 0-1 vertices on the origin
    gl.uniform1i(u_lightOn, 0);
    sky.render();
    gl.uniform1i(u_lightOn, g_lightOn);

    let marker = g_shapes.cube;
    marker.textureNum = -2; marker.color = [1, 1, 0, 1];
    marker.matrix.setTranslate(lX, lY, lZ); marker.matrix.scale(-0.2, -0.2, -0.2);
    marker.render();

    let floor = g_shapes.cube;
    floor.textureNum = 1; floor.matrix.setTranslate(0, -0.75, 0); floor.matrix.scale(32, 0.1, 32); floor.matrix.translate(-0.5, -0.5, -0.5);
    floor.render();

    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z++) {
            for (let h = 0; h < g_map[x][z]; h++) {
                let w = g_shapes.cube; w.textureNum = 0;
                w.matrix.setTranslate(x - 16, h - 0.75, z - 16); w.render();
            }
        }
    }

    const modelProps = [
        { y: -0.7, s: 0.35, color: [0.6, 0.1, 0.9, 1.0] }, // Bunny (Purple)
        { y: -0.5, s: 0.25, color: [0.3, 0.3, 0.8, 1.0] }, // Teapot
        { y: -0.4, s: 0.22, color: [1.0, 0.5, 0.0, 1.0] }, // Benchy (Orange)
        { y: 0.8,   s: 0.25, color: [1.0, 0.8, 0.0, 1.0] }, // Trumpet (Raised)
        { y: 0.2,   s: 0.35, color: [0.1, 0.7, 0.2, 1.0] }  // Dragon
    ];

    let totalItems = 7;
    let radius = 10;

    for (let i = 0; i < totalItems; i++) {
        let angle = (i * 2 * Math.PI) / totalItems;
        let x = Math.cos(angle) * radius;
        let z = Math.sin(angle) * radius;

        if (i < 5) {
            let m = g_objModels[i];
            if (m && m.isFullyLoaded) {
                let props = modelProps[i];
                m.color = props.color;
                m.matrix.setTranslate(x, props.y, z);
                m.matrix.rotate((angle * 180 / Math.PI) + 90, 0, 1, 0);
                m.matrix.rotate(g_seconds * 15, 0, 1, 0);
                m.matrix.scale(props.s, props.s, props.s);
                m.render(gl);
            }
        } else if (i === 5) {
            let s = g_shapes.sphere;
            s.color = [1, 0, 0, 1];
            s.matrix.setTranslate(x, 0.7, z); // High float
            s.matrix.scale(1.2, 1.2, 1.2);
            s.render();
        } else if (i === 6) {
            let floatOffset = Math.sin(g_seconds * 3) * 0.15;
            let gem = g_shapes.pyramid;
            gem.textureNum = -2; gem.color = [1.0, 0.3, 0.8, 1.0]; // Pink Diamond
            for (let flip = 0; flip < 2; flip++) {
                gem.matrix.setTranslate(x, 0.2 + floatOffset, z);
                gem.matrix.rotate(g_seconds * 100, 0, 1, 0);
                if (flip === 1) gem.matrix.rotate(180, 1, 0, 0);
                gem.matrix.scale(0.5, 0.5, 0.5);
                gem.matrix.translate(-0.5, 0, -0.5);
                gem.render();
            }
        }
    }

    drawScorpion(16, 16);

    let dur = performance.now() - start;
    document.getElementById("perf").innerText = `ms: ${dur.toFixed(1)} | FPS: ${g_fps}`;
}

function tick() {
    g_seconds = performance.now() / 1000 - g_startTime;
    g_frameCount++;
    if (performance.now() - g_lastFpsTime >= 1000) {
        g_fps = g_frameCount; g_frameCount = 0; g_lastFpsTime = performance.now();
    }
    updateAnimation();
    renderScene();
    requestAnimationFrame(tick);
}
