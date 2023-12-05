const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
let [_seeds, ..._map_ranges] = input.split('\n\n');

const seeds = _seeds.split(' ').slice(1).map(Number);
const map_ranges = _map_ranges.map((x) =>
  x
    .split('\n')
    .slice(1)
    .map((y) => y.split(' ').map(Number)),
) as [number, number, number][][];

function pipeThruMaps(input: number) {
  let val = input;
  for (const ranges of map_ranges) {
    for (const [dest, src, len] of ranges) {
      if (val >= src && val < src + len) {
        val = dest + val - src;
        break;
      }
    }
  }
  return val;
}

const nearestLocation = seeds.map(pipeThruMaps).reduce((a, b) => Math.min(a, b), Infinity);

import assert from 'assert';
console.log('part 1:', nearestLocation);
assert(nearestLocation === (TEST ? 35 : 379811651));

// part 2

const timer = Date.now();

function reversePipe(output: number) {
  let val = output;
  for (const ranges of map_ranges.toReversed()) {
    for (const [src, dest, len] of ranges) {
      if (val >= src && val < src + len) {
        val = dest + val - src;
        break;
      }
    }
  }
  return val;
}

import { chunk } from 'lodash';
const seed_ranges = chunk(seeds, 2) as [number, number][];

let output = 0;
loop: while (true) {
  const seed = reversePipe(output);

  for (const [start, len] of seed_ranges) {
    if (seed >= start && seed < start + len) {
      break loop;
    }
  }
  output++;
}

console.log('part 2:', output);
console.log('Time spent on part 2:', Date.now() - timer, 'ms');
assert(output === (TEST ? 46 : 27992443));
