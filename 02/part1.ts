const file = Bun.file(`${import.meta.dir}/input.txt`);
const input = await file.text();
let _rows = input.split('\n');
_rows.pop();

const rows = _rows
  .map((row) => row.split(/^Game \d+: |; /).slice(1))
  .map((row) => row.map(dieParser));
// .slice(0,10)

// console.log(rows)

const max = {
  red: 12,
  green: 13,
  blue: 14,
};
type Color = 'red' | 'green' | 'blue';

let sum = 0;

rows.forEach((row, index) => {
  // console.log(row)
  console.log('game', index + 1);
  for (let i = 0; i < row.length; i++) {
    const revealedDice = Object.entries(row[i]);
    console.log(revealedDice);

    for (let j = 0; j < revealedDice.length; j++) {
      const [color, num] = revealedDice[j];
      if (max[color as Color] < num) {
        console.log('hit a too high', color, num);
        return;
      }
    }
  }
  sum += index + 1;
});

console.log(sum);

function dieParser(diestring: string) {
  const obj: { [x: string]: number } = {};
  diestring.split(', ').forEach((die) => {
    const [num, color] = die.split(' ');
    obj[color] = +num;
  });
  return obj;
}
