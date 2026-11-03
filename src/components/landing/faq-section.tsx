import { FAQ_ITEMS } from "@/components/landing/landing-content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20 bg-background py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <h2 id="faq-heading" className="text-balance text-3xl font-semibold tracking-tight text-primary sm:text-5xl lg:col-span-4">
          Preguntas frecuentes
        </h2>
        <Accordion className="lg:col-span-8">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium text-primary hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
