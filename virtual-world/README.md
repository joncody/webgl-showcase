# Virtual World
**Jon Cody** - jdcody@ucsc.edu

## Notes:
This application features a first-person exploration of a randomized 32x32 voxel world. The project integrates the complex hierarchical Scorpion model from blocky-animal as a central part of a "treasure hunt" game.

**Key Technical Features:**
*   **First-Person Camera:** A fully functional camera system supporting 6 degrees of freedom (translation on X, Y, Z axes and rotation for Yaw/Pitch).
*   **Texture Mapping:** Real-time texture switching between `grass.png` (floor) and `dirt.png` (walls), with support for solid colors (Sky and Scorpion).
*   **Raycast Interaction:** Minecraft-style block addition and deletion using a ray-marching algorithm to determine exactly which block the player is aiming at.
*   **Static Buffer Optimization:** High performance is maintained using static GPU buffers for the `Cube` and `Pyramid` classes.

## Awesomeness (Creativity):
1.  **The Scorpion's Quest (Mini-Game):** This is not just a world, but a game. A **Golden Diamond** is spawned at a randomized location in the maze, guarded by the 3D Scorpion.
    *   The Scorpion features the full hierarchy from blocky-animal (8 legs, 5-segment tail, and moving pincers).
    *   A **Win Condition** is triggered when the player navigates the maze and touches the Diamond.
2.  **Advanced "Minecraft" Logic:** 
    *   Implemented **Raycasting** for high-precision block building.
    *   Added a **Crosshair Overlay** for aiming.
    *   Implemented **Click-Drag Protection**: The system distinguishes between "dragging to look around" and "clicking to build," preventing accidental blocks from appearing while the player rotates the view.
3.  **Floating Treasure Model:** The Golden Diamond treasure is a custom-built primitive consisting of two `Pyramid` instances joined at the base, featuring a floating sine-wave animation and constant rotation.
4.  **Dual Control Scheme:** The game supports both traditional **WASD** movement and **Arrow Key** movement/panning to ensure accessibility and a classic gaming feel.

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
    *   **Mouse Drag**: Look Around (Yaw and Pitch)
*   **Actions:** 
    *   **Left Click**: Add Block (at crosshair)
    *   **Shift + Left Click**: Delete Block (at crosshair)
    *   `X`: Trigger Scorpion "Strike" animation

## Directory Structure:
```text
.
├── lib
│   ├── cuon-matrix-cse160.js
│   ├── cuon-utils.js
│   ├── webgl-debug.js
│   └── webgl-utils.js
├── src
│   ├── virtual-world.html
│   ├── virtual-world.js
│   ├── virtual-world.css
│   ├── Camera.js
│   ├── Cube.js
│   ├── Pyramid.js
│   ├── grass.png
│   └── dirt.png
└── README.md
```

## How to Run:
1.  Navigate to the `src` directory.
2.  Open `virtual-world.html` in a modern web browser (Chrome or Firefox recommended).
    *   *Note: Due to browser security, textures may require a local server (like Live Server in VS Code) to load correctly.*
3.  Use the controls listed above to explore the world and find the Scorpion.

## Features Implemented (Rubric Checklist):
- [x] **Texture Mapping:** Textures on ground and walls; solid colors on Sky and Scorpion.
- [x] **Perspective Camera:** Perspective view implemented with `setPerspective`.
- [x] **Camera Movement:** WASD and Arrow key translation working correctly.
- [x] **Camera Rotation:** QE keys and Mouse-look (Yaw/Pitch) implemented.
- [x] **World Creation:** 32x32 world generated from a JavaScript array/map logic.
- [x] **Ground/Sky:** Textured ground plane and large skybox cube.
- [x] **Minecraft Logic:** Ability to add and delete blocks in the world.
- [x] **Animal & Story:** Full Scorpion integrated into a Treasure Hunt game.
- [x] **Performance:** Runs at high FPS using single-buffer draws and optimized class structures.
