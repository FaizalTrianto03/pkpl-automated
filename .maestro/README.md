# ============================================================
# CATATAN: dokumen ini SUDAH TIDAK DIPAKAI
#
# Semua isinya sudah dipindah ke folder maestro/:
#   .maestro/README.md        →  maestro/GUIDE.md
#   .maestro/tc-app-001.yaml  →  maestro/cek-koneksi.yaml
#
# Dokumen di folder maestro/ yang sudah diperbarui & terverifikasi:
#   maestro/GUIDE.md          panduan lengkap Maestro
#   maestro/config.yaml       konfigurasi (appId, flows)
#   maestro/cek-koneksi.yaml  TC-APP-000: cek emulator + Maestro
#   maestro/flows/            TC-APP-001: contoh test aplikasi
#
# -----------------------------------------------
# PENTING — koreksi dari catatan lama di bawah:
#
#   Catatan lama menyebut Maestro hanya mendukung API 29-34 dan
#   menyarankan pakai AVD API 34. Informasi itu TIDAK LAGI AKURAT.
#
#   Sudah diverifikasi: Maestro 2.10.0 berjalan normal di
#   emulator API 35 (Android 15, Pixel_9_Pro_API_35).
#
#   Jadi bagian "pakai AVD API 34" di bawah harap diabaikan.
# -----------------------------------------------
#
# Isi lama dibiarkan di bawah hanya sebagai catatan sejarah.
# ============================================================

## Prasyarat
# 1. Java 17+ (cek: java -version)
# 2. Android SDK + emulator (sudah ada di mesin ini)
# 3. Emulator API level yang DIDUKUNG Maestro
#    (Lihat koreksi di atas: API 35 sudah terverifikasi jalan.)

## Instalasi CLI (Windows)
# 1. Download: https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip
# 2. Extract ke C:\maestro
# 3. Tambah PATH:
#    setx PATH "%PATH%;C:\maestro\bin"
# 4. Restart terminal, cek:  maestro --help

## Menjalankan test
# 1. Nyalakan emulator
# 2. Dari folder project ini:
#    maestro test .maestro/tc-app-001.yaml
