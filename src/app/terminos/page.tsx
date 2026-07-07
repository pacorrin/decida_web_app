import {
  createLegalMetadata,
  LegalPageShell,
  LegalSection,
} from "@/components/legal/legal-page-shell";

export const metadata = createLegalMetadata(
  "Términos de servicio",
  "Condiciones de uso de la plataforma Decida para evaluar ideas de negocio."
);

export default function TerminosPage() {
  return (
    <LegalPageShell
      title="Términos de servicio"
      description="Última actualización: julio de 2026"
    >
      <LegalSection title="Aceptación de los términos">
        <p>
          Al acceder o usar Decida aceptas estos términos. Si no estás de
          acuerdo, no utilices el servicio. Al proporcionar tus datos en el
          paso de contacto confirmas que has leído y aceptas esta política junto
          con nuestra{" "}
          <a
            href="/privacidad"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Política de privacidad
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Descripción del servicio">
        <p>
          Decida es una herramienta de evaluación de viabilidad de ideas de
          negocio. Genera un diagnóstico estructurado con semáforos, riesgos,
          fortalezas y próximos pasos basados en la información que tú
          proporcionas. El resultado es orientativo y depende de la calidad y
          veracidad de tus respuestas.
        </p>
      </LegalSection>

      <LegalSection title="No constituye asesoría profesional">
        <p>
          <strong className="text-foreground">
            Decida no proporciona asesoría legal, fiscal, financiera ni de
            inversión personalizada.
          </strong>{" "}
          El contenido del diagnóstico es informativo y educativo. No debe
          interpretarse como recomendación para iniciar, modificar o abandonar un
          negocio, ni como sustituto de la consulta con contadores, abogados,
          asesores financieros u otros profesionales calificados.
        </p>
        <p>
          Las estimaciones financieras y proyecciones que aparecen en el reporte
          se basan en supuestos simplificados. Los resultados reales pueden
          variar significativamente.
        </p>
      </LegalSection>

      <LegalSection title="Sin garantía de éxito">
        <p>
          <strong className="text-foreground">
            No garantizamos que tu idea de negocio tendrá éxito ni que obtendrás
            ingresos específicos.
          </strong>{" "}
          El objetivo de Decida es ayudarte a reducir incertidumbre y tomar
          decisiones más informadas antes de invertir tiempo o capital. Un
          resultado favorable no implica viabilidad garantizada; un resultado
          desfavorable no descarta por completo la oportunidad.
        </p>
      </LegalSection>

      <LegalSection title="Uso permitido">
        <p>Te comprometes a:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Proporcionar información veraz y actualizada en el diagnóstico.</li>
          <li>Usar el servicio solo para fines personales o empresariales legítimos.</li>
          <li>No intentar acceder a datos de otros usuarios ni vulnerar la plataforma.</li>
          <li>No reproducir ni revender el contenido del reporte sin autorización.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Pagos y reembolsos">
        <p>
          Los planes y precios se muestran en el flujo de evaluación. Durante la
          fase beta, el pago puede ser simulado. Las políticas de reembolso
          aplicables se comunicarán al momento de habilitar pagos reales.
        </p>
      </LegalSection>

      <LegalSection title="Limitación de responsabilidad">
        <p>
          En la medida permitida por la ley, Decida no será responsable por
          pérdidas económicas, decisiones de negocio, daños indirectos o
          consecuencias derivadas del uso o la imposibilidad de uso del
          servicio. Usas la plataforma bajo tu propio riesgo y criterio.
        </p>
      </LegalSection>

      <LegalSection title="Propiedad intelectual">
        <p>
          La marca, el diseño, los algoritmos y el contenido generado por la
          plataforma son propiedad de Decida o de sus licenciantes. Conservas
          los derechos sobre la información de tu idea que ingreses; nos
          otorgas una licencia limitada para procesarla con el fin de generar
          tu diagnóstico.
        </p>
      </LegalSection>

      <LegalSection title="Modificaciones y contacto">
        <p>
          Podemos modificar estos términos en cualquier momento publicando la
          versión actualizada en esta página. Para dudas o reclamaciones escribe
          a{" "}
          <a
            href="mailto:soporte@decida.app"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            soporte@decida.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
