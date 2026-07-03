import React, { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard"; // add to package.json when wiring up
import { colors } from "../theme";

export default function HomeScreen({
  onSubmitUrl,
  onOpenDownloads,
}: {
  onSubmitUrl: (url: string) => void;
  onOpenDownloads: () => void;
}) {
  const [value, setValue] = useState("");
  const [clipboardLink, setClipboardLink] = useState<string | null>(null);

  useEffect(() => {
    Clipboard.getString().then((text) => {
      if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(text)) {
        setClipboardLink(text);
      }
    });
  }, []);

  const submit = (v: string) => {
    if (!v.trim()) return;
    onSubmitUrl(v.trim());
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />

      <View style={styles.logoWrap}>
        <Text style={styles.logo}>
          <Text style={{ color: colors.accent }}>Y</Text>TDL
        </Text>
      </View>

      <View style={{ flex: 1.4 }} />

      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.searchBar}>
          <TextInput
            value={value}
            onChangeText={setValue}
            onSubmitEditing={() => submit(value)}
            placeholder="Tempel link YouTube di sini…"
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
          />
        </View>

        {clipboardLink && (
          <Pressable style={styles.clipboardHint} onPress={() => { setValue(clipboardLink); submit(clipboardLink); }}>
            <Text style={styles.clipboardText}>
              Link terdeteksi di clipboard — <Text style={{ color: colors.accent, fontWeight: "700" }}>tempel?</Text>
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 }}>
        <Pressable style={styles.historyRow} onPress={onOpenDownloads}>
          <Text style={styles.historyText}>Lihat unduhan terakhir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  logoWrap: { alignItems: "center" },
  logo: { fontSize: 28, fontWeight: "800", color: colors.textHi, opacity: 0.9 },
  searchBar: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
  },
  searchInput: { fontSize: 14, color: colors.textHi, textAlign: "center" },
  clipboardHint: { marginTop: 14 },
  clipboardText: { fontSize: 12, color: colors.textMid, textAlign: "center" },
  historyRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14,
  },
  historyText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.textMid },
});
