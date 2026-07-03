# YTDL RN — skeleton

React Native downloader app skeleton, matching the approved mockup
(`downloader-ui-v2.jsx`). Home / Downloads / More screens + a bottom
sheet that talks to a Kotlin native module wrapping `youtubedl-android`
and (eventually) `ffmpeg-kit`.

## What's here

- `App.tsx`, `src/screens`, `src/components` — the RN UI, ported 1:1 from the mockup.
- `src/services/YtdlpBridge.ts` — JS-side wrapper around the native module.
- `android/.../YtdlpModule.kt` — Kotlin side: calls yt-dlp, filters formats
  down to H.264/MP4 (video) and AAC/M4A (audio), starts downloads.
- `.github/workflows/build.yml` — CI build producing a release APK.

## What's NOT done yet (by design — this is a skeleton)

This has **not been compiled or run**. Expect errors on first build; that's
normal for a hand-written skeleton, not a sign something is fundamentally
wrong. Work through them one at a time.

1. **`android/` project scaffold.** This repo only has the two Kotlin
   files. You still need to run `npx react-native init` (or equivalent) to
   generate the actual `android/build.gradle`, `settings.gradle`,
   `MainApplication.kt`, `AndroidManifest.xml`, etc., then drop
   `YtdlpModule.kt` / `YtdlpPackage.kt` into
   `android/app/src/main/java/org/sushitrsh/ytdlrn/` and register
   `YtdlpPackage()` inside `MainApplication.kt`'s package list.

2. **Add dependencies to `android/app/build.gradle`:**
   ```gradle
   dependencies {
       implementation("io.github.junkfood02.youtubedl-android:library:0.17.3")
       implementation("io.github.junkfood02.youtubedl-android:ffmpeg:0.17.3")
       implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")
   }
   ```
   (check the [youtubedl-android repo](https://github.com/yausername/youtubedl-android)
   for the current version/artifact names before pinning).

3. **Initialize the library** — `YoutubeDL.getInstance().init(context)` needs
   to run once, typically in `MainApplication.onCreate()`.

4. **Foreground service for downloads.** `startDownload()` currently runs
   inline in a coroutine, which will die if the app is backgrounded. Move
   the actual download+merge work into a proper `Service`
   (`DownloadService.kt`) with a persistent notification — this is what
   makes downloads survive minimizing the app, matching the "kontrol
   download" behavior discussed earlier.

5. **ffmpeg-kit merge step.** The `// TODO` in `YtdlpModule.kt` needs the
   real mux command once both video-only and audio-only files are on disk:
   ```kotlin
   FFmpegKit.execute("-i \"$videoFile\" -i \"$audioFile\" -c copy \"$outputFile\"")
   ```

6. **Permissions.** `AndroidManifest.xml` will need storage/notification
   permissions (`WRITE_EXTERNAL_STORAGE` on older API levels,
   `POST_NOTIFICATIONS` for the foreground service notification on Android 13+).

7. **Clipboard package.** `HomeScreen.tsx` imports
   `@react-native-clipboard/clipboard` — add it to `package.json`
   (`npm install @react-native-clipboard/clipboard`).

## Suggested order of attack

1. Scaffold the real RN android project, drop these files in.
2. Get it building and running with `fetchInfo` stubbed to return fake
   data (skip yt-dlp entirely at first) — confirms the UI layer works.
3. Wire up `youtubedl-android` for real `fetchInfo`.
4. Wire up download + progress events.
5. Add the foreground service.
6. Add ffmpeg merge.
7. Point `.github/workflows/build.yml` at the finished project and get CI green.
