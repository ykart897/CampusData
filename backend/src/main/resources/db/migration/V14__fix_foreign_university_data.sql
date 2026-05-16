-- Yurt dışı üniversitelerin şehir bilgisi düzeltmesi
-- BILINMIYOR olarak işaretlenmiş 6 üniversitenin gerçek şehirleri (üniversite adındaki bilgiden)
UPDATE universitetler SET sehir = 'BAKÜ'        WHERE id = 301240 AND sehir = 'BILINMIYOR';
UPDATE universitetler SET sehir = 'TÜRKİSTAN'   WHERE id = 202953 AND sehir = 'BILINMIYOR';
UPDATE universitetler SET sehir = 'BİŞKEK'      WHERE id = 202954 AND sehir = 'BILINMIYOR';
UPDATE universitetler SET sehir = 'TİRAN'       WHERE id = 474572 AND sehir = 'BILINMIYOR';
UPDATE universitetler SET sehir = 'ÜSKÜP'       WHERE id = 301255 AND sehir = 'BILINMIYOR';
UPDATE universitetler SET sehir = 'SARAYBOSNA'  WHERE id = 301253 AND sehir = 'BILINMIYOR';

-- KKTC üniversitelerini ayrı bölge olarak işaretle (YURT_DISI'dan KIBRIS'a)
UPDATE universitetler SET bolge = 'KIBRIS' WHERE sehir = 'KIBRIS' AND bolge = 'YURT_DISI';
