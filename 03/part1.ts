const file = Bun.file(`${import.meta.dir}/input.txt`);
const input = await file.text();
let rows = input
  .split('\n')
  .map((x) => x.split(''))
  .slice(0, -1);

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

for (i = 0; i < DIMENSION; i++) for (j = 0; j < DIMENSION; j++) examinePoint(i, j);

console.log(sum);

function examinePoint(y: number, x: number) {
  const char = rows[y][x];

  if (IS_DIGIT.test(char)) {
    let q = x + 1;
    while (q < DIMENSION && IS_DIGIT.test(rows[y][q])) q++;
    q--;
    // Range of number is now [y][x -> q], inclusive

    inspectEnvirons(y, x, q);

    // move past this number
    j = q + 1;
  }
}

function inspectEnvirons(row: number, from: number, to: number) {
  const num = +rows[row].slice(from, to + 1).join('');

  let symbol_found = false;
  for (let x = from; x <= to; x++)
    for (const [a, b] of NEIGHBORS) {
      if (row + a < 0 || row + a >= DIMENSION) continue;
      if (x + b < 0 || x + b >= DIMENSION) continue;

      const neighbor = rows[row + a][x + b];

      if (/[^.\d]/.test(neighbor)) {
        symbol_found = true;
        sum += num;
        return;
      }
    }
}
