import {
  FOR_YOU_ITEMS,
  NOT_FOR_YOU_ITEMS,
} from "@/components/landing/landing-content";
import { SectionShell } from "@/components/landing/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export function AudienceSection() {
  return (
    <SectionShell id="para-quien" title="¿Es para ti?">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-emerald-200/60 bg-emerald-50/40">
          <CardHeader>
            <CardTitle className="text-primary">Esto es para ti si…</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {FOR_YOU_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-primary">Esto no es para ti si…</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {NOT_FOR_YOU_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <XCircle
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}
