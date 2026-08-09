# Lighting
**Jon Cody** - jdcody@ucsc.edu

## Notes:
This project upgrades the first-person voxel world from virtual-world into a sophisticated lighting engine featuring **Phong Shading**, dynamic **Point Lights**, a directed **Spotlight**, and support for high-detail **OBJ models**.

**Key Technical Features:**
*   **Phong Shading Model:** Implemented Ambient, Diffuse, and Specular lighting in the Fragment shader for pixel-perfect specular highlights.
*   **Normal Matrix Mathematics:** Correctly implemented the Normal Matrix (Transpose of the Inverse of the Model Matrix) to ensure lighting remains consistent regardless of object rotation or non-uniform scaling.
*   **Dynamic Point Light:** Features a Dynamic Point Light that orbits the scene with adjustable position, toggleable animation, and real-time color picking.
*   **Directed Spotlight:** Implemented a spotlight that originates from the camera position and follows the player's view direction.
*   **Complex Model Parsing:** A custom asynchronous OBJ loader (`Model.js`) parses vertex and normal data for complex geometries, supporting the Utah Teapot, Stanford Bunny, Stanford Dragon, and more.

## Awesomeness (Creativity):
1.  **The Circular Gallery Arrangement:** Instead of static placement, I implemented a uniform circular gallery. All 7 interactive items (Bunny, Teapot, Benchy, Trumpet, Dragon, Red Sphere, and Pink Diamond) are spaced exactly 51.4 degrees apart around the Scorpion using trigonometry.
2.  **Visual Polish & Calibrated Hovering:** Every object is calibrated to hover exactly "one foot" (approx. 0.3 units) above the textured floor. Each OBJ model features a unique color scheme (e.g., Orange Benchy, Purple Bunny, Gold Trumpet) to specifically demonstrate how different materials react to specular highlights.
3.  **Centered Animal Focus:** The hierarchical Scorpion from blocky-animal is positioned at the origin as the centerpiece, featuring full animation (sway, tail oscillation, and strike) that reacts realistically to the orbiting light.
4.  **Lighting Visualization Mode:** Included a "Normal Visualization" toggle that bypasses colors and textures to render the raw normal vectors as RGB colors, serving as a debugging tool and a stylistic rendering mode.
5.  **UI Sectioning:** Restored the high-quality UI sections from blocky-animal, providing a clean, dark-themed control panel with active-state feedback on all buttons.

## Controls:
*   **Movement:** 
    *   `W` / `Up Arrow`: Move Forward
    *   `S` / `Down Arrow`: Move Backward
    *   `A`: Strafe Left
    *   `D`: Strafe Right
    *   `Space`: Fly Up
    *   `Z`: Fly Down
*   **Camera:** 
    *   `Q` / `Left Arrow`: Pan Left
    *   `E` / `Right Arrow`: Pan Right
    *   **Mouse Drag**: First-Person Look
*   **Lighting Toggles:** 
    *   **Point Light**: Toggle the main orbiting light.
    *   **Spotlight**: Toggle the camera-mounted directed light.
    *   **Normal Viz**: Toggle viewing the Normal vectors as colors.
    *   **Animate Light**: Toggle the automatic orbiting movement.
*   **Actions:** 
    *   `X`: Trigger Scorpion "Strike" animation.

## Directory Structure:
```text
.
├── lib
│   ├── cuon-matrix-cse160.js
│   ├── cuon-utils.js
│   ├── webgl-debug.js
│   └── webgl-utils.js
├── src
│   ├── full-lighting.html
│   ├── full-lighting.js
│   ├── full-lighting.css
│   ├── Camera.js
│   ├── Cube.js
│   ├── Pyramid.js
│   ├── Sphere.js        <-- Smooth geometry for lighting check
│   ├── Model.js         <-- Asynchronous OBJ Loader
│   ├── grass.png
│   ├── dirt.png
│   ├── benchy.obj       <-- 3D Models
│   ├── bunny.obj
│   ├── dragon.obj
│   ├── teapot.obj
│   └── trumpet.obj
└── README.md
```

## How to Run:
1.  Navigate to the `src` directory.
2.  **Crucial Note:** Due to browser security restrictions regarding `fetch()`, you **must** use a local server to run this code (e.g., VS Code "Live Server" or `python3 -m http.server`). Opening the `.html` file directly via `file://` will prevent the OBJ models and textures from loading.
3.  Use the UI sliders to change the light's color and position to see the Phong shading in action.

## Features Implemented (Rubric Checklist):
- [x] **Sphere Class:** Smooth sphere implemented to demonstrate highlight accuracy.
- [x] **Normals:** Buffer attributes created; Normals defined for Cube, Pyramid, Sphere, and OBJs.
- [x] **Point Light:** Dynamic light with adjustable position, color, and Orbit animation.
- [x] **Lighting Marker:** Small cube renders at the light source position.
- [x] **Phong Shading:** Ambient + Diffuse + Specular calculated in Fragment Shader.
- [x] **Normal Matrix:** Transpose-Inverse math implemented for correct lighting on rotated models.
- [x] **Spotlight:** Directed light toggleable and following camera direction.
- [x] **OBJ Loading:** Successfully rendering complex models with full lighting.
- [x] **Normal Visualization:** Button implemented to toggle debug view of vertex normals.
- [x] **UI Polish:** Integrated blocky-animal's clean UI sections and styling.
