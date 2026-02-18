# 🚀 GitHub Webhook Auto-Deployment — Carlos’s Setup

## Operations

- Deployment workflow and troubleshooting: [DEPLOYMENT-WORKFLOW-RUNBOOK.md](DEPLOYMENT-WORKFLOW-RUNBOOK.md)

This repository is connected to a custom GitHub webhook that triggers automatic deployments to a live server using a secure shell script. This document outlines the architecture, issues encountered during setup, and the implemented solutions.

---

## 📦 Deployment Workflow Overview

1. A commit is pushed to the `main` branch on GitHub.
2. GitHub triggers a webhook pointing to:

3. `deploy.php` executes `pull-carlos.sh` via `shell_exec()`.
4. The bash script securely connects via SSH using a deploy key, fetches new commits, resets the live code, and logs the deployment.

---

## 🛠 File Structure

---

## ⚙️ Key Files & Their Purpose

| File             | Description                                      |
| ---------------- | ------------------------------------------------ |
| `deploy.php`     | Webhook handler that triggers the shell script   |
| `pull-carlos.sh` | Pulls the latest Git changes securely via SSH    |
| `deploy.log`     | Records deploy timestamps, commit hashes, errors |

---

## 🧠 Common Issues & How They Were Resolved

| Issue                         | Cause                                         | Fix                                                                 |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| Webhook not triggering script | Wrong webhook path or file missing            | Created `deploy.php` in the correct `webhook/` directory            |
| 404 Not Found                 | Nginx couldn't route to `/webhook/deploy.php` | Ensured `root` was `/var/www/carlosachavez` and fixed file path     |
| 502 Bad Gateway               | PHP-FPM socket mismatch                       | Set `fastcgi_pass` to `/run/php/php7.4-fpm.sock` in Nginx config    |
| SSH permission denied         | Git tried using `/var/www/.ssh`               | Set `GIT_SSH_COMMAND` inside `pull-carlos.sh` with correct key path |
| Deploy script not found       | Wrong path in `shell_exec()`                  | Corrected the full path to `pull-carlos.sh`                         |
| Deploy log missing            | File didn’t exist or wrong permissions        | Created it manually and set ownership to `www-data`                 |

---

## ✅ Nginx PHP Block (Final Working Version)

```nginx
location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php7.4-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```
