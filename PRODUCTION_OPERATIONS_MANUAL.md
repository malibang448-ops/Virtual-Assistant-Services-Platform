# ===================================================
# PRODUCTION OPERATIONS MANUAL
# Vesta Virtual Assistant Services Platform
# ===================================================
# Date: 2026-06-22
# Version: 1.0
# Status: ACTIVE

---

## QUICK REFERENCE

### Production URLs
- **Main Application:** https://vesta-platform.vercel.app
- **Admin Dashboard:** https://vesta-platform.vercel.app/admin
- **API Base:** https://vesta-platform.vercel.app/api
- **Vercel Dashboard:** https://vercel.com/dashboard

### Important Contacts
- **On-Call Engineer:** [PENDING]
- **DevOps Lead:** [PENDING]
- **Product Manager:** [PENDING]
- **Security Lead:** [PENDING]

### Critical Commands
```bash
# View logs
vercel logs vesta-platform --prod

# Rollback
vercel rollback [deployment-id]

# Deploy
git push origin main

# Check status
curl -I https://vesta-platform.vercel.app
```

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Runbooks](#runbooks)
4. [Troubleshooting](#troubleshooting)
5. [Maintenance](#maintenance)
6. [Disaster Recovery](#disaster-recovery)
7. [Change Management](#change-management)
8. [Escalation Procedures](#escalation-procedures)

---

## SYSTEM OVERVIEW

### Application Description

**Vesta Virtual Assistant Services Platform** is a comprehensive platform that connects clients with specialized virtual assistants, featuring AI-powered matching using Google Gemini.

**Key Features:**
- AI-powered agent matching
- Service catalog management
- Booking system
- Live chat functionality
- Admin dashboard
- User authentication
- Real-time notifications

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React | 19.0.1 |
| **Backend** | Express.js | 4.21.2 |
| **Language** | TypeScript | 5.8.2 |
| **Build Tool** | Vite | 6.2.3 |
| **Bundler** | esbuild | 0.25.0 |
| **AI Engine** | Google Gemini | 2.4.0 |
| **Styling** | Tailwind CSS | 4.1.14 |
| **Hosting** | Vercel | v2 |

### System Capacity

| Resource | Capacity | Current | Alert |
|----------|----------|---------|-------|
| **Concurrent Users** | 10,000+ | TBD | > 8,000 |
| **API Rate Limit** | 100 req/min | TBD | > 90% |
| **Storage** | Unlimited* | TBD | > 80% |
| **Response Time** | < 500ms | TBD | > 1000ms |
| **Uptime Target** | 99.9% | TBD | < 99.8% |

*Storage depends on Gemini API plan and Vercel account limits

### Dependencies

**Critical External Services:**
1. **Google Gemini API** - AI agent matching
   - Failure Mode: Matching service degraded
   - Fallback: Manual agent selection

2. **Vercel Infrastructure** - Hosting & deployment
   - Failure Mode: Application unavailable
   - Fallback: Manual rollback to previous version

3. **GitHub** - Source code repository
   - Failure Mode: Cannot deploy new versions
   - Fallback: Manual file uploads (if needed)

---

## ARCHITECTURE

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CDN (Vercel)                      │
│  (Cache static assets, serve globally)              │
└─────────────────────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    ┌──────────────┐      ┌──────────────┐
    │   React SPA  │      │  Next.js API │
    │  Frontend    │      │  Endpoints   │
    │  (dist/...)  │      │ (server.cjs) │
    └──────────────┘      └──────────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
            ┌──────────────┐      ┌─────────────┐
            │   Database   │      │ Google APIs │
            │(data_store   │      │(Gemini AI)  │
            │  .json)      │      │             │
            └──────────────┘      └─────────────┘
```

### Data Flow

```
User Request
    │
    ▼
Vercel CDN (routing)
    │
    ├─ Static assets → Served from cache
    │
    └─ API/SPA → Express backend
                    │
                    ├─→ Process request
                    ├─→ Query database
                    ├─→ Call Google Gemini (if needed)
                    │
                    └─→ Return response
                        │
                        ▼
                    User sees result
```

### Data Storage

**Current Implementation:**
- Type: JSON file (data_store.json)
- Location: Vercel function filesystem
- Persistence: Ephemeral (data lost on restart)
- Backup: Manual dumps recommended

**Data Models:**
- Agents (profiles, skills, availability)
- Services (offerings, pricing, requirements)
- Bookings (appointments, status)
- Chat sessions (conversations, messages)
- Client logs (requests, matches, feedback)

---

## RUNBOOKS

### Runbook: Service Health Check

**Trigger:** Manual check or health monitoring alert

**Steps:**

1. **Check deployment status:**
   ```bash
   curl -I https://vesta-platform.vercel.app
   Expected: HTTP/2 200
   ```

2. **Check API availability:**
   ```bash
   curl https://vesta-platform.vercel.app/api/agents
   Expected: 200 OK + JSON data
   ```

3. **Check Gemini integration:**
   ```bash
   curl -X POST https://vesta-platform.vercel.app/api/match \
     -H "Content-Type: application/json" \
     -d '{"clientNeeds": "admin"}'
   Expected: 200 OK + matched agent
   ```

4. **Review logs:**
   - Vercel Dashboard → Logs
   - Filter by "error" level
   - Check for patterns

5. **Check monitoring:**
   - Sentry: https://sentry.io
   - Vercel Analytics: Dashboard
   - Check error rate < 1%

**Resolution Paths:**
- If deployment failed → Check build logs
- If API not responding → Check environment variables
- If errors in logs → See Troubleshooting section

### Runbook: Database Backup & Recovery

**Manual Backup:**

```bash
# Export data from production
curl https://vesta-platform.vercel.app/api/backup \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  > backup_$(date +%Y%m%d_%H%M%S).json

# Store securely
mv backup_*.json /secure/backups/
```

**Data Recovery:**

```bash
# If data is corrupted or lost:

1. Restore from backup:
   # Upload backup file
   # Update data_store.json in production

2. Verify data:
   # Check record counts
   # Verify relationships
   # Test critical functionality

3. Notify users if needed:
   # Send notification of service restoration
   # Document any data loss
```

### Runbook: API Rate Limiting

**Trigger:** Gemini API rate limit hit (429 error)

**Steps:**

1. **Verify the issue:**
   ```bash
   Check Sentry for 429 errors
   Review error frequency
   ```

2. **Immediate mitigation:**
   - Disable AI matching temporarily
   - Show message: "Service temporarily unavailable"
   - Enable fallback: Manual agent selection

3. **Contact Google:**
   - Message: Google Cloud support
   - Request: Increase rate limit quota
   - Expected response: 1-24 hours

4. **Temporary workaround:**
   - Implement caching for recent matches
   - Rate limit client requests (max 1 request/minute)
   - Queue requests during peak hours

5. **Long-term fix:**
   - Upgrade Google Gemini API plan
   - Implement request batching
   - Deploy caching layer

### Runbook: Performance Degradation

**Trigger:** Response time > 2000ms (p95) or error rate > 5%

**Steps:**

1. **Identify bottleneck:**
   ```bash
   # Check which endpoint is slow
   curl -w "@curl-format.txt" -o /dev/null -s \
     https://vesta-platform.vercel.app/api/agents
   
   # Check if it's Frontend, Backend, or External
   ```

2. **Assess impact:**
   - [ ] How many users affected?
   - [ ] Which specific functionality?
   - [ ] Severity: Critical/High/Medium?

3. **Investigate based on type:**

   **Frontend Performance:**
   - Check bundle size
   - Look for memory leaks
   - Verify no long-running scripts
   - Check React performance profiler

   **Backend Performance:**
   - Check database query times
   - Look for N+1 queries
   - Check CPU/memory usage
   - Review Gemini API latency

   **External Service:**
   - Check Gemini API status
   - Verify network connectivity
   - Implement timeout/retry

4. **Apply fix:**
   - Optimize code if needed
   - Deploy hotfix
   - Monitor for improvement

5. **Prevent recurrence:**
   - Add performance tests
   - Lower alert threshold
   - Document lessons learned

### Runbook: Security Incident

**Trigger:** Potential security breach, data exposure, or attack

**Steps:**

1. **Immediate response (0-5 minutes):**
   - [ ] Alert security team immediately
   - [ ] Page incident commander
   - [ ] Isolate affected systems if critical
   - [ ] Enable enhanced logging

2. **Assessment (5-30 minutes):**
   - [ ] Determine scope of exposure
   - [ ] Identify if data was exfiltrated
   - [ ] Check for persistence/backdoors
   - [ ] Review access logs

3. **Containment (30-60 minutes):**
   - [ ] Rotate compromised credentials
   - [ ] Update security group rules
   - [ ] Block suspicious IPs
   - [ ] Enable additional monitoring

4. **Eradication (1-4 hours):**
   - [ ] Remove malicious code/files
   - [ ] Patch vulnerabilities
   - [ ] Redeploy from clean source
   - [ ] Verify systems are clean

5. **Recovery (4+ hours):**
   - [ ] Restore from known-good backup
   - [ ] Rebuild affected systems
   - [ ] Verify functionality
   - [ ] Monitor for re-infection

6. **Post-incident (24+ hours):**
   - [ ] Complete incident timeline
   - [ ] Perform root cause analysis
   - [ ] Implement preventive controls
   - [ ] Conduct team training
   - [ ] File incident report

### Runbook: Deployment Rollback

**Trigger:** Deployment caused critical issues, cannot be fixed quickly

**Steps:**

1. **Assess severity:**
   - Is system down?
   - Is data corrupted?
   - Are multiple endpoints broken?
   - Can users access their data?

2. **Decide to rollback:**
   - If multiple critical issues → ROLLBACK
   - If single minor issue → Continue fixing
   - If unsure → ROLLBACK (can redeploy later)

3. **Execute rollback:**
   ```bash
   # List recent deployments
   vercel ls
   
   # Find previous stable deployment
   # Note the deployment ID
   
   # Promote previous version
   vercel rollback [deployment-id]
   ```

4. **Verify rollback:**
   - [ ] Deployment shows as Production
   - [ ] Health checks passing
   - [ ] API endpoints responding
   - [ ] No errors in logs

5. **Communicate:**
   - Notify team in #incidents
   - Notify impacted users if applicable
   - Create post-mortem ticket

6. **Root cause analysis:**
   - What went wrong?
   - Why wasn't it caught in staging?
   - How to prevent next time?

---

## TROUBLESHOOTING

### Issue: "Service Unavailable" / 503 Error

**Causes:**
1. Server is down
2. Deployment in progress
3. Database unavailable
4. Resource exhaustion

**Solutions:**
1. Check Vercel deployment status
   ```
   https://vercel.com/dashboard → Deployments
   ```

2. Check service health:
   ```bash
   curl -I https://vesta-platform.vercel.app
   ```

3. If deployment in progress → wait

4. If persistent → check logs:
   ```bash
   Vercel Dashboard → Logs → Filter by "error"
   ```

5. If database issue:
   - Try accessing data_store.json
   - Check file system permissions
   - Restore from backup if corrupted

### Issue: "Cannot find module" Error

**Cause:** Build artifact incomplete or missing

**Solutions:**
1. Force redeploy:
   ```bash
   vercel rollback [previous-deployment-id]
   ```

2. Check build logs for errors:
   ```
   Vercel Dashboard → Deployments → Click failed deployment
   ```

3. Fix the issue locally:
   ```bash
   npm install
   npm run build
   npm run lint
   ```

4. Commit and push to redeploy:
   ```bash
   git commit -m "fix: resolve build issue"
   git push origin main
   ```

### Issue: API Returns 401 Unauthorized

**Causes:**
1. Authentication token missing/expired
2. Authorization check failing
3. Session expired

**Solutions:**
1. Clear browser cache/cookies
2. Log out and log back in
3. Check if user has required permissions
4. Review auth logs in Sentry

### Issue: Chat Messages Not Saving

**Cause:** Database write failure

**Solutions:**
1. Verify data_store.json is writable
2. Check disk space not full
3. Review database error logs
4. Try writing test data via API

### Issue: Gemini AI Not Matching

**Causes:**
1. API key invalid
2. Rate limit exceeded
3. API down

**Solutions:**
1. Verify GEMINI_API_KEY in Vercel
2. Check Sentry for rate limit errors
3. Check Google API status page
4. Implement fallback manual matching

---

## MAINTENANCE

### Daily Tasks (Automated)

- [ ] Health check (automated)
- [ ] Error rate monitoring
- [ ] Performance baseline check

### Weekly Tasks

- [ ] Review error logs
- [ ] Check backup status
- [ ] Update dependencies if needed
- [ ] Review monitoring alerts
- [ ] Check certificate expiration

### Monthly Tasks

- [ ] Performance analysis
- [ ] Capacity planning review
- [ ] Security patches
- [ ] Team training session
- [ ] Disaster recovery drill

### Quarterly Tasks

- [ ] Full system audit
- [ ] Load testing
- [ ] Penetration testing
- [ ] Architecture review
- [ ] Compliance audit

### Annual Tasks

- [ ] Major version upgrades
- [ ] Data migration if needed
- [ ] Comprehensive security review
- [ ] Full disaster recovery test

---

## DISASTER RECOVERY

### Recovery Time Objectives (RTO)

| Scenario | RTO | RPO |
|----------|-----|-----|
| **Vercel down** | 30 min | 1 hour |
| **Data corruption** | 1 hour | 1 day |
| **Gemini API down** | N/A (graceful) | N/A |
| **Database loss** | 4 hours | 1 day |
| **Credentials compromised** | 15 min | immediate |

### Backup Strategy

**What to backup:**
- data_store.json (all business data)
- Configuration files
- Environment variables
- Custom code (via git)

**Backup frequency:**
- Automated: Daily
- Manual: Before major releases

**Backup storage:**
- Primary: Vercel
- Secondary: Local machine
- Tertiary: Cloud storage (AWS S3)

**Recovery procedure:**
1. Restore data_store.json from backup
2. Verify data integrity
3. Deploy application
4. Run smoke tests
5. Notify users if needed

---

## CHANGE MANAGEMENT

### Change Types

| Type | Approval | Testing | Deployment |
|------|----------|---------|-----------|
| **Hotfix (P1)** | Quick | Minimal | Immediate |
| **Bug fix (P2)** | Standard | Full | Next window |
| **Feature** | Required | Full | Scheduled |
| **Dependency** | Security team | Full | Scheduled |
| **Infrastructure** | DevOps | Full | Scheduled |

### Change Procedure

```
1. Create ticket with description
   ↓
2. Implement & test in local
   ↓
3. Create PR with description
   ↓
4. Code review (2+ reviewers)
   ↓
5. Deploy to staging
   ↓
6. QA testing in staging
   ↓
7. Get approval (Product Manager)
   ↓
8. Schedule deployment window
   ↓
9. Deploy to production
   ↓
10. Monitor for issues
   ↓
11. Post-deployment testing
   ↓
12. Close ticket & document
```

---

## ESCALATION PROCEDURES

### On-Call Escalation

```
Issue Detected
     │
     ▼
Alert sent to on-call
     │
  5 minutes no response?
     ├─ YES → Page backup on-call
     │
     └─ NO → Continue investigating
              │
           30 minutes no resolution?
              ├─ YES → Page manager
              │
              └─ NO → Continue (normal response time)
```

### Severity-Based Escalation

**P1 (Critical):**
1. Immediate: Page on-call
2. Alert: #critical-incidents channel
3. Notify: CTO + Product Manager
4. SLA: Resolution in 1 hour

**P2 (High):**
1. Alert: Slack #platform-incidents
2. Notify: Engineering team lead
3. SLA: Resolution in 4 hours

**P3 (Medium):**
1. Alert: Slack #platform-notifications
2. Track: In incident management
3. SLA: Resolution in 8 hours

**P4 (Low):**
1. Log: In ticketing system
2. Priority: Backlog
3. SLA: Resolution in 48 hours

---

## DOCUMENTATION CHECKLIST

- [x] System overview documented
- [x] Architecture documented
- [x] Runbooks created for common tasks
- [x] Troubleshooting guide completed
- [x] Maintenance schedule defined
- [x] Disaster recovery plan documented
- [x] Change management procedure defined
- [x] Escalation procedures documented
- [ ] Team trained on procedures
- [ ] Documentation reviewed quarterly

---

## QUICK DECISION TREE

```
Issue Occurred?
│
├─ Service down → Immediate rollback → If doesn't help → Restore from backup
│
├─ API slow → Check logs → Optimize/redeploy → Monitor
│
├─ Data issues → Check backup → Restore if corrupted → Verify
│
├─ Security incident → Isolate → Alert security → Full incident response
│
├─ Deployment failed → Check logs → Fix → Redeploy
│
└─ User complaints → Investigate → Communicate → Fix → Follow up
```

---

## USEFUL LINKS

**Internal:**
- Vercel Dashboard: https://vercel.com/dashboard
- Sentry Errors: https://sentry.io
- GitHub Repo: https://github.com/[your-org]/Virtual-Assistant-Services-Platform

**External:**
- Google Cloud: https://console.cloud.google.com
- Gemini API Docs: https://ai.google.dev
- Vercel Docs: https://vercel.com/docs

**Status Pages:**
- Vercel Status: https://status.vercel.com
- Google Cloud Status: https://status.cloud.google.com
- GitHub Status: https://www.githubstatus.com

---

*Last Updated: 2026-06-22*
*Next Review: 2026-07-22*
*Maintenance Owner: [TBD]*
