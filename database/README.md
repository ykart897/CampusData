# Data Tooling

The application schema is managed exclusively by [Flyway migrations](../backend/src/main/resources/db/migration). Migrations are append-only, including historical sample-data migrations required by existing databases.

Run tools from the repository root. See [local setup](../docs/SETUP.md) for the initial snapshot import.

| Tool | Purpose | Database writes |
| --- | --- | --- |
| `import_yokatlas_api.mjs` | Capture a snapshot, validate an import plan, or upsert program data | Only in approved `import` mode |
| `analyze_data_quality.mjs` | Query field coverage and regenerate `docs/VERI_KALITE_RAPORU.md` | No |
| `data_quality_checks.sql` | Inspect missing values and relational consistency | No |
| `preview_osm_nearby_places.mjs` | Query Overpass and print nearby places as JSON | No |
| `import_konya_map_data.mjs` | Replace nearby-place records for the fixed Konya pilot universities | Yes |

## Snapshot Policy

One demo snapshot is versioned: `snapshots/yokatlas-lisans-2026-05-16T11-16-07.841Z.json`. Its capture date is not the admissions year; the application's primary data year is 2025. This file lets a fresh checkout reproduce the demo without requesting new upstream data.

Other captures and database backups are ignored by Git. Review data quality and provenance before replacing the demo snapshot. Older captures remain recoverable from Git history. Removing them from the current tree does not reduce the size of existing Git history.

## Import Modes

- `snapshot` (default): obtains data and writes a JSON capture, without database changes.
- `plan`: prepares and validates an upsert plan without database changes. Set `YOKATLAS_SNAPSHOT_PATH` to use an existing capture without fetching data.
- `import`: requires `YOKATLAS_IMPORT_APPROVED=true`, creates a backup and applies the upsert.

See [map data workflow](../docs/MAP_DATA_PIPELINE.md) before running the separate Konya importer. It does not use the YOK Atlas approval variable or automatic backup workflow.
