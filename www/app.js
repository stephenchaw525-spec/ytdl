// Backend runs locally in Termux on the same phone. 127.0.0.1 works
// because the Cordova webview and the Flask server share the same device.
const API_BASE = "http://127.0.0.1:5000/api";

const DEFAULT_VIDEO_DIR = "/storage/emulated/0/Download/YTDL/Video";
const DEFAULT_AUDIO_DIR = "/storage/emulated/0/Download/YTDL/Audio";

const PLATFORMS = [
  { name: "YouTube", color: "#E4344F" },
  { name: "YouTube Music", color: "#E4344F" },
  { name: "Soundcloud", color: "#FF7A45" },
];

// ---------- Icon set (inline SVG, no CDN — must work fully offline) ----------

const ICONS = {
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  history: '<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowUpLeft: '<path d="M7 17V7h10"/><path d="M17 17 7 7"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  music: '<circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  moreHorizontal: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  folderCog: '<path d="M10.5 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4.24a2 2 0 0 1 1.42.59l1.75 1.75a2 2 0 0 0 1.42.59H20a2 2 0 0 1 2 2v.5"/><circle cx="18" cy="18" r="3"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
};

function iconSvg(name, size, color) {
  const path = ICONS[name] || "";
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

function hydrateIcons(root = document) {
  root.querySelectorAll(".icon-slot").forEach((el) => {
    if (el.dataset.hydrated) return;
    el.innerHTML = iconSvg(el.dataset.icon, el.dataset.size || 16, el.dataset.color || "#fff");
    el.dataset.hydrated = "1";
  });
}

// ---------- State ----------

let state = {
  screen: "home",
  currentInfo: null,
  currentUrl: null,
  tab: "video",
  selectedIndex: 0,
  activePlatform: "YouTube",
  searchHistory: [],
  downloads: [],
};

// ---------- Navigation ----------

function showScreen(name) {
  state.screen = name;
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(`screen-${name}`).classList.add("active");
  document.querySelectorAll(".nav-icon-wrap").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".nav-label").forEach((el) => el.classList.remove("active"));
  document.querySelector(`[data-icon-wrap="${name}"]`)?.classList.add("active");
  document.querySelector(`[data-label="${name}"]`)?.classList.add("active");
  document.getElementById("navbar").classList.toggle("hidden", name === "search");
}

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});
document.getElementById("btn-view-downloads").addEventListener("click", () => showScreen("downloads"));
document.getElementById("btn-open-search").addEventListener("click", () => {
  showScreen("search");
  renderChips();
  renderClipboardRow();
  renderHistory();
  document.getElementById("search-input").focus();
});
document.getElementById("btn-back-search").addEventListener("click", () => showScreen("home"));

// ---------- Clipboard detection ----------

async function detectClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(text)) return text.trim();
  } catch (_) { /* no permission yet — silently ignore */ }
  return null;
}

window.addEventListener("load", async () => {
  const link = await detectClipboard();
  if (link) {
    const hint = document.getElementById("clipboard-hint");
    hint.classList.remove("hidden");
    hint.querySelector("b").onclick = () => openSheet(link);
  }
});

// ---------- Search screen ----------

function renderChips() {
  const row = document.getElementById("chips-row");
  row.innerHTML = "";
  PLATFORMS.forEach((p) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (state.activePlatform === p.name ? " active" : "");
    chip.textContent = p.name;
    if (state.activePlatform === p.name) chip.style.backgroundColor = p.color;
    chip.addEventListener("click", () => {
      state.activePlatform = p.name;
      renderChips();
    });
    row.appendChild(chip);
  });
}

function renderClipboardRow() {
  const wrap = document.getElementById("clipboard-row-wrap");
  wrap.innerHTML = "";
  detectClipboard().then((link) => {
    if (!link) return;
    const btn = document.createElement("button");
    btn.className = "hist-row";
    btn.innerHTML = `
      <span class="icon-slot" data-icon="clipboard" data-size="16" data-color="#E4344F"></span>
      <span class="hist-text">${link}</span>
      <span class="icon-slot" data-icon="chevronRight" data-size="15" data-color="#5A5A63"></span>
    `;
    btn.addEventListener("click", () => submitUrl(link));
    wrap.appendChild(btn);
    hydrateIcons(wrap);
  });
}

function renderHistory() {
  const wrap = document.getElementById("history-wrap");
  wrap.innerHTML = "";
  if (state.searchHistory.length === 0) return;

  const title = document.createElement("div");
  title.className = "section-title";
  title.style.marginTop = "20px";
  title.textContent = "Riwayat";
  wrap.appendChild(title);

  state.searchHistory.forEach((h) => {
    const btn = document.createElement("button");
    btn.className = "hist-row";
    btn.innerHTML = `
      <span class="icon-slot" data-icon="history" data-size="15" data-color="#5A5A63"></span>
      <span class="hist-text">${h}</span>
      <span class="icon-slot" data-icon="arrowUpLeft" data-size="14" data-color="#3A3A42"></span>
    `;
    btn.addEventListener("click", () => submitUrl(h));
    wrap.appendChild(btn);
  });
  hydrateIcons(wrap);
}

const searchInput = document.getElementById("search-input");
const btnClearSearch = document.getElementById("btn-clear-search");
searchInput.addEventListener("input", () => {
  btnClearSearch.classList.toggle("hidden", !searchInput.value);
});
btnClearSearch.addEventListener("click", () => {
  searchInput.value = "";
  btnClearSearch.classList.add("hidden");
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && searchInput.value.trim()) submitUrl(searchInput.value.trim());
});

function submitUrl(url) {
  if (!state.searchHistory.includes(url)) {
    state.searchHistory.unshift(url);
    state.searchHistory = state.searchHistory.slice(0, 10);
  }
  showScreen("home");
  openSheet(url);
}

// ---------- Download sheet ----------

const overlay = document.getElementById("sheet-overlay");
const sheet = document.getElementById("sheet");
const sheetLoading = document.getElementById("sheet-loading");
const sheetError = document.getElementById("sheet-error");
const sheetContent = document.getElementById("sheet-content");

function openSheetUI() {
  overlay.classList.remove("hidden");
  sheet.classList.remove("hidden");
}
function closeSheet() {
  overlay.classList.add("hidden");
  sheet.classList.add("hidden");
}
overlay.addEventListener("click", closeSheet);

async function openSheet(url) {
  state.currentUrl = url;
  state.tab = "video";
  state.selectedIndex = 0;
  openSheetUI();
  sheetLoading.classList.remove("hidden");
  sheetError.classList.add("hidden");
  sheetContent.classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE}/info?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal mengambil info");

    state.currentInfo = data;
    document.getElementById("sheet-title").textContent = data.title;
    document.getElementById("sheet-channel").textContent = data.channel;
    document.getElementById("output-path").value = DEFAULT_VIDEO_DIR;

    renderQualityList();
    sheetLoading.classList.add("hidden");
    sheetContent.classList.remove("hidden");
  } catch (e) {
    sheetLoading.classList.add("hidden");
    document.getElementById("sheet-error-text").textContent = e.message;
    sheetError.classList.remove("hidden");
  }
}

document.getElementById("tab-video").addEventListener("click", () => switchTab("video"));
document.getElementById("tab-audio").addEventListener("click", () => switchTab("audio"));

function switchTab(tab) {
  state.tab = tab;
  state.selectedIndex = 0;
  const videoBtn = document.getElementById("tab-video");
  const audioBtn = document.getElementById("tab-audio");
  videoBtn.classList.toggle("active", tab === "video");
  audioBtn.classList.toggle("active", tab === "audio");
  const vIcon = videoBtn.querySelector(".icon-slot");
  const aIcon = audioBtn.querySelector(".icon-slot");
  vIcon.dataset.color = tab === "video" ? "#fff" : "#8A8A93";
  aIcon.dataset.color = tab === "audio" ? "#fff" : "#8A8A93";
  vIcon.dataset.hydrated = "";
  aIcon.dataset.hydrated = "";
  hydrateIcons();
  document.getElementById("output-path").value = tab === "video" ? DEFAULT_VIDEO_DIR : DEFAULT_AUDIO_DIR;
  renderQualityList();
}

function renderQualityList() {
  const list = state.currentInfo[state.tab] || [];
  const container = document.getElementById("quality-list");
  container.innerHTML = "";

  list.forEach((item, i) => {
    const row = document.createElement("button");
    row.className = "quality-row" + (i === state.selectedIndex ? " selected" : "");
    row.innerHTML = `
      <div class="bars">${barsHtml(item.bars, i === state.selectedIndex)}</div>
      <div style="flex:1;min-width:0;margin-left:12px">
        <div class="q-label${i === state.selectedIndex ? " selected" : ""}">${item.label}</div>
        <div class="q-sub">${item.sub}</div>
      </div>
      <div class="q-size">${item.size}</div>
      <div class="radio${i === state.selectedIndex ? " selected" : ""}">${i === state.selectedIndex ? '<div class="radio-dot"></div>' : ""}</div>
    `;
    row.addEventListener("click", () => {
      state.selectedIndex = i;
      renderQualityList();
    });
    container.appendChild(row);
  });

  updateDownloadButton();
}

function barsHtml(count, active) {
  return [1, 2, 3, 4, 5]
    .map((i) => {
      const filled = i <= count;
      const cls = filled ? (active ? "bar filled active" : "bar filled") : "bar";
      return `<div class="${cls}" style="height:${i * 3 + 3}px"></div>`;
    })
    .join("");
}

function updateDownloadButton() {
  const list = state.currentInfo[state.tab] || [];
  const active = list[state.selectedIndex];
  const btn = document.getElementById("btn-download");
  document.getElementById("btn-download-text").textContent = active ? `Unduh · ${active.size}` : "Unduh";
  btn.disabled = !active;
}

document.getElementById("btn-download").addEventListener("click", async () => {
  const list = state.currentInfo[state.tab] || [];
  const active = list[state.selectedIndex];
  if (!active || !state.currentUrl) return;

  const outputDir = document.getElementById("output-path").value;
  const info = state.currentInfo;

  closeSheet();
  showToast(`Unduhan dimulai · ${active.label}`);

  const localId = "local-" + Date.now();
  addDownloadCard({
    id: localId,
    title: info.title,
    channel: info.channel,
    type: state.tab === "video" ? "Video" : "Audio",
    quality: active.label,
    status: "queued",
    percent: 0,
  });
  showScreen("downloads");

  try {
    const res = await fetch(`${API_BASE}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: state.currentUrl, formatId: active.id, kind: state.tab, outputDir }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal memulai unduhan");
    pollProgress(localId, data.downloadId);
  } catch (e) {
    updateDownloadCard(localId, { status: "error" });
  }
});

function pollProgress(localId, serverId) {
  const timer = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE}/progress/${serverId}`);
      const data = await res.json();
      updateDownloadCard(localId, { status: data.status, percent: data.percent });
      if (data.status === "done" || data.status === "error") clearInterval(timer);
    } catch (_) {
      clearInterval(timer);
    }
  }, 1000);
}

// ---------- Downloads list ----------

function addDownloadCard(item) {
  state.downloads.unshift(item);
  renderDownloads();
}
function updateDownloadCard(id, patch) {
  const item = state.downloads.find((d) => d.id === id);
  if (item) Object.assign(item, patch);
  renderDownloads();
}

function renderDownloads() {
  const emptyEl = document.getElementById("downloads-empty");
  const listEl = document.getElementById("downloads-list");

  if (state.downloads.length === 0) {
    emptyEl.classList.remove("hidden");
    listEl.classList.add("hidden");
    return;
  }
  emptyEl.classList.add("hidden");
  listEl.classList.remove("hidden");
  listEl.innerHTML = "";

  state.downloads.forEach((d) => {
    const card = document.createElement("div");
    card.className = "card";
    const typeIcon = d.type === "Video" ? "video" : "music";
    let statusHtml;
    if (d.status === "done") {
      statusHtml = `<span class="icon-slot" data-icon="checkCircle" data-size="18" data-color="#4ADE9A"></span>`;
    } else if (d.status === "error") {
      statusHtml = `<span class="icon-slot" data-icon="alertCircle" data-size="18" data-color="#F5A623"></span>`;
    } else {
      statusHtml = `<span style="font-size:11px;font-family:monospace;color:#E4344F">${d.percent ?? 0}%</span>`;
    }

    card.innerHTML = `
      <div class="thumb"><span class="icon-slot" data-icon="${typeIcon}" data-size="16" data-color="#5A5A63"></span></div>
      <div style="flex:1;min-width:0">
        <div class="card-title">${d.title}</div>
        <div class="card-sub">${d.channel} · ${d.type} · ${d.quality}</div>
        ${d.status === "downloading" || d.status === "merging" || d.status === "queued"
          ? `<div class="progress-track"><div class="progress-fill" style="width:${d.percent ?? 0}%"></div></div>`
          : ""}
      </div>
      ${statusHtml}
    `;
    listEl.appendChild(card);
  });
  hydrateIcons(listEl);
}

// ---------- More screen ----------

const MORE_ITEMS = [
  { icon: "folderCog", label: "Lokasi penyimpanan", sub: "/Download/YTDL" },
  { icon: "palette", label: "Tampilan", sub: "Gelap" },
  { icon: "trash", label: "Hapus riwayat", sub: "Kosongkan semua riwayat pencarian" },
  { icon: "info", label: "Tentang aplikasi", sub: "Versi 1.0.0" },
];

function renderMore() {
  const list = document.getElementById("more-list");
  list.innerHTML = "";
  MORE_ITEMS.forEach((it) => {
    const row = document.createElement("button");
    row.className = "settings-row";
    row.innerHTML = `
      <div class="settings-icon"><span class="icon-slot" data-icon="${it.icon}" data-size="16" data-color="#E4344F"></span></div>
      <div style="flex:1;text-align:left;min-width:0">
        <div class="settings-label">${it.label}</div>
        <div class="settings-sub">${it.sub}</div>
      </div>
      <span class="icon-slot" data-icon="chevronRight" data-size="15" data-color="#3A3A42"></span>
    `;
    if (it.label === "Hapus riwayat") {
      row.addEventListener("click", () => {
        state.searchHistory = [];
        showToast("Riwayat dihapus");
      });
    }
    list.appendChild(row);
  });
  hydrateIcons(list);
}
document.querySelector('[data-screen="more"]').addEventListener("click", renderMore);

// ---------- Init ----------

hydrateIcons();
renderMore();
