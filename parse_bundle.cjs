const fs = require("fs");
const content = fs.readFileSync("live_bundle.js", "utf8");

// Search for typical firebase config keys
const pattern = /apiKey\s*:\s*"[^"]+"|projectId\s*:\s*"[^"]+"|authDomain\s*:\s*"[^"]+"/gi;
let match;
const matches = [];

while ((match = pattern.exec(content)) !== null) {
  matches.push({
    match: match[0],
    position: match.index,
  });
}

console.log(`Found ${matches.length} firebase config matches:`);
matches.forEach((m) => {
  console.log(`POSITION ${m.position}: ${m.match}`);
});
