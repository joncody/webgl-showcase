# The Reliquary of Hanzo
**Jon Cody** - jdcody@ucsc.edu

## Notes:
This project creates a cinematic, high-performance Japanese shrine environment featuring recursive procedural generation, advanced lighting math, and optimized geometry batching using the **Three.js** library.

**Key Technical Features:**
*   **Procedural Fractal Forest:** Replaced standard loops with a **Recursive Radial Branching** algorithm. Each of the 9 massive trees is mathematically grown with "Tropism" (skyward growth pull) and a 3-way radial split, creating a complex, organic canopy.
*   **Spherical Normal Manipulation:** To achieve the "fluffy" 3D look of the cherry blossoms, I implemented custom normal math. Leaf normals are recalculated per-vertex to point away from the center of the blossom clump rather than the plane's face, allowing moonlight to wrap around the foliage like a soft volume.
*   **Global Geometry Merging:** To maintain high FPS despite a forest of thousands of branches and blossoms, the entire forest is batched. Thousands of procedural geometries are merged into just two global draw calls using `BufferGeometryUtils`.
*   **Collision-Aware Snowfall:** A physics-based particle system of 15,000 snowflakes. The system detects the coordinate footprint of the widened 1.5x shrine roof tiers, preventing snow from clipping through the architecture into the interior.
*   **Procedural Texture Generation:** The Sakura blossoms utilize a custom-generated canvas texture (6-petal pompom clusters) to eliminate "sharp square" edges and create a soft, painterly aesthetic.

## Awesomeness (Creativity):
1.  **Grand Architectural Scale:** The shrine was scaled 1.5x with elongated pillars (40 units) and a widened foundation. I implemented a procedural **Shōji Screen** (paper wall) at the back, complete with a wooden **Kumiko lattice grid**, which provides a high-contrast backdrop for the relics.
2.  **Relic Hierarchy & 3D Animation:** Created a vertical "Holy Relic" stack where the Hattori Hanzo sword floats above a revolving ancient Tsuba. The Tsuba follows a complex **3D Infinity Path (Lemniscate of Gerono)**, weaving through the X, Y, and Z axes.
3.  **Cinematic Shadow Engineering:** To prevent "light trapping," the lantern sphere is excluded from shadow-casting, allowing the internal PointLight to project the sword's silhouette onto the Shōji screen. The lantern was moved forward to $Z: 6$ to act as a "Key Light" for the blade.
4.  **Weathered & Ancient Materials:** 
    *   **Jade Guardians:** Used `MeshPhysicalMaterial` with clearcoat and subtle emissive pulses for the dragons (Scale 15).
    *   **Temple Wood:** Implemented a matte, high-roughness charcoal wood to capture soft rim-lighting from the moon.
5.  **Natural Stone Path:** Created a hand-laid look by applying random rotations and scales to each path segment. The path is mathematically "tapered" to connect perfectly straight to the stairs before curving into the forest.

## Controls:
*   **Orbit:** `Left Click + Drag`
*   **Pan:** `Right Click + Drag`
*   **Zoom:** `Scroll Wheel`
*   **Navigation:** Managed via Three.js `OrbitControls` with added damping for a smooth, cinematic feel.

## Directory Structure:
```text
.
├── src
│   ├── reliquary-of-hanzo.html
│   ├── reliquary-of-hanzo.js
│   ├── reliquary-of-hanzo.css
│   ├── grass.png                     <-- Ground Texture
│   ├── dirt.png                      <-- Path/Stairs Texture
│   ├── dragon.obj                    <-- Guardian Models
│   ├── tsuba.glb                     <-- Artifact Model
│   └── sword_of_hattori_hanzo...glb  <-- Main Relic Model
└── README.md
```

## Features Implemented (Rubric Checklist):
- [x] **20+ 3D Primary Shapes:** 8 stairs, 4 long pillars, 3 roof tiers, 3 lantern parts, 24 path segments, and 1 Shōji back-wall.
- [x] **Textured Shape:** Path and ground utilize custom textures; blossoms use a procedurally generated map.
- [x] **Animated Shape:** The Tsuba follows a 3D infinity path; the dragons hover; the lantern core rotates.
- [x] **3 Shape Varieties:** Box, Cylinder, Sphere, and Plane/Circle.
- [x] **Textured 3D Model:** Hattori Hanzo Sword (.glb), Ancient Tsuba (.glb), and Jade Dragons (.obj).
- [x] **3+ Light Sources:** Ambient, Hemisphere, Directional (Moon), and Point Lights (Lantern & Tsuba Orb).
- [x] **Textured Skybox:** 6-sided CubeMap using the Milky Way starfield.
- [x] **Perspective Camera:** Positioned to capture the heroic scale of the reliquary.
- [x] **Mouse Controls:** Full navigation via OrbitControls.
- [x] **Wow Point:** Optimized Scene via Geometry Merging, Recursive Fractal Trees, and Spherical Normal lighting.
