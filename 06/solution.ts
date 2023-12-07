import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();

function calcWins(_races: [number, number][]) {
  let res = 1;

  // // brute force way
  // for (const [time, distance] of races) {
  //   let wins = 0;
  //   let i = (time / 2) | 0;
  //   while (i * (time - i) > distance) {
  //     // console.log(i, i * (time - i));
  //     wins++;
  //     i--;
  //   }
  //   wins *= 2;
  //   if (time % 2 === 0) wins--;
  //   res *= wins;
  // }

  // quadratic way
  for (const [time, distance] of _races) {
    const root = Math.sqrt(time * time - 4 * distance);
    let wins = root | 0;
    if (root === wins) wins -= 2;
    if ((time - wins) % 2 === 1) wins--;
    res *= wins + 1;
  }
  return res;
}

// part 1
const timer = Date.now();

import _ from 'lodash';
const [times, distances] = input.split('\n').map((x) => (x.match(/\d+/g) ?? [])?.map(Number));
const races = _.zip(times, distances) as [number, number][];

const answer1 = calcWins(races);
console.log('part 1:', answer1);
console.log('Time spent on part 1:', Date.now() - timer, 'ms');
assert(answer1 === (TEST ? 288 : 3317888));

// part 2

const timer2 = Date.now();

const megarace = input
  .split('\n')
  .slice(0, -1)
  .map((x) => +x.split(/:\s+/)[1].replaceAll(/\s+/g, '')) as [number, number];

const answer2 = calcWins([megarace]);

console.log('part 2:', answer2);
console.log('Time spent on part 2:', Date.now() - timer2, 'ms');
assert(answer2 === (TEST ? 71503 : 24655068));
