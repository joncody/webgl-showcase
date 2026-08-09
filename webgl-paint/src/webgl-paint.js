// Globals
let canvas, gl, a_Position, u_FragColor, u_Size;
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 20.0;
let g_selectedType = 'point';
let g_selectedSegments = 10;
let g_shapesList = [];
let g_rainbowMode = false;

const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }`;

const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
}

function updateActiveBtn(btn) {
    const modes = [
        document.getElementById('squareButton'),
        document.getElementById('triangleButton'),
        document.getElementById('circleButton')
    ];
    modes.forEach(b => b.classList.remove('active-btn'));
    btn.classList.add('active-btn');
}

function handleMouseClick(ev) {
    let x = ev.clientX, y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    let shape;
    if (g_selectedType === 'point') {
        shape = new Point();
    } else if (g_selectedType === 'triangle') {
        shape = new Triangle();
    } else {
        shape = new Circle();
        shape.segments = g_selectedSegments;
    }

    shape.position = [x, y];
    shape.size = g_selectedSize;
    shape.color = g_rainbowMode ? [Math.random(), Math.random(), Math.random(), g_selectedColor[3]] : [...g_selectedColor];

    g_shapesList.push(shape);
}

function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < g_shapesList.length; i += 1) {
        g_shapesList[i].render();
    }
}

// Render loop function
function tick() {
    renderAllShapes();
    requestAnimationFrame(tick);
}

function drawSpecialPicture() {
    g_shapesList = []; // Clear previous shapes

    // Helper to add triangles to list for the persistent loop
    const addT = (verts, color) => g_shapesList.push(new CustomTriangle(verts, color));

    // Scenery Background
    addT([-1.0, -0.4, 0.0, -0.4, -0.5, 0.2], [0.4, 0.3, 0.2, 1.0]);
    addT([0.0, -0.4, 1.0, -0.4, 0.5, 0.1], [0.4, 0.3, 0.2, 1.0]);
    addT([-1.0, -1.0, 1.0, -1.0, 0.0, -0.4], [0.2, 0.2, 0.2, 1.0]);

    // Initials JDC
    addT([-0.6, 0.4, -0.5, 0.4, -0.6, -0.1], [1.0, 0.0, 0.0, 1.0]); // J
    addT([-0.6, -0.1, -0.5, -0.1, -0.7, -0.3], [1.0, 0.0, 0.0, 1.0]);
    addT([-0.1, 0.4, 0.0, 0.4, -0.1, -0.1], [0.0, 1.0, 0.0, 1.0]); // D
    addT([0.0, 0.4, 0.2, 0.15, 0.0, -0.1], [0.0, 1.0, 0.0, 1.0]);
    addT([0.4, 0.4, 0.7, 0.4, 0.4, 0.35], [0.0, 0.5, 1.0, 1.0]);   // C
    addT([0.4, 0.4, 0.45, 0.4, 0.4, -0.1], [0.0, 0.5, 1.0, 1.0]);
    addT([0.4, -0.1, 0.7, -0.1, 0.4, -0.05], [0.0, 0.5, 1.0, 1.0]);

    // Sun
    for (let i = 0; i < 20; i++) {
        let a1 = (i / 20) * Math.PI * 2;
        let a2 = ((i + 1) / 20) * Math.PI * 2;
        addT([0.7, 0.7, 0.7 + Math.cos(a1) * 0.2, 0.7 + Math.sin(a1) * 0.2, 0.7 + Math.cos(a2) * 0.2, 0.7 + Math.sin(a2) * 0.2], [1.0, 0.8, 0.0, 1.0]);
    }
}

function addActionsForHtmlUI() {
    g_selectedColor[0] = document.getElementById('redSlider').value / 255;
    g_selectedColor[1] = document.getElementById('greenSlider').value / 255;
    g_selectedColor[2] = document.getElementById('blueSlider').value / 255;
    g_selectedColor[3] = document.getElementById('alphaSlider').value / 100;
    g_selectedSize = document.getElementById('sizeSlider').value;
    g_selectedSegments = document.getElementById('segmentSlider').value;

    document.getElementById('redSlider').oninput = function () { g_selectedColor[0] = this.value / 255; };
    document.getElementById('greenSlider').oninput = function () { g_selectedColor[1] = this.value / 255; };
    document.getElementById('blueSlider').oninput = function () { g_selectedColor[2] = this.value / 255; };
    document.getElementById('alphaSlider').oninput = function () { g_selectedColor[3] = this.value / 100; };
    document.getElementById('sizeSlider').oninput = function () { g_selectedSize = this.value; };
    document.getElementById('segmentSlider').oninput = function () { g_selectedSegments = this.value; };

    document.getElementById('clearButton').onclick = function () { g_shapesList = []; };
    document.getElementById('squareButton').onclick = function () { g_selectedType = 'point'; updateActiveBtn(this); };
    document.getElementById('triangleButton').onclick = function () { g_selectedType = 'triangle'; updateActiveBtn(this); };
    document.getElementById('circleButton').onclick = function () { g_selectedType = 'circle'; updateActiveBtn(this); };
    document.getElementById('rainbowButton').onclick = function() {
        g_rainbowMode = !g_rainbowMode;
        this.innerText = `Rainbow Mode: ${g_rainbowMode ? "ON" : "OFF"}`;
        this.classList.toggle('rainbow-on', g_rainbowMode);
        // Get the RGB sliders
        const sliders = ['redSlider', 'greenSlider', 'blueSlider'];
        // Disable or enable them based on g_rainbowMode
        sliders.forEach(id => {
            document.getElementById(id).disabled = g_rainbowMode;
        });
    };
    document.getElementById('drawPictureButton').onclick = drawSpecialPicture;
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    canvas.onmousedown = handleMouseClick;
    canvas.onmousemove = function (ev) { if (ev.buttons == 1) handleMouseClick(ev); };
    gl.clearColor(0.05, 0.05, 0.05, 1.0);

    // Start the render loop
    requestAnimationFrame(tick);
}
