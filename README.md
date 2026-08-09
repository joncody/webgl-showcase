
# WebGL & 3D Computer Graphics Showcase

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-4fc3f7?style=for-the-badge&logo=github)](https://joncody.github.io/webgl-showcase/)

An interactive collection of real-time 3D web graphics projects implemented in raw WebGL, custom GLSL shader programs, and vanilla JavaScript.

### 🚀 [Launch the Live Interactive Showcase Page](https://joncody.github.io/webgl-showcase/)

---

## 🛠 Tech Stack & Computer Graphics Concepts

* **Languages & APIs:** JavaScript (ES6+), HTML5, WebGL API, GLSL (OpenGL Shading Language)
* **Core Concepts Implemented:**
  * Custom Vertex and Fragment Shader Pipeline
  * Matrix Math & Transformations (Translation, Rotation, Scaling, Model-View-Projection)
  * Lighting Models (Ambient, Diffuse, Specular / Phong & Blinn-Phong Shading)
  * Texture Mapping, Normal Vectors, and UV Coordinate Mapping
  * Camera Systems (Perspective & Orthographic)
  * Hierarchical 3D Joint Modeling & Keyframe Animation
  * OBJ Model Loading & Scene Composition

---

## 💻 Projects Included

### 1. [The Reliquary of Hanzo](https://joncody.github.io/webgl-showcase/reliquary-of-hanzo/src/index.html)
A complex interactive 3D scene featuring custom OBJ geometry loading, atmospheric lighting, dynamic camera navigation, and interactive object triggers.

### 2. [Full Shader Lighting Engine](https://joncody.github.io/webgl-showcase/full-lighting/src/index.html)
Real-time per-pixel specular and diffuse lighting simulation implemented in custom GLSL fragment shaders with adjustable light source positions, ambient intensities, and material specular parameters.

### 3. [3D Virtual World](https://joncody.github.io/webgl-showcase/virtual-world/src/index.html)
A navigable 3D terrain environment featuring first-person perspective camera controls (WASD + mouse look), wall collision detection, and texture-mapped block geometry.

### 4. [Blocky Animal Animation](https://joncody.github.io/webgl-showcase/blocky-animal/src/index.html)
An interactive 3D character model demonstrating hierarchical matrix transformations with connected joints, slider-based rotation controls, and automated keyframe animation cycles.

### 5. [WebGL Paint App](https://joncody.github.io/webgl-showcase/webgl-paint/src/index.html)
A custom 2D painting application utilizing WebGL buffer objects to render user-drawn points, brush strokes, and geometric shapes with customizable colors and sizes.

### 6. [2D Vector Library](https://joncody.github.io/webgl-showcase/vector-library/src/index.html)
A foundational vector mathematics library built from scratch in JavaScript supporting 2D vector addition, scaling, magnitude calculation, dot products, and cross products.

---

## 💻 Local Setup & Development

To run these projects locally without relying on GitHub Pages:

1. Clone the repository:
   ```bash
   git clone https://github.com/joncody/webgl-showcase.git
   cd webgl-showcase
   ```

2. Start a local HTTP server (required for loading local textures/shaders via WebGL):
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and navigate to `http://localhost:8000`.

---

## 📄 License

See [LICENSE](./LICENSE) for details.

---

<p align="center">
  Developed by <strong>Jonathan Cody</strong><br>
  University of California, Santa Cruz (CSE 160: Introduction to Computer Graphics)
</p>
