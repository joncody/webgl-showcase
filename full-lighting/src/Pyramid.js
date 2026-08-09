class Pyramid {
    constructor() {
        this.type = "pyramid";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        if (Pyramid.viewBuffer === null) {
            Pyramid.initBuffer();
        }
    }

    static initBuffer() {
        Pyramid.vertices = new Float32Array([
            0.0, 0.0, 0.0,  0.5, 1.0, 0.5,  1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,  0.5, 1.0, 0.5,  1.0, 0.0, 1.0,
            1.0, 0.0, 1.0,  0.5, 1.0, 0.5,  0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,  0.5, 1.0, 0.5,  0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0,
            0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  0.0, 0.0, 1.0
        ]);
        Pyramid.normals = new Float32Array([
            0.0, 0.44, -0.89,  0.0, 0.44, -0.89,  0.0, 0.44, -0.89,
            0.89, 0.44, 0.0,   0.89, 0.44, 0.0,   0.89, 0.44, 0.0,
            0.0, 0.44, 0.89,   0.0, 0.44, 0.89,   0.0, 0.44, 0.89,
            -0.89, 0.44, 0.0,  -0.89, 0.44, 0.0,  -0.89, 0.44, 0.0,
            0.0, -1.0, 0.0,    0.0, -1.0, 0.0,    0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,    0.0, -1.0, 0.0,    0.0, -1.0, 0.0
        ]);
        Pyramid.viewBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.viewBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Pyramid.vertices, gl.STATIC_DRAW);
        Pyramid.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Pyramid.normals, gl.STATIC_DRAW);
        Pyramid.uvs = new Float32Array([
            0,0, 0.5,1, 1,0,  0,0, 0.5,1, 1,0,
            0,0, 0.5,1, 1,0,  0,0, 0.5,1, 1,0,
            0,0, 1,0, 1,1,    0,0, 1,1, 0,1
        ]);
        Pyramid.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Pyramid.uvs, gl.STATIC_DRAW);
    }

    render() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        let nm = new Matrix4(); nm.setInverseOf(this.matrix); nm.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.viewBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
        gl.drawArrays(gl.TRIANGLES, 0, 18);
    }
}
Pyramid.viewBuffer = null;
Pyramid.normalBuffer = null;
Pyramid.uvBuffer = null;
