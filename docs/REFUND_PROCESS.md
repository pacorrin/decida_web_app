# Refund Process for Failed Report Generation

This document outlines the process for handling refunds when report generation fails for a paid assessment.

## Overview

Decida offers a guarantee: "Si no se genera tu reporte, te reembolsamos". This document describes the technical implementation and operational procedures for fulfilling this guarantee.

## When a Refund is Warranted

A refund should be processed when:

1. An assessment's `asmt_status` is marked as `failed`
2. The user has made a payment (`asmt_payment_status` = `paid`)
3. Multiple retry attempts have failed to generate the report
4. The user requests a refund through support channels

## Identification Process

### Database Query

To identify assessments requiring refunds:

\`\`\`sql
SELECT 
  a.asmt_id,
  a.asmt_email,
  a.asmt_name,
  a.asmt_status,
  a.asmt_payment_status,
  a.asmt_completed_at,
  p.paym_id,
  p.paym_amount,
  p.paym_currency,
  p.paym_provider
FROM assessments a
LEFT JOIN payments p ON a.asmt_id = p.paym_asmt_id
WHERE a.asmt_status = 'failed'
  AND a.asmt_payment_status = 'paid'
  AND p.paym_status = 'paid'
ORDER BY a.asmt_completed_at DESC;
\`\`\`

### Log Monitoring

Check application logs for entries like:
- `🚨 ALERT: Report generation failure - Team notification required`
- `[ERROR] Report generation failed during evaluation`

## Manual Refund Process

### Step 1: Verify the Failure

1. Check the assessment status in the database
2. Review error logs for the specific `asmt_id`
3. Attempt to manually retry report generation using the admin interface or direct API call

### Step 2: Process the Refund

Depending on the payment provider:

#### For Placeholder Payments (Development/Testing)
\`\`\`sql
UPDATE payments 
SET paym_status = 'refunded'
WHERE paym_asmt_id = '<assessment_id>';

UPDATE assessments
SET asmt_payment_status = 'refunded'
WHERE asmt_id = '<assessment_id>';
\`\`\`

#### For Real Payment Providers (e.g., Stripe, PayPal)

1. Log into the payment provider's dashboard
2. Locate the transaction using `paym_provider_payment_id`
3. Process a full refund through the provider's interface
4. Update the database:

\`\`\`sql
UPDATE payments 
SET paym_status = 'refunded'
WHERE paym_id = '<payment_id>';

UPDATE assessments
SET asmt_payment_status = 'refunded'
WHERE asmt_id = '<assessment_id>';
\`\`\`

### Step 3: Notify the User

Send an email to the user (`asmt_email`) with:

**Subject:** Reembolso procesado - Decida

**Body:**
\`\`\`
Hola [asmt_name],

Lamentamos que no pudimos generar tu reporte de evaluación. Como parte de nuestra garantía, hemos procesado un reembolso completo de [paym_amount] [paym_currency].

El reembolso debería aparecer en tu cuenta dentro de 5-10 días hábiles, dependiendo de tu institución financiera.

Código de referencia: [asmt_id]

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
El equipo de Decida
\`\`\`

### Step 4: Document the Case

Create an internal record of the refund including:
- Assessment ID
- User email
- Refund amount and currency
- Date processed
- Reason for failure
- Payment provider transaction ID

## Automated Refund Process (Future Enhancement)

For future implementation, consider:

1. **Automatic Detection**: Cron job or scheduled task to identify failed assessments
2. **Auto-Retry**: Automatic retry attempts before marking as permanently failed
3. **Provider Integration**: API integration with payment providers for automated refunds
4. **User Notification**: Automated email notifications
5. **Dashboard**: Admin dashboard to review and approve refunds

### Example Implementation Pseudocode

\`\`\`typescript
// src/lib/refund/auto-refund-check.ts

export async function checkAndProcessRefunds() {
  const failedAssessments = await prisma.assessments.findMany({
    where: {
      asmt_status: 'failed',
      asmt_payment_status: 'paid',
    },
    include: {
      payments: {
        where: { paym_status: 'paid' }
      }
    }
  });

  for (const assessment of failedAssessments) {
    // Check if already processed
    if (assessment.payments.length === 0) continue;
    
    // Attempt one final retry
    const retrySuccess = await attemptReportGeneration(assessment.asmt_id);
    
    if (!retrySuccess) {
      // Process refund through payment provider
      await processRefund(assessment);
      
      // Update database
      await updateRefundStatus(assessment.asmt_id);
      
      // Send notification
      await sendRefundNotification(assessment);
      
      // Log for monitoring
      console.log(\`Refund processed for assessment \${assessment.asmt_id}\`);
    }
  }
}
\`\`\`

## Monitoring and Alerts

### Production Monitoring

Set up alerts for:
1. Any assessment with `asmt_status = 'failed'`
2. Failed report generation errors in logs
3. Multiple retry attempts for the same assessment

### Alert Channels

- Email to: tech@decida.app
- Slack channel: #report-failures
- Dashboard: Admin panel with failed assessments list

## Reporting

Generate weekly reports showing:
- Number of failed report generations
- Success rate of retries
- Total refunds processed
- Revenue impact

## Prevention Measures

To minimize failed report generations:

1. **Better Error Handling**: Implement comprehensive error handling in AI generation pipeline
2. **Fallback Mechanisms**: Use fallback strategies when primary AI services fail
3. **Health Checks**: Regular health checks on AI service endpoints
4. **Rate Limiting**: Implement rate limiting to avoid service overload
5. **Monitoring**: Real-time monitoring of report generation success rates

## Support Contact Information

For refund-related inquiries:
- Email: soporte@decida.app
- Support form: [Include URL when available]

## Legal and Compliance

Ensure compliance with:
- Local consumer protection laws
- Payment provider terms of service
- Privacy regulations (GDPR, CCPA, etc.)
- Financial regulations regarding refunds

## Changelog

- 2026-07-03: Initial documentation created
- [Future]: Add automated refund process
- [Future]: Integrate with payment provider APIs
