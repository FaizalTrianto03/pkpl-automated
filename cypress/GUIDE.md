# Panduan Cypress — Automation Web

Automation test **aplikasi web** pakai [Cypress](https://www.cypress.io/). Test ditulis pakai
**JavaScript** dan dijalankan langsung di dalam browser.

Padanan untuk mobile ada di [`../maestro/GUIDE.md`](../maestro/GUIDE.md).

---

## 1. Cara Kerja Singkat

| | Cypress | Maestro |
| --- | --- | --- |
| Ditulis pakai | JavaScript | YAML |
| Selector | CSS selector | Teks / `id` |
| Menunggu elemen | Otomatis (retry) | Otomatis (retry), kecuali saat tap pertama |
| Butuh server | Tidak | Tidak |
| Bisa lihat proses jalan | Ya (`cypress open`) | Ya (di layar emulator) |

Satu file `.cy.js` = **satu test case** (atau satu kelompok test case yang berhubungan).

---

## 2. Struktur Folder

```
cypress/
├── GUIDE.md          ← dokumen ini
├── e2e/              ← file test-nya di sini
│   ├── tc-pub-001.cy.js  ← contoh utama (portal MPPL)
│   └── spec.cy.js        ← template kosong
├── fixtures/         ← data uji (JSON)
│   └── example.json
├── support/
│   ├── e2e.js        ← konfigurasi global
│   └── commands.js   ← custom command
└── screenshots/      ← hasil screenshot otomatis saat test gagal
```

---

## 3. Prasyarat & Instalasi

1. **Node.js** (versi 18 ke atas)
   ```powershell
   node -v
   ```

2. **Install dependency project** (sekali saja):
   ```powershell
   npm install
   ```

   Cypress akan terpasang sebagai devDependency. Kalau perlu install manual:
   ```powershell
   npm install cypress --save-dev
   ```

3. **Tes Cypress jalan:**
   ```powershell
   npx cypress --version
   ```

---

## 4. Menjalankan Test

**Mode interaktif** (browser terbuka, bisa lihat tiap langkah berjalan):
```powershell
npm run cypress:open
```

**Mode headless** (jalan sendiri di terminal, tanpa tampilan browser):
```powershell
npm run cypress:run
```

**Satu file tertentu:**
```powershell
npm run test:pub
```

`test:pub` adalah script yang sudah didefinisikan di `package.json`:
```json
"test:pub": "cypress run --spec cypress/e2e/tc-pub-001.cy.js"
```

Bisa juga memanggil lewat `npx` langsung:
```powershell
npx cypress run --spec cypress/e2e/tc-pub-001.cy.js --browser chrome
```

> **Saat belajar pakai `cypress:open`.** Tiap perintah bisa dilihat berjalan, langkahnya bisa
> diklik untuk melihat kondisi DOM saat itu, jadi selector yang gagal langsung kelihatan.
> `cypress:run` untuk test yang sudah stabil dan mau dijalankan massal.

---

## 5. Contoh Test Case: `tc-pub-001.cy.js`

6 test, semuanya lulus. Alurnya: mahasiswa buka portal, cari dirinya pakai NIM, lalu
menelusuri profil → kelompok → nilai → halaman sanksi.

> **Penting:** test ini menembak server sungguhan (`https://mppl.codrihub.my.id/`), bukan
> server tiruan. Kalau portalnya mati, semua test gagal — itu bukan bug script-nya. Cek dulu
> portalnya masih hidup sebelum menduga ada bug:
> ```powershell
> Invoke-WebRequest -Uri "https://mppl.codrihub.my.id/" -UseBasicParsing | Select-Object StatusCode
> ```
> Repo latihan di bagian 6 memakai `saucedemo.com`, situs latihan publik yang selalu hidup.

### 5.1 Bagian atas — konstanta

```js
const BASE_URL = 'https://mppl.codrihub.my.id/'
const NIM = '202210370311015'
const NAMA = 'Mahasiswa 202210370311015'
const KELOMPOK_AKTIF = 'Contoh Kelompok 4'
```

Semua nilai yang dipakai berulang dikumpulkan di atas — kalau data uji berubah, cukup edit
satu tempat.

### 5.2 Kerangka test

```js
describe('TC-PUB-001 — Portal Publik Praktikan', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
  })

  it('1. Beranda: portal kebuka dan kotak pencarian NIM muncul', () => {
    cy.visit(BASE_URL)
    cy.title().should('contain', 'Penilaian MPPL')
    cy.get('input[placeholder*="NIM"]').should('be.visible')
  })
  // ... test 2 sampai 6
})
```

- `describe` = kelompok test, `beforeEach` = jalan sebelum tiap `it`, `it` = satu skenario test

`cy.viewport(1440, 900)` penting supaya layout selalu sama di semua mesin — kalau ukuran
layar berbeda, elemen bisa berpindah tempat dan test jadi tidak konsisten.

### 5.3 Pola yang dipakai

**Membuka halaman:**
```js
cy.visit(BASE_URL)
```
Karena `baseUrl` belum di-set di `cypress.config.js`, alamat lengkap ditulis langsung. Kalau
di-set (bagian 8), cukup `cy.visit('/')`.

**Mencari elemen:**
```js
cy.get('input[placeholder*="NIM"]')   // cari lewat atribut (tanda * = mengandung)
cy.contains(NAMA)                      // cari lewat teks
cy.contains('h3', KELOMPOK_AKTIF)      // cari <h3> yang berisi teks tertentu
```

**Berinteraksi dengan elemen:**
```js
cy.get('input[placeholder*="NIM"]').type(`${NIM}{enter}`)   // {enter} = tekan Enter
cy.contains(NAMA).click()
```

**Memeriksa hasil:**
```js
cy.title().should('contain', 'Penilaian MPPL')
cy.get('input[placeholder*="NIM"]').should('be.visible')
cy.url().should('include', '/praktikan/')
cy.contains('Nilai Akhir:').parent().should('contain', 'B+')
```

### 5.4 Pelajaran dari test ini

**Menelusuri hubungan antar-elemen.** Di test 4 tombol "Lihat Detail" tidak bisa dicari
langsung — ada beberapa kelompok, masing-masing punya tombol serupa. Berangkat dari judul
kelompoknya, naik ke elemen induk, baru cari tombolnya.

```js
cy.contains('h3', KELOMPOK_AKTIF)
  .parents('div')
  .contains('button', 'Lihat Detail')
  .click()
```

**Pakai tag HTML kalau teksnya muncul di beberapa tempat.** `cy.contains('PROJECT INITIATION')`
bisa menangkap elemen tersembunyi. Menyebut tagnya membuat pencarian lebih tepat:

```js
cy.contains('h3', 'PROJECT INITIATION & JIRA SETUP').should('be.visible')
```

**Perhatikan hierarki teks.** Kadang nilai yang dicari bukan elemen sendiri, tapi bagian
dari elemen induk:

```js
cy.contains('Nilai Akhir:').parent().should('contain', 'B+')
```

---

## 6. Materi Latihan Tambahan

### 6.1 Video tutorial

**https://youtu.be/vk6zK_kuYxU** — dasar automation web pakai Cypress.

### 6.2 Repo contoh: `automation-web-cypress`

**https://github.com/lidyanwr/automation-web-cypress.git**

SUT-nya **[saucedemo.com](https://www.saucedemo.com/)** — situs latihan publik yang memang
dibuat untuk berlatih automation.

**a. Mengisi form login dan checkout** (`cypress/e2e/Latihan.cy.js`)
```js
cy.visit("https://www.saucedemo.com/");
cy.get('#user-name').type('standard_user')
cy.get('#password').type('secret_sauce')
cy.get('#login-button').click()

cy.get('.inventory_item_name').first().click()
cy.get('#add-to-cart').click()
cy.get('.shopping_cart_badge').should("have.text","1")

cy.get('#first-name').type("John")
cy.get('#last-name').type("Robert")
cy.get('#postal-code').type("70282")
cy.get('#continue').click()
```

**b. Custom command** (`cypress/support/commands.js`)

Kalau satu rangkaian langkah dipakai berulang (misalnya login), jadikan command tersendiri:
```js
Cypress.Commands.add('loginApp', (email, password) => {
  cy.get('#user-name').type(email)
  cy.get('#password').type(password)
  cy.get('#login-button').click()
})
```
Lalu di test cukup:
```js
cy.loginApp('standard_user', 'secret_sauce')
```

**c. Data-driven test** (`cypress/e2e/Latihan_datadriven.cy.js`)

Data uji dipisahkan ke file JSON di `cypress/fixtures/`, lalu dibaca dengan `cy.fixture()`:
```js
beforeEach(() => {
  cy.fixture("test_data").then((data) => {
    userdata = data;
    cy.visit(Cypress.config("baseUrl"));
    cy.loginApp(userdata.username, userdata.password)
  })
})

it('Verify product pages', () => {
  cy.get('.inventory_item_desc').first().should('have.text', userdata.description)
})
```

Cara ini membuat test lebih rapi: **logika test** terpisah dari **data uji**. Kalau mau
menguji beberapa kombinasi data, cukup ubah file JSON-nya tanpa menyentuh kode test.

**d. Mengambil nilai dari teks** (`Latihan.cy.js`)

Untuk mengambil angka dari tampilan, gunakan `invoke('text')` lalu olah dengan JavaScript:
```js
const pattern = /[0-9]{1,3}\.[0-9]{2}/g;

cy.get('.summary_subtotal_label').first().should('be.visible').invoke('text').then(item => {
  let numberItem = item.match(pattern)
  cy.log(numberItem[0])
})
```

---

## 7. Cara Menentukan Selector

Urutan dari yang paling disarankan:

| Prioritas | Cara | Contoh |
| --- | --- | --- |
| 1 | `data-test` / `data-testid` | `cy.get('[data-test="inventory-item-name"]')` |
| 2 | `id` | `cy.get('#add-to-cart')` |
| 3 | atribut lain | `cy.get('input[placeholder*="NIM"]')` |
| 4 | teks | `cy.contains('Nilai Akhir:')` |
| 5 | class | `cy.get('.summary_total_label')` |

Alasannya: atribut khusus test dan `id` tidak berubah kalau tampilan didesain ulang.
Sedangkan `class` sering berubah dan teks bisa berganti bahasa.

**Cara cepat menemukan selector** (dari video tutorial): buka halaman di browser → klik kanan
pada elemen → *Inspect* → lihat atribut `id`, `class`, atau `data-test`-nya.

```js
// Locators
// tag id            → #id
// tag class         → .class
// tag attribute     → [attribute='value']
// tag class+atribut → .class[attribute='value']
```

---

## 8. Konfigurasi (`cypress.config.js`)

Isi sekarang:
```js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
  },
});
```

Dua penambahan yang umum dipakai (seperti di repo contoh):
```js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    chromeWebSecurity: false,      // hindari masalah CORS saat test
    baseUrl: 'https://www.saucedemo.com/'   // alamat default
  },
});
```

Kalau `baseUrl` diisi, `cy.visit('/')` otomatis mengarah ke alamat tersebut —
tidak perlu menulis alamat lengkap di setiap test.

---

## 9. Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `cy.get()` timeout, elemen tidak ketemu | Selector salah atau elemen belum muncul | Pakai `cypress:open`, klik langkah yang gagal, lihat DOM saat itu |
| Test lulus di mesin sendiri, gagal di mesin lain | Ukuran layar berbeda | Set `cy.viewport(...)` di `beforeEach` |
| Teks ketemu tapi elemen tersembunyi | Ada beberapa elemen dengan teks sama | Sempitkan dengan tag: `cy.contains('h3', 'teks')` |
| Data berubah tiap run | State tertinggal dari test sebelumnya | Pakai `beforeEach` untuk reset, atau `cy.clearCookies()` |
| CORS error saat request | Pembatasan keamanan browser | Set `chromeWebSecurity: false` di config |
| Semua test gagal, errornya seragam | Server SUT sedang mati (502 / timeout) | Buka portalnya dulu di browser — kalau ikut mati, tunggu sampai hidup lagi |

Saat test gagal, Cypress otomatis menyimpan screenshot di `cypress/screenshots/`.

---

## 10. Checklist Bikin Test Case Baru

1. **Tentukan tujuan** — perilaku apa yang mau dipastikan?
2. **Tulis prasyarat** — halaman & data apa yang harus siap?
3. **Tentukan data uji** — taruh di konstanta atas file atau di `fixtures/`
4. **Tulis langkahnya** — bergantian antara aksi (`.click()`, `.type()`) dan pemeriksaan (`.should()`)
5. **Tentukan ekspektasi** — hasil akhir yang benar itu seperti apa?
6. **Jalankan** dan perbaiki sampai semua test hijau
7. **Simpan bukti** — screenshot hasil run

---

## 11. Referensi

- Dokumentasi resmi Cypress: https://docs.cypress.io/
- Situs latihan: https://www.saucedemo.com/
- Video tutorial: https://youtu.be/vk6zK_kuYxU
- Repo contoh: https://github.com/lidyanwr/automation-web-cypress
