import assert from 'assert';
import { isGeneratorObject } from 'util/types';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const [instructions, b] = input.split('\n\n');
const map = Object.fromEntries(
  b
    .split('\n')
    .slice(0, -1)
    .map((x) => x.split(/ = \(|, |\)/))
    .map(([a, b, c]) => [a, [b, c]]),
);

function solve(part2 = false) {
  const timer = Date.now();

  function* makeGhostTraveler(start: string) {
    let cur = start;
    let count = 1;
    let i = [...instructions];

    while (true) {
      const next = (i.shift() ?? ((i = [...instructions]) && i.shift())) === 'L' ? 0 : 1;
      cur = map[cur][next];

      if (part2 && cur[2] === 'Z') return count;
      else if (cur === 'ZZZ') return count;

      count++;
      yield false;
    }
  }

  let answer = 0;

  let ghosts: (Generator<boolean, number, void> | number)[] = [];
  if (!part2) {
    ghosts.push(makeGhostTraveler('AAA'));
  } else {
    for (const pos in map) {
      if (pos[2] === 'A') ghosts.push(makeGhostTraveler(pos));
    }
  }

  while (true) {
    ghosts = ghosts.map((g) => {
      if (isGeneratorObject(g)) {
        const r = g.next();
        if (r.done) return r.value;
      }
      return g;
    });

    if (ghosts.every((g) => typeof g === 'number')) break;
  }

  const lcm = (...arr: number[]) => {
    const gcd = (x: number, y: number) => (!y ? x : gcd(y, x % y));
    const _lcm = (x: number, y: number) => (x * y) / gcd(x, y);
    return [...arr].reduce((a, b) => _lcm(a, b));
  };

  answer = lcm(...(ghosts as number[]));

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 6 : 19783));

// part 2
assert(solve(true) === (TEST ? 19783 : 9177460370549));
