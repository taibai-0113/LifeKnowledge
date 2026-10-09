const fs = require("fs");
const path = require("path");

const p150 = path.resolve(__dirname, "../data/life_blindspots_150_new_bundle/life_blindspots_150.json");
const data150 = JSON.parse(fs.readFileSync(p150, "utf8"));
console.log("data150.cards length:", data150.cards.length);
console.log("data150.cards[0]:", JSON.stringify(data150.cards[0], null, 2));

const p1000 = path.resolve(__dirname, "../data/life_blindspots_1000_new_bundle/life_blindspots_1000_new.json");
const data1000 = JSON.parse(fs.readFileSync(p1000, "utf8"));
console.log("data1000.cards length:", data1000.cards.length);
console.log("data1000.cards[0]:", JSON.stringify(data1000.cards[0], null, 2));
