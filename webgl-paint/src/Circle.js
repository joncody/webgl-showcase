class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10;

        // Lab 2 Optimizations
        this.buffer = null;
        this.vertices = null;
    }

    generateVertices() {
        let [x, y] = this.position;
        let d = this.size / 200.0;
        let v = [];
        let step = 360 / this.segments;
        for (let i = 0; i < 360; i += step) {
            let a1 = i * Math.PI / 180;
            let a2 = (i + step) * Math.PI / 180;
            // Add center and two edge points for each triangle segment
            v.push(x, y, x + Math.cos(a1) * d, y + Math.sin(a1) * d, x + Math.cos(a2) * d, y + Math.sin(a2) * d);
        }
        this.vertices = new Float32Array(v);
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

        if (this.vertices === null) {
            this.generateVertices();
        }
        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2);
    }
}
