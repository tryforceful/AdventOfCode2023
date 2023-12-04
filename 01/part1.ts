const file = Bun.file(`${import.meta.dir}/input.txt`);

const input = await file.text();
let rows = input.split('\n');
rows.pop();

// rows = rows.slice(0,10)
// console.log(rows)

let sum = 0;

rows.forEach((row) => {
  const matches = row.match(/(\d)/g) ?? [];

  sum += Number(matches[0] + matches[matches.length - 1]);
  // console.log(row.match(/(\d)/g))
});

console.log(sum);
