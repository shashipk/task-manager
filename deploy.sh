#!/usr/bin/env bash
##############################################################
# deploy.sh – Manual deploy helper
# Run this from the repo root to deploy both services manually
#
# Usage:
#   export PROJECT_ID=your-gcp-project-id
#   export REGION=us-central1
#   export REPO=task-manager
#   bash deploy.sh
##############################################################

set -euo pipefail

# ── Config ────────────────────────────────────────────────
PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID env var}"
REGION="${REGION:-us-central1}"
REPO="${REPO:-task-manager}"
SHORT_SHA=$(git rev-parse --short HEAD)

REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"

echo "==> Deploying Task Manager"
echo "    Project : $PROJECT_ID"
echo "    Region  : $REGION"
echo "    SHA     : $SHORT_SHA"
echo ""

# ── Authenticate Docker to Artifact Registry ───────────────
echo "==> Configuring Docker auth..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# ── Backend ───────────────────────────────────────────────
echo "==> Running backend tests..."
(cd backend && mvn test -B --no-transfer-progress)

echo "==> Building backend image..."
docker build -t "${REGISTRY}/backend:${SHORT_SHA}" -t "${REGISTRY}/backend:latest" ./backend

echo "==> Pushing backend image..."
docker push --all-tags "${REGISTRY}/backend"

echo "==> Deploying backend to Cloud Run..."
gcloud run deploy task-manager-backend \
  --image="${REGISTRY}/backend:${SHORT_SHA}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --quiet

BACKEND_URL=$(gcloud run services describe task-manager-backend \
  --region="${REGION}" \
  --format="value(status.url)")
echo "    Backend URL: $BACKEND_URL"

# ── Frontend ──────────────────────────────────────────────
echo "==> Building frontend image (API_URL=$BACKEND_URL)..."
docker build \
  --build-arg VITE_API_URL="${BACKEND_URL}" \
  -t "${REGISTRY}/frontend:${SHORT_SHA}" \
  -t "${REGISTRY}/frontend:latest" \
  ./frontend

echo "==> Pushing frontend image..."
docker push --all-tags "${REGISTRY}/frontend"

echo "==> Deploying frontend to Cloud Run..."
gcloud run deploy task-manager-frontend \
  --image="${REGISTRY}/frontend:${SHORT_SHA}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=80 \
  --memory=256Mi \
  --quiet

FRONTEND_URL=$(gcloud run services describe task-manager-frontend \
  --region="${REGION}" \
  --format="value(status.url)")

echo ""
echo "==> Deployment complete!"
echo "    Frontend : $FRONTEND_URL"
echo "    Backend  : $BACKEND_URL"
echo "    API Test : curl $BACKEND_URL/api/tasks"
