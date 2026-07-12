import fs from 'fs';

const js = fs.readFileSync('main_js.txt', 'utf-8');

console.log("Searching for public-gallery endpoints...");

let idx = 0;
const occurrences = [];
while (true) {
  idx = js.indexOf("public-gallery", idx);
  if (idx === -1) break;
  occurrences.push(idx);
  idx += 14;
}

console.log(`Found ${occurrences.length} occurrences.`);
occurrences.forEach((pos, i) => {
  const slice = js.slice(Math.max(0, pos - 150), Math.min(js.length, pos + 150));
  console.log(`\nOccurrence ${i} (pos ${pos}):\n  ${slice.replace(/\s+/g, ' ')}`);
});
