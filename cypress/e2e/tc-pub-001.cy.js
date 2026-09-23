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
    // Ukuran tetap supaya layout tidak bergeser antar mesin
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

    // Hasil pencarian muncul sebagai dropdown
    cy.contains(NIM).should('be.visible')
    cy.contains(NAMA).should('be.visible')

    cy.contains(NAMA).click()

    cy.url().should('include', '/praktikan/')
    cy.get('h1').should('contain', NAMA)
    cy.get('body').should('contain', NIM)
  })

  it('3. Profil: data mahasiswa, riwayat kelompok, dan status sanksi', () => {
    cy.visit(BASE_URL)
    cy.get('input[placeholder*="NIM"]').type(`${NIM}{enter}`)
    cy.contains(NAMA).click()

    cy.get('h1').should('contain', NAMA)

    cy.contains('Status').should('be.visible')
    cy.contains('Mahasiswa').should('be.visible')
    cy.contains('Total Kelompok').should('be.visible')
    cy.contains('Kelompok Aktif').should('be.visible')
    cy.contains('Kelompok Nonaktif').should('be.visible')

    cy.contains('Terkena Sanksi').should('be.visible')

    cy.contains('Riwayat Kelompok').should('be.visible')
    cy.contains(KELOMPOK_AKTIF).should('be.visible')
    cy.contains(KELOMPOK_NONAKTIF).should('be.visible')
    cy.contains('Nonaktif').should('be.visible')
  })

  it('4. Detail kelompok: info kelompok, ringkasan presensi, dan daftar modul', () => {
    cy.visit(BASE_URL)
    cy.get('input[placeholder*="NIM"]').type(`${NIM}{enter}`)
    cy.contains(NAMA).click()

    // "Lihat Detail" tidak unik — bertolak dari judul kartu kelompoknya
    cy.contains('h3', KELOMPOK_AKTIF)
      .parents('div')
      .contains('button', 'Lihat Detail')
      .click()

    cy.url().should('include', '/praktikan/')
    cy.url().should('match', /\/[A-Za-z0-9_-]+$/) // id kelompok di akhir URL

    cy.get('h1').should('contain', NAMA)
    cy.contains('Kelompok:').should('be.visible')
    cy.contains('Kelompok:').parent().should('contain', KELOMPOK_AKTIF)
    cy.contains('Kelas:').should('be.visible')
    cy.contains('Konsultan:').should('be.visible')

    cy.contains('Ringkasan Presensi').should('be.visible')
    cy.contains('Materi').should('be.visible')
    cy.contains('Demo').should('be.visible')

    // Pakai h3 biar tidak nyangkut elemen tersembunyi
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

    cy.contains('h3', 'PROJECT INITIATION & JIRA SETUP').click()

    // Nilai akhir bukan elemen sendiri — ada di dalam elemen induk
    cy.contains('h4', 'Penilaian').should('be.visible')
    cy.contains('Nilai Akhir:').should('be.visible')
    cy.contains('Nilai Akhir:').parent().should('contain', 'B+')

    cy.contains('Individual - Consultation').should('be.visible')
    cy.contains('Individual - Role Defense').should('be.visible')
    cy.contains('Document Quality - Business Case').should('be.visible')
    cy.contains('Document Quality - Charter').should('be.visible')
    cy.contains('Technical Setup - Jira Config').should('be.visible')

    cy.contains('h4', 'Feedback & Catatan').should('be.visible')
    cy.contains('Feedback Individu').should('be.visible')
    cy.contains('Feedback Kelompok').should('be.visible')
  })

  it('6. Sanksi: cari NIM dan pastikan kasus sanksi tercatat', () => {
    cy.visit(`${BASE_URL}sanksi`)

    cy.get('h1').contains('Daftar Sanksi Praktikum').should('be.visible')

    cy.get('input[placeholder*="Cari NIM"]').type(`${NIM}{enter}`)

    cy.get('body').should('contain', NIM)
    cy.get('body').should('contain', NAMA)
    cy.contains('1 kasus tercatat').should('be.visible')
    cy.contains('Terkena sanksi otomatis: Lebih dari 2x Alpa').should('be.visible')
  })
})
