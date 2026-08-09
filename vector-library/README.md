# Vector Library
**Jon Cody** - jdcody@ucsc.edu

## Notes:
The library correctly renders v1 (red) and v2 (blue), and the results of operations in green. Numerical outputs for Magnitude, Angle Between, and Area are printed to the browser console as requested. The UI has been optimized for a 480px width and is positioned vertically under the canvas.

## Directory Structure:
    .
    ├── lib
    │   └── cuon-matrix-cse160.js
    ├── README.md
    └── src
        ├── vector-library.css
        ├── vector-library.html
        └── vector-library.js

## How to Run:
1. Navigate to the `src` directory.
2. Open `vector-library.html` in any modern web browser.
3. Input values into the X and Y fields for v1 and v2.
4. Use "Draw Vectors" to see the base vectors.
5. Select an operation from the dropdown, provide a scalar if necessary, and click "Execute & Draw".
6. Press F12 to open the browser console to view calculation results for Magnitude, Angle, and Area.

## Features Implemented:
    - Vector Addition and Subtraction
    - Scalar Multiplication and Division
    - Magnitude Calculation
    - Normalization
    - Dot Product (used for Angle Between calculation)
    - Cross Product (used for Area of Triangle calculation)
