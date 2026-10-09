const fs = require('fs');

const contentPath = 'C:/Users/尹猛/.gemini/antigravity/brain/9122c34e-a150-4028-bdc7-3356ca9ae785/.system_generated/steps/661/content.md';
const html = fs.readFileSync(contentPath, 'utf-8');

console.log('HTML length:', html.length);
console.log('Last 2000 chars of HTML:');
console.log(html.substring(html.length - 2000));
