<div align="center">

# Task Manager

### A Full-Stack CRUD Application with Automated Cloud Deployment

[![CI – Tests & Build](https://github.com/shashipk/task-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/shashipk/task-manager/actions/workflows/ci.yml)

**Spring Boot 3** &bull; **React 18** &bull; **Docker** &bull; **Google Cloud Run** &bull; **CI/CD**

[Features](#features) &bull; [Architecture](#architecture) &bull; [Quick Start](#quick-start) &bull; [API Reference](#api-reference) &bull; [Deployment](#deployment)

</div>

---

## About

A production-grade Task Manager demonstrating end-to-end full-stack development: a **Spring Boot REST API** backed by JPA, a **React SPA** with Vite, **multi-stage Docker builds**, and a **two-layer CI/CD pipeline** that automatically tests, builds, and deploys to Google Cloud Run on every push.

Built to showcase:
- Clean REST API design with validation and global error handling
- Component-based React frontend with full CRUD operations
- Comprehensive test coverage (32 tests across backend and frontend)
- Production-ready containerization with lean multi-stage Docker images
- Infrastructure-as-code with `cloudbuild.yaml` and GitHub Actions

---

## Features

- **Create** tasks with title, description, and status
- **Read** all tasks or a single task by ID
- **Update** task details and transition status
- **Delete** tasks with confirmation dialog
- **Status tracking** &mdash; `TODO` &rarr; `IN_PROGRESS` &rarr; `DONE`
- **Input validation** on both client and server
- **Responsive UI** with status badges and clean card layout

---

## Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │              Developer Workflow               │
                    └──────────────────┬───────────────────────────┘
                                       │
                               git push to main
                                       │
                    ┌──────────────────▼───────────────────────────┐
                    │            GitHub Repository                  │
                    │                                               │
                    │  ┌─────────────┐    ┌─────────────────────┐  │
                    │  │   PR / Push │    │   Push to main      │  │
                    │  └──────┬──────┘    └──────────┬──────────┘  │
                    └─────────┼──────────────────────┼─────────────┘
                              │                      │
                    ┌─────────▼─────────┐  ┌────────▼──────────────┐
                    │  GitHub Actions   │  │  Google Cloud Build    │
                    │  (CI – Quality    │  │  (CD – Deploy)         │
                    │   Gate)           │  │                        │
                    │                   │  │  1. Run tests          │
                    │  • Backend tests  │  │  2. Build images       │
                    │  • Frontend tests │  │  3. Push to Artifact   │
                    │  • Docker build   │  │     Registry           │
                    │    check          │  │  4. Deploy to          │
                    │                   │  │     Cloud Run          │
                    └───────────────────┘  └────────┬──────────────┘
                                                     │
                              ┌───────────────────────┼──────────────────┐
                              │                       │                  │
                    ┌─────────▼────────┐  ┌──────────▼───────┐  ┌──────▼──────┐
                    │  Artifact        │  │  Cloud Run       │  │  Cloud Run  │
                    │  Registry        │  │  (Backend)       │  │  (Frontend) │
                    │                  │  │                  │  │             │
                    │  Docker images   │  │  Spring Boot API │  │  React SPA  │
                    │  backend:latest  │  │  Port 8080       │  │  via nginx  │
                    │  frontend:latest │  │                  │  │  Port 80    │
                    └──────────────────┘  └──────────────────┘  └─────────────┘
```

**Why two-layer CI/CD?**

| Layer | Trigger | Purpose |
|-------|---------|---------|
| **GitHub Actions** | Every push & PR | Fast feedback &mdash; tests, lint, Docker build check |
| **Cloud Build** | Merge to `main` only | Actual build &rarr; push &rarr; deploy to production |

This keeps PRs validated quickly while ensuring `main` is always deployable.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Java 17, Spring Boot 3.2, Spring Data JPA, Maven |
| **Database** | H2 (in-memory) |
| **Frontend** | React 18, Vite 5, Axios |
| **Testing** | JUnit 5, Mockito, MockMvc (17 tests) &bull; Vitest, Testing Library (15 tests) |
| **Containers** | Docker multi-stage builds (JRE Alpine + nginx Alpine) |
| **Registry** | Google Artifact Registry |
| **Hosting** | Google Cloud Run (serverless, scales to zero) |
| **CI** | GitHub Actions |
| **CD** | Google Cloud Build |

---

## Project Structure

```
task-manager/
│
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/taskmanager/
│   │   ├── controller/               # REST endpoints
│   │   ├── service/                   # Business logic
│   │   ├── repository/               # Data access (JPA)
│   │   ├── model/                     # Task entity + TaskStatus enum
│   │   ├── exception/                 # Global error handling
│   │   └── config/                    # CORS configuration
│   ├── src/test/java/                 # Unit + integration tests
│   ├── Dockerfile                     # Multi-stage: Maven build → JRE 17 Alpine
│   └── pom.xml
│
├── frontend/                          # React SPA
│   ├── src/
│   │   ├── components/                # TaskList, TaskForm, TaskCard, DeleteModal
│   │   ├── api/                       # Axios API client
│   │   └── __tests__/                 # Vitest component tests
│   ├── Dockerfile                     # Multi-stage: Node build → nginx Alpine
│   ├── nginx.conf                     # SPA routing + gzip + caching
│   └── vite.config.js
│
├── .github/workflows/ci.yml          # GitHub Actions CI pipeline
├── cloudbuild.yaml                    # Google Cloud Build CD pipeline
├── deploy.sh                          # Manual deploy helper script
└── .gitignore
```

---

## Quick Start

### Prerequisites

- Java 17+  &bull;  Maven 3.9+  &bull;  Node.js 20+  &bull;  npm 9+

### 1. Clone & run the backend

```bash
git clone https://github.com/shashipk/task-manager.git
cd task-manager/backend
mvn spring-boot:run
```

API is now live at `http://localhost:8080`. Verify:

```bash
curl http://localhost:8080/api/tasks    # → []
```

### 2. Run the frontend (new terminal)

```bash
cd task-manager/frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser. The Vite dev server proxies `/api` requests to the backend automatically.

### 3. Run all tests

```bash
# Backend – 17 tests (JUnit 5 + Mockito + MockMvc)
cd backend && mvn test

# Frontend – 15 tests (Vitest + Testing Library)
cd frontend && npm test
```

---

## API Reference

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/tasks` | List all tasks | `200` |
| `GET` | `/api/tasks/{id}` | Get task by ID | `200` / `404` |
| `POST` | `/api/tasks` | Create a new task | `201` / `400` |
| `PUT` | `/api/tasks/{id}` | Update a task | `200` / `404` |
| `DELETE` | `/api/tasks/{id}` | Delete a task | `204` / `404` |

### Task Schema

```json
{
  "id": 1,
  "title": "Implement authentication",
  "description": "Add JWT-based auth to the REST API",
  "status": "IN_PROGRESS",
  "createdAt": "2026-02-27T18:30:00"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | Long | Auto-generated |
| `title` | String | Required, max 255 chars |
| `description` | String | Optional, max 1000 chars |
| `status` | Enum | `TODO` \| `IN_PROGRESS` \| `DONE` |
| `createdAt` | DateTime | Auto-set on creation |

### Example Requests

```bash
# Create a task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread", "status": "TODO"}'

# Update status to done
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread", "status": "DONE"}'

# Delete a task
curl -X DELETE http://localhost:8080/api/tasks/1
```

### Error Responses

```json
// 404 – Task not found
{ "status": 404, "error": "Not Found", "message": "Task not found with id: 99" }

// 400 – Validation error
{ "status": 400, "error": "Validation Failed", "fieldErrors": { "title": "Title is required" } }
```

---

## Deployment

### How It Works

Every push to `main` automatically triggers the full pipeline:

```
git push origin main
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  Google Cloud Build (cloudbuild.yaml)                │
│                                                      │
│  Step 1:  mvn test (fail-fast if tests fail)        │
│  Step 2:  docker build backend → push to registry   │
│  Step 3:  gcloud run deploy backend                 │
│  Step 4:  capture backend URL                       │
│  Step 5:  docker build frontend (with API URL)      │
│  Step 6:  gcloud run deploy frontend                │
│                                                      │
│  Result:  Both services live on Cloud Run           │
└─────────────────────────────────────────────────────┘
```

### Initial GCP Setup

<details>
<summary><strong>1. Install Google Cloud SDK & authenticate</strong></summary>

```bash
curl https://sdk.cloud.google.com | bash
# Restart terminal, then:
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```
</details>

<details>
<summary><strong>2. Enable required APIs</strong></summary>

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```
</details>

<details>
<summary><strong>3. Create Artifact Registry repository</strong></summary>

```bash
gcloud artifacts repositories create task-manager \
  --repository-format=docker \
  --location=us-central1
```
</details>

<details>
<summary><strong>4. Create a service account for Cloud Build</strong></summary>

```bash
# Create the service account
gcloud iam service-accounts create cloudbuild-deployer \
  --display-name="Cloud Build Deployer"

# Grant required roles
SA="cloudbuild-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA" --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA" --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA" --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA" --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA" --role="roles/cloudbuild.builds.builder"

# Grant Secret Manager access to Cloud Build service agent
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-cloudbuild.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"
```
</details>

<details>
<summary><strong>5. Connect GitHub & create Cloud Build trigger</strong></summary>

```bash
# Create GitHub connection (opens browser for OAuth)
gcloud builds connections create github "github-connection" \
  --region=us-central1

# Link your repo
gcloud builds repositories create task-manager-repo \
  --remote-uri="https://github.com/YOUR_USERNAME/task-manager.git" \
  --connection=github-connection \
  --region=us-central1

# Create the auto-deploy trigger
gcloud builds triggers create github \
  --name="deploy-on-push-main" \
  --repository="projects/YOUR_PROJECT_ID/locations/us-central1/connections/github-connection/repositories/task-manager-repo" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --region=us-central1 \
  --service-account="projects/YOUR_PROJECT_ID/serviceAccounts/cloudbuild-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```
</details>

<details>
<summary><strong>6. Update cloudbuild.yaml substitutions</strong></summary>

Edit `cloudbuild.yaml` and set your project ID:

```yaml
substitutions:
  _PROJECT_ID: "YOUR_PROJECT_ID"
  _REGION: "us-central1"
  _REPO: "task-manager"
```

Commit, push, and the first deployment will trigger automatically.
</details>

### Docker (Local)

```bash
# Build
docker build -t task-manager-backend ./backend
docker build --build-arg VITE_API_URL=http://localhost:8080 -t task-manager-frontend ./frontend

# Run
docker run -p 8080:8080 task-manager-backend
docker run -p 3000:80 task-manager-frontend
```

### Monitoring

```bash
# Build history
gcloud builds list --region=us-central1 --limit=5

# Stream build logs
gcloud builds log BUILD_ID --region=us-central1 --stream

# Service status
gcloud run services list --region=us-central1

# Live logs
gcloud run services logs read task-manager-backend --region=us-central1
```

---

## Testing Strategy

| Layer | Framework | Type | Count |
|-------|-----------|------|-------|
| **Service** | JUnit 5 + Mockito | Unit tests (mocked repository) | 8 |
| **Controller** | MockMvc | Integration tests (HTTP layer) | 9 |
| **Components** | Vitest + Testing Library | React component tests | 15 |

All tests run in CI before any code reaches `main`.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **H2 in-memory DB** | Zero config for development; swap to Cloud SQL for production persistence |
| **Multi-stage Docker builds** | Final images are ~150MB (JRE Alpine) and ~25MB (nginx Alpine) |
| **Vite over CRA** | Faster builds, native ESM, better DX |
| **Two-layer CI/CD** | Fast PR feedback (GitHub Actions) + reliable deploys (Cloud Build) |
| **Cloud Run** | Serverless, scales to zero (cost-effective), auto-HTTPS |
| **User-managed service account** | Required by Cloud Build 2nd-gen GitHub connections; follows principle of least privilege |

---

## Future Improvements

- [ ] Replace H2 with Cloud SQL (PostgreSQL) for persistent storage
- [ ] Add JWT authentication and user accounts
- [ ] Implement task filtering, sorting, and pagination
- [ ] Add drag-and-drop Kanban board view
- [ ] Set up Terraform for infrastructure-as-code
- [ ] Add E2E tests with Playwright

---

## License

This project is open source and available under the [MIT License](LICENSE).
