import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius } from "../theme";
import type { MediaFormat } from "../services/YtdlpBridge";

function SignalBars({ count, active }: { count: number; active: boolean }) {
  return (
    <View style={styles.bars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { height: i * 3 + 3 },
            i <= count && { backgroundColor: active ? colors.accent : colors.textFaint },
          ]}
        />
      ))}
    </View>
  );
}

export default function QualityRow({
  item,
  selected,
  onSelect,
}: {
  item: MediaFormat;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={[styles.row, selected && styles.rowSelected]}
    >
      <SignalBars count={item.bars} active={selected} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{item.label}</Text>
        <Text style={styles.sub}>{item.sub}</Text>
      </View>
      <Text style={styles.size}>{item.size}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowSelected: {
    backgroundColor: "#1D1216",
    borderColor: "rgba(228,52,79,0.6)",
  },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 16 },
  bar: { width: 3, borderRadius: 2, backgroundColor: "#26262C" },
  label: { fontSize: 15, fontWeight: "700", color: colors.textMid },
  labelSelected: { color: colors.textHi },
  sub: { fontSize: 12, color: colors.textLo, fontFamily: "monospace", marginTop: 2 },
  size: { fontSize: 12, color: colors.textLo, fontFamily: "monospace", marginRight: 10 },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#3A3A42",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.accent },
  radioDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.accent },
});
