import { GPU } from "gpu.js";
import p5Types from "p5";

const width = 128;
const height = 128;
let cells: number[] = [];
let loop = true;
let gpu: GPU;
let drawShader: p5Types.Shader;
let canvas: p5Types.Renderer;

export const setup = (p5: p5Types) => {
  canvas = p5.createCanvas(p5.windowHeight, p5.windowHeight, p5.WEBGL);
  (canvas.elt as HTMLCanvasElement).addEventListener("contextmenu", (e) => e.preventDefault());
  p5.pixelDensity(1);

  gpu = new GPU();
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

const index = (x: number, y: number) => {
  return x + y * width;
};

const clear = () => {
  const clearGPU = gpu
    .createKernel(function () {
      return 0;
    })
    .setOutput([width * height]);

  cells = clearGPU() as number[];
};

const randomize = () => {
  const randomizeGPU = gpu
    .createKernel(function () {
      return Math.random() > 0.5 ? 1 : 0;
    })
    .setOutput([width * height]);

  cells = randomizeGPU() as number[];
};

const nextGen = () => {
  // Next game of life step
  const gameOfLife = gpu
    .createKernel(function (cells: number[], width: number, height: number) {
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

  cells = gameOfLife(cells, width, height) as number[];
};

const paint = (p5: p5Types) => {
  p5.background(0);

  // convert cells to a p5 image texture
  const cellsImage = p5.createImage(width, height);
  const tex = (canvas as any).getTexture(cellsImage);
  tex.setInterpolation(p5.NEAREST, p5.NEAREST);
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
  drawShader.setUniform("enabledColor", [1.0, 1.0, 1.0, 1.0]);
  drawShader.setUniform("disabledColor", [0.0, 0.0, 0.0, 1.0]);
  drawShader.setUniform("gridColor", [0.1, 0.1, 0.1, 1.0]);


  p5.quad(-1, -1, 1, -1, 1, 1, -1, 1);
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
