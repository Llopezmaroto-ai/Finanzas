import { mkdir, rm, copyFile, readFile, writeFile } from 'node:fs/promises';

const base = '/Finanzas/';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await copyFile('src/styles.css', 'dist/assets/styles.css');
await copyFile('src/standalone.js', 'dist/assets/app.js');
let html = await readFile('index.html', 'utf8');
html = html
  .replace('href="/src/styles.css"', `href="${base}assets/styles.css"`)
  .replace('src="/src/standalone.js"', `src="${base}assets/app.js"`);
await writeFile('dist/index.html', html);
console.log('Built static app in dist/');
