/**
 * Local-only Auth/Firestore emulator fixture for Flyer Studio.
 * Run with both emulators on 9099/8080, project demo-dns-core.
 * Does not use production credentials or Firebase Admin service accounts.
 */
const auth = 'http://127.0.0.1:9099';
const db = 'http://127.0.0.1:8080/v1/projects/demo-dns-core/databases/(default)/documents';
const password = 'TestOnly-Flyer-2026!'; // local disposable credential
const specs = [
  ['dns-test-admin@invalid.example', 'dns-admin', 'dns-test-admin'],
  ['dns-test-writer@invalid.example', 'writer', 'dns-test-writer'],
  ['dns-test-reader@invalid.example', 'reader', 'dns-test-reader'],
  ['dns-test-outsider@invalid.example', 'outsider', 'dns-test-outsider'],
];
const string = stringValue => ({ stringValue });
const fields = obj => Object.fromEntries(Object.entries(obj).map(([k,v]) =>
  [k, typeof v === 'boolean' ? {booleanValue:v} :
      Array.isArray(v) ? {arrayValue:{values:v.map(string)}} : string(v)]));
async function request(url, options) {
  const r=await fetch(url, options);
  if(!r.ok) throw new Error(`${r.status} ${url}: ${await r.text()}`);
  return r.json();
}
async function write(path, data) {
  return request(`${db}/${path}`, {method:'PATCH',headers:{
    'Authorization':'Bearer owner','Content-Type':'application/json'
  },body:JSON.stringify({fields:fields(data)})});
}
for (const [email,role,uid] of specs) {
  // Emulator-only Admin API: stable uid, no real Firebase project touched.
  await request(`${auth}/identitytoolkit.googleapis.com/v1/projects/demo-dns-core/accounts`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({localId:uid,email,password,emailVerified:true})
  });
  await write(`users/${uid}`, {active:true,globalRoles:role==='dns-admin'?['dns-admin']:[]});
  if(role==='writer'||role==='reader') {
    await write(`memberships/${uid}__dns-test-organisation`,{
      userId:uid,organizationId:'dns-test-organisation',active:true,status:'active'
    });
    await write(`accessGrants/${uid}__reportingArea__dns-test-area`,{
      userId:uid,scopeType:'reportingArea',scopeId:'dns-test-area',active:true,
      permissions:role==='writer'?['flyer.read','flyer.write']:['flyer.read']
    });
  }
}
await write('reportingAreas/dns-test-area',{canonicalName:'DNS Test Area',synthetic:true,reportingEnabled:false});
await write('organizations/dns-test-organisation',{reportingAreaIds:['dns-test-area'],synthetic:true});
await write('seasons/2026-27',{status:'active'});
console.log('Emulator-only users seeded. Test password:',password);
console.log(specs.map(([email,role])=>`${role}: ${email}`).join('\n'));
