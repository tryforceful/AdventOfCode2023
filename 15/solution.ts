import _ from 'lodash';
import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const list = input.slice(0, -1).split(',');

function solve(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  function hash(str: string) {
    let res = 0;
    for (const x of [...str]) {
      res = ((res + x.charCodeAt(0)) * 17) % 256;
    }
    return res;
  }

  if (!part2) {
    for (const instruction of list) answer += hash(instruction);
  } else {
    const instr = list.map((x) => x.match(/([a-z]+)([-=])(\d*)/)?.slice(1)) as [
      string,
      '=' | '-',
      string,
    ][];

    type Lens = { label: string; focal: number };
    const boxes: { [x: number]: Lens[] } = {};

    for (const [label, op, num] of instr) {
      const label_hash = hash(label);

      const box = boxes[label_hash] ?? (boxes[label_hash] = []);
      const idx = box.findIndex((x) => x.label === label);

      if (op === '-') {
        if (~idx) box.splice(idx, 1);
      } else {
        const new_lens = { label, focal: +num };
        if (~idx) box[idx] = new_lens;
        else box.push(new_lens);
      }
    }

    // calculate total focus power
    answer = Object.entries(boxes).reduce(
      (acc, [box_id, box_contents]) =>
        acc + box_contents.reduce((a, c, i) => a + (i + 1) * (+box_id + 1) * c.focal, 0),
      0,
    );
  }

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 1320 : 510013));

// part 2
assert(solve(true) === (TEST ? 145 : 268497));
