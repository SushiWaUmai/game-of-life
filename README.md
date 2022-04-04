# Conway's Game of life simulation

## What is Conway's Game of Life?
Conway's Game of life is a cellular automaton devised by the British mathematician John Horton Conway in 1970.

## How does it work?
The rules of the game are simple:

    1. Any live cell with fewer than two live neighbours dies, as if caused by under-population.
    2. Any live cell with two or three live neighbours lives on to the next generation.
    3. Any live cell with more than three live neighbours dies, as if by overcrowding.
    4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

[By Wikipedia, the free encyclopedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)

## How do I play?
This Simulation is available on [GitHub Pages](https://sushiwaumai.github.io/Game-of-Life/).

The game is played by clicking on the cells.

    1. Left click on a cell to make it alive.
    2. Right click on a cell to make it dead.
    3. Press the `Space` key to start the simulation. Press it again to stop it.
    4. Press `r` to randomize the board.
    5. Press `c` to clear the board.
    6. Press `Enter` to move to the next generation.


## Development

### Prerequisites
- node.js
- pnpm

### Getting Started

Clone the repository and install dependencies:
```bash
# Clone the repo 
git clone https://github.com/SushiWaUmai/Game-of-Life.git && cd Game-of-Life
pnpm i 
```

Start developing:
```bash
pnpm run dev
```
