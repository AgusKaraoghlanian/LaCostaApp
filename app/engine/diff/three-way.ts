const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function compareField(previous:unknown,editorial:unknown,incoming:unknown,locked=false){
 if(incoming===undefined||incoming===null||incoming==='')return {state:'sin_evidencia',keep:editorial,propose:undefined,conflict:false};
 if(equal(previous,incoming))return {state:'sin_cambios',keep:editorial,propose:undefined,conflict:false};
 if(equal(editorial,incoming))return {state:'coincide',keep:editorial,propose:undefined,conflict:false};
 if(locked)return {state:'protegido',keep:editorial,propose:incoming,conflict:true};
 if(!equal(previous,editorial)&&previous!==undefined)return {state:'conflicto',keep:editorial,propose:incoming,conflict:true};
 return {state:'propuesto',keep:editorial,propose:incoming,conflict:false};
}
