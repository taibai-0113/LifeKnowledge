const fs = require("fs");
const path = require("path");

const htmlPath = path.resolve(__dirname, "../data/how-to-live-better.html");
const html = fs.readFileSync(htmlPath, "utf8");

const cardMatches = html.match(/<article class="card"/g) || [];
console.log("Total cards in how-to-live-better.html:", cardMatches.length);

const h2Matches = html.match(/<h2>(.*?)<\/h2>/g) || [];
console.log("Total chapters in how-to-live-better.html:", h2Matches.length);
console.log("Chapters sample:", h2Matches.slice(0, 10));

// Check 150 bundle
const p150 = path.resolve(__dirname, "../data/life_blindspots_150_new_bundle/life_blindspots_150.json");
const data150 = JSON.parse(fs.readFileSync(p150, "utf8"));
console.log("150 bundle items count:", data150.items ? data150.items.length : (data150.cards ? data150.cards.length : "unknown"));

// Check 1000 bundle
const p1000 = path.resolve(__dirname, "../data/life_blindspots_1000_new_bundle/life_blindspots_1000_new.json");
const data1000 = JSON.parse(fs.readFileSync(p1000, "utf8"));
console.log("1000 bundle cards count:", data1000.cards ? data1000.cards.length : "unknown");
console.log("1000 bundle concepts count:", data1000.concepts ? data1000.concepts.length : "unknown");
