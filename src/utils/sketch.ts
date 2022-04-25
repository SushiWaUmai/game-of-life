import { clearGPU, gameOfLife, randomizeGPU, setupGPU } from "./compute";
import { P5Instance } from "react-p5-wrapper";
import p5Types from "p5";
import { inputKeyMap, pressedEvent, releasedEvent } from "./input";
import { gunmetal, jungle, orchid } from "./colors";

interface SelectionPixels {
  width: number;
  height: number;
  cells: Float32Array;
}

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
let selectionBox = [0, 0, -1, -1];
let selectionMode = false;
let clipboard: SelectionPixels;

const scaleSensitivity = 0.2;
const movementSpeed = 0.01;

const cellXYfromScreen = (x: number, resX: number, y: number, resY: number) => {
  const mouseX = Math.floor(((x / resX) * scale + offset[0]) * width);
  const mouseY = Math.floor(((1 - y / resY) * scale + offset[1]) * height);

  return [mouseX, mouseY];
};

const screenXYfromCell = (x: number, resX: number, y: number, resY: number) => {
  const screenX = Math.floor((((x + 1) / width - offset[0]) / scale) * resX);
  const screenY = Math.floor(
    (1 - ((y + 1) / height - offset[1]) / scale) * resY
  );
  return [screenX, screenY];
};

const screenRectFromCellRect = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  resX: number,
  resY: number
) => {
  [x1, y1] = screenXYfromCell(x1 - 1, resX, y1 - 1, resY).map(
    (v) => v - resX / 2
  );
  [x2, y2] = screenXYfromCell(x2, resX, y2, resY).map((v) => v - resY / 2);

  return [x1, y1, x2, y2];
};

// Get the index of the cell
const index = (x: number, y: number) => {
  return x + y * width;
};

const indexFromWidth = (x: number, y: number, width: number) => {
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
  removeBox();
};

export const removeBox = () => {
  selectionBox = [0, 0, -1, -1];
};

export const toggleLoop = () => {
  loop = !loop;
};

export const toggleSelection = () => {
  selectionMode = !selectionMode;
}

export const fillSelection = (val: number) => {
  const [x1, y1, x2, y2] = selectionBox;
  // enable cells in selection box
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      cells[index(x, y)] = val;
    }
  }
};

export const saveClipboard = () => {
  const json = JSON.stringify(clipboard);
  const blob = new Blob([json], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cells.json";
  a.click();
};

export const loadClipboard = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = () => {
    if (input.files) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const json = JSON.parse(reader.result as string);
        clipboard = json;
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

export const copySelection = () => {
  const [x1, y1, x2, y2] = selectionBox;

  // copy selection to clipboard
  // get the cells from selection box
  const selectionWidth = x2 - x1 + 1;
  const selectionHeight = y2 - y1 + 1;

  const selectionCells = new Float32Array(selectionWidth * selectionHeight);

  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      selectionCells[indexFromWidth(x - x1, y - y1, selectionWidth)] =
        cells[index(x, y)];
    }
  }

  clipboard = {
    width: selectionWidth,
    height: selectionHeight,
    cells: selectionCells,
  };
};

export const pasteSelection = (x1: number, y1: number) => {
  if (clipboard) {
    const x2 = x1 + clipboard.width - 1;
    const y2 = y1 + clipboard.height - 1;

    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        cells[index(x, y)] =
          clipboard.cells[indexFromWidth(x - x1, y - y1, clipboard.width)];
      }
    }

    // update selection box
    selectionBox = [x1, y1, x2, y2];
  }
};

export const pasteFromMouse = (p5: P5Instance) => {
  const [x, y] = cellXYfromScreen(p5.mouseX, p5.width, p5.mouseY, p5.height);
  pasteSelection(x, y);
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
    const size = Math.min(p5.windowWidth, p5.windowHeight);
    canvas = p5.createCanvas(size, size, p5.WEBGL);
    const htmlCanvas = canvas.elt as HTMLCanvasElement;
    htmlCanvas.addEventListener("contextmenu", (e) => e.preventDefault());
    const gl = htmlCanvas.getContext("webgl");
    if (!gl) return;

    gl.disable(gl.DEPTH_TEST);

    p5.pixelDensity(1);

    setupGPU(width, height);
    cellsImage = p5.createGraphics(width, height);
    const tex = (canvas as any).getTexture(cellsImage);
    tex.setInterpolation(p5.NEAREST, p5.NEAREST);

    p5.background(0);
    p5.fill(255);

    randomize();
    p5.frameRate(60);

    p5.windowResized = () => {
      const size = Math.min(p5.windowWidth, p5.windowHeight);
      p5.resizeCanvas(size, size);
    };
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

  p5.mousePressed = () => {
    // check if middle mouse button
    if (p5.mouseButton === p5.CENTER) {
      selectionMode = true;
    }

    if(selectionMode) {
      const [mouseX, mouseY] = cellXYfromScreen(
        p5.mouseX,
        p5.width,
        p5.mouseY,
        p5.height
      );

      selectionBox = [mouseX, mouseY, mouseX, mouseY];
    }
  };

  p5.mouseDragged = () => {
    if(selectionMode) {
      const [cellX, cellY] = cellXYfromScreen(
        p5.mouseX,
        p5.width,
        p5.mouseY,
        p5.height
      );

      let [x1, y1] = selectionBox;
      selectionBox = [x1, y1, cellX, cellY];

      // keep selection box within grid
      selectionBox = selectionBox.map((v) =>
        Math.max(Math.min(v, width - 1), 0)
      );
    }
  };

  p5.mouseReleased = () => {
    if(selectionMode) {
      const [x1, y1, x2, y2] = selectionBox;
      // swap if necessary
      if (x1 > x2) selectionBox = [x2, y1, x1, y2];
      if (y1 > y2) selectionBox = [x1, y2, x2, y1];
    }

    if (p5.mouseButton === p5.CENTER) {
      selectionMode = false;
    }
  };

  // Subscribe to the input event
  const setupInputCallback = () => {
    switch (p5.key) {
      case " ":
        toggleLoop();
        break;
      case "r":
        clear();
        break;
      case "k":
        toDefaults();
        break;
      case "b":
        removeBox();
        break;
      case "Enter":
        nextGen();
        break;
      case "e":
        fillSelection(0);
        break;
      case "f":
        fillSelection(1);
        break;
      case "c":
        copySelection();
        break;
      case "v":
        pasteFromMouse(p5);
        break;
    }
  };

  // Handle Input
  const handleInput = () => {
    // Mouse Input
    if (p5.mouseIsPressed && !selectionMode) {
      // check if mouse is in canvas
      if (p5.mouseX < p5.width && p5.mouseY < p5.height) {
        const [mouseX, mouseY] = cellXYfromScreen(
          p5.mouseX,
          p5.width,
          p5.mouseY,
          p5.height
        );
        switch (p5.mouseButton) {
          case p5.LEFT:
            cells[index(mouseX, mouseY)] = 1;
            break;
          case p5.RIGHT:
            cells[index(mouseX, mouseY)] = 0;
            break;
        }
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

    // prettier-ignore
    {
      p5.quad(
        -1, -1,
         1, -1,
         1,  1,
        -1,  1,
      );
    }

    cellsImage.remove();

    p5.resetShader();

    // Draw a box at selection
    let [x1, y1, x2, y2] = selectionBox;
    [x1, y1, x2, y2] = screenRectFromCellRect(
      x1,
      y1,
      x2,
      y2,
      p5.width,
      p5.height
    );

    p5.stroke(255);
    p5.strokeWeight(3);
    p5.line(x1, y1, x2, y1);
    p5.line(x2, y1, x2, y2);
    p5.line(x2, y2, x1, y2);
    p5.line(x1, y2, x1, y1);
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
