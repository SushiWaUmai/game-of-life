import { GPU } from "gpu.js";
import p5Types from "p5";

const width = 64;
const height = 64;
let cells: number[] = [];
let loop = true;
let gpu: GPU;

export const setup = (p5: p5Types) => {
  p5.createCanvas(p5.windowHeight, p5.windowHeight);
  setupGPU();

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
  gpu = new GPU();
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

  // Draw Grid
  p5.stroke(255, 255, 255, 64);
  p5.strokeWeight(1);
  for (let x = 0; x <= width; x++) {
    p5.line(
      (x * p5.windowHeight) / width,
      0,
      (x * p5.windowHeight) / width,
      p5.windowHeight
    );
  }
  for (let y = 0; y <= height; y++) {
    p5.line(
      0,
      (y * p5.windowHeight) / height,
      p5.windowHeight,
      (y * p5.windowHeight) / height
    );
  }

  p5.stroke(0);
  p5.strokeWeight(1);

  // Draw
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (cells[index(x, y)]) {
        p5.rect(
          (x * p5.width) / width,
          (y * p5.height) / height,
          p5.width / width,
          p5.height / height
        );
      }
    }
  }
};

export const draw = (p5: p5Types) => {
  if (loop) {
    nextGen();
    paint(p5);
  }

  if (p5.mouseIsPressed) {
    const mouseX = Math.floor((p5.mouseX * width) / p5.width);
    const mouseY = Math.floor((p5.mouseY * height) / p5.height);
    cells[index(mouseX, mouseY)] = p5.mouseButton === p5.LEFT ? 1 : 0;
    paint(p5);
  }
};
