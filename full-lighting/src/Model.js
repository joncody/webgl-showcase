/**
 * Model.js
 * Handles asynchronous loading, parsing, and rendering of OBJ files.
 */
class Model {
    constructor(gl, filePath) {
        this.filePath = filePath;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.isFullyLoaded = false;

        // WebGL Buffer References
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.numVertices = 0;

        // Kick off asynchronous loading
        this.getFileContent(gl);
    }

    /**
     * Fetches the raw text from the .obj file.
     */
    async getFileContent(gl) {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${this.filePath}`);
            }
            const text = await response.text();
            this.parseModel(gl, text);
        } catch (e) {
            console.error("OBJ Loader Error:", e);
        }
    }

    /**
     * Parses OBJ text and initializes WebGL buffers.
     */
    parseModel(gl, fileContent) {
        const lines = fileContent.split(/\r?\n/);
        const allVertices = [];
        const allNormals = [];
        const unpackedVerts = [];
        const unpackedNormals = [];

        for (let line of lines) {
            const tokens = line.trim().split(/\s+/);
            const type = tokens[0];

            if (type === "v") {
                // Geometric vertices
                allVertices.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            } else if (type === "vn") {
                // Vertex normals
                allNormals.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            } else if (type === "f") {
                // Face indices (assuming triangles)
                for (let i = 1; i <= 3; i++) {
                    const parts = tokens[i].split("/");

                    // Vertex index (1-based in OBJ)
                    const vIdx = (parseInt(parts[0]) - 1) * 3;
                    unpackedVerts.push(allVertices[vIdx], allVertices[vIdx + 1], allVertices[vIdx + 2]);

                    // Normal index handling (handles v//n, v/t/n, or no normals)
                    let nIdx = -1;
                    if (parts.length === 3) {
                        nIdx = (parseInt(parts[2]) - 1) * 3;
                    } else if (parts.length === 2 && tokens[i].includes("//")) {
                        nIdx = (parseInt(parts[1]) - 1) * 3;
                    }

                    if (nIdx >= 0 && nIdx < allNormals.length) {
                        unpackedNormals.push(allNormals[nIdx], allNormals[nIdx + 1], allNormals[nIdx + 2]);
                    } else {
                        // Fallback normal if model is missing normal data
                        unpackedNormals.push(0, 1, 0);
                    }
                }
            }
        }

        this.numVertices = unpackedVerts.length / 3;

        // Create and fill Vertex Buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedVerts), gl.STATIC_DRAW);

        // Create and fill Normal Buffer
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedNormals), gl.STATIC_DRAW);

        this.isFullyLoaded = true;
    }

    /**
     * Sets uniforms and attributes, then draws the model.
     */
    render(gl) {
        if (!this.isFullyLoaded) {
            return;
        }

        // 1. Uniforms
        // OBJ models in this assignment use color (-2), not textures
        gl.uniform1i(u_whichTexture, -2);
        gl.uniform4fv(u_FragColor, this.color);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Normal Matrix (Transpose of Inverse)
        const nm = new Matrix4();
        nm.setInverseOf(this.matrix).transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);

        // 2. Attributes
        // Position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Normal
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        // 3. Firefox Fix: Disable attributes not present in this model
        // If left enabled, Firefox will try to read the Cube's small UV buffer
        // for the OBJ's large vertex count, causing an out-of-bounds error.
        gl.disableVertexAttribArray(a_UV);

        // 4. Draw
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }
}
