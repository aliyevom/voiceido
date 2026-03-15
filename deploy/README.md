# VoiceIDO deploy (GCP e2-medium, zero-cost friendly)

One script and optional GitHub Actions to run VoiceIDO on Google Compute Engine. Use **go-offline** to stop the VM when not in use (zero cost).

## Prerequisites

- [gcloud CLI](https://cloud.google.com/sdk/gcloud) installed and logged in
- GCP project with billing; APIs: Compute Engine, Secret Manager (optional)

## 1. Store keys (once)

From the **VoiceIDO** repo root, with `backend/.env` containing `OPENROUTER_API_KEY` and optionally `GCP_PROJECT_ID`, `GCP_CREDENTIALS_PATH`:

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh setup-secrets
```

This pushes secrets to Google Secret Manager so the deploy script can use them without passing keys on the command line.

## 2. First-time: create VM and deploy

```bash
./deploy/deploy.sh full
```

This creates the VM, installs Docker, copies the app, and starts containers. Open **http://EXTERNAL_IP** (printed at the end).

## 3. Daily: go online / go offline (zero cost)

- **Start app (VM already exists):**  
  `./deploy/deploy.sh online`  
  Starts the VM if stopped, syncs `.env` from Secret Manager, and runs `docker compose up -d`.

- **Stop app and VM (save cost):**  
  `./deploy/deploy.sh offline`  
  Stops containers. To also stop the VM (zero cost), run with `STOP_VM=true` (e.g. in CI):  
  `STOP_VM=true ./deploy/deploy.sh offline`

## 4. GitHub Actions (optional)

The workflow **go-online** / **go-offline** can start and stop the VM on a schedule or manually.

**Setup:**

1. **Variables** (Settings > Actions > Variables):  
   - `GCP_PROJECT_ID` (e.g. `ocr-project-1770234385`)  
   - Optionally: `VM_NAME` (default `voiceido-app`), `VM_ZONE` (default `us-central1-a`).

2. **Secrets:**  
   - `OPENROUTER_API_KEY` (required for go-online).  
   - For Workload Identity Federation: `GCP_WIF_PROVIDER`, `GCP_WIF_SERVICE_ACCOUNT`.

3. **Permissions:**  
   Grant the WIF service account (or the SA used by gcloud in Actions) at least:  
   - `roles/compute.instanceAdmin.v1`  
   so it can start/stop the VM and SSH (e.g. `gcloud compute ssh`).

**Usage:**  
- **Actions** tab > **VoiceIDO VM Control** > **Run workflow** > choose **go-online** or **go-offline**.  
- Schedules (if enabled): weekdays 12:50 UTC ≈ go-online, 22:30 UTC ≈ go-offline.

## Env vars (script)

| Variable        | Default               | Description                    |
|----------------|-----------------------|--------------------------------|
| `PROJECT_ID`   | `ocr-project-1770234385` | GCP project                 |
| `ZONE`         | `us-central1-a`       | GCE zone                      |
| `VM_NAME`      | `voiceido-app`         | VM name                       |
| `USE_SECRETS`  | `1`                    | Use Secret Manager for keys   |
| `STOP_VM`      | `false`                | Set `true` to stop VM on offline |
| `OPENROUTER_API_KEY` | (from secrets or env) | Override for go-online (e.g. in CI) |

## Firewall

The script ensures a rule allows **tcp:80** for instances with tag `http-server`. The VM is created with that tag.

## Useful commands

- **Logs:**  
  `gcloud compute ssh voiceido-app --zone=us-central1-a --project=ocr-project-1770234385 --command='cd ~/voiceido && sudo docker compose logs -f'`

- **Restart app:**  
  `./deploy/deploy.sh online`

- **Delete VM:**  
  `gcloud compute instances delete voiceido-app --zone=us-central1-a --project=ocr-project-1770234385`
