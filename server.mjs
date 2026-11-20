import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, relative, isAbsolute } from 'node:path';
const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
function select(pathname) {
  if (pathname === '/' || pathname === '/index.html') return resolve(root, 'public/index.html');
  if (pathname === '/app.js' || pathname === '/styles.css') return resolve(root,'public'+pathname);
  if (pathname === '/finance.mjs') return resolve(root,'src/finance.mjs');
  if (pathname === '/sentinel' || pathname === '/sentinel/') return resolve(root, 'public/sentinel.html');
  if (pathname === '/sentinel.js' || pathname === '/sentinel.css') return resolve(root,'public'+pathname);
  if (pathname === '/sentinel/engine.mjs') return resolve(root,'src/sentinel/engine.mjs');
  if (pathname === '/sentinel/oracle.mjs') return resolve(root,'src/sentinel/oracle.mjs');
  return null;
}
const server = createServer(async (req,res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  if (req.method !== 'GET' && req.method !== 'HEAD') {res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  let path;
  try {path = select(decodeURIComponent(new URL(req.url,'http://localhost').pathname));} catch {res.writeHead(400);res.end();return;}
  if (!path) {res.writeHead(404);res.end('Not found');return;}
  try {const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data);} catch {res.writeHead(404);res.end('Not found');}
});
server.listen(port,'0.0.0.0',()=>console.log(`AXIOM Verify ready at http://localhost:${port}`));