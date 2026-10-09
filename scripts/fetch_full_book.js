const fs = require('fs');

async function download() {
  console.log('Downloading https://cdyforever.github.io/how-to-live-better/ ...');
  const res = await fetch('https://cdyforever.github.io/how-to-live-better/');
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  console.log(`Fetched successfully! Length: ${text.length} characters`);
  fs.writeFileSync('e:/LifeKnowledge/data/how-to-live-better.html', text, 'utf-8');
  console.log('Saved to e:/LifeKnowledge/data/how-to-live-better.html');

  // Count articles
  const count = (text.match(/<article class="card"/g) || []).length;
  console.log(`Total <article class="card"> found: ${count}`);

  // Count sections
  const secCount = (text.match(/<section id="sec\d+"/g) || []).length;
  console.log(`Total <section id="sec..."> found: ${secCount}`);
}

download().catch(err => {
  console.error(err);
  process.exit(1);
});
