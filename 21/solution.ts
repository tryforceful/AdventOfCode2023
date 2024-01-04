import assert from 'assert';

const TEST = false;
const file = Bun.file(
  `${import.meta.dir}/${TEST ? 'sample' : 'input_x15'}.txt`,
);
const input = await file.text();
let grid = input
  .split('\n')
  .slice(0, -1)
  .map(x => x.split(''));

const dirDiff = [
  [-1, 0],
  [0, -1],
  [1, 0],
  [0, 1],
] as const;

const WIDTH = grid[0].length;
const HEIGHT = grid.length;

function* makeStepper(start_i: number, start_j: number, infinite: boolean) {
  let set = new Set([[start_i, start_j].join()]);

  while (true) {
    const points = [...set];
    set = new Set();
    for (const point of points) {
      const [a, b] = point.split(',');
      for (const [di, dj] of dirDiff) {
        const [ni, nj] = [+a + di, +b + dj];

        if (!infinite) {
          if (ni < 0 || nj < 0 || ni >= grid.length || nj >= grid[0].length)
            continue;
          if (grid[ni][nj] !== '#') set.add([ni, nj].join());
        } else {
          if (
            grid[((ni % HEIGHT) + HEIGHT) % HEIGHT][
              ((nj % WIDTH) + WIDTH) % WIDTH
            ] !== '#'
          )
            set.add([ni, nj].join());
        }
      }
    }
    yield set;
  }
  return set;
}

function part1() {
  let timer = Date.now();
  let answer = 0;

  const c = TEST ? 5 : 65;

  const stepper = makeStepper(c, c, false);

  let val = 0;
  for (let x = 1; x <= (TEST ? 6 : 64); x++) {
    val = stepper.next().value.size;
  }
  answer = val;

  console.log(`part ${false ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${false ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

function printGridToFile(num: number, set: Set<string>) {
  const g = JSON.parse(JSON.stringify(grid)) as string[][];
  const x = [...set].map(s => s.split(',').map(Number));

  let tileGrid = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  for (const [a, b] of x) {
    g[a][b] = 'O';

    tileGrid[(a / 131) | 0][(b / 131) | 0]++;
  }
  console.log(num, ':', tileGrid);

  const output = g.map(row => row.join('')).join('\n');

  Bun.write(`./temp/grid.${num}.txt`, output);

  return tileGrid;
}

function part2(part2 = true) {
  let timer = Date.now();
  let answer = 0;

  const ci = (HEIGHT - 1) / 2,
    cj = (WIDTH - 1) / 2;

  const stepper = makeStepper(ci, cj, false);

  let val = 0;
  let grid: number[][] = [[]];
  for (let x = 1; x <= 65 + 131 + 131; x++) {
    const res = stepper.next().value;
    val = res.size;
    if (65 + 131 + 131 === x) {
      console.log(x, res.size);
      grid = printGridToFile(x, res);
    }
  }

  // From printGridToFile:
  //   [0,    925,  5541, 937,  0    ],
  //   [925,  6459, 7354, 6444, 937  ],
  //   [5558, 7354, 7362, 7354, 5538 ],
  //   [936,  6461, 7354, 6456, 941  ],
  //   [0,    936,  5555, 941,  0    ];

  let odd = grid[2][2]; // = 7362;
  let even = grid[2][1]; // = 7354;
  let even_corners = grid[0][1] + grid[0][3] + grid[4][1] + grid[4][3]; // = 3739;
  let odd_corners = 4 * odd - grid[1][1] - grid[1][3] - grid[3][1] - grid[3][3]; // 3628;

  const f = (n: number) =>
    even * n * n +
    odd * (n + 1) * (n + 1) +
    even_corners * n -
    odd_corners * (n + 1);

  answer = f(202300);

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(part1() === (TEST ? 16 : 3615));

// part 2
assert(part2(true) === (TEST ? 0 : 602259568764234));
