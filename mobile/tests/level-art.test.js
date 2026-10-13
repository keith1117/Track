const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {BODY_CROPS,recolorGreenPixels,hydrateLevelArt}=require('../level-art.js');

test('only green muscle pixels change and source pixels plus alpha remain intact',()=>{
  const source=Uint8ClampedArray.from([12,120,60,255, 180,190,200,255, 7,16,19,255, 0,0,0,0, 255,255,255,128, 34,42,34,255]);
  const before=source.slice();
  for(const color of ['#32D992','#62B5F6','#B49AF6','#EBC76F','#BDECF1','#8B9CA5']) {
    const result=recolorGreenPixels(source,color);
    assert.notStrictEqual(result,source);assert.deepEqual(source,before);
    assert.deepEqual(result.slice(4),source.slice(4));assert.equal(result[3],255);
    assert.notDeepEqual(result.slice(0,3),source.slice(0,3));
  }
  const purple=recolorGreenPixels(source,'#B49AF6');
  assert.ok(purple[2]>purple[0]&&purple[0]>purple[1]);
  assert.equal(Math.max(...purple.slice(0,3)),120);
  for(const invalid of [undefined,'red','#bad','#12345678','<svg>']) assert.deepEqual(recolorGreenPixels(source,invalid),source);
});

test('colored edges stay smooth and muscle shading retains its brightness order',()=>{
  const source=Uint8ClampedArray.from([10,50,25,128,10,180,70,255,20,29,20,255]);
  const output=recolorGreenPixels(source,'#B49AF6');
  assert.equal(output[3],128);assert.equal(output[7],255);
  assert.ok(Math.max(...output.slice(0,3))<Math.max(...output.slice(4,7)));
  assert.ok(Math.abs(output[8]-source[8])<=1&&Math.abs(output[9]-source[9])<=1);
});

test('silver contours with a small green tint keep their original neutral pixels',()=>{
  const silver=Uint8ClampedArray.from([200,211,200,255, 151,173,151,255]);
  assert.deepEqual(recolorGreenPixels(silver,'#B49AF6'),silver);
});

test('cyan-green muscle edges do not leave green halos in other level colors',()=>{
  const edge=Uint8ClampedArray.from([130,255,254,255,3,41,35,255]);
  const output=recolorGreenPixels(edge,'#B49AF6');
  assert.ok(output[2]>output[0]&&output[0]>output[1]);
  assert.ok(output[6]>output[4]&&output[4]>output[5]);
});

test('level art uses the original six crop bounds and preserves all approved bitmap bytes',()=>{
  const root=path.resolve(__dirname,'../assets');
  const hashes={
    'body-parts-reference.png':'5e8dada91105f352db3301c43ec9f1804be56090b031923fa65adb711b4a1488',
    'body-parts-arms-core.png':'7c1fe9a720f40fb784299f8512f94462ec4f1734cb8929ca608061cdfde0d550',
    'body-parts-clean-reference.png':'9cc01a08ffeea6ed5a4c2fd231ffb6d1a878a351c9dc100a63240e1fabdb851e',
    'body-parts-clean-arms-core.png':'3d23f1e9abacc169bc0ae4a9500acbeb22e08ba8c0320178274e7704c952800f',
    'exercises/cardio-runner.png':'5d78f0e5865f7d3dadc8f7a79509c8081dccf91240d7cdf045eee841b1bea5ae'
  };
  for(const [file,hash]of Object.entries(hashes))assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash);
  assert.deepEqual(Object.keys(BODY_CROPS),['chest','back','shoulders','legs','arms','abs']);
  for(const crop of Object.values(BODY_CROPS)) {
    const png=fs.readFileSync(path.resolve(__dirname,'..',crop.source));
    assert.equal(crop.width,600);assert.equal(crop.height,460);
    assert.equal(png.readUInt32BE(16),crop.imageWidth);assert.equal(png.readUInt32BE(20),crop.imageHeight);
    assert.ok(crop.left>=0&&crop.top>=0&&crop.left+crop.width<=crop.imageWidth&&crop.top+crop.height<=crop.imageHeight);
  }
});

// Only image decoding and Canvas are doubled; pixel processing and async DOM ownership stay real.
function artHarness({part='chest',tone='purple',noContext=false,blockedPixels=false}={}) {
  const pending=[];const source=new Uint8ClampedArray(600*460*4);
  source.set([12,120,60,255,180,190,200,255]);
  const doc={baseURI:'http://127.0.0.1:4173/',defaultView:{Image:class{set src(value){this.url=value;pending.push(this);}}},
    createElement(tag){assert.equal(tag,'canvas');return {width:0,height:0,setAttribute(){},
      getContext(){if(noContext)return null;return {drawImage(image,...bounds){assert.deepEqual(bounds,[90,90,600,460,0,0,600,460]);},
        getImageData(){if(blockedPixels)throw new Error('SecurityError');return {data:source.slice(),width:600,height:460};},
        putImageData(imageData){this.output=imageData.data;doc.output=imageData.data;}};}};}};
  const node={ownerDocument:doc,isConnected:true,dataset:{levelArt:part,tone},hidden:false,children:[],replaceChildren(...children){this.children=children;}};
  const root={querySelectorAll:()=>[node],contains:other=>other===node};
  return {root,node,doc,pending};
}

test('hydration renders a correctly colored canvas and reports ready',async()=>{
  const h=artHarness();const done=hydrateLevelArt(h.root);
  assert.equal(h.node.dataset.artState,'loading');h.pending[0].onload();await done;
  assert.equal(h.node.dataset.artState,'ready');assert.equal(h.node.children.length,1);
  assert.equal(h.node.children[0].width,600);assert.equal(h.node.children[0].height,460);
  assert.ok(h.doc.output[2]>h.doc.output[0]);assert.deepEqual([...h.doc.output.slice(4,8)],[180,190,200,255]);
});

test('empty or unsupported art never rejects or highlights Cardio',async()=>{
  await hydrateLevelArt({querySelectorAll:()=>[]});
  for(const options of [{part:'cardio'},{part:'missing'},{tone:'missing'}]) {
    const h=artHarness(options);await hydrateLevelArt(h.root);
    assert.equal(h.node.dataset.artState,'unavailable');assert.equal(h.node.hidden,true);assert.equal(h.node.children.length,0);
  }
});

test('failed image requests can retry without substituting a green level image',async()=>{
  const h=artHarness();const failed=hydrateLevelArt(h.root);h.pending[0].onerror();await failed;
  assert.equal(h.node.hidden,true);assert.equal(h.node.dataset.artState,'unavailable');
  const retried=hydrateLevelArt(h.root);h.pending[1].onload();await retried;
  assert.equal(h.node.hidden,false);assert.equal(h.node.dataset.artState,'ready');
});

test('unavailable Canvas or blocked pixels fail safely without rejecting hydration',async()=>{
  for(const options of [{noContext:true},{blockedPixels:true}]) {
    const h=artHarness(options);const done=hydrateLevelArt(h.root);h.pending[0].onload();await done;
    assert.equal(h.node.dataset.artState,'unavailable');assert.equal(h.node.hidden,true);assert.equal(h.node.children.length,0);
  }
});

test('detached nodes and obsolete color requests cannot receive stale artwork',async()=>{
  const detached=artHarness();const first=hydrateLevelArt(detached.root);detached.node.isConnected=false;detached.pending[0].onload();await first;
  assert.equal(detached.node.children.length,0);
  const changed=artHarness();const old=hydrateLevelArt(changed.root);changed.node.dataset.tone='gold';
  const latest=hydrateLevelArt(changed.root);changed.pending[0].onload();await Promise.all([old,latest]);
  assert.equal(changed.node.dataset.artState,'ready');assert.equal(changed.node.children.length,1);
  assert.ok(changed.doc.output[0]>changed.doc.output[2]);
});
