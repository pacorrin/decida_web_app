// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 100% de trazas en desarrollo; 10% en producción para no saturar la cuota.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// Analytics del embudo (S3-11). Sin clave, PostHog queda apagado y no pasa nada.
if (posthogKey && posthogHost) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    // Solo los eventos del embudo y las vistas de página: sin autocaptura,
    // sin grabación de pantalla (los formularios contienen la idea del
    // usuario) y sin captura de excepciones (de eso se encarga Sentry).
    autocapture: false,
    disable_session_recording: true,
    capture_exceptions: false,
    capture_dead_clicks: false,
    disable_surveys: true,
    capture_pageview: "history_change",
    // Las visitas anónimas no crean persona; se unen al hacer identify.
    person_profiles: "identified_only",
  });
}
