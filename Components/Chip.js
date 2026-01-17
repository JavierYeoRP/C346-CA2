import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { THEME } from "../theme";

export default function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.active]}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: THEME.chip,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  active: {
    backgroundColor: THEME.primarySoft,
    borderColor: "#86EFAC",
  },
  text: { fontWeight: "900", color: THEME.subtext, fontSize: 12 },
  textActive: { color: "#166534" },
});
