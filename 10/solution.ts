import _ from 'lodash';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const grid = input
  .split('\n')
  .slice(0, -1)
  .map((x) => x.split(''));

const HEIGHT = grid.length;
const WIDTH = grid[0].length;

enum Dir {
  Up = 0b0001,
  Right = 0b0010,
  Down = 0b0100,
  Left = 0b1000,
}

const Diff = {
  [Dir.Up]: [-1, 0],
  [Dir.Right]: [0, 1],
  [Dir.Down]: [1, 0],
  [Dir.Left]: [0, -1],
} as const;

const Pipes = {
  F: Dir.Down | Dir.Right,
  '7': Dir.Left | Dir.Down,
  '|': Dir.Up | Dir.Down,
  '-': Dir.Left | Dir.Right,
  J: Dir.Up | Dir.Left,
  L: Dir.Right | Dir.Up,
} as const;

function solve(part2 = false) {
  let timer = Date.now();

  const flip = (dir: number) => ((dir * 17) >> 2) % 16;

  const q = input.indexOf('S');
  let i = (q / WIDTH) | 0,
    j = q % (WIDTH + 1),
    si = i,
    sj = j,
    s_type = 0;

  let steps = 1;
  let next_dir = 1; // random assignment

  const loopCells = new Set([`${i},${j}`]);

  function chooseDirectionFromS() {
    for (const [dir, [di, dj]] of Object.entries(Diff)) {
      const new_i = i + di,
        new_j = j + dj;
      if (new_i < 0 || new_i >= HEIGHT || new_j < 0 || new_j >= WIDTH) continue;
      const newcell = grid[new_i][new_j];
      const opposite_dir = flip(+dir);

      if (((Pipes[newcell] ?? 0) & opposite_dir) > 0) {
        next_dir = Pipes[newcell] - opposite_dir;
        (i = new_i), (j = new_j);
        s_type = +dir;
        return;
      }
    }
    throw new Error("Couldn't find anything");
  }

  chooseDirectionFromS();

  let curcell = grid[i][j];
  while (true) {
    loopCells.add(`${i},${j}`);
    const [di, dj] = Diff[next_dir];
    (i += di), (j += dj);
    steps++;
    if (i === si && j === sj) break;

    curcell = grid[i][j];
    next_dir = Pipes[curcell] - flip(next_dir);
  }

  console.log(`part ${part2 ? 2 : 1}:`, steps / 2);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');

  part2 = true;
  timer = Date.now();

  // replace S with its real meaning
  s_type |= flip(next_dir);
  const sShouldBe = _.invert(Pipes)[s_type];
  grid[si][sj] = sShouldBe;

  // clear all junk
  for (i = 0; i < HEIGHT; i++) {
    for (j = 0; j < WIDTH; j++) {
      if (!loopCells.has(`${i},${j}`)) {
        grid[i][j] = ' ';
      }
    }
  }

  // We can determine inner cells by traversing slices (left to right)
  // and keeping track of how many times we crossed over the loop's line
  //
  // One up and one down (0b0101 == 5) counts as a line traversal

  let insideCount = 0;
  grid.forEach((row) => {
    let inside = false, // we always start from outside
      edge = 0;
    row.forEach((cell) => {
      if (cell === ' ') {
        if (inside) insideCount++;
        return;
      }
      edge ^= Pipes[cell] & 0b0101;
      if (edge === 0b0101) {
        inside = !inside;
        edge = 0;
      }
    });
  });

  console.log(`part ${part2 ? 2 : 1}:`, insideCount);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
}

solve();
