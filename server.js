import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Statik dosyaları kök dizinden sun
app.use(express.static(__dirname));

// Tüm istekleri index.html'e yönlendir (SPA desteği için, gerçi bu uygulama için şart değil ama zararı yok)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Sunucu http://0.0.0.0:${port} adresinde çalışıyor`);
});
