import {
  createLegalMetadata,
  LegalPageShell,
  LegalSection,
} from "@/components/legal/legal-page-shell";

export const metadata = createLegalMetadata(
  "Política de privacidad",
  "Cómo recopilamos, usamos y protegemos tus datos personales en Decida."
);

export default function PrivacidadPage() {
  return (
    <LegalPageShell
      title="Política de privacidad"
      description="Última actualización: julio de 2026"
    >
      <LegalSection title="Responsable del tratamiento">
        <p>
          Decida (&quot;nosotros&quot;) opera la plataforma de evaluación de
          ideas de negocio disponible en este sitio. Para consultas sobre
          privacidad puedes escribir a{" "}
          <a
            href="mailto:hello@decida.mx"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            hello@decida.mx
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Datos que recopilamos">
        <p>Al usar Decida podemos recopilar la siguiente información:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Correo electrónico:</strong>{" "}
            para enviarte tu reporte de viabilidad y comunicaciones relacionadas
            con tu evaluación.
          </li>
          <li>
            <strong className="text-foreground">Teléfono:</strong> para contacto
            operativo y seguimiento de tu solicitud, si lo proporcionas.
          </li>
          <li>
            <strong className="text-foreground">Nombre y país:</strong> para
            personalizar tu experiencia y contextualizar el análisis.
          </li>
          <li>
            <strong className="text-foreground">
              Respuestas del diagnóstico:
            </strong>{" "}
            incluyendo la descripción de tu idea, perfil, recursos, ajustes
            personales y evaluación financiera y de mercado que completes en el
            formulario.
          </li>
          <li>
            <strong className="text-foreground">Datos técnicos:</strong>{" "}
            dirección IP, tipo de navegador y registros de uso necesarios para
            operar el servicio de forma segura.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Finalidad del tratamiento">
        <p>Usamos tus datos para:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Generar y entregarte tu diagnóstico de viabilidad.</li>
          <li>Mantener tu sesión de evaluación y recuperar tu progreso.</li>
          <li>Procesar pagos simulados o reales según el plan contratado.</li>
          <li>Mejorar la calidad del producto y la experiencia de usuario.</li>
          <li>Cumplir obligaciones legales y responder solicitudes de soporte.</li>
        </ul>
        <p>
          No vendemos ni compartimos tu información personal con terceros para
          fines de marketing.
        </p>
        <p>
          Los pagos de la suscripción los procesa Stripe. Al pagar, tus datos
          de tarjeta se capturan directamente en la página segura de Stripe:
          Decida no los recibe ni los almacena. Compartimos con Stripe tu
          correo electrónico para asociar el cobro a tu cuenta, y guardamos
          únicamente identificadores del cliente y de la suscripción, los
          montos y las fechas de cobro. Mientras el cobro no esté habilitado
          (por ejemplo, en la fase beta) la suscripción es simulada y no se
          comparte ningún dato con Stripe.
        </p>
      </LegalSection>

      <LegalSection title="Cookies y almacenamiento local">
        <p>
          Utilizamos cookies y tecnologías similares estrictamente necesarias
          para el funcionamiento del servicio:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Cookie de sesión:</strong>{" "}
            identifica tu evaluación en curso para que puedas continuar el
            diagnóstico sin perder tu progreso.
          </li>
          <li>
            <strong className="text-foreground">Cookies de preferencia:</strong>{" "}
            recuerdan configuraciones básicas de la interfaz cuando apliquen.
          </li>
          <li>
            <strong className="text-foreground">Analítica de uso:</strong>{" "}
            usamos PostHog para contar visitas y medir en qué paso del flujo
            abandonan las personas (por ejemplo, cuántas crean una cuenta o
            ven su reporte). Guarda un identificador en tu navegador y, si
            tienes cuenta, el identificador interno de tu cuenta. No enviamos
            tu correo, tu teléfono ni el texto de tu idea, y no grabamos tu
            pantalla.
          </li>
        </ul>
        <p>
          No usamos cookies de publicidad. Puedes configurar tu navegador para
          rechazar cookies, aunque algunas funciones del diagnóstico podrían
          dejar de funcionar correctamente.
        </p>
      </LegalSection>

      <LegalSection title="Conservación y seguridad">
        <p>
          Conservamos tus datos mientras sea necesario para prestarte el servicio
          y cumplir obligaciones legales. Aplicamos medidas técnicas y
          organizativas razonables para proteger tu información contra acceso no
          autorizado, pérdida o alteración.
        </p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>
          Puedes solicitar acceso, rectificación, cancelación u oposición al
          tratamiento de tus datos personales escribiendo a{" "}
          <a
            href="mailto:hello@decida.mx"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            hello@decida.mx
          </a>
          . Responderemos conforme a la legislación aplicable en tu jurisdicción.
        </p>
      </LegalSection>

      <LegalSection title="Cambios a esta política">
        <p>
          Podemos actualizar esta política ocasionalmente. Publicaremos la
          versión vigente en esta página con la fecha de última actualización.
          El uso continuado del servicio después de un cambio implica tu
          conocimiento de la política actualizada.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
