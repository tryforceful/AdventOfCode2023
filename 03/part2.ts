const file = Bun.file(`${import.meta.dir}/input.txt`);
const input = await file.text();
let rows = input.split('\n').map((x) => x.split(''));
rows.pop();

const DIMENSION = rows.length;
const NEIGHBORS = [
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
];
const IS_DIGIT = /\d/;

let i, j;
let sum = 0;

for (i = 0; i < DIMENSION; i++)
  for (j = 0; j < DIMENSION; j++) if (IS_DIGIT.test(rows[i][j])) determineNumberFromDigits(i, j);

for (i = 0; i < DIMENSION; i++)
  for (j = 0; j < DIMENSION; j++) if (rows[i][j] === '*') inspectGearEnvirons(i, j);

console.log(sum);

///////////////

function determineNumberFromDigits(y: number, x: number) {
  let q = x + 1;
  while (q < DIMENSION && IS_DIGIT.test(rows[y][q])) q++;
  q--;

  // Range of number is now [y][x -> q], inclusive
  const num = rows[y].slice(x, q + 1).join('');

  // Replace textual digits with real number
  for (let f = x; f <= q; f++) rows[y][f] = num;

  // move past this number
  j = q + 1;
}

function inspectGearEnvirons(row: number, col: number) {
  const neighbor_nums = new Set<number>();

  for (const [a, b] of NEIGHBORS) {
    if (row + a < 0 || row + a >= DIMENSION) continue;
    if (col + b < 0 || col + b >= DIMENSION) continue;

    const neighbor = rows[row + a][col + b];

    if (/\d+/.test(neighbor)) {
      neighbor_nums.add(+neighbor);
    }
  }

  if (neighbor_nums.size === 2) sum += [...neighbor_nums].reduce((a, b) => a * b, 1);
}
