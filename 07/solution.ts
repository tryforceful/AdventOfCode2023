import assert from 'assert';

const TEST = false;
const file = Bun.file(`${import.meta.dir}/${TEST ? 'sample' : 'input'}.txt`);
const input = await file.text();
const hands = input
  .split('\n')
  .slice(0, -1)
  .map((x) => x.split(' '));

enum HandType {
  HIGH = 1,
  ONE_PAIR,
  TWO_PAIR,
  THREE_KIND,
  FULL_HOUSE,
  FOUR_KIND,
  FIVE_KIND,
}

type HandObj = [string, string, HandType];

function solve(part2 = false) {
  const timer = Date.now();

  const hands2 = hands.map((row) => [...row, determineType(row[0])]) as HandObj[];

  hands2.sort(handSorter);

  const answer = hands2.reduce((a, c, i) => a + (i + 1) * +c[1], 0);

  function determineType(input: string): HandType {
    if (part2 && ~input.indexOf('J')) {
      let max = HandType.HIGH;

      for (const x of 'AQKT98765432') {
        const res = determineType(String(input).replaceAll('J', x));
        max = Math.max(res, max);
      }
      return max;
    }

    const cards = [...input];
    const set = new Set(cards);

    if (set.size === 5) return HandType.HIGH;
    if (set.size === 4) return HandType.ONE_PAIR;

    const x = cards.sort().join(''),
      mid = x.charAt(2),
      dist = x.lastIndexOf(mid) - x.indexOf(mid);

    if (dist === 4) return HandType.FIVE_KIND;
    if (dist === 3) return HandType.FOUR_KIND;
    if (set.size === 2) return HandType.FULL_HOUSE;
    if (dist === 2) return HandType.THREE_KIND;
    return HandType.TWO_PAIR;
  }

  function handSorter([handA, , typeA]: HandObj, [handB, , typeB]: HandObj): number {
    const FaceCard = {
      T: 10,
      J: part2 ? 1 : 11,
      Q: 12,
      K: 13,
      A: 14,
    } as const;

    if (typeA !== typeB) return typeA - typeB;

    for (let i = 0; i < 5; i++) {
      const a = FaceCard[handA[i]] ?? +handA[i];
      const b = FaceCard[handB[i]] ?? +handB[i];
      if (a !== b) return a - b;
    }

    return 0;
  }

  console.log(`part ${part2 ? 2 : 1}:`, answer);
  console.log(`Time spent on part ${part2 ? 2 : 1}:`, Date.now() - timer, 'ms');
  return answer;
}

// part 1
assert(solve() === (TEST ? 6440 : 250474325));
// part 2
assert(solve(true) === (TEST ? 5905 : 248909434));
