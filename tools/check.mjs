/* Repeatable checks for this static website. Run: npm run check */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let checks=0;function check(label,fn){fn();checks++;console.log('PASS',label);}
// Os templates em /templates são sites independentes, verificados por tools/templates/check.mjs.
// /docs é documentação interna (styleguide), fora da hospedagem.
const files=walk(root).filter(f=>!f.includes(path.sep+'tools'+path.sep)&&!f.includes(path.sep+'templates'+path.sep)&&!f.includes(path.sep+'docs'+path.sep)&&!f.includes(path.sep+'.git'+path.sep));
const html=files.filter(f=>f.endsWith('.html'));
check('All JavaScript files parse',()=>{for(const file of files.filter(f=>f.endsWith('.js'))){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);}});
check('Local HTML references exist; IDs are unique',()=>{
 for(const file of html){const source=fs.readFileSync(file,'utf8');const ids=Array.from(source.matchAll(/\bid="([^"]+)"/g),m=>m[1]);assert.equal(new Set(ids).size,ids.length,file);
  for(const match of source.matchAll(/<(?:a|link|script|img|iframe|source)\b[^>]*?\b(?:href|src)="([^"]+)"/g)){
   const url=new URL(match[1],'https://local.test/'+path.relative(root,file).split(path.sep).join('/'));if(url.origin!=='https://local.test')continue;
   let target=path.join(root,decodeURIComponent(url.pathname));if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');assert.ok(fs.existsSync(target),`${file}: ${match[1]}`);
   if(url.hash&&url.hash!=='#'&&target.endsWith('.html'))assert.ok(fs.readFileSync(target,'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`Missing anchor ${file}: ${match[1]}`);
  }
 }
});
check('Mobile menus expose the solutions hub and main pages',()=>{
 for(const file of html){const source=fs.readFileSync(file,'utf8');if(!source.includes('class="mobile-nav-list"'))continue;
  const rel=path.relative(root,file).split(path.sep);const prefix='../'.repeat(rel.length-1-(rel[0]==='en'?1:0));
  for(const target of ['solucoes/index.html','monte-sua-solucao.html','como-trabalhamos.html','sobre.html','contato.html'])assert.ok(source.includes(`href="${prefix}${target}" class="mobile-nav-link"`),`${file}: ${target}`);
  assert.match(source,/class="[^"]*mobile-accordion-trigger[^"]*"[^>]*aria-expanded="false"/);
 }
});
check('Sharing uses the square brand icon (small preview card) and stray pricing banners are gone',()=>{
 const png=fs.readFileSync(path.join(root,'assets/images/og-cmkcogit-icone.png'));assert.equal(png.readUInt32BE(16),600);assert.equal(png.readUInt32BE(20),600);
 for(const file of html){const source=fs.readFileSync(file,'utf8');if(path.basename(file)==='blackcogit.html'){assert.match(source,/og-black-2026\.png/);const og=fs.readFileSync(path.join(root,'assets/images/og-black-2026.png'));assert.equal(og.readUInt32BE(16),1200);assert.equal(og.readUInt32BE(20),630);continue;}if(source.includes('property="og:image"')){assert.match(source,/og-cmkcogit-icone\.png/);assert.match(source,/og:image:width" content="600"/);assert.match(source,/twitter:card" content="summary"/);}
  assert.doesNotMatch(source,/Consulte a <a href="index\.html#tabela-de-valores">tabela atual de serviços e valores/);
 }
});
check('Every content page supports zoom, landmarks, labels and local privacy controls',()=>{
 for(const file of html){const source=fs.readFileSync(file,'utf8');if(!source.includes('<main'))continue;
 assert.equal((source.match(/<h1\b/g)||[]).length,1,file);assert.match(source,path.relative(root,file).startsWith('en'+path.sep)?/<html[^>]*lang="en"/:/<html[^>]*lang="pt-BR"/,file);assert.match(source,/name="viewport"/);assert.doesNotMatch(source,/user-scalable=no|maximum-scale=1/);
 assert.match(source,/js\/privacy.js/);assert.match(source,/class="skip-link"/);assert.doesNotMatch(source,/fonts.googleapis.com|fonts.gstatic.com/);
 }
});
check('Styles and fonts resolve locally',()=>{
 for(const file of files.filter(f=>f.endsWith('.css'))){const source=fs.readFileSync(file,'utf8');for(const m of source.matchAll(/(?:url\(\s*['"]?([^)'"\s]+)|@import\s+['"]([^'"]+))/g)){const ref=m[1]||m[2];if(ref.startsWith('data:'))continue;assert.ok(!/^https?:/.test(ref),ref);assert.ok(fs.existsSync(path.resolve(path.dirname(file),ref)),ref);}}
});
check('Personal drafts are not persisted or logged',()=>{
 for(const file of files.filter(f=>f.endsWith('.js'))){const source=fs.readFileSync(file,'utf8');assert.doesNotMatch(source,/sessionStorage\.setItem|console\.log/);}
});
check('Installable app (PWA): manifest, icons, iOS tags, service worker and versioned assets',()=>{
 const m=JSON.parse(read('site.webmanifest'));
 assert.equal(m.name,'CMK COGIT');assert.equal(m.short_name,'COGIT');assert.equal(m.start_url,'/?source=pwa');assert.equal(m.scope,'/');assert.equal(m.display,'standalone');assert.equal(m.lang,'pt-BR');
 assert.ok(!('orientation'in m),'no orientation lock (tablets)');assert.equal(m.theme_color,'#1A2C52');assert.equal(m.background_color,'#F3F3F1');
 const png=f=>{const b=fs.readFileSync(path.join(root,f));return {w:b.readUInt32BE(16),h:b.readUInt32BE(20),alpha:[4,6].includes(b[25])};};
 for(const [purpose,size] of [['any','192x192'],['any','512x512'],['maskable','512x512']]){const icon=m.icons.find(i=>i.purpose===purpose&&i.sizes===size);assert.ok(icon,purpose+' '+size);const p=png(icon.src.slice(1));assert.equal(p.w+'x'+p.h,size,icon.src);}
 const apple=png('apple-touch-icon.png');assert.equal(apple.w,180);assert.equal(apple.h,180);assert.equal(apple.alpha,false,'apple-touch-icon must be opaque');
 for(const file of html.filter(f=>!path.basename(f).startsWith('google'))){const source=fs.readFileSync(file,'utf8');
  for(const re of [/rel="manifest" href="[^"]*site\.webmanifest"/,/rel="apple-touch-icon"/,/name="theme-color" content="#1A2C52"/,/name="apple-mobile-web-app-capable" content="yes"/,/name="mobile-web-app-capable" content="yes"/,/name="apple-mobile-web-app-title" content="COGIT"/,/name="apple-mobile-web-app-status-bar-style" content="default"/,/name="viewport" content="[^"]*viewport-fit=cover/,/name="viewport"[^>]*>\s*<script data-cogit-modo>/])assert.match(source,re,file);
  if(source.includes('<main'))assert.match(source,/js\/pwa\.js\?v=/,file);
  for(const t of source.matchAll(/<(?:link|script)\b[^>]*?\s(?:href|src)="([^"?#:]+\.(?:css|js))(\?v=[0-9a-f]+)?"/g))assert.ok(t[2],`${file}: ${t[1]} sem ?v= (rode npm run gerar)`);
  if(path.relative(root,file).startsWith('en'+path.sep)&&source.includes('class="header-actions"'))assert.match(source,/js\/i18n-en\.js\?v=[^"]*"><\/script>\s*<script src="[^"]*js\/i18n\.js/,file);
 }
 const sw=read('sw.js');assert.match(sw,/const VERSION = '[0-9a-f]{12}';/);assert.match(sw,/url\.origin !== self\.location\.origin\) return/);assert.match(sw,/skipWaiting/);assert.match(sw,/clients\.claim/);
 for(const f of ['offline.html',...sw.match(/'\/assets\/[^']+'/g).map(s=>s.slice(2,-1))])assert.ok(fs.existsSync(path.join(root,f)),f);
});
function environment(saved=null,blocked=false){
 const handlers={},nodes=new Map(),storage=new Map(),scripts=[],cookies=[];let clock=Date.now(),reloads=0;
 if(saved!==null)storage.set('cogit_consent_v2',typeof saved==='string'?saved:JSON.stringify(saved));
 class Node {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.id='';this.open=false;this.checked=false;this.hidden=false;this.attrs={};this.handlers={};this.children=new Map();this.isConnected=true;}
  setAttribute(k,v){this.attrs[k]=String(v);} getAttribute(k){return this.attrs[k]??null;}
  addEventListener(k,fn){(this.handlers[k]??=[]).push(fn);} fire(k,event={}){for(const fn of this.handlers[k]||[])fn({target:this,...event});}
  querySelector(selector){if(!this.children.has(selector)){const el=new Node(selector.includes('input')?'input':'button');if(selector.startsWith('#')){el.id=selector.slice(1);nodes.set(el.id,el);}this.children.set(selector,el);}return this.children.get(selector);}
  append(el){if(el.id)nodes.set(el.id,el);if(el.tagName==='SCRIPT')scripts.push(el);}
  remove(){nodes.delete(this.id);this.isConnected=false;} focus(){} showModal(){this.open=true;} close(){this.open=false;this.fire('close');}
 }
 const document={currentScript:{src:'https://local.test/js/privacy.js'},body:new Node('body'),head:new Node('head'),activeElement:null,visibilityState:'visible',
  addEventListener(k,fn){(handlers['doc:'+k]??=[]).push(fn);},getElementById:id=>nodes.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:tag=>new Node(tag)};
 Object.defineProperty(document,'cookie',{get:()=>cookies.some(c=>/^_ga=;.*Max-Age=0/.test(c))?'':'_ga=test; _ga_TEST=state; other=keep',set:v=>cookies.push(v)});
 class Clock extends Date{static now(){return clock;}}
 const context={document,URL,URLSearchParams,Date:Clock,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},setTimeout:()=>1,clearTimeout:()=>{},console,
  localStorage:{getItem:key=>{if(blocked)throw Error('blocked');return storage.get(key)??null;},setItem:(key,value)=>{if(blocked)throw Error('blocked');storage.set(key,value);},removeItem:key=>storage.delete(key)},sessionStorage:{removeItem:()=>{}},
  location:{origin:'https://local.test',pathname:'/contato.html',hostname:'local.test',search:'?email=private@example.test',hash:'#private',reload:()=>reloads++},
  siteConfig:{gaId:'G-TEST123',requireCookieConsent:false},matchMedia:()=>({matches:false}),addEventListener(k,fn){(handlers[k]??=[]).push(fn);},dispatchEvent(event){for(const fn of handlers[event.type]||[])fn(event);}};
 context.window=context;vm.createContext(context);vm.runInContext(read('js/privacy.js'),context);vm.runInContext(read('js/analytics.js'),context);vm.runInContext(read('js/utils.js'),context);
 return {context,nodes,scripts,storage,cookies,advance(ms){clock+=ms;},get reloads(){return reloads;},node:()=>new Node()};
}
check('No analytics request or event queue without consent, even with legacy bypass disabled',()=>{const e=environment();e.context.CogitPrivacy.init();e.context.initAnalytics();e.context.trackEvent('test',{email:'private'});assert.equal(e.scripts.length,0);assert.equal(e.context.dataLayer,undefined);assert.ok(e.nodes.has('cookie-banner'));});
check('Reject persists and does not load analytics',()=>{const e=environment();e.context.CogitPrivacy.init();e.nodes.get('cookie-reject').fire('click');assert.equal(e.context.CogitPrivacy.allows('analytics'),false);assert.equal(e.scripts.length,0);assert.equal(JSON.parse(e.storage.get('cogit_consent_v2')).analytics,false);const next=environment(e.storage.get('cogit_consent_v2'));next.context.CogitPrivacy.init();assert.ok(!next.nodes.has('cookie-banner'));});
check('Accept loads once; URL parameters and personal event fields are excluded',()=>{const e=environment();e.context.CogitPrivacy.init();e.nodes.get('cookie-accept').fire('click');e.context.initAnalytics();assert.equal(e.scripts.length,1);const config=e.context.dataLayer.find(args=>args[0]==='config')[2];assert.equal(config.page_location,'https://local.test/contato.html');assert.equal(config.page_referrer,'');assert.equal(config.allow_google_signals,false);e.context.trackEvent('diagnostic_completed',{service:'portfolio',email:'private@example.test',name:'Private',context:'secret'});const event=e.context.dataLayer.at(-1)[2];assert.equal(event.service,'portfolio');assert.ok(!('email'in event)&&!('name'in event)&&!('context'in event));});
check('Revocation unloads analytics, clears its accessible cookies and stops events',()=>{const e=environment();e.context.CogitPrivacy.init();e.nodes.get('cookie-accept').fire('click');e.context.CogitPrivacy.openSettings();e.nodes.get('cookie-reject-all').fire('click');assert.equal(e.context.CogitPrivacy.allows('analytics'),false);assert.equal(e.reloads,1);assert.ok(e.cookies.some(c=>c.startsWith('_ga=')));assert.ok(!e.cookies.some(c=>c.startsWith('other=')));e.context.trackEvent('after_revoke',{});assert.equal(e.context.dataLayer.length,0);});
check('Malformed, expired, old-version, future and overlong choices are rejected',()=>{const now=Date.now();const good={version:'2026-09-09',analytics:true,decidedAt:now-1000,expiresAt:now+100000};for(const saved of ['bad JSON',{...good,version:'old'},{...good,expiresAt:now-1},{...good,decidedAt:now+90000},{...good,expiresAt:now+181*86400000},{...good,analytics:'true'}])assert.equal(environment(saved).context.CogitPrivacy.allows('analytics'),false);const e=environment(good);assert.equal(e.context.CogitPrivacy.allows('analytics'),true);e.advance(200000);assert.equal(e.context.CogitPrivacy.allows('analytics'),false);});
check('Blocked storage falls back to a page-only decision',()=>{const e=environment(null,true);e.context.CogitPrivacy.init();e.nodes.get('cookie-accept').fire('click');assert.equal(e.context.CogitPrivacy.allows('analytics'),true);assert.equal(environment(null,true).context.CogitPrivacy.allows('analytics'),false);});
check('Contact authorization is unchecked and independent of optional cookies',()=>{const e=environment();const markup=e.context.CogitPrivacy.formMarkup('test');assert.match(markup,/type="checkbox"/);assert.doesNotMatch(markup,/\schecked/);assert.equal(e.context.CogitPrivacy.authorize(null),false);const field=e.node();field.id='test';const error=e.node();e.nodes.set('test-error',error);const container={querySelector:()=>field};assert.equal(e.context.CogitPrivacy.authorize(container),false);assert.equal(error.hidden,false);field.checked=true;assert.equal(e.context.CogitPrivacy.authorize(container),true);assert.equal(e.context.CogitPrivacy.allows('analytics'),false);});
check('Free text is escaped and Brazilian phone formatting supports 10/11 digits',()=>{const e=environment();assert.equal(e.context.CogitUI.escapeHtml('<img src=x onerror="bad">'), '&lt;img src=x onerror=&quot;bad&quot;&gt;');assert.equal(e.context.CogitUI.formatPhone('1134567890'),'(11) 3456-7890');assert.equal(e.context.CogitUI.formatPhone('11987654321'),'(11) 98765-4321');});
function contrast(a,b){const luminance=hex=>{const c=hex.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
check('Identity 2026 text, links and primary CTA meet WCAG AA contrast',()=>{for(const [fg,bg]of[['121314','f3f3f1'],['55595e','f3f3f1'],['55595e','e6e6e2'],['f3f3f1','121314'],['a4a8ad','121314'],['8ea6d8','121314'],['ffffff','1a2c52'],['a9b6cf','1a2c52'],['1a2c52','f3f3f1']]){const ratio=contrast(fg,bg);assert.ok(ratio>=4.5,`${fg}/${bg}: ${ratio}`);console.log(`  #${fg} / #${bg}: ${ratio.toFixed(2)}:1`);}});
function configuratorTest(blackAgora=null) {
 const e=environment();
 Object.assign(e.context,{TextEncoder,TextDecoder,btoa,atob,crypto:globalThis.crypto,Uint8Array});
 vm.runInContext(read('js/data.js'),e.context);
 // Black da Cogit: só carregada quando o teste fixa um horário (black-config.js > simularAgora)
 if(blackAgora){e.context.self=e.context;vm.runInContext(read('black-config.js'),e.context);e.context.COGIT_BLACK.simularAgora=blackAgora;vm.runInContext(read('js/black.js'),e.context);}
 vm.runInContext(read('js/handoff.js'),e.context);
 const source=read('js/configurator.js').replace('return { init, reset, preselectAndScroll };','return { init, reset, preselectAndScroll, state, toggleService, toggleAddon, updateAddonQuantity, selectLevel, selectSolutionModel, calculateTotal, buildHandoff };');
 vm.runInContext(source,e.context);
 return {e,app:vm.runInContext('ConfiguratorApp',e.context),handoff:vm.runInContext('CogitHandoff',e.context)};
}
check('Current prices, custom models and compatible extras total correctly',()=>{
 const {app}=configuratorTest();app.toggleService('landing-page');app.selectSolutionModel('modelos-prontos','landing-page');assert.equal(app.calculateTotal().value,600);app.selectSolutionModel('sob-medida','landing-page');assert.equal(app.calculateTotal().value,800);app.toggleAddon('automacao-extra');assert.equal(app.calculateTotal().value,1690);app.toggleService('landing-page');assert.equal(app.state.selectedAddons.length,0);app.toggleService('portfolio');app.selectSolutionModel('modelos-prontos','portfolio');assert.equal(app.calculateTotal().value,500);
});
check('Monthly support is separate from the initial investment',()=>{
 const {app}=configuratorTest();app.toggleService('site-institucional');app.selectSolutionModel('modelos-prontos','site-institucional');app.toggleService('manutencao');assert.equal(app.calculateTotal().value,700);app.toggleService('suporte');assert.equal(app.state.selectedServices.filter(x=>x.billing==='monthly'||x.billing==='demand').length,1);assert.equal(app.calculateTotal().value,700);
});
check('The listed combined plan uses the sum of its services',()=>{
 const {app}=configuratorTest();app.toggleService('identidade-essencial');app.toggleService('landing-page');app.selectSolutionModel('modelos-prontos','landing-page');app.toggleService('automacao');assert.equal(app.calculateTotal().value,1790);assert.equal(app.calculateTotal().type,'from');assert.match(app.buildHandoff().notas,/Combinação Conversão: 10% de desconto/);
});
check('Every link to Monte sua solução uses services and formats that exist in the catalog',()=>{
 const c={};vm.createContext(c);vm.runInContext(read('js/data.js')+';this.ids=configuratorData.services.map(s=>s.id);this.flows=problemFlowsData',c);
 const walk=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>['templates','node_modules','.git','assets','tools','docs'].includes(e.name)?[]:e.isDirectory()?walk(path.join(d,e.name)):/\.(html|js)$/.test(e.name)&&!/\.min\./.test(e.name)?[path.join(d,e.name)]:[]);
 const bad=[];
 walk('.').forEach(f=>{(read(f).replace(/&amp;/g,'&').match(/monte-sua-solucao\.html\?[^"'\s<>`$]+/g)||[]).forEach(l=>{const q=new URLSearchParams(l.split('?')[1]);(q.get('services')||'').split(',').filter(Boolean).forEach(id=>{if(!c.ids.includes(id))bad.push(f+': '+id)});const m=q.get('model');if(m&&!['modelos-prontos','sob-medida'].includes(m))bad.push(f+': model '+m);});});
 c.flows.forEach(fl=>[fl].concat(fl.subQuestions||[]).forEach(q=>(q.preselect||[]).forEach(id=>{if(!c.ids.includes(id))bad.push('problemFlowsData '+q.id+': '+id)})));
 assert.deepEqual(bad,[]);
});
check('Structured data and sitemap are up to date (tools/seo.py)',()=>{
 const r=spawnSync('python3',['tools/seo.py','--check'],{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stdout+r.stderr);
});
check('Price blocks and combinations in the pages match js/data.js',()=>{
 const r=spawnSync('python3',['tools/precos-solucoes.py','--check'],{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stdout+r.stderr);
});
check('Optional consultancy is free with COGIT and noted for the platform',()=>{
 const {app}=configuratorTest();app.toggleService('landing-page');app.selectSolutionModel('modelos-prontos','landing-page');app.state.selectedServices[0].consultoria=true;assert.equal(app.calculateTotal().value,600);assert.match(app.buildHandoff().notas,/Consultoria e planejamento digital/);assert.match(app.buildHandoff().notas,/R\$ 350/);
});
check('Platform handoff carries only IDs/choices, keeps the same ref for the same selection and opens the app',()=>{
 const {app,handoff}=configuratorTest();app.toggleService('portfolio');app.selectSolutionModel('modelos-prontos','portfolio');app.toggleAddon('automacao-extra');
 const cfg=app.buildHandoff();assert.equal(cfg.origem,'configurador');assert.equal(cfg.servicos[0].id,'portfolio');assert.equal(cfg.servicos[0].modelo,'modelos-prontos');assert.equal(cfg.complementos[0].id,'automacao-extra');
 const url=new URL(handoff.link(cfg));assert.equal(url.origin+url.pathname,'https://app.cmkcogit.com.br/continuar.html');assert.ok(url.search===''||/^\?volta=/.test(url.search),'only the return page may go in the query');
 const decode=link=>JSON.parse(Buffer.from(new URL(link).hash.replace('#cfg=',''),'base64url').toString('utf8'));
 const payload=decode(url.href);assert.equal(payload.v,1);assert.match(payload.ref,/^[A-Za-z0-9_-]{16,64}$/);assert.ok(!('email'in payload)&&!('whatsapp'in payload));
 assert.equal(decode(handoff.link(cfg)).ref,payload.ref,'same selection, same ref');
 app.selectSolutionModel('sob-medida','portfolio');assert.notEqual(decode(handoff.link(app.buildHandoff())).ref,payload.ref,'new selection, new ref');
 assert.doesNotMatch(read('js/configurator.js'),/wa\.me/);
});
check('Home diagnostic sends to the platform instead of WhatsApp',()=>{
 const source=read('js/components.js');const result=source.slice(source.indexOf('function renderResult()'),source.indexOf('window.heroStartDiagnosis'));
 assert.match(result,/CogitHandoff\.irParaPlataforma/);assert.doesNotMatch(result,/wa\.me|hero-btn-whatsapp/);assert.doesNotMatch(source,/renderInvite/);
 for(const page of ['monte-sua-solucao.html'])assert.ok(read(page).indexOf('src="js/handoff.js')>0&&read(page).indexOf('src="js/handoff.js')<read(page).indexOf('src="js/components.js'),page);
});
check('Configurator selection is restored from this browser without free text',()=>{
 const first=configuratorTest();first.app.toggleService('landing-page');first.app.selectSolutionModel('modelos-prontos','landing-page');
 const saved=JSON.parse(first.e.storage.get('cogit_cfg_sessao_v1'));assert.equal(saved.services[0].serviceId,'landing-page');assert.ok(!JSON.stringify(saved).includes('notes'));
});

// ── Black da Cogit (black-config.js): datas, preços do simulador e marca enviada à plataforma ──
const ANTES='2026-11-25T23:59:59-03:00',INICIO='2026-11-26T00:00:00-03:00',DURANTE='2026-11-27T23:59:00-03:00',DEPOIS='2026-11-28T00:00:00-03:00';
function blackFase(t){const x={};x.self=x;vm.createContext(x);vm.runInContext(read('black-config.js'),x);x.COGIT_BLACK.simularAgora=t;vm.runInContext(read('js/black.js'),x);return x.CogitBlack.fase();}
check('Black: config pronta para publicar e fases nas datas certas (horário de Brasília)',()=>{
 const c={};c.self=c;vm.createContext(c);vm.runInContext(read('black-config.js'),c);const b=c.COGIT_BLACK;
 assert.equal(b.simularAgora,null,'black-config.js: simularAgora precisa ser null antes de publicar');assert.equal(b.id,'black-2026');
 assert.equal(blackFase(ANTES),'antes');assert.equal(blackFase(INICIO),'durante');assert.equal(blackFase(DURANTE),'durante');assert.equal(blackFase('2026-11-27T23:59:59-03:00'),'durante');assert.equal(blackFase(DEPOIS),'depois');
 for(const c2 of b.combos)assert.equal(c2.por,Math.floor(c2.de*(100-c2.percentual)/100/10)*10,c2.id);
});
check('Black: simulador usa os preços da Black, sem os 10%, e marca o pedido',()=>{
 const t=(sel,agora)=>{const {app}=configuratorTest(agora);sel(app);return {total:app.calculateTotal(),h:app.buildHandoff()};};
 const portf=a=>{a.toggleService('portfolio');a.selectSolutionModel('modelos-prontos','portfolio');};
 let r=t(portf,DURANTE);assert.equal(r.total.value,400);assert.equal(r.total.type,'fixed');assert.equal(r.h.promo,'black-2026');assert.match(r.h.notas,/Black da Cogit: de R\$ 500 por R\$ 400/);
 r=t(portf,ANTES);assert.equal(r.total.value,500);assert.ok(!('promo' in r.h));
 r=t(portf,DEPOIS);assert.equal(r.total.value,500);assert.ok(!('promo' in r.h));
 const lp=a=>{a.toggleService('landing-page');a.selectSolutionModel('modelos-prontos','landing-page');};assert.equal(t(lp,DURANTE).total.value,480);
 const si=a=>{a.toggleService('site-institucional');a.selectSolutionModel('modelos-prontos','site-institucional');};assert.equal(t(si,DURANTE).total.value,560);
 const sob=a=>{a.toggleService('portfolio');a.selectSolutionModel('sob-medida','portfolio');};assert.equal(t(sob,DURANTE).total.value,700,'sob medida fora da Black');
 const auto=a=>{a.toggleService('identidade-essencial');portf(a);};assert.equal(t(auto,DURANTE).total.value,750);assert.equal(t(auto,ANTES).total.value,1000,'Autônomo Pronto só existe na Black');
 const pres=a=>{a.toggleService('identidade-essencial');si(a);};assert.equal(t(pres,DURANTE).total.value,900);assert.equal(t(pres,ANTES).total.value,1080);assert.equal(t(pres,DEPOIS).total.value,1080);
 const conv=a=>{a.toggleService('identidade-essencial');lp(a);a.toggleService('automacao');};r=t(conv,DURANTE);assert.equal(r.total.value,1490);assert.equal(r.total.type,'from');assert.equal(r.h.promo,'black-2026');assert.equal(t(conv,ANTES).total.value,1790);
 const op=a=>{a.toggleService('sistema');a.toggleService('integracao');};assert.equal(t(op,DURANTE).total.value,3180);assert.equal(t(op,ANTES).total.value,3580);
 const sem=a=>{a.toggleService('automacao');};r=t(sem,DURANTE);assert.equal(r.total.value,890);assert.ok(!('promo' in r.h),'sem item da Black, sem marca');
 const {app,handoff}=configuratorTest(DURANTE);portf(app);const p=JSON.parse(Buffer.from(new URL(handoff.link(app.buildHandoff())).hash.replace('#cfg=',''),'base64url').toString('utf8'));assert.equal(p.promo,'black-2026');
});
check('Black: botão da home, página /blackcogit e rota limpa',()=>{
 const home=read('index.html');assert.match(home,/href="https:\/\/www\.cmkcogit\.com\.br\/blackcogit" class="btn btn-lg btn-black hx-black bk-fase bk-em-antes bk-em-durante"/);
 assert.ok(home.indexOf('id="cta-hero-start"')<home.indexOf('id="cta-hero-black"'),'Monte sua solução vem primeiro');
 assert.match(home,/class="hc hc-black bk-fase bk-em-durante"/);
 const pg=read('blackcogit.html');for(const t2 of ['Black Friday da Cogit.','Monte sua solução em 1 minuto, sem cadastro.','O desconto é real?','Pagamento pelo Mercado Pago, dentro da plataforma.','og:title" content="Black da Cogit · 26 e 27/11"','og:url" content="https://www.cmkcogit.com.br/blackcogit"'])assert.ok(pg.includes(t2),t2);
 const v=JSON.parse(read('vercel.json'));assert.ok(v.rewrites.some(x=>x.source==='/blackcogit'&&x.destination==='/blackcogit.html'));
 const css=read('css/black.css').replace(/\/\*[\s\S]*?\*\//g,'');assert.doesNotMatch(css,/gradient/);assert.doesNotMatch(css,/box-shadow:(?!\s*none)/);assert.doesNotMatch(css,/border-radius:(?!\s*0)/);
 for(const [a,b] of [['#121314','#F3F3F1'],['#1A2C52','#F3F3F1'],['#8EA6D8','#121314'],['#55595E','#FFFFFF'],['#1A2C52','#FFFFFF']])assert.ok(contrast(a,b)>=4.5,a+' / '+b);
});

console.log(`\n${checks} checks passed. ${html.length} HTML files inspected. Browser layout and interaction review are separate.`);
