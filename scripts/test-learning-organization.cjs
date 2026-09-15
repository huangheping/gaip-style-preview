const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
function env(saved,shared){const dom=new JSDOM('',{url:'https://local.example/学习中心.html',runScripts:'outside-only'}),w=dom.window;if(saved)w.localStorage.setItem('gaip-learning-v11',saved);function load(f){Object.defineProperty(w.document,'currentScript',{configurable:true,value:{src:'https://local.example/'+f}});w.eval(fs.readFileSync(path.join(root,f),'utf8'));}if(shared)load('shared/scripts/organization-store.js');load('features/learning-center/learning-data.js');return {dom,w,D:w.__GAIP_LEARNING_DATA__,O:w.__GAIP_ORGANIZATION__};}
const old=env(null,false);old.D.persist();const snapshot=JSON.parse(JSON.stringify(old.D.state())),saved=old.w.localStorage.getItem('gaip-learning-v11');old.dom.window.close();
const {dom,w,D,O}=env(saved,true),s=JSON.parse(JSON.stringify(D.state()));
for(const key of ['records','completions','courses','logs','userId'])assert.deepEqual(s[key],snapshot[key],key+' preserved');
assert.deepEqual(s.users.map(u=>u.id),snapshot.users.map(u=>u.id));
assert.equal(s.users.find(u=>u.id==='u2').orgNodeId,'1:mock-level-3-east');
assert.equal(O.sets[0].find(n=>n.id==='mock-level-3-east').parent,'department-2');
D.setUser('u4');assert.deepEqual(Array.from(D.scopeUsers(),u=>u.id),['u1','u2','u4','u6']);
assert.ok(D.organizationNodes().every(n=>O.contains('1:department-2',n.id)));assert.ok(!D.organizationNodes().some(n=>n.id==='0:all'));
const east=O.sets[1].find(n=>n.id==='mock-level-3-east');east.name='更名后的团队';O.changed();
assert.match(D.state().users[1].org,/更名后的团队$/);assert.ok(D.matchesOrg(D.state().users[1],'1:department-2'));assert.equal(O.referenced('1:mock-level-3-east'),true);
const again=env(w.localStorage.getItem('gaip-learning-v11'),true);assert.equal(again.D.state().users[1].orgNodeId,'1:mock-level-3-east');assert.deepEqual(JSON.parse(JSON.stringify(again.D.state().records)),snapshot.records);again.dom.window.close();dom.window.close();console.log('PASS organization migration: stable IDs, records preserved, idempotent reload, subtree permissions, rename propagation and references');
