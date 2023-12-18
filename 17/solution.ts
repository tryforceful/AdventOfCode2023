import assert from 'assert';
import Heap from 'mnemonist/heap';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const grid = input
  .slice(0, -1)
  .split('\n')
  .map((x) => x.split('').map(Number));

enum Dir {
  N = 0b00,
  W = 0b01,
  S = 0b10,
  E = 0b11,
}

const dirDiff = [
  [-1, 0],
  [0, -1],
  [1, 0],
  [0, 1],
] as const;

class Cell {
  constructor(
    public i: number,
    public j: number,
    public facingDir: Dir,
  ) {}

  public get key(): string {
    return this.i + ',' + this.j + '|' + this.facingDir;
  }
}

const DIM = grid.length;

function h(cell: Cell) {
  return DIM + DIM - 2 - cell.i - cell.j;
}

function solve(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  const start1 = new Cell(0, 0, Dir.S);
  const start2 = new Cell(0, 0, Dir.E);

  const F = new Map<string, number>([
    [start1.key, h(start1)],
    [start2.key, h(start2)],
  ]);
  const G = new Map<string, number>([
    [start1.key, 0],
    [start2.key, 0],
  ]);

  const open = new Heap<Cell>(
    (a: Cell, b: Cell) => (F.get(a.key) ?? Infinity) - (F.get(b.key) ?? Infinity),
  );

  open.push(start1);
  open.push(start2);

  while (open.size) {
    const cur = open.pop()!;
    const [i, j] = [cur.i, cur.j];

    if (i === j && i === DIM - 1) {
      answer = F.get(cur.key) || answer;
      break;
    }

    const [di, dj] = dirDiff[cur.facingDir];

    // calculate neighbors
    for (const x of part2 ? [4, 5, 6, 7, 8, 9, 10] : [1, 2, 3]) {
      const [ni, nj] = [i + di * x, j + dj * x];

      if (ni < 0 || nj < 0 || ni >= DIM || nj >= DIM) continue;

      const left = new Cell(ni, nj, (cur.facingDir + 1) % 4);
      const right = new Cell(ni, nj, (cur.facingDir + 3) % 4);

      let tentativeG = G.get(cur.key) ?? Infinity;
      for (let q = 1; q <= x; q++) {
        tentativeG += grid[i + di * q][j + dj * q];
      }

      if (tentativeG < (G.get(left.key) ?? Infinity)) {
        G.set(left.key, tentativeG);
        F.set(left.key, tentativeG + h(left));
        open.push(left);
      }

      if (tentativeG < (G.get(right.key) ?? Infinity)) {
        G.set(right.key, tentativeG);
        F.set(right.key, tentativeG + h(right));
        open.push(right);
      }
    }
  }

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 102 : 866));

// part 2
assert(solve(true) === (TEST ? 94 : 1010));
