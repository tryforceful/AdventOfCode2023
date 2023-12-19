import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
let timer = Date.now();
const [_w, _p] = input.split('\n\n');

const workflows = _w
  .split('\n')
  .map((x) => x.match(/^([a-z]+)\{(.*)\}$/)?.slice(1)!)
  .map((x) => [x[0], x[1].split(',')] as [string, string[]]);

type Part = {
  x: number;
  m: number;
  a: number;
  s: number;
};

function part1() {
  let answer = 0;

  const parts: Part[] = _p
    .split('\n')
    .slice(0, -1)
    .map(
      (x) =>
        x
          .match(/^\{x=(\d+),m=(\d+),a=(\d+),s=(\d+)\}$/)
          ?.slice(1)
          .map(Number)!,
    )
    .map(([x, m, a, s]) => ({ x, m, a, s }));

  const workflowMap = Object.fromEntries(
    workflows.map(([key, val]) => [
      key,
      (function enclosure() {
        const directions = val;
        return function ({ x, m, a, s }: Part): string {
          for (const d of directions.slice(0, -1)) {
            const [ineq, redir] = d.split(':');
            const res = eval(
              ineq
                .replace('x', String(x))
                .replace('m', String(m))
                .replace('a', String(a))
                .replace('s', String(s)),
            );
            if (res) return redir;
          }

          return directions[directions.length - 1];
        };
      })(),
    ]),
  );

  const results = parts.map((part) => {
    let res = 'in';
    while (!['A', 'R'].includes((res = workflowMap[res](part)))) {}

    return res === 'A' ? part.x + part.m + part.a + part.s : 0;
  });

  answer = results.reduce((a, c) => a + c, 0);

  console.log(`part 1:`, answer);
  console.log(`Time spent on part 1:`, Date.now() - timer, 'ms');
  return answer;
}

function part2() {
  let answer = 0;
  timer = Date.now();

  const workflowMap = Object.fromEntries(
    workflows.map(([key, val]) => [
      key,
      val.map((x) =>
        ~x.indexOf(':')
          ? (x.match(/^([xmas])([<>])(\d+):(.+)$/)?.slice(1)! as [
              keyof Part,
              '<' | '>',
              string,
              string,
            ])
          : x,
      ),
    ]),
  );

  type Condition = [keyof Part, '<' | '>', string, boolean];

  let possibilities: Condition[][] = [];

  function recurse(workflowName: string, conditions: Condition[] = []): void {
    const w = workflowMap[workflowName];

    for (const step of w) {
      if (step instanceof Array) {
        const [val, comp, num, res] = step;
        if (res === 'A') {
          possibilities.push([...conditions, [val, comp, num, true]]);
        } else if (res !== 'R') {
          recurse(res, [...conditions, [val, comp, num, true]]);
        }
        conditions.push([val, comp, num, false]);
      } else {
        if (step === 'R') return;
        else if (step === 'A') possibilities.push(conditions);
        else recurse(step, conditions);
      }
    }
  }

  recurse('in');

  for (const branch of possibilities) {
    const ranges = {
      x: [1, 4000],
      m: [1, 4000],
      a: [1, 4000],
      s: [1, 4000],
    };

    for (const [set, op, num, sign] of branch) {
      const f = (op === '<') === sign ? Math.min : Math.max;
      const n = !sign ? +num : op === '<' ? +num - 1 : +num + 1;

      ranges[set] = [f(ranges[set][0], n), f(ranges[set][1], n)];
    }

    answer += Object.values(ranges).reduce((a, [min, max]) => (max - min + 1) * a, 1);
  }

  console.log(`part 2:`, answer);
  console.log(`Time spent on part 2:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(part1() === (TEST ? 19114 : 346230));

// part 2
assert(part2() === (TEST ? 167409079868000 : 124693661917133));
