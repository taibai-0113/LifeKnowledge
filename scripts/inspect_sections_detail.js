const fs = require("fs");
const path = require("path");

const html = fs.readFileSync("data/how-to-live-better.html", "utf-8");
const sections = [...html.matchAll(/<section id="(sec\d+)">[\s\S]*?<div class="sec-h">[\s\S]*?<h2>(.*?)<\/h2>[\s\S]*?<span class="meta">([^<]*)<\/span>[\s\S]*?<\/div>([\s\S]*?)(?=<section id="sec\d+"|<\/main>)/g)];

console.log("Found sections:", sections.length);
sections.forEach(s => {
  const cards = [...s[4].matchAll(/<article class="card" id="([^"]+)"([^>]*)>/g)];
  console.log(`${s[1]}: ${s[2]} (${s[3]}) - ${cards.length} cards`);
});
