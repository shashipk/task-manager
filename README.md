# Task Manager – Full-Stack CRUD App

A production-ready Task Manager built with **Spring Boot 3** (REST API) and **React 18** (Vite), containerized with Docker and deployed to **Google Cloud Run** via a fully automated **CI/CD pipeline** (GitHub Actions + Google Cloud Build).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Local Development Setup](#local-development-setup)
6. [Running Tests Locally](#running-tests-locally)
7. [Docker Build Locally](#docker-build-locally)
8. [CI/CD Pipeline Overview](#cicd-pipeline-overview)
9. [Connecting GitHub to Google Cloud Build](#connecting-github-to-google-cloud-build)
10. [Setting Up the Cloud Build Trigger](#setting-up-the-cloud-build-trigger)
11. [Granting IAM Permissions to Cloud Build](#granting-iam-permissions-to-cloud-build)
12. [First Manual Deployment](#first-manual-deployment)
13. [Monitoring Deployments](#monitoring-deployments)
14. [API Reference](#api-reference)

---

## Project Overview

A simple Task Manager supporting full CRUD operations:

- **Create** tasks with title, description, and status
- **Read** all tasks or a single task by ID
- **Update** task title, description, and status
- **Delete** tasks

Task statuses: `TODO` | `IN_PROGRESS` | `DONE`

---

## Architecture

```
Developer → GitHub push to main
               ↓
         GitHub Webhook
               ↓
    Google Cloud Build (cloudbuild.yaml)
     ├── Run backend tests (fail-fast)
     ├── Build + push backend image → Artifact Registry
     ├── Deploy backend → Cloud Run
     ├── Build + push frontend image (with backend URL baked in)
     └── Deploy frontend → Cloud Run
               ↓
        Live on Cloud Run URLs
```

**Two-layer CI/CD:**
- **GitHub Actions** → runs on every push/PR (fast feedback: lint, test, docker build check)
- **Cloud Build** → runs only on merge to `main` (actual build → push → deploy)

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Java 17, Spring Boot 3.2, Maven     |
| Database   | H2 (in-memory)                      |
| Frontend   | React 18, Vite, Axios               |
| Testing    | JUnit 5, Mockito, MockMvc, Vitest   |
| Containers | Docker (multi-stage builds)         |
| Registry   | Google Artifact Registry            |
| Hosting    | Google Cloud Run                    |
| CI         | GitHub Actions                      |
| CD         | Google Cloud Build                  |

---

## Project Structure

```
task-manager/
├── backend/                        # Spring Boot REST API
│   ├── src/
│   │   ├── main/java/com/taskmanager/
│   │   │   ├── TaskManagerApplication.java
│   │   │   ├── config/CorsConfig.java
│   │   │   ├── controller/TaskController.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── TaskNotFoundException.java
│   │   │   ├── model/
│   │   │   │   ├── Task.java
│   │   │   │   └── TaskStatus.java
│   │   │   ├── repository/TaskRepository.java
│   │   │   └── service/TaskService.java
│   │   ├── main/resources/application.properties
│   │   └── test/java/com/taskmanager/
│   │       ├── controller/TaskControllerTest.java   # MockMvc integration tests
│   │       └── service/TaskServiceTest.java         # Mockito unit tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                       # React 18 + Vite SPA
│   ├── src/
│   │   ├── api/taskApi.js
│   │   ├── components/
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── DeleteModal.jsx
│   │   ├── __tests__/
│   │   │   ├── TaskForm.test.jsx
│   │   │   ├── TaskList.test.jsx
│   │   │   └── DeleteModal.test.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI
├── cloudbuild.yaml                 # Cloud Build CD pipeline
├── deploy.sh                       # Manual deploy helper
├── .gitignore
└── README.md
```

---

## Local Development Setup

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20+
- npm 9+
- Docker (optional, for local container testing)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
```

### 2. Run the backend

```bash
cd backend
mvn spring-boot:run
# API available at http://localhost:8080
# H2 console at http://localhost:8080/h2-console
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

The Vite dev server proxies `/api` requests to `http://localhost:8080`, so no CORS configuration is needed locally.

---

## Running Tests Locally

### Backend tests

```bash
cd backend
mvn test
# Runs both unit tests (Mockito) and MockMvc integration tests
# Reports: backend/target/surefire-reports/
```

### Frontend tests

```bash
cd frontend
npm install
npm test
# Runs Vitest component tests
```

---

## Docker Build Locally

```bash
# Backend
docker build -t task-manager-backend ./backend

# Frontend (replace URL with actual backend URL)
docker build \
  --build-arg VITE_API_URL=http://localhost:8080 \
  -t task-manager-frontend \
  ./frontend

# Run both
docker run -p 8080:8080 task-manager-backend
docker run -p 3000:80 task-manager-frontend
```

---

## CI/CD Pipeline Overview

### GitHub Actions (`.github/workflows/ci.yml`)

Triggers on every push and PR to `main`:

| Job            | What it does                                  |
|----------------|-----------------------------------------------|
| `backend`      | `mvn test` – unit + MockMvc integration tests |
| `frontend`     | `npm ci && npm test && npm run build`          |
| `docker-check` | Builds both Docker images (no push)           |

This is the **quality gate** – PRs cannot merge if any job fails.

### Google Cloud Build (`cloudbuild.yaml`)

Triggers only on merge to `main`:

| Step               | What it does                               |
|--------------------|--------------------------------------------|
| `test-backend`     | Runs `mvn test` – fails the pipeline fast  |
| `build-backend`    | Builds backend Docker image                |
| `push-backend`     | Pushes to Artifact Registry                |
| `deploy-backend`   | Deploys to Cloud Run                       |
| `get-backend-url`  | Reads the live backend URL                 |
| `build-frontend`   | Builds frontend image with backend URL     |
| `push-frontend`    | Pushes to Artifact Registry                |
| `deploy-frontend`  | Deploys to Cloud Run                       |

---

## Connecting GitHub to Google Cloud Build

### Step 1 – Prerequisites

```bash
# Auth and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

# Create Artifact Registry Docker repo
gcloud artifacts repositories create task-manager \
  --repository-format=docker \
  --location=us-central1 \
  --description="Task Manager Docker images"
```

### Step 2 – Connect Repository in Cloud Build Console

1. Go to [Cloud Build → Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **"Connect Repository"**
3. Select **"GitHub (Cloud Build GitHub App)"** as the source
4. Authenticate with your GitHub account and install the Cloud Build app
5. Search for and select your `task-manager` repository
6. Click **"Connect"**

---

## Setting Up the Cloud Build Trigger

### In the Cloud Console

1. Go to **Cloud Build → Triggers → Create Trigger**
2. Fill in:
   - **Name:** `deploy-on-push-main`
   - **Event:** Push to a branch
   - **Repository:** your connected repo
   - **Branch:** `^main$`
   - **Configuration:** Cloud Build configuration file
   - **Cloud Build configuration file location:** `/cloudbuild.yaml`

3. Add **Substitution Variables**:

   | Variable       | Value                        |
   |----------------|------------------------------|
   | `_PROJECT_ID`  | `your-gcp-project-id`        |
   | `_REGION`      | `us-central1`                |
   | `_REPO`        | `task-manager`               |

4. Click **"Create"**

### Or via CLI

```bash
gcloud builds triggers create github \
  --name="deploy-on-push-main" \
  --repo-name="task-manager" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --substitutions='_PROJECT_ID=your-project-id,_REGION=us-central1,_REPO=task-manager'
```

---

## Granting IAM Permissions to Cloud Build

The Cloud Build service account needs permission to deploy to Cloud Run and push to Artifact Registry.

```bash
# Get Cloud Build service account email
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "Cloud Build SA: $CB_SA"

# Grant required roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/iam.serviceAccountUser"
```

---

## First Manual Deployment

Use the provided `deploy.sh` script for the first deployment:

```bash
# Set required variables
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1
export REPO=task-manager

# Make sure you're authenticated
gcloud auth login
gcloud auth configure-docker us-central1-docker.pkg.dev

# Run the deploy script from repo root
bash deploy.sh
```

The script will:
1. Run backend tests (fails if any test fails)
2. Build + push backend Docker image
3. Deploy backend to Cloud Run
4. Capture the backend URL
5. Build + push frontend Docker image (with backend URL)
6. Deploy frontend to Cloud Run
7. Print both service URLs

---

## Monitoring Deployments

### Watch a Cloud Build build

```bash
# List recent builds
gcloud builds list --limit=5

# Stream logs for a specific build
gcloud builds log BUILD_ID --stream
```

### Check Cloud Run service status

```bash
# List services
gcloud run services list --region=us-central1

# Describe a service
gcloud run services describe task-manager-backend --region=us-central1
gcloud run services describe task-manager-frontend --region=us-central1

# Get service URLs
gcloud run services describe task-manager-backend \
  --region=us-central1 \
  --format="value(status.url)"
```

### View logs

```bash
# Backend logs
gcloud run services logs read task-manager-backend --region=us-central1

# Frontend logs
gcloud run services logs read task-manager-frontend --region=us-central1
```

---

## API Reference

Base URL: `https://your-backend-cloudrun-url.run.app`

| Method | Endpoint          | Description         | Request Body               |
|--------|-------------------|---------------------|----------------------------|
| GET    | `/api/tasks`      | List all tasks      | –                          |
| GET    | `/api/tasks/{id}` | Get task by ID      | –                          |
| POST   | `/api/tasks`      | Create a new task   | `{title, description, status}` |
| PUT    | `/api/tasks/{id}` | Update a task       | `{title, description, status}` |
| DELETE | `/api/tasks/{id}` | Delete a task       | –                          |

### Task Object

```json
{
  "id": 1,
  "title": "My Task",
  "description": "Task description",
  "status": "TODO",
  "createdAt": "2024-01-15T10:30:00"
}
```

Status values: `TODO` | `IN_PROGRESS` | `DONE`

### Example cURL commands

```bash
BASE=https://your-backend-url.run.app

# List tasks
curl $BASE/api/tasks

# Create task
curl -X POST $BASE/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Do something","status":"TODO"}'

# Update task
curl -X PUT $BASE/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","description":"Done now","status":"DONE"}'

# Delete task
curl -X DELETE $BASE/api/tasks/1
```

---

## Troubleshooting

**Cloud Build fails with permission denied on Artifact Registry:**
→ Re-run the IAM grant commands in [Granting IAM Permissions](#granting-iam-permissions-to-cloud-build)

**Frontend shows "Failed to load tasks":**
→ Check `VITE_API_URL` build arg was set correctly in Cloud Build. Verify CORS is enabled on backend.

**Cloud Run service shows 0 instances:**
→ Cloud Run scales to zero by default. First request may take a few seconds (cold start). Set `--min-instances=1` if you want always-warm instances.

**H2 data resets on restart:**
→ This is expected – H2 is in-memory. For persistence, replace with Cloud SQL (PostgreSQL) and add the JDBC driver to `pom.xml`.
