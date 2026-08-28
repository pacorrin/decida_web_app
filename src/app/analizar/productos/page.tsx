import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ProductsForm } from "@/components/onboarding/products-form";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function ProductosPage() {
  const assessment = await enforceStepAccess("productos");
  if (!assessment) return null;

  return (
    <OnboardingShell currentSlug="productos">
      <ProductsForm assessment={assessment} />
    </OnboardingShell>
  );
}
