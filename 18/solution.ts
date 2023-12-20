import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
let digs = input
  .split('\n')
  .slice(0, -1)
  .map((x) => x.match(/([RLDU]) (\d+) \(\#([a-f0-9]{6})\)/)!.slice(1))
  .map(([a, b, c]) => [a, +b, c] as [keyof typeof dirDiff, number, string]);

enum Dir {
  U = 0b00,
  L = 0b01,
  D = 0b10,
  R = 0b11,
}

const dirDiff = {
  U: [-1, 0],
  L: [0, -1],
  D: [1, 0],
  R: [0, 1],
} as const;

// function abandonedPart1Solution() {
//   let timer = Date.now();
//   let answer = 0;

//   let down = 0,
//     right = 0;
//   digs.forEach(([dir, num]) => {
//     if (dir === 'D') down += +num;
//     else if (dir === 'R') right += +num;
//   });

//   const lagoon = new Array(down * 2).fill(0).map(() => new Array(right * 2).fill('.'));

//   let i = down - 1,
//     j = right - 1;
//   lagoon[i][j] === '#';
 
//   let lastDir: keyof typeof dirDiff = 'R'; //arbitrary assignment
//   digs.forEach(([dir, num]) => {
//     const angle = (Dir[dir] ^ Dir[lastDir]) === 0b11 ? '/' : '\\';
//     lagoon[i][j] = angle;

//     const [di, dj] = dirDiff[dir];
//     for (let q = 0; q < +num; q++) {
//       i += di;
//       j += dj;
//       lagoon[i][j] = ['R', 'L'].includes(dir) ? '-' : '|';
//     }
//     lastDir = dir;
//   });

//   lagoon[i][j] = (Dir[digs[digs.length - 1][0]] ^ Dir[digs[0][0]]) === 0b11 ? '/' : '\\';

//   let inside = false,
//     edge: string | null = null;
//   for (const row of lagoon) {
//     inside = false;
//     for (const cell of row) {
//       if (cell !== '.' || inside) answer++;

//       if (cell === '/' || cell === '\\') {
//         if (edge === null) edge = cell;
//         else {
//           if (edge === cell) inside = !inside;
//           edge = null;
//         }
//       } else if (cell === '|') inside = !inside;
//     }
//   }

//   // console.log(lagoon.map((x) => x.join('')).join('\n'));
//   // const q = Bun.file('lagoon.txt').writer();
//   // q.write(lagoon.map((x) => x.join('')).join('\n'));
//   // q.end();

//   console.log(`part ${false ? 2 : 1}:`, answer);
//   console.log(`Time spent on part ${false ? 2 : 1}:`, Date.now() - timer, 'ms');
//   return answer;
// }

function solve(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  if (part2) {
    digs = digs.map(([, , c]) => {
      const dist = parseInt(c.slice(0, 5), 16);
      const dir = Dir[3 - parseInt(c.charAt(5), 16)];

      return [dir as keyof typeof dirDiff, dist, c];
    }); 
  }

  type Slash = '\\' | '/';

  const rows: { [x: string]: [Slash, number, number, Slash | null][] } = {};
  const cols: { [x: string]: [Slash, number, number, Slash | null][] } = {};
  let i = 0,
    j = 0;

  let lastDir: keyof typeof dirDiff = digs[digs.length - 1][0];
  let lastArr: [Slash, number, number, Slash | null] = ['/',0,0,null]; //arbitrary initial assignment

  digs.forEach(([dir, num]) => {
    const angle = (Dir[dir] ^ Dir[lastDir]) === 0b11 ? '/' : '\\';
    lastArr[3] = angle;

    if (['R', 'L'].includes(dir)) {
      const sign = dir === 'R' ? 1 : -1;
      lastArr = [angle, j, j + sign * num, null];
      (rows[i] ?? (rows[i] = [])).push(lastArr);
      j += sign * num;
    } else {
      const sign = dir === 'D' ? 1 : -1;
      lastArr = [angle, i, i + sign * num, null];
      (cols[j] ?? (cols[j] = [])).push(lastArr);
      i += sign * num;
    }
    lastDir = dir;
  });
  const angle = (Dir[digs[digs.length - 1][0]] ^ Dir[digs[0][0]]) === 0b11 ? '/' : '\\';
  lastArr[3] = angle;
 
  const rowKeys = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);
  const colKeys = Object.keys(cols)
    .map(Number)
    .sort((a, b) => a - b); 
 
  let lastRowIdx = Math.min(...rowKeys);
  for (const rowIdx of rowKeys) {
    answer += getRowCount(rowIdx);

    if (rowIdx - lastRowIdx > 1) {
      answer += getRowCount(rowIdx - 1) * (rowIdx - lastRowIdx - 1);
    }
    lastRowIdx = rowIdx;
  }

  function getRowCount(i: number) {
    let inside: 0 | 1 | 2 | 3 = 0,
      edge: Slash | null = null,
      thisRow = 0;

    let startCountIdx = -Infinity;
    for (const colIdx of colKeys) {
      const colRanges = cols[colIdx];

      for (const [start_char, start, end, end_char] of colRanges) {
        const lower = start < end ? start : end,
          higher = start < end ? end : start;

        if(i < lower || i > higher) continue; // nothing to do with this range
        else if(i === lower || i === higher) {

          const charToLookAt = i===start ? start_char : end_char!;

          if (edge === null) {
            edge = charToLookAt;
            inside = ((inside + 1) % 4) as 0 | 1 | 2 | 3; 

            if(inside === 1) startCountIdx = colIdx;
          }
          else {
            if (edge !== charToLookAt) {
              // nothing happened, but still treat this edge section as counted.
              inside -= 1;
            } else {
              // proceeding to finish off the edge
              inside = ((inside + 1) % 4) as 0 | 1 | 2 | 3;
            }

            if (!inside) thisRow += colIdx - startCountIdx + 1; // we just closed the section
            edge = null;
          }

          break;
        }
        else {
          // we are inside a col range, going to flip over a | boundary
          inside = ((inside + 2) % 4) as 0 | 1 | 2 | 3;

          if (!inside) thisRow += colIdx - startCountIdx + 1; // we just closed the section

          startCountIdx = colIdx;
          break;
        }
      }
    }
 
    return thisRow;
  }

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

function pickShoelaceMethod(part2 = false) {
  let timer = Date.now();
  let answer = 0;

  if (part2) {
    digs = digs.map(([, , c]) => {
      const dist = parseInt(c.slice(0, 5), 16);
      const dir = Dir[3 - parseInt(c.charAt(5), 16)];

      return [dir as keyof typeof dirDiff, dist, c];
    });
  }

  let i = 0, j = 0;
  let determinant = 0;
  let borderCount = 0;
 
  digs.forEach(([dir, num]) => {
    const [di, dj] = dirDiff[dir];
    const [ni, nj] = [i + di * num, j + dj * num];

    determinant += i * nj - j * ni;
    borderCount += num;
    [i, j] = [ni, nj];
  });
  determinant = Math.abs(determinant / 2);

  answer = determinant + borderCount / 2 + 1;

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve(false) === (TEST ? 62 : 58550));
assert(pickShoelaceMethod() === (TEST ? 62 : 58550));

// part 2
assert(solve(true) === (TEST ? 952408144115 : 47452118468566));
assert(pickShoelaceMethod(true) === (TEST ? 952408144115 : 47452118468566));
