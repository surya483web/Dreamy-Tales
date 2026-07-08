import fs from 'fs';

const js = fs.readFileSync('main_js.txt', 'utf-8');

console.log("Analyzing Angular HTTP configurations...");

// Find any interceptors or URL manipulation
// Search for "intercept(" or "HttpInterceptor"
const interceptRegex = /intercept\s*\(\s*[a-zA-Z0-9_]+\s*,\s*[a-zA-Z0-9_]+\s*\)\s*\{/g;
const interceptMatches = js.match(interceptRegex) || [];
console.log(`Found ${interceptMatches.length} interceptor patterns.`);

// Search for any strings starting with https:// and having "samaro"
const samaroUrls = js.match(/https?:\/\/[a-zA-Z0-9.-]*samaro[a-zA-Z0-9.-]*/gi) || [];
const uniqueSamaroUrls = [...new Set(samaroUrls)];
console.log("Unique samaro URLs found in JS:", uniqueSamaroUrls);

// Let's look for how "this._http" is used or if there is a helper method that prefixes urls
// Search for words like "url" or "api" around `_http` requests
// Let's search for "http.get" or "_http.get" and extract the surrounding block of text
const getIndices = [];
let idx = 0;
while (true) {
  idx = js.indexOf("this._http.get(", idx);
  if (idx === -1) break;
  getIndices.push(idx);
  idx += 15;
}
console.log(`Total 'this._http.get(' occurrences: ${getIndices.length}`);

// Let's print some other API endpoints we found in the app
// Let's look for "app/events" and see if there's any interceptor prepending a host
// Let's search for "clone(" which is used to modify request URLs in interceptors
const cloneIndices = [];
let cIdx = 0;
while (true) {
  cIdx = js.indexOf(".clone(", cIdx);
  if (cIdx === -1) break;
  const slice = js.slice(Math.max(0, cIdx - 150), Math.min(js.length, cIdx + 150));
  cloneIndices.push({ index: cIdx, text: slice });
  cIdx += 7;
  if (cloneIndices.length > 10) break;
}
console.log(`\nFound ${cloneIndices.length} occurrences of .clone() interceptor modification:`);
cloneIndices.forEach((occ, i) => {
  console.log(`Sample ${i}:\n  ${occ.text.replace(/\s+/g, ' ')}\n`);
});
