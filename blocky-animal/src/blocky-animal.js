// --- SHADERS ---
const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`;

const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`;

// --- GLOBALS ---
let canvas, gl, a_Position, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix;
let g_globalAngleX = 35;
let g_globalAngleY = -20;
let g_globalZoom = 1.0;
// UI State (Manual Sliders)
let g_animation = true;
let g_tail1Angle = 0;
let g_tail2Angle = 0;
let g_armAngle = 0;
let g_elbowAngle = 0;
let g_pincerAngle = 0;
// Animation Offsets (Oscillations)
let g_bodyLunge = 0;
let g_bodySway = 0;
let g_tail1Osc = 0;
let g_tail2Osc = 0;
let g_pincerOsc = 0;
let g_armOsc = 0;
let g_elbowOsc = 0;
let g_strikeAnimation = false;
let g_strikeTime = 0;
// Time & Performance
let g_seconds = 0;
let g_startTime = performance.now() / 1000;
let g_lastFpsTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;
let g_shapes = {};

// --- INITIALIZATION ---

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) {
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
}

function updateAnimationAngles() {
    // Standard background animations
    if (g_animation) {
        g_bodySway = 5 * Math.sin(g_seconds * 1.5);
        g_tail1Osc = 10 * Math.sin(g_seconds * 2);
        g_tail2Osc = 5 * Math.sin(g_seconds * 2);
        g_pincerOsc = 5 * Math.sin(g_seconds * 4);
        g_armOsc = 10 * Math.sin(g_seconds * 1.5);
        g_elbowOsc = 10 * Math.sin(g_seconds * 1.5 + 0.5);
    } else {
        g_bodySway = g_tail1Osc = g_tail2Osc = g_pincerOsc = g_armOsc = g_elbowOsc = 0;
    }
    // POKE ANIMATION: The Strike
    if (g_strikeAnimation) {
        let t = g_seconds - g_strikeTime; // Time since click
        let duration = 0.7; // Fast strike duration
        if (t < duration) {
                // A "snap" curve: fast lunge forward, slower return
                // We use a high-frequency sine partial to create a whip effect
                let strikePower = Math.sin((t / duration) * Math.PI);
                g_bodyLunge = -0.1 * strikePower; // Lunge forward
                g_tail1Osc = -110 * strikePower; // Whip tail forwaard
                g_tail2Osc = -5 * strikePower; // Whip tail forwaard
                g_pincerOsc = 35 * strikePower; // Snap pincers
                g_armOsc = 45 * strikePower; // Pull arms forward/inward
        } else {
                g_strikeAnimation = false;
                g_bodyLunge = 0;
        }
    }
}

// --- RENDERING ---

function drawScorpion() {
    // --- BASE COORDINATES ---
    let bodyMatrix = new Matrix4();
    bodyMatrix.setTranslate(0, -0.1, g_bodyLunge);
    // Apply Body Sway (Side-to-side breathing)
    bodyMatrix.rotate(g_bodySway, 0, 1, 0);
    // --- SEGMENTED BODY (Mesosoma) ---
    for (let i = 0; i < 4; i++) {
        let segment = g_shapes.cube;
        segment.color = [0.0, 0.3 + (i * 0.05), 0.25 + (i * 0.05), 1.0];
        segment.matrix.set(bodyMatrix);
        let scale = 1.0 - (i * 0.1);
        segment.matrix.translate(-0.15 * scale, 0, i * 0.12 - 0.2);
        segment.matrix.scale(0.3 * scale, 0.18 * scale, 0.15);
        segment.render();
    }
    // --- HEAD (Prosoma) ---
    let head = g_shapes.cube;
    head.color = [0.0, 0.4, 0.35, 1.0];
    head.matrix.set(bodyMatrix);
    head.matrix.translate(-0.2, -0.02, -0.38);
    head.matrix.scale(0.4, 0.22, 0.25);
    head.render();
    // --- THE TAIL (Metasoma) ---
    let tailCoords = new Matrix4(bodyMatrix);
    tailCoords.translate(0, 0.04, 0.3);
    for (let i = 0; i < 5; i++) {
        let tSeg = g_shapes.cube;
        tSeg.color = [0.0, 0.3 + (i * 0.05), 0.3, 1.0];
        // Joint logic: Slider + Oscillation
        let angle = (i === 0) ? (parseFloat(g_tail1Angle) + g_tail1Osc) : (parseFloat(g_tail2Angle) - 15 + g_tail2Osc);
        tailCoords.rotate(angle, 1, 0, 0);
        tSeg.matrix.set(tailCoords);
        tSeg.matrix.translate(-0.04, 0, 0);
        tSeg.matrix.scale(0.08, 0.08, 0.18);
        tSeg.render();
        tailCoords.translate(0, 0, 0.18);
        tailCoords.scale(0.92, 0.92, 1.0);
    }
    // --- STINGER ---
    let bulb = g_shapes.cube;
    bulb.color = [0.0, 0.6, 0.5, 1.0];
    bulb.matrix.set(tailCoords);
    bulb.matrix.translate(-0.05, -0.02, 0);
    bulb.matrix.scale(0.1, 0.12, 0.12);
    bulb.render();
    let needle = g_shapes.pyramid;
    needle.color = [0.8, 0.1, 0.1, 1.0];
    needle.matrix.set(tailCoords);
    needle.matrix.translate(-0.02, 0.1, 0);
    needle.matrix.scale(0.04, 0.25, 0.04);
    needle.render();

    function drawArm(isLeft) {
        let side = isLeft ? -1 : 1;
        let m = new Matrix4(bodyMatrix);
        m.scale(side, 1, 1);
        // Calculate total additive angles
        let totalArmBase = parseFloat(g_armAngle) + g_armOsc;
        let totalElbow = 110 + parseFloat(g_elbowAngle) + g_elbowOsc - (totalArmBase * 0.6);
        let totalPincer = parseFloat(g_pincerAngle) + g_pincerOsc;
        // Segment 1: Upper Arm
        m.translate(0.15, 0.05, -0.3);
        m.rotate(-5 + totalArmBase, 0, 1, 0);
        let armPart = g_shapes.cube;
        armPart.color = [0.0, 0.3, 0.25, 1.0];
        armPart.matrix.set(m);
        armPart.matrix.scale(0.3, 0.08, 0.08);
        armPart.render();
        // Segment 2: Lower Arm (Crescent Elbow)
        m.translate(0.3, 0, 0);
        m.rotate(totalElbow, 0, 1, 0);
        armPart.matrix.set(m);
        armPart.matrix.scale(0.25, 0.08, 0.08);
        armPart.render();
        // Segment 3: Pincer Bulb
        m.translate(0.25, -0.06, 0.0);
        let bulb = g_shapes.cube;
        bulb.color = [0.0, 0.5, 0.4, 1.0];
        bulb.matrix.set(m);
        bulb.matrix.scale(0.3, 0.2, 0.1);
        bulb.render();
        // --- FINGERS ---
        // Top Finger (Fixed)
        let topF = g_shapes.pyramid;
        topF.color = [0.0, 0.35, 0.3, 1.0];
        let tfm = new Matrix4(m);
        tfm.translate(0.3, 0.15, 0.05);
        tfm.rotate(-90, 0, 0, 1);
        topF.matrix.set(tfm);
        topF.matrix.scale(0.08, 0.32, 0.08);
        topF.matrix.translate(-0.5, 0, -0.5);
        topF.render();
        // Bottom Finger (Movable Snap)
        let botF = g_shapes.pyramid;
        botF.color = [0.0, 0.45, 0.4, 1.0];
        let bfm = new Matrix4(m);
        bfm.translate(0.3, 0.05, 0.05);
        bfm.rotate(totalPincer, 0, 0, 1);
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
        let scale = 1.0 - (index * 0.1);
        let zPos = index * 0.12 - 0.12;
        let walk = g_animation ? 15 * Math.sin(g_seconds * 5 + index) : 0;
        let m = new Matrix4(bodyMatrix);
        m.translate(side * 0.15 * scale, 0.05, zPos);
        // Joint 1: Hip
        m.rotate(side * index * -20 + walk, 0, 1, 0);
        m.rotate(side * 45, 0, 0, 1);
        let legPart = g_shapes.cube;
        legPart.color = [0.0, 0.2 + (index * 0.02), 0.15 + (index * 0.02), 1.0];
        legPart.matrix.set(m);
        legPart.matrix.scale(side * 0.2, 0.03, 0.03);
        legPart.render();
        // Joint 2: Knee
        m.translate(side * 0.2, 0, 0);
        m.rotate(side, 0, 1, 0);
        m.rotate(side * -105, 0, 0, 1);
        legPart.matrix.set(m);
        legPart.matrix.scale(side * 0.25, 0.03, 0.03);
        legPart.render();
        // Joint 3: Foot
        m.translate(side * 0.25, 0, 0);
        m.rotate(side * 60, 0, 0, 1);
        legPart.matrix.set(m);
        legPart.matrix.scale(side * 0.1, 0.02, 0.02);
        legPart.render();
    }
    for (let i = 0; i < 4; i++) {
        drawLeg(i, true);
        drawLeg(i, false);
    }
}

// --- CORE LOOPS ---

function tick() {
    g_seconds = performance.now() / 1000 - g_startTime;
    updateAnimationAngles();
    renderScene();
    g_frameCount++;
    let now = performance.now();
    if (now - g_lastFpsTime >= 1000) {
        g_fps = g_frameCount;
        g_frameCount = 0;
        g_lastFpsTime = now;
    }
    requestAnimationFrame(tick);
}

function renderScene() {
    let startTime = performance.now();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Apply Zoom (Scale) and Rotation to the Global Matrix
    let globalRotateMatrix = new Matrix4();
    globalRotateMatrix.scale(g_globalZoom, g_globalZoom, g_globalZoom);
    globalRotateMatrix.rotate(g_globalAngleY, 1, 0, 0);
    globalRotateMatrix.rotate(g_globalAngleX, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);
    drawScorpion();
    // Performance calculation
    let duration = performance.now() - startTime;
    document.getElementById('perf').innerText = `ms: ${duration.toFixed(1)} FPS: ${g_fps}`;
}

function addActionsForHtmlUI() {
    // Animation Toggle with Visual Feedback
    document.getElementById('animOn').onclick = function() {
        g_animation = true;
        this.classList.add('active-btn');
        document.getElementById('animOff').classList.remove('active-btn');
    };
    document.getElementById('animOff').onclick = function() {
        g_animation = false;
        this.classList.add('active-btn');
        document.getElementById('animOn').classList.remove('active-btn');
    };
    // Zoom slider
    document.getElementById('zoomSlider').oninput = function() {
        g_globalZoom = this.value / 100.0;
        renderScene();
    };
    // Global Rotation slider (syncs with mouse drag)
    document.getElementById('angleSlider').oninput = function() {
        g_globalAngleX = this.value;
        renderScene();
    };
    // Joint sliders
    document.getElementById('tail1').oninput = function() { g_tail1Angle = this.value; renderScene(); };
    document.getElementById('tail2').oninput = function() { g_tail2Angle = this.value; renderScene(); };
    document.getElementById('armBase').oninput = function() { g_armAngle = parseFloat(this.value); renderScene(); };
    document.getElementById('armElbow').oninput = function() { g_elbowAngle = parseFloat(this.value); renderScene(); };
    document.getElementById('pincer').oninput = function() { g_pincerAngle = this.value; renderScene(); };
    // Mouse Wheel Zoom
    canvas.onwheel = function(ev) {
        ev.preventDefault(); // Prevent page from scrolling
        let zoomAmount = ev.deltaY * -0.001; // Negative delta means scroll up
        g_globalZoom = Math.min(Math.max(g_globalZoom + zoomAmount, 0.1), 2.0); // Clamp zoom
        // Sync slider with wheel
        document.getElementById('zoomSlider').value = g_globalZoom * 100;
        renderScene();
    };
    // Mouse Interaction
    canvas.onmousedown = (ev) => {
        if (ev.shiftKey) {
            g_strikeAnimation = true;
            g_strikeTime = g_seconds;
        }
    };
    canvas.onmousemove = (ev) => {
        if (ev.buttons === 1) {
            g_globalAngleX -= ev.movementX * 0.4;
            g_globalAngleY -= ev.movementY * 0.4;
            // Update slider to match mouse rotation
            document.getElementById('angleSlider').value = g_globalAngleX;
        }
    };
}

// --- ANIMATION ENGINE ---

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    g_shapes.cube = new Cube();
    g_shapes.pyramid = new Pyramid();
    addActionsForHtmlUI();
    gl.clearColor(0.86, 0.84, 0.82, 1.0);
    requestAnimationFrame(tick);
}
