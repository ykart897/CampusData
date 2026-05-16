-- V2 sample data ile YÖK Atlas snapshot'ı çakışıyor.
-- Snapshot import yapılmadan önce sample programları temizle.
-- Üniversitetler tablosu boş kalmasın diye sadece program tabloları temizlenir.
TRUNCATE lisans_yil_verileri, lisans_programlari RESTART IDENTITY CASCADE;

-- Sample üniversiteleri de temizle (snapshot import bunları YÖK Atlas verileriyle yeniden ekleyecek)
DELETE FROM universitetler WHERE id < 100000;
