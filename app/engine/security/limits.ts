// Límites de trabajo, además de los límites de descarga. No habilitan capacidades.
export const PROCESS_LIMITS=Object.freeze({startupMs:15000,parserMs:2000,heapMb:64,youngMb:16,elements:30000,menu:300,observations:1200,businesses:20,links:100,media:80,warnings:40,resultBytes:1280*1024,checkpointBytes:1536*1024});
export const LIMIT_MESSAGE='El sitio supera los límites de análisis. Revisá los datos recuperados o cargá la información que falta manualmente.';
