const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
function loadUI({locale='en', allowLocalePreview=false, publicLocales=['en'], regionProfile='global', storedLocale=null, browserLocales=['en'], search='', storageThrows=false, history=[]} = {}) {
  const node = () => {
    const attributes = {};
    return {innerHTML:'',textContent:'',scrollTop:0,dataset:{},classList:{toggle(){},add(){},remove(){}},
      setAttribute(name,value){attributes[name]=String(value);},removeAttribute(name){delete attributes[name];},
      getAttribute:name=>attributes[name],hasAttribute:name=>Object.hasOwn(attributes,name),
      contains:()=>false,querySelector:()=>null,focus(){}};
  };
  const app = node();
  const nav = ['home','level','social','profile'].map(page=>{const label=node();return {...node(),dataset:{page},label,querySelector:()=>label};});
  const nodes = {'#app-content':app,'.bottom-nav':node(),'#toast':node(),'#clock':node(),'.phone-frame':node(),'.app-shell':node(),'.status-icons':node(),'meta[name="description"]':node()};
  const handlers = {}, storageWrites = [];
  const stored = new Map([['track.locale.v1',storedLocale],['track.training-history.v1',typeof history==='string'?history:JSON.stringify(history)]]);
  const document = {documentElement:{lang:'en'},title:'',activeElement:null,createElement:node,
    querySelector:s=>nodes[s],querySelectorAll:s=>s==='.nav-item'?nav:[],
    addEventListener(type,handler){(handlers[type] ||= []).push(handler);}};
  const context = vm.createContext({document,navigator:{languages:browserLocales},location:{search:search || (locale==='en'?'':`?locale=${locale}`)},
    localStorage:{getItem(key){if(storageThrows)throw Error('blocked');return stored.get(key) ?? null;},setItem(key,value){if(storageThrows)throw Error('blocked');stored.set(key,value);storageWrites.push({key,value});}},
    setInterval(){},setTimeout(){},clearTimeout(){},Intl,Date,URLSearchParams,console});
  context.window=context;
  for (const file of ['release-config.js','locales/messages.js','i18n.js','core.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  Object.assign(context.TrackReleaseConfig,{allowLocalePreview,publicLocales,regionProfile});
  vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context,{filename:'app.js'});
  const run = source => vm.runInContext(source,context);
  function dispatchClick(dataset) {
    const target = {dataset,closest(selector){const match=selector.match(/^\[data-([\w-]+)\]$/); if(!match)return null; const key=match[1].replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());return Object.hasOwn(dataset,key)?target:null;}};
    for (const handler of handlers.click || []) handler({target,stopPropagation(){}});
  }
  return {context,app,nodes,nav,handlers,storageWrites,run,dispatchClick};
}
module.exports={loadUI};
