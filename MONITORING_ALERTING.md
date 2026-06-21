# ===================================================
# PRODUCTION MONITORING & ALERTING GUIDE
# Vesta Virtual Assistant Services Platform
# ===================================================
# Date: 2026-06-22
# Purpose: Setup and manage production monitoring
# Status: IMPLEMENTATION REQUIRED

---

## TABLE OF CONTENTS

1. [Monitoring Architecture](#monitoring-architecture)
2. [Vercel Analytics Setup](#vercel-analytics-setup)
3. [Error Tracking (Sentry)](#error-tracking-sentry)
4. [Performance Monitoring](#performance-monitoring)
5. [Alerting System](#alerting-system)
6. [Log Aggregation](#log-aggregation)
7. [Dashboards](#dashboards)
8. [Incident Response](#incident-response)

---

## MONITORING ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│          Production Environment                      │
│  ┌──────────────────────────────────────────────┐   │
│  │    Vesta Virtual Assistant Platform           │   │
│  │  (React Frontend + Express.js Backend)        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
        │             │              │
        ├─────────┬───┴──────┬──────┴────┬─────────┐
        ▼         ▼          ▼           ▼         ▼
    ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   ┌──────┐
    │Vercel│  │Sentry│  │LoG   │  │ Google  │ │Custom│
    │ Logs │  │Error │  │Stack │  │ Analytics  │Metrics
    │      │  │Track │  │      │  │        │ │      │
    └──────┘  └──────┘  └──────┘  └──────┘   └──────┘
        │         │          │         │         │
        └─────────┴──────────┴─────────┴─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │  Alert System    │
            │   & Dashboards   │
            └──────────────────┘
                     │
            ┌────────┴────────┐
            ▼                 ▼
        ┌────────┐        ┌────────┐
        │Slack   │        │PagerDuty
        │ Alerts │        │(On-Call)
        └────────┘        └────────┘
```

---

## VERCEL ANALYTICS SETUP

### Step 1: Enable Web Analytics

**Via Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. Select project: Virtual-Assistant-Services-Platform
3. Navigate to: Settings → Analytics
4. Click "Enable Web Analytics"
5. Analytics will start collecting data immediately

**Metrics Tracked:**
- Page load time
- Core Web Vitals (LCP, FID, CLS)
- Real user monitoring
- Browser & device breakdown
- Geographic distribution

### Step 2: Configure Real User Monitoring

```typescript
// Add to src/main.tsx or index.html
<script async defer src="https://cdn.vercel-analytics.com/v1/script.js"></script>

// Or use package
npm install @vercel/analytics

// Add to React app
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Step 3: Set Up Performance Alerts

In Vercel Settings → Alerts:

- [ ] Alert if Core Web Vitals degrade
- [ ] Alert if performance score < 80
- [ ] Alert if error rate > 1%
- [ ] Alert if response time p95 > 1000ms

---

## ERROR TRACKING (SENTRY)

### Step 1: Create Sentry Account

1. Go to: https://sentry.io
2. Sign up for free account
3. Create new project: Virtual-Assistant-Services-Platform
4. Select platform: Node.js (for server) + React (for frontend)

### Step 2: Install Sentry SDK

```bash
npm install @sentry/react @sentry/node @sentry/tracing
```

### Step 3: Configure Sentry

**For React Frontend:**

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN_FROM_DASHBOARD",
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**For Express Server:**

```typescript
// server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Mysql(),
  ],
});

// Add error handler
app.use(Sentry.Handlers.errorHandler());
```

### Step 4: Configure Environment Variable

In Vercel Settings → Environment Variables:

```
SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[project-id]
```

### Step 5: Set Up Sentry Alerts

**In Sentry Dashboard → Alerts:**

1. Create Alert for: "Any event"
   - Condition: Error rate > 10 in last 5 minutes
   - Action: Notify Slack #alerts

2. Create Alert for: "Critical errors"
   - Condition: Error with tag severity=critical
   - Action: Alert on-call engineer

3. Create Alert for: "Performance degradation"
   - Condition: Transaction duration > 2000ms
   - Action: Notify engineering team

---

## PERFORMANCE MONITORING

### Google Analytics Setup

**Step 1: Create Property**

1. Go to: https://analytics.google.com
2. Create new property: "Vesta Production"
3. Get Measurement ID: G-XXXXXXXXXX

**Step 2: Install Google Analytics**

```bash
npm install @react-google-analytics
```

**Step 3: Configure**

```typescript
// src/main.tsx
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX", {
  gaOptions: {
    cookieFlags: "SameSite=Lax;secure",
  },
});

// Track pageviews
ReactGA.pageview(window.location.pathname);
```

### Custom Performance Metrics

```typescript
// lib/metrics.ts
export function reportMetric(name: string, value: number) {
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon('/api/metrics', JSON.stringify({
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
    }));
  }
}

// Track critical metrics
reportMetric('api_response_time', responseTime);
reportMetric('booking_success_rate', successRate);
reportMetric('ai_match_confidence', confidence);
```

---

## ALERTING SYSTEM

### Alert Severity Levels

| Level | Description | Response Time | Action |
|-------|-------------|---|--------|
| **CRITICAL** | Service down, data loss | Immediate (0-5 min) | Page on-call engineer |
| **HIGH** | Major functionality broken | Fast (5-15 min) | Slack alert + email |
| **MEDIUM** | Minor issues, degradation | Normal (15-60 min) | Slack notification |
| **LOW** | Informational, advisory | Routine (no SLA) | Log only |

### Alert Configuration

**Critical Alerts (Immediate Page):**

```yaml
Alert: "Service is down"
Condition: Response time > 10000ms OR Error rate > 50%
Action: PagerDuty + Slack critical + Email
SLA: < 5 minutes

Alert: "Database connection lost"
Condition: DB query fails 5+ times in 1 minute
Action: PagerDuty + Slack critical
SLA: < 5 minutes

Alert: "Gemini API quota exceeded"
Condition: API returns 429 error
Action: Slack critical + Page engineer
SLA: < 15 minutes

Alert: "Security breach detected"
Condition: SQL injection OR XSS attempt detected
Action: Immediate page + Security team alert
SLA: < 5 minutes
```

**High Priority Alerts (Slack + Email):**

```yaml
Alert: "Error rate elevated"
Condition: Error rate > 5% (sustained 5 minutes)
Action: Slack #alerts + Email to oncall@company.com
SLA: < 15 minutes

Alert: "Response time degradation"
Condition: API response time p95 > 2000ms
Action: Slack #platform-alerts
SLA: < 30 minutes

Alert: "Disk space low"
Condition: Storage usage > 80%
Action: Slack #infrastructure
SLA: < 1 hour

Alert: "Certificate expiring soon"
Condition: SSL cert expires in < 7 days
Action: Slack #devops
SLA: < 24 hours
```

**Medium Priority Alerts (Slack only):**

```yaml
Alert: "Memory usage high"
Condition: Memory > 75% for 5 minutes
Action: Slack #infrastructure
SLA: < 1 hour

Alert: "API rate limiting active"
Condition: Rate limit hits detected
Action: Slack #platform
SLA: < 1 hour

Alert: "Unusual traffic pattern"
Condition: Traffic 3x above baseline
Action: Slack #security
SLA: < 1 hour
```

### Slack Integration Setup

**Step 1: Create Slack Workspace Webhook**

1. Go to: https://api.slack.com/apps
2. Create new app: "Vesta Alerts"
3. Enable Incoming Webhooks
4. Create webhook for #alerts channel
5. Copy webhook URL

**Step 2: Configure Vercel Alerts**

1. Vercel Dashboard → Settings → Integrations
2. Search: Slack
3. Click Install
4. Connect to workspace
5. Select #alerts channel
6. Enable alert categories

**Step 3: Configure Sentry Alerts**

In Sentry → Settings → Integrations:
1. Search: Slack
2. Install
3. Configure alert rules (see above)

---

## LOG AGGREGATION

### Vercel Logs (Built-in)

**Accessing Logs:**

1. Vercel Dashboard → Project → Logs
2. Filter by:
   - Source: function, edge
   - Level: error, warn, info
   - Search: keywords

**Log Retention:**
- Free tier: 3 days
- Pro tier: 7 days
- Enterprise: custom

**Log Levels:**

```typescript
console.log('[INFO]', 'User action', { userId, action });
console.warn('[WARN]', 'Deprecated API call', { endpoint });
console.error('[ERROR]', 'Failed to process', { error });
```

### Structured Logging

**Implement structured logging in code:**

```typescript
// lib/logger.ts
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

export function logEvent(
  level: string,
  message: string,
  context?: Record<string, any>
) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: level as any,
    service: 'vesta-platform',
    message,
    context,
  };

  // Log to Vercel
  console.log(JSON.stringify(entry));

  // Send to Sentry if error
  if (level === 'error') {
    Sentry.captureMessage(message, 'error');
  }
}
```

**Usage:**

```typescript
logEvent('info', 'Booking created', { bookingId, userId });
logEvent('error', 'Gemini API error', { error: err.message });
```

---

## DASHBOARDS

### Vercel Analytics Dashboard

**Key Metrics:**
- Real user traffic patterns
- Core Web Vitals trends
- Geographic distribution
- Browser usage
- Device types
- Page performance

**Access:** Vercel Dashboard → Project → Analytics

### Sentry Dashboard

**Key Metrics:**
- Error frequency timeline
- Top errors by frequency
- Error trends
- Release comparisons
- Performance metrics

**Create Custom Dashboards:**

1. Sentry Dashboard → Dashboards
2. Click "Create Dashboard"
3. Add widgets:
   - Error frequency
   - Performance timeline
   - Release health
   - Transaction duration

### Custom Monitoring Dashboard

```html
<!-- Create monitoring dashboard -->
<!DOCTYPE html>
<html>
<head>
  <title>Vesta Platform - Production Monitoring</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
</head>
<body>
  <h1>Production Monitoring Dashboard</h1>
  
  <div id="metrics">
    <h2>Real-Time Metrics (last 1 hour)</h2>
    <div id="errorRate"></div>
    <div id="responseTime"></div>
    <div id="throughput"></div>
    <div id="activeUsers"></div>
  </div>

  <div id="alerts">
    <h2>Active Alerts</h2>
    <div id="alertList"></div>
  </div>

  <script>
    // Fetch metrics every 30 seconds
    setInterval(updateDashboard, 30000);
    
    async function updateDashboard() {
      // Fetch from Vercel API
      // Update charts
      // Check for alerts
    }
  </script>
</body>
</html>
```

---

## INCIDENT RESPONSE

### Escalation Procedure

```
Incident Detected (Alert)
         │
         ▼
    Alert Received
    (Slack/PagerDuty)
         │
         ▼
  Is it CRITICAL?
    ├─ YES ──→ Page on-call → Immediate investigation
    │
    └─ NO  ──→ Create ticket → Scheduled investigation
                   │
                   ▼
         Assess impact & severity
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
     CRITICAL            NORMAL
      (P1)              (P2/P3)
         │                   │
         ▼                   ▼
    Immediate          Schedule
    Investigation      within SLA
         │                   │
         └─────────┬─────────┘
                   ▼
            Root cause analysis
                   │
                   ▼
            Implement fix
                   │
                   ▼
            Deploy & verify
                   │
                   ▼
            Post-mortem
```

### Response SLA

| Severity | Response | Resolution | Escalation |
|----------|----------|-----------|-----------|
| CRITICAL | 5 min | 1 hour | Page on-call |
| HIGH | 15 min | 4 hours | Manager + Team |
| MEDIUM | 1 hour | 8 hours | Team lead |
| LOW | 8 hours | 48 hours | Backlog |

### Post-Incident Review

**Template:**

```markdown
## Incident Report

**Date:** 2026-06-22
**Duration:** 15 minutes
**Severity:** HIGH
**Impact:** 10% of users affected

### Timeline
- 14:30: Alert triggered
- 14:35: On-call responded
- 14:45: Root cause identified
- 14:50: Fix deployed
- 14:55: Verified resolved

### Root Cause
[Description of what went wrong]

### Impact Analysis
- Users affected: ~1000
- Revenue impact: $XXX
- Data loss: None

### Resolution
[What was done to fix it]

### Prevention
- [ ] Action 1: Description
- [ ] Action 2: Description
- [ ] Action 3: Description

### Action Items
| Item | Owner | Due Date |
|------|-------|----------|
| Implement monitoring | [Name] | 2026-06-29 |
| Update docs | [Name] | 2026-06-29 |
| Team training | [Name] | 2026-07-06 |
```

---

## MONITORING CHECKLIST

### Initial Setup (Week 1)

- [ ] Vercel Analytics enabled
- [ ] Sentry project created and configured
- [ ] Error tracking in production
- [ ] Google Analytics installed
- [ ] Slack integration working
- [ ] Basic alert rules configured
- [ ] Dashboard created
- [ ] Log aggregation active

### Ongoing Maintenance (Weekly)

- [ ] Review error logs
- [ ] Check alert configurations
- [ ] Update alert thresholds if needed
- [ ] Verify integrations working
- [ ] Review incident reports
- [ ] Update runbooks

### Quarterly Review

- [ ] Performance baseline comparison
- [ ] Alert effectiveness assessment
- [ ] Threshold optimization
- [ ] Tool licensing/cost review
- [ ] Team training refresher

---

## MONITORING TOOLS REFERENCE

| Tool | Purpose | Cost | Setup |
|------|---------|------|-------|
| Vercel Analytics | Performance monitoring | Free | Integrated |
| Sentry | Error tracking | Free+ | SDK integration |
| Google Analytics | User analytics | Free | Script install |
| Slack | Notifications | Free | Webhook setup |
| PagerDuty | Incident management | Free+ | Integration |

---

## NEXT STEPS

- [ ] Set up Sentry account
- [ ] Install Sentry SDKs
- [ ] Configure alert rules
- [ ] Test alerts in staging
- [ ] Create monitoring dashboards
- [ ] Document escalation procedures
- [ ] Train team on monitoring tools
- [ ] Schedule monitoring reviews

---

*Last Updated: 2026-06-22*
*Next Review: 2026-07-22*
*Maintenance Owner: [TBD]*
