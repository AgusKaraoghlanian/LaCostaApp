import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && clave ? createClient(url, clave) : null;
export const conectado = Boolean(supabase);
export const tablas = {negocios:'listings',categorias:'categories',localidades:'locations',opiniones:'reviews',consultas:'leads',reclamos:'listing_claims',imagenes:'listing_images',propietarios:'owners'};
export function traducirError(error) {
 const codigo=error?.code;
 if(codigo==='invalid_credentials')return 'El correo o la contraseña no son correctos.';
 if(codigo==='email_not_confirmed')return 'Confirmá tu correo antes de ingresar.';
 if(codigo==='user_already_exists')return 'Ya existe una cuenta con ese correo.';
 if(codigo==='over_email_send_rate_limit')return 'Esperá unos minutos antes de solicitar otro correo.';
 if(codigo==='weak_password')return 'Elegí una contraseña de al menos 8 caracteres.';
 if(codigo==='23505')return 'Ya existe un registro con esos datos.';
 if(codigo==='42501')return 'Tu cuenta no tiene permiso para realizar esta acción.';
 return 'No pudimos completar la operación. Revisá tu conexión e intentá de nuevo.';
}
