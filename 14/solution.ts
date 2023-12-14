import _ from 'lodash';
import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();

function solve(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  let grid = input
    .split('\n')
    .map((x) => x.split(''))
    .slice(0, -1);

  const TRILLION = 1_000_000_000;

  enum Dir {
    N,
    W,
    S,
    E,
  }

  function moveO(dir: Dir) {
    if (dir === Dir.N) {
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
          if (grid[i][j] === 'O') {
            let q = i;
            while (q > 0 && grid[q - 1][j] === '.') q--;

            grid[i][j] = '.';
            grid[q][j] = 'O';
          }
        }
      }
    } else if (dir === Dir.W) {
      for (let j = 0; j < grid[0].length; j++) {
        for (let i = 0; i < grid.length; i++) {
          if (grid[i][j] === 'O') {
            let q = j;
            while (q > 0 && grid[i][q - 1] === '.') q--;

            grid[i][j] = '.';
            grid[i][q] = 'O';
          }
        }
      }
    } else if (dir === Dir.S) {
      for (let i = grid.length - 1; i >= 0; i--) {
        for (let j = 0; j < grid[0].length; j++) {
          if (grid[i][j] === 'O') {
            let q = i;
            while (q < grid.length - 1 && grid[q + 1][j] === '.') q++;

            grid[i][j] = '.';
            grid[q][j] = 'O';
          }
        }
      }
    } else if (dir === Dir.E) {
      for (let j = grid[0].length - 1; j >= 0; j--) {
        for (let i = grid.length - 1; i >= 0; i--) {
          if (grid[i][j] === 'O') {
            let q = j;
            while (q < grid[0].length - 1 && grid[i][q + 1] === '.') q++;

            grid[i][j] = '.';
            grid[i][q] = 'O';
          }
        }
      }
    }
  }

  if (part2) {
    const memo = {};

    function findLoop(): [first: number, last: number] {
      for (let f = 0; f < TRILLION; f++) {
        for (const dir of [0, 1, 2, 3]) {
          moveO(dir);
        }

        const flat = grid.map((x) => x.join('')).join('\n');

        if (memo[flat]) {
          // We have hit this state before. We found the loop's start.
          return [memo[flat], f];
        }
        memo[flat] = f;
      }
      throw new Error();
    }

    const [first, last] = findLoop();
    const cycle_length = last - first;
    const offset = (TRILLION - first) % cycle_length;

    grid = Object.keys(memo)
      [first + offset - 1].split('\n')
      .map((x) => x.split(''));
  } else {
    // part 1
    moveO(0);
  }

  // determine weight
  for (let i = 0; i < grid.length; i++) {
    answer += grid[i].filter((x) => x === 'O').length * (grid.length - i);
  }

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 136 : 109661));

// // part 2
assert(solve(true) === (TEST ? 64 : 90176));
