// Manda correos con Resend (https://resend.com) por su API HTTP, sin dependencias.
// RESEND_API_KEY: la clave de Resend. CORREO_REMITENTE: desde dónde sale. Mientras no haya
// un dominio propio verificado en Resend, sirve "onboarding@resend.dev", pero así Resend solo
// entrega a la casilla con la que se creó la cuenta.
const REMITENTE_DE_PRUEBA = "Costa a la carta <onboarding@resend.dev>";

export const correoConfigurado = () => Boolean(process.env.RESEND_API_KEY);

export const enviarCorreo = async ({ para, asunto, texto, html, responderA }) => {
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            from: process.env.CORREO_REMITENTE || REMITENTE_DE_PRUEBA,
            to: para,
            subject: asunto,
            text: texto,
            html,
            reply_to: responderA,
        }),
        signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
        const detalle = await res.text().catch(() => "");
        throw new Error(`Resend respondió ${res.status}: ${detalle.slice(0, 300)}`);
    }
}
