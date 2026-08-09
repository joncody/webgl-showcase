/**
 * Assignment 3: Virtual World
 */

const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`;

const FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    void main() {
        if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        } else {
            gl_FragColor = vec4(1, 0, 1, 1);
        }
    }`;

// --- GLOBALS ---
let canvas, gl;
let a_Position, a_UV;
let u_FragColor, u_ModelMatrix, u_ViewMatrix, u_ProjectionMatrix, u_Sampler0, u_Sampler1, u_whichTexture;
let g_camera = new Camera();
let g_shapes = {
    cube: null,
    pyramid: null
};
// Map & Game State
let g_map = [];
let g_gemPos = {
    x: 0,
    z: 0
};
let g_gameWon = false;
let g_mousedownX = 0;
let g_mousedownY = 0;
// Scorpion Animation State
let g_seconds = 0;
let g_startTime = performance.now() / 1000;
let g_animation = true;
let g_strikeAnimation = false;
let g_strikeTime = 0;
// Performance
let g_lastFpsTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;
// Animation offsets
let g_bodyLunge = 0;
let g_bodySway = 0;
let g_tail1Osc = 0;
let g_tail2Osc = 0;
let g_pincerOsc = 0;
let g_armOsc = 0;
let g_elbowOsc = 0;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    g_shapes.cube = new Cube();
    g_shapes.pyramid = new Pyramid();
    initMap();
    initTextures();
    addActions();
    gl.clearColor(
        0.0,
        0.0,
        0.0,
        1.0
    );
    requestAnimationFrame(tick);
}

function setupWebGL() {
    canvas = document.getElementById("webgl");
    gl = canvas.getContext(
        "webgl",
        {
            preserveDrawingBuffer: true
        }
    );
    if (!gl) {
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    a_UV = gl.getAttribLocation(gl.program, "a_UV");
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
    u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
    u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
}

function initMap() {
    for (let x = 0; x < 32; x++) {
        g_map[x] = [];
        for (let z = 0; z < 32; z++) {
            if (x === 0 || x === 31 || z === 0 || z === 31) {
                g_map[x][z] = 2;
            } else if (Math.random() > 0.9) {
                g_map[x][z] = Math.floor(Math.random() * 3) + 1;
            } else {
                g_map[x][z] = 0;
            }
        }
    }
    let valid = false;
    while (!valid) {
        g_gemPos.x = Math.floor(Math.random() * 24) + 4;
        g_gemPos.z = Math.floor(Math.random() * 24) + 4;
        let d = Math.sqrt(Math.pow(g_gemPos.x - 16, 2) + Math.pow(g_gemPos.z - 16, 2));
        if (d > 12) {
            valid = true;
        }
    }
    g_map[g_gemPos.x][g_gemPos.z] = 0;
}

function initTextures() {
    let img0 = new Image();
    img0.onload = function() {
        sendTextureToGPU(img0, u_Sampler0, 0);
    };
    img0.src = "dirt.png";
    let img1 = new Image();
    img1.onload = function() {
        sendTextureToGPU(img1, u_Sampler1, 1);
    };
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
        if (ev.keyCode == 87 || ev.keyCode == 38) { g_camera.moveForward(); }
        if (ev.keyCode == 83 || ev.keyCode == 40) { g_camera.moveBackwards(); }
        if (ev.keyCode == 65) { g_camera.moveLeft(); }
        if (ev.keyCode == 68) { g_camera.moveRight(); }
        if (ev.keyCode == 81 || ev.keyCode == 37) { g_camera.panLeft(); }
        if (ev.keyCode == 69 || ev.keyCode == 39) { g_camera.panRight(); }
        if (ev.keyCode == 32) { g_camera.moveUp(); }
        if (ev.keyCode == 90) { g_camera.moveDown(); }
        if (ev.keyCode == 88) {
            g_strikeAnimation = true;
            g_strikeTime = g_seconds;
        }
    };
    canvas.onmousedown = function(ev) {
        g_mousedownX = ev.clientX;
        g_mousedownY = ev.clientY;
    };
    canvas.onmousemove = function(ev) {
        if (ev.buttons == 1) {
            g_camera.panRight(ev.movementX * 0.2);
            g_camera.panUp(ev.movementY * -0.2);
        }
    };
    canvas.onmouseup = function(ev) {
        let deltaX = Math.abs(ev.clientX - g_mousedownX);
        let deltaY = Math.abs(ev.clientY - g_mousedownY);
        if (deltaX > 5 || deltaY > 5) {
            return;
        }
        let f = new Vector3();
        f.set(g_camera.at);
        f.sub(g_camera.eye);
        f.normalize();
        for (let i = 0; i < 4.5; i += 0.1) {
            let px = g_camera.eye.elements[0] + f.elements[0] * i;
            let py = g_camera.eye.elements[1] + f.elements[1] * i;
            let pz = g_camera.eye.elements[2] + f.elements[2] * i;
            let mx = Math.floor(px + 16);
            let mz = Math.floor(pz + 16);
            if (mx >= 0 && mx < 32 && mz >= 0 && mz < 32) {
                if (py < (g_map[mx][mz] - 0.75) || py < -0.74) {
                    if (ev.shiftKey) {
                        g_map[mx][mz] = Math.max(0, g_map[mx][mz] - 1);
                    } else {
                        g_map[mx][mz] = Math.min(4, g_map[mx][mz] + 1);
                    }
                    break;
                }
            }
        }
    };
}

function updateAnimation() {
    if (g_animation) {
        g_bodySway = 5 * Math.sin(g_seconds * 1.5);
        g_tail1Osc = 10 * Math.sin(g_seconds * 2);
        g_tail2Osc = 5 * Math.sin(g_seconds * 2);
        g_pincerOsc = 5 * Math.sin(g_seconds * 4);
        g_armOsc = 10 * Math.sin(g_seconds * 1.5);
        g_elbowOsc = 10 * Math.sin(g_seconds * 1.5 + 0.5);
    } else {
        g_bodySway = 0;
        g_tail1Osc = 0;
        g_tail2Osc = 0;
        g_pincerOsc = 0;
        g_armOsc = 0;
        g_elbowOsc = 0;
    }
    if (g_strikeAnimation) {
        let t = g_seconds - g_strikeTime;
        let dur = 0.7;
        if (t < dur) {
            let p = Math.sin((t / dur) * Math.PI);
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
    baseM.setTranslate(
        x - 16,
        -0.65,
        z - 16 + g_bodyLunge
    );
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
    bulb.textureNum = -2;
    bulb.color = [0.0, 0.6, 0.5, 1.0];
    bulb.matrix.set(tailM);
    bulb.matrix.translate(-0.05, -0.02, 0);
    bulb.matrix.scale(0.1, 0.12, 0.12);
    bulb.render();
    let needle = g_shapes.pyramid;
    needle.textureNum = -2;
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
        let topF = g_shapes.pyramid;
        topF.textureNum = -2;
        topF.color = [0.0, 0.35, 0.3, 1.0];
        let tfm = new Matrix4(m);
        tfm.translate(0.3, 0.15, 0.05);
        tfm.rotate(-90, 0, 0, 1);
        topF.matrix.set(tfm);
        topF.matrix.scale(0.08, 0.32, 0.08);
        topF.matrix.translate(-0.5, 0, -0.5);
        topF.render();
        let botF = g_shapes.pyramid;
        botF.textureNum = -2;
        botF.color = [0.0, 0.45, 0.4, 1.0];
        let bfm = new Matrix4(m);
        bfm.translate(0.3, 0.05, 0.05);
        bfm.rotate(g_pincerOsc, 0, 0, 1);
        bfm.rotate(-90, 0, 0, 1);
        botF.matrix.set(bfm);
        botF.matrix.scale(0.08, 0.32, 0.08);
        botF.matrix.translate(-0.5, 0, -0.5);
        botF.render();
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
    let proj = new Matrix4();
    proj.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, proj.elements);
    let view = new Matrix4();
    view.setLookAt(
        g_camera.eye.elements[0],
        g_camera.eye.elements[1],
        g_camera.eye.elements[2],
        g_camera.at.elements[0],
        g_camera.at.elements[1],
        g_camera.at.elements[2],
        g_camera.up.elements[0],
        g_camera.up.elements[1],
        g_camera.up.elements[2]
    );
    gl.uniformMatrix4fv(u_ViewMatrix, false, view.elements);
    let sky = g_shapes.cube;
    sky.textureNum = -2;
    sky.color = [0.55, 0.7, 1.0, 1.0];
    sky.matrix.setTranslate(0, 0, 0);
    sky.matrix.scale(-80, -80, -80);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();
    let floor = g_shapes.cube;
    floor.textureNum = 1;
    floor.matrix.setTranslate(0, -0.75, 0);
    floor.matrix.scale(64, 0, 64);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();
    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z++) {
            for (let h = 0; h < g_map[x][z]; h++) {
                let w = g_shapes.cube;
                w.textureNum = 0;
                w.matrix.setTranslate(x - 16, h - 0.75, z - 16);
                w.render();
            }
        }
    }
    let floatOffset = Math.sin(g_seconds * 3) * 0.15;
    let gem = g_shapes.pyramid;
    gem.textureNum = -2;
    gem.color = [1.0, 0.85, 0.0, 1.0];
    // Top Half
    gem.matrix.setTranslate(g_gemPos.x - 16, 0.2 + floatOffset, g_gemPos.z - 16);
    gem.matrix.rotate(g_seconds * 100, 0, 1, 0);
    gem.matrix.scale(0.3, 0.3, 0.3);
    gem.matrix.translate(-0.5, 0, -0.5);
    gem.render();
    // Bottom Half (Inverted)
    gem.matrix.setTranslate(g_gemPos.x - 16, 0.2 + floatOffset, g_gemPos.z - 16);
    gem.matrix.rotate(g_seconds * 100, 0, 1, 0);
    gem.matrix.rotate(180, 1, 0, 0);
    gem.matrix.scale(0.3, 0.3, 0.3);
    gem.matrix.translate(-0.5, 0, -0.5);
    gem.render();
    drawScorpion(g_gemPos.x, g_gemPos.z);
    if (Math.sqrt(Math.pow(g_camera.eye.elements[0] - (g_gemPos.x - 16), 2) + Math.pow(g_camera.eye.elements[2] - (g_gemPos.z - 16), 2)) < 1.3 && !g_gameWon) {
        g_gameWon = true;
        document.getElementById("game-ui").innerText = "✨ YOU FOUND THE DIAMOND! YOU WIN! ✨";
        document.getElementById("game-ui").style.color = "#00ff00";
    }
    let dur = performance.now() - start;
    document.getElementById("perf").innerText = `ms: ${dur.toFixed(1)} | FPS: ${g_fps}`;
}

function tick() {
    g_seconds = performance.now() / 1000 - g_startTime;
    g_frameCount++;
    let now = performance.now();
    if (now - g_lastFpsTime >= 1000) {
        g_fps = g_frameCount;
        g_frameCount = 0;
        g_lastFpsTime = now;
    }
    updateAnimation();
    renderScene();
    requestAnimationFrame(tick);
}
