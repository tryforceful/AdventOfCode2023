const file = Bun.file(`${import.meta.dir}/input.txt`);
const input = await file.text();
let rows = input.split('\n').slice(0, -1);

let sum = 0;

const digit = {
  on: '1',
  tw: '2',
  thre: '3',
  fou: '4',
  fiv: '5',
  si: '6',
  seve: '7',
  eigh: '8',
  nin: '9',
} as const;

rows.forEach((row) => {
  const matches0 =
    row.match(
      /(\d)|on(?=e)|tw(?=o)|thre(?=e)|fou(?=r)|fiv(?=e)|si(?=x)|seve(?=n)|eigh(?=t)|nin(?=e)/g,
    ) ?? [];
  const matches = matches0.map((x) => digit[x as keyof typeof digit] ?? x);

  // console.log([...matches]);

  sum += Number(matches[0] + matches[matches.length - 1]);
});

console.log(sum);
