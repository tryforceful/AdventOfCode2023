import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const grid = input
  .slice(0, -1)
  .split('\n')
  .map((x) => x.split(''));

enum Dir {
  N = 0b00,
  W = 0b01,
  S = 0b10,
  E = 0b11,
}

const dirDiff = {
  [Dir.N]: [-1, 0],
  [Dir.W]: [0, -1],
  [Dir.S]: [1, 0],
  [Dir.E]: [0, 1],
} as const;

function solve(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  const DIM = grid.length;

  function maze(start_i: number, start_j: number, start_dir: Dir) {
    const energized = new Array(DIM).fill(0).map(() => new Array(DIM).fill(0));

    let splits = new Set();

    function beamFlow(i: number, j: number, dir: Dir) {
      while (true) {
        const [di, dj] = dirDiff[dir];
        (i += di), (j += dj);

        if (i < 0 || j < 0 || i >= DIM || j >= DIM) return;

        energized[i][j] |= 1;
        const cell = grid[i][j];

        switch (cell) {
          case '|':
            if (dir === Dir.N || dir === Dir.S) continue;
            else {
              const N = [i, j, Dir.N] as const;
              const S = [i, j, Dir.S] as const;
              if (!splits.has(String(N))) {
                splits.add(String(N));
                beamFlow(...N);
              }
              if (!splits.has(String(S))) {
                splits.add(String(S));
                beamFlow(...S);
              }
              return;
            }
          case '-':
            if (dir === Dir.E || dir === Dir.W) continue;
            else {
              const E = [i, j, Dir.E] as const;
              const W = [i, j, Dir.W] as const;
              if (!splits.has(String(W))) {
                splits.add(String(W));
                beamFlow(...W);
              }
              if (!splits.has(String(E))) {
                splits.add(String(E));
                beamFlow(...E);
              }
              return;
            }
          case '\\':
            dir ^= 0b01; // W becomes N, E becomes S
            continue;
          case '/':
            dir ^= 0b11; // W becomes S, E becomes N
            continue;
        }
      }
    }

    beamFlow(start_i, start_j, start_dir);

    // console.log(energized.map((x) => x.map((y) => (y ? y : '.')).join('')).join('\n'));
    return energized.reduce((a, c) => a + c.reduce((b, d) => b + d, 0), 0);
  }

  if (!part2) {
    answer = maze(0, -1, Dir.E);
  } else {
    for (let i = 0; i < DIM; i++) {
      answer = Math.max(
        answer,
        maze(-1, i, Dir.S),
        maze(DIM, i, Dir.N),
        maze(i, -1, Dir.E),
        maze(i, DIM, Dir.W),
      );
    }
  }

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 46 : 8098));

// part 2
assert(solve(true) === (TEST ? 51 : 8335));
