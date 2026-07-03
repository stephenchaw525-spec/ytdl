import { NativeModules, NativeEventEmitter } from "react-native";

// Bridges to android/app/src/main/java/org/sushitrsh/ytdlrn/YtdlpModule.kt
const { YtdlpModule } = NativeModules;

export type MediaFormat = {
  id: string;          // internal id, e.g. "1080p" / "high"
  label: string;       // "1080p", "High Audio"
  sub: string;         // "H.264 · MP4" / "AAC · M4A"
  size: string;        // human readable, e.g. "3.7 MB"
  bars: number;        // 1-5, relative quality indicator for the UI
  formatId: string;    // raw yt-dlp format id needed to actually download
};

export type VideoInfo = {
  title: string;
  channel: string;
  thumbnail: string;
  video: MediaFormat[];
  audio: MediaFormat[];
};

export type DownloadProgress = {
  downloadId: string;
  percent: number;
  status: "queued" | "downloading" | "merging" | "done" | "error";
  message?: string;
};

/**
 * fetchInfo — calls yt-dlp (via youtubedl-android) on the Kotlin side to pull
 * metadata + all available formats for a URL, already filtered/deduped down
 * to one H.264/MP4 option per resolution and AAC/M4A high/low for audio.
 * See YtdlpModule.kt: pickBestVideoPerResolution() / pickAudioTiers().
 */
export async function fetchInfo(url: string): Promise<VideoInfo> {
  return YtdlpModule.fetchInfo(url);
}

/**
 * startDownload — kicks off a foreground-service download on the native
 * side. For formats above 360p this triggers a video+audio merge via
 * ffmpeg-kit after both streams land. Returns a downloadId used to track
 * progress via the event emitter below.
 */
export async function startDownload(
  url: string,
  formatId: string,
  kind: "video" | "audio",
  outputDir: string
): Promise<{ downloadId: string }> {
  return YtdlpModule.startDownload(url, formatId, kind, outputDir);
}

export async function cancelDownload(downloadId: string): Promise<void> {
  return YtdlpModule.cancelDownload(downloadId);
}

const emitter = new NativeEventEmitter(YtdlpModule);

/** Subscribe to progress events emitted from the foreground service. */
export function onDownloadProgress(cb: (p: DownloadProgress) => void) {
  const sub = emitter.addListener("YtdlpDownloadProgress", cb);
  return () => sub.remove();
}
