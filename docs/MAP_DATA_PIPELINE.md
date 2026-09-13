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

Mevcut `database/import_konya_map_data.mjs` script'i sabit Konya pilot verisini aktarır. Preview çıktısını otomatik okumaz; kaynak kodundaki üniversite kimlikleri ve noktalar hedef veritabanıyla karşılaştırılmalıdır.

Script, pilot üniversitelerin `nearby_places` kayıtlarını silip yeniden ekler ve `university_locations` kayıtlarını günceller. İşlem tek transaction içinde çalışır. YÖK Atlas import aracından farklı olarak otomatik yedek veya onay değişkeni kontrolü yoktur; çalıştırmadan önce yedek alın ve veriyi inceleyin.

```powershell
node database/import_konya_map_data.mjs
```

Konumlar `source`, `source_date`, `external_id` ve `distance_meters` bilgileriyle saklanır. Yeni şehirler için önce preview ve kaynak doğrulaması yapılmalıdır.

## Veri Kalitesi

OSM verisi sentetik değildir, ancak topluluk kaynaklıdır. Bir nokta gerçek dünyada var olduğu halde OSM’de eksik, yanlış veya farklı etiketlenmiş olabilir. Üretime genişletmeden önce pilot şehirler manuel kontrol edilmelidir.
