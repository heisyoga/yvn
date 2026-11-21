# Tutorial 2 — Setup CMS Portfolio berbasis Google Sheets

Panduan ini menyiapkan spreadsheet untuk CMS admin. Spreadsheet harus tetap **Restricted** dan hanya dibagikan ke service account backend. Aplikasi menyajikan konten portfolio tertentu ke publik, tetapi kredensial dan izin edit spreadsheet tidak boleh terekspos.

## 1. Prasyarat

- Deployment backend Node/Express yang dapat menyimpan environment variables privat.
- Google Cloud project dengan **Google Sheets API** aktif.
- Service account Google dengan file key JSON tersimpan aman di luar repository.
- Spreadsheet portfolio; catat ID dari URL `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
- Admin auth variables: `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`, `ADMIN_SESSION_SECRET`.

Jangan commit file service-account JSON, private key, password, TOTP seed, atau data pesan kontak.

## 2. Buat dan bagikan spreadsheet privat

1. Buat Google Spreadsheet baru.
2. Di Google Cloud Console, aktifkan **Google Sheets API** dan buat service account.
3. Buat key JSON service account; ambil `client_email` dan `private_key` lalu simpan credential di secret manager.
4. Share spreadsheet ke `client_email` service account dengan akses **Editor**.
5. Pastikan **General access = Restricted**. Jangan gunakan “Anyone with the link” atau “Publish to web”.
6. Masukkan environment variables backend berikut:

   ```text
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email service account>
   GOOGLE_PRIVATE_KEY=<private key PEM; escaped newlines \\n supported>
   GOOGLE_SHEET_ID=<ID spreadsheet>
   ```

Jangan memakai prefix `VITE_` untuk nilai rahasia.

## 3. Siapkan tab

Tab CMS akan dibuat otomatis oleh tombol **Isi spreadsheet kosong** jika belum tersedia. Anda boleh membuatnya manual dengan nama persis berikut (kapitalisasi harus sama), tetapi itu tidak wajib:

- `Profile`
- `Experiences`
- `Certificates`
- `Projects`
- `Skills`
- `Copy`
- `SEO`
- `Messages`

Untuk tujuh tab portfolio, baris header kolom A-C harus:

```text
locale | id | data
```

Untuk tab `Messages`, gunakan header:

```text
id | submittedAt | name | email | purpose | subject | message | status
```

Aplikasi membaca dan menulis kolom A:C pada tab konten serta A:H pada tab pesan. Inisialisasi aman berjalan jika tab benar-benar kosong atau baru berisi header `locale`; baris header saja tidak dianggap sebagai data.

## 4. Isi tabel portfolio yang masih kosong

Jika tab konten baru kosong, jangan isi setiap baris secara manual. Cara paling aman adalah memakai inisialisasi admin yang menyalin konten bawaan kode sebagai data awal, lengkap untuk bahasa `id`, `en`, `ja`, `ko`, dan `zh-CN`.

1. Jalankan aplikasi lokal dengan environment backend terisi:

   ```bash
   npm ci
   npm run dev
   ```

2. Buka `http://localhost:3000/_gate` dan masuk dengan password admin serta kode authenticator terkini.
3. Di **Content Studio**, klik **Isi spreadsheet kosong**.
4. Aplikasi otomatis membuat tab CMS yang belum ada, lalu mengisi konten awal hanya jika tab konten baru kosong atau baru berisi header. Jika ada tab konten yang sudah memiliki baris data, operasi ditolak agar data tersebut tidak tertimpa. Tab lama `Portfolio` tidak dipakai pada setup baru dan tidak perlu diisi.
5. Klik **Muat Ulang**, pastikan profil, proyek, pengalaman, sertifikat, keahlian, teks antarmuka, dan SEO termuat.
6. Periksa Google Sheets. Tab akan berisi baris dengan kolom `locale`, `id`, dan `data`; kolom data menyimpan objek konten JSON.

Jika spreadsheet berasal dari tutorial pertama dan tab `Portfolio` lama berisi JSON, gunakan **Migrasi data lama**. Tab CMS yang belum ada akan dibuat otomatis. Migrasi tidak menghapus tab `Portfolio` lama dan hanya berjalan bila tab CMS belum berisi data. Setelah migrasi, verifikasi isi seluruh bahasa sebelum deployment.

## 5. Gunakan CMS CRUD

1. Pilih locale: `id`, `en`, `ja`, `ko`, atau `zh-CN`.
2. Pilih bagian di sidebar: Profil, Pengalaman, Sertifikat, Proyek, Keahlian, Teks Antarmuka, atau SEO.
3. Untuk koleksi, pilih item untuk mengedit, **Tambah item** untuk membuat, atau **Hapus item** untuk menghapus. Penghapusan meminta konfirmasi.
4. Editor menampilkan objek JSON satu item (atau objek profil/copy/SEO). Edit isi objek, lalu klik **Simpan Perubahan**.
5. Untuk foto profil dan thumbnail, gunakan URL HTTPS publik yang dapat diakses browser. Spreadsheet tetap privat; file gambar/URL yang dimasukkan memang ditampilkan pada halaman publik.
6. Setelah save sukses, buka situs publik dan periksa versi bahasa serta konten yang berubah.

> Catatan: CMS menyediakan CRUD untuk entitas dan bagian utama. Bentuk objek tetap memakai editor JSON per item; untuk daftar bertingkat (roles, highlights, tech stack, copy bersarang), edit array/objek di dalam editor dengan sintaks JSON yang valid. Jangan mengubah `id` item yang sudah dipakai tanpa alasan karena ID digunakan untuk memilih dan memperbarui entitas.

## 6. Verifikasi dan pemulihan

- `GET /api/portfolio` membaca tab baru dan menyimpan cache server selama 60 detik; penyimpanan melalui admin memperbarui cache segera.
- Pesan kontak tetap ada di tab `Messages` dan dapat dibaca/diubah statusnya dari admin.
- Chatbot dan validasi pilihan tujuan kontak menggunakan konten portfolio yang dimuat dari Sheets.
- Jika tab kosong/tidak valid, endpoint publik menyajikan fallback konten bawaan. Admin menampilkan tindakan inisialisasi atau migrasi.
- Sebelum perubahan besar, buat salinan spreadsheet melalui **File → Make a copy**. Jangan hapus tab lama `Portfolio` sampai migrasi dan pemeriksaan production selesai.
- Uji login, inisialisasi/migrasi, CRUD item, perubahan publik, inbox kontak, serta akses endpoint admin tanpa sesi (harus ditolak).

## 7. Batas data yang tetap di kode

Aturan autentikasi, otorisasi, CSRF, rate limit, validasi keamanan, guardrail chatbot, dan logika aplikasi tetap dikelola di kode. CMS mengelola konten portfolio, bukan mengubah aturan keamanan.
