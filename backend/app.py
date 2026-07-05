"""
YTDL local backend — runs inside Termux on the same phone as the app.
No external server needed: the Cordova app calls http://127.0.0.1:5000.

Key idea: yt-dlp merges video+audio automatically when given a format
selector like "<video_id>+<audio_id>" — ffmpeg (installed via `pkg install
ffmpeg`) is invoked internally. No manual ffmpeg command needed.
"""

import os
import uuid
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)
CORS(app)  # Cordova webview origin differs from localhost, so allow all.

# In-memory job tracking. Fine for a single-user local server;
# swap for a JSON file (see save_history/load_history below) if you
# want history to survive a server restart.
DOWNLOADS: dict[str, dict] = {}

VIDEO_TIERS = [1080, 720, 480, 360]


def bars_for_height(h):
    if h >= 1080:
        return 5
    if h >= 720:
        return 4
    if h >= 480:
        return 3
    return 2


def human_size(bytes_):
    if not bytes_:
        return "—"
    mb = bytes_ / 1024 / 1024
    return f"{mb:.1f} MB" if mb >= 1 else f"{int(bytes_ / 1024)} KB"


def filter_formats(info):
    """Mirror of the filtering logic discussed earlier: one H.264/MP4
    entry per resolution tier for video, High/Low AAC/M4A for audio."""
    formats = info.get("formats", [])

    video_out = []
    for h in VIDEO_TIERS:
        candidates = [f for f in formats if f.get("height") == h and f.get("vcodec") != "none"]
        if not candidates:
            continue
        best = next((f for f in candidates if str(f.get("vcodec", "")).startswith("avc1")), candidates[0])
        video_out.append({
            "id": f"{h}p",
            "label": f"{h}p",
            "sub": "H.264 · MP4",
            "size": human_size(best.get("filesize") or best.get("filesize_approx")),
            "bars": bars_for_height(h),
            "formatId": best.get("format_id"),
        })

    audio_only = [f for f in formats if f.get("vcodec") == "none" and f.get("acodec") != "none"]
    m4a = [f for f in audio_only if f.get("ext") == "m4a"]
    pool = m4a if len(m4a) >= 2 else audio_only
    pool.sort(key=lambda f: f.get("abr") or 0, reverse=True)

    audio_out = []
    if pool:
        best = pool[0]
        audio_out.append({
            "id": "high", "label": "High Audio", "sub": "AAC · M4A",
            "size": human_size(best.get("filesize") or best.get("filesize_approx")),
            "bars": 5, "formatId": best.get("format_id"),
        })
        worst = pool[-1]
        audio_out.append({
            "id": "low", "label": "Low Audio", "sub": "AAC · M4A",
            "size": human_size(worst.get("filesize") or worst.get("filesize_approx")),
            "bars": 2, "formatId": worst.get("format_id"),
        })

    return video_out, audio_out


@app.route("/api/info")
def api_info():
    url = request.args.get("url", "").strip()
    if not url:
        return jsonify({"error": "Missing url"}), 400

    try:
        with yt_dlp.YoutubeDL({"quiet": True, "noplaylist": True}) as ydl:
            info = ydl.extract_info(url, download=False)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    video, audio = filter_formats(info)
    return jsonify({
        "title": info.get("title", "Unknown"),
        "channel": info.get("uploader", ""),
        "thumbnail": info.get("thumbnail", ""),
        "video": video,
        "audio": audio,
    })


def _run_download(download_id, url, format_selector, output_dir, is_video):
    os.makedirs(output_dir, exist_ok=True)

    def progress_hook(d):
        if d["status"] == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate")
            done = d.get("downloaded_bytes", 0)
            percent = int(done / total * 100) if total else 0
            DOWNLOADS[download_id].update(status="downloading", percent=percent)
        elif d["status"] == "finished":
            DOWNLOADS[download_id].update(percent=100)

    def pp_hook(d):
        if d.get("postprocessor") == "Merger":
            DOWNLOADS[download_id]["status"] = "merging" if d["status"] == "started" else "downloading"

    ydl_opts = {
        "format": format_selector,
        "outtmpl": os.path.join(output_dir, "%(title)s.%(ext)s"),
        "noplaylist": True,
        "progress_hooks": [progress_hook],
        "postprocessor_hooks": [pp_hook],
        "quiet": True,
    }
    if is_video:
        ydl_opts["merge_output_format"] = "mp4"

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        DOWNLOADS[download_id].update(status="done", percent=100)
    except Exception as e:
        DOWNLOADS[download_id].update(status="error", message=str(e))


@app.route("/api/download", methods=["POST"])
def api_download():
    body = request.get_json(force=True)
    url = body.get("url")
    format_id = body.get("formatId")  # e.g. "1080p", "720p", "high", "low"
    kind = body.get("kind")           # "video" | "audio"
    output_dir = body.get("outputDir")

    if not all([url, format_id, kind, output_dir]):
        return jsonify({"error": "Missing url/formatId/kind/outputDir"}), 400

    if kind == "video":
        height = format_id.rstrip("p")
        format_selector = f"bestvideo[height<={height}][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<={height}]"
    else:
        format_selector = (
            "bestaudio[ext=m4a][abr<=80]/bestaudio[ext=m4a]"
            if format_id == "low"
            else "bestaudio[ext=m4a]/bestaudio"
        )

    download_id = str(uuid.uuid4())
    DOWNLOADS[download_id] = {"status": "queued", "percent": 0}

    thread = threading.Thread(
        target=_run_download,
        args=(download_id, url, format_selector, output_dir, kind == "video"),
        daemon=True,
    )
    thread.start()

    return jsonify({"downloadId": download_id})


@app.route("/api/progress/<download_id>")
def api_progress(download_id):
    job = DOWNLOADS.get(download_id)
    if not job:
        return jsonify({"error": "Unknown downloadId"}), 404
    return jsonify(job)


@app.route("/api/health")
def health():
    return jsonify({"ok": True})


if __name__ == "__main__":
    # 0.0.0.0 so it's reachable from the webview regardless of how Cordova
    # addresses localhost on a given Android version; still only reachable
    # on-device since nothing routes to it from outside.
    app.run(host="0.0.0.0", port=5000)
