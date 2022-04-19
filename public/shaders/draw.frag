// Display Grid of Cells in WebGL
precision mediump float;

// Array of cells
uniform sampler2D _cells;

// Width and height of the window
uniform vec2 _resolution;
uniform vec2 _gridSize;

uniform vec4 _enabledColor;
uniform vec4 _disabledColor;
uniform vec4 _gridColor;

uniform float _scale;
uniform vec2 _offset;
uniform float _gridThickness;

void main(void)
{
    vec2 coord = gl_FragCoord.xy  * _scale + _offset * _resolution;
    vec2 uv = coord / _resolution;

    // check if the coordinate is inside the grid
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)
    {
        discard;
    }
    
    // If the cell is enabled, draw it
    if (texture2D(_cells, uv).r > 0.5)
        gl_FragColor = _enabledColor;
    else
        gl_FragColor = _disabledColor;

    // Draw the grid
    if (mod(coord.x, _gridSize.x) < _gridThickness || mod(coord.y, _gridSize.y) < _gridThickness)
        gl_FragColor = _gridColor;
}