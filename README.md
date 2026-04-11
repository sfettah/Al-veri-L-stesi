# 🛒 Alışveriş Listesi

Bu uygulama, market alışverişlerinizi sevdiklerinizle gerçek zamanlı olarak paylaşmanıza ve senkronize etmenize olanak tanır. Tamamen statik bir web uygulamasıdır ve Firebase Firestore kullanır.

## Özellikler
- **Gerçek Zamanlı Senkronizasyon:** Bir cihazda yapılan değişiklik diğerinde anında görünür.
- **6 Haneli Kod:** Kolay paylaşım için her listeye benzersiz bir kod atanır.
- **Geçmiş Takibi:** Alınan ürünler tarihe göre gruplanmış şekilde saklanır.
- **Mobil Uyumlu:** Kolay kullanım için tasarlanmıştır.
- **Çevrimdışı Bellek:** Son eriştiğiniz listeler ana sayfada saklanır.


 Firestore Kuralları
Firestore güvenliği için aşağıdaki kuralları "Rules" sekmesine yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lists/{listId} {
      allow read, write: if true; // Geliştirme aşaması için. Üretim için yetkilendirme ekleyin.
    }
  }
}
```


## Teknik Detaylar
- **Dil:** Vanilla JavaScript (ES6+)
- **Veritabanı:** Firebase Firestore (Real-time SDK)
- **Tasarım:** Custom CSS (Mobile-first)
