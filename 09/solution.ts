import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const rows = input
  .split('\n')
  .slice(0, -1)
  .map((x) => x.split(' ').map(Number));

function solve(part2 = false) {
  const timer = Date.now();

  function derive(input: number[], backward = false): number {
    if (input.every((x) => x === 0)) return 0;
    const derivative: number[] = [];
    input.reduce((a, b) => {
      derivative.push(b - a);
      return b;
    });
    const res = derive(derivative, backward);
    return backward ? input[0] - res : input[input.length - 1] + res;
  }

  const sum = (a, b) => a + b;
  const answer = rows.map((i) => derive(i, part2)).reduce(sum);

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 114 : 1953784198));

// part 2
assert(solve(true) === (TEST ? 2 : 957));
