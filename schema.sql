-- YÖKAtlas Sonuçları - PostgreSQL Schema
-- Encoding: UTF-8

CREATE TABLE IF NOT EXISTS universities (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS programs (
    id                SERIAL PRIMARY KEY,
    university_id     INT  NOT NULL REFERENCES universities(id),
    faculty           TEXT NOT NULL,
    name              TEXT NOT NULL,
    language          TEXT NOT NULL,
    scholarship_type  TEXT,          -- NULL = devlet üniversitesi
    duration_years    SMALLINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_programs_university ON programs(university_id);
CREATE INDEX IF NOT EXISTS idx_programs_name       ON programs(name);
CREATE INDEX IF NOT EXISTS idx_programs_language   ON programs(language);

CREATE TABLE IF NOT EXISTS yearly_stats (
    id             SERIAL PRIMARY KEY,
    program_id     INT     NOT NULL REFERENCES programs(id),
    year           SMALLINT NOT NULL,
    success_rank   INT,             -- NULL = Dolmadı
    base_score     NUMERIC(10, 5),  -- NULL = Dolmadı
    UNIQUE (program_id, year)
);

CREATE INDEX IF NOT EXISTS idx_yearly_stats_program ON yearly_stats(program_id);
CREATE INDEX IF NOT EXISTS idx_yearly_stats_year    ON yearly_stats(year);
CREATE INDEX IF NOT EXISTS idx_yearly_stats_rank    ON yearly_stats(success_rank);
