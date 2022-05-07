import { GPU, IKernelRunShortcut } from "gpu.js";

export let gameOfLife: IKernelRunShortcut;
export let clearGPU: IKernelRunShortcut;
export let randomizeGPU: IKernelRunShortcut;

export const setupGPU = (width: number, height: number) => {
  const gpu = new GPU();
  gameOfLife = gpu
    .createKernel(function (
      cells: Float32Array,
      width: number,
      height: number
    ) {
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
