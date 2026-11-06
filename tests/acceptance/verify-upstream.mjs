import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const sha='18866122656e8a15dfc9b57388ee3819db6b209b';
const normalize=s=>s.replace(/\r\n/g,'\n').trimEnd();
for(const file of ['firestore.rules','storage.rules']){
  const remote=await fetch(`https://raw.githubusercontent.com/dolomitinordicski/dns-shared-data/${sha}/${file}`);
  assert.equal(remote.ok,true);
  const local=normalize(readFileSync(new URL(`./upstream/${file}`,import.meta.url),'utf8'));
  assert.equal(local,normalize(await remote.text()));
  console.log(`Exact Shared Data rules baseline ${sha} ${file}: ${createHash('sha256').update(local).digest('hex')}`);
}
