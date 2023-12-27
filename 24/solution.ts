import assert from 'assert';
import { intersection } from 'mnemonist/set';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
let timer = Date.now();

type Coord = [number, number, number];

const data = input
  .split('\n')
  .slice(0, -1)
  .map(r => r.split(' @ ').map(x => x.split(',').map(Number)) as [Coord, Coord])
  .map(([point, delta]) => {
    const [x, y] = point,
      [dx, dy] = delta;

    const m = dy / dx;
    const b = y - m * x;

    return { point, delta, m, b };
  });

function part1() {
  let answer = 0;

  const MIN_BOUND = TEST ? 7 : 200000000000000;
  const MAX_BOUND = TEST ? 27 : 400000000000000;

  let numIntercepts = 0;

  for (let i = 0; i < data.length; i++) {
    for (let j = i + 1; j < data.length; j++) {
      const h1 = data[i],
        h2 = data[j];

      if (h1.m === h2.m) continue; //parallel

      // find intercept
      const ix = (h2.b - h1.b) / (h1.m - h2.m);
      const iy = h1.m * ix + h1.b;

      if (ix < MIN_BOUND || iy < MIN_BOUND || ix > MAX_BOUND || iy > MAX_BOUND)
        continue;

      // determine if in the past for either hailstone
      if (
        Math.sign(ix - h1.point[0]) !== Math.sign(h1.delta[0]) ||
        Math.sign(ix - h2.point[0]) !== Math.sign(h2.delta[0])
      )
        continue;

      numIntercepts++;
    }
  }

  answer = numIntercepts;

  console.log(`part 1:`, answer);
  console.log(`Time spent on part 1:`, Date.now() - timer, 'ms');
  return answer;
}

function part2() {
  let answer = 0;
  timer = Date.now();

  let possibleUs: null | Set<number> = null;
  let possibleVs: null | Set<number> = null;
  let possibleWs: null | Set<number> = null;

  for (let i = 0; i < data.length; i++) {
    for (let j = i + 1; j < data.length; j++) {
      const h1 = data[i],
        h2 = data[j];
      const [u1, v1, w1] = h1.delta;
      const [u2, v2, w2] = h2.delta;
      const [x1, y1, z1] = h1.point;
      const [x2, y2, z2] = h2.point;

      if (u1 === u2) {
        const dist = Math.abs(x2 - x1);

        let set = new Set<number>();

        for (let i = -1000; i <= 1000; i++) {
          if (dist % (i - u1) === 0) set.add(i);
        }
        possibleUs = possibleUs ? intersection(set, possibleUs) : set;
      }
      if (v1 === v2) {
        const dist = Math.abs(y2 - y1);

        let set = new Set<number>();

        for (let i = -1000; i <= 1000; i++) {
          if (dist % (i - v1) === 0) set.add(i);
        }
        possibleVs = possibleVs ? intersection(set, possibleVs) : set;
      }
      if (w1 === w2) {
        const dist = Math.abs(z2 - z1);

        let set = new Set<number>();

        for (let i = -1000; i <= 1000; i++) {
          if (dist % (i - w1) === 0) set.add(i);
        }
        possibleWs = possibleWs ? intersection(set, possibleWs) : set;
      }
    }
  }

  // at this point we happened to find the 3 coordinate velocities of the rock
  const u = [...possibleUs!][0];
  const v = [...possibleVs!][0];
  const w = [...possibleWs!][0];

  const [x1, y1, z1] = data[0].point;
  const [u1, v1, w1] = data[0].delta;
  const [x2, y2] = data[1].point;
  const [u2, v2] = data[1].delta;

  const x = Math.round(
    (-x1 * (v1 - v) * (u2 - u) +
      (u1 - u) * ((y1 - y2) * (u2 - u) + x2 * (v2 - v))) /
      ((v2 - v) * (u1 - u) - (v1 - v) * (u2 - u)),
  );
  const y = ((x - x1) * (v1 - v)) / (u1 - u) + y1;
  const z = ((x - x1) * (w1 - w)) / (u1 - u) + z1;

  answer = x + y + z;

  console.log(`part 2:`, answer);
  console.log(`Time spent on part 2:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(part1() === (TEST ? 2 : 13754));

// part 2
assert(part2() === (TEST ? 47 : 711031616315001));
