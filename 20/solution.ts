import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample2' : 'input'}.txt`);
const input = await file.text();

// Classes

abstract class Module {
  constructor(
    public name: string,
    public outputs: string[],
  ) {}

  abstract pulse(input: boolean, source: string): void;
}

class Broadcaster extends Module {
  pulse() {
    for (const out of this.outputs) {
      queue.push([out, false, this.name]);
      trackPulse(false);
    }
  }
}

class FlipFlop extends Module {
  private state: boolean = false;

  pulse(input: boolean) {
    if (!input) {
      this.state = !this.state;

      for (const out of this.outputs) {
        queue.push([out, this.state, this.name]);
        trackPulse(this.state);
      }
    }
  }
}

class Conjunction extends Module {
  private inputs: { [x: string]: boolean } = {};

  addInput(module: string) {
    this.inputs[module] = false;
  }

  pulse(input: boolean, source: string) {
    if (!(source in this.inputs))
      throw new Error('Source not in inputs! ' + source);

    this.inputs[source] = input;

    const output = !Object.values(this.inputs).every(x => x === true);

    if (output && this.name in part2Nands)
      part2Nands[this.name] = numButtonPresses;

    for (const out of this.outputs) {
      queue.push([out, output, this.name]);
      trackPulse(output);
    }
  }
}

////////

const _data = input
  .split('\n')
  .slice(0, -1)
  .map(x => x.split(' -> '));

const broadcaster = new Broadcaster(
  'broadcaster',
  _data.find(x => x[0] === 'broadcaster')?.[1].split(', ')!,
);

const data = _data
  .filter(x => x[0] !== 'broadcaster')
  .map(([a, b]) => [a.slice(1), a[0], b.split(', ')]) as [
  string,
  '%' | '&',
  string[],
][];

// System State

let mods: { [x: string]: Module } = {};
let conjunctions = new Set<string>();
let queue: [module: string, pulse: boolean, source: string][] = [];
let lowCount = 0;
let highCount = 0;
let numButtonPresses = 0;
const part2Nands: { [x: string]: number | 0 } = {};

function initModules() {
  lowCount = 0;
  highCount = 0;
  queue = [];
  mods = {};
  numButtonPresses = 0;

  data
    .filter(x => x[1] === '&')
    .forEach(([name, , outputs]) => {
      mods[name] = new Conjunction(name, outputs);
      conjunctions.add(name);
    });

  data.forEach(([name, type, outputs]) => {
    for (const out of outputs) {
      if (conjunctions.has(out)) {
        (mods[out] as Conjunction).addInput(name);
      }
    }

    if (type === '%') {
      mods[name] = new FlipFlop(name, outputs);
    }
  });
}

function trackPulse(val: boolean) {
  if (val) highCount++;
  else lowCount++;
}

function pushButton(): void {
  lowCount++;
  numButtonPresses++;
  broadcaster.pulse();

  while (queue.length) {
    const [module, signal, source] = queue.shift()!;
    if (module in mods) mods[module].pulse(signal, source);
  }
}

function part1() {
  let answer = 0;
  const timer = Date.now();

  initModules();

  while (numButtonPresses < 1000) pushButton();

  answer = lowCount * highCount;

  console.log(`part 1:`, answer);
  console.log(`Time spent on part 1:`, Date.now() - timer, 'ms');
  return answer;
}

function part2() {
  let answer = 0;
  const timer = Date.now();

  initModules();

  // find conjunction nodes that we want to keep track of
  const node1 = data.find(row => ~row[2].findIndex(x => x === 'rx'))?.[0];
  data
    .filter(row => ~row[2].findIndex(x => x === node1))
    .forEach(x => (part2Nands[x[0]] = 0));

  if (Object.values(part2Nands).length !== 4)
    throw new Error("Couldn't find proper conjunction nodes for part 2");

  while ((answer = Object.values(part2Nands).reduce((a, b) => a * b, 1)) === 0)
    pushButton();

  console.log(`part 2:`, answer);
  console.log(`Time spent on part 2:`, Date.now() - timer, 'ms');
  return answer;
}

assert(part1() === (TEST ? 11687500 : 1020211150));

assert(TEST ? true : part2() === 238815727638557);
