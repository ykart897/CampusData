# Arkadasa Gonderme ve Calistirma

Bu paket, projeyi ayni gorunum ve ayni lisans verisiyle calistirmak icin hazirlanmistir.

## Gerekenler

- Docker Desktop (acik olmali)
- Java JDK 17+
- Maven 3.8+
- Node.js 18+

## 1. Projeyi al

```powershell
git clone https://github.com/EnesCanbulat/CampusData.git
cd CampusData
```

(veya ZIP'i ac, klasore gir)

## 2. Postgres + Redis'i Docker ile baslat

```powershell
docker compose up -d
```

Bu komut sadece veritabani ve cache'i baslatir. Eger eski container'lar varsa once temizle:

```powershell
docker compose down -v
docker compose up -d
```

## 3. Backend'i baslat

Flyway migration'lari otomatik calisir (V1..V15). Sample data temizlenir.

```powershell
cd backend
mvn spring-boot:run
```

`Started UniversiteAtlasiApplication` yazisini gorunce backend hazirdir. Terminali kapatma.

## 4. Lisans verisini iceri aktar (yeni terminal)

```powershell
cd CampusData
$env:YOKATLAS_IMPORT_MODE="import"
$env:YOKATLAS_IMPORT_APPROVED="true"
$env:YOKATLAS_SNAPSHOT_PATH="database/snapshots/yokatlas-lisans-2026-05-16T11-16-07.841Z.json"
node database/import_yokatlas_api.mjs
```

Cikti: `Upserted and validated 12265 programs into Docker PostgreSQL` gormelisin.

## 5. Frontend'i baslat (yeni terminal)

```powershell
cd CampusData/frontend
npm install
npm run dev
```

Adresler:
- Frontend: http://localhost:5173
- Backend:  http://localhost:8080

## Sorun Giderme

### "Container name already in use"

```powershell
docker rm -f universiteatlasi-db universiteatlasi-redis
docker compose up -d
```

### "Imported program count does not match"

V15 migration calismamis veya eski sample data hala duruyor. Sifirla:

```powershell
docker compose down -v
docker compose up -d
# Sonra Adim 3'ten devam et
```

### "Sayfa bombos cikiyor"

Adim 4'u (veri import) yapmadigin icin DB bos. Import komutunu calistir.

### Java "TypeTag::UNKNOWN" hatasi (IntelliJ'de)

1. Settings > Plugins > "Lombok" ara, kur
2. Settings > Build > Compiler > Annotation Processors > **Enable annotation processing**
3. Invalidate Caches and Restart

### Port cakismasi

```powershell
netstat -ano | findstr "8080"
```

## Notlar

- `node_modules`, `target`, `dist`, `.idea` paket icinde yoktur. Kurulumda yeniden uretilir.
- `database/snapshots/*.json` paket icindedir (lisans verisi, ~60MB).
- Tum DB sema migration'lari otomatik calisir, elle SQL gerekmez.
- Tum 5 adim ilk kurulumda ~10-15 dakika surer.
