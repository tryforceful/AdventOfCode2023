import _ from 'lodash';
import assert from 'assert';

const TEST = true;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const grid = input
  .split('\n')
  .slice(0, -1)
  .map((x) => x.split(''));

let HEIGHT = grid.length;
let WIDTH = grid[0].length;

function solve(part2 = false) {
  let timer = Date.now();

  const EXPANSION_FACTOR = part2 ? 1000000 : 2;
  let answer = 0;

  const cols = _.range(WIDTH),
    rows = _.range(HEIGHT),
    emptyCols = new Set(cols),
    emptyRows = new Set(rows);

  // find rows/cols to expand, as well as galaxies
  const galaxies: [i: number, j: number][] = [];
  for (const i of rows)
    for (const j of cols) {
      if (grid[i][j] === '#') {
        emptyCols.delete(j);
        emptyRows.delete(i);
        galaxies.push([i, j]);
      }
    }

  const numGalaxies = galaxies.length;
  const pairs: [idx: number, idx2: number][] = [];
  for (let u = 0; u < numGalaxies; u++) {
    for (let v = u + 1; v < numGalaxies; v++) {
      pairs.push([u, v]);
    }
  }

  const _emptyRows = [...emptyRows],
    _emptyCols = [...emptyCols];

  for (const [u, v] of pairs) {
    const [i1, j1] = galaxies[u],
      [i2, j2] = galaxies[v];
    answer += Math.abs(i1 - i2) + Math.abs(j1 - j2); // initial observed distance

    answer +=
      (_emptyRows.filter((r) => (i1 < i2 ? r > i1 && r < i2 : r < i1 && r > i2)).length +
        _emptyCols.filter((c) => (j1 < j2 ? c > j1 && c < j2 : c < j1 && c > j2)).length) *
      (EXPANSION_FACTOR - 1);
  }

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 374 : 9563821));

// part 2
assert(solve(true) === (TEST ? 82000210 : 827009909817));
