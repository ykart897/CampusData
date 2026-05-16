# Arkadasa Gonderme ve Calistirma

Tum sistem (Postgres + Redis + Backend + Frontend) **Docker icinde** calisir.
Makinede sadece **Docker Desktop** + **Node.js** gerekir.

## Gerekenler

- Docker Desktop (acik olmali)
- Node.js 18+ (sadece bir kerelik veri import icin)

> Java, Maven, npm kurulu olmasi gerekmez. Hepsi Docker icinde.

## 1. Projeyi al

```powershell
git clone https://github.com/EnesCanbulat/CampusData.git
cd CampusData
```

(veya ZIP'i ac, klasore gir)

## 2. Tum sistemi tek komutla baslat

```powershell
docker compose up -d --build
```

Bu komut:
- Postgres + Redis indirir, baslatir
- Backend'i derler (Maven build, ~3 dk ilk seferde)
- Frontend'i derler (npm install + vite build, ~2 dk ilk seferde)
- Flyway migration'lari calistirir (V1..V15)
- Hepsini sirayla saglik kontrolu ile baslatir

Ilerlemeyi izle:

```powershell
docker compose logs -f
```

`Started UniversiteAtlasiApplication` yazisini gorunce backend hazirdir.

## 3. Lisans verisini iceri aktar (bir kerelik)

```powershell
$env:YOKATLAS_IMPORT_MODE="import"
$env:YOKATLAS_IMPORT_APPROVED="true"
$env:YOKATLAS_SNAPSHOT_PATH="database/snapshots/yokatlas-lisans-2026-05-16T11-16-07.841Z.json"
node database/import_yokatlas_api.mjs
```

Cikti: `Upserted and validated 12265 programs` gormelisin.

## 4. Tarayicida ac

- Frontend: http://localhost
- Backend API: http://localhost:8080
- Backend saglik: http://localhost:8080/actuator/health

## Yonetim Komutlari

```powershell
docker compose stop          # Durdur (veri korunur)
docker compose start         # Tekrar baslat
docker compose down          # Container'lari sil (veri korunur)
docker compose down -v       # HER SEYI sil (veri dahil)
docker compose logs -f       # Tum loglari izle
docker compose logs -f backend   # Sadece backend loglari
docker compose ps            # Calisan servisleri goster
docker compose up -d --build # Kod degisikligi sonrasi yeniden insa et
```

## Sorun Giderme

### Container baslatilamiyor: port cakismasi

```powershell
netstat -ano | findstr "80 8080 5432 6379"
```

O portu kullanan baska uygulamayi kapat veya `docker-compose.yml`'da portu degistir.

### Veriler bos gorunuyor

Adim 3'u (import) calistirdin mi? Calistirdiysan tekrar et.

### "Imported program count does not match"

```powershell
docker compose down -v
docker compose up -d --build
# Sonra adim 3'u tekrar et
```

### Backend bashlatma hatasi

```powershell
docker compose logs backend | Select-Object -Last 50
```

### Tum sistemi sifirla

```powershell
docker compose down -v
docker system prune -f
docker compose up -d --build
```

## Notlar

- Ilk `docker compose up --build` ~5-8 dk surer (image build).
- Sonraki baslamalar ~30 sn.
- Kod degistirirseniz `docker compose up -d --build` yeniden insa eder.
- Veriler `postgres_data` volume'unde kalir, container silinse de bozulmaz.
- Backend Dockerfile multi-stage build kullanir: build asamasinda Maven, runtime'da sadece JRE → kucuk image.
- Frontend Dockerfile da multi-stage: Node ile build, nginx ile servis.
