import _ from 'lodash';
import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const rows = input
  .split('\n')
  .slice(0, -1)
  .map((x) => x.split(' ') as [string, string]);

const sum = (a: number, b: number) => b + a;

function solve(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  const memo: { [x: string]: number } = {};

  function recurse(str: string, hashes: number[]) {
    if (!hashes.length) return +!~str.indexOf('#');
    if (hashes.length && !str.length) return 0;
    if (hashes.reduce(sum, 0) + hashes.length - 1 > str.length) return 0;

    const key = trimDots(str) + ';' + hashes;
    const maybeMemo = memo[key];
    if (maybeMemo !== undefined) return maybeMemo;

    const max = Math.max(...hashes);

    const reg = new RegExp(`[.?][?#]{${max}}[.?]`);

    let results = 0;

    for (let i = 0; i < str.length - max - 1; i++) {
      if (reg.test(str.slice(i, i + max + 2))) {
        const idx = hashes.indexOf(max);
        const leftstr = str.slice(0, i);
        const leftarr = hashes.slice(0, idx);

        let a = recurse(leftstr + '.', leftarr);
        if (!a) continue;

        const rightstr = str.slice(i + max + 2);
        const rightarr = hashes.slice(idx + 1);
        a *= recurse('.' + rightstr, rightarr);

        results += a;
      }
    }

    memo[key] = results;

    return results;
  }

  function trimDots(input: string) {
    return input.match(/^\.*([^\.].*[^\.])\.*$/)?.[1] ?? input;
  }

  function processRow(str: string, hashes: string): number {
    if (part2) {
      str = _.repeat('?' + str, 5).slice(1);
      hashes = _.repeat(',' + hashes, 5).slice(1);
    }

    return recurse('.' + trimDots(str) + '.', hashes.split(',').map(Number));
  }

  for (const row of rows) {
    answer += processRow(...row);
  }

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 21 : 7084));

// part 2
assert(solve(true) === (TEST ? 525152 : 8414003326821));
