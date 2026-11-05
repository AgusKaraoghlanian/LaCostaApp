import test from 'node:test';import assert from 'node:assert/strict';
import http from 'node:http';import {EventEmitter} from 'node:events';import {Readable} from 'node:stream';import {readFile} from 'node:fs/promises';
import {parseResource} from '../engine/core/bounded-parser.ts';import {analyzeSource} from '../engine/core/pipeline.ts';import {SafeFetch,LIMITS} from '../engine/fetch/safe-fetch.ts';
import {PROCESS_LIMITS} from '../engine/security/limits.ts';import {retryAfterAt} from '../engine/security/retry-after.ts';import {downloadMenuImage} from '../engine/media/download.ts';import {inspectImage} from '../shared/media/image.ts';
import {testDatabase} from './support/sqlite.ts';import {JobRepository} from '../server/repositories/jobs.ts';import {ImageRequests} from '../server/repositories/image-requests.ts';import {readJson} from '../server/application/http.ts';import app from '../server/api/index.ts';
import {robotsAllows} from '../engine/discovery/links.ts';
const url='https://cafesanbernardo.com.ar/',actor={id:'local-admin',role:'admin' as const,csrf:''};
const context={url,sourceId:'s',resourceId:'r',runId:'run',depth:0,allowedDomains:[]};
const pizza=(n:number)=>'<h1>Fixture</h1><article class="wppizza-article"><h2 class="wppizza-article-title">Pizza controlada</h2>'+Array.from({length:n},(_,i)=>'<div class="wppizza-article-price"><span>$1000</span>Variante '+i+'</div>').join('')+'</article>';
function transport(t:any,route:(u:URL)=>any){let calls:string[]=[];t.mock.method(http,'request',(u:URL)=>{calls.push(u.href);const answer=route(u),req:any=new EventEmitter();req.destroy=()=>{};req.end=()=>queueMicrotask(()=>{const socket:any=new EventEmitter();socket.remoteAddress='8.8.8.8';req.emit('socket',socket);socket.emit('connect');const res:any=Readable.from([Buffer.from(answer.body||'')]);res.statusCode=answer.status??200;res.headers=answer.headers||{'content-type':'text/html'};req.emit('response',res)});return req});return calls;}
function clock(t:any){let at=Date.now();t.mock.method(Date,'now',()=>at+=2100)}
const resolver=async()=>[{address:'8.8.8.8',family:4}];
async function job(db:any,key='fixture'){const jobs=new JobRepository(db);await jobs.create(actor,{url,allowedDomains:[],accessReference:'Prueba controlada sin red externa'},key);return {jobs,lease:await jobs.claim('device')}}

test('H1: extracción útil y variantes WPPizza limitadas; el proceso principal sigue activo',async t=>{
 let ticks=0;const timer=setInterval(()=>ticks++,10),start=Date.now();try{
  const normal=await parseResource(pizza(4),'text/html',context);assert.equal(normal.menuCandidates.length,4);assert.equal(normal.menuCandidates[3].variant,'Variante 3');
  const limited=await parseResource(pizza(1000),'text/html',context);assert.equal(limited.menuCandidates.length,PROCESS_LIMITS.menu);assert.ok(limited.warnings.length);
  assert.ok(ticks>0);t.diagnostic(JSON.stringify({kind:'wppizza',bytes:Buffer.byteLength(pizza(1000)),items:limited.menuCandidates.length,ticks,elapsedMs:Date.now()-start}));
 }finally{clearInterval(timer)}
});
test('H1: HTML de 1,81 MB se rechaza acotadamente sin bloquear el hilo principal',async t=>{
 const html=pizza(25000);assert.equal(Buffer.byteLength(html),1814004);let ticks=0;const timer=setInterval(()=>ticks++,10),start=Date.now();
 try{await assert.rejects(()=>parseResource(html,'text/html',context),e=>['LIMITE_PROCESAMIENTO','TIEMPO_PROCESAMIENTO','MEMORIA_PROCESAMIENTO'].includes((e as any).code));assert.ok(ticks>0);assert.ok(Date.now()-start<PROCESS_LIMITS.startupMs+PROCESS_LIMITS.parserMs+3000);t.diagnostic(JSON.stringify({kind:'stress-1.81MB',elapsedMs:Date.now()-start,ticks,bytes:Buffer.byteLength(html)}))}finally{clearInterval(timer)}
});
test('H1: el límite externo termina el Worker durante el procesamiento, y luego se puede volver a analizar',async t=>{
 const start=Date.now();await assert.rejects(()=>parseResource(pizza(25000),'text/html',context,{timeoutMs:1}),e=>(e as any).code==='TIEMPO_PROCESAMIENTO');
 const valid=await parseResource('<h1>Negocio posterior</h1>','text/html',context);assert.equal(valid.businessCandidates[0].name,'Negocio posterior');t.diagnostic(JSON.stringify({kind:'termination-and-recovery',elapsedMs:Date.now()-start}));
});
test('H1: cancelar termina el análisis y no bloquea el siguiente',async()=>{
 const controller=new AbortController(),pending=parseResource(pizza(25000),'text/html',context,{signal:controller.signal});setTimeout(()=>controller.abort(),20);await assert.rejects(()=>pending);const valid=await parseResource('<h1>Otra fuente</h1>','text/html',context);assert.equal(valid.businessCandidates[0].name,'Otra fuente');
});
test('H1: 60 KB/5000 ofertas no amplifican el checkpoint ni causan reintentos',async t=>{
 const html='<h1>Fixture</h1><script type="application/ld+json">'+JSON.stringify({'@type':'Restaurant',name:'Fixture',hasMenu:{hasMenuItem:[{name:'Plato',offers:Array.from({length:5000},()=>({price:1}))}]}})+'</script>';
 t.mock.method(SafeFetch.prototype,'get',async function(this:SafeFetch,raw:string){const body=Buffer.from(html);this.budget.bytes+=body.length;this.budget.requests++;return {url:raw,originalUrl:raw,status:200,mime:'text/html',body,hash:'a'.repeat(64),bytes:body.length,etag:null,lastModified:null}});
 let size=0,observations=0;const result=await analyzeSource({runId:'run',source:{id:'s',url,allowedDomains:[]},onCheckpoint:async cp=>{const raw=JSON.stringify(cp);size=Buffer.byteLength(raw);observations=cp.result.observations.length;await readJson(new Request('http://localhost/',{method:'POST',body:raw}));}});
 assert.equal(result.menuCandidates.length,1);assert.ok(observations<20);assert.ok(size<PROCESS_LIMITS.checkpointBytes);assert.equal(result.status,'partial');assert.equal(result.errors.length,0);t.diagnostic(JSON.stringify({kind:'stress-60KB',htmlBytes:Buffer.byteLength(html),checkpointBytes:size,observations,products:result.menuCandidates.length}));
});
test('H1: checkpoint 413 es permanente y los avances anteriores se conservan',async t=>{
 t.mock.method(SafeFetch.prototype,'get',async function(this:SafeFetch,raw:string){this.budget.requests++;const body=Buffer.from('<h1>Local</h1>');return {url:raw,originalUrl:raw,status:200,mime:'text/html',body,hash:'a'.repeat(64),bytes:body.length,etag:null,lastModified:null}});
 let calls=0;const result=await analyzeSource({runId:'run',source:{id:'s',url,allowedDomains:[]},onCheckpoint:async()=>{calls++;throw Object.assign(new Error('grande'),{status:413})}});assert.equal(calls,1);assert.equal(result.errors[0].code,'RESULTADO_GRANDE');assert.equal(result.status,'failed');
 const db=testDatabase();try{const {jobs,lease}=await job(db);await jobs.fail(lease.id,'device',{...lease,code:'RESULTADO_GRANDE',retryable:true,message:'Demasiado grande'});assert.equal((await jobs.detail(lease.id)).state,'failed')}finally{db.close()}
});
test('H1: conserva la primera página si el checkpoint siguiente excede el límite',async t=>{
 t.mock.method(SafeFetch.prototype,'get',async function(this:SafeFetch,raw:string){this.budget.requests++;const body=Buffer.from(raw===url?'<h1>Local seguro</h1><a href="/carta">Carta</a>':'<h1>Carta</h1>');return {url:raw,originalUrl:raw,status:200,mime:'text/html',body,hash:'a'.repeat(64),bytes:body.length,etag:null,lastModified:null}});
 let saved=0;const result=await analyzeSource({runId:'run',source:{id:'s',url,allowedDomains:[]},onCheckpoint:async()=>{if(++saved===2)throw Object.assign(new Error('grande'),{status:413})}});assert.equal(saved,2);assert.equal(result.metrics.pages,1);assert.equal(result.businessCandidates[0].name,'Local seguro');assert.equal(result.status,'partial');assert.ok(result.errors.some(e=>e.code==='RESULTADO_GRANDE'));
});
test('H2: cambiar dominios o pausar una fuente encolada no amplía el permiso',async()=>{
 for(const state of ['activa','pausada']){const db=testDatabase();try{const {jobs,lease}=await job(db);await db.prepare("UPDATE import_jobs SET state='queued',attempt=0 WHERE id=?").bind(lease.id).run();await db.prepare('UPDATE sources SET config_revision=config_revision+1,allowed_domains_json=?,state=? WHERE id=?').bind('["menu.fu.do"]',state,lease.source.id).run();assert.equal(await jobs.claim('device'),null);assert.equal((await jobs.detail(lease.id)).error.code,'FUENTE_CAMBIO');await assert.rejects(()=>jobs.retry(actor,lease.id))}finally{db.close()}}
});
test('H2: cambio durante ejecución rechaza la siguiente descarga y la foto pendiente',async()=>{
 const db=testDatabase();try{const {jobs,lease}=await job(db);await db.prepare('UPDATE import_jobs SET result_json=? WHERE id=?').bind(JSON.stringify({mediaCandidates:[{url:url+'carta.png'}]}),lease.id).run();const images=new ImageRequests({DB:db} as any);await images.create(actor,lease.id,url+'carta.png');await db.prepare('UPDATE sources SET config_revision=config_revision+1 WHERE id=?').bind(lease.source.id).run();await assert.rejects(()=>jobs.access(lease.id,'device',{...lease,url,maxBytes:1024}),e=>(e as any).code==='FUENTE_CAMBIO');assert.equal(await images.claim('device'),null);assert.equal((await jobs.detail(lease.id)).network_requests,0)}finally{db.close()}
});
test('H2: crear directamente por servidor tampoco acepta dominios generales',async()=>{const db=testDatabase();try{await assert.rejects(()=>new JobRepository(db).create(actor,{url:'https://fuera.invalid/',allowedDomains:[],accessReference:'Fixture controlado'},'blocked'),e=>(e as any).code==='AUDITORIA_EXTRACCION_PENDIENTE')}finally{db.close()}});
test('H3: Retry-After en segundos, HTTP-date y fechas históricas; valores inválidos no se interpretan como fechas',()=>{
 const now=Date.parse('2026-10-22T12:00:00Z');assert.equal(retryAfterAt('7200',now),now+7200000);assert.equal(retryAfterAt('Thu, 22 Oct 2026 14:00:00 GMT',now),now+7200000);assert.equal(retryAfterAt('Thursday, 22-Oct-26 14:00:00 GMT',now),now+7200000);assert.equal(retryAfterAt('Thu Oct 22 14:00:00 2026',now),now+7200000);for(const v of ['-1','1.5','2026-10-22','Fri, 31 Feb 2026 14:00:00 GMT'])assert.equal(retryAfterAt(v,now),undefined);assert.ok(retryAfterAt('9999999999999999999999999',now)!>now+7200000);
});
test('H3: espera de dos horas persiste y no se reduce a treinta segundos ni al reiniciar otro trabajo',async()=>{
 const db=testDatabase();try{const {jobs,lease}=await job(db);const retryAt=Date.now()+7200000;await jobs.access(lease.id,'device',{...lease,url,maxBytes:1,retryAt});await jobs.fail(lease.id,'device',{...lease,code:'LIMITE_ORIGEN',retryable:true,retryAt,message:'El sitio pidió esperar'});assert.equal((await jobs.detail(lease.id)).state,'failed');const made=await jobs.create(actor,{url,allowedDomains:[],accessReference:'Otra consulta controlada'},'second');const next=await jobs.claim('device');assert.equal(next.id,made.jobId);await assert.rejects(()=>jobs.access(next.id,'device',{...next,url,maxBytes:1}),e=>(e as any).code==='ORIGEN_EN_ESPERA');assert.equal((await jobs.detail(next.id)).network_requests,0)}finally{db.close()}
});
test('H3: 429, 503 y redirección con espera no generan inmediatamente otra conexión',async t=>{
 for(const status of [429,503,302]){const host='wait-'+status+'.invalid';const calls=transport(t,()=>({status,headers:{'retry-after':'7200',...(status===302?{location:'/next'}:{})}}));const f=new SafeFetch({resolver});let until=0;f.hooks.onCooldown=async(_url,at)=>{until=at};await assert.rejects(()=>f.get('http://'+host+'/'),e=>(e as any).retryAt>Date.now()+7100000);await assert.rejects(()=>new SafeFetch({resolver}).get('http://'+host+'/other'));assert.equal(calls.length,1);assert.ok(until>Date.now()+7100000);t.mock.restoreAll()}
});
test('H4: HTML y fotos revalidan robots en el destino antes de descargar una ruta prohibida',async t=>{
 clock(t);const calls=transport(t,u=>u.pathname==='/robots.txt'?{body:'User-agent: *\nDisallow: /privado',headers:{'content-type':'text/plain'}}:{status:302,headers:{location:'/privado'}});
 const original=SafeFetch.prototype.get;t.mock.method(SafeFetch.prototype,'get',function(this:SafeFetch,...args:any[]){this.resolver=resolver;return original.apply(this,args as any)});
 await assert.rejects(()=>downloadMenuImage({url:'http://robot-image.invalid/carta.png',source:{url:'http://robot-image.invalid/',allowedDomains:[]}}),e=>(e as any).code==='ROBOTS_BLOQUEADO');
 await assert.rejects(()=>new SafeFetch({resolver,respectRobots:true}).get('http://robot-html.invalid/menu'),e=>(e as any).code==='ROBOTS_BLOQUEADO');assert.ok(!calls.some(v=>v.endsWith('/privado')));
});
test('H4: destino asociado permitido consulta su propio robots y puede continuar',async t=>{
 clock(t);const calls=transport(t,u=>u.pathname==='/robots.txt'?{body:'User-agent: *\nAllow: /',headers:{'content-type':'text/plain'}}:u.hostname==='from.invalid'?{status:302,headers:{location:'http://to.invalid/carta'}}:{body:'<h1>Destino</h1>'});
 const result=await new SafeFetch({resolver,respectRobots:true,approvedDomains:['to.invalid']}).get('http://from.invalid/carta');assert.equal(result.url,'http://to.invalid/carta');assert.ok(calls.includes('http://to.invalid/robots.txt'));
});
test('H4: robots conserva comodines, fin de ruta y caracteres literales sin expresiones regulares del sitio',()=>{
 const robots='User-agent: *\nDisallow: /privado*\nAllow: /privado/publico$';assert.equal(robotsAllows(robots,'/privado/publico'),true);assert.equal(robotsAllows(robots,'/privado/publico/otra'),false);assert.equal(robotsAllows('User-agent: *\nDisallow: /a.b','/axb'),true);assert.equal(robotsAllows('User-agent: *\nDisallow: /a.b','/a.b'),false);
 const at=performance.now();assert.equal(robotsAllows('User-agent: *\nDisallow: /'+('a*'.repeat(400))+'b','/'+('a'.repeat(1500))),true);assert.ok(performance.now()-at<1000);
});
test('H5: enlaces fallidos consumen el presupuesto real incluyendo robots y conservan la primera página',async t=>{
 clock(t);const html='<h1>Local</h1>'+Array.from({length:50},(_,i)=>'<a href="/carta-'+i+'">Carta</a>').join('');const calls=transport(t,u=>u.pathname==='/robots.txt'?{status:404}:u.pathname==='/'?{body:html}:{status:404});const original=SafeFetch.prototype.get;t.mock.method(SafeFetch.prototype,'get',function(this:SafeFetch,...args:any[]){this.resolver=resolver;return original.apply(this,args as any)});
 const result=await analyzeSource({runId:'run',source:{id:'s',url:'http://budget.invalid/',allowedDomains:[]},onCheckpoint:async()=>{}});assert.equal(calls.length,LIMITS.requests);assert.equal(result.metrics.pages,1);assert.equal(result.status,'partial');assert.ok(result.errors.some(e=>e.code==='PRESUPUESTO_SOLICITUDES'));assert.equal(result.businessCandidates[0].name,'Local');t.diagnostic(JSON.stringify({kind:'requests-404',connections:calls.length,processedPages:result.metrics.pages}));
});
test('H5: presupuesto persistente compartido por ramas, pausas y reintentos; reserva rechazada no abre otra consulta',async()=>{
 const db=testDatabase();try{const {jobs,lease}=await job(db);for(let i=0;i<LIMITS.requests;i++){await db.prepare('UPDATE extraction_origins SET next_request_at=0').run();await jobs.access(lease.id,'device',{...lease,url:url+'carta-'+i,maxBytes:1024});}
 await assert.rejects(()=>jobs.access(lease.id,'device',{...lease,url,maxBytes:1024}),e=>(e as any).code==='PRESUPUESTO_SOLICITUDES');assert.equal((await jobs.detail(lease.id)).network_requests,LIMITS.requests);await jobs.fail(lease.id,'device',{...lease,code:'DESCARGA_FALLIDA',retryable:true});assert.equal((await jobs.detail(lease.id)).state,'failed');await assert.rejects(()=>jobs.retry(actor,lease.id));
 }finally{db.close()}
});
test('H5: fotos comparten el contador del análisis y el intervalo del origen',async()=>{
 const db=testDatabase();try{const {jobs,lease}=await job(db);await jobs.access(lease.id,'device',{...lease,url,maxBytes:1024});assert.ok((await jobs.access(lease.id,'device',{...lease,url,maxBytes:1024})).waitMs>0);assert.equal((await jobs.detail(lease.id)).network_requests,1);await db.prepare('UPDATE import_jobs SET state=?,result_json=? WHERE id=?').bind('partial',JSON.stringify({mediaCandidates:[{url:url+'carta.png'}]}),lease.id).run();const images=new ImageRequests({DB:db} as any);await images.create(actor,lease.id,url+'carta.png');const image=await images.claim('device');await db.prepare('UPDATE extraction_origins SET next_request_at=0').run();await images.access(image.id,'device',{leaseToken:image.leaseToken,url:url+'carta.png',maxBytes:8*1024*1024});assert.equal((await jobs.detail(lease.id)).network_requests,2)}finally{db.close()}
});
test('H6: PNG sin píxeles se rechaza ya en la inspección inicial',async()=>{const valid=await readFile(new URL('fixtures/ocr/controlada.png',import.meta.url));const invalid=Buffer.concat([valid.subarray(0,33),Buffer.from([0,0,0,0,73,69,78,68,174,66,96,130])]);assert.throws(()=>inspectImage(invalid,'image/png'),/píxeles/);assert.equal(inspectImage(valid,'image/png').width,1200)});
test('Protocolo: un motor anterior no puede reclamar importaciones sin las nuevas verificaciones',async()=>{
 const db=testDatabase();try{const env:any={DB:db,APP_ENV:'local',AUTH_MODE:'local',CATALOG_BACKEND:'d1',UI_ORIGIN:'http://127.0.0.1:5174'};const {digest}=await import('../server/application/common.ts');const token='a'.repeat(64);await db.prepare('INSERT INTO devices(id,name,token_hash,paired_by,paired_at) VALUES(?,?,?,?,?)').bind('device','Fixture',await digest(token),actor.id,new Date().toISOString()).run();const response=await app.request('http://127.0.0.1:8787/api/v1/worker/claim',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}'},env);assert.equal(response.status,409);assert.equal((await response.json() as any).error.code,'MOTOR_ACTUALIZACION')}finally{db.close()}
});
test('API real: el protocolo actual obtiene permiso; editar dominios impide la siguiente consulta sin consumir presupuesto',async()=>{
 const db=testDatabase();try{
  const origin='http://127.0.0.1:5174',env:any={DB:db,APP_ENV:'local',AUTH_MODE:'local',CATALOG_BACKEND:'d1',UI_ORIGIN:origin};
  const login=await app.request('http://127.0.0.1:8787/api/v1/auth/local',{method:'POST',headers:{Origin:origin}},env),cookie=login.headers.get('set-cookie')!.split(';')[0],csrf=(await login.json() as any).data.csrf;
  const call=async(path:string,data:any,workerToken?:string,method='POST')=>{const response=await app.request('http://127.0.0.1:8787/api/v1/'+path,{method,headers:{Origin:origin,'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID(),...(workerToken?{Authorization:'Bearer '+workerToken}:{Cookie:cookie,'X-CSRF-Token':csrf})},body:JSON.stringify(data)},env);return {status:response.status,data:await response.json() as any}};
  assert.equal((await call('admin/imports',{url,allowedDomains:[],accessReference:'Fuente de ensayo sin descargas',policyReviewed:true})).status,202);
  const pairing=await call('admin/pairing',{}),paired=await call('worker/pair',{code:pairing.data.data.code,name:'Motor controlado'}),token=paired.data.data.token;
  const claimed=await call('worker/claim',{extractionProtocol:2},token);assert.equal(claimed.status,200);const lease=claimed.data.data;assert.equal(lease.kind,'import');
  const input={leaseToken:lease.leaseToken,generation:lease.generation,url,maxBytes:1024};assert.equal((await call('worker/imports/'+lease.id+'/access',input,token)).status,200);
  assert.equal((await call('admin/sources/'+lease.source.id,{expectedRevision:1,state:'activa',accessReference:'Configuración modificada de ensayo',allowedDomains:['fuera-del-piloto.invalid']},undefined,'PUT')).status,200);
  const denied=await call('worker/imports/'+lease.id+'/access',input,token);assert.equal(denied.status,409);assert.equal(denied.data.error.code,'LEASE_VENCIDO');const stopped=await new JobRepository(db).detail(lease.id);assert.equal(stopped.error.code,'FUENTE_CAMBIO');assert.equal(stopped.state,'failed');assert.equal(stopped.network_requests,1);
 }finally{db.close()}
});
test('Persistencia: una copia de esquema 5 sin las columnas nuevas restaura fichas y trabajos con valores seguros',async()=>{
 const db=testDatabase();try{
  const {CatalogRepository}=await import('../server/repositories/catalog.ts'),{BackupRepository}=await import('../server/repositories/backups.ts'),{restorePackage}=await import('../scripts/restaurar-copia.ts'),{digest}=await import('../server/application/common.ts');
  await new CatalogRepository(db).save(actor,{fields:{nombre:'Ficha conservada',localidad:'San Bernardo',categoria:'pizzerias',referenciaVerificacion:'Prueba controlada de copia anterior'} as any,expectedRevision:0,approve:false,menu:[],lockedFields:[]});await new JobRepository(db).create(actor,{url,allowedDomains:[],accessReference:'Fuente de prueba anterior'},'old');
  const backups=new BackupRepository(db);await backups.create(actor);const backup=await backups.claim('device'),rows:any[]=[];while(rows.length<backup.rowCount)rows.push(...await backups.page(backup.id,'device',backup.leaseToken,rows.at(-1)?.sequence||0));
  for(const entry of rows)if(entry.table==='import_jobs')for(const column of ['source_revision','network_requests','network_bytes','network_started_at'])delete entry.row[column];
  const result=await restorePackage({rows,manifest:{format:backup.format,rows:rows.length,objects:0,schema:5,sha256:await digest(JSON.stringify(rows))}},':memory:');assert.equal((result.listings as any).n,1);assert.equal((result.publishedListings as any).n,0);assert.equal((result.sessions as any).n,0);
 }finally{db.close()}
});
