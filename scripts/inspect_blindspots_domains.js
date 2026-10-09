const fs = require('fs');

const data = JSON.parse(fs.readFileSync('e:/LifeKnowledge/data/life_blindspots_150.json', 'utf-8'));

const domains = {};
data.cards.forEach(c => {
  domains[c.domain] = (domains[c.domain] || 0) + 1;
});

console.log('Domains in life_blindspots_150.json:');
console.log(domains);
