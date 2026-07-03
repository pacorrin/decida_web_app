# Error Handling Flow Diagram

## Assessment Status Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Assessment Lifecycle                          │
└─────────────────────────────────────────────────────────────────────┘

User submits contact
        │
        ▼
    [started]
        │
        ▼
User completes payment
        │
        ▼
     [paid]
        │
        ▼
User submits evaluation form
        │
        ▼
  [in_progress] ◄─────────────────────┐
        │                             │
        │ Generate Report             │ Manual Retry
        ▼                             │
   ┌─────────┐                        │
   │ Success │                        │
   └────┬────┘                        │
        │                             │
        ▼                             │
[report_generated] ✓                  │
   User sees report                   │
                                      │
   ┌─────────┐                        │
   │ Failure │                        │
   └────┬────┘                        │
        │                             │
        ▼                             │
    [failed] ✗ ──────────────────────┘
   User sees error page
   with retry option
```

## User Experience Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Happy Path (Success)                         │
└─────────────────────────────────────────────────────────────────────┘

Submit evaluation form
        │
        ▼
Status: in_progress
Page shows: "Tu diagnóstico se está procesando..."
Auto-refresh: Every 5 seconds
        │
        ▼ (2-10 seconds typically)
Report generated!
        │
        ▼
Status: report_generated
Page shows: Full report with scores, analysis, recommendations
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Error Path (Failure)                           │
└─────────────────────────────────────────────────────────────────────┘

Submit evaluation form
        │
        ▼
Status: in_progress
Page shows: "Tu diagnóstico se está procesando..."
        │
        ▼ AI Service Error / Network Issue / Timeout
Report generation fails
        │
        ▼
Status: failed
Page shows:
  ┌────────────────────────────────────────────────┐
  │ ⚠️  Error al generar tu reporte                │
  │                                                │
  │ Lo sentimos, hubo un problema...               │
  │                                                │
  │ 📋 Garantía de reembolso                       │
  │ Si no puedes obtener tu reporte...             │
  │ Código: [asmt_id]                              │
  │                                                │
  │ [🔄 Reintentar generación]                     │
  │ [📧 Contactar soporte]                         │
  │                                                │
  │ ℹ️  ¿Qué pasó?                                 │
  │ El proceso de generación...                    │
  └────────────────────────────────────────────────┘
        │
        │ User clicks "Reintentar"
        ▼
Status: in_progress
Retry attempt...
        │
        ├──► Success? → [report_generated] ✓
        └──► Failure? → [failed] ✗ (show error again)
```

## Backend Processing Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Report Generation Pipeline                        │
└─────────────────────────────────────────────────────────────────────┘

saveEvaluation() action
        │
        ▼
Update status: in_progress
        │
        ▼
runScoringPipeline()
    ├─ Calculate deterministic scores
    └─ Generate AI interpretation
        │
        ▼
generateReport()
    ├─ Generate executive summary ──► Retry on failure (2x)
    ├─ Generate business understanding ──► Retry on failure (2x)
    ├─ Generate financial analysis ──► Retry on failure (2x)
    ├─ Generate personal fit analysis ──► Retry on failure (2x)
    ├─ Generate time/operation analysis ──► Retry on failure (2x)
    ├─ Generate scalability analysis ──► Retry on failure (2x)
    ├─ Generate strengths/risks ──► Retry on failure (2x)
    ├─ Generate validation plan ──► Retry on failure (2x)
    └─ Generate final recommendation ──► Retry on failure (2x)
        │
        ▼
Save report to database
        │
        ▼
Update status: report_generated
        │
        ▼
Log success ✓

─────────────────── ERROR OCCURS ────────────────────

Any step fails after retries
        │
        ▼
Catch error
        │
        ▼
logReportGenerationError()
    ├─ Log full error details
    ├─ Include assessment ID
    ├─ Include user email
    └─ Send alert to team 🚨
        │
        ▼
Update status: failed
        │
        ▼
Set completed_at timestamp
        │
        ▼
Redirect to result page
(User sees error UI)
```

## Retry Logic Detail

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Automatic Section Retry                          │
└─────────────────────────────────────────────────────────────────────┘

generateSection("executive_summary", ctx)
        │
        ▼
    Try API call
        │
        ├──► Success? → Return result ✓
        │
        └──► Error?
                │
                ▼
            Retry 1/2
            Wait 1 second
            Try API call again
                │
                ├──► Success? → Return result ✓
                │
                └──► Error?
                        │
                        ▼
                    Retry 2/2
                    Wait 2 seconds
                    Try API call again
                        │
                        ├──► Success? → Return result ✓
                        │
                        └──► Error?
                                │
                                ▼
                        Throw error ✗
                        (Pipeline fails)
```

## Logging Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Logging Architecture                          │
└─────────────────────────────────────────────────────────────────────┘

Error occurs
        │
        ▼
logReportGenerationError(message, context)
        │
        ├─ Format log message
        │   ├─ Timestamp
        │   ├─ Level: ERROR
        │   ├─ Message
        │   ├─ Assessment ID
        │   └─ User ID/Email
        │
        ├─ Log error details
        │   ├─ Error message
        │   ├─ Stack trace
        │   └─ Error name
        │
        ├─ Log metadata
        │   └─ Any additional context
        │
        └─ Send alert to team
            │
            └─ Production only: 🚨 Alert notification
                │
                └─ Future: Integrate with
                    ├─ Sentry
                    ├─ Datadog
                    ├─ PagerDuty
                    └─ Slack/Email
```

## Monitoring Dashboard (Proposed)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Admin Dashboard View                            │
└─────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║                   Report Generation Overview                      ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Success Rate (Last 24h): 98.5% ✓                               ║
║  Total Reports Generated: 147                                    ║
║  Failed Reports: 2 ⚠️                                             ║
║  Avg Generation Time: 4.2s                                       ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                    Failed Assessments                             ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  [clu123...] user1@example.com | 2h ago | [Retry] [Refund]      ║
║  [clu456...] user2@example.com | 5h ago | [Retry] [Refund]      ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                      Recent Errors                                ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  18:45 | [ERROR] Report generation failed                        ║
║         Assessment: clu123...                                     ║
║         Error: API timeout after 30s                              ║
║                                                                   ║
║  16:23 | [ERROR] Report generation failed                        ║
║         Assessment: clu456...                                     ║
║         Error: Invalid response from AI service                   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Refund Process Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Refund Workflow (Manual)                          │
└─────────────────────────────────────────────────────────────────────┘

Identify failed assessment
(User contact or monitoring alert)
        │
        ▼
Run SQL query to verify:
  - Status: failed
  - Payment: paid
  - Report: not generated
        │
        ▼
Attempt manual retry
via admin interface
        │
        ├──► Success? → Report generated ✓
        │               (No refund needed)
        │
        └──► Still fails?
                │
                ▼
        Process refund via
        payment provider
                │
                ▼
        Update database:
          - payments.paym_status = 'refunded'
          - assessments.asmt_payment_status = 'refunded'
                │
                ▼
        Send email to user
        (Template in docs/REFUND_PROCESS.md)
                │
                ▼
        Document case internally
                │
                ▼
        Complete ✓
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    System Architecture                               │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Browser    │
│   (Client)   │
└──────┬───────┘
       │
       │ 1. Submit form
       ▼
┌──────────────────────┐
│   Next.js Server     │
│                      │
│  saveEvaluation()    │ ◄─── retryReportGeneration()
│                      │      (manual retry)
└──────┬───────────────┘
       │
       │ 2. Save data
       ▼
┌──────────────────────┐
│   PostgreSQL DB      │
│                      │
│  - assessments       │
│  - payments          │
│  - assessment_reports│
└──────────────────────┘
       │
       │ 3. Generate
       ▼
┌──────────────────────┐
│   AI Pipeline        │
│                      │
│  - runScoringPipeline│
│  - generateReport    │
│    └─ OpenAI API    │
└──────┬───────────────┘
       │
       ├──► Success
       │    └─ Update DB: report_generated
       │    └─ Log success
       │
       └──► Failure
            └─ Update DB: failed
            └─ Log error + alert team
            └─ Show error UI to user
                └─ Option to retry
```

## Key Design Decisions

1. **Status-based routing**: Assessment status determines UI shown
2. **Automatic retries**: Catch transient failures without user action
3. **Manual retry**: User control for persistent failures
4. **Comprehensive logging**: Full context for debugging
5. **User transparency**: Clear error messages with refund guarantee
6. **Extensible**: Ready for monitoring service integration
7. **Documented**: Clear refund process for support team
