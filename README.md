# Üniversite Atlası

Türkiye'deki üniversite adayları için lisans programlarını inceleme, filtreleme ve tercih listesi oluşturma platformu.

## Teknoloji Yığını

| Katman | Teknoloji |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, TanStack Table, Recharts |
| State/Data | Zustand, React Query, Axios |
| Backend | Spring Boot 3, Java 17, Maven |
| Veritabanı | PostgreSQL, Flyway |
| Cache | Redis |
| Auth | JWT, Spring Security, BCrypt |
| Dağıtım | Docker, Docker Compose, nginx |

## Modüller

- Üniversiteler: üniversite listesi ve detay sayfası
- Programlar: lisans program listesi, gelişmiş filtreler ve detay sayfası
- Tercih Sihirbazı: başarı sırasına göre lisans program eşleştirme
- Net Sihirbazı: puan hesaplama yardımcı ekranı
- Tercih Listem: kullanıcıya özel lisans tercih listeleri

## Hızlı Başlangıç (Docker ile)

Tüm sistem (Postgres + Redis + Backend + Frontend) tek komutla:

```powershell
docker compose up -d --build
```

Veri import (bir kerelik):

```powershell
$env:YOKATLAS_IMPORT_MODE="import"
$env:YOKATLAS_IMPORT_APPROVED="true"
$env:YOKATLAS_SNAPSHOT_PATH="database/snapshots/yokatlas-lisans-2026-05-16T11-16-07.841Z.json"
node database/import_yokatlas_api.mjs
```

Adresler:

- Frontend: `http://localhost`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

Detaylı kurulum: `ARKADASA_GONDER.md` dosyasına bakın.

## YÖK Atlas Verisini Yenileme

Canlı YÖK Atlas lisans verisi için önerilen akış önce snapshot almak, sonra doğrulanmış snapshot'ı onaylı import etmektir.

DB'ye dokunmadan küçük bir örnek snapshot almak için:

```powershell
$env:YOKATLAS_IMPORT_MODE="snapshot"
$env:YOKATLAS_MAX_PAGES_PER_SCORE="1"
node database/import_yokatlas_api.mjs
```

Tam snapshot almak için `YOKATLAS_MAX_PAGES_PER_SCORE` değişkenini kaldırın. Snapshot dosyaları `database/snapshots/` altına yazılır.

Doğrulanmış snapshot'ı Docker PostgreSQL'e kullanıcı/tercih verilerini silmeden upsert etmek için:

```powershell
$env:YOKATLAS_IMPORT_MODE="import"
$env:YOKATLAS_IMPORT_APPROVED="true"
$env:YOKATLAS_SNAPSHOT_PATH="database/snapshots/yokatlas-lisans-....json"
node database/import_yokatlas_api.mjs
```

Import işlemi açık onay değişkeni olmadan çalışmaz. Bu akış `kullanicilar`, `tercih_listeleri` ve `tercih_ogeleri` tablolarını silmez; üniversite, program ve yıllık verileri snapshot üzerinden upsert eder. Import sonunda üniversite, program, yıllık veri ve yetim kayıt kontrolleri otomatik yapılır.

## Şema Genişlemeleri

V11 sonrası şema, YÖK Atlas'ta bulunan ek alanlar için genişletildi:

- Program/kılavuz metadata alanları: il kodu, program grubu, birim türü, öğrenim türü, burs/ücret ham etiketleri.
- Yıllık yerleşme alanları: yıl kontenjanı, kayıt yaptıran, ek yerleşen, ek kayıt yaptıran.
- Değişken detay kategorileri için `yokatlas_program_detay_verileri` JSONB tablosu.

V14: Yurt dışı üniversitelerin şehir bilgisi düzeltmesi (BAKÜ, BİŞKEK, TİRAN vs.).
V15: Sample data temizliği (snapshot import çakışmasını önler).
