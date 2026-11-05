import {mkdir,copyFile,readdir,readFile,writeFile} from 'node:fs/promises';
const out=new URL('../public/ocr/',import.meta.url);await mkdir(new URL('core/',out),{recursive:true});await mkdir(new URL('lang/',out),{recursive:true});
await copyFile(new URL('../node_modules/tesseract.js/dist/worker.min.js',import.meta.url),new URL('worker.min.js',out));
for(const file of await readdir(new URL('../node_modules/tesseract.js-core/',import.meta.url)))if(/\.wasm(?:\.js)?$/.test(file))await copyFile(new URL('../node_modules/tesseract.js-core/'+file,import.meta.url),new URL('core/'+file,out));
await copyFile(new URL('../node_modules/@tesseract.js-data/spa/4.0.0/spa.traineddata.gz',import.meta.url),new URL('lang/spa.traineddata.gz',out));
for(const [name,path]of [['TESSERACT-LICENSE','tesseract.js/LICENSE.md'],['CORE-LICENSE','tesseract.js-core/LICENSE']])await copyFile(new URL('../node_modules/'+path,import.meta.url),new URL(name,out));
const pkg=JSON.parse(await readFile(new URL('../node_modules/tesseract.js/package.json',import.meta.url),'utf8'));
await writeFile(new URL('VERSION.json',out),JSON.stringify({tesseract:pkg.version,language:'spa',model:'@tesseract.js-data/spa/4.0.0',license:'Apache-2.0',network:'solo origen de la aplicación'},null,2));
console.log('Recursos OCR locales preparados.');
