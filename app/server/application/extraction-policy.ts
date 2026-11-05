import {AppError} from './common.ts';
// Restricción de seguridad hasta completar una revisión independiente de este proyecto.
// No depende de herramientas externas, cuentas, disponibilidad ni cuotas de proveedores.
// No es un registro de conectores: los mismos extractores atienden las tres estructuras.
export const evaluationDomains=['www.lagranfamiliasb.com.ar','lagranfamiliasb.com.ar','cafesanbernardo.com.ar','menu.fu.do'];
export function assertEvaluationSource(input:{url:string;allowedDomains:string[]}){let url:URL;try{url=new URL(input.url)}catch{throw new AppError(400,'URL_INVALIDA','Pegá una dirección web completa.')}if(!evaluationDomains.includes(url.hostname)||input.allowedDomains.some(d=>!evaluationDomains.includes(d)))throw new AppError(409,'AUDITORIA_EXTRACCION_PENDIENTE','Por seguridad, por ahora solo podés importar desde los sitios de prueba indicados. También podés agregar el negocio y su carta manualmente.','Consultá los sitios disponibles en Importar.');}
