import {createWorker} from 'tesseract.js';
// Este worker y sus descendientes se terminan al cancelar. Ninguna URL externa entra acá.
self.onmessage=async({data})=>{
 let worker;
 try{
  const base=new URL('/ocr/',self.location.origin).href;
  worker=await createWorker('spa',1,{workerPath:base+'worker.min.js',corePath:base+'core',langPath:base+'lang',workerBlobURL:false,cacheMethod:'none',logger:m=>self.postMessage({type:'progress',status:m.status,progress:m.progress}),errorHandler:()=>{}});
  await worker.setParameters({preserve_interword_spaces:'1'});
  const {data:result}=await worker.recognize(data.image,{}, {text:true,blocks:true});
  const lines=(result.blocks||[]).flatMap(b=>b.paragraphs||[]).flatMap(p=>p.lines||[]).map(l=>({text:l.text,confidence:Math.max(0,Math.min(100,l.confidence||0)),bbox:l.bbox})).slice(0,1000);
  self.postMessage({type:'result',result:{text:result.text.slice(0,40000),confidence:result.confidence,lines}});
 }catch{self.postMessage({type:'error',message:'No se pudo reconocer la foto. Probá una imagen más nítida o reducí su tamaño.'});}
 finally{await worker?.terminate();self.close();}
};
