const file = Bun.file(`${import.meta.dir}/input.txt`);
const input = await file.text();
let _rows = input.split('\n');
_rows.pop();

const rows = _rows
  .map((row) => row.split(/^Game \d+: |; /).slice(1))
  .map((row) => row.map(dieParser));

let sum = 0;

type Color = 'red' | 'green' | 'blue';

rows.forEach((row, index) => {
  // console.log(row)
  console.log('game', index + 1);

  const greatest = { red: 0, blue: 0, green: 0 };

  row.forEach((pull) => {
    const revealedDice = Object.entries(pull);
    console.log(revealedDice);

    for (let j = 0; j < revealedDice.length; j++) {
      const [color, num] = revealedDice[j];
      greatest[color as Color] = Math.max(num, greatest[color as Color]);
    }
  });

  const { red, blue, green } = greatest;
  console.log(greatest);
  sum += red * blue * green;
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
