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
    await put('flyerAvailabilityPolicies/dns-global',{
      schemaVersion:1,
      enabled:{dns_price_list:true,regional_price_list:true,ticket_weekly_dns:false,
        ticket_weekly_area:false,ticket_daily_area:false,hotel_package:false,
        voucher:false,gutschein:false,promotion:false},
      updatedAt:'2026-11-05T15:00:00.000Z',updatedBy:'flyer-admin',
    });
    for(const role of ['writer','reader','publisher','other']){
      const uid=`flyer-${role}`;
      await put(`flyerPolicyReaders/${uid}`,{
        scopeType:'reportingArea',scopeId:role==='other'?otherArea:area,
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
  await page.getByLabel(/^(Passwort|Password)$/).fill(password);
  await page.locator('form').getByRole('button',{name:/^(Anmelden|Accedi)$/}).click();
  await expect(page.getByRole('button',{name:/^(Abmelden|Esci)$/})).toHaveAttribute('title',`flyer-${role}@example.test`);
}
async function logout(page){
  await page.getByRole('button',{name:/^(Abmelden|Esci)$/}).click();
  await expect(page.getByLabel('Email',{exact:true})).toBeVisible();
}
const editor=page=>page.getByRole('complementary');

test('Workspace SSO: persisted dns-core session opens Flyer and host logout propagates',async({page,context})=>{
  await page.goto('/');
  await page.evaluate(async({email,password})=>{
    const {signInDNSCoreWithEmail}=await import('/src/lib/dnsCore.ts');
    await signInDNSCoreWithEmail(email,password);
  },{email:'flyer-writer@example.test',password});
  const embedded=await context.newPage();
  await embedded.goto('/');
  await expect(editor(embedded)).toBeVisible();
  await expect(embedded.getByLabel('Email',{exact:true})).toHaveCount(0);
  await embedded.reload();
  await expect(editor(embedded)).toBeVisible();
  await page.evaluate(async()=>{
    const {signOutDNSCore}=await import('/src/lib/dnsCore.ts');
    await signOutDNSCore();
  });
  await expect(embedded.getByLabel('Email',{exact:true})).toBeVisible();
  await embedded.close();
});

test('writer: UI edit autosaves one current flyer and restores it after login',async({page})=>{
  await login(page,'writer');await expect(editor(page)).toBeVisible();
  await page.getByRole('button',{name:/^(Regionale Preisliste|Listino regionale)$/}).click();
  await page.getByRole('button',{name:/^(Inhalte|Contenuti)$/}).click();
  await page.getByLabel(/^(Titel|Titolo)$/).fill('Virtual DNS package saved');
  await expect(editor(page).getByRole('status').first()).toContainText(/In DNS Core gespeichert|Salvato automaticamente/);
  const record=await page.evaluate(async()=>{const m=await import('/tests/acceptance/operations.ts');const items=await m.loadOwnedFlyerDocuments();
    return items.filter(i=>i.title==='Virtual DNS package saved').map(i=>({id:i.id,area:i.scopeId,owner:i.ownerUserId}));});
  expect(record).toHaveLength(1);expect(record[0].area).toBe(area);
  expect(record[0].id).toContain('current__reportingArea__dns-test-area__2026-27__regional_price_list');
  await logout(page);await login(page,'writer');
  await page.getByRole('button',{name:/^(Inhalte|Contenuti)$/}).click();
  await expect(page.getByLabel(/^(Titel|Titolo)$/)).toHaveValue('Virtual DNS package saved');
});

test('area availability: admin changes appear and disappear live without F5',async({page})=>{
  await login(page,'writer');
  await expect(editor(page)).toBeVisible();
  const regional=page.getByRole('button',{name:/^(Regionale Preisliste|Listino regionale)$/});
  const packageFlyer=page.getByRole('button',{name:/^(Pakete & Angebote|Pacchetti e offerte)$/});
  await expect(regional).toBeVisible();
  await expect(packageFlyer).toHaveCount(0);
  await env.withSecurityRulesDisabled(async c=>{
    await setDoc(doc(c.firestore(),'flyerAvailabilityPolicies','dns-global'),{
      schemaVersion:1,
      enabled:{dns_price_list:true,regional_price_list:true,ticket_weekly_dns:false,
        ticket_weekly_area:false,ticket_daily_area:false,hotel_package:true,
        voucher:false,gutschein:false,promotion:false},
      updatedAt:'2026-11-05T15:01:00.000Z',updatedBy:'flyer-admin',
    });
  });
  await expect(packageFlyer).toBeVisible();
  await env.withSecurityRulesDisabled(async c=>{
    await setDoc(doc(c.firestore(),'flyerAvailabilityPolicies','dns-global'),{
      schemaVersion:1,
      enabled:{dns_price_list:true,regional_price_list:true,ticket_weekly_dns:false,
        ticket_weekly_area:false,ticket_daily_area:false,hotel_package:false,
        voucher:false,gutschein:false,promotion:false},
      updatedAt:'2026-11-05T15:02:00.000Z',updatedBy:'flyer-admin',
    });
  });
  await expect(packageFlyer).toHaveCount(0);
});

test('area library: writer upload, reader shared reload and foreign-area denial',async({page})=>{
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
  expect(result.path).toMatch(/^flyerAssets\/dns-test-area\/.+\.jpg$/);
  expect(result).toMatchObject({listed:true,foreignDenied:true});
  await logout(page);await login(page,'reader');
  const reader=await page.evaluate(async uploadedPath=>{
    const library=await import('/src/data/flyerImageLibrary.ts');
    const listed=await library.listFlyerImages('dns-test-area');
    const canvas=document.createElement('canvas');canvas.width=2;canvas.height=2;
    const png=await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Fixture image failed')),'image/png'));
    let uploadDenied=false;
    try{await library.uploadFlyerImage(new File([png],'reader-denied.png',{type:'image/png'}),'dns-test-area');}catch{uploadDenied=true;}
    return {shared:listed.some(item=>item.path===uploadedPath),uploadDenied};
  },result.path);
  expect(reader).toEqual({shared:true,uploadDenied:true});
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


test('area: official DNS flyer is one central read-only document; regional flyer remains editable',async({page})=>{
  await login(page,'admin');
  await page.evaluate(async()=>{
    const m=await import('/tests/acceptance/operations.ts');
    const {FLYER_TEMPLATES}=await import('/src/data/templates.ts');
    const official=FLYER_TEMPLATES.find(template=>template.id==='official_price_list');
    if(!official)throw new Error('OFFICIAL_TEMPLATE_MISSING');
    await m.saveFlyerDocument({
      ...official.defaultContent,
      layoutTemplateId:'official_price_list',
      regionId:'dns_central',
      validityPeriod:'2026-27',
      title:'DNS Central Flyer',
      heroImageUrl:'',
    });
  });
  await logout(page);
  await login(page,'writer');
  await expect(editor(page)).toBeVisible();
  await expect(page.getByRole('button',{name:/DNS Gesamtpreisliste|Listino generale DNS/})).toBeVisible();
  await page.getByRole('button',{name:/DNS Gesamtpreisliste|Listino generale DNS/}).click();
  await expect(page.getByText(/DNS-Gesamtflyer.*Nur Ansicht|Flyer generale DNS.*Sola lettura/).first()).toBeVisible();
  await expect(page.locator('[data-tab="content"]')).toHaveCount(0);
  await expect(page.locator('[data-tab="images"]')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'LEGACY'})).toHaveCount(0);
  const cannotOverwrite=await page.evaluate(async()=>{
    const m=await import('/tests/acceptance/operations.ts');
    const {FLYER_TEMPLATES}=await import('/src/data/templates.ts');
    const source=FLYER_TEMPLATES.find(template=>template.id==='official_price_list').defaultContent;
    try {
      await m.saveFlyerDocument({
        ...source,regionId:'dns_central',layoutTemplateId:'official_price_list',
        validityPeriod:'2026-27',title:'Tampered DNS'
      });
      return false;
    } catch { return true; }
  });
  expect(cannotOverwrite).toBe(true);
  await page.getByRole('button',{name:/Regionale Preisliste|Listino regionale/}).click();
  await expect(page.locator('[data-tab="content"]')).toBeVisible();
  await expect(page.getByText(/Flyer generale DNS.*Sola lettura|DNS-Gesamtflyer.*Nur Ansicht/)).toHaveCount(0);
  await page.goto('/?legacy=1');
  await expect(page.getByRole('button',{name:'LEGACY'})).toHaveCount(0);
  expect(new URL(page.url()).searchParams.has('legacy')).toBe(false);
});

test('reader: read allowed; service and direct Firebase writes denied',async({page})=>{
  await login(page,'reader');
  // Read-only users must see verified saved content, but must not autosave.
  // Capture the failure state when an authorization or loading guard regresses.
  try {
    await expect(editor(page)).toBeVisible({ timeout: 15000 });
  } catch (error) {
    const alerts = await page.getByRole('alert').allTextContents();
    const status = await page.getByRole('status').allTextContents();
    console.error('READ_ONLY_UI_DIAGNOSTIC', JSON.stringify({ alerts, status }));
    throw error;
  }
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

test('area writer: regional Flyer PNG export works without DNS Admin privileges',async({page})=>{
  await page.route('**/*',async route=>{
    if(new URL(route.request().url()).pathname.startsWith('/stock/') || (route.request().resourceType()==='image'&&!['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname)))
      await route.fulfill({contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aYuQAAAAASUVORK5CYII=','base64')});
    else await route.fallback();
  });
  const errors=[];
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('dialog',async dialog=>{errors.push('dialog: '+dialog.message());await dialog.dismiss();});
  await login(page,'writer');
  await expect(editor(page)).toBeVisible();
  await page.getByRole('button',{name:/^(Regionale Preisliste|Listino regionale)$/}).click();
  await expect(page.getByRole('button',{name:'PNG',exact:true})).toBeEnabled();
  const download=page.waitForEvent('download',{timeout:20000});
  await page.getByRole('button',{name:'PNG',exact:true}).click();
  await page.getByRole('button',{name:/Preisliste als PNG herunterladen|Scarica Immagine PNG Listino/}).click();
  const file=await download;
  expect(file.suggestedFilename()).toMatch(/\.png$/i);
  const {stat}=await import('node:fs/promises');
  expect((await stat(await file.path())).size).toBeGreaterThan(500);
  expect(errors.filter(error=>/PNG export failed|Esportazione PNG non riuscita|PNG-Export fehlgeschlagen/.test(error))).toEqual([]);
});

test('area writer: regional PDF print calls the browser without a Flyer export error',async({page})=>{
  await page.route('**/*',async route=>{
    if(new URL(route.request().url()).pathname.startsWith('/stock/') || (route.request().resourceType()==='image'&&!['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname)))
      await route.fulfill({contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aYuQAAAAASUVORK5CYII=','base64')});
    else await route.fallback();
  });
  const errors=[];
  page.on('console',message=>{if(message.type()==='error'&&/PDF export|Native PDF export/.test(message.text()))errors.push(message.text());});
  page.on('dialog',async dialog=>{errors.push('dialog: '+dialog.message());await dialog.dismiss();});
  await login(page,'writer');
  await expect(editor(page)).toBeVisible();
  await page.getByRole('button',{name:/^(Regionale Preisliste|Listino regionale)$/}).click();
  await page.getByRole('button',{name:/^PDF/}).click();
  await page.getByRole('button',{name:/PDF drucken|Stampa PDF/}).click();
  await expect(page.locator('[data-dns-export-stage]')).toHaveCount(0,{timeout:20000});
  expect(errors).toEqual([]);
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

test('Foundation language changes in Workspace update an already-open Flyer editor without reload',async({page,context})=>{
  await login(page,'writer');
  await expect(editor(page)).toBeVisible();
  const second=await context.newPage();
  await second.goto('/');
  await second.evaluate(()=>localStorage.setItem('dns-ui-language-v1','it'));
  await expect(editor(page).getByRole('button',{name:'Contenuti'})).toBeVisible();
  await second.evaluate(()=>localStorage.setItem('dns-ui-language-v1','de'));
  await expect(editor(page).getByRole('button',{name:'Inhalte'})).toBeVisible();
  await second.close();
});

test('flyer cards: expandable localized help, permission colors, and disabled Bild on all three tickets', async({page})=>{
  await login(page,'writer');
  await expect(editor(page)).toBeVisible();
  const dns = editor(page).getByRole('button',{name:'DNS Gesamtpreisliste'});
  const area = editor(page).getByRole('button',{name:'Regionale Preisliste'});
  await expect(dns).toBeVisible();
  await expect(area).toBeVisible();
  await expect(dns.locator('..').getByRole('img',{name:'Nicht bearbeitbar'})).toBeVisible();
  await expect(area.locator('..').getByRole('img',{name:'Bearbeitbar'})).toBeVisible();
  // A whole card (including empty padding) opens the flyer, and the selected card stays highlighted.
  const areaCard = area.locator('..');
  await expect(area).not.toHaveAttribute('aria-current','true');
  await areaCard.click({position:{x:10,y:10}});
  await expect(area).toHaveAttribute('aria-current','true');
  await expect(areaCard).toHaveClass(/bg-\[#D6E8E8\]/);
  await expect(areaCard.locator('span').first()).toHaveClass(/underline/);
  await dns.click();
  await expect(dns).toHaveAttribute('aria-current','true');
  await expect(area).not.toHaveAttribute('aria-current','true');
  await area.click();
  await expect(area).toHaveAttribute('aria-current','true');


  const details = area.locator('..').getByRole('button',{name:'Details'});
  await expect(details).toHaveAttribute('aria-expanded','false');
  await details.click();
  await expect(details).toHaveAttribute('aria-expanded','true');
  await expect(area.locator('..')).toContainText('Preisliste eures Gebiets');

  await page.evaluate(()=>localStorage.setItem('dns-ui-language-v1','it'));
  // Same-document preferences are updated by the Foundation control.
  await page.evaluate(async()=>{const {getDNSFoundationRuntime}=await import('/src/lib/foundationRuntime.ts');getDNSFoundationRuntime().setLanguage('it');});
  const areaIt = editor(page).getByRole('button',{name:'Listino regionale'});
  await expect(areaIt.locator('..').getByRole('button',{name:'Dettagli'})).toBeVisible();
  await expect(areaIt.locator('..')).toContainText('Listino della vostra area');

  // DNS Admin can access the three tickets even when they are unavailable to areas.
  await logout(page);
  await login(page,'admin');
  await page.evaluate(async()=>{const {getDNSFoundationRuntime}=await import('/src/lib/foundationRuntime.ts');getDNSFoundationRuntime().setLanguage('de');});
  for (const name of ['DNS Wochenkarte','Area Wochenkarte','Area Tageskarte']) {
    await editor(page).getByRole('button',{name}).click();
    const imageTab = editor(page).getByRole('button',{name:'Bild'});
    await expect(imageTab).toBeVisible();
    await expect(imageTab).toBeDisabled();
  }
  await editor(page).getByRole('button',{name:'Regionale Preisliste'}).click();
  await expect(editor(page).getByRole('button',{name:'Bild'})).toBeEnabled();
});
