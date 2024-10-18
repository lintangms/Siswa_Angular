const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const siswaRoutes = require('./routes/siswa');
const fileUpload = require('express-fileupload'); // Untuk menangani upload file
const cors = require('cors'); // Untuk mengizinkan CORS
const path = require('path'); // Untuk path
const fs = require('fs'); // Untuk mengelola sistem file

const app = express();
const PORT = 3000;

// Gunakan middleware CORS
app.use(cors());

// Middleware untuk parse JSON dan file upload
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Koneksi ke MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Ganti dengan password jika ada
  database: 'siswa_db'
});

// Koneksi ke database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Rute API untuk siswa
app.use('/api/siswa', siswaRoutes(db));

// Rute untuk upload foto
app.post('/api/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('Tidak ada file yang di-upload.');
  }

  const file = req.files.file; // Ambil file dari request

  // Tentukan path untuk menyimpan file
  const uploadPath = path.join(__dirname, 'uploads', file.name);

  // Simpan file ke folder uploads
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Kirim kembali path file sebagai respons
    res.json({ filePath: `http://localhost:${PORT}/uploads/${file.name}` });
  });
});

// Mulai server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
