# Alışveriş Listesi

Bu uygulama, market alışverişlerinizi sevdiklerinizle gerçek zamanlı olarak paylaşmanıza ve senkronize etmenize olanak tanır. Tamamen statik bir web uygulamasıdır ve Firebase Firestore kullanır.

## Özellikler

- **Gerçek Zamanlı Senkronizasyon:** Bir cihazda yapılan değişiklik diğerinde anında görünür.
- **6 Haneli Kod:** Kolay paylaşım için her listeye benzersiz bir kod atanır.
- **Geçmiş Takibi:** Alınan ürünler tarihe göre gruplanmış şekilde saklanır.
- **Mobil Uyumlu:** Kolay kullanım için tasarlanmıştır.
- **Çevrimdışı Bellek:** Son eriştiğiniz listeler ana sayfada saklanır.

## Nasıl Çalışır

1. Bir kullanıcı yeni bir liste oluşturur ve listeye otomatik olarak 6 haneli benzersiz bir kod atanır.
2. Bu kod, listeyi paylaşmak istediğiniz kişiyle (örneğin eşinizle) paylaşılır.
3. Diğer kullanıcı kodu girerek aynı listeye erişir ve markette ürünleri alındı olarak işaretleyebilir.
4. Tüm değişiklikler her iki cihazda da anlık olarak senkronize edilir.
5. Alınan ürünler listenin geçmişine tarihleriyle birlikte kaydedilir.

## Kurulum

### 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin.
2. "Proje Ekle" butonuna tıklayın ve projenize bir isim verin.
3. Sol menüden **Firestore Database** bölümüne gidin ve "Veritabanı Oluştur" seçeneğine tıklayın.
4. Konum olarak `eur3 (europe-west)` seçin ve "Test modunda başlat" seçeneğini işaretleyin.
5. Proje ayarlarına (dişli çark ikonu) gidin ve bir "Web Uygulaması" ekleyin.
6. Size sunulan `firebaseConfig` nesnesini kopyalayın.

### 2. Kodu Yapılandırma

1. `app.js` dosyasını açın.
2. `const firebaseConfig = { ... }` bölümündeki yer tutucu değerleri, kendi Firebase projenizden kopyaladığınız değerlerle değiştirin.

### 3. Firestore Güvenlik Kuralları

Firestore güvenliği için aşağıdaki kuralları "Rules" sekmesine yapıştırın:
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /lists/{listId} {
allow read, write: if true;
}
}
}

> Not: Bu kurallar geliştirme aşaması içindir. Üretim ortamı için yetkilendirme eklemeniz önerilir.

## GitHub Pages'e Yayınlama

1. Projeyi bir GitHub deposuna yükleyin.
2. Depo ayarlarına (Settings) gidin.
3. Sol menüden **Pages** sekmesine tıklayın.
4. "Build and deployment" kısmında kaynak olarak `main` branch'ini seçin ve kaydedin.
5. Birkaç dakika içinde uygulamanız `kullaniciadi.github.io/depo-adi` adresinde yayına girecektir.

## Teknik Detaylar

- **Dil:** Vanilla JavaScript (ES6+)
- **Veritabanı:** Firebase Firestore (Real-time SDK)
- **Tasarım:** Custom CSS (Mobile-first)
- **Barındırma:** GitHub Pages

## Dosya Yapısı
.
├── index.html      # Ana HTML dosyası
├── style.css       # Stil dosyası
├── app.js          # Uygulama mantığı ve Firebase entegrasyonu
└── README.md       # Bu dosya

## Lisans

Bu proje kişisel kullanım için geliştirilmiştir.
