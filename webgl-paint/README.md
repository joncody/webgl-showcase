# WebGL Paint Program
**Jon Cody** - jdcody@ucsc.edu

## Notes:
The application uses a WebGL context to render squares (points), triangles, and circles. A modular, object-oriented approach was used, with each shape type stored in its own class file and managed within a global `g_shapesList`.

The "Special Picture" (Requirement 12) recreates the provided hand-drawn sketch and features my initials **"JDC"** explicitly colored Red, Green, and Blue. The entire scene uses over 25 triangles to satisfy the detail requirement. The UI is strictly capped at a 480px width and is positioned vertically under the canvas for a clean, mobile-friendly layout.

## Awesomeness (Creativity):
1.  **Alpha/Transparency Blending:** Implemented a fourth slider for Alpha (0-100%). WebGL blending is enabled to allow shapes to overlap with varying transparency levels.
2.  **Full Spectrum Rainbow Mode:** Implemented a toggleable Rainbow Mode. When active, the button displays a full-spectrum CSS gradient, and every new shape drawn is assigned a random RGB color, allowing for vibrant, multi-colored strokes during mouse-drag.

## Directory Structure:
    .
    ├── lib
    │   ├── webgl-utils.js
    │   ├── webgl-debug.js
    │   └── cuon-utils.js
    ├── README.md
    └── src
        ├── webgl-paint.html
        ├── webgl-paint.js
        ├── webgl-paint.css
        ├── Point.js
        ├── Triangle.js
        ├── Circle.js
        └── drawing.jpg (Reference Image)

## How to Run:
1. Navigate to the `src` directory.
2. Open `webgl-paint.html` in any modern web browser (Chrome or Firefox recommended).
3. Use the **Drawing Mode** buttons to select a brush.
4. Adjust **Color (0-255)**, **Alpha (0-100)**, and **Size** using the sliders.
5. Click or drag on the canvas to paint.
6. Click **"Draw Special Picture"** to see the WebGL recreation of the hand-drawn sketch.
7. The original sketch is displayed at the bottom of the control panel for direct comparison.

## Features Implemented:
- **WebGL Rendering:** Dynamic shape creation using attribute and uniform variables.
- **Brush Shapes:** Square (Points), custom Triangles, and customizable Circles.
- **Circle Segments:** Slider to control circle smoothness (range limited to 3–40 for performance).
- **Interactive UI:** Vertical 480px layout with color-coded buttons and hover effects.
- **Mouse Interaction:** Single-click placement and click-and-drag continuous painting.
- **Shape Storage:** Object-oriented class structure for Point, Triangle, and Circle.
- **Special Drawing:** Recreation of a landscape featuring initials JDC in R/G/B colors.
