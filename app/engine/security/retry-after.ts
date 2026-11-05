export function retryAfterAt(value:string|undefined,now=Date.now()):number|undefined{
 if(!value)return;const text=value.trim();if(text.length>512)return;
 if(/^\d+$/.test(text)){const seconds=Number(text);if(!Number.isSafeInteger(seconds)||seconds>(8640000000000000-now)/1000)return 8640000000000000;return now+seconds*1000;}
 // Las tres formas HTTP-date; nunca interpretar números como fechas locales.
 const imf=text.match(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT$/);
 const old=text.match(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2}):(\d{2}) GMT$/);
 const asc=text.match(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) ([A-Za-z]{3}) ( ?\d{1,2}) (\d{2}):(\d{2}):(\d{2}) (\d{4})$/);
 const parts=imf||old||(asc?[asc[0],asc[2],asc[1],asc[6],asc[3],asc[4],asc[5]]:null);if(!parts)return;
 const month=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(parts[2]);if(month<0)return;
 let year=Number(parts[3]);if(old){const current=new Date(now).getUTCFullYear();year=Math.floor(current/100)*100+year;if(year>current+50)year-=100;}
 const day=Number(parts[1]),hour=Number(parts[4]),minute=Number(parts[5]),second=Number(parts[6]);const at=Date.UTC(year,month,day,hour,minute,second),date=new Date(at);
 if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month||date.getUTCDate()!==day||hour>23||minute>59||second>59)return;
 return Math.max(now,at);
}
