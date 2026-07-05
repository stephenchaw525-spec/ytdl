# YTDL — Cordova app + local Python backend

Same UI/UX you approved, now backed by a Python (Flask + yt-dlp) server
running locally in Termux on the same phone — instead of a React Native
native module. No Kotlin, no Gradle native module debugging.

## How it fits together

```
[Cordova app — HTML/CSS/JS]  --fetch()-->  [Flask on 127.0.0.1:5000, in Termux]
                                                    |
                                              yt-dlp + ffmpeg
```

Both run on the same device, so there's no dependency on the internet
being up or a remote server staying alive — it's "offline" in the sense
that matters (no third-party server), even though technically two local
processes are talking to each other over localhost.

**Trade-off to know going in:** you need Termux running the server before
opening the app. It's not a single seamless APK — think of it as two
small tools that work together, not one monolithic app. That's the price
for skipping the native module complexity.

## 1. Backend setup (in Termux)

```bash
pkg update && pkg install python ffmpeg
termux-setup-storage   # grants access to shared storage for downloads
cd backend
pip install -r requirements.txt
chmod +x start.sh
./start.sh
```

Leave that running. Test it's alive from a browser on the same phone:
`http://127.0.0.1:5000/api/health` should return `{"ok": true}`.

Optional: install the Termux:Boot add-on so this can auto-start, or just
get in the habit of opening Termux and running `./start.sh` before using
the app.

## 2. Frontend (Cordova) setup

```bash
npm install -g cordova
cordova platform add android
cordova build android
```

The APK lands in `platforms/android/app/build/outputs/apk/debug/` (or
`release/` if you build with `--release`). Install it on the same phone
running the Termux server.

`config.xml` already has the cleartext-traffic permission Android needs
to let the app call plain `http://127.0.0.1` — without it Android 9+
silently blocks the request and you'll just see failed fetches.

## 3. GitHub Actions

`.github/workflows/build.yml` does step 2 in CI and uploads the APK as
an artifact. Push to `main` or trigger it manually from the Actions tab.

## Known rough edges (fix as you go)

- **Clipboard auto-detect** (`navigator.clipboard.readText()` in
  `app.js`) may be blocked by the webview without a prior user gesture on
  some Android versions — it's wrapped in a try/catch so it just silently
  no-ops if so. Not critical to the core flow.
- **Storage permissions**: writing to `/storage/emulated/0/Download/...`
  from Termux requires `termux-setup-storage` to have been run and
  granted. If downloads fail with a permission error, check that first.
- **`filesize` from yt-dlp is sometimes `None`** (YouTube doesn't always
  report it upfront) — `app.py`'s `human_size()` falls back to `"—"` in
  that case, which is expected, not a bug.
- **History doesn't persist across app restarts** yet — `DOWNLOADS` in
  `app.py` is in-memory. Fine for now; swap to a small JSON file if you
  want it to survive.
