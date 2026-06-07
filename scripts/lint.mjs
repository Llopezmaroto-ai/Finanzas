import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const badPatterns = [/localStorage\s*\./, /sessionStorage\s*\./];
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(js|ts|tsx)$/.test(entry.name)) {
      const text = await readFile(path, 'utf8');
      for (const pattern of badPatterns) {
        if (pattern.test(text)) throw new Error(`Forbidden storage usage in ${path}`);
      }
    }
  }
}
await walk('src');
console.log('Lint checks passed');
