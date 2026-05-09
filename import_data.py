"""
YÖKAtlas Excel verisini PostgreSQL'e aktarır.

Kullanım:
    pip install pandas openpyxl psycopg2-binary
    python import_data.py --file yokatlas_sonuclar.xlsx --dsn "postgresql://user:pass@localhost/campusdata"
"""

import argparse
import re
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values


YEARS = [2022, 2023, 2024, 2025]

COL_UNIVERSITY   = 0
COL_FACULTY      = 1
COL_PROGRAM      = 2
COL_LANGUAGE     = 3
COL_SCHOLARSHIP  = 4
COL_DURATION     = 5
COL_RANK_BASE    = 6   # ranks: cols 6-9 (2025..2022)
COL_SCORE_BASE   = 10  # scores: cols 10-13 (2025..2022)


def parse_duration(val: str) -> int:
    match = re.search(r"\d+", str(val))
    return int(match.group()) if match else 4


def parse_int(val) -> int | None:
    if pd.isna(val) or str(val).strip().lower() in ("dolmadı", "dolmadi", "-", ""):
        return None
    try:
        return int(str(val).replace(".", "").replace(",", ""))
    except ValueError:
        return None


def parse_float(val) -> float | None:
    if pd.isna(val) or str(val).strip().lower() in ("dolmadı", "dolmadi", "-", ""):
        return None
    try:
        return float(str(val).replace(",", "."))
    except ValueError:
        return None


def load_excel(path: str) -> pd.DataFrame:
    df = pd.read_excel(path, sheet_name=0, dtype=str)
    df = df.where(pd.notna(df), None)
    return df


def import_data(df: pd.DataFrame, conn):
    cur = conn.cursor()

    # ── 1. universities ──────────────────────────────────────────────────────
    universities = df.iloc[:, COL_UNIVERSITY].dropna().unique()
    execute_values(
        cur,
        "INSERT INTO universities (name) VALUES %s ON CONFLICT (name) DO NOTHING",
        [(u,) for u in universities],
    )
    conn.commit()

    cur.execute("SELECT id, name FROM universities")
    uni_map = {name: uid for uid, name in cur.fetchall()}

    # ── 2. programs ──────────────────────────────────────────────────────────
    program_rows = []
    for _, row in df.iterrows():
        uni_id       = uni_map[row.iloc[COL_UNIVERSITY]]
        faculty      = row.iloc[COL_FACULTY]
        prog_name    = row.iloc[COL_PROGRAM]
        language     = row.iloc[COL_LANGUAGE]
        scholarship  = row.iloc[COL_SCHOLARSHIP]   # None for state unis
        duration     = parse_duration(row.iloc[COL_DURATION])
        program_rows.append((uni_id, faculty, prog_name, language, scholarship, duration))

    execute_values(
        cur,
        """
        INSERT INTO programs (university_id, faculty, name, language, scholarship_type, duration_years)
        VALUES %s
        RETURNING id
        """,
        program_rows,
    )
    program_ids = [r[0] for r in cur.fetchall()]
    conn.commit()

    # ── 3. yearly_stats ──────────────────────────────────────────────────────
    stat_rows = []
    for prog_id, (_, row) in zip(program_ids, df.iterrows()):
        for i, year in enumerate(reversed(YEARS)):   # cols ordered 2025→2022
            rank  = parse_int(row.iloc[COL_RANK_BASE  + (3 - i)])
            score = parse_float(row.iloc[COL_SCORE_BASE + (3 - i)])
            stat_rows.append((prog_id, year, rank, score))

    execute_values(
        cur,
        """
        INSERT INTO yearly_stats (program_id, year, success_rank, base_score)
        VALUES %s
        ON CONFLICT (program_id, year) DO NOTHING
        """,
        stat_rows,
    )
    conn.commit()
    cur.close()

    print(f"✓ {len(universities)} üniversite")
    print(f"✓ {len(program_rows)} program")
    print(f"✓ {len(stat_rows)} yıllık istatistik")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True, help="Excel dosyasının yolu")
    parser.add_argument(
        "--dsn",
        default="postgresql://postgres:postgres@localhost:5432/campusdata",
        help="PostgreSQL bağlantı dizesi",
    )
    args = parser.parse_args()

    print(f"Excel okunuyor: {args.file}")
    df = load_excel(args.file)
    print(f"  → {len(df)} satır yüklendi")

    print(f"PostgreSQL'e bağlanılıyor: {args.dsn}")
    conn = psycopg2.connect(args.dsn)

    print("Şema oluşturuluyor...")
    with open("schema.sql", "r", encoding="utf-8") as f:
        conn.cursor().execute(f.read())
    conn.commit()

    print("Veri aktarılıyor...")
    import_data(df, conn)
    conn.close()
    print("Tamamlandı.")


if __name__ == "__main__":
    main()
