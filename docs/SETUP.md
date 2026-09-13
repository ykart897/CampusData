# Local Development

## Requirements

- Java JDK 17 and Maven 3.8+
- Node.js 22.12+ (Node 22 matches CI) and npm
- Docker with Compose; Docker Desktop must be running on Windows
- Microsoft Edge for the current Playwright configuration

Commands below use PowerShell. Start in the repository root unless indicated otherwise.

## 1. Get the Source and Start Infrastructure

```powershell
git clone https://github.com/ykart897/CampusData.git
cd CampusData
docker compose up -d
docker compose ps
```

Compose starts PostgreSQL on port 5432 and Redis on port 6379. Its credentials are local development defaults. PostgreSQL data persists in a Docker volume.

## 2. Start the API

In a separate terminal, from the repository root:

```powershell
cd backend
mvn spring-boot:run
```

Wait for the application startup message. Flyway creates and validates the schema automatically; no separate schema or seed script is needed.

## 3. Load the Demo Dataset

In another terminal, from the repository root, validate the included snapshot first:

```powershell
$env:YOKATLAS_SNAPSHOT_PATH="database/snapshots/yokatlas-lisans-2026-05-16T11-16-07.841Z.json"
$env:YOKATLAS_IMPORT_MODE="plan"
node database/import_yokatlas_api.mjs
```

Then import it into the local database:

```powershell
$env:YOKATLAS_IMPORT_MODE="import"
$env:YOKATLAS_IMPORT_APPROVED="true"
node database/import_yokatlas_api.mjs
Remove-Item Env:YOKATLAS_IMPORT_APPROVED
Remove-Item Env:YOKATLAS_IMPORT_MODE
Remove-Item Env:YOKATLAS_SNAPSHOT_PATH
```

The included snapshot contains 223 universities, 12,265 programs and 46,853 yearly records. The importer creates a backup under `backups/`, then upserts data without truncating user or preference tables. Use a local development database.

The API may cache earlier empty results for up to five minutes. Restart the API after the first import to see the dataset immediately.

## 4. Start the Frontend

In a separate terminal, from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

| Service | Address |
| --- | --- |
| Application | http://localhost:5173 |
| API | http://localhost:8080 |
| API documentation | http://localhost:8080/swagger-ui/index.html |
| Health check | http://localhost:8080/actuator/health |

## Verification

From `backend/`, run `mvn test`. From `frontend/`, run `npm run build`.

For browser tests, keep both servers running on ports 8080 and 5173 with demo data imported, then run `npm run test:e2e` from `frontend/`. The suite uses Edge and includes an account-creation flow; use a development database. CI runs backend tests, the frontend build and dependency scanning, not browser E2E tests.

## Troubleshooting

- **Port conflict:** inspect `docker compose ps` and `Get-NetTCPConnection -State Listen`. Stop the conflicting development service or configure ports consistently. Browser tests expect the default ports.
- **Empty program list:** confirm the snapshot import succeeded and restart the API to clear cached responses.
- **Database startup failure:** inspect `docker compose logs postgres` and the backend output. Preserve the volume while investigating; `docker compose down -v` deletes the local database.
- **Frontend dependency errors:** check `node --version`, then run `npm ci` using the committed lockfile.

Stop infrastructure with `docker compose down`; this preserves the database volume.
