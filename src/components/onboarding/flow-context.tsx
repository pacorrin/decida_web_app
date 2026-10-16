"use client";

import { createContext, useContext } from "react";

type OnboardingFlow = {
  /** La cuenta ya tiene suscripción: el onboarding se salta la pantalla de planes. */
  skipPlan: boolean;
};

const FlowContext = createContext<OnboardingFlow>({ skipPlan: false });

export function OnboardingFlowProvider({
  skipPlan,
  children,
}: OnboardingFlow & { children: React.ReactNode }) {
  return <FlowContext.Provider value={{ skipPlan }}>{children}</FlowContext.Provider>;
}

export const useOnboardingFlow = () => useContext(FlowContext);
