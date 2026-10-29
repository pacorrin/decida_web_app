/** URL pública de la app (sin diagonal final); los correos necesitan URLs absolutas. */
export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Encabezado de marca de los correos: ícono + «Decida», como en el navbar.
 * La imagen es un PNG alojado en la app (`public/email/logo.png`): los clientes de
 * correo bloquean SVG y las imágenes en base64, y con la imagen bloqueada el
 * nombre sigue visible porque va como texto.
 */
export function emailLogoHeader(appUrl: string): string {
  return `
        <a href="${appUrl}" style="text-decoration:none;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px;">
            <tr>
              <td style="padding-right: 8px; vertical-align: middle;">
                <img src="${appUrl}/email/logo.png" width="44" height="27" alt="" style="display:block; border:0; outline:none;">
              </td>
              <td style="vertical-align: middle; font-family: Geist, Arial, sans-serif; font-size: 20px; font-weight: 600; letter-spacing: -0.3px; color:#05422c;">Decida</td>
            </tr>
          </table>
        </a>`;
}
