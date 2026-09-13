# CampusData

CampusData is a full-stack university preference platform for students in Turkey. It brings YOK Atlas undergraduate data into a searchable, filterable product where candidates can compare universities, inspect program history, build preference lists, and find realistic options by ranking band.

[![CI](https://github.com/ykart897/CampusData/actions/workflows/ci.yml/badge.svg)](https://github.com/ykart897/CampusData/actions/workflows/ci.yml)

![CampusData program search](docs/assets/campusdata-programs-desktop.png)

## Why This Project Matters

Choosing a university in Turkey depends on scattered program metadata, yearly quota changes, base rankings, score type, city, scholarship status, and personal preference order. CampusData turns that into a product workflow:

- Browse 12,000+ undergraduate programs imported from a validated YOK Atlas snapshot.
- Filter by university, city, score type, program name, ranking, and quota data.
- Review yearly placement history before adding a program to a preference list.
- Build and reorder a private preference list with authenticated accounts.
- Use a preference wizard that separates certain, risky, and difficult choices around the student's ranking.

## Product Highlights

- Real YOK Atlas snapshot import with validation, backup, and safe upsert behavior.
- JWT authentication with token revocation for password changes and deactivated users.
- User-scoped preference lists with reorder validation and concurrency-safe updates.
- Responsive React UI verified with desktop and mobile Playwright flows.
- CI pipeline for backend tests, frontend build, and OSV dependency scanning.
- Docker Compose setup for PostgreSQL and Redis.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Data/UI | TanStack Query, TanStack Table, Recharts, Axios |
| Backend | Java 17, Spring Boot 3.5, Spring Security, Spring Data JPA |
| Database | PostgreSQL, Flyway |
| Cache | Redis, Caffeine |
| Auth | JWT, BCrypt |
| Quality | Maven tests, Playwright E2E, OSV Scanner, GitHub Actions |
| Runtime | Docker, Docker Compose, nginx |

## Architecture

```text
frontend/                 React application and Playwright tests
backend/                  Spring Boot API, auth, services, migrations
database/                 YOK Atlas snapshot/import tooling
docs/                     Supporting analysis and project notes
docker-compose.yml        Local PostgreSQL and Redis services
```

## Quick Start

Start infrastructure:

```powershell
docker compose up -d
```

Run the backend:

```powershell
cd backend
mvn spring-boot:run
```

Import the validated snapshot:

```powershell
$env:YOKATLAS_IMPORT_MODE="import"
$env:YOKATLAS_IMPORT_APPROVED="true"
$env:YOKATLAS_SNAPSHOT_PATH="database/snapshots/yokatlas-lisans-2026-05-16T11-16-07.841Z.json"
node database/import_yokatlas_api.mjs
```

Run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Health check: `http://localhost:8080/actuator/health`

## Verification

Useful checks before a release:

```powershell
cd backend
mvn test
```

```powershell
cd frontend
npm audit
npm run build
npm run test:e2e
```

Latest local validation covered backend unit tests, frontend production build, Docker build, npm audit, Playwright desktop/mobile flows, and a full snapshot import with orphan-record checks.

## Data Import Safety

The importer supports two modes:

- `snapshot`: fetches YOK Atlas data into `database/snapshots/` without changing the database.
- `import`: requires `YOKATLAS_IMPORT_APPROVED=true`, creates a database backup, validates the snapshot, and upserts university/program/yearly data without deleting users or preference lists.

After import, it checks counts, orphan programs, orphan yearly rows, blank names, and programs without yearly data.

## Portfolio Notes

This project demonstrates practical product engineering rather than only CRUD:

- real public data ingestion,
- relational schema evolution with Flyway,
- authenticated user workflows,
- ranking-based recommendation logic,
- cache-aware backend APIs,
- production-oriented security hardening,
- automated CI and visual E2E coverage.

## Project Status

CampusData is ready for portfolio review and local product demos. Public production deployment is intentionally left as a separate release step so environment secrets, domain, monitoring, and deployment ownership can be handled deliberately.
