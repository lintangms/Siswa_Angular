const express = require('express');
const path = require('path');

module.exports = (db) => {
  const router = express.Router();

  // CREATE siswa
  router.post('/', (req, res) => {
    const { nama_siswa, kelas, umur, tanggal_lahir, alamat, jenis_kelamin } = req.body;

    // Ambil foto dari request
    const fotoPath = req.files?.foto ? req.files.foto.name : null; // Mendapatkan nama foto jika ada

    // Simpan data siswa dengan foto
    const query = `
      INSERT INTO siswa (nama_siswa, kelas, umur, tanggal_lahir, alamat, jenis_kelamin, foto) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [nama_siswa, kelas, umur, tanggal_lahir, alamat, jenis_kelamin, fotoPath], (err, result) => {
      if (err) return res.status(500).send(err);
      
      // Simpan file foto ke folder uploads
      if (req.files?.foto) {
        const uploadPath = path.join(__dirname, '../uploads', req.files.foto.name);
        req.files.foto.mv(uploadPath, (err) => {
          if (err) return res.status(500).send(err);
          
          res.status(201).json({
            idsiswa: result.insertId,
            nama_siswa,
            kelas,
            umur,
            tanggal_lahir,
            alamat,
            jenis_kelamin,
            foto: `http://localhost:3000/uploads/${req.files.foto.name}` // URL foto
          });
        });
      } else {
        res.status(201).json({
          idsiswa: result.insertId,
          nama_siswa,
          kelas,
          umur,
          tanggal_lahir,
          alamat,
          jenis_kelamin,
          foto: null // Jika tidak ada foto
        });
      }
    });
  });

  // READ semua siswa
  router.get('/', (req, res) => {
    const query = 'SELECT * FROM siswa';
    db.query(query, (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    });
  });

  // UPDATE siswa
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nama_siswa, kelas, umur, tanggal_lahir, alamat, jenis_kelamin } = req.body;

    // Ambil foto dari request
    const fotoPath = req.files?.foto ? req.files.foto.name : null; // Mendapatkan nama foto jika ada

    // Update data siswa dengan foto
    const query = `
      UPDATE siswa 
      SET nama_siswa = ?, kelas = ?, umur = ?, tanggal_lahir = ?, alamat = ?, jenis_kelamin = ?, foto = ? 
      WHERE idsiswa = ?
    `;
    db.query(query, [nama_siswa, kelas, umur, tanggal_lahir, alamat, jenis_kelamin, fotoPath, id], (err, result) => {
      if (err) return res.status(500).send(err);

      // Simpan file foto ke folder uploads jika ada
      if (req.files?.foto) {
        const uploadPath = path.join(__dirname, '../uploads', req.files.foto.name);
        req.files.foto.mv(uploadPath, (err) => {
          if (err) return res.status(500).send(err);
        });
      }

      res.json({ idsiswa: id, nama_siswa, kelas, umur, tanggal_lahir, alamat, jenis_kelamin, foto: fotoPath });
    });
  });

  // DELETE siswa
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM siswa WHERE idsiswa = ?';
    db.query(query, [id], (err, result) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(204);
    });
  });

  return router;
};
