import _ from 'lodash';
import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const grids = input.split('\n\n').map((x) => x.split('\n').filter((x) => x));

function solve(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  const REQUIRED_MISTAKES = part2 ? 1 : 0;

  function solveGrid(grid: string[]) {
    const WIDTH = grid[0].length,
      HEIGHT = grid.length;

    function compareLine(a: number, b: number, mistakes: number, isRow = false) {
      for (let j = 0; j < (isRow ? WIDTH : HEIGHT); j++) {
        if (isRow ? grid[a][j] !== grid[b][j] : grid[j][a] !== grid[j][b]) {
          mistakes++;
          if (mistakes > REQUIRED_MISTAKES) return false;
        }
      }

      if (a === 0 || b === (isRow ? HEIGHT : WIDTH) - 1) return mistakes === REQUIRED_MISTAKES;
      else return compareLine(a - 1, b + 1, mistakes, isRow);
    }

    for (let i = 0; i < HEIGHT - 1; i++) {
      if (compareLine(i, i + 1, 0, true)) return (i + 1) * 100;
    }

    for (let i = 0; i < WIDTH - 1; i++) {
      if (compareLine(i, i + 1, 0)) return i + 1;
    }

    throw new Error();
  }

  for (const grid of grids) answer += solveGrid(grid);

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 405 : 41859));

// // part 2
assert(solve(true) === (TEST ? 400 : 30842));
