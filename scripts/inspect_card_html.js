const fs = require("fs");

const html = fs.readFileSync("data/how-to-live-better.html", "utf-8");

function inspectCard(cardId) {
  const m = html.match(new RegExp(`<article class="card" id="${cardId}"[^>]*>([\\s\\S]*?)<\\/article>`));
  if (m) {
    console.log(`=== Card ${cardId} ===`);
    console.log(m[0].substring(0, 1000));
  }
}

inspectCard("s1-1");
inspectCard("s8-1");
inspectCard("s34-1");
