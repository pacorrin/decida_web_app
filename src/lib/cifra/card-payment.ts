/**
 * Cómo se reparte un pago de tarjeta. El pago es una transferencia; solo cuentan como gasto los
 * intereses y la parte que excede el saldo que Cifra conocía (compras que no se capturaron).
 */
export type CardPaymentSplit = {
  /** Lo que baja el saldo de la tarjeta: nunca más de lo que Cifra cree que se debe. */
  appliedCents: number;
  /** Intereses y comisiones que capturó la persona (gasto). */
  interestCents: number;
  /** Compras sin detalle: lo que se pagó por encima del saldo conocido (gasto). */
  untrackedCents: number;
};

export function splitCardPayment(
  balanceCents: number,
  paymentCents: number,
  interestCents: number,
): CardPaymentSplit {
  const interest = Math.max(0, Math.min(interestCents, paymentCents));
  const capital = paymentCents - interest;
  const applied = Math.max(0, Math.min(Math.max(balanceCents, 0), capital));
  return { appliedCents: applied, interestCents: interest, untrackedCents: capital - applied };
}
