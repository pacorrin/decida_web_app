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
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsProps = Record<string, string | number | boolean | null>;
