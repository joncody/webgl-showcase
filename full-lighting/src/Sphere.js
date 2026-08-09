class Sphere {
    constructor() {
        this.type = "sphere";
        this.color = [1, 1, 1, 1];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.verts = []; this.norms = []; this.uvs = []; this.indices = [];
        this.initGeometry();
    }

    initGeometry() {
        let d = 20;
        for (let i = 0; i <= d; i++) {
            let lat = Math.PI * i / d;
            for (let j = 0; j <= d; j++) {
                let lon = 2 * Math.PI * j / d;
                let x = Math.cos(lon) * Math.sin(lat);
                let y = Math.cos(lat);
                let z = Math.sin(lon) * Math.sin(lat);
                this.verts.push(x, y, z);
                this.norms.push(x, y, z);
                this.uvs.push(j / d, i / d);
            }
        }
        for (let i = 0; i < d; i++) {
            for (let j = 0; j < d; j++) {
                let p1 = i * (d + 1) + j, p2 = p1 + (d + 1);
                this.indices.push(p1, p2, p1 + 1);
                this.indices.push(p1 + 1, p2, p2 + 1);
            }
        }
        this.vBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
        this.nBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.norms), gl.STATIC_DRAW);
        this.uBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.uBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
        this.iBuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    render() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        let nm = new Matrix4(); nm.setInverseOf(this.matrix); nm.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuf); gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(a_Position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuf); gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(a_Normal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uBuf); gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(a_UV);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf); gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
