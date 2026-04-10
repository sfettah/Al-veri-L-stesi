# 🛒 Alışveriş Listesi

Bu uygulama, market alışverişlerinizi sevdiklerinizle gerçek zamanlı olarak paylaşmanıza ve senkronize etmenize olanak tanır. Tamamen statik bir web uygulamasıdır ve Firebase Firestore kullanır.

## Özellikler
- **Gerçek Zamanlı Senkronizasyon:** Bir cihazda yapılan değişiklik diğerinde anında görünür.
- **6 Haneli Kod:** Kolay paylaşım için her listeye benzersiz bir kod atanır.
- **Geçmiş Takibi:** Alınan ürünler tarihe göre gruplanmış şekilde saklanır.
- **Mobil Uyumlu:** Market reyonları arasında kolay kullanım için tasarlanmıştır.
- **Çevrimdışı Bellek:** Son eriştiğiniz listeler ana sayfada saklanır.

## Kurulum Adımları

### 1. Firebase Projesi Oluşturma
1. [Firebase Console](https://console.firebase.google.com/)'a gidin.
2. "Proje Ekle"ye tıklayın ve projenize bir isim verin.
3. Sol menüden **Firestore Database**'e gidin ve "Veritabanı Oluştur"a tıklayın.
4. "Test modunda başlat"ı seçin (veya kuralları aşağıdakine göre güncelleyin).
5. Proje ayarlarına gidin (dişli çark ikonu) ve bir "Web Uygulaması" ekleyin.
6. Size verilen `firebaseConfig` nesnesini kopyalayın.

### 2. Kodu Yapılandırma
1. `app.js` dosyasını açın.
2. `const firebaseConfig = { ... }` bölümündeki yer tutucu değerleri, kendi Firebase projenizden kopyaladığınız değerlerle değiştirin.

### 3. Firestore Kuralları
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

## GitHub Pages'e Yayınlama
1. Bu projeyi bir GitHub deposuna (repository) yükleyin.
2. Depo ayarlarına (Settings) gidin.
3. Sol menüden **Pages**'e tıklayın.
4. "Build and deployment" kısmında `main` branch'ini seçin ve kaydedin.
5. Birkaç dakika içinde uygulamanız `kullaniciadi.github.io/depo-adi` adresinde yayına girecektir.

## Teknik Detaylar
- **Dil:** Vanilla JavaScript (ES6+)
- **Veritabanı:** Firebase Firestore (Real-time SDK)
- **Tasarım:** Custom CSS (Mobile-first)
- **İkonlar:** Emoji
