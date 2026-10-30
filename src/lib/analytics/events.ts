/**
 * Embudo de la beta (S3-11). Los nombres son contrato con los embudos de
 * PostHog: no los cambies sin actualizar el panel. Nunca mandes correo,
 * teléfono ni texto de la idea en las propiedades.
 */
export const ANALYTICS_EVENTS = {
  landingViewed: "landing_viewed",
  ctaClicked: "cta_clicked",
  accountCreated: "account_created",
  userLoggedIn: "user_logged_in",
  onboardingCompleted: "onboarding_completed",
  reportViewed: "report_viewed",
  subscribeClicked: "subscribe_clicked",
  subscriptionActivated: "subscription_activated",
  subscriptionCancelled: "subscription_cancelled",
  feedbackSubmitted: "feedback_submitted",
  creditsGranted: "credits_granted",
  creditsExpired: "credits_expired",
  creditsSpent: "credits_spent",
  creditsInsufficient: "credits_insufficient",
  researchToggled: "research_toggled",
  suggestionSent: "suggestion_sent",
  // Registro y verificación del correo (fricción del alta)
  signupSubmitted: "signup_submitted",
  verificationCodeSent: "verification_code_sent",
  verificationFailed: "verification_failed",
  verificationResent: "verification_resent",
  captchaRejected: "captcha_rejected",
  // Pasos del análisis completados (no solo vistos) y reportes que fallan
  onboardingStepCompleted: "onboarding_step_completed",
  reportGenerationFailed: "report_generation_failed",
  // Cifra (finanzas personales): solo tipos y categorías, nunca montos ni nombres
  cifraItemCreated: "cifra_item_created",
  cifraTransactionLogged: "cifra_transaction_logged",
  cifraPaymentMarked: "cifra_payment_marked",
  cifraDataDeleted: "cifra_data_deleted",
  cifraAiConsentGiven: "cifra_ai_consent_given",
  cifraSmartCapture: "cifra_smart_capture",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsProps = Record<string, string | number | boolean | null>;
