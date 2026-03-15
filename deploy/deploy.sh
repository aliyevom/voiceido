#!/usr/bin/env bash
# VoiceIDO deploy: one script for secrets, go-online (start VM + app), go-offline (stop VM), and full first-time deploy.
# Usage: ./deploy/deploy.sh <setup-secrets|online|offline|full>
# Zero-cost: use "offline" to stop the VM when not in use; "online" to start and serve.

set -e

PROJECT_ID="${PROJECT_ID:-ocr-project-1770234385}"
ZONE="${ZONE:-us-central1-a}"
VM_NAME="${VM_NAME:-voiceido-app}"
MACHINE_TYPE="${MACHINE_TYPE:-e2-medium}"
APP_DIR="${APP_DIR:-~/voiceido}"
USE_SECRETS="${USE_SECRETS:-1}"
STOP_VM="${STOP_VM:-false}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VOICEIDO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$VOICEIDO_ROOT/backend/.env}"

# SSH options (optional impersonation for GitHub Actions WIF)
SSH_OPTS="--zone=$ZONE --project=$PROJECT_ID --quiet"
if [ -n "$CLOUDSDK_AUTH_IMPERSONATE_SERVICE_ACCOUNT" ]; then
  SSH_OPTS="$SSH_OPTS --impersonate-service-account=$CLOUDSDK_AUTH_IMPERSONATE_SERVICE_ACCOUNT"
fi

# ---------- setup-secrets: push backend/.env to Secret Manager ----------
cmd_setup_secrets() {
  if [ ! -f "$ENV_FILE" ]; then
    echo "Env file not found: $ENV_FILE"
    exit 1
  fi
  echo "Using project: $PROJECT_ID"
  gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID" --quiet 2>/dev/null || true
  set -a; source "$ENV_FILE"; set +a

  if [ -n "$OPENROUTER_API_KEY" ]; then
    echo -n "$OPENROUTER_API_KEY" | gcloud secrets create voiceido-openrouter-api-key --project="$PROJECT_ID" --data-file=- --replication-policy=automatic 2>/dev/null || \
    echo -n "$OPENROUTER_API_KEY" | gcloud secrets versions add voiceido-openrouter-api-key --project="$PROJECT_ID" --data-file=-
    echo "  Set: voiceido-openrouter-api-key"
  fi
  if [ -n "$GCP_PROJECT_ID" ]; then
    echo -n "$GCP_PROJECT_ID" | gcloud secrets create voiceido-gcp-project-id --project="$PROJECT_ID" --data-file=- --replication-policy=automatic 2>/dev/null || \
    echo -n "$GCP_PROJECT_ID" | gcloud secrets versions add voiceido-gcp-project-id --project="$PROJECT_ID" --data-file=-
    echo "  Set: voiceido-gcp-project-id"
  fi
  if [ -n "$GCP_CREDENTIALS_PATH" ] && [ -f "$GCP_CREDENTIALS_PATH" ]; then
    gcloud secrets create voiceido-gcp-credentials-json --project="$PROJECT_ID" --replication-policy=automatic 2>/dev/null || true
    cat "$GCP_CREDENTIALS_PATH" | gcloud secrets versions add voiceido-gcp-credentials-json --project="$PROJECT_ID" --data-file=-
    echo "  Set: voiceido-gcp-credentials-json"
  fi
  echo "Secrets ready. Run: ./deploy/deploy.sh online"
}

# ---------- offline: stop VM (zero cost; no SSH needed) ----------
cmd_offline() {
  VM_STATUS=$(gcloud compute instances describe "$VM_NAME" --zone="$ZONE" --project="$PROJECT_ID" --format='get(status)' 2>/dev/null || echo "UNKNOWN")
  if [ "$VM_STATUS" = "TERMINATED" ] || [ "$VM_STATUS" = "STOPPED" ]; then
    echo "VM already stopped. Application offline."
  else
    if [ "$STOP_VM" = "true" ]; then
      gcloud compute instances stop "$VM_NAME" --zone="$ZONE" --project="$PROJECT_ID"
      echo "VM stopped. Zero cost."
    else
      echo "VM still running. Set STOP_VM=true to stop it (e.g. in CI)."
    fi
  fi
}

# ---------- online: start VM (if stopped), ensure .env, start containers ----------
cmd_online() {
  VM_STATUS=$(gcloud compute instances describe "$VM_NAME" --zone="$ZONE" --project="$PROJECT_ID" --format='get(status)' 2>/dev/null || echo "UNKNOWN")
  if [ "$VM_STATUS" = "TERMINATED" ] || [ "$VM_STATUS" = "STOPPED" ]; then
    echo "Starting VM..."
    gcloud compute instances start "$VM_NAME" --zone="$ZONE" --project="$PROJECT_ID"
    echo "Waiting 60s for SSH (cold start)..."
    sleep 60
  fi
  SSH_OPTS_TIMEOUT="$SSH_OPTS --ssh-flag=-oConnectTimeout=15 --ssh-flag=-oStrictHostKeyChecking=no"
  for i in $(seq 1 20); do
    if gcloud compute ssh "$VM_NAME" $SSH_OPTS_TIMEOUT --command="echo ok" 2>/dev/null; then
      echo "  SSH ready."
      break
    fi
    echo "  SSH not ready ($i/20)..."
    if [ "$i" -eq 20 ]; then
      echo "  SSH did not become ready in time. VM may need longer to boot."
      exit 1
    fi
    sleep 10
  done

  # Resolve .env: from env (CI) or Secret Manager (local)
  OPENROUTER_VAL="${OPENROUTER_API_KEY:-}"
  if [ -z "$OPENROUTER_VAL" ] && [ "$USE_SECRETS" = "1" ]; then
    OPENROUTER_VAL=$(gcloud secrets versions access latest --secret=voiceido-openrouter-api-key --project="$PROJECT_ID" 2>/dev/null) || true
  fi
  if [ -z "$OPENROUTER_VAL" ]; then
    echo "OpenRouter API key not set. Set OPENROUTER_API_KEY or run: ./deploy/deploy.sh setup-secrets"
    exit 1
  fi
  GCP_PROJECT_VAL="${GCP_PROJECT_ID:-$PROJECT_ID}"
  if [ "$USE_SECRETS" = "1" ] && [ -z "$GCP_PROJECT_ID" ]; then
    GCP_PROJECT_VAL=$(gcloud secrets versions access latest --secret=voiceido-gcp-project-id --project="$PROJECT_ID" 2>/dev/null) || echo "$PROJECT_ID"
  fi

  ENV_TMP=$(mktemp)
  trap "rm -f $ENV_TMP" EXIT
  echo "OPENROUTER_API_KEY=$OPENROUTER_VAL" > "$ENV_TMP"
  echo "GCP_PROJECT_ID=$GCP_PROJECT_VAL" >> "$ENV_TMP"
  GCP_JSON_SECRET=$(gcloud secrets versions access latest --secret=voiceido-gcp-credentials-json --project="$PROJECT_ID" 2>/dev/null) || true
  if [ -n "$GCP_JSON_SECRET" ]; then
    echo "GCP_CREDENTIALS_PATH=/app/gcp-key.json" >> "$ENV_TMP"
    GCP_JSON_TMP=$(mktemp)
    echo "$GCP_JSON_SECRET" > "$GCP_JSON_TMP"
    gcloud compute scp --zone="$ZONE" --project="$PROJECT_ID" "$GCP_JSON_TMP" "$VM_NAME:$APP_DIR/gcp-key.json"
    rm -f "$GCP_JSON_TMP"
  fi
  gcloud compute scp --zone="$ZONE" --project="$PROJECT_ID" "$ENV_TMP" "$VM_NAME:$APP_DIR/.env"
  gcloud compute ssh "$VM_NAME" $SSH_OPTS_TIMEOUT --command="
    cd $APP_DIR
    touch gcp-key.json; chmod 600 gcp-key.json
    sudo docker compose up -d --build
  "
  EXTERNAL_IP=$(gcloud compute instances describe "$VM_NAME" --zone="$ZONE" --project="$PROJECT_ID" --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
  echo "Online. Open: http://$EXTERNAL_IP"
}

# ---------- full: create VM (if missing), install Docker, copy app, start ----------
cmd_full() {
  if gcloud compute instances describe "$VM_NAME" --zone="$ZONE" --project="$PROJECT_ID" &>/dev/null; then
    echo "VM $VM_NAME exists. Use: ./deploy/deploy.sh online"
    exit 0
  fi
  echo "Ensuring APIs and firewall..."
  gcloud services enable compute.googleapis.com --project="$PROJECT_ID" --quiet 2>/dev/null || true
  gcloud compute firewall-rules describe allow-http-voiceido --project="$PROJECT_ID" &>/dev/null || \
    gcloud compute firewall-rules create allow-http-voiceido --project="$PROJECT_ID" --network=default --allow=tcp:80 --target-tags=http-server --description="Allow HTTP to VoiceIDO"

  echo "Creating VM..."
  gcloud compute instances create "$VM_NAME" \
    --project="$PROJECT_ID" --zone="$ZONE" --machine-type="$MACHINE_TYPE" \
    --network-interface=subnet=default,network-tier=PREMIUM \
    --maintenance-policy=MIGRATE --provisioning-model=STANDARD --tags=http-server \
    --create-disk=auto-delete=yes,boot=yes,device-name=voiceido,image=projects/debian-cloud/global/images/family/debian-12,mode=rw,size=20GB,type=pd-balanced \
    --no-shielded-secure-boot --shielded-vtpm --shielded-integrity-monitoring \
    --labels=app=voiceido

  echo "Waiting for SSH..."
  sleep 30
  for i in 1 2 3 4 5 6 7 8 9 10; do
    if gcloud compute ssh "$VM_NAME" $SSH_OPTS --command="echo ok" 2>/dev/null; then break; fi
    echo "  SSH not ready ($i/10)..."; sleep 10
  done

  echo "Installing Docker on VM..."
  gcloud compute ssh "$VM_NAME" $SSH_OPTS --command="
    sudo apt-get update -qq
    sudo apt-get install -y -qq ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker \$USER
  "

  echo "Copying app to VM..."
  gcloud compute scp --recurse --zone="$ZONE" --project="$PROJECT_ID" \
    "$VOICEIDO_ROOT/backend" "$VOICEIDO_ROOT/frontend" \
    "$VOICEIDO_ROOT/nginx.conf" "$VOICEIDO_ROOT/docker-compose.yml" \
    "$VM_NAME:~/voiceido/"

  cmd_online
}

# ---------- main ----------
ACTION="${1:-}"
case "$ACTION" in
  setup-secrets) cmd_setup_secrets ;;
  online)        cmd_online ;;
  offline)       cmd_offline ;;
  full)          cmd_full ;;
  *)
    echo "Usage: $0 <setup-secrets|online|offline|full>"
    echo "  setup-secrets  Push backend/.env to Secret Manager (run once)"
    echo "  online        Start VM (if stopped) and start app (zero-cost friendly)"
    echo "  offline       Stop containers and optionally VM (STOP_VM=true for CI)"
    echo "  full          First-time: create VM, install Docker, copy app, start"
    exit 1
    ;;
esac
