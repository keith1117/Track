(function (root, factory) {
  const presentation = typeof module === 'object' && module.exports ? require('./level-presentation.js') : root.TrackLevelPresentation;
  const api = factory(presentation);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TrackLevelArt = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (presentation) {
  const BODY_CROPS = Object.freeze(Object.fromEntries(Object.entries({
    chest:{source:'assets/body-parts-clean-reference.png',imageWidth:1438,imageHeight:1094,left:90,top:90,width:600,height:460},
    back:{source:'assets/body-parts-clean-reference.png',imageWidth:1438,imageHeight:1094,left:760,top:90,width:600,height:460},
    shoulders:{source:'assets/body-parts-clean-reference.png',imageWidth:1438,imageHeight:1094,left:90,top:595,width:600,height:460},
    legs:{source:'assets/body-parts-clean-reference.png',imageWidth:1438,imageHeight:1094,left:760,top:595,width:600,height:460},
    arms:{source:'assets/body-parts-clean-arms-core.png',imageWidth:1437,imageHeight:1094,left:90,top:595,width:600,height:460},
    abs:{source:'assets/body-parts-clean-arms-core.png',imageWidth:1437,imageHeight:1094,left:760,top:595,width:600,height:460}
  }).map(([id,crop])=>[id,Object.freeze(crop)])));

  function recolorGreenPixels(sourceRGBA, targetHex) {
    const result = new Uint8ClampedArray(sourceRGBA);
    if (typeof targetHex !== 'string' || !/^#[\da-f]{6}$/i.test(targetHex)) return result;
    const target = [1,3,5].map(start=>parseInt(targetHex.slice(start,start+2),16));
    const max = Math.max(...target), min = Math.min(...target), delta = max-min;
    const saturation = max ? delta/max : 0;
    const hue = target.map(channel=>delta ? (channel-min)/delta : 0);
    for (let i=0;i<result.length;i+=4) {
      const r=sourceRGBA[i],g=sourceRGBA[i+1],b=sourceRGBA[i+2];
      const green=g-Math.max(r,b);
      const chroma=g-Math.min(r,b);
      if (green<=0 || chroma<=8 || chroma<=g*.15) continue;
      const weight=Math.min(1,(chroma-8)/24);
      // Green is the original V; normalized hue preserves shading without touching gray contours.
      const s=(g-Math.min(r,b))/g*saturation;
      for (let channel=0;channel<3;channel++) {
        const tinted=g*(1-s+s*hue[channel]);
        result[i+channel]=Math.round(sourceRGBA[i+channel]+weight*(tinted-sourceRGBA[i+channel]));
      }
    }
    return result;
  }

  const documentImages = new WeakMap();
  const requests = new WeakMap();
  function loadImage(doc, source) {
    if (!documentImages.has(doc)) documentImages.set(doc,new Map());
    const images=documentImages.get(doc);
    const url=new URL(source,doc.baseURI).href;
    if (images.has(url)) return images.get(url);
    const promise=new Promise((resolve,reject)=>{
      const image=new doc.defaultView.Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error('Level artwork unavailable'));
      image.src=url;
    });
    images.set(url,promise);
    promise.catch(()=>{if(images.get(url)===promise)images.delete(url);});
    return promise;
  }

  async function hydrateLevelArt(root) {
    const nodes=[...root.querySelectorAll('[data-level-art]')];
    await Promise.all(nodes.map(async node=>{
      const id=node.dataset.levelArt,tone=node.dataset.tone;
      const token={};requests.set(node,token);
      const current=()=>requests.get(node)===token&&node.isConnected&&root.contains(node)&&node.dataset.levelArt===id&&node.dataset.tone===tone;
      node.dataset.artState='loading';node.hidden=false;
      try {
        if (!Object.hasOwn(BODY_CROPS,id)||!Object.hasOwn(presentation.LEVEL_TONES,tone)) throw new Error('Unknown level artwork');
        const crop=BODY_CROPS[id],doc=node.ownerDocument;
        const image=await loadImage(doc,crop.source);
        if(!current())return;
        const canvas=doc.createElement('canvas');canvas.width=crop.width;canvas.height=crop.height;
        canvas.setAttribute('aria-hidden','true');
        const context=canvas.getContext('2d',{willReadFrequently:true});
        if(!context)throw new Error('Canvas unavailable');
        context.drawImage(image,crop.left,crop.top,crop.width,crop.height,0,0,crop.width,crop.height);
        const pixels=context.getImageData(0,0,crop.width,crop.height);
        pixels.data.set(recolorGreenPixels(pixels.data,presentation.LEVEL_TONES[tone]));
        context.putImageData(pixels,0,0);
        if(current()){node.replaceChildren(canvas);node.dataset.artState='ready';}
      } catch {
        if(current()){node.replaceChildren();node.hidden=true;node.dataset.artState='unavailable';}
      }
    }));
  }
  return {BODY_CROPS,recolorGreenPixels,hydrateLevelArt};
});
