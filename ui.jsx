import React, { useState, useEffect } from "react";
import {
  Search, Clipboard, ChevronRight, X, Download, History, ArrowLeft,
  Folder, Music2, Video as VideoIcon, Home as HomeIcon, MoreHorizontal,
  Youtube, CheckCircle2, AlertCircle, Trash2, Info, FolderCog, Palette, ArrowUpLeft
} from "lucide-react";

const videoQualities = [
  { id: "1080p", label: "1080p", sub: "H.264 · MP4", size: "3.7 MB", bars: 5 },
  { id: "720p", label: "720p", sub: "H.264 · MP4", size: "2.1 MB", bars: 4 },
  { id: "480p", label: "480p", sub: "H.264 · MP4", size: "1.5 MB", bars: 3 },
  { id: "360p", label: "360p", sub: "H.264 · MP4", size: "0.9 MB", bars: 2 },
];

const audioQualities = [
  { id: "high", label: "High Audio", sub: "AAC · M4A", size: "2.1 MB", bars: 5 },
  { id: "low", label: "Low Audio", sub: "AAC · M4A", size: "0.8 MB", bars: 2 },
];

const platforms = [
  { name: "YouTube", color: "#E4344F" },
  { name: "YouTube Music", color: "#E4344F" },
  { name: "Soundcloud", color: "#FF7A45" },
];

const searchHistory = [
  "https://youtu.be/By7ctqcWxyM?si=P7VYTaIZh5wtUhyS",
  "https://youtu.be/l9k11QEl96o?si=Y3U1bBE398YYLrjD",
];

const initialDownloads = [
  { id: 1, title: "Sum 41 - Pieces", channel: "Sum41VEVO", type: "Video", quality: "1080p", status: "done", size: "3.7 MB" },
  { id: 2, title: "How to Create a Codespace in GitHub for a Repository", channel: "Just Kristers", type: "Audio", quality: "High", status: "progress", progress: 62 },
  { id: 3, title: "Lofi Study Beats Vol. 4", channel: "ChillHop Sounds", type: "Video", quality: "720p", status: "error" },
];

function SignalBars({ count, active }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-[3px] rounded-sm transition-colors ${
            i <= count ? (active ? "bg-[#E4344F]" : "bg-[#5A5A63]") : "bg-[#26262C]"
          }`}
          style={{ height: `${i * 3 + 3}px` }}
        />
      ))}
    </div>
  );
}

function QualityRow({ item, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-2 border transition-all text-left ${
        selected ? "bg-[#1D1216] border-[#E4344F]/60" : "bg-[#141418] border-[#232329] active:bg-[#1A1A1F]"
      }`}
    >
      <SignalBars count={item.bars} active={selected} />
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] font-semibold ${selected ? "text-[#F5F4F2]" : "text-[#D8D8DC]"}`}>{item.label}</div>
        <div className="text-[12px] text-[#8A8A93] font-mono mt-0.5">{item.sub}</div>
      </div>
      <div className="text-[12px] text-[#8A8A93] font-mono">{item.size}</div>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-[#E4344F]" : "border-[#3A3A42]"}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-[#E4344F]" />}
      </div>
    </button>
  );
}

function SkeletonSheet() {
  return (
    <div className="px-5 pt-2 pb-4 animate-pulse">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-14 h-14 rounded-xl bg-[#1D1D23] shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-2.5 w-20 bg-[#1D1D23] rounded-full" />
          <div className="h-3.5 w-full bg-[#1D1D23] rounded-full" />
          <div className="h-3.5 w-2/3 bg-[#1D1D23] rounded-full" />
        </div>
      </div>
      <div className="h-10 bg-[#141418] rounded-full mb-5" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-[#141418] rounded-2xl mb-2" />
      ))}
    </div>
  );
}

function DownloadSheet({ onClose, onStart }) {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("video");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const list = tab === "video" ? videoQualities : audioQualities;
  const active = list[selected];

  return (
    <div className="absolute inset-0 flex flex-col justify-end z-30">
      <div className="absolute inset-0 bg-black/60 animate-[fadeIn_0.2s_ease]" onClick={onClose} />
      <div className="relative bg-[#0F0F12] rounded-t-[28px] max-h-[88%] flex flex-col overflow-hidden border-t border-[#232329] animate-[slideUp_0.25s_ease]">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-[#3A3A42]" />
        </div>

        {loading ? (
          <SkeletonSheet />
        ) : (
          <>
            <div className="px-5 pt-2 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E4344F] to-[#7A1B2B] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] tracking-wider uppercase text-[#E4344F] font-semibold mb-1">Siap diunduh</p>
                  <h2 className="text-[16px] font-bold text-[#F5F4F2] leading-snug line-clamp-2">
                    How to Create a Codespace in GitHub for a Repository
                  </h2>
                  <p className="text-[13px] text-[#8A8A93] mt-0.5">Just Kristers</p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-4">
              <div className="flex bg-[#141418] rounded-full p-1 border border-[#232329]">
                <button
                  onClick={() => { setTab("video"); setSelected(0); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[13px] font-semibold transition-all ${tab === "video" ? "bg-[#E4344F] text-white" : "text-[#8A8A93]"}`}
                >
                  <VideoIcon size={14} /> Video
                </button>
                <button
                  onClick={() => { setTab("audio"); setSelected(0); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[13px] font-semibold transition-all ${tab === "audio" ? "bg-[#E4344F] text-white" : "text-[#8A8A93]"}`}
                >
                  <Music2 size={14} /> Audio
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              <p className="text-[11px] tracking-wider uppercase text-[#5A5A63] font-semibold mb-2">Pilih kualitas</p>
              {list.map((item, i) => (
                <QualityRow key={item.id} item={item} selected={selected === i} onSelect={() => setSelected(i)} />
              ))}

              <button className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-4 bg-[#141418] border border-[#232329]">
                <Folder size={16} className="text-[#8A8A93]" />
                <div className="flex-1 text-left">
                  <div className="text-[11px] text-[#5A5A63]">Simpan ke</div>
                  <div className="text-[13px] text-[#D8D8DC] font-mono">/Download/YTDL/{tab === "video" ? "Video" : "Audio"}</div>
                </div>
                <ChevronRight size={16} className="text-[#5A5A63]" />
              </button>
            </div>

            <div className="p-5 pt-3 border-t border-[#1A1A1F]">
              <button
                onClick={() => onStart(active, tab)}
                className="w-full flex items-center justify-center gap-2 bg-[#E4344F] rounded-2xl py-4 font-bold text-white text-[15px] active:scale-[0.98] transition-transform shadow-lg shadow-[#E4344F]/20"
              >
                <Download size={18} />
                Unduh · {active.size}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Toast({ text }) {
  return (
    <div className="absolute bottom-24 left-5 right-5 z-40 animate-[slideUp_0.25s_ease]">
      <div className="bg-[#1D1D23] border border-[#2A2A31] rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-xl">
        <CheckCircle2 size={16} className="text-[#4ADE9A] shrink-0" />
        <span className="text-[13px] text-[#F5F4F2] font-medium">{text}</span>
      </div>
    </div>
  );
}

function BottomNav({ screen, setScreen }) {
  const items = [
    { id: "home", label: "Beranda", icon: HomeIcon },
    { id: "downloads", label: "Unduhan", icon: Download },
    { id: "more", label: "Selengkapnya", icon: MoreHorizontal },
  ];
  return (
    <div className="border-t border-[#1A1A1F] bg-[#0A0A0C] px-4 pt-2 pb-4">
      <div className="flex items-center justify-around">
        {items.map((it) => {
          const Icon = it.icon;
          const activeItem = screen === it.id;
          return (
            <button key={it.id} onClick={() => setScreen(it.id)} className="flex flex-col items-center gap-1 px-4 py-1.5">
              <div className={`p-1.5 rounded-full transition-colors ${activeItem ? "bg-[#E4344F]/15" : ""}`}>
                <Icon size={19} className={activeItem ? "text-[#E4344F]" : "text-[#5A5A63]"} />
              </div>
              <span className={`text-[10px] font-medium ${activeItem ? "text-[#E4344F]" : "text-[#5A5A63]"}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HomeScreen({ onOpenSearch, onOpenSheet, downloads }) {
  const recent = downloads.slice(0, 2);
  return (
    <div className="flex flex-col h-full bg-[#0A0A0C] overflow-y-auto">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-bold tracking-tight">
          <span className="text-[#E4344F]">Y</span><span className="text-[#F5F4F2]">TDL</span>
        </h1>
      </div>

      <div className="px-5 pb-5">
        <button onClick={onOpenSearch} className="w-full flex items-center gap-3 bg-[#141418] border border-[#232329] rounded-2xl px-4 py-4">
          <Search size={18} className="text-[#5A5A63]" />
          <span className="text-[14px] text-[#5A5A63]">Tempel link YouTube di sini…</span>
        </button>
      </div>

      <div className="px-5 pb-3 flex items-center gap-2">
        <Clipboard size={14} className="text-[#E4344F]" />
        <p className="text-[12px] text-[#D8D8DC]">
          Link terdeteksi di clipboard — <span className="text-[#E4344F] font-semibold">tempel?</span>
        </p>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] tracking-wider uppercase text-[#5A5A63] font-semibold">Unduhan terakhir</p>
          <button className="text-[11px] text-[#E4344F] font-semibold">Lihat semua</button>
        </div>
        <div className="space-y-2.5">
          {recent.map((r) => (
            <div key={r.id} className="flex items-center gap-3 bg-[#141418] border border-[#232329] rounded-2xl p-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#26262C] to-[#141418] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#F5F4F2] truncate">{r.title}</p>
                <p className="text-[11px] text-[#8A8A93]">{r.channel} · {r.type}</p>
              </div>
              {r.status === "done" && <span className="text-[10px] font-semibold text-[#4ADE9A] bg-[#4ADE9A]/10 px-2 py-1 rounded-full">Selesai</span>}
              {r.status === "progress" && <span className="text-[10px] font-semibold text-[#E4344F] bg-[#E4344F]/10 px-2 py-1 rounded-full">{r.progress}%</span>}
              {r.status === "error" && <span className="text-[10px] font-semibold text-[#F5A623] bg-[#F5A623]/10 px-2 py-1 rounded-full">Gagal</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-6">
        <button onClick={onOpenSheet} className="w-full text-center text-[12px] text-[#5A5A63] underline underline-offset-2">
          lihat contoh menu unduh →
        </button>
      </div>
    </div>
  );
}

const clipboardLink = "https://youtu.be/dQw4w9WgXcQ?si=8bXk2LmZpQ7wYh1s";

function SearchScreen({ onBack, onPick }) {
  const [activePlatform, setActivePlatform] = useState("YouTube");
  const [value, setValue] = useState("");
  const inputRef = React.useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (v) => {
    if (!v?.trim()) return;
    onPick(v.trim());
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0C]">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={20} className="text-[#D8D8DC]" />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-[#141418] border border-[#E4344F]/40 rounded-2xl px-4 py-2.5">
          <Search size={16} className="text-[#5A5A63] shrink-0" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit(value)}
            placeholder="Tempel link YouTube di sini…"
            className="flex-1 bg-transparent outline-none text-[13px] text-[#F5F4F2] placeholder:text-[#5A5A63] min-w-0"
          />
          {value && (
            <button onClick={() => setValue("")} className="shrink-0">
              <X size={15} className="text-[#5A5A63]" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
        {platforms.map((p) => (
          <button
            key={p.name}
            onClick={() => setActivePlatform(p.name)}
            className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold border transition-colors ${
              activePlatform === p.name ? "text-white border-transparent" : "text-[#8A8A93] border-[#232329] bg-[#141418]"
            }`}
            style={activePlatform === p.name ? { backgroundColor: p.color } : {}}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="px-5 pt-2">
        <button onClick={() => { setValue(clipboardLink); submit(clipboardLink); }} className="w-full flex items-center gap-3 py-3 border-b border-[#1A1A1F]">
          <Clipboard size={16} className="text-[#E4344F] shrink-0" />
          <span className="text-[13px] text-[#D8D8DC] flex-1 text-left truncate">{clipboardLink}</span>
          <ChevronRight size={15} className="text-[#5A5A63] shrink-0" />
        </button>

        <p className="text-[11px] tracking-wider uppercase text-[#5A5A63] font-semibold mt-5 mb-2">Riwayat</p>
        {searchHistory.map((h, i) => (
          <button key={i} onClick={() => { setValue(h); submit(h); }} className="w-full flex items-center gap-3 py-3 border-b border-[#1A1A1F]">
            <History size={15} className="text-[#5A5A63] shrink-0" />
            <span className="text-[12px] text-[#8A8A93] flex-1 text-left truncate font-mono">{h}</span>
            <ArrowUpLeft size={14} className="text-[#3A3A42]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function DownloadsScreen({ downloads }) {
  const hasDownloads = downloads.length > 0;
  return (
    <div className="flex flex-col h-full bg-[#0A0A0C] overflow-y-auto">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[19px] font-bold text-[#F5F4F2]">Unduhan</h1>
      </div>

      {!hasDownloads ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#141418] border border-[#232329] flex items-center justify-center mb-4">
            <Download size={24} className="text-[#3A3A42]" />
          </div>
          <p className="text-[14px] font-semibold text-[#D8D8DC] mb-1">Belum ada unduhan</p>
          <p className="text-[12px] text-[#5A5A63]">Tempel link YouTube buat mulai unduh video atau audio.</p>
        </div>
      ) : (
        <div className="px-5 space-y-2.5">
          {downloads.map((d) => (
            <div key={d.id} className="flex items-center gap-3 bg-[#141418] border border-[#232329] rounded-2xl p-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#26262C] to-[#141418] shrink-0 flex items-center justify-center">
                {d.type === "Video" ? <VideoIcon size={16} className="text-[#5A5A63]" /> : <Music2 size={16} className="text-[#5A5A63]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#F5F4F2] truncate">{d.title}</p>
                <p className="text-[11px] text-[#8A8A93] mb-1.5">{d.channel} · {d.quality}</p>
                {d.status === "progress" && (
                  <div className="h-1 bg-[#232329] rounded-full overflow-hidden">
                    <div className="h-full bg-[#E4344F] rounded-full transition-all" style={{ width: `${d.progress}%` }} />
                  </div>
                )}
              </div>
              {d.status === "done" && <CheckCircle2 size={18} className="text-[#4ADE9A] shrink-0" />}
              {d.status === "progress" && <span className="text-[11px] font-mono text-[#E4344F] shrink-0">{d.progress}%</span>}
              {d.status === "error" && <AlertCircle size={18} className="text-[#F5A623] shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MoreScreen() {
  const items = [
    { icon: FolderCog, label: "Lokasi penyimpanan", sub: "/Download/YTDL" },
    { icon: Palette, label: "Tampilan", sub: "Gelap" },
    { icon: Trash2, label: "Hapus riwayat", sub: "Kosongkan semua riwayat pencarian" },
    { icon: Info, label: "Tentang aplikasi", sub: "Versi 1.0.0" },
  ];
  return (
    <div className="flex flex-col h-full bg-[#0A0A0C] overflow-y-auto">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[19px] font-bold text-[#F5F4F2]">Selengkapnya</h1>
      </div>
      <div className="px-5 space-y-2">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <button key={i} className="w-full flex items-center gap-3 bg-[#141418] border border-[#232329] rounded-2xl p-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#1D1D23] flex items-center justify-center shrink-0">
                <Icon size={16} className="text-[#E4344F]" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-semibold text-[#D8D8DC]">{it.label}</p>
                <p className="text-[11px] text-[#5A5A63] truncate">{it.sub}</p>
              </div>
              <ChevronRight size={15} className="text-[#3A3A42] shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [downloads, setDownloads] = useState(initialDownloads);

  const startDownload = (quality, type) => {
    setSheetOpen(false);
    setScreen("home");
    setToast(`Unduhan dimulai · ${quality.label}`);
    const newItem = {
      id: Date.now(),
      title: "How to Create a Codespace in GitHub for a Repository",
      channel: "Just Kristers",
      type: type === "video" ? "Video" : "Audio",
      quality: quality.label,
      status: "progress",
      progress: 0,
    };
    setDownloads((d) => [newItem, ...d]);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center p-6">
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
      <div className="relative w-[380px] h-[760px] bg-[#0A0A0C] rounded-[36px] border-[6px] border-[#1A1A1F] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          {screen === "home" && (
            <HomeScreen
              onOpenSearch={() => setScreen("search")}
              onOpenSheet={() => setSheetOpen(true)}
              downloads={downloads}
            />
          )}
          {screen === "search" && (
            <SearchScreen onBack={() => setScreen("home")} onPick={(url) => { setScreen("home"); setSheetOpen(true); }} />
          )}
          {screen === "downloads" && <DownloadsScreen downloads={downloads} />}
          {screen === "more" && <MoreScreen />}

          {sheetOpen && <DownloadSheet onClose={() => setSheetOpen(false)} onStart={startDownload} />}
          {toast && <Toast text={toast} />}
        </div>
        {!sheetOpen && <BottomNav screen={screen} setScreen={setScreen} />}
      </div>
    </div>
  );
}