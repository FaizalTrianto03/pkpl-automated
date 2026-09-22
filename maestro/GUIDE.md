# Panduan Maestro — Automation Mobile (Android)

Folder ini berisi automation test **aplikasi mobile** pakai [Maestro](https://maestro.mobile.dev/).
Maestro adalah tool UI automation untuk Android & iOS: kita menulis langkah test dalam file
**YAML** (bukan kode program), lalu Maestro yang menjalankannya di emulator/perangkat.

Kalau di web kita pakai **Cypress**, di mobile padanannya **Maestro** — lihat
[`../cypress/GUIDE.md`](../cypress/GUIDE.md) untuk membandingkan keduanya.

---

## 1. Cara Kerja Singkat

| | Cypress | Maestro |
| --- | --- | --- |
| Ditulis pakai | JavaScript | YAML |
| Selector | CSS selector | Teks / `id` |
| Menunggu elemen | Otomatis (retry) | Otomatis (retry), kecuali saat tap pertama |
| Butuh server | Tidak | Tidak |
| Butuh driver terpisah | Tidak | Tidak |

Satu file YAML = **satu test case**. Di dalamnya ada daftar langkah yang dijalankan berurutan
dari atas ke bawah.

---

## 2. Struktur Folder

```
maestro/
├── GUIDE.md                    ← dokumen ini
├── config.yaml                 ← appId default + daftar flow
└── flows/
    ├── 00_cek_koneksi.yaml     ← TC-APP-000: cek emulator & Maestro (pakai Settings)
    └── 01_home_menu.yaml       ← TC-APP-001: contoh test case aplikasi MiLab2
```

> **Soal nama folder — sering bikin bingung, jadi dibahas di sini.**
>
> Konvensi resmi Maestro adalah **`.maestro/`** (pakai titik di depan), di situ biasanya
> ditaruh `config.yaml`. Tapi nama folder itu **bukan keharusan** — yang wajib hanya:
>
> 1. ada file bernama persis **`config.yaml`** di folder yang ditunjuk ke Maestro,
> 2. file flow `.yaml` berada di lokasi yang tercakup pola `flows:` di config.
>
> Repo ini sengaja memakai **`maestro/`** (tanpa titik) supaya **sejajar dengan `cypress/`**.
> Jadi struktur repo terlihat simetris: `cypress/` untuk web, `maestro/` untuk mobile.

### Kenapa semua flow harus ada di dalam `flows/`

`maestro/config.yaml` berisi:

```yaml
flows:
  - "flows/**"
```

Pola `flows/**` artinya **"semua file di dalam folder `flows/`, sampai ke sub-folder"**.
File yang diletakkan langsung di `maestro/` (satu level di atas `flows/`) **tidak akan
terdeteksi** saat menjalankan `maestro test maestro\`. Pelajaran praktisnya: **selalu
simpan flow di dalam `flows/`.**

---

## 3. Prasyarat

1. **Java 17+**
   ```powershell
   java -version
   ```

2. **Android SDK + emulator** — harus sudah terpasang dan emulator bisa menyala.

3. **Maestro CLI**

   Download dari halaman rilis resmi:
   https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip

   Extract ke `C:\maestro`, lalu tes:

   ```powershell
   & "C:\maestro\maestro\bin\maestro.bat" --version
   ```

   > **Catatan:** path-nya `C:\maestro\maestro\bin\` (dua kali `maestro`), karena isi file zip
   > sudah punya folder `maestro/` di dalamnya.
   >
   > Kalau ingin bisa dipanggil cukup dengan `maestro` (tanpa path panjang), tambahkan ke PATH:
   > ```powershell
   > setx PATH "%PATH%;C:\maestro\maestro\bin"
   > ```
   > Lalu **tutup dan buka ulang terminal** supaya perubahan PATH terbaca.

4. **Emulator menyala.** Cek dulu:
   ```powershell
   adb devices
   ```
   Kalau `emulator-5554   device` muncul, berarti siap.

---

## 4. Menyalakan Emulator

Cara termudah lewat Android Studio (Device Manager → tombol ▶️).

Kalau mau lewat terminal:

```powershell
# lihat daftar emulator yang tersedia
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds

# nyalakan salah satunya
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_9_Pro_API_35
```

Tunggu sampai emulator benar-benar masuk ke home screen — jangan langsung menjalankan test.

---

## 5. Menyiapkan Aplikasi yang Diuji (MiLab2)

Flow contoh di folder ini memakai **MiLab2**, aplikasi Flutter demo. Source code-nya berada
di luar repo ini, di `D:\AI\MiLab\my_lab`.

```powershell
adb devices                                              # pastikan emulator muncul

cd D:\AI\MiLab\my_lab                                    # masuk ke source MiLab2
flutter build apk --debug                                # build APK

adb install -r build\app\outputs\flutter-apk\app-debug.apk
```

Kalau muncul error signature:

```
INSTALL_FAILED_UPDATE_INCOMPATIBLE: ... signatures do not match
```

Artinya di emulator sudah ada versi lain dengan tanda tangan berbeda. Uninstall dulu:

```powershell
adb uninstall com.example.Milab2
adb install -r <path-ke>\app-debug.apk
```

> ⚠️ **Selalu install APK hasil build terbaru.** APK lama bisa saja belum memuat perubahan
> di source code, sehingga flow gagal di tengah jalan walaupun script-nya sudah benar.
> Kalau flow gagal dengan pesan `Element not found`, hal ini adalah tersangka pertama.

---

## 6. Menjalankan Test

**Semua flow sekaligus:**
```powershell
& "C:\maestro\maestro\bin\maestro.bat" test maestro\flows\
```

**Satu flow saja (paling sering dipakai waktu belajar):**
```powershell
& "C:\maestro\maestro\bin\maestro.bat" test maestro\flows\01_home_menu.yaml
```

**Pilih emulator tertentu** (kalau ada lebih dari satu device nyala):
```powershell
& "C:\maestro\maestro\bin\maestro.bat" test maestro\flows\ --udid emulator-5554
```

**Pakai config.yaml:**
```powershell
& "C:\maestro\maestro\bin\maestro.bat" test maestro\config.yaml
```

Kalau Maestro sudah masuk PATH, `& "C:\maestro\maestro\bin\maestro.bat"` cukup ditulis `maestro`.

---

## 7. Membaca Hasil

Tiap langkah ditandai:

| Tanda | Arti |
| --- | --- |
| ✅ | Langkah berhasil |
| ❌ | Langkah gagal — eksekusi berhenti di situ |

Saat gagal, Maestro mencetak:

```
Element not found: Id matching regex: home_view_all
```

Artinya: elemen yang dicari tidak ada di layar. Tiga penyebab tersering:

1. **Selector-nya salah** (teks/`id` tidak persis sama dengan yang ada di aplikasi)
2. **APK-nya kuno** — belum memuat kode terbaru
3. **Belum selesai loading** — elemen belum sempat muncul

Maestro juga menyimpan screenshot & UI hierarchy di `~/.maestro/tests/<timestamp>/`.
Ini cara paling cepat untuk tahu *apa yang sebenarnya ada di layar* saat gagal.

---

## 8. Anatomi Satu File Flow

Ambil contoh `flows/01_home_menu.yaml`:

```yaml
appId: com.example.Milab2          # aplikasi yang diuji
name: "TC-APP-001 ..."             # nama test case
tags:
  - smoke
---
- launchApp:
    clearState: true               # mulai dari kondisi bersih
- assertVisible: "Hi, Faizallll"    # pastikan Home sudah tampil
- tapOn: "My Class"                # tap elemen berteks "My Class"
- assertVisible: "My Classes"      # pastikan pindah halaman berhasil
```

Tiga perintah yang paling sering dipakai:

| Perintah | Fungsi |
| --- | --- |
| `launchApp` | Buka aplikasi (bisa dengan `clearState: true` untuk reset) |
| `assertVisible` | Pastikan sebuah elemen tampil di layar |
| `tapOn` | Tap sebuah elemen |

Perintah lain yang dipakai di contoh: `back` (tombol kembali), `scroll`, `inputText`
(mengetik), dan `scrollUntilVisible`.

---

## 9. Pelajaran Penting Soal Selector

Bagian ini adalah inti dari menulis test mobile yang stabil. Semuanya sudah teruji di
project ini.

### 9.1 Flutter menggabungkan teks anak jadi satu string

Di aplikasi Flutter, satu kartu sering dibaca Maestro sebagai **satu string gabungan**,
bukan beberapa elemen terpisah. Contoh nyata:

```
"Pemrograman Mobile E\nMonday | \nSeat: A23"
```

Karena Maestro mencocokkan **seluruh** string, mencari teks polos seperti
`"Pemrograman Mobile E"` **tidak akan ketemu**. Solusinya pakai regex:

```yaml
- tapOn: ".*Pemrograman Mobile E.*"
```

Tanda `.*` artinya "apa pun sebelum dan sesudahnya".

### 9.2 Elemen tanpa teks ditap pakai `id`

Ikon (tombol back di AppBar, ikon di bottom navbar) tidak punya teks, jadi tidak bisa
dicari lewat `tapOn: "..."`. Solusinya: di **source code Flutter**, bungkus widget-nya
dengan `Semantics(identifier: ...)`:

```dart
Semantics(
  identifier: 'home_view_all',
  child: GestureDetector(...),
)
```

Lalu di YAML:

```yaml
- tapOn:
    id: "home_view_all"
```

Identifier ini stabil — tidak terpengaruh ukuran layar maupun perubahan teks, jadi jauh
lebih andal daripada tap pakai koordinat.

### 9.3 Tunggu halaman siap sebelum tap

`tapOn` **tidak menunggu** aplikasi selesai loading. Kalau langsung tap setelah
`launchApp`, tap-nya bisa mendarat di splash screen dan flow gagal.

Selalu pastikan halaman sudah tampil dulu:

```yaml
- launchApp:
    clearState: true
- assertVisible: "Hi, Faizallll"   # ← tunggu Home benar-benar siap
- tapOn: "My Class"                 # ← baru tap
```

### 9.4 Judul halaman Android kadang tidak terdeteksi

Di layar Settings Android, judul halaman tidak selalu masuk ke UI hierarchy. Karena itu
`00_cek_koneksi.yaml` (TC-APP-000) memverifikasi **isi** halaman (`"Internet"`, `"SIMs"`)
alih-alih judulnya (`"Network & internet"` sebagai header).

Prinsipnya: kalau sebuah assertion gagal padahal secara visual teksnya ada, coba periksa
UI hierarchy di folder debug Maestro — mungkin elemen itu memang tidak ter-ekspos.

### 9.5 Tutup aplikasi di akhir flow — jangan tinggalkan state

Ini pelajaran yang mahal: flow yang **berhasil** pun bisa merusak flow **berikutnya**.

Kasus nyatanya: `00_cek_koneksi.yaml` membuka aplikasi **Settings**, lalu berhenti.
Kalau Settings dibiarkan hidup, Android kadang memunculkan dialog sistem
**"Application Not Responding" (ANR)** untuk proses Settings tersebut. Dialog itu
**mengambil alih fokus layar**, sehingga flow berikutnya (`01_home_menu.yaml`) gagal di
langkah pertama:

```
Assertion is false: "Hi, Faizallll" is visible
```

Padahal penyebabnya **bukan** aplikasi MiLab2, melainkan sisa proses aplikasi lain.

Solusinya: **selalu bersihkan di akhir flow.**

```yaml
- stopApp            # matikan aplikasi yang tadi dibuka
- pressKey: Home     # pastikan layar balik ke launcher
```

> **Ini juga penyebab utama "kadang jalan, kadang gagal".** Kalau flow kamu lewat
> (pass) saat dijalankan sendiri tapi gagal saat dijalankan bersama flow lain, hampir
> pasti penyebabnya state yang tertinggal dari flow sebelumnya — bukan selector kamu.

---

## 10. Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `Element not found` | Selector salah / APK kuno / belum loading | Cek UI hierarchy di `~/.maestro/tests/`, pastikan APK terbaru, tambah `assertVisible` sebelum tap |
| Flow gagal di langkah pertama | Emulator belum siap | Tunggu emulator sampai home screen, cek `adb devices` |
| `No devices found` | Emulator mati | Nyalakan emulator |
| Install gagal: signature | Versi lama masih terpasang | `adb uninstall com.example.Milab2` lalu install ulang |
| Perilaku beda tiap run | State aplikasi tertinggal | Pakai `launchApp: { clearState: true }` |
| Lulus sendiri, gagal saat sekaligus | Sisa state flow sebelumnya (mis. dialog ANR dari aplikasi lain) | Tutup aplikasi di akhir flow: `stopApp` + `pressKey: Home` (lihat 9.5) |
| Layar ketutup dialog "Application Not Responding" | Proses aplikasi lama masih hidup | Tap "Close app", lalu tambahkan `stopApp` di akhir flow sebelumnya |
| Teks jelas ada tapi tidak ketemu | Teks tergabung dengan elemen lain | Pakai regex `.*teks.*` |

---

## 11. Checklist Bikin Test Case Baru

1. **Tentukan tujuan** — perilaku apa yang mau dipastikan?
2. **Tulis prasyarat** — aplikasi & emulator apa yang harus siap?
3. **Tentukan data uji** — input apa yang dipakai?
4. **Tulis langkahnya** — bergantian antara aksi (`tapOn`) dan pemeriksaan (`assertVisible`)
5. **Tentukan ekspektasi** — hasil akhir yang benar itu seperti apa?
6. **Jalankan** dan perbaiki sampai semua langkah ✅
7. **Simpan bukti** — screenshot hasil run

---

## 12. Hubungan dengan `npm run`

Maestro **bukan** tool Node.js, jadi secara teknis tidak bergantung pada `npm`. Tapi kalau
Maestro CLI sudah masuk PATH, kita bisa memanggilnya lewat script `npm run` supaya
**sejajar** dengan Cypress — satu gaya perintah untuk web dan mobile.

`package.json` di repo ini sudah menyediakannya:

```json
"test:pub":  "cypress run --spec cypress/e2e/tc-pub-001.cy.js",
"test:app":  "maestro test maestro/flows/",
"test:all":  "npm run test:pub && npm run test:app"
```

```powershell
npm run test:pub     # → Cypress (web)
npm run test:app     # → Maestro (mobile)
npm run test:all     # → keduanya
```

> **Prasyarat:** perintah `maestro` harus bisa dipanggil langsung. Kalau belum, jalankan
> dengan path lengkap: `& "C:\maestro\maestro\bin\maestro.bat" test maestro\flows\`.
> Lihat bagian 3 untuk cara menambahkannya ke PATH.

---

## 13. Referensi

- Dokumentasi resmi Maestro: https://maestro.mobile.dev/
- Daftar perintah lengkap: https://maestro.mobile.dev/reference/commands
- Aplikasi contoh (SUT): MiLab2
- Repo contoh automation: https://github.com/FaizalTrianto03/milab2-demo-automation/
