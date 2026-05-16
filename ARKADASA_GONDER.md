# Arkadasa Gonderme ve Calistirma

Bu zip, projeyi ayni gorunum ve ayni lisans verisiyle calistirmak icin hazirlanmistir.

## Gerekenler

- Docker Desktop
- Java JDK 17+
- Maven 3.8+
- Node.js 18+

## 1. Zip'i ac

Zip'i bir klasore ac ve terminali proje kok dizininde ac.

Ornek:

```powershell
cd "C:\Users\Kullanici\Desktop\universiteatlasi"
```

## 2. PostgreSQL ve Redis'i baslat

```powershell
docker compose up -d
```

## 3. Backend'i ilk kez baslat

Bu adim Flyway migration'larini calistirip veritabani tablolarini olusturur.

```powershell
cd backend
mvn spring-boot:run
```

Backend acildiktan sonra terminali kapatma. Yeni bir terminal acip proje kok dizinine don.

## 4. Lisans verisini iceri aktar

Bu komut zip icindeki hazir YOK Atlas snapshot'ini Docker PostgreSQL'e aktarir.

```powershell
cd "C:\Users\Kullanici\Desktop\universiteatlasi"
$env:YOKATLAS_IMPORT_MODE="import"
$env:YOKATLAS_IMPORT_APPROVED="true"
$env:YOKATLAS_SNAPSHOT_PATH="database/snapshots/yokatlas-lisans-2026-05-15T12-38-24.050Z.json"
node database/import_yokatlas_api.mjs
```

## 5. Frontend'i baslat

Yeni bir terminal ac:

```powershell
cd frontend
npm install
npm run dev
```

Frontend adresi:

```text
http://127.0.0.1:5173
```

Backend adresi:

```text
http://127.0.0.1:8080
```

## Notlar

- Zip icinde `node_modules`, `frontend/dist`, `backend/target`, `.git` ve IDE klasorleri yoktur. Bunlar kurulumda yeniden uretilir.
- Veriler bos gorunurse 4. adimdaki import komutunu tekrar calistir.
- Docker'da daha once ayni isimli eski veritabani varsa temiz baslamak icin once su komut kullanilabilir:

```powershell
docker compose down -v
docker compose up -d
```
