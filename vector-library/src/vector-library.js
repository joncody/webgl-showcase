let canvas;
let ctx;

function main() {
    canvas = document.getElementById("cnv1");
    if (!canvas) {
        console.log("Failed to output canvas element");
        return;
    }
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    // Start from center (200, 200)
    ctx.moveTo(200, 200);
    // Scale coordinates by 20 and invert Y because canvas grows downward
    ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);
    ctx.stroke();
}

function handleDrawEvent() {
    // Clear and Redraw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Parse inputs as floats (crucial for math!)
    let x1 = parseFloat(document.getElementById("v1x-id").value) || 0;
    let y1 = parseFloat(document.getElementById("v1y-id").value) || 0;
    let x2 = parseFloat(document.getElementById("v2x-id").value) || 0;
    let y2 = parseFloat(document.getElementById("v2y-id").value) || 0;
    let v1 = new Vector3([x1, y1, 0]);
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    // Reset canvas and draw base vectors
    handleDrawEvent();
    // Read inputs
    let x1 = parseFloat(document.getElementById("v1x-id").value) || 0;
    let y1 = parseFloat(document.getElementById("v1y-id").value) || 0;
    let x2 = parseFloat(document.getElementById("v2x-id").value) || 0;
    let y2 = parseFloat(document.getElementById("v2y-id").value) || 0;
    // We create new instances so we don't accidentally modify the red/blue lines
    let v1 = new Vector3([x1, y1, 0]);
    let v2 = new Vector3([x2, y2, 0]);
    let op = document.getElementById("operation-id").value;
    let scalar = parseFloat(document.getElementById("scalar-id").value) || 1;
    if (op === "add") {
        let v3 = v1.add(v2);
        drawVector(v3, "green");
    } else if (op === "sub") {
        let v3 = v1.sub(v2);
        drawVector(v3, "green");
    } else if (op === "mul") {
        v1.mul(scalar);
        v2.mul(scalar);
        drawVector(v1, "green");
        drawVector(v2, "green");
    } else if (op === "div") {
        v1.div(scalar);
        v2.div(scalar);
        drawVector(v1, "green");
        drawVector(v2, "green");
    } else if (op === "mag") {
        console.log("Magnitude V1: " + v1.magnitude());
        console.log("Magnitude V2: " + v2.magnitude());
    } else if (op === "normal") {
        drawVector(v1.normalize(), "green");
        drawVector(v2.normalize(), "green");
    } else if (op === "between") {
        angleBetween(v1, v2);
    } else if (op === "area") {
        areaTriangle(v1, v2);
    }
}

function angleBetween(v1, v2) {
    let d = Vector3.dot(v1, v2);
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();
    // dot(v1, v2) = ||v1|| * ||v2|| * cos(alpha)
    let angle = Math.acos(d / (m1 * m2));
    angle = angle * (180 / Math.PI); // Convert to degrees
    console.log("Angle:", angle.toFixed(2));
}

function areaTriangle(v1, v2) {
    // Magnitude of cross product is the area of the parallelogram
    let v3 = Vector3.cross(v1, v2);
    let area = v3.magnitude() / 2;
    console.log("Area of the triangle:", area);
}
