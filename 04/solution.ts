const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
let rows = input
  .split('\n')
  .map((x) =>
    x
      .split(/Card\s+\d+:\s+| \| /)
      .slice(1)
      .map((y) => y.split(/\s+/).map(Number))
      .map((y) => new Set(y)),
  )
  .slice(0, -1);

import assert from 'assert';
import { intersection } from 'mnemonist/set';

const wins = rows.map(([correct, guess]) => intersection(correct, guess).size);

const sum = wins
  .map((i) => (i ? 2 ** (i - 1) : 0)) // points
  .reduce((a, b) => a + b, 0);

console.log('Part 1:', sum);
assert(sum === (TEST ? 13 : 21568));

// Part 2

const cards = new Array(rows.length).fill(1);

for (let i = 0; i < rows.length; i++) {
  for (let j = i + 1; j <= i + wins[i]; j++) {
    cards[j] += cards[i];
  }
}
const sum2 = cards.reduce((a, b) => a + b, 0);

console.log('Part 2:', sum2);
assert(sum2 === (TEST ? 30 : 11827296));
