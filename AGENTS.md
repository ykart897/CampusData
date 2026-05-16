# Repository Guidelines

## Project Structure & Module Organization

This repository is a full-stack university atlas application. `backend/` contains the Spring Boot 3 API, Java 17 source under `src/main/java`, Flyway migrations under `src/main/resources/db/migration`, and tests under `src/test/java`. `frontend/` contains the React 18 + TypeScript + Vite app, with pages, layout, UI components, API clients, and formatting helpers under `src/`. `database/` contains Prisma reference schema and YOK Atlas snapshot/import utilities. `docs/` contains setup notes, and `backups/` stores database dumps created before imports.

## Build, Test, and Development Commands

Start infrastructure:

```powershell
docker compose up -d
```

Backend:

```powershell
cd backend
mvn spring-boot:run
mvn test
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
npm run build
```

YOK Atlas data workflow:

```powershell
$env:YOKATLAS_IMPORT_MODE="snapshot"
node database/import_yokatlas_api.mjs
```

Use `YOKATLAS_IMPORT_MODE=import` plus `YOKATLAS_IMPORT_APPROVED=true` only for approved PostgreSQL upserts.

Map data workflow:

```powershell
node database/preview_osm_nearby_places.mjs
node database/import_konya_map_data.mjs
```

Preview reads OSM/Overpass and prints JSON without writing to PostgreSQL. Import currently writes only the approved Konya pilot map data.

## Coding Style & Naming Conventions

Java uses package-based Spring conventions: controllers, services, repositories, DTO records, entities, and enums. Prefer explicit DTOs over returning entities from new endpoints. Keep Flyway migrations append-only using `V<number>__description.sql`. TypeScript uses strict React component files in PascalCase and helper modules in camelCase. Keep API types in `frontend/src/services/api.ts`.

## Testing Guidelines

Backend tests use JUnit/Spring Boot Test; current tests live in `backend/src/test/java`. Name test classes `*Test.java` and focus service tests on filtering, mapping, and edge cases. Run `mvn test` before backend changes and `npm run build` before frontend changes. Add tests when changing shared service behavior or import validation.

## Data Quality Rules

Use 2025 as the primary bachelor-program data year. Do not expose low-coverage fields as filters or main table columns. If a value is missing, hide that field instead of rendering `-`, `*`, or `Eksik`. Do not scrape, import, migrate, or write external YOK Atlas data without explicit user approval.

Map data is stored in `university_locations` and `nearby_places`; include `source`, `source_date`, `external_id`, and `distance_meters` for imported points. Treat OSM data as real but community-sourced, so expand city coverage through preview and review before DB writes.

## Commit & Pull Request Guidelines

No repository-specific commit convention is documented. Use concise imperative messages, for example `Add YOK Atlas snapshot upsert`. Pull requests should describe the behavior change, note database migrations, list verification commands, and include screenshots for visible frontend changes.

## Security & Configuration Tips

Do not commit real secrets, tokens, or database dumps with sensitive user data. Import scripts can change production-like data; always create a backup first and prefer snapshot/plan mode before import. Keep Docker credentials and environment-specific values outside tracked files.
