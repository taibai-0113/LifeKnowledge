const fs = require('fs');

const html = fs.readFileSync('e:/LifeKnowledge/data/how-to-live-better.html', 'utf-8');

// Parse all 34 sections
const secRegex = /<section id="(sec\d+)">[\s\S]*?<div class="sec-h">[\s\S]*?<h2>(.*?)<\/h2>[\s\S]*?<span class="meta">([^<]*)<\/span>[\s\S]*?<\/div>([\s\S]*?)(?=<section id="sec\d+"|<\/main>)/g;

const sections = [];
let match;
while ((match = secRegex.exec(html)) !== null) {
  const secId = match[1];
  const secTitle = match[2].replace(/<[^>]+>/g, '').trim();
  const secMeta = match[3].trim();
  const secContent = match[4];
  
  const cardMatches = [...secContent.matchAll(/<article class="card" id="([^"]+)"([^>]*)>([\s\S]*?)<\/article>/g)];
  sections.push({
    id: secId,
    title: secTitle,
    meta: secMeta,
    cardsCount: cardMatches.length
  });
}

console.log('Total sections parsed:', sections.length);
sections.forEach(s => {
  console.log(`${s.id}: ${s.title} (${s.meta}) -> ${s.cardsCount} cards`);
});

const totalCards = sections.reduce((acc, s) => acc + s.cardsCount, 0);
console.log('Total cards in all sections:', totalCards);
