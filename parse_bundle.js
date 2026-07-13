const fs = require("fs");
const content = fs.readFileSync("live_bundle.js", "utf8");

const pattern = /(fee|pricing|price|enroll|inr|charges|cost|rs|rupees)/gi;
let match;
while ((match = pattern.exec(content)) !== null) {
  const start = Math.max(0, match.index - 150);
  const end = Math.min(content.Length || content.length, match.index + match[0].length + 150);
  const snippet = content.substring(start, end);
  console.log(`MATCH: "${match[0]}" at position ${match.index}`);
  console.log(`CONTEXT:\n...${snippet}...\n`);
  console.log("-".repeat(40));
}
