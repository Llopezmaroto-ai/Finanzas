import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT || 5173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${port}`);
    const pathname = url.pathname === '/Finanzas/' || url.pathname === '/' ? '/index.html' : url.pathname.replace(/^\/Finanzas/, '');
    const filePath = normalize(join(process.cwd(), pathname));
    if (!filePath.startsWith(process.cwd())) throw new Error('Invalid path');
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': types[extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});
server.listen(port, () => console.log(`Local server: http://localhost:${port}/Finanzas/`));
