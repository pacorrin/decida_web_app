# Implementation Summary: Error Handling for Report Generation Failures

## Issue: DEC-10
**Title:** Manejo de errores cuando falla la generación del reporte

## Problem Statement
When report generation failed, users would arrive at `/analizar/resultado` without a report and only see a generic "reload the page" message. The system:
- Caught errors but only logged them with `console.error`
- Marked assessment status as `completed` even without a generated report
- Had no retry mechanism or refund flow
- Didn't honor the promise: "Si no se genera tu reporte, te reembolsamos"

## Solution Overview

A comprehensive error handling system that:
1. Properly tracks failed report generations
2. Provides clear user communication
3. Implements retry mechanisms (automatic and manual)
4. Logs failures for team notification
5. Documents the refund process

## Implementation Details

### 1. Database State Management

**File:** `src/app/analizar/actions.ts`

- Changed assessment status flow from `completed` → `in_progress` during report generation
- On failure: marks assessment as `failed` with timestamp
- On success: marks as `report_generated` (via generate-report.ts)
- New action `retryReportGeneration()` for manual retry attempts

### 2. User Interface Components

**File:** `src/components/onboarding/report-error-state.tsx` (NEW)

Features:
- Professional error message with clear explanation
- Manual retry button with loading state
- Refund guarantee information prominently displayed
- Assessment ID code for support reference
- Direct mailto: link to support team
- Expandable "What happened?" section

**File:** `src/components/onboarding/result-report.tsx` (UPDATED)

- Checks `assessment.asmt_status === "failed"` → shows `ReportErrorState`
- Checks `assessment.asmt_status === "in_progress"` without report → shows processing message
- Maintains backward compatibility for existing successful reports

**File:** `src/components/onboarding/auto-refresh.tsx` (NEW)

- Auto-refreshes page every 5 seconds when report is still processing
- Improves UX by automatically showing completed report when ready

**File:** `src/app/analizar/resultado/page.tsx` (UPDATED)

- Conditionally includes `AutoRefresh` component when status is `in_progress`

### 3. Logging and Monitoring System

**File:** `src/lib/logging/report-logger.ts` (NEW)

Three specialized logging functions:
- `logReportGenerationError()` - For failures with full context
- `logReportGenerationRetry()` - For retry attempts
- `logReportGenerationSuccess()` - For successful generation

Features:
- Structured log format with timestamp, level, message, context
- Captures assessment ID, user email, error details, stack traces
- Extensible metadata system
- Production alerts via console (ready for integration with monitoring services)

Log format:
```
[2026-07-03T18:45:23.456Z] [ERROR] Report generation failed during evaluation [Assessment: clu1234...] [User: user@example.com]
```

### 4. Automatic Retry Mechanism

**File:** `src/lib/ai/generate-report.ts` (UPDATED)

- Each section generation now includes automatic retry logic
- Exponential backoff: 1s, 2s delays
- Maximum 2 retries per section
- Logs each retry attempt
- Throws descriptive error after exhausting retries

This catches transient failures (network issues, temporary API problems) without user intervention.

### 5. Manual Retry Action

**File:** `src/app/analizar/actions.ts` - `retryReportGeneration()`

- Server action callable from client component
- Validates assessment state (must be `failed` or `completed`)
- Re-runs full scoring and report generation pipeline
- Updates assessment status throughout the process
- Returns structured result with success/failure message
- Comprehensive logging at each step

### 6. Assessment State Handling

**File:** `src/lib/onboarding/assessment-utils.ts` (UPDATED)

- Updated `isPaid()` function to recognize `failed` status
- Ensures users with failed reports still have access to result page

### 7. Refund Process Documentation

**File:** `docs/REFUND_PROCESS.md` (NEW)

Comprehensive documentation including:
- When refunds are warranted
- SQL queries to identify failed assessments requiring refunds
- Step-by-step manual refund process
- Email template for user notification
- Future automation proposals
- Monitoring and alert setup recommendations
- Legal and compliance considerations

## Technical Specifications

### Status Flow

```
started → paid → in_progress → report_generated ✓
                              ↘ failed ✗
                                    ↓
                              (manual retry)
                                    ↓
                              in_progress → report_generated ✓
                                         ↘ failed ✗
```

### Assessment Status Values
- `started` - Initial contact submitted
- `paid` - Payment completed
- `in_progress` - Actively generating report
- `completed` - Legacy status (kept for compatibility)
- `report_generated` - Report successfully created
- `failed` - Report generation failed

### Error Context Structure

```typescript
type LogContext = {
  assessmentId?: string;
  userId?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
};
```

### Retry Configuration

```typescript
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
// Delays: 1000ms (1s), 2000ms (2s)
```

## Testing Recommendations

### Manual Testing Steps

1. **Simulate a failure:**
   ```typescript
   // In src/lib/ai/generate-report.ts
   export async function generateReport(...) {
     throw new Error("Test failure");
   }
   ```

2. **Test the error flow:**
   - Complete an assessment
   - Verify error page appears
   - Check that assessment status is `failed` in database
   - Verify logs include full context

3. **Test manual retry:**
   - Click "Reintentar generación" button
   - Observe loading state
   - Remove test error
   - Verify report generates successfully

4. **Test auto-refresh:**
   - Set artificial delay in report generation
   - Observe page auto-refreshing
   - Verify smooth transition to completed report

### Automated Testing Ideas

```typescript
// Future test cases:
describe('Report Generation Error Handling', () => {
  test('marks assessment as failed on error', async () => {});
  test('retries failed report generation', async () => {});
  test('logs errors with full context', async () => {});
  test('shows error UI for failed assessments', async () => {});
  test('auto-refreshes during report processing', async () => {});
});
```

## Monitoring Setup

### Recommended Integrations

1. **Error Tracking:** Sentry, Rollbar, or similar
   - Capture all `logReportGenerationError` calls
   - Include assessment ID in error tags
   - Set up alerts for multiple failures

2. **Log Aggregation:** Datadog, LogRocket, or similar
   - Search logs by assessment ID
   - Track retry success rates
   - Monitor report generation latency

3. **Alerting:** PagerDuty, Opsgenie, or email
   - Alert on first failure
   - Escalate after multiple retry failures
   - Weekly summary of all failures

### Metrics to Track

- Report generation success rate
- Average time to generate report
- Retry success rate
- Number of assessments in `failed` state
- Time from failure to resolution
- Refunds processed due to report failures

## Future Enhancements

### Short Term
1. Integrate with actual monitoring service (Sentry)
2. Add admin dashboard to view failed assessments
3. Email notifications to users when report is ready
4. More granular retry strategies per section

### Medium Term
1. Automated refund processing via payment provider API
2. Webhook for real-time failure notifications
3. A/B test different retry configurations
4. Circuit breaker pattern for AI service failures

### Long Term
1. ML-based failure prediction
2. Proactive report regeneration for at-risk assessments
3. Fallback to different AI models on failure
4. Self-healing report generation pipeline

## Files Changed

1. `src/app/analizar/actions.ts` - Core business logic
2. `src/app/analizar/resultado/page.tsx` - Result page setup
3. `src/components/onboarding/report-error-state.tsx` - Error UI (NEW)
4. `src/components/onboarding/result-report.tsx` - Report display logic
5. `src/components/onboarding/auto-refresh.tsx` - Auto-refresh (NEW)
6. `src/lib/ai/generate-report.ts` - Retry logic
7. `src/lib/logging/report-logger.ts` - Logging system (NEW)
8. `src/lib/onboarding/assessment-utils.ts` - Status utilities
9. `docs/REFUND_PROCESS.md` - Documentation (NEW)

**Total:** 9 files (3 new, 6 modified)
**Lines Added:** ~594
**Lines Removed:** ~5

## Acceptance Criteria Status

- ✅ Si falla generación, marcar assessment como `failed`
- ✅ Pantalla de error clara con opción de reintentar
- ✅ Reintento automático o manual de generación
- ✅ Notificar al equipo (log/alert) en fallos
- ✅ Documentar flujo de reembolso manual o automático

## Deployment Checklist

- [ ] Review and approve PR
- [ ] Test in staging environment
- [ ] Verify database enum includes 'failed' status (already exists)
- [ ] Update environment variables if needed
- [ ] Set up external monitoring (Sentry, etc.)
- [ ] Configure alert destinations
- [ ] Update support email if different from `soporte@decida.app`
- [ ] Train support team on refund process
- [ ] Announce feature to team
- [ ] Monitor logs for first 48 hours post-deploy

## Support Information

**Support Email:** soporte@decida.app
**Documentation:** docs/REFUND_PROCESS.md
**PR:** https://github.com/pacorrin/decida_web_app/pull/2

## Conclusion

This implementation provides a robust, user-friendly solution to report generation failures. It maintains transparency with users, provides clear recovery paths, and ensures the team is notified of issues. The refund guarantee is honored through documented processes, and the system is designed to minimize failures through automatic retries.

The solution balances immediate user needs (clear communication, retry option) with long-term operational needs (logging, monitoring, documentation) while remaining extensible for future enhancements.
