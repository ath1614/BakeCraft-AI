const { spawnSync } = require('child_process');
const fs = require('fs');

const body = fs.readFileSync('/Users/ath1614/Dadi-s-Dawai-Diary/BakeCraft-AI/docs/dev_submission.md', 'utf-8');
const title = "Why I Built BakeCraft AI: 100% Local Cottage Bakery & Micro-Catering Profit Engine with Google Gemma 2";
const mainImage = "https://raw.githubusercontent.com/ath1614/BakeCraft-AI/main/docs/assets/bakecraft_cover_1000x420.png";

console.log('Staging article to DEV via devrelay CLI...');

const res = spawnSync('/Users/ath1614/.devrelay/bin/devrelay', [
  'articles', 'create',
  '--title', title,
  '--body', body,
  '--main-image', mainImage,
  '--tags', 'devchallenge,hf26challenge,gemma,opensource'
], { encoding: 'utf-8' });

console.log('stdout:', res.stdout);
console.log('stderr:', res.stderr);
console.log('status:', res.status);
