import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import dgram from 'node:dgram';import {Resolver,lookup} from 'node:dns/promises';import {gzipSync} from 'node:zlib';
import {SafeFetch,LIMITS} from '../engine/fetch/safe-fetch.ts';import {validateResolvedAddresses} from '../engine/security/network.ts';

test('Nativa DNS: servidor UDP aislado cambia de respuesta pública a privada y SafeFetch bloquea la segunda',async t=>{
 const dns=dgram.createSocket('udp4');let queries=0;const answers:string[]=[];
 dns.on('message',(query,remote)=>{let end=12;while(query[end])end+=query[end]+1;end+=5;const ip=queries++===0?'8.8.8.8':'127.0.0.1';answers.push(ip);const header=Buffer.alloc(12);header.writeUInt16BE(query.readUInt16BE(0),0);header.writeUInt16BE(0x8180,2);header.writeUInt16BE(1,4);header.writeUInt16BE(1,6);const rr=Buffer.from([0xc0,0x0c,0,1,0,1,0,0,0,0,0,4,...ip.split('.').map(Number)]);dns.send(Buffer.concat([header,query.subarray(12,end),rr]),remote.port,remote.address)});
 await new Promise<void>((resolve,reject)=>{dns.once('error',reject);dns.bind(0,'127.0.0.1',resolve)});const resolver=new Resolver({timeout:1000,tries:1});resolver.setServers(['127.0.0.1:'+(dns.address() as any).port]);
 try{
  const first=(await resolver.resolve4('cambio.invalid')).map(address=>({address,family:4}));assert.equal(validateResolvedAddresses(first)[0].address,'8.8.8.8');
  const f=new SafeFetch({resolver:async hostname=>(await resolver.resolve4(hostname)).map(address=>({address,family:4}))});
  await assert.rejects(()=>f.get('http://cambio.invalid/'),e=>(e as any).code==='DNS_NO_PUBLICO');assert.equal(f.budget.bytes,0);assert.deepEqual(answers,['8.8.8.8','127.0.0.1']);t.diagnostic(JSON.stringify({kind:'native-dns-change',answers,contentBytes:0}));
 }finally{resolver.cancel();await new Promise<void>(resolve=>dns.close(resolve))}
});
test('Nativa DNS del sistema: localhost sin puerto especial se rechaza por DNS, no por la regla de puertos',async()=>{
 const records=await lookup('localhost',{all:true,verbatim:true});assert.ok(records.length);const f=new SafeFetch({resolver:async()=>records});await assert.rejects(()=>f.get('http://local-resuelto.invalid/'),e=>(e as any).code==='DNS_NO_PUBLICO');assert.equal(f.budget.bytes,0);
});
test('Nativa HTTP: lookup fijado, IP efectiva, Host, redirect y descompresión sobre socket real',async t=>{
 let hits=0;const hosts:string[]=[],cookies:any[]=[];const server=http.createServer((req,res)=>{hits++;hosts.push(req.headers.host!);cookies.push(req.headers.cookie);if(req.url==='/redirect'){res.writeHead(302,{location:'http://169.254.169.254/latest/meta-data/'});res.end();return}if(req.url==='/gzip'){res.writeHead(200,{'Content-Type':'text/html','Content-Encoding':'gzip'});res.end(gzipSync(Buffer.alloc(3*1024*1024,'x')));return}res.writeHead(200,{'Content-Type':'text/html'});res.end('<h1>Fixture nativo</h1>')});
 await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});const port=(server.address() as any).port;
 try{
  // Invocación exclusiva de prueba de la frontera privada, porque get() DEBE rechazar loopback.
  // No se añade una opción de producción para permitir IP privadas ni puertos de ensayo.
  const f=new SafeFetch(),native=(path:string)=>(f as any).request(new URL('http://pin.invalid:'+port+path),{address:'127.0.0.1',family:4},LIMITS.pageBytes);
  const success=await native('/allowed');assert.match(success.resource.body.toString(),/Fixture nativo/);assert.equal(hosts[0],'pin.invalid:'+port);assert.equal(cookies[0],undefined);
  const redirect=await native('/redirect');assert.equal(redirect.redirect,'http://169.254.169.254/latest/meta-data/');const before=hits;await assert.rejects(()=>new SafeFetch().get(redirect.redirect),e=>(e as any).code==='DESTINO_PRIVADO');assert.equal(hits,before);
  await assert.rejects(()=>native('/gzip'),e=>(e as any).code==='PRESUPUESTO_BYTES');
  const beforeBlocked=hits;await assert.rejects(()=>new SafeFetch().get('http://127.0.0.1/'));assert.equal(hits,beforeBlocked);
  t.diagnostic(JSON.stringify({kind:'native-socket',host:hosts[0],verifiedPeer:'127.0.0.1',requests:hits,metadataConnections:0,decodedLimitEnforced:true}));
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()))}
});
