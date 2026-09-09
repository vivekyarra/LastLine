import fs from 'node:fs';
import path from 'node:path';

const distServer = path.resolve('dist/server/index.js');
const { default: handler } = await import('file:///' + distServer.replace(/\\/g, '/'));
const res = await handler.fetch(new Request('http://localhost/'));
const html = await res.text();

fs.writeFileSync(path.resolve('dist/client/index.html'), html);
if (fs.existsSync('dist')) {
  fs.writeFileSync(path.resolve('dist/index.html'), html);
}
console.log('Successfully generated index.html, size:', html.length);
