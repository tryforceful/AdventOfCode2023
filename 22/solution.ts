import assert from 'assert';
import { intersection } from 'mnemonist/set';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
let data = input
  .split('\n')
  .slice(0, -1)
  .map(x => x.split('~').map(y => y.split(',').map(Number)) as [Coord, Coord]);

type Coord = [number, number, number];

class Brick {
  private static nameCounter = 0;

  public name: string;
  public cells: Coord[] = [];

  constructor(
    public start: Coord,
    public end: Coord,
  ) {
    this.name = String.fromCharCode(
      ...(TEST
        ? [Brick.nameCounter + 65]
        : [
            ((Brick.nameCounter / (26 * 26)) | 0) + 65,
            ((Brick.nameCounter / 26) % 26 | 0) + 65,
            (Brick.nameCounter % 26) + 65,
          ]),
    );
    Brick.nameCounter++;
  }

  get belowBlocks() {
    return new Set(
      this.cells
        .map(([x, y, z]) => grid[x][y][z - 1]?.name ?? '')
        .filter(x => x && x !== this.name),
    );
  }

  get aboveBlocks() {
    return new Set(
      this.cells
        .map(([x, y, z]) => grid[x][y][z + 1]?.name ?? '')
        .filter(x => x && x !== this.name),
    );
  }
}

const bricks: { [name: string]: Brick } = {};

let max_x = 0,
  max_y = 0,
  max_z = 0;

for (const [start, end] of data) {
  const b = new Brick(start, end);
  bricks[b.name] = b;

  const [x0, y0, z0] = start;
  const [x1, y1, z1] = end;
  max_x = Math.max(max_x, x0, x1);
  max_y = Math.max(max_y, y0, y1);
  max_z = Math.max(max_z, z0, z1);
}

const grid: (null | Brick)[][][] = new Array(max_x + 1)
  .fill(0)
  .map(() =>
    new Array(max_y + 1).fill(0).map(() => new Array(max_z + 1).fill(null)),
  );

// sorted from lowest to highest z
const z_sorted = Object.values(bricks).sort(
  (a, b) => Math.min(a.start[2], a.end[2]) - Math.min(b.start[2], b.end[2]),
);

for (const b of z_sorted) {
  let [x0, y0, z0] = b.start;
  let [x1, y1, z1] = b.end;

  // generate all coords
  const [dx, dy, dz] = [x1 - x0, y1 - y0, z1 - z0].map(Math.sign);
  let cells: Coord[] = [b.start];
  let [ix, iy, iz] = b.start;
  while (ix !== x1 || iy !== y1 || iz !== z1) {
    cells.push([(ix = ix + dx), (iy = iy + dy), (iz = iz + dz)]);
  }

  // move brick down if possible
  while (
    cells.every(c => c[2] > 1) &&
    cells.every(([x, y, z]) => !grid[x][y][z - 1])
  ) {
    cells = cells.map(([x, y, z]) => [x, y, z - 1]);
  }

  // save a record of the final cells on the brick instance
  b.cells = cells;

  // write brick to position in grid
  for (const [x, y, z] of cells) {
    grid[x][y][z] = b;
  }
}

function printGrid() {
  console.log(
    grid
      .map(x =>
        x
          .map(y => y.map(z => (z ? z.name : TEST ? ' ' : '   ')).join('|'))
          .join('\n'),
      )
      .join('\n\n'),
  );
}

function solve(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  // printGrid();

  function recurseNumFalling(
    b: Brick,
    fallenBricks = new Set([b.name]),
  ): number {
    let num = 0;

    for (const name of b.aboveBlocks) {
      const below = bricks[name].belowBlocks;
      if (intersection(below, fallenBricks).size === below.size) {
        fallenBricks.add(name);
        num += 1 + recurseNumFalling(bricks[name], fallenBricks);
      }
    }
    return num;
  }

  let answerPart1 = 0,
    answerPart2 = 0;

  for (const b of Object.values(bricks)) {
    let canDisintegrate = true;
    for (const name of b.aboveBlocks) {
      if (bricks[name].belowBlocks.size === 1) {
        canDisintegrate = false;
        break;
      }
    }
    if (canDisintegrate) answerPart1++;
    else answerPart2 += recurseNumFalling(b);
  }

  answer = part2 ? answerPart2 : answerPart1;
  console.log(`part ${false ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${false ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 5 : 471));

// part 2
assert(solve(true) === (TEST ? 7 : 68525));
