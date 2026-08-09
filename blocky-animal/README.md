# Blocky Animal (3D Hierarchical Scorpion)
**Jon Cody** - jdcody@ucsc.edu

## Notes:
The application renders a complex 3D Scorpion model using a hierarchical transformation system. Each limb and segment is built using custom `Cube` and `Pyramid` primitive classes.

The model features a deeply nested hierarchy:
*   **Body (Mesosoma):** Four segments that exhibit a side-to-side breathing/sway animation.
*   **Tail (Metasoma):** A 5-segment chain that inherits rotations from the base to the tip, ending in a bulb and needle-tipped stinger.
*   **Arms & Pincers:** Multi-jointed arms (base and elbow) with functional pincers consisting of a fixed upper finger and a movable lower finger.
*   **Legs:** Eight legs, each consisting of three distinct joints (hip, knee, and foot) that move in synchronized walking patterns when animation is active.

## Awesomeness (Creativity):
1.  **Additive "Strike" Animation:** Triggered by **Shift + Click**, the scorpion performs a dynamic strike. This is implemented using a "snap" curve (a partial sine wave) that calculates a `strikePower` value. This power is applied as a high-intensity additive offset to the tail, arms, body lunge, and pincers. Because it is additive, the strike "whips" forward from whatever pose the user has currently set via the sliders, creating a reactive and fluid movement.
2.  **Interactive Camera & Zoom:** The camera system supports intuitive mouse controls alongside traditional sliders. Users can **click-and-drag** on the canvas to rotate the scorpion in 3D space and use the **mouse wheel** to zoom in or out. The UI sliders automatically synchronize with these mouse movements to provide consistent visual feedback.
3.  **Static GPU Buffer Optimization:** To maintain high performance and FPS, the `Cube` and `Pyramid` classes utilize static buffer initialization. Vertex data is buffered to the GPU exactly once upon the first instantiation and shared across all subsequent renders, significantly reducing the overhead of drawing dozens of hierarchical parts every frame.

## Directory Structure:

    .
    ├── lib
    │   ├── cuon-matrix-cse160.js
    │   ├── cuon-utils.js
    │   ├── webgl-debug.js
    │   └── webgl-utils.js
    ├── README.md
    └── src
        ├── blocky-animal.css
        ├── blocky-animal.html
        ├── blocky-animal.js
        ├── Cube.js
        └── Pyramid.js

## How to Run:
1. Navigate to the `src` directory.
2. Open `blocky-animal.html` in a modern web browser (Chrome or Firefox recommended).
3. Use the **Joint Sliders** to manually manipulate the tail, arms, and pincers.
4. Toggle **Animation ON/OFF** to see the idle breathing and leg-walking movements.
5. **Left-Click and Drag** on the canvas to rotate the model.
6. **Scroll the Mouse Wheel** to zoom the camera.
7. **Shift + Click** anywhere on the canvas to trigger the additive "Strike" animation.

## Features Implemented:
- **Hierarchical Modeling:** Complex 3D transformations where child parts (like the stinger or pincer fingers) correctly follow parent movements.
- **3D Primitives:** Object-oriented implementation of Cubes and Pyramids with dedicated `render()` methods.
- **Perspective & View Control:** Global rotation and scaling matrices controlled via `u_GlobalRotateMatrix`.
- **Dynamic Animation Engine:** Real-time sine-wave based oscillations for organic "idle" movement and high-frequency "snap" curves for the strike.
- **Interactive UI:** A comprehensive control panel for joint manipulation and real-time performance monitoring (FPS/ms).
- **Depth Testing:** Proper 3D occlusion using WebGL's depth buffer.
