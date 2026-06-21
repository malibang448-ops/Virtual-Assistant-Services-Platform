# ===================================================
# PRODUCTION DEPLOYMENT GUIDE
# Vesta Virtual Assistant Services Platform
# ===================================================
# Last Updated: 2026-06-22
# Deployment Platform: Vercel
# Environment: Production

---

## TABLE OF CONTENTS

1. [Pre-Deployment Requirements](#pre-deployment-requirements)
2. [Deployment Process](#deployment-process)
3. [Post-Deployment Validation](#post-deployment-validation)
4. [Rollback Procedures](#rollback-procedures)
5. [Troubleshooting](#troubleshooting)
6. [Emergency Contacts](#emergency-contacts)

---

## PRE-DEPLOYMENT REQUIREMENTS

### Prerequisites Checklist

Before starting deployment, verify:

✅ **Completed Tasks:**
- [x] Build verification passed
- [x] All tests passing
- [x] Security audit completed
- [x] All environment variables configured
- [x] Deployment checklist reviewed

⚠️ **To Complete:**
- [ ] All team members notified
- [ ] Deployment window confirmed
- [ ] Stakeholders acknowledged
- [ ] Rollback plan reviewed
- [ ] On-call team ready

### Required Access & Credentials

**Vercel Dashboard Access:**
```
URL: https://vercel.com/dashboard
Access Required: Project owner or admin
```

**GitHub Repository Access:**
```
Repository: Virtual-Assistant-Services-Platform
Permissions Required: Push access
```

**API Credentials to Verify:**
```
- GEMINI_API_KEY (valid and active)
- VERTEX_SERVICE_ACCOUNT (active service account)
```

### Environment Verification

```bash
# Verify all required environment variables are set
# These should be configured in Vercel Secrets, NOT in .env files

GEMINI_API_KEY          ✓ Set
VERTEX_SERVICE_ACCOUNT  ✓ Set
APP_URL                 ✓ Set to production domain
NODE_ENV                ✓ Set to "production"
```

---

## DEPLOYMENT PROCESS

### Option 1: Automated Vercel Deployment (Recommended)

**Steps:**

1. **Push code to main branch:**
   ```bash
   git add .
   git commit -m "prod: production deployment v1.0.0"
   git push origin main
   ```

2. **Vercel automatically triggers deployment:**
   - Vercel detects the push to main branch
   - Starts the build process using `npm run build`
   - Automatically deploys to production if build succeeds

3. **Monitor deployment progress:**
   - Go to: https://vercel.com/dashboard/project-name
   - Check "Deployments" tab
   - View real-time build logs

4. **Verify deployment status:**
   - Green checkmark = Deployment successful
   - Red X = Deployment failed
   - See logs for error details

**Estimated Time:** 3-5 minutes

### Option 2: Manual Vercel Deployment via CLI

**Prerequisites:**
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login
```

**Steps:**

1. **Navigate to project directory:**
   ```bash
   cd Virtual-Assistant-Services-Platform
   ```

2. **Deploy to production:**
   ```bash
   vercel --prod
   ```

3. **Verify prompts:**
   ```
   ? Set up and deploy? (Y/n) → Y
   ? Which scope should contain your project? → Select your team
   ? Link to existing project? (y/N) → y
   ? What's the name of your existing project? → Virtual-Assistant-Services-Platform
   ```

4. **Monitor deployment:**
   - CLI shows real-time deployment status
   - Wait for "✓ Production"
   - Note the deployment URL

**Estimated Time:** 5-8 minutes

### Option 3: Vercel Dashboard Deployment

**Steps:**

1. **Go to Vercel Dashboard:**
   - URL: https://vercel.com/dashboard

2. **Select project:**
   - Click on "Virtual-Assistant-Services-Platform"

3. **Go to "Deployments" tab**

4. **Trigger manual deployment:**
   - Click "Redeploy" on the desired commit
   - Or wait for automatic deployment on main branch push

5. **Monitor deployment:**
   - View real-time logs
   - Watch for build completion

**Estimated Time:** 3-5 minutes (no push required)

### Deployment Best Practices

**Before Deployment:**
- [ ] Notify team in #deployments Slack channel
- [ ] Verify main branch is ready
- [ ] Confirm all CI/CD checks passing
- [ ] Have rollback plan ready
- [ ] Ensure on-call team is available

**During Deployment:**
- [ ] Monitor deployment progress
- [ ] Check build logs for warnings
- [ ] Don't interrupt the process
- [ ] Keep team communication open
- [ ] Have terminal ready for quick actions

**After Deployment:**
- [ ] Verify production is live
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Notify stakeholders of success

---

## POST-DEPLOYMENT VALIDATION

### 1. Verify Deployment Success (5 minutes)

```bash
# Check deployment status
curl -I https://vesta-platform.vercel.app

# Expected response:
# HTTP/2 200
# Content-Type: text/html
# Cache-Control: public, max-age=0, must-revalidate
```

### 2. Health Check Endpoints (2 minutes)

**Frontend Health:**
```bash
# Check if frontend loads
curl https://vesta-platform.vercel.app
# Should return HTML content
```

**API Health:**
```bash
# Check if API endpoints respond
curl https://vesta-platform.vercel.app/api/health
# Expected: 200 OK
```

### 3. Functional Testing (10-15 minutes)

**Browser Testing:**
1. Open browser to https://vesta-platform.vercel.app
2. Verify page loads without errors
3. Check browser console for errors (F12)
4. Verify all UI elements render correctly

**Navigation Tests:**
- [ ] Home page loads
- [ ] Agent Directory accessible
- [ ] Service Catalog visible
- [ ] Booking system functional
- [ ] Admin Dashboard accessible
- [ ] Chat interface loads

**API Integration Tests:**
- [ ] Gemini AI integration working
- [ ] Data storage functioning
- [ ] API endpoints responding
- [ ] Error handling working

### 4. Performance Validation (5 minutes)

```bash
# Check page load performance
curl -w "@curl-format.txt" -o /dev/null -s https://vesta-platform.vercel.app

# Key metrics to monitor:
# - DNS Lookup time: < 50ms
# - Time to Connect: < 100ms
# - Time to First Byte: < 500ms
# - Total Load Time: < 2000ms
```

**Check Lighthouse Score:**
- Open: https://web.dev/measure
- Enter: https://vesta-platform.vercel.app
- Target: Score > 80

### 5. Security Verification (10 minutes)

**SSL/TLS Check:**
```bash
# Verify HTTPS is enforced
curl -I https://vesta-platform.vercel.app
# Check for: Strict-Transport-Security header
```

**Security Headers Validation:**
```bash
# Using online tool
curl -I https://vesta-platform.vercel.app | grep -i "x-"

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block
```

**SSL Certificate Check:**
- Use: https://www.ssllabs.com/ssltest
- Enter domain: vesta-platform.vercel.app
- Target rating: A or A+

### 6. Monitoring Setup Verification (5 minutes)

- [ ] Error tracking activated (Sentry)
- [ ] Performance monitoring enabled
- [ ] Log aggregation receiving data
- [ ] Alerts configured and active
- [ ] Dashboards populated with metrics

### 7. Smoke Tests (Automated)

Create [smoke-tests.ts](smoke-tests.ts) for automated validation:

```typescript
// Example smoke tests
describe('Production Smoke Tests', () => {
  test('Homepage loads successfully', async () => {
    const response = await fetch('https://vesta-platform.vercel.app');
    expect(response.status).toBe(200);
  });

  test('API endpoints accessible', async () => {
    const response = await fetch('https://vesta-platform.vercel.app/api/agents');
    expect(response.status).toBe(200);
  });

  test('Gemini integration active', async () => {
    const response = await fetch('https://vesta-platform.vercel.app/api/match', {
      method: 'POST',
      body: JSON.stringify({ clientNeeds: 'admin support' })
    });
    expect(response.status).toBe(200);
  });
});
```

Run smoke tests:
```bash
npm run test:smoke
```

### Post-Deployment Checklist

- [ ] Deployment completed successfully (green status in Vercel)
- [ ] No error logs in production
- [ ] Homepage accessible and loads quickly
- [ ] All navigation links working
- [ ] API endpoints responding
- [ ] Gemini AI integration functional
- [ ] Database connections active
- [ ] Performance metrics acceptable
- [ ] Security headers present
- [ ] HTTPS enforced
- [ ] All team members notified
- [ ] Stakeholders informed

---

## ROLLBACK PROCEDURES

### When to Rollback

Initiate rollback immediately if:

1. ❌ Critical functionality broken (booking system down)
2. ❌ API endpoints returning 5xx errors
3. ❌ Data corruption detected
4. ❌ Performance degradation > 50%
5. ❌ Security vulnerability exposed
6. ❌ Database connectivity lost

Do NOT rollback for:
- Minor UI issues (can be fixed with hotfix)
- Single endpoint issues (can patch individually)
- Warning-level logging

### Quick Rollback (< 5 minutes)

**Via Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard/project-name
2. Click "Deployments" tab
3. Find the previous stable deployment
4. Click the deployment
5. Click "Promote to Production"
6. Confirm the rollback

**Expected time:** 2-3 minutes

**Via Vercel CLI:**

```bash
# List recent deployments
vercel ls

# Roll back to previous deployment
vercel rollback [deployment-id]

# Confirm rollback to production
vercel promote [deployment-id]
```

### Full Rollback Process

1. **Immediate Actions (0-5 minutes)**
   - Notify team in #incidents channel
   - Assess severity (Critical/High/Medium)
   - Prepare rollback communication
   - Alert on-call engineer

2. **Execute Rollback (5-10 minutes)**
   - Use quick rollback procedure above
   - Monitor rollback completion
   - Verify previous version is live
   - Check error logs for issues

3. **Verification (10-15 minutes)**
   - Run full health check
   - Execute smoke tests
   - Verify data integrity
   - Check performance metrics

4. **Incident Response (15+ minutes)**
   - Document what went wrong
   - Create post-mortem ticket
   - Communicate with stakeholders
   - Schedule root cause analysis
   - Plan hotfix deployment

5. **Hotfix Deployment (After Analysis)**
   - Create fix on hotfix branch
   - Test thoroughly in staging
   - Deploy fix to production
   - Verify fix resolves issue

### Prevention: Staging Deployment

Before deploying to production, always deploy to staging:

```bash
# Deploy to staging
vercel --scope=your-team

# Test thoroughly in staging
# Monitor logs and metrics
# Verify functionality
# Run full test suite

# Then deploy to production
vercel --prod
```

---

## TROUBLESHOOTING

### Common Issues & Solutions

#### Issue: Build Fails During Deployment

**Symptoms:**
- Build status showing "FAILED" in Vercel
- Error message: "npm run build exited with status 1"

**Solutions:**
1. Check build logs in Vercel for specific error
2. Reproduce locally: `npm run build`
3. Fix the issue in code
4. Commit and push to main branch
5. Vercel will automatically retry

#### Issue: Environment Variables Not Set

**Symptoms:**
- 500 errors in API endpoints
- "GEMINI_API_KEY is undefined" in logs

**Solutions:**
1. Go to Vercel Project Settings → Environment Variables
2. Verify all variables are set correctly
3. Check variable names match code references
4. Redeploy after updating variables: `vercel --prod`

#### Issue: API Endpoints Returning 404

**Symptoms:**
- Requests to /api/* return 404
- Error: "Cannot GET /api/agents"

**Solutions:**
1. Verify api/index.ts is properly built
2. Check vercel.json routes configuration
3. Ensure server.cjs is built correctly
4. Redeploy: `vercel --prod`

#### Issue: Database Connection Fails

**Symptoms:**
- Booking data not saving
- Chat messages not persisting
- Error: "Failed to read data_store.json"

**Solutions:**
1. Check file system permissions
2. Verify data_store.json exists
3. Check disk space availability
4. Review Vercel storage settings
5. If needed, restore from backup

#### Issue: Performance Degradation

**Symptoms:**
- Page load time increased
- API response time > 2 seconds
- High CPU usage

**Solutions:**
1. Check Vercel Analytics dashboard
2. Review recent code changes
3. Optimize slow database queries
4. Reduce bundle size if needed
5. Consider scaling resources

#### Issue: SSL Certificate Errors

**Symptoms:**
- Browser warning: "Your connection is not private"
- Error: "SSL handshake failed"

**Solutions:**
1. Verify domain DNS points to Vercel
2. Check SSL certificate status in Vercel
3. Wait for certificate auto-renewal (up to 24 hours)
4. If urgent, contact Vercel support
5. Ensure CNAME records correct

### Getting Help

**Internal Support:**
- Slack: #vesta-platform-prod
- On-Call: Check rotation schedule
- Manager: [Your Manager Name]

**Vercel Support:**
- Dashboard: https://vercel.com/support
- Email: support@vercel.com
- Status Page: https://status.vercel.com

**Google Cloud Support:**
- For API issues: https://cloud.google.com/support

---

## MONITORING DURING & AFTER DEPLOYMENT

### Real-Time Monitoring

**Vercel Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Click on deployment
3. Monitor build progress
4. Review deployment logs

**Error Tracking (Sentry):**
1. Check for new errors post-deployment
2. Set alert threshold to critical
3. Review error patterns
4. Compare pre/post deployment metrics

**Application Metrics:**
1. Monitor API response times
2. Track error rates
3. Watch resource utilization
4. Check user behavior analytics

### Alert Conditions

Set up alerts for:
- Error rate > 1%
- API response time > 1000ms
- 5xx errors detected
- Service down
- Disk usage > 80%
- Memory usage > 85%

---

## DEPLOYMENT SUCCESS CRITERIA

Deployment is considered successful when:

1. ✅ Build completed with green status
2. ✅ All smoke tests passing
3. ✅ Error rate < 0.1%
4. ✅ Response time p95 < 1000ms
5. ✅ No critical errors in logs
6. ✅ All API endpoints responding
7. ✅ UI rendering correctly
8. ✅ User workflows functional
9. ✅ Security headers present
10. ✅ Team notified of success

---

## EMERGENCY CONTACTS

### On-Call Engineer
- Name: [TBD]
- Phone: [TBD]
- Slack: [TBD]

### DevOps Lead
- Name: [TBD]
- Phone: [TBD]
- Slack: [TBD]

### Product Manager
- Name: [TBD]
- Phone: [TBD]
- Slack: [TBD]

### Incident Commander
- Name: [TBD]
- Phone: [TBD]
- Slack: [TBD]

---

## APPENDIX: COMMANDS REFERENCE

```bash
# Pre-deployment
npm install                    # Install dependencies
npm run lint                   # Type check
npm run build                  # Build for production

# Deployment
git add .
git commit -m "prod: message"
git push origin main

# Manual deployment
vercel --prod
vercel rollback [deployment-id]

# Monitoring
curl -I https://vesta-platform.vercel.app
npm run test:smoke

# Troubleshooting
npm run build                  # Reproduce build locally
npm audit                      # Check vulnerabilities
```

---

*Last Updated: 2026-06-22*
*Next Review: 2026-07-22*
*Approval: [TBD]*
