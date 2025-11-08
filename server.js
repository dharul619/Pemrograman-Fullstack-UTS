const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const port = 3000;
const db = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_movie",
  })
  .promise(); // Mengaktifkan promise untuk penggunaan async/await
app.use(cors());
app.use(express.json());
// ... (Lanjutan kode API)

// GET /api/media: Mengambil SEMUA movie
app.get("/api/media", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM media");
    res.status(200).json(rows); // 'rows' berisi data dari tabel
  } catch (error) {
    res.status(500).json({ message: "Kesalahan Server" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// GET /api/media/:id: Mengambil movie berdasarkan ID
app.get("/api/media/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM media WHERE id_media = ?", [
      req.params.id,
    ]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: "media tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ message: "Kesalahan Server" });
  }
});

/// POST /api/media: Menambahkan data media baru
app.post("/api/media", async (req, res) => {
  const { judul, tahun_rilis, genre } = req.body;

  // Validasi input
  if (!judul || !tahun_rilis || !genre) {
    return res
      .status(400)
      .json({ message: "Judul, tahun_rilis, dan genre harus diisi" });
  }

  try {
    // Query dengan parameter untuk mencegah SQL Injection
    const sql =
      "INSERT INTO media (judul, tahun_rilis, genre) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [judul, tahun_rilis, genre]);

    // Ambil ID media baru
    const newMediaId = result.insertId;
    const newMedia = { id_media: newMediaId, judul, tahun_rilis, genre };

    // Kirim respon sukses
    res.status(201).json(newMedia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Kesalahan Server" });
  }
});

// PUT /api/media/:id: Memperbarui seluruh data media
app.put("/api/media/:id", async (req, res) => {
  const id = req.params.id;
  const { judul, tahun_rilis, genre } = req.body;

  // Validasi input
  if (!judul || !tahun_rilis || !genre) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  try {
    // Update data media berdasarkan id_media
    const sql =
      "UPDATE media SET judul = ?, tahun_rilis = ?, genre = ? WHERE id_media = ?";
    const [result] = await db.query(sql, [judul, tahun_rilis, genre, id]);

    // Cek apakah ID ditemukan
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Media tidak ditemukan untuk diperbarui" });
    }

    // Data hasil pembaruan
    const updatedMedia = {
      id_media: parseInt(id),
      judul,
      tahun_rilis,
      genre,
    };

    res.status(200).json(updatedMedia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Kesalahan Server" });
  }
});

// DELETE /api/media/:id: Menghapus data media berdasarkan ID
app.delete("/api/media/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Hapus data berdasarkan id_media
    const [result] = await db.query("DELETE FROM media WHERE id_media = ?", [
      id,
    ]);

    // Jika tidak ada baris yang dihapus, berarti ID tidak ditemukan
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Media tidak ditemukan untuk dihapus" });
    }

    // Jika berhasil dihapus, kirim status 204 (No Content)
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Kesalahan Server" });
  }
});
