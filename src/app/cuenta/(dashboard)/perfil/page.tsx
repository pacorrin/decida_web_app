import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session-server";

export const metadata = {
  title: "Perfil | Decida",
  description: "Datos de tu cuenta de Decida.",
};

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  const fields = [
    { label: "Nombre", value: user.user_name ?? "—" },
    { label: "Correo electrónico", value: user.user_email },
    { label: "Teléfono", value: user.user_phone ?? "—" },
  ];

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Perfil
        </h1>
        <p className="text-sm text-muted-foreground">Datos de tu cuenta.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tu información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {field.label}
              </p>
              <p className="text-sm text-foreground">{field.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
