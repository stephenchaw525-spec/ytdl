import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { colors, radius } from "../theme";

export type DownloadItem = {
  id: string;
  title: string;
  channel: string;
  type: "Video" | "Audio";
  quality: string;
  status: "queued" | "downloading" | "merging" | "done" | "error";
  percent?: number;
};

export default function DownloadsScreen({ downloads }: { downloads: DownloadItem[] }) {
  if (downloads.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Unduhan</Text>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Belum ada unduhan</Text>
          <Text style={styles.emptySub}>Tempel link YouTube buat mulai unduh video atau audio.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Unduhan</Text>
      <FlatList
        data={downloads}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.channel} · {item.quality}</Text>
              {item.status === "downloading" && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${item.percent ?? 0}%` }]} />
                </View>
              )}
            </View>
            <Text
              style={[
                styles.badge,
                item.status === "done" && { color: colors.success },
                item.status === "error" && { color: colors.warning },
                (item.status === "downloading" || item.status === "merging") && { color: colors.accent },
              ]}
            >
              {item.status === "done" ? "Selesai" :
               item.status === "error" ? "Gagal" :
               item.status === "merging" ? "Menggabungkan" :
               `${item.percent ?? 0}%`}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 24 },
  headerTitle: { fontSize: 19, fontWeight: "700", color: colors.textHi, paddingHorizontal: 20, paddingBottom: 16 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: colors.textMid, marginBottom: 4 },
  emptySub: { fontSize: 12, color: colors.textFaint, textAlign: "center" },
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: "600", color: colors.textHi },
  cardSub: { fontSize: 11, color: colors.textLo, marginTop: 2, marginBottom: 6 },
  badge: { fontSize: 11, fontWeight: "700", marginLeft: 10 },
  progressTrack: { height: 4, backgroundColor: colors.border, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.accent, borderRadius: 999 },
});
