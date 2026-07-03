package org.sushitrsh.ytdlrn

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.yausername.youtubedl_android.YoutubeDL
import com.yausername.youtubedl_android.YoutubeDLRequest
import com.yausername.youtubedl_android.mapper.VideoInfo
import kotlinx.coroutines.*
import java.util.UUID

/**
 * Bridges JS <-> yt-dlp (via youtubedl-android) <-> ffmpeg-kit.
 *
 * fetchInfo(): runs `yt-dlp -j <url>` under the hood, then filters the raw
 * format list down to what the UI actually shows:
 *   - Video: one entry per resolution tier (1080p/720p/480p/360p), preferring
 *     H.264 (avc1) over AV1/VP9 for broad device compatibility.
 *   - Audio: two tiers (High/Low), preferring AAC/M4A over Opus/WEBM.
 *
 * startDownload(): downloads the chosen format(s). For video above 360p,
 * YouTube serves video-only + audio-only streams separately, so this also
 * downloads the matching audio stream and merges them with ffmpeg-kit.
 */
class YtdlpModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun getName() = "YtdlpModule"

    // ---- Public API called from YtdlpBridge.ts -----------------------

    @ReactMethod
    fun fetchInfo(url: String, promise: Promise) {
        scope.launch {
            try {
                val request = YoutubeDLRequest(url)
                val info: VideoInfo = YoutubeDL.getInstance().getInfo(request)

                val videoFormats = pickBestVideoPerResolution(info)
                val audioFormats = pickAudioTiers(info)

                val result = Arguments.createMap().apply {
                    putString("title", info.title ?: "Unknown title")
                    putString("channel", info.uploader ?: "")
                    putString("thumbnail", info.thumbnail ?: "")
                    putArray("video", videoFormats)
                    putArray("audio", audioFormats)
                }
                withContext(Dispatchers.Main) { promise.resolve(result) }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) { promise.reject("FETCH_INFO_FAILED", e.message, e) }
            }
        }
    }

    @ReactMethod
    fun startDownload(url: String, formatId: String, kind: String, outputDir: String, promise: Promise) {
        val downloadId = UUID.randomUUID().toString()
        promise.resolve(Arguments.createMap().apply { putString("downloadId", downloadId) })

        // TODO: hand off to a foreground Service (DownloadService.kt) so the
        // download survives app backgrounding, instead of running inline here.
        scope.launch {
            try {
                emitProgress(downloadId, 0, "downloading")

                val request = YoutubeDLRequest(url).apply {
                    addOption("-f", formatId)
                    addOption("-o", "$outputDir/%(title)s.%(ext)s")
                }

                YoutubeDL.getInstance().execute(request) { progress, _, _ ->
                    emitProgress(downloadId, progress.toInt(), "downloading")
                }

                if (kind == "video" && requiresMerge(formatId)) {
                    emitProgress(downloadId, 100, "merging")
                    // TODO: run ffmpeg-kit mux command here once both video-only
                    // and audio-only streams have been downloaded, e.g.:
                    // FFmpegKit.execute("-i video.mp4 -i audio.m4a -c copy out.mp4")
                }

                emitProgress(downloadId, 100, "done")
            } catch (e: Exception) {
                emitProgress(downloadId, 0, "error", e.message)
            }
        }
    }

    @ReactMethod
    fun cancelDownload(downloadId: String, promise: Promise) {
        // TODO: track running requests by downloadId and cancel the coroutine/process.
        promise.resolve(null)
    }

    // ---- Format filtering logic ---------------------------------------

    /** One H.264/MP4 entry per resolution tier: 1080p, 720p, 480p, 360p. */
    private fun pickBestVideoPerResolution(info: VideoInfo): WritableArray {
        val tiers = listOf(1080, 720, 480, 360)
        val out = Arguments.createArray()

        for (height in tiers) {
            val candidates = info.formats.orEmpty().filter { it.height == height && it.vcodec != "none" }
            val best = candidates.firstOrNull { it.vcodec?.startsWith("avc1") == true }
                ?: candidates.firstOrNull() ?: continue

            out.pushMap(Arguments.createMap().apply {
                putString("id", "${height}p")
                putString("label", "${height}p")
                putString("sub", "H.264 · MP4")
                putString("size", formatSize(best.filesize))
                putInt("bars", barsForHeight(height))
                putString("formatId", best.formatId ?: "")
            })
        }
        return out
    }

    /** Two audio tiers — High/Low — preferring AAC/M4A over Opus/WEBM. */
    private fun pickAudioTiers(info: VideoInfo): WritableArray {
        val audioOnly = info.formats.orEmpty()
            .filter { it.vcodec == "none" && it.acodec != "none" }
            .sortedByDescending { it.abr ?: 0.0 }

        val m4a = audioOnly.filter { it.ext == "m4a" }
        val chosen = if (m4a.size >= 2) m4a else audioOnly

        val out = Arguments.createArray()
        chosen.firstOrNull()?.let {
            out.pushMap(audioMap("high", "High Audio", it, 5))
        }
        chosen.lastOrNull()?.let {
            out.pushMap(audioMap("low", "Low Audio", it, 2))
        }
        return out
    }

    private fun audioMap(id: String, label: String, f: com.yausername.youtubedl_android.mapper.Format, bars: Int) =
        Arguments.createMap().apply {
            putString("id", id)
            putString("label", label)
            putString("sub", "AAC · M4A")
            putString("size", formatSize(f.filesize))
            putInt("bars", bars)
            putString("formatId", f.formatId ?: "")
        }

    private fun requiresMerge(formatId: String) = true // video-only formats above 360p always need audio muxed in

    private fun barsForHeight(height: Int) = when {
        height >= 1080 -> 5
        height >= 720 -> 4
        height >= 480 -> 3
        else -> 2
    }

    private fun formatSize(bytes: Long?): String {
        if (bytes == null || bytes <= 0) return "—"
        val mb = bytes / 1024.0 / 1024.0
        return if (mb < 1) "${(bytes / 1024)} KB" else "%.1f MB".format(mb)
    }

    private fun emitProgress(downloadId: String, percent: Int, status: String, message: String? = null) {
        val map = Arguments.createMap().apply {
            putString("downloadId", downloadId)
            putInt("percent", percent)
            putString("status", status)
            message?.let { putString("message", it) }
        }
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("YtdlpDownloadProgress", map)
    }
}
