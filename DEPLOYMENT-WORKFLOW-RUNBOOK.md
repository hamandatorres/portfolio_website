# Deployment Workflow Runbook

This document defines the standard workflow for development, deployment, and troubleshooting for the centralized webhook + deploy portal system.

## 1) Branch Strategy

- `main` = production branch (deploys to production site)
- `dev` = development/integration branch (deploys to development site)
- `feature/<name>` = short-lived branch created from `dev`
- `hotfix/<name>` = urgent production fix branch created from `main`

All websites now follow this standard branch model for production and development deployments.

## 2) Environments

- Production URL: `https://carlosachavez.com`
- Development URL: `https://dev.carlosachavez.com`

Webhook endpoint (machine-only):

- `https://carlosachavez.com/webhook/deploy.php`
- `https://dev.carlosachavez.com/webhook/deploy.php`

Deploy portal (human UI):

- `https://carlosachavez.com/webhook/deploy-portal.php`
- `https://dev.carlosachavez.com/webhook/deploy-portal.php`

## 3) Daily Developer Workflow

### Start new work

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-change
```

### Push feature branch

```bash
git add .
git commit -m "feat: describe your change"
git push -u origin feature/your-change
```

### Merge into dev

1. Open PR: `feature/your-change` -> `dev`
2. Review/approve
3. Merge PR
4. Confirm auto-deploy on dev URL

### Promote to production

1. Open PR: `dev` -> `main`
2. Merge PR when ready
3. Confirm auto-deploy on production URL

## 4) Hotfix Workflow (Production Emergency)

### Create hotfix from main

```bash
git checkout main
git pull origin main
git checkout -b hotfix/issue-name
```

### Ship hotfix

1. Commit and push `hotfix/*`
2. PR `hotfix/*` -> `main`
3. Merge and verify production

### Prevent branch drift

After hotfix merges to `main`, sync changes back to `dev`:

- Preferred: PR `main` -> `dev`
- Alternative: cherry-pick hotfix commit(s) into `dev`

## 5) GitHub Webhook Standard

All repos that deploy through the centralized router must use the same secret value in GitHub webhook settings.

- Webhook URL format: `https://<domain>/webhook/deploy.php`
- Content type: `application/json`
- Secret: shared value configured on server (`GITHUB_WEBHOOK_SECRET`)

If one repo returns `Invalid signature`, that repo webhook secret is usually stale.

## 6) Deploy Portal Usage

The deploy portal reads shared deployment events from:

- `/var/www/webhook/deploy-events.jsonl`
- `/var/www/webhook/deploy-status.log`

Portal auth file:

- `/var/www/webhook/.portal-auth`

Format:

```text
username:password
```

Change credentials:

```bash
printf 'youruser:yourStrongPassword\n' | sudo tee /var/www/webhook/.portal-auth > /dev/null
sudo chown www-data:www-data /var/www/webhook/.portal-auth
sudo chmod 640 /var/www/webhook/.portal-auth
```

## 7) Common Mistakes and Fixes

### A) Webhook error: `Invalid signature`

**Cause:** GitHub webhook secret does not match server secret.

**Fix:**

1. Confirm server shared secret is configured in PHP-FPM.
2. Update that exact value in GitHub webhook settings for the affected repo.
3. Redeliver the failed event.

---

### B) Webhook endpoint returns `404`

**Cause:** Nginx route not configured in active vhost/snippet.

**Fix:**

- Ensure webhook snippet/location exists and is included in active `server` block.
- Validate and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

### C) Portal returns `401` (expected) but login fails

**Cause:** Wrong credentials or browser cached old Basic Auth credentials.

**Fix:**

1. Reset `.portal-auth` credentials.
2. Verify with curl:

```bash
curl -I -u 'user:pass' https://<domain>/webhook/deploy-portal.php
```

Expected: `200`. 3. Use private/incognito window.

---

### D) Portal endpoint returns `404`

**Cause:** `deploy-portal.php` route missing in vhost/snippet.

**Fix:**

- Ensure webhook snippet includes both exact routes:
  - `/webhook/deploy.php`
  - `/webhook/deploy-portal.php`
- Ensure active vhost includes that snippet.

---

### E) `curl -6` fails but `curl -4` works

**Cause:** Missing or wrong `AAAA` DNS record.

**Fix:**

- Add/fix AAAA record for the host.
- Verify:

```bash
dig +short <host> AAAA
curl -6 -I https://<host>/webhook/deploy.php
```

---

### F) `HTTP 000` during webhook tests

**Cause:** Connectivity or DNS resolver issue (not usually app logic).

**Fix:**

- Check curl exit code (`rc`), DNS A/AAAA resolution, and test `-4`/`-6` separately.

---

### G) Nginx test fails with duplicate `listen` or duplicate `location`

**Cause:** Same directive defined twice in one server block or via include + inline duplication.

**Fix:**

- Keep one source of truth:
  - Either snippet include OR inline location blocks
- Remove duplicates
- Re-test with `nginx -t`

## 8) Verification Checklist (After Any Infra Change)

- `curl -I https://<prod>/webhook/deploy.php` returns `403`
- `curl -I https://<dev>/webhook/deploy.php` returns `403`
- `curl -I https://<prod>/webhook/deploy-portal.php` returns `401`
- `curl -I https://<dev>/webhook/deploy-portal.php` returns `401`
- Signed test webhook returns `200`
- New deploy appears in:
  - `/var/www/webhook/deploy-status.log`
  - `/var/www/webhook/deploy-events.jsonl`
  - deploy portal UI

## 9) Recommended GitHub Protection Rules

- Protect `main`:
  - Require pull request before merge
  - Optional: require review
- Recommended for `dev`:
  - Require pull request before merge
- Avoid direct pushes to `main`

## 10) Notes

- This system intentionally centralizes deploy execution and logging.
- Website domains can differ, but webhook handling and portal data source are shared.
- If a single repo fails while others succeed, start with webhook secret mismatch for that repo.
