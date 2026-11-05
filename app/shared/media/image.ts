// Límite común para subida local, descarga protegida y decodificación del navegador.
export const IMAGE_LIMITS=Object.freeze({bytes:8*1024*1024,pixels:12_000_000,side:6000,ocrSide:2400,timeoutMs:120_000});
export function inspectImage(bytes:Uint8Array,declared=''){
 if(!bytes.length||bytes.length>IMAGE_LIMITS.bytes)throw new Error('La foto supera 8 MB o está vacía.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let width=0,height=0,mime='';
 const ascii=(i:number,n:number)=>String.fromCharCode(...bytes.subarray(i,i+n));
 if(bytes.length>=33&&ascii(1,3)==='PNG'&&bytes[0]===137&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10&&ascii(12,4)==='IHDR'){
  mime='image/png';width=view.getUint32(16);height=view.getUint32(20);
  let p=8,ended=false,hasPixels=false;while(p+12<=bytes.length){const size=view.getUint32(p),kind=ascii(p+4,4);if(p+size+12>bytes.length)throw new Error('El PNG está incompleto.');if(kind==='IDAT'&&size>0)hasPixels=true;if(kind==='acTL')throw new Error('Usá una foto fija, sin animación.');p+=size+12;if(kind==='IEND'){ended=true;break}}if(!ended||!hasPixels)throw new Error('El PNG está incompleto o no contiene píxeles.');
 }else if(bytes.length>=12&&bytes[0]===255&&bytes[1]===216){
  mime='image/jpeg';let p=2;
  while(p+4<bytes.length){if(bytes[p++]!==255)throw new Error('La estructura JPEG no es válida.');while(bytes[p]===255)p++;const marker=bytes[p++];if(marker===217||marker===218)break;if(marker===1||marker>=208&&marker<=215)continue;const size=view.getUint16(p);if(size<2||p+size>bytes.length)throw new Error('El JPEG está incompleto.');if([192,193,194].includes(marker)){height=view.getUint16(p+3);width=view.getUint16(p+5);break}p+=size;}
 }else if(bytes.length>=30&&ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP'){
  mime='image/webp';const kind=ascii(12,4);
  if(kind==='VP8X'){if(bytes[20]&2)throw new Error('Usá una foto fija, sin animación.');width=1+bytes[24]+bytes[25]*256+bytes[26]*65536;height=1+bytes[27]+bytes[28]*256+bytes[29]*65536;}
  else if(kind==='VP8 '&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42){width=view.getUint16(26,true)&16383;height=view.getUint16(28,true)&16383;}
  else if(kind==='VP8L'&&bytes[20]===47){const bits=view.getUint32(21,true);width=(bits&16383)+1;height=((bits>>>14)&16383)+1;}
 }
 if(!mime||!width||!height)throw new Error('Formato no válido. Usá una fotografía PNG, JPEG o WebP fija; PDF, SVG y HEIC no están habilitados.');
 if(declared&&declared.split(';')[0].toLowerCase()!==mime)throw new Error('El contenido real de la foto no coincide con su formato declarado.');
 if(width>IMAGE_LIMITS.side||height>IMAGE_LIMITS.side||width*height>IMAGE_LIMITS.pixels)throw new Error('La foto supera 12 megapíxeles o 6000 píxeles por lado. Reducila antes de subirla.');
 return {mime,width,height,bytes:bytes.length};
}
