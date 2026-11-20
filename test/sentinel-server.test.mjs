import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

async function ephemeralPort() {
  const server = createServer();
  return await new Promise((resolvePort,reject) => {
    server.once('error',reject);
    server.listen(0,'127.0.0.1',() => {
      const port = server.address().port;
      server.close(() => resolvePort(port));
    });
  });
}

async function start() {
  const port = await ephemeralPort();
  const child = spawn(process.execPath, ['server.mjs'], {cwd: resolve('.'), env: {...process.env,PORT:String(port)}, stdio:'ignore'});
  const origin = `http://127.0.0.1:${port}`;
  for (let i=0;i<50;i++) {
    if (child.exitCode !== null) throw new Error('App server terminated before startup');
    try {const r=await fetch(origin+'/');if(r.ok)return {child,origin};} catch {}
    await new Promise(r=>setTimeout(r,30));
  }
  child.kill('SIGKILL');
  throw new Error('Timed out waiting for app server');
}

test('Sentinel browser route and module paths resolve without changing legacy root', async t => {
  const {child,origin}=await start();
  t.after(()=>child.kill('SIGKILL'));
  const legacy=await fetch(origin+'/');
  assert.match(await legacy.text(), /AXIOM Verify|AXIOM VERIFY/);
  for(const [path,marker,ctype] of [
    ['/sentinel','AXIOM SENTINEL','text/html'],
    ['/sentinel.js','runScenario','text/javascript'],
    ['/sentinel.css','sentinel','text/css'],
    ['/sentinel/engine.mjs','SandboxLedger','text/javascript'],
    ['/sentinel/oracle.mjs','evaluateLedger','text/javascript']
  ]){
    const r=await fetch(origin+path);
    assert.equal(r.status,200,`${path} status`);
    assert.ok(r.headers.get('content-type')?.includes(ctype),`${path} content type`);
    assert.ok((await r.text()).includes(marker),`${path} body`);
    assert.equal(r.headers.get('content-security-policy')?.includes("default-src 'self'"),true);
  }
  const unknown=await fetch(origin+'/sentinel/private/secret');
  assert.equal(unknown.status,404);
  const mutation=await fetch(origin+'/sentinel',{method:'POST',body:'x'});
  assert.equal(mutation.status,405);
  const head=await fetch(origin+'/sentinel',{method:'HEAD'});
  assert.equal(head.status,200);
  assert.equal((await head.text()).length,0);
});