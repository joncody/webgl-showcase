class Pyramid {
    constructor() {
        this.type = "pyramid";
        this.color = [
            1.0,
            1.0,
            1.0,
            1.0
        ];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        if (Pyramid.viewBuffer === null) {
            Pyramid.initBuffer();
        }
    }

    static initBuffer() {
        // 5 faces (4 sides + base) = 6 triangles = 18 vertices
        Pyramid.vertices = new Float32Array([
            // Front face
            0.0, 0.0, 0.0,  0.5, 1.0, 0.5,  1.0, 0.0, 0.0,
            // Right face
            1.0, 0.0, 0.0,  0.5, 1.0, 0.5,  1.0, 0.0, 1.0,
            // Back face
            1.0, 0.0, 1.0,  0.5, 1.0, 0.5,  0.0, 0.0, 1.0,
            // Left face
            0.0, 0.0, 1.0,  0.5, 1.0, 0.5,  0.0, 0.0, 0.0,
            // Base
            0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0,
            0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  0.0, 0.0, 1.0
        ]);
        Pyramid.uvs = new Float32Array([
            0, 0,  0.5, 1,  1, 0,
            0, 0,  0.5, 1,  1, 0,
            0, 0,  0.5, 1,  1, 0,
            0, 0,  0.5, 1,  1, 0,
            0, 0,  1, 0,    1, 1,
            0, 0,  1, 1,    0, 1
        ]);
        Pyramid.viewBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.viewBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Pyramid.vertices, gl.STATIC_DRAW);
        Pyramid.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Pyramid.uvs, gl.STATIC_DRAW);
    }

    render() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(
            u_FragColor,
            this.color[0],
            this.color[1],
            this.color[2],
            this.color[3]
        );
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.viewBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
        gl.drawArrays(gl.TRIANGLES, 0, 18);
    }
}
Pyramid.viewBuffer = null;
Pyramid.uvBuffer = null;
