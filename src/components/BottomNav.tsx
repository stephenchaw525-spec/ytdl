import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme";

export type Screen = "home" | "downloads" | "more";

const ITEMS: { id: Screen; label: string }[] = [
  { id: "home", label: "Beranda" },
  { id: "downloads", label: "Unduhan" },
  { id: "more", label: "Selengkapnya" },
];

export default function BottomNav({
  screen,
  setScreen,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
}) {
  return (
    <View style={styles.bar}>
      {ITEMS.map((it) => {
        const active = screen === it.id;
        return (
          <Pressable key={it.id} style={styles.item} onPress={() => setScreen(it.id)}>
            <Text style={[styles.label, active && styles.labelActive]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row", justifyContent: "space-around",
    borderTopWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.bg,
    paddingTop: 8, paddingBottom: 16,
  },
  item: { paddingVertical: 6, paddingHorizontal: 16, alignItems: "center" },
  label: { fontSize: 10, fontWeight: "600", color: colors.textFaint },
  labelActive: { color: colors.accent },
});
