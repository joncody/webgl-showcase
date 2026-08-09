class Pyramid {
    constructor() {
        this.type = 'pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        if (Pyramid.viewBuffer === null) {
            Pyramid.initBuffer();
        }
    }

    static initBuffer() {
        Pyramid.vertices = new Float32Array([
            0,0,0,  0.5,1,0.5,  1,0,0, // Front
            1,0,0,  0.5,1,0.5,  1,0,1, // Right
            1,0,1,  0.5,1,0.5,  0,0,1, // Back
            0,0,1,  0.5,1,0.5,  0,0,0, // Left
            0,0,0,  1,0,0,  1,0,1,     // Base 1
            0,0,0,  1,0,1,  0,0,1      // Base 2
        ]);
        Pyramid.viewBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.viewBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Pyramid.vertices, gl.STATIC_DRAW);
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.viewBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, 18);
    }
}
Pyramid.viewBuffer = null;
Pyramid.vertices = null;
