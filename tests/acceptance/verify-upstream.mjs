import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const sha='8d413e3ff0c472f1f565e26b3911189b05450a25';
const normalize=s=>s.replace(/\r\n/g,'\n').trimEnd();
for(const file of ['firestore.rules','storage.rules']){
  const remote=await fetch(`https://raw.githubusercontent.com/dolomitinordicski/dns-shared-data/${sha}/${file}`);
  assert.equal(remote.ok,true);
  const local=normalize(readFileSync(new URL(`./upstream/${file}`,import.meta.url),'utf8'));
  assert.equal(local,normalize(await remote.text()));
  console.log(`Exact Shared Data #232 ${sha} ${file}: ${createHash('sha256').update(local).digest('hex')}`);
}
