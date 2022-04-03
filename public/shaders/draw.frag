// Display Grid of Cells in WebGL
precision mediump float;

// Array of cells
uniform sampler2D cells;

// Width and height of the window
uniform vec2 resolution;
uniform vec2 gridSize;

uniform vec4 enabledColor;
uniform vec4 disabledColor;
uniform vec4 gridColor;

float gridThickness = 1.0;

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution;

    // invert the y axis
    uv.y = 1.0 - uv.y;

    // If the cell is enabled, draw it
    if (texture2D(cells, uv).r > 0.5)
        gl_FragColor = enabledColor;
    else
        gl_FragColor = disabledColor;

    // Draw the grid
    if (mod(gl_FragCoord.x, gridSize.x) < gridThickness || mod(gl_FragCoord.y, gridSize.y) < gridThickness)
        gl_FragColor = gridColor;
}