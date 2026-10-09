const fs = require('fs');

const html = fs.readFileSync('e:/LifeKnowledge/data/how-to-live-better.html', 'utf-8');

const sampleIds = ['s1-1', 's1-2', 's8-1', 's13-1', 's34-1'];

sampleIds.forEach(id => {
  const re = new RegExp(`<article class="card" id="${id}"([\\s\\S]*?)<\\/article>`);
  const m = html.match(re);
  if (m) {
    console.log(`=== Card ${id} ===`);
    console.log(m[0].substring(0, 800));
  }
});
