import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius } from "../theme";

const ITEMS = [
  { label: "Lokasi penyimpanan", sub: "/Download/YTDL" },
  { label: "Tampilan", sub: "Gelap" },
  { label: "Hapus riwayat", sub: "Kosongkan semua riwayat pencarian" },
  { label: "Tentang aplikasi", sub: "Versi 1.0.0" },
];

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Selengkapnya</Text>
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {ITEMS.map((it) => (
          <Pressable key={it.label} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{it.label}</Text>
              <Text style={styles.sub}>{it.sub}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 24 },
  headerTitle: { fontSize: 19, fontWeight: "700", color: colors.textHi, paddingHorizontal: 20, paddingBottom: 16 },
  row: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14,
  },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMid },
  sub: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
});
