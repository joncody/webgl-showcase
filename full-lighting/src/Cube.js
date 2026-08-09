class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        if (Cube.viewBuffer === null) {
            Cube.initBuffer();
        }
    }

    static initBuffer() {
        let v = new Float32Array([
            0,0,0, 1,1,0, 0,1,0,  0,0,0, 1,0,0, 1,1,0, // Front
            0,1,0, 0,1,1, 1,1,1,  0,1,0, 1,1,1, 1,1,0, // Top
            0,0,1, 1,1,1, 0,1,1,  0,0,1, 1,0,1, 1,1,1, // Back
            0,0,0, 0,0,1, 1,0,1,  0,0,0, 1,0,1, 1,0,0, // Bottom
            0,0,0, 0,1,0, 0,1,1,  0,0,0, 0,1,1, 0,0,1, // Left
            1,0,0, 1,1,1, 1,1,0,  1,0,0, 1,0,1, 1,1,1  // Right
        ]);
        Cube.viewBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.viewBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);

        let n = new Float32Array([
            0,0,-1, 0,0,-1, 0,0,-1,  0,0,-1, 0,0,-1, 0,0,-1, // Front
            0,1,0,  0,1,0,  0,1,0,   0,1,0,  0,1,0,  0,1,0,  // Top
            0,0,1,  0,0,1,  0,0,1,   0,0,1,  0,0,1,  0,0,1,  // Back
            0,-1,0, 0,-1,0, 0,-1,0,  0,-1,0, 0,-1,0, 0,-1,0, // Bottom
            -1,0,0, -1,0,0, -1,0,0,  -1,0,0, -1,0,0, -1,0,0, // Left
            1,0,0,  1,0,0,  1,0,0,   1,0,0,  1,0,0,  1,0,0   // Right
        ]);
        Cube.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, n, gl.STATIC_DRAW);

        let uv = new Float32Array([
            0,0, 1,1, 0,1,  0,0, 1,0, 1,1,
            0,0, 0,1, 1,1,  0,0, 1,1, 1,0,
            1,0, 0,1, 1,1,  1,0, 0,0, 0,1,
            0,1, 0,0, 1,0,  0,1, 1,0, 1,1,
            1,0, 1,1, 0,1,  1,0, 0,1, 0,0,
            0,0, 1,1, 0,1,  0,0, 1,0, 1,1
        ]);
        Cube.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    }

    render() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        let nm = new Matrix4();
        nm.setInverseOf(this.matrix).transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.viewBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}
Cube.viewBuffer = null;
Cube.normalBuffer = null;
Cube.uvBuffer = null;
