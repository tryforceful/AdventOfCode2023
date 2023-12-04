const file = Bun.file(`${import.meta.dir}/input.txt`);

const input = await file.text();
let rows = input.split('\n').slice(0, -1);

let sum = 0;

rows.forEach((row) => {
  const matches = row.match(/(\d)/g) ?? [];

  sum += Number(matches[0] + matches[matches.length - 1]);
  // console.log(row.match(/(\d)/g))
});

console.log(sum);
