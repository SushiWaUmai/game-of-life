import { clearGPU, gameOfLife, randomizeGPU, setupGPU } from "./compute";
import { P5Instance } from "react-p5-wrapper";
import p5Types from "p5";
import { inputKeyMap, pressedEvent, releasedEvent } from "./input";
import { gunmetal, jungle, orchid } from "./colors";

const width = 128;
const height = 128;
let cells: Float32Array;
let loop = true;
let drawShader: p5Types.Shader;
let canvas: p5Types.Renderer;
let cellsImage: p5Types.Graphics;
let enabledColor = orchid;
let disabledColor = jungle;
let gridColor = gunmetal;
let gridThickness = 1;
let offset = [0, 0];
let scale = 1;

const scaleSensitivity = 0.2;
const movementSpeed = 0.01;

// Get the index of the cell
const index = (x: number, y: number) => {
  return x + y * width;
};

// Clear all cells
export const clear = () => {
  cells = clearGPU() as Float32Array;
};

// Randomize cells
export const randomize = () => {
  cells = randomizeGPU() as Float32Array;
};

// Next game of life step
export const nextGen = () => {
  cells = gameOfLife(cells, width, height) as Float32Array;
};

export const toDefaults = () => {
  offset = [0, 0];
  scale = 1;
};

export const toggleLoop = () => {
  loop = !loop;
};

export const changeZoom = (wheel: number, x: number, y: number) => {
  const zoom = Math.exp(wheel * scaleSensitivity);
  const newScale = scale * zoom;
  const scaleDiff = scale - newScale;

  const newOffsetX = offset[0] + x * scaleDiff;
  const newOffsetY = offset[1] + y * scaleDiff;

  offset = [newOffsetX, newOffsetY];
  scale = newScale;
};

const sketch = (p5: P5Instance) => {
  let refreshRate = 5;
  let refreshCounter = 0;

  p5.preload = () => {
    drawShader = p5.loadShader("shaders/draw.vert", "shaders/draw.frag");
  };

  p5.setup = () => {
    canvas = p5.createCanvas(p5.windowHeight, p5.windowHeight, p5.WEBGL);
    (canvas.elt as HTMLCanvasElement).addEventListener("contextmenu", (e) =>
      e.preventDefault()
    );
    p5.pixelDensity(1);

    setupGPU(width, height);
    cellsImage = p5.createGraphics(width, height);
    const tex = (canvas as any).getTexture(cellsImage);
    tex.setInterpolation(p5.NEAREST, p5.NEAREST);

    p5.background(0);
    p5.fill(255);

    randomize();
    p5.frameRate(60);
  };

  p5.keyPressed = () => {
    setupInputCallback();
    pressedEvent(p5);
  };

  p5.keyReleased = () => {
    releasedEvent(p5);
  };

  p5.mouseWheel = (event) => {
    const wheel = (event as any).deltaY > 0 ? 1 : -1;
    changeZoom(wheel, p5.mouseX / p5.width, 1 - p5.mouseY / p5.height);
  };

  // Subscribe to the input event
  const setupInputCallback = () => {
    switch (p5.key) {
      case " ":
        toggleLoop();
        break;
      case "c":
        clear();
        break;
      case "k":
        toDefaults();
        break;
      case "Enter":
        nextGen();
        break;
      case "r":
        randomize();
        break;
    }
  };

  // Handle Input
  const handleInput = () => {
    // Mouse Input
    if (p5.mouseIsPressed) {
      // check if mouse is in canvas
      if (p5.mouseX < p5.width && p5.mouseY < p5.height) {
        const mouseX = Math.floor(
          ((p5.mouseX / p5.width) * scale + offset[0]) * width
        );
        const mouseY = Math.floor(
          ((1 - p5.mouseY / p5.height) * scale + offset[1]) * height
        );
        cells[index(mouseX, mouseY)] = p5.mouseButton === p5.LEFT ? 1 : 0;
      }
    }

    // Handle Keyboard Input for movement
    // x axis
    const speed = movementSpeed * scale;
    if (inputKeyMap.a) {
      offset[0] -= speed;
    } else if (inputKeyMap.d) {
      offset[0] += speed;
    }
    // y axis
    if (inputKeyMap.w) {
      offset[1] += speed;
    } else if (inputKeyMap.s) {
      offset[1] -= speed;
    }
  };

  const paint = () => {
    p5.background(0);

    // convert cells to a p5 image texture
    cellsImage.loadPixels();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = cells[index(x, y)] * 255;
        cellsImage.set(x, y, [color, color, color, 255]);
      }
    }
    cellsImage.updatePixels();

    // Set Shader Uniform
    p5.shader(drawShader);
    drawShader.setUniform("_cells", cellsImage);
    drawShader.setUniform("_gridSize", [p5.width / width, p5.height / height]);
    drawShader.setUniform("_resolution", [p5.width, p5.height]);
    drawShader.setUniform("_enabledColor", enabledColor);
    drawShader.setUniform("_disabledColor", disabledColor);
    drawShader.setUniform("_gridColor", gridColor);
    drawShader.setUniform("_gridThickness", gridThickness);
    drawShader.setUniform("_offset", offset);
    drawShader.setUniform("_scale", scale);

    p5.quad(-1, -1, 1, -1, 1, 1, -1, 1);

    cellsImage.remove();
  };

  p5.draw = () => {
    if (loop) {
      refreshCounter += p5.deltaTime / 1000;
      if (refreshCounter > 1 / refreshRate) {
        nextGen();
        refreshCounter = 0;
      }
    }

    handleInput();
    paint();
  };
};

export default sketch;
