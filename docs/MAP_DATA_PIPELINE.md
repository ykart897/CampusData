# Harita Veri Hattı

Bu yapı üniversite konumları ve yakın çevre noktaları için sürdürülebilir bir veri akışı sağlar.

## Mevcut Durum

- Frontend, Konya pilotu için statik fallback veri kullanır.
- Backend tarafında `GET /api/university/{id}/map` endpointi hazırdır.
- Veritabanında `university_locations` ve `nearby_places` tabloları Flyway migration ile tanımlanmıştır.
- Henüz otomatik DB import çalıştırılmaz; önce preview üretip kontrol etmek gerekir.

## Preview Üretimi

```bash
node database/preview_osm_nearby_places.mjs
```

Script:
- OpenStreetMap/Overpass verisini okur.
- Kafe, yemek, yurt, market, ulaşım ve kütüphane kategorilerini işler.
- Üniversiteye kuş uçuşu mesafeyi hesaplar.
- Kategori bazında en yakın kayıtları JSON olarak stdout’a yazar.
- Veritabanına yazmaz.

## Onaydan Sonra Import

Onaydan sonra import adımı ayrı hazırlanmalıdır:
- JSON preview doğrulanır.
- `university_locations` tablosuna üniversite konumu yazılır.
- `nearby_places` tablosuna yakın yerler `source`, `source_date`, `external_id`, `distance_meters` ile yazılır.
- Duplicate kontrolü `university_id + source + external_id` üzerinden yapılır.

## Veri Kalitesi

OSM verisi sentetik değildir, ancak topluluk kaynaklıdır. Bir nokta gerçek dünyada var olduğu halde OSM’de eksik, yanlış veya farklı etiketlenmiş olabilir. Üretime genişletmeden önce pilot şehirler manuel kontrol edilmelidir.
