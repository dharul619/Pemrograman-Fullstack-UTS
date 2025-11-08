// ==========================================
// Konfigurasi dan Elemen DOM
// ==========================================
const API_URL = "http://localhost:3000/api/media";
const moviesTableBody = document.getElementById("moviesTableBody");
const movieModal = new bootstrap.Modal(document.getElementById("movieModal"));
const movieForm = document.getElementById("movieForm");
const movieIdInput = document.getElementById("movieId");
const modalTitle = document.getElementById("movieModalLabel");
const saveButton = document.getElementById("saveButton");
const alertMessage = document.getElementById("alertMessage");

// ==========================================
// 1. READ (GET) - Mengambil Data
// ==========================================
async function fetchMovies() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Gagal memuat data film: " + response.statusText);
    }

    const movies = await response.json();
    renderMovies(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    moviesTableBody.innerHTML = `
      <tr><td colspan="5" class="text-center text-danger">
        Gagal terhubung ke API: ${error.message}
      </td></tr>`;
  }
}

// ==========================================
// 2. RENDER DATA KE TABEL
// ==========================================
function renderMovies(movies) {
  moviesTableBody.innerHTML = "";

  if (movies.length === 0) {
    moviesTableBody.innerHTML =
      '<tr><td colspan="5" class="text-center">Belum ada data film.</td></tr>';
    return;
  }

  movies.forEach((movie) => {
    const row = moviesTableBody.insertRow();
    row.insertCell().textContent = movie.id_media;
    row.insertCell().textContent = movie.judul;
    row.insertCell().textContent = movie.tahun_rilis;
    row.insertCell().textContent = movie.genre;

    const actionsCell = row.insertCell();

    // Tombol Edit
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-info me-2";
    editBtn.textContent = "Edit";
    editBtn.onclick = () =>
      prepareEdit(movie.id_media, movie.judul, movie.tahun_rilis, movie.genre);
    actionsCell.appendChild(editBtn);

    // Tombol Hapus
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Hapus";
    deleteBtn.onclick = () => deleteMovie(movie.id_media, movie.judul);
    actionsCell.appendChild(deleteBtn);
  });
}

// ==========================================
// 3. CREATE & UPDATE (POST & PUT)
// ==========================================
movieForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id_media = movieIdInput.value;
  const judul = document.getElementById("title").value;
  const tahun_rilis = document.getElementById("release_year").value;
  const genre = document.getElementById("genre").value;

  const method = id_media ? "PUT" : "POST";
  const url = id_media ? `${API_URL}/${id_media}` : API_URL;

  try {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, tahun_rilis, genre }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan data film.");
    }

    const actionText = id_media ? "diperbarui" : "ditambahkan";
    showAlert(`Film berhasil ${actionText}!`, "success");

    movieModal.hide();
    fetchMovies();
    movieForm.reset();
  } catch (error) {
    console.error("Error saat menyimpan film:", error);
    showAlert(`Gagal menyimpan film: ${error.message}`, "danger");
  }
});

// ==========================================
// 4. DELETE (DELETE)
// ==========================================
async function deleteMovie(id_media, judul) {
  if (!confirm(`Yakin ingin menghapus film "${judul}" (ID: ${id_media})?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id_media}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      showAlert(`Film "${judul}" berhasil dihapus.`, "warning");
      fetchMovies();
    } else if (response.status === 404) {
      showAlert(`Film dengan ID ${id_media} tidak ditemukan.`, "danger");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menghapus film.");
    }
  } catch (error) {
    console.error("Error saat menghapus film:", error);
    showAlert(`Gagal menghapus film: ${error.message}`, "danger");
  }
}

// ==========================================
// 5. MODAL HANDLER (CREATE & EDIT)
// ==========================================
function prepareCreate() {
  modalTitle.textContent = "Tambah Film Baru";
  saveButton.textContent = "Tambah";
  movieIdInput.value = "";
  movieForm.reset();
  movieModal.show();
}

function prepareEdit(id_media, judul, tahun_rilis, genre) {
  modalTitle.textContent = "Edit Data Film";
  saveButton.textContent = "Perbarui";
  movieIdInput.value = id_media;
  document.getElementById("title").value = judul;
  document.getElementById("release_year").value = tahun_rilis;
  document.getElementById("genre").value = genre;
  movieModal.show();
}

// ==========================================
// 6. ALERT HANDLER
// ==========================================
function showAlert(message, type) {
  alertMessage.textContent = message;
  alertMessage.className = `alert alert-${type}`;
  alertMessage.classList.remove("d-none");
  setTimeout(() => alertMessage.classList.add("d-none"), 3000);
}

// ==========================================
// 7. LOAD DATA SAAT HALAMAN DIMUAT
// ==========================================
document.addEventListener("DOMContentLoaded", fetchMovies);
