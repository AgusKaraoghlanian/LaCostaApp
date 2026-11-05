import React,{useState,useEffect} from 'react';
import {application as api} from '../../data/application.ts';
export default function OcrEvidence({jobId}){
 const [readings,setReadings]=useState([]),[error,setError]=useState('');
 useEffect(()=>{let active=true;api.ocrReadings(jobId).then(r=>{if(active)setReadings(r)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[jobId]);
 return <>{error&&<p role="alert">{error}</p>}{readings.map(r=><details className="motor-details motor-ocr-evidence" key={r.id}><summary>Texto original y partes dudosas · {r.input.image.name}</summary><p>Fotografía SHA-256: {r.input.image.sha256}</p><p>{r.input.accessReference}</p><pre>{r.input.text}</pre>{r.input.correctedText!==undefined&&r.input.correctedText!==r.input.text&&<><p>Texto corregido para interpretar:</p><pre>{r.input.correctedText}</pre></>}{r.unmatched.length>0&&<><h3>Líneas que requieren revisión manual</h3>{r.unmatched.map((l,i)=><p key={i}>Línea {l.line}: {l.text} · {l.reason}</p>)}</>}<p>La fotografía original no se guarda permanentemente. Consultala desde tu copia para verificar la transcripción.</p></details>)}</>;
}
