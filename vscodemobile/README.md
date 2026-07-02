# VSCode Mobile

APK wrapper native Android (Java, WebView) buat vscode.dev — ga pake Kivy/Cordova, cuma AndroidX + WebView.

## Cara pakai

1. Push folder ini ke repo GitHub baru.
2. GitHub Actions (`.github/workflows/build.yml`) otomatis jalan tiap push ke `main`, atau trigger manual lewat tab **Actions > Build APK > Run workflow**.
3. Hasil build ada di tab **Actions**, artifact bernama `vscode-mobile-debug` — download, extract, install `app-debug.apk` di HP (aktifkan "Install from unknown sources" dulu).

## Fitur yang udah di-handle

- JavaScript + DOM storage + IndexedDB enabled (wajib buat vscode.dev nyimpen workspace/extensions).
- Popup window support (buat GitHub OAuth sign-in & Settings Sync) — dibuka di dialog fullscreen terpisah, auto-close pas redirect balik ke vscode.dev.
- Tombol back HP = back di WebView history.
- Progress bar loading.

## Kalau mau ganti URL default

Edit `START_URL` di:
`app/src/main/java/org/sushitrsh/vscodemobile/MainActivity.java`

## Build lokal (opsional, di Termux/UserLAnd)

Butuh JDK 17 + Android SDK command-line tools. Kalau udah ada:

```bash
gradle assembleDebug
```

APK keluar di `app/build/outputs/apk/debug/app-debug.apk`

## Catatan

- Ini build **debug** (unsigned, cukup buat install manual). Kalau mau publish ke Play Store, perlu signing config + release build — bilang aja kalau butuh itu.
- vscode.dev jalan penuh di browser (WASM) — cocok buat edit file, Git, extensions ringan. Buat compile/run code beneran, tetep butuh Codespaces atau Remote Tunnel dari PC/server lo.
