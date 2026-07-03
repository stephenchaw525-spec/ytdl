import React, { useEffect, useState } from "react";
import {
  View, Text, Pressable, TextInput, StyleSheet, Modal,
  ActivityIndicator, ScrollView,
} from "react-native";
import { colors, radius } from "../theme";
import QualityRow from "./QualityRow";
import { fetchInfo, startDownload, type VideoInfo } from "../services/YtdlpBridge";

const DEFAULT_VIDEO_DIR = "/storage/emulated/0/Download/YTDL/Video";
const DEFAULT_AUDIO_DIR = "/storage/emulated/0/Download/YTDL/Audio";

export default function DownloadSheet({
  url,
  visible,
  onClose,
  onDownloadStarted,
}: {
  url: string | null;
  visible: boolean;
  onClose: () => void;
  onDownloadStarted: (label: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [tab, setTab] = useState<"video" | "audio">("video");
  const [selected, setSelected] = useState(0);
  const [videoPath, setVideoPath] = useState(DEFAULT_VIDEO_DIR);
  const [audioPath, setAudioPath] = useState(DEFAULT_AUDIO_DIR);

  useEffect(() => {
    if (!visible || !url) return;
    setLoading(true);
    setError(null);
    setSelected(0);
    fetchInfo(url)
      .then(setInfo)
      .catch((e) => setError(e?.message ?? "Gagal mengambil info video"))
      .finally(() => setLoading(false));
  }, [visible, url]);

  const list = info ? (tab === "video" ? info.video : info.audio) : [];
  const active = list[selected];

  const handleDownload = async () => {
    if (!url || !active) return;
    const outputDir = tab === "video" ? videoPath : audioPath;
    onDownloadStarted(active.label);
    onClose();
    await startDownload(url, active.formatId, tab, outputDir);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Mengambil info video…</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSub}>Cek link-nya, atau coba lagi.</Text>
          </View>
        ) : info ? (
          <>
            <View style={styles.header}>
              <View style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.eyebrow}>Siap diunduh</Text>
                <Text style={styles.title} numberOfLines={2}>{info.title}</Text>
                <Text style={styles.subtitle}>{info.channel}</Text>
              </View>
            </View>

            <View style={styles.pillSwitch}>
              <Pressable
                style={[styles.pillBtn, tab === "video" && styles.pillBtnActive]}
                onPress={() => { setTab("video"); setSelected(0); }}
              >
                <Text style={[styles.pillLabel, tab === "video" && styles.pillLabelActive]}>Video</Text>
              </Pressable>
              <Pressable
                style={[styles.pillBtn, tab === "audio" && styles.pillBtnActive]}
                onPress={() => { setTab("audio"); setSelected(0); }}
              >
                <Text style={[styles.pillLabel, tab === "audio" && styles.pillLabelActive]}>Audio</Text>
              </Pressable>
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }}>
              <Text style={styles.sectionTitle}>Pilih kualitas</Text>
              {list.map((item, i) => (
                <QualityRow key={item.id} item={item} selected={selected === i} onSelect={() => setSelected(i)} />
              ))}

              <View style={styles.folderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.folderLabel}>Simpan ke</Text>
                  <TextInput
                    style={styles.folderInput}
                    value={tab === "video" ? videoPath : audioPath}
                    onChangeText={tab === "video" ? setVideoPath : setAudioPath}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Pressable style={styles.downloadBtn} onPress={handleDownload} disabled={!active}>
                <Text style={styles.downloadBtnText}>
                  Unduh{active ? ` · ${active.size}` : ""}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "88%",
    backgroundColor: "#0F0F12", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    borderTopWidth: 1, borderColor: colors.border,
  },
  handleWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 999, backgroundColor: "#3A3A42" },
  loadingBox: { padding: 40, alignItems: "center", gap: 10 },
  loadingText: { color: colors.textLo, fontSize: 13 },
  errorText: { color: colors.warning, fontSize: 14, fontWeight: "700" },
  errorSub: { color: colors.textFaint, fontSize: 12 },
  header: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 16, alignItems: "flex-start" },
  thumb: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.accentDim },
  eyebrow: { fontSize: 11, letterSpacing: 1, color: colors.accent, fontWeight: "700", marginBottom: 4 },
  title: { fontSize: 16, fontWeight: "700", color: colors.textHi, lineHeight: 22 },
  subtitle: { fontSize: 13, color: colors.textLo, marginTop: 2 },
  pillSwitch: {
    flexDirection: "row", marginHorizontal: 20, marginBottom: 16, padding: 4,
    borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  pillBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  pillBtnActive: { backgroundColor: colors.accent },
  pillLabel: { fontSize: 13, fontWeight: "700", color: colors.textLo },
  pillLabelActive: { color: "#fff" },
  sectionTitle: { fontSize: 11, letterSpacing: 1, color: colors.textFaint, fontWeight: "700", marginBottom: 12 },
  folderRow: {
    flexDirection: "row", alignItems: "center", borderRadius: radius.md, padding: 14, marginBottom: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  folderLabel: { fontSize: 11, color: colors.textFaint },
  folderInput: { fontSize: 13, color: colors.textMid, fontFamily: "monospace", padding: 0, marginTop: 2 },
  footer: { padding: 20, paddingTop: 12, borderTopWidth: 1, borderColor: colors.borderSoft },
  downloadBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: "center" },
  downloadBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
