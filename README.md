# CampusData

YÖKAtlas üniversite program verilerini PostgreSQL veritabanına aktaran araç.

## Veri İçeriği

- **5.652 program** (2022–2025 yılları)
- **4 üniversite türü dili** (Türkçe, İngilizce, Fransızca, Almanca)
- Her program için yıllık **taban başarı sırası** ve **taban puan**

## Veritabanı Şeması

```
universities
  id, name

programs
  id, university_id → universities
  faculty, name, language, scholarship_type, duration_years

yearly_stats
  id, program_id → programs
  year, success_rank, base_score
```

`scholarship_type` devlet üniversitelerinde `NULL`'dur; özel üniversitelerde `Burslu`, `%50 İndirimli`, `%25 İndirimli` veya `Ücretli` değerlerini alır.

`success_rank` ve `base_score` programın o yıl dolmadığı durumlarda `NULL`'dur.

## Kurulum

### 1. Gereksinimler

```bash
pip install pandas openpyxl psycopg2-binary
```

### 2. Veritabanı oluştur

```sql
CREATE DATABASE campusdata;
```

### 3. Veriyi aktar

```bash
python import_data.py \
  --file yokatlas_sonuclar.xlsx \
  --dsn "postgresql://kullanici:sifre@localhost:5432/campusdata"
```

Şema otomatik oluşturulur, veri tek seferde aktarılır.

## Örnek Sorgular

```sql
-- En yüksek puanlı 10 program (2025)
SELECT u.name AS universite, p.name AS program, s.base_score
FROM yearly_stats s
JOIN programs p ON p.id = s.program_id
JOIN universities u ON u.id = p.university_id
WHERE s.year = 2025
ORDER BY s.base_score DESC
LIMIT 10;

-- Burslu İngilizce programlar
SELECT u.name, p.faculty, p.name, s.success_rank
FROM programs p
JOIN universities u ON u.id = p.university_id
JOIN yearly_stats s ON s.program_id = p.id
WHERE p.scholarship_type = 'Burslu'
  AND p.language = 'İngilizce'
  AND s.year = 2025
ORDER BY s.success_rank;

-- Puan trendi (2022-2025)
SELECT s.year, AVG(s.base_score) AS ort_puan, COUNT(*) AS program_sayisi
FROM yearly_stats s
GROUP BY s.year
ORDER BY s.year;
```
