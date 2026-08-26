import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Old per-evaluation route — redirect to the equivalent page in the account dashboard.
 * The account dashboard enforces its own auth + ownership check.
 */
export default async function MisEvaluacionDetallePage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/cuenta/evaluaciones/${id}`);
}
