import { GPU, IKernelRunShortcut } from "gpu.js";
import p5Types from "p5";

const width = 128;
const height = 128;
let cells: Float32Array;
let loop = true;
let drawShader: p5Types.Shader;
let canvas: p5Types.Renderer;
let gameOfLife: IKernelRunShortcut;
let clearGPU: IKernelRunShortcut;
let randomizeGPU: IKernelRunShortcut;
let cellsImage: p5Types.Graphics;
let enabledColor = [1.0, 1.0, 1.0, 1.0];
let disabledColor = [0.0, 0.0, 0.0, 1.0];
let gridColor = [0.1, 0.1, 0.1, 1.0];

export const setup = (p5: p5Types) => {
  canvas = p5.createCanvas(p5.windowHeight, p5.windowHeight, p5.WEBGL);
  (canvas.elt as HTMLCanvasElement).addEventListener("contextmenu", (e) =>
    e.preventDefault()
  );
  p5.pixelDensity(1);

  setupGPU();
  cellsImage = p5.createGraphics(width, height);
  const tex = (canvas as any).getTexture(cellsImage);
  tex.setInterpolation(p5.NEAREST, p5.NEAREST);

  drawShader = p5.loadShader("shaders/draw.vert", "shaders/draw.frag");

  p5.background(0);
  p5.fill(255);

  randomize();
  p5.frameRate(30);

  p5.keyReleased = () => {
    switch (p5.key) {
      case " ":
        loop = !loop;
        break;
      case "c":
        clear();
        paint(p5);
        break;
      case "r":
        randomize();
        paint(p5);
        break;
    }
  };
};

const setupGPU = () => {
  const gpu = new GPU();
  gameOfLife = gpu
    .createKernel(function (cells: Float32Array, width: number, height: number) {
      const index = this.thread.x;
      const x = index % width;
      const y = Math.floor(index / width);

      const alive = cells[index];

      let aliveNeighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const neighborX = (x + i + width) % width;
          const neighborY = (y + j + height) % height;
          aliveNeighbors += cells[neighborX + neighborY * width];
        }
      }
      aliveNeighbors -= alive;

      if (alive != 0) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
          return 0;
        }
      } else {
        if (aliveNeighbors === 3) {
          return 1;
        }
      }

      return alive;
    })
    .setOutput([width * height]);

  clearGPU = gpu
    .createKernel(function () {
      return 0;
    })
    .setOutput([width * height]);

  randomizeGPU = gpu
    .createKernel(function () {
      return Math.random() > 0.5 ? 1 : 0;
    })
    .setOutput([width * height]);
};

const index = (x: number, y: number) => {
  return x + y * width;
};

const clear = () => {
  cells = clearGPU() as Float32Array;
};

const randomize = () => {
  cells = randomizeGPU() as Float32Array;
};

const nextGen = () => {
  // Next game of life step
  cells = gameOfLife(cells, width, height) as Float32Array;
};

const paint = (p5: p5Types) => {
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

  p5.shader(drawShader);
  drawShader.setUniform("cells", cellsImage);
  drawShader.setUniform("gridSize", [p5.width / width, p5.height / height]);
  drawShader.setUniform("resolution", [p5.width, p5.height]);
  drawShader.setUniform("enabledColor", enabledColor);
  drawShader.setUniform("disabledColor", disabledColor);
  drawShader.setUniform("gridColor", gridColor);

  p5.quad(-1, -1, 1, -1, 1, 1, -1, 1);

  cellsImage.remove();
};

export const draw = (p5: p5Types) => {
  if (loop) {
    nextGen();
  }

  if (p5.mouseIsPressed) {
    const mouseX = Math.floor((p5.mouseX * width) / p5.width);
    const mouseY = Math.floor((p5.mouseY * height) / p5.height);
    cells[index(mouseX, mouseY)] = p5.mouseButton === p5.LEFT ? 1 : 0;
  }

  paint(p5);
};
