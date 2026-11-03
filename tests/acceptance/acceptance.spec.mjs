import { test, expect } from '@playwright/test';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'node:fs';

const project='demo-dns-identity', area='dns-test-area', otherArea='dns-test-area-b';
const password='Emulator-Only-Flyer-2026!';
const roles=['admin','writer','reader','writeonly','none','inactive','expired','future','malformed','publisher','other'];
let env;
test.beforeAll(async()=>{
  if(process.env.GCLOUD_PROJECT!==project||process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8188'||
    process.env.FIREBASE_STORAGE_EMULATOR_HOST!=='127.0.0.1:9299'||
    process.env.FIREBASE_AUTH_EMULATOR_HOST!=='127.0.0.1:9199')throw Error('Dedicated loopback demo emulators required');
  env=await initializeTestEnvironment({projectId:project,firestore:{host:'127.0.0.1',port:8188,
    rules:readFileSync('tests/acceptance/upstream/firestore.rules','utf8')},storage:{host:'127.0.0.1',port:9299,
    rules:readFileSync('tests/acceptance/upstream/storage.rules','utf8')}});
  const cleared=await fetch('http://127.0.0.1:9199/emulator/v1/projects/'+project+'/accounts',{
    method:'DELETE',headers:{Authorization:'Bearer owner'}});
  if(!cleared.ok)throw Error('Could not reset dedicated demo Auth');
  for(const role of roles){
    const response=await fetch('http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-flyer-key',{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},
      body:JSON.stringify({localId:`flyer-${role}`,email:`flyer-${role}@example.test`,password,returnSecureToken:true}),
    });if(!response.ok)throw Error(`Fixture Auth failed: ${response.status}`);
  }
});
test.beforeEach(async({context})=>{
  await context.route('**/*',async route=>{
    if(['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname))await route.continue();
    else await route.abort();
  });
  await env.clearFirestore();
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async c=>{
    const db=c.firestore();const put=(path,data)=>setDoc(doc(db,path),data);
    await put('seasons/2026-27',{status:'active'});
    for(const [org,a]of [['dns-test-organisation',area],['dns-test-organisation-b',otherArea]]){
      await put(`organizations/${org}`,{id:org,active:true,organizationType:'tourism-organisation',reportingAreaIds:[a]});
      await put(`reportingAreas/${a}`,{id:a,active:true,canonicalName:a});
    }
    for(const role of roles){
      const uid=`flyer-${role}`,a=role==='other'?otherArea:area;
      await put(`users/${uid}`,{id:uid,active:role!=='inactive',globalRoles:role==='admin'?['dns-admin']:[]});
      await put(`memberships/${uid}__dns-test-organisation`,{userId:uid,organizationId:'dns-test-organisation',active:true});
      if(['admin','none'].includes(role))continue;
      const permissions=role==='reader'?['flyer.read']:role==='writeonly'?['flyer.write']:['flyer.read','flyer.write'];
      if(role==='publisher')permissions.push('flyer.publish');
      await put(`accessGrants/${uid}__reportingArea__${a}`,{userId:uid,scopeType:'reportingArea',scopeId:a,active:true,permissions,
        ...(role==='expired'?{validTo:'2000-01-01T00:00:00Z'}:{}),
        ...(role==='future'?{validFrom:'2100-01-01T00:00:00Z'}:{}),
        ...(role==='malformed'?{validTo:'not-a-date'}:{}),
      });
    }
    for(const [id,owner,a]of [['owned-without-grant','flyer-none',area],['foreign-draft','flyer-other',otherArea],['readable-draft','flyer-writer',area]])
      await put(`flyerDocuments/${id}`,{id,schema:'dns.flyer-document',version:1,title:id,scopeType:'reportingArea',scopeId:a,
        seasonId:'2026-27',status:'draft',ownerUserId:owner,document:{schema:'dns.flyer-document',version:1},updatedBy:owner});
  });
});
test.afterAll(async()=>{await env?.cleanup();});

async function login(page,role){
  await page.goto('/');
  await page.getByLabel('Email',{exact:true}).fill(`flyer-${role}@example.test`);
  await page.getByLabel('Password',{exact:true}).fill(password);
  await page.locator('form').getByRole('button',{name:'Accedi',exact:true}).click();
  await expect(page.getByRole('button',{name:/^(Abmelden|Esci)$/})).toHaveAttribute('title',`flyer-${role}@example.test`);
}
async function logout(page){
  await page.getByRole('button',{name:/^(Abmelden|Esci)$/}).click();
  await expect(page.getByLabel('Email',{exact:true})).toBeVisible();
}
const editor=page=>page.getByRole('complementary');

test('writer: UI edit, autosave, explicit save, logout/login and reload',async({page})=>{
  await login(page,'writer');await expect(editor(page)).toBeVisible();
  await page.getByRole('button',{name:/^(Pakete & Angebote|Pacchetti e offerte)$/}).click();
  await page.getByRole('button',{name:/^(Inhalte|Contenuti)$/}).click();
  await page.getByLabel(/^(Titel|Titolo)$/).fill('Virtual DNS package saved');
  await expect(editor(page).getByRole('status').first()).toContainText(/In DNS Core gespeichert|Salvato automaticamente/);
  await page.getByRole('button',{name:'Flyer',exact:true}).click();
  await page.getByRole('button',{name:/^(Entwurf speichern|Salva bozza)$/}).click();
  await expect(page.getByText(/Bozza salvata in DNS Core|Entwurf in DNS Core gespeichert/)).toBeVisible();
  const record=await page.evaluate(async()=>{const m=await import('/tests/acceptance/operations.ts');const items=await m.loadOwnedFlyerDocuments();
    return items.filter(i=>i.title==='Virtual DNS package saved').map(i=>({id:i.id,area:i.scopeId,owner:i.ownerUserId}));});
  expect(record).toHaveLength(1);expect(record[0].area).toBe(area);
  await logout(page);await login(page,'writer');
  await editor(page).getByRole('button',{name:'Virtual DNS package saved',exact:true}).click();
  await page.getByRole('button',{name:/^(Inhalte|Contenuti)$/}).click();
  await expect(page.getByLabel(/^(Titel|Titolo)$/)).toHaveValue('Virtual DNS package saved');
});

test('writer: actual image library upload, reload and foreign-area denial',async({page})=>{
  await login(page,'writer');await expect(editor(page)).toBeVisible();
  const result=await page.evaluate(async()=>{
    const library=await import('/src/data/flyerImageLibrary.ts');
    const canvas=document.createElement('canvas');canvas.width=2;canvas.height=2;
    const context=canvas.getContext('2d');context.fillStyle='#0D4D5E';context.fillRect(0,0,2,2);
    const png=await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Fixture image failed')),'image/png'));
    const file=new File([png],'virtual-area-image.png',{type:'image/png'});
    const uploaded=await library.uploadFlyerImage(file,'dns-test-area');
    const listed=await library.listFlyerImages('dns-test-area');
    let foreignDenied=false;
    try{await library.uploadFlyerImage(file,'dns-test-area-b');}catch{foreignDenied=true;}
    return {path:uploaded.path,listed:listed.some(item=>item.path===uploaded.path),foreignDenied};
  });
  expect(result.path).toMatch(/^flyerAssets\/flyer-writer\/dns-test-area\/.+\.jpg$/);
  expect(result).toMatchObject({listed:true,foreignDenied:true});
});

for(const role of ['none','inactive','expired','future','malformed','writeonly']){
  test(`${role}: editor denied with real Auth and combined rules`,async({page})=>{
    await login(page,role);
    const access=await page.evaluate(async()=>{const m=await import('/tests/acceptance/operations.ts');return m.loadCurrentFlyerAccess();});
    expect(access.canRead).toBe(false);
    await expect(editor(page)).toHaveCount(0);
    const denied=await page.evaluate(async role=>{const m=await import('/tests/acceptance/operations.ts');
      try{await m.getDoc(m.doc(m.dnsCoreDb,'flyerDocuments',role==='none'?'owned-without-grant':'readable-draft'));return false;}catch{return true;}
    },role);expect(denied).toBe(true);
  });
}

test('reader: read allowed; service and direct Firebase writes denied',async({page})=>{
  await login(page,'reader');await expect(editor(page)).toBeVisible();
  const result=await page.evaluate(async()=>{const m=await import('/tests/acceptance/operations.ts');
    const readable=(await m.getDoc(m.doc(m.dnsCoreDb,'flyerDocuments','readable-draft'))).exists();
    let serviceDenied=false,rawDenied=false;
    try{await m.saveFlyerDocument(m.content('dns-test-area','Reader cannot save'));}catch{serviceDenied=true;}
    try{await m.setDoc(m.doc(m.dnsCoreDb,'flyerDocuments','readable-draft'),{title:'spoof'},{merge:true});}catch{rawDenied=true;}
    return {readable,serviceDenied,rawDenied};});
  expect(result).toEqual({readable:true,serviceDenied:true,rawDenied:true});
});

test('writer: foreign area blocked, own CRUD works, publication requires separate grant',async({page})=>{
  await login(page,'writer');await expect(editor(page)).toBeVisible();
  const result=await page.evaluate(async()=>{const m=await import('/tests/acceptance/operations.ts');
    const saved=await m.saveFlyerDocument(m.content('dns-test-area','Service draft'));
    await m.saveFlyerDocument(m.content('dns-test-area','Corrected draft'),{id:saved.id});
    let foreignRead=false,foreignWrite=false,publishDenied=false;
    try{await m.getDoc(m.doc(m.dnsCoreDb,'flyerDocuments','foreign-draft'));}catch{foreignRead=true;}
    try{await m.saveFlyerDocument(m.content('dns-test-area-b','Foreign draft'));}catch{foreignWrite=true;}
    try{await m.publishFlyerDocument(saved);}catch{publishDenied=true;}
    const loaded=(await m.loadOwnedFlyerDocuments()).find(x=>x.id===saved.id)?.title;
    await m.deleteFlyerDocument(saved.id);
    const removed=!(await m.loadOwnedFlyerDocuments()).some(x=>x.id===saved.id);
    return {foreignRead,foreignWrite,publishDenied,loaded,removed};});
  expect(result).toEqual({foreignRead:true,foreignWrite:true,publishDenied:true,loaded:'Corrected draft',removed:true});
});

test('explicit publisher: publication save and scoped reload',async({page})=>{
  await login(page,'publisher');await expect(editor(page)).toBeVisible();
  const result=await page.evaluate(async()=>{const m=await import('/tests/acceptance/operations.ts');
    const draft=await m.saveFlyerDocument(m.content('dns-test-area','Publishable virtual draft'));
    const published=await m.publishFlyerDocument(draft);
    const loaded=await m.loadOwnedPublications();return loaded.some(x=>x.id===published.id);
  });expect(result).toBe(true);
});

test('DNS Admin: editor and network draft allowed without grants',async({page})=>{
  await login(page,'admin');await expect(editor(page)).toBeVisible();
  const result=await page.evaluate(async()=>{const m=await import('/tests/acceptance/operations.ts');
    const saved=await m.saveFlyerDocument(m.content('dns_central','Admin network draft'));return saved.scopeType;
  });expect(result).toBe('network');
});

test('DNS Admin: real PNG export produces a downloadable image',async({page})=>{
  await page.route('**/*',async route=>{
    if(route.request().resourceType()==='image'&&!['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname))
      await route.fulfill({contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aYuQAAAAASUVORK5CYII=','base64')});
    else await route.fallback();
  });
  page.on('console',message=>{if(message.type()==='error')console.log('Export browser:',message.text());});
  page.on('dialog',async dialog=>{console.log('Export dialog:',dialog.message());await dialog.dismiss();});
  await login(page,'admin');await expect(editor(page)).toBeVisible();
  await page.getByRole('button',{name:/^(Pakete & Angebote|Pacchetti e offerte)$/}).click();
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'PNG',exact:true}).click();
  await page.getByRole('button',{name:/Preisliste als PNG herunterladen|Scarica Immagine PNG Listino/}).click();
  const file=await download;expect(file.suggestedFilename()).toMatch(/\.png$/i);
  const path=await file.path();const {stat}=await import('node:fs/promises');
  expect((await stat(path)).size).toBeGreaterThan(500);
});

test('two organizations: separate sessions and no local draft leakage after logout',async({page,browser})=>{
  await login(page,'writer');await expect(editor(page)).toBeVisible();
  const id=await page.evaluate(async()=>{const m=await import('/tests/acceptance/operations.ts');return (await m.saveFlyerDocument(m.content('dns-test-area','Private first account draft'))).id;});
  const second=await browser.newContext();
  await second.route('**/*',async route=>{if(['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname))await route.continue();else await route.abort();});
  const other=await second.newPage();await login(other,'other');await expect(editor(other)).toBeVisible();
  expect(await other.evaluate(async id=>{const m=await import('/tests/acceptance/operations.ts');try{await m.getDoc(m.doc(m.dnsCoreDb,'flyerDocuments',id));return false;}catch{return true;}},id)).toBe(true);
  await logout(page);await login(page,'other');await expect(editor(page)).toBeVisible();
  await expect(page.getByText('Private first account draft',{exact:true})).toHaveCount(0);
  await second.close();
});
