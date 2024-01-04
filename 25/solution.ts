import assert from 'assert';
import { UndirectedGraph } from 'graphology';
import traversal from 'graphology-traversal';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
let timer = Date.now();

const data = input
  .split('\n')
  .slice(0, -1)
  .map(x => x.split(': '))
  .map(([a, b]) => [a, b.split(' ')]);

function part1() {
  let answer = 0;

  const graph = new UndirectedGraph();

  for (const row of data) {
    graph.mergeNode(row[0]);
    for (const dest of row[1]) {
      graph.mergeNode(dest);
      graph.addEdgeWithKey(row[0] + '-' + dest, row[0], dest);
    }
  }

  // Determined by visual graph analysis:
  if (TEST) {
    graph.dropEdge('jqt', 'nvd');
    graph.dropEdge('hfx', 'pzl');
    graph.dropEdge('bvb', 'cmg');
  } else {
    graph.dropEdge('xxk', 'cth');
    graph.dropEdge('bbm', 'mzg');
    graph.dropEdge('nvt', 'zdj');
  }

  let a = 0,
    b = 0;
  traversal.dfsFromNode(graph, TEST ? 'bvb' : 'nvt', () => {
    a++;
  });
  traversal.dfsFromNode(graph, TEST ? 'cmg' : 'zdj', () => {
    b++;
  });

  answer = a * b;

  console.log(`part 1:`, answer);
  console.log(`Time spent on part 1:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(part1() === (TEST ? 54 : 601344));
