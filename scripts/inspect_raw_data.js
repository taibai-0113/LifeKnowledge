const fs = require("fs");

const b150 = JSON.parse(fs.readFileSync("data/life_blindspots_150_new_bundle/life_blindspots_150.json", "utf-8"));
console.log("b150 cards count:", b150.cards.length);
console.log("b150 card 0:", b150.cards[0]);

const b1000 = JSON.parse(fs.readFileSync("data/life_blindspots_1000_new_bundle/life_blindspots_1000_new.json", "utf-8"));
console.log("b1000 category_counts:", b1000.category_counts);
console.log("b1000 concept 0:", b1000.concepts[0]);
console.log("b1000 card 0:", b1000.cards[0]);
