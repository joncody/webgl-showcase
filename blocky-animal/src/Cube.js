class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        // Static variables to share one buffer across all Cube instances
        if (Cube.viewBuffer === null) {
            Cube.initBuffer();
        }
    }

    static initBuffer() {
        Cube.vertices = new Float32Array([
            0,0,0, 1,1,0, 0,1,0,  0,0,0, 1,0,0, 1,1,0, // Front
            0,1,0, 0,1,1, 1,1,1,  0,1,0, 1,1,1, 1,1,0, // Top
            0,0,1, 0,1,1, 1,1,1,  0,0,1, 1,1,1, 1,0,1, // Back
            0,0,0, 0,0,1, 1,0,1,  0,0,0, 1,0,1, 1,0,0, // Bottom
            0,0,0, 0,1,0, 0,1,1,  0,0,0, 0,1,1, 0,0,1, // Left
            1,0,0, 1,1,0, 1,1,1,  1,0,0, 1,1,1, 1,0,1  // Right
        ]);
        Cube.viewBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.viewBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Cube.vertices, gl.STATIC_DRAW);
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Bind the shared buffer (extremely fast)
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.viewBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Draw the 36 vertices
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}
// Initialize static properties
Cube.viewBuffer = null;
Cube.vertices = null;
