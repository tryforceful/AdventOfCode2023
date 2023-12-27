import assert from 'assert';
import Graph from 'graphology';
import { allSimpleEdgePaths } from 'graphology-simple-path';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
let grid = input
  .split('\n')
  .slice(0, -1)
  .map(x => x.split(''));

const HEIGHT = grid.length;
const WIDTH = grid[0].length;

const dirDiff = [
  [-1, 0, '^'],
  [0, -1, '<'],
  [1, 0, 'v'],
  [0, 1, '>'],
] as const;

const start = [0, 1];
const end = [HEIGHT - 1, WIDTH - 2];

function part1recursive() {
  let timer = Date.now();
  let answer = 0;

  function recurse(
    i: number = start[0],
    j: number = start[1],
    _visited: string[] = [],
  ): number {
    const visited = new Set(_visited);

    while (true) {
      if (i === end[0] && j === end[1]) return visited.size;

      const validNeighbors: [number, number][] = [];
      for (const [di, dj, angle] of dirDiff) {
        const [ni, nj] = [i + di, j + dj];
        if (ni < 0 || nj < 0 || ni >= HEIGHT || nj >= WIDTH) continue;

        const cell = grid[ni][nj];
        const key = `${ni},${nj}`;

        if (visited.has(key)) continue;

        if (!['.', angle].includes(cell)) continue;

        validNeighbors.push([ni, nj]);
      }

      visited.add(`${i},${j}`);

      if (validNeighbors.length > 1) {
        // recurse multiple paths from here
        return Math.max(
          ...validNeighbors.map(([ni, nj]) => recurse(ni, nj, [...visited])),
        );
      } else if (validNeighbors.length === 1) {
        [i, j] = validNeighbors[0];
        continue;
      }
      // no more possible routes on this path; return 0 so it is excluded
      else return 0;
    }
  }

  answer = recurse();

  console.log(`part 1:`, answer);
  console.log(`Time spent on part 1:`, Date.now() - timer, 'ms');
  return answer;
}

function solve(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  // first make a graph of the points
  const graph = new Graph({ type: part2 ? 'undirected' : 'directed' });

  graph.addNode(start.join());
  graph.addNode(end.join());

  const visited = new Set([start.join()]);

  function drawEdge(from_i: number, from_j: number, sourceNode: string) {
    let i = from_i,
      j = from_j;

    let spaces = 1;

    function addEdge(toKey: string) {
      if (part2) graph.addEdge(sourceNode, toKey, { weight: spaces });
      else graph.addDirectedEdge(sourceNode, toKey, { weight: spaces });
    }

    while (true) {
      const currentkey = `${i},${j}`;
      visited.add(currentkey);

      if (graph.hasNode(currentkey) && spaces > 1) {
        addEdge(currentkey);
        return;
      }

      const validNeighbors: [number, number][] = [];
      let numNeighborArrows = 0;
      for (const [di, dj, angle] of dirDiff) {
        const [ni, nj] = [i + di, j + dj];
        if (ni < 0 || nj < 0 || ni >= HEIGHT || nj >= WIDTH) continue;

        const cell = grid[ni][nj];
        const key = `${ni},${nj}`;

        if (visited.has(key)) {
          if (spaces <= 1) continue;
          if (!graph.hasNode(key)) continue;
        }

        if (['^', '<', 'v', '>'].includes(cell)) numNeighborArrows++;

        if (!(part2 ? ['.', '^', '<', 'v', '>'] : ['.', angle]).includes(cell))
          continue;

        validNeighbors.push([ni, nj]);
      }

      if (numNeighborArrows > 1) {
        // we are on a node cell. make it so.
        graph.mergeNode(currentkey);
      }

      if (graph.hasNode(currentkey)) {
        addEdge(currentkey);

        for (const [ni, nj] of validNeighbors) {
          drawEdge(ni, nj, currentkey);
        }
        return;
      }

      if (validNeighbors.length === 1) {
        [i, j] = validNeighbors[0];
        spaces++;
      } else return;
    }
  }

  drawEdge(1, 1, '0,1');

  const edges: { [x: string]: number } = {};

  for (const x of graph.edgeEntries()) {
    edges[x.edge] = +x.attributes.weight;
  }

  // 1262816 of them for the real input! :o
  const paths = allSimpleEdgePaths(
    graph,
    start.join(),
    part2 && !TEST ? `129,137` : end.join(),
  );

  let max = 0;
  for (const path of paths) {
    const sum = path
      .map(edge => edges[edge])
      .reduce((a, b) => a + b, part2 && !TEST ? 29 : 0);
    if (sum > max) max = sum;
  }
  answer = max;

  function printToDotFile(graph: Graph) {
    const f = Bun.file(
      `${import.meta.dir}/${part2 ? 'part2' : 'part1'}${
        TEST ? 'sample' : 'input'
      }.dot`,
    );
    const w = f.writer();
    w.start();
    w.write(`strict ${part2 ? '' : 'di'}graph day23 {
`);

    graph.forEachEdge((edge, attributes, source, target) => {
      w.write(
        `  "${source}" ${part2 ? '--' : '->'} "${target}" [weight=${
          attributes.weight
        }] [label=${attributes.weight}]\n`,
      );
    });

    w.write(`}`);
    w.end();
  }

  printToDotFile(graph);

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 94 : 2190));

// part 2 finishes in 6 seconds
assert(solve(true) === (TEST ? 154 : 6258));
