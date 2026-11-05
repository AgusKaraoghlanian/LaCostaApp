import {z} from 'zod';
const hour=z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const date=z.iso.date().nullable().default(null);
export const OpeningPeriod=z.object({day:z.number().int().min(0).max(6),opens:hour,closes:hour,nextDay:z.boolean(),validFrom:date,validUntil:date,season:z.string().max(100).default(''),timezone:z.literal('America/Argentina/Buenos_Aires').default('America/Argentina/Buenos_Aires')}).refine(p=>p.closes>=p.opens||p.nextDay,'Confirmá que el cierre ocurre al día siguiente.').refine(p=>!p.validFrom||!p.validUntil||p.validUntil>=p.validFrom,'La vigencia termina antes de comenzar.');
export const OpeningException=z.object({date:z.iso.date(),closed:z.boolean(),opens:hour.nullable(),closes:hour.nullable()}).refine(p=>p.closed||Boolean(p.opens&&p.closes),'Completá el horario excepcional o marcá el cierre.');
