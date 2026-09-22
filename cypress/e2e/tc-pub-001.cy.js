/// <reference types="cypress" />

// ============================================================
// TC-PUB-001 — Portal Publik Praktikan (Mahasiswa)
// Satu perjalanan end-to-end di sisi publik: mahasiswa buka portal,
// cari dirinya pakai NIM, masuk ke profil & kelompok, lalu cek
// presensi, nilai per komponen, feedback, sampai halaman sanksi.
// ============================================================

const BASE_URL = 'https://mppl.codrihub.my.id/'
const NIM = '202210370311015'
const NAMA = 'Mahasiswa 202210370311015'

// Kelompok aktif & nonaktif pada profil (data dari portal)
const KELOMPOK_AKTIF = 'Contoh Kelompok 4'
const KELOMPOK_NONAKTIF = 'Contoh Kelompok 1'

describe('TC-PUB-001 — Portal Publik Praktikan', () => {
  beforeEach(() => {
    // Ukuran layar standar biar layout konsisten di semua test
    cy.viewport(1440, 900)
  })

  it('1. Beranda: portal kebuka dan kotak pencarian NIM muncul', () => {
    cy.visit(BASE_URL)
    cy.title().should('contain', 'Penilaian MPPL')
    cy.get('h1').contains('Portal Penilaian MPPL').should('be.visible')
    cy.get('input[placeholder*="NIM"]').should('be.visible')
  })

  it('2. Cari NIM: ketik NIM, muncul hasil, lalu buka profil', () => {
    cy.visit(BASE_URL)
    cy.get('input[placeholder*="NIM"]').type(`${NIM}{enter}`)

    // Hasil pencarian tampil sebagai dropdown
    cy.contains(NIM).should('be.visible')
    cy.contains(NAMA).should('be.visible')

    // Klik hasilnya → masuk ke halaman profil praktikan
    cy.contains(NAMA).click()

    // Profil: NIM tampil sebagai judul halaman
    cy.url().should('include', '/praktikan/')
    cy.get('h1').should('contain', NAMA)
    cy.get('body').should('contain', NIM)
  })

  it('3. Profil: data mahasiswa, riwayat kelompok, dan status sanksi', () => {
    cy.visit(BASE_URL)
    cy.get('input[placeholder*="NIM"]').type(`${NIM}{enter}`)
    cy.contains(NAMA).click()

    cy.get('h1').should('contain', NAMA)

    // Ringkasan profil: status, total kelompok, kelompok aktif/nonaktif
    cy.contains('Status').should('be.visible')
    cy.contains('Mahasiswa').should('be.visible')
    cy.contains('Total Kelompok').should('be.visible')
    cy.contains('Kelompok Aktif').should('be.visible')
    cy.contains('Kelompok Nonaktif').should('be.visible')

    // Info sanksi di header profil
    cy.contains('Terkena Sanksi').should('be.visible')

    // Riwayat kelompok: ada kelompok aktif & nonaktif
    cy.contains('Riwayat Kelompok').should('be.visible')
    cy.contains(KELOMPOK_AKTIF).should('be.visible')
    cy.contains(KELOMPOK_NONAKTIF).should('be.visible')
    cy.contains('Nonaktif').should('be.visible')
  })

  it('4. Detail kelompok: info kelompok, ringkasan presensi, dan daftar modul', () => {
    cy.visit(BASE_URL)
    cy.get('input[placeholder*="NIM"]').type(`${NIM}{enter}`)
    cy.contains(NAMA).click()

    // Buka detail kelompok aktif — telusuri kartunya sampai ketemu tombol Lihat Detail
    cy.contains('h3', KELOMPOK_AKTIF)
      .parents('div')
      .contains('button', 'Lihat Detail')
      .click()

    cy.url().should('include', '/praktikan/')
    cy.url().should('match', /\/[A-Za-z0-9_-]+$/) // ada id kelompok di akhir URL

    // Info header kelompok
    cy.get('h1').should('contain', NAMA)
    cy.contains('Kelompok:').should('be.visible')
    cy.contains('Kelompok:').parent().should('contain', KELOMPOK_AKTIF)
    cy.contains('Kelas:').should('be.visible')
    cy.contains('Konsultan:').should('be.visible')

    // Ringkasan Presensi: ada Materi & Demo
    cy.contains('Ringkasan Presensi').should('be.visible')
    cy.contains('Materi').should('be.visible')
    cy.contains('Demo').should('be.visible')

    // Daftar Modul — pakai h3 biar gak nyasar ke elemen tersembunyi
    cy.contains('Daftar Modul').should('be.visible')
    cy.contains('h3', 'PROJECT INITIATION & JIRA SETUP').should('be.visible')
    cy.contains('h3', 'COST ESTIMATION & PRODUCT BACKLOG').should('be.visible')
  })

  it('5. Detail nilai per modul: komponen nilai dan feedback', () => {
    cy.visit(BASE_URL)
    cy.get('input[placeholder*="NIM"]').type(`${NIM}{enter}`)
    cy.contains(NAMA).click()

    cy.contains('h3', KELOMPOK_AKTIF)
      .parents('div')
      .contains('button', 'Lihat Detail')
      .click()

    // Klik Modul 1 untuk lihat penilaiannya
    cy.contains('h3', 'PROJECT INITIATION & JIRA SETUP').click()

    // Bagian Penilaian
    cy.contains('h4', 'Penilaian').should('be.visible')
    cy.contains('Nilai Akhir:').should('be.visible')
    cy.contains('Nilai Akhir:').parent().should('contain', 'B+')

    // Komponen nilai per kategori
    cy.contains('Individual - Consultation').should('be.visible')
    cy.contains('Individual - Role Defense').should('be.visible')
    cy.contains('Document Quality - Business Case').should('be.visible')
    cy.contains('Document Quality - Charter').should('be.visible')
    cy.contains('Technical Setup - Jira Config').should('be.visible')

    // Feedback & Catatan
    cy.contains('h4', 'Feedback & Catatan').should('be.visible')
    cy.contains('Feedback Individu').should('be.visible')
    cy.contains('Feedback Kelompok').should('be.visible')
  })

  it('6. Sanksi: cari NIM dan pastikan kasus sanksi tercatat', () => {
    cy.visit(`${BASE_URL}sanksi`)

    cy.get('h1').contains('Daftar Sanksi Praktikum').should('be.visible')

    // Cari NIM di kolom pencarian sanksi
    cy.get('input[placeholder*="Cari NIM"]').type(`${NIM}{enter}`)

    // Hasil filter: 1 kasus sanksi untuk NIM ini
    cy.get('body').should('contain', NIM)
    cy.get('body').should('contain', NAMA)
    cy.contains('1 kasus tercatat').should('be.visible')
    cy.contains('Terkena sanksi otomatis: Lebih dari 2x Alpa').should('be.visible')
  })
})
