import p5Types from "p5";

const cells: boolean[] = [];
const width = 64;
const height = 64;
let loop = true;

export const setup = (p5: p5Types) => {
  p5.createCanvas(p5.windowHeight, p5.windowHeight);
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

const countNeighbors = (x: number, y: number) => {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const col = (x + i + width) % width;
      const row = (y + j + height) % height;
      sum += cells[index(col, row)] ? 1 : 0;
    }
  }
  sum -= cells[index(x, y)] ? 1 : 0;
  return sum;
};

const clear = () => {
  cells.length = 0;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      cells.push(false);
    }
  }
};

const randomize = () => {
  cells.length = 0;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      cells.push(Math.random() < 0.5);
    }
  }
};

const nextGen = () => {
  // Next game of life step
  const nextCells: boolean[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = countNeighbors(x, y);
      if (cells[index(x, y)]) {
        nextCells.push(neighbors === 2 || neighbors === 3);
      } else {
        nextCells.push(neighbors === 3);
      }
    }
  }
  cells.length = 0;
  cells.push(...nextCells);
};

const paint = (p5: p5Types) => {
  p5.background(0);

  // Draw Grid
  p5.stroke(255, 255, 255, 64);
  p5.strokeWeight(1);
  for (let x = 0; x <= width; x++) {
    p5.line(x * p5.windowHeight / width, 0, x * p5.windowHeight / width, p5.windowHeight);
  }
  for (let y = 0; y <= height; y++) {
    p5.line(0, y * p5.windowHeight / height, p5.windowHeight, y * p5.windowHeight / height);
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
    cells[index(mouseX, mouseY)] = p5.mouseButton === p5.LEFT;
    paint(p5);
  }
};
